export interface Preferences {
  // Legacy single break settings (deprecated)
  breakInterval?: number;
  breakDuration?: number;
  
  // New two-break-type settings
  quickBreakInterval: number;
  quickBreakDuration: number;
  longBreakInterval: number;
  longBreakDuration: number;
  
  isPaused: boolean;
  googleCalendarEnabled: boolean;
  pauseDuringMeetings: boolean;
  startAtLogin: boolean;
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
}

export interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  skipped: boolean;
  skipReason: string;
}

export interface BlockingEvent {
  summary: string;
  end: string;
}

export interface ElectronAPI {
  getPreferences: () => Promise<Preferences>;
  updatePreferences: (preferences: Partial<Preferences>) => Promise<{ success: boolean }>;
  getNextBreakTime: () => Promise<{ nextBreakTime: string | null; nextBreakType: 'quick' | 'long' | null }>;
  getBlockingEvent: () => Promise<{ blockingEvent: BlockingEvent | null }>;
  startGoogleAuth: () => Promise<{ success: boolean; error?: string }>;
  handleAuthCallback: (code: string) => Promise<{ success: boolean; error?: string }>;
  disconnectGoogle: () => Promise<{ success: boolean; error?: string }>;
  getCalendarEvents: () => Promise<{ success: boolean; events: CalendarEvent[]; error?: string }>;
  previewBreak: () => Promise<{ success: boolean; error?: string }>;
  skipBreak: () => Promise<{ success: boolean }>;
  closeWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  quitApp: () => Promise<void>;
  onBreakStart: (callback: (event: unknown, data: { duration: number; type?: 'quick' | 'long' }) => void) => () => void;
  onBreakEnd: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
