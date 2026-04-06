import Store from 'electron-store';
import { GoogleCalendarService } from './GoogleCalendarService';
import { WindowManager } from './WindowManager';
import { TIMING_CONFIG } from '../constants/config';

interface BreakSettings {
  quickBreakInterval: number;  // minutes
  quickBreakDuration: number;  // seconds
  longBreakInterval: number;   // minutes
  longBreakDuration: number;   // seconds
}

type BreakType = 'quick' | 'long';

export class BreakScheduler {
  private windowManager: WindowManager;
  private calendarService: GoogleCalendarService;
  private store: Store;
  private quickBreakTimer: NodeJS.Timeout | null = null;
  private longBreakTimer: NodeJS.Timeout | null = null;
  private calendarCheckTimer: NodeJS.Timeout | null = null;
  private isPaused: boolean = false;
  private settings: BreakSettings;
  private lastQuickBreakTime: Date | null = null;
  private lastLongBreakTime: Date | null = null;
  private nextQuickBreakTime: Date | null = null;
  private nextLongBreakTime: Date | null = null;

  constructor(
    windowManager: WindowManager,
    calendarService: GoogleCalendarService,
    store: Store
  ) {
    this.windowManager = windowManager;
    this.calendarService = calendarService;
    this.store = store;
    
    this.settings = {
      quickBreakInterval: store.get('quickBreakInterval', 10) as number,  // 10 min
      quickBreakDuration: store.get('quickBreakDuration', 20) as number,   // 20 sec
      longBreakInterval: store.get('longBreakInterval', 30) as number,    // 30 min
      longBreakDuration: store.get('longBreakDuration', 300) as number    // 5 min (300 sec)
    };
    
    this.isPaused = store.get('isPaused', false) as boolean;
    
    console.log('[BreakScheduler] Initialized with settings:', {
      quickBreakInterval: this.settings.quickBreakInterval,
      quickBreakDuration: this.settings.quickBreakDuration,
      longBreakInterval: this.settings.longBreakInterval,
      longBreakDuration: this.settings.longBreakDuration,
      isPaused: this.isPaused
    });
  }

  start() {
    console.log('[BreakScheduler] Starting scheduler, isPaused:', this.isPaused);
    if (!this.isPaused) {
      this.scheduleQuickBreak();
      this.scheduleLongBreak();
      this.startCalendarChecking();
    } else {
      console.log('[BreakScheduler] Not starting - breaks are paused');
    }
  }

  stop() {
    console.log('[BreakScheduler] Stopping scheduler');
    if (this.quickBreakTimer) {
      clearTimeout(this.quickBreakTimer);
      this.quickBreakTimer = null;
    }
    if (this.longBreakTimer) {
      clearTimeout(this.longBreakTimer);
      this.longBreakTimer = null;
    }
    if (this.calendarCheckTimer) {
      clearInterval(this.calendarCheckTimer);
      this.calendarCheckTimer = null;
    }
    this.nextQuickBreakTime = null;
    this.nextLongBreakTime = null;
  }

  setPaused(paused: boolean) {
    console.log('[BreakScheduler] setPaused called:', paused);
    this.isPaused = paused;
    
    if (paused) {
      console.log('[BreakScheduler] Pausing - stopping timers');
      this.stop();
    } else {
      console.log('[BreakScheduler] Resuming - starting timers');
      this.start();
    }
  }

  updateSettings(settings: Partial<BreakSettings>) {
    console.log('[BreakScheduler] updateSettings called with:', settings);
    console.log('[BreakScheduler] Current settings before update:', this.settings);
    
    this.settings = { ...this.settings, ...settings };
    
    console.log('[BreakScheduler] Settings after update:', this.settings);
    console.log('[BreakScheduler] Restarting scheduler with new settings');
    
    // Restart scheduling with new settings
    this.stop();
    if (!this.isPaused) {
      this.start();
    } else {
      console.log('[BreakScheduler] Not restarting - breaks are paused');
    }
  }

