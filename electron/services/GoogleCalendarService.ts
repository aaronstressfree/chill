import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import Store from 'electron-store';
import { shell } from 'electron';
import * as http from 'http';

const GOOGLE_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  REDIRECT_URI: 'http://localhost:8085/oauth/callback',
  SCOPES: ['https://www.googleapis.com/auth/calendar.readonly']
};

type CalendarEvent = calendar_v3.Schema$Event;

function isSoloEvent(event: CalendarEvent): boolean {
  const attendees = event.attendees || [];
  if (attendees.length === 0) return true;
  if (attendees.length === 1 && attendees[0].self) return true;
  if (attendees.every((a) => a.self)) return true;
  return false;
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private store: Store;
  private calendar: calendar_v3.Calendar;
  private authServer: http.Server | null = null;

  constructor(store: Store) {
    this.store = store;
    
    this.oauth2Client = new OAuth2Client(
      GOOGLE_CONFIG.CLIENT_ID,
      GOOGLE_CONFIG.CLIENT_SECRET,
      GOOGLE_CONFIG.REDIRECT_URI
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    // Restore tokens if they exist
    this.restoreTokens();
  }

  private restoreTokens() {
    const tokens = this.store.get('googleTokens') as Credentials | undefined;
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }
  }

  async startAuthFlow(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let authCompleted = false;

      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_CONFIG.SCOPES,
        prompt: 'consent'
      });

      this.authServer = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
        if (req.url?.startsWith('/oauth/callback')) {
          const url = new URL(req.url, `http://localhost:8085`);
          const code = url.searchParams.get('code');

          if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                             display: flex; align-items: center; justify-content: center;
                             height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                  <div style="text-align: center; color: white;">
                    <h1 style="font-size: 3em; margin-bottom: 0.5em;">✅</h1>
                    <h2>Successfully connected!</h2>
                    <p>You can close this tab and return to Chill.</p>
                  </div>
                </body>
              </html>
            `);

            try {
              await this.handleAuthCallback(code);
              authCompleted = true;
              resolve(true);
            } catch (error) {
              authCompleted = true;
              reject(error);
            } finally {
              setTimeout(() => {
                this.authServer?.close();
              }, 2000);
            }
          } else {
            res.writeHead(400);
            res.end('No authorization code received');
            authCompleted = true;
            reject(new Error('No authorization code received'));
          }
        }
      });

      this.authServer.listen(8085, () => {
        console.log('Auth server listening on port 8085');
        // Open in system browser instead of Electron window.
        // This lets SSO providers (Okta, etc.) use device trust / FastPass.
        shell.openExternal(authUrl);
      });

      // Timeout so it doesn't hang forever if user abandons the flow
      setTimeout(() => {
        if (!authCompleted) {
          this.authServer?.close();
          reject(new Error('Authentication timed out'));
        }
      }, 120000);
    });
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      this.store.set('googleTokens', tokens);
      this.store.set('googleCalendarEnabled', true);
    } catch (error) {
      console.error('Failed to exchange auth code:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  async disconnect(): Promise<void> {
    try {
      const tokens = this.store.get('googleTokens') as Credentials | undefined;
      if (tokens && tokens.access_token) {
        // Revoke the token
        await this.oauth2Client.revokeToken(tokens.access_token).catch(() => {});
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    }
    this.store.delete('googleTokens');
    this.store.set('googleCalendarEnabled', false);
  }

  async getCurrentEvents(): Promise<CalendarEvent[]> {
    try {
      const tokens = this.store.get('googleTokens') as Credentials | undefined;
      if (!tokens) {
        return [];
      }

      // Refresh token if needed
      if (tokens.refresh_token) {
        this.oauth2Client.setCredentials(tokens);
        const newTokens = await this.oauth2Client.refreshAccessToken();
        this.store.set('googleTokens', newTokens.credentials);
      }

      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: fiveMinutesFromNow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        q: '', // Can filter for specific meeting types
      });

      const events = response.data.items || [];
      
      // Filter for events that are currently happening
      // BUT exclude:
      // - All-day events (they don't have specific time blocks)
      // - Events with "focus" in the title (those are focus time blocks where breaks are good!)
      return events.filter((event: CalendarEvent) => {
        if (!event.start || !event.end) return false;
        
        // Skip all-day events (they only have 'date', not 'dateTime')
        if (!event.start.dateTime || !event.end.dateTime) {
          console.log(`Skipping "${event.summary}" - it's an all-day event`);
          return false;
        }
        
        // Skip solo events (no other attendees) — these are personal blocks
        // like lunch, focus time, etc. where breaks should still fire
        if (isSoloEvent(event)) {
          console.log(`Skipping "${event.summary}" - solo event, breaks are allowed!`);
          return false;
        }
        
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        
        return now >= startTime && now <= endTime;
      });
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

  async getUpcomingEvents(hours: number = 24): Promise<{ summary: string; start: string; end: string; skipped: boolean; skipReason: string }[]> {
    try {
      const tokens = this.store.get('googleTokens') as Credentials | undefined;
      if (!tokens) {
        return [];
      }

      // Refresh token if needed
      if (tokens.refresh_token) {
        this.oauth2Client.setCredentials(tokens);
        try {
          const newTokens = await this.oauth2Client.refreshAccessToken();
          this.store.set('googleTokens', newTokens.credentials);
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }

      const now = new Date();
      const later = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: later.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });

      const events = response.data.items || [];
      
      return events.map((event: CalendarEvent) => {
        const isAllDay = !event.start?.dateTime || !event.end?.dateTime;
        const isSolo = isSoloEvent(event);
        const skipped = isAllDay || isSolo;

        let skipReason = '';
        if (isAllDay) {
          skipReason = 'All-day event';
        } else if (isSolo) {
          skipReason = 'Solo event - breaks allowed';
        }
        
        return {
          summary: event.summary || 'Untitled Event',
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          skipped,
          skipReason,
        };
      });
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  }

  isAuthenticated(): boolean {
    const tokens = this.store.get('googleTokens') as Credentials | undefined;
    return !!tokens && !!tokens.access_token;
  }
}
