export const MESSAGES = {
  TRAY: {
    pauseResume: 'Pause/Resume',
    pause: 'Pause Breaks',
    resume: 'Resume Breaks',
    preferences: 'Preferences...',
    nextBreak: 'Next Break',
    nextBreakPaused: 'Breaks Paused',
    quit: 'Quit Chill'
  },
  BREAK: {
    title: 'Time for a break!',
    subtitle: 'Look away from your screen',
    countdown: 'seconds remaining'
  },
  CALENDAR: {
    authSuccess: 'Successfully connected to Google Calendar',
    authError: 'Failed to connect to Google Calendar',
    disconnectSuccess: 'Disconnected from Google Calendar',
    disconnectError: 'Failed to disconnect from Google Calendar'
  }
};

export const IPC_CHANNELS = {
  // Preferences
  GET_PREFERENCES: 'get-preferences',
  UPDATE_PREFERENCES: 'update-preferences',
  GET_NEXT_BREAK_TIME: 'get-next-break-time',
  GET_BLOCKING_EVENT: 'get-blocking-event',
  
  // Google Calendar
  GOOGLE_AUTH_START: 'google-auth-start',
  GOOGLE_AUTH_CALLBACK: 'google-auth-callback',
  GOOGLE_AUTH_DISCONNECT: 'google-auth-disconnect',
  GET_CALENDAR_EVENTS: 'get-calendar-events',
  
  // Break events
  BREAK_START: 'break-start',
  BREAK_END: 'break-end',
  SKIP_BREAK: 'skip-break',
  PREVIEW_BREAK: 'preview-break',
  
  // Window controls
  CLOSE_WINDOW: 'close-window',
  MINIMIZE_WINDOW: 'minimize-window',
  
  // App controls
  QUIT_APP: 'quit-app'
};