  /**
   * Called when the "pauseDuringMeetings" setting changes.
   * Forces a re-evaluation of the break schedule based on current meeting status.
   */
  async updatePauseDuringMeetingsSetting() {
    console.log('[BreakScheduler] pauseDuringMeetings setting changed, re-evaluating schedule');
    
    // If paused, don't do anything
    if (this.isPaused) {
      console.log('[BreakScheduler] Breaks are paused, no action needed');
      return;
    }
    
    // Restart the scheduler to re-evaluate based on the new setting
    this.stop();
    this.start();
    
    console.log('[BreakScheduler] Schedule re-evaluated with new pauseDuringMeetings setting');
  }

  getNextBreakTime(): string | null {
    if (this.isPaused || (!this.nextQuickBreakTime && !this.nextLongBreakTime)) {
      return null;
    }
    
    // Find the soonest break
    let nextBreak = this.nextQuickBreakTime;
    if (this.nextLongBreakTime && (!nextBreak || this.nextLongBreakTime < nextBreak)) {
      nextBreak = this.nextLongBreakTime;
    }
    
    if (!nextBreak) return null;
    
    const now = new Date();
    const diff = nextBreak.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Starting soon...';
    }
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  getNextBreakType(): 'quick' | 'long' | null {
    if (this.isPaused || (!this.nextQuickBreakTime && !this.nextLongBreakTime)) {
      return null;
    }
    
    // Find the soonest break type
    if (!this.nextQuickBreakTime && this.nextLongBreakTime) {
      return 'long';
    }
    if (!this.nextLongBreakTime && this.nextQuickBreakTime) {
      return 'quick';
    }
    
    // Both exist, compare
    if (this.nextQuickBreakTime && this.nextLongBreakTime) {
      return this.nextQuickBreakTime < this.nextLongBreakTime ? 'quick' : 'long';
    }
    
    return null;
  }

  private scheduleQuickBreak() {
    const intervalMs = this.settings.quickBreakInterval * 60 * 1000;
    
    this.nextQuickBreakTime = new Date(Date.now() + intervalMs);
    
    console.log('[BreakScheduler] Next QUICK break scheduled for:', this.nextQuickBreakTime.toLocaleTimeString(), 
                `(in ${this.settings.quickBreakInterval} minutes)`);
    
    this.quickBreakTimer = setTimeout(() => {
      this.checkAndTriggerBreak('quick');
    }, intervalMs);
  }

  private scheduleLongBreak() {
    const intervalMs = this.settings.longBreakInterval * 60 * 1000;
    
    this.nextLongBreakTime = new Date(Date.now() + intervalMs);
    
    console.log('[BreakScheduler] Next LONG break scheduled for:', this.nextLongBreakTime.toLocaleTimeString(), 
                `(in ${this.settings.longBreakInterval} minutes)`);
    
    this.longBreakTimer = setTimeout(() => {
      this.checkAndTriggerBreak('long');
    }, intervalMs);
  }

