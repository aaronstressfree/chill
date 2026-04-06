export const WINDOW_CONFIG = {
  MAIN: {
    width: 480,
    height: 640,
    minWidth: 400,
    minHeight: 500
  },
  BREAK: {
    width: 700,
    height: 600,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    hasShadow: true,
    backgroundColor: '#00000000'
  }
};

export const TIMING_CONFIG = {
  DEFAULT_INTERVAL_MINUTES: 10,
  DEFAULT_DURATION_SECONDS: 5,
  CALENDAR_CHECK_INTERVAL_MS: 60000, // Check calendar every minute
  BREAK_WARNING_MS: 10000 // Warn 10 seconds before break
};

export const GOOGLE_CALENDAR_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  REDIRECT_URI: 'http://localhost:3000/auth/callback',
  SCOPES: ['https://www.googleapis.com/auth/calendar.readonly']
};