  private async checkAndTriggerBreak(type: BreakType) {
    console.log(`[BreakScheduler] checkAndTriggerBreak called for ${type.toUpperCase()} break`);
    
    // Don't trigger if paused
    if (this.isPaused) {
      console.log('[BreakScheduler] Breaks are paused, skipping...');
      return;
    }
    
    // Check if a break is already in progress
    if (this.windowManager.isBreakWindowOpen()) {
      console.log(`[BreakScheduler] Break window already open, skipping ${type} break`);
      // Reschedule this break for later
      if (type === 'quick') {
        this.scheduleQuickBreak();
      } else {
        this.scheduleLongBreak();
      }
      return;
    }
    
    // Check if both breaks would fire around the same time (within 30 seconds)
    // If so, long break takes precedence
    if (type === 'quick' && this.nextLongBreakTime) {
      const now = Date.now();
      const timeDiff = Math.abs(this.nextLongBreakTime.getTime() - now);
      
      if (timeDiff <= 30000) { // Within 30 seconds
        console.log('[BreakScheduler] Long break imminent, skipping quick break and rescheduling');
        // Skip this quick break and reschedule for after the long break would complete
        const longBreakDuration = this.settings.longBreakDuration * 1000;
        const rescheduleDelay = timeDiff + longBreakDuration + 5000; // Add 5s buffer
        
        this.quickBreakTimer = setTimeout(() => {
          this.checkAndTriggerBreak('quick');
        }, rescheduleDelay);
        
        this.nextQuickBreakTime = new Date(now + rescheduleDelay);
        console.log('[BreakScheduler] Quick break rescheduled for:', this.nextQuickBreakTime.toLocaleTimeString());
        return;
      }
    }
    
    // Check if we should pause during meetings (only if user has this setting enabled)
    const pauseDuringMeetings = this.store.get('pauseDuringMeetings', true) as boolean;
    
    if (pauseDuringMeetings) {
      console.log('[BreakScheduler] Checking if in meeting...');
      const isInMeeting = await this.checkIfInMeeting();
      
      if (isInMeeting) {
        console.log(`[BreakScheduler] In meeting, postponing ${type} break for 1 minute`);
        // Check again in 1 minute
        const timer = setTimeout(() => {
          this.checkAndTriggerBreak(type);
        }, 60000);
        
        // Update the next break time
        if (type === 'quick') {
          this.quickBreakTimer = timer;
          this.nextQuickBreakTime = new Date(Date.now() + 60000);
        } else {
          this.longBreakTimer = timer;
          this.nextLongBreakTime = new Date(Date.now() + 60000);
        }
        return;
      }
    }
    
    console.log(`[BreakScheduler] Triggering ${type} break`);
    await this.triggerBreak(type);
  }

  private async triggerBreak(type: BreakType) {
    console.log(`[BreakScheduler] triggerBreak called for ${type.toUpperCase()} break`);
    console.log('[BreakScheduler] Current settings:', this.settings);
    
    // Double-check if paused before showing break window
    if (this.isPaused) {
      console.log('[BreakScheduler] Breaks are paused, not triggering break...');
      return;
    }
    
    if (type === 'quick') {
      this.lastQuickBreakTime = new Date();
    } else {
      this.lastLongBreakTime = new Date();
    }
    
    const duration = type === 'quick' 
      ? this.settings.quickBreakDuration 
      : this.settings.longBreakDuration;
    
    console.log(`[BreakScheduler] Showing ${type} break window with duration:`, duration, 'seconds');
    
    // Show break window with type
    await this.windowManager.showBreakWindow(duration, type);
    
    console.log('[BreakScheduler] Break window shown');
    
    // Schedule next break of this type (only if not paused)
    if (!this.isPaused) {
      if (type === 'quick') {
        this.scheduleQuickBreak();
      } else {
        this.scheduleLongBreak();
      }
    } else {
      console.log('[BreakScheduler] Not scheduling next break - breaks are paused');
    }
  }

  private async checkIfInMeeting(): Promise<boolean> {
    const calendarEnabled = this.store.get('googleCalendarEnabled', false) as boolean;
    
    if (!calendarEnabled) {
      return false;
    }
    
    try {
      const events = await this.calendarService.getCurrentEvents();
      return events.length > 0;
    } catch (error) {
      console.error('[BreakScheduler] Failed to check calendar:', error);
      // If calendar check fails, assume not in meeting to avoid blocking breaks
      return false;
    }
  }

  async getCurrentBlockingEvent(): Promise<{ summary: string; end: string } | null> {
    const calendarEnabled = this.store.get('googleCalendarEnabled', false) as boolean;
    
    if (!calendarEnabled) {
      return null;
    }
    
    try {
      const events = await this.calendarService.getCurrentEvents();
      if (events.length > 0) {
        const event = events[0];
        console.log('[BreakScheduler] Blocking event found:', event.summary);
        return {
          summary: event.summary || 'Meeting',
          end: event.end?.dateTime || event.end?.date || ''
        };
      }
      return null;
    } catch (error) {
      console.error('[BreakScheduler] Failed to get current blocking event:', error);
      return null;
    }
  }

  private startCalendarChecking() {
    // Check calendar periodically to update UI
    this.calendarCheckTimer = setInterval(async () => {
      if (!this.isPaused) {
        await this.checkIfInMeeting();
      }
    }, TIMING_CONFIG.CALENDAR_CHECK_INTERVAL_MS);
  }
}
