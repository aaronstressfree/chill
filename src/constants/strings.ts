export const strings = {
  app: {
    name: 'Chill',
    tagline: 'Mindful breaks that respect your schedule'
  },
  
  break: {
    title: 'Time for a break',
    subtitle: 'Look away from your screen and stretch',
    skipButton: '⏭ Skip Break',
    countdownLabel: 'seconds remaining',
    endMessage: 'Great job! See you in a bit.'
  },
  
  settings: {
    title: 'Preferences',
    general: {
      title: 'General',
      breakInterval: 'Break interval',
      breakIntervalDescription: 'How often to take breaks (in minutes)',
      breakDuration: 'Break duration',
      breakDurationDescription: 'How long each break lasts (in seconds)',
      startAtLogin: 'Start Chill when you log in',
      pauseBreaks: 'Pause all breaks'
    },
    calendar: {
      title: 'Google Calendar',
      description: 'Connect your Google Calendar to avoid breaks during meetings',
      connectButton: 'Connect Google Calendar',
      disconnectButton: 'Disconnect',
      connected: 'Connected',
      notConnected: 'Not connected',
      authInstructions: 'A browser window will open to authenticate with Google.'
    },
    about: {
      title: 'About',
      version: 'Version',
      developer: 'Developed with ❤️ for healthier work habits',
      github: 'View on GitHub',
      license: 'MIT License'
    }
  },
  
  notifications: {
    breakComing: 'Break in 1 minute',
    breakComingDescription: 'Time to wrap up what you\'re doing',
    settingsSaved: 'Settings saved successfully',
    calendarConnected: 'Google Calendar connected successfully',
    calendarDisconnected: 'Google Calendar disconnected',
    error: 'Something went wrong. Please try again.'
  },
  
  buttons: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    minimize: 'Minimize',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    start: 'Start',
    stop: 'Stop',
    pause: 'Pause',
    resume: 'Resume'
  },
  
  errors: {
    calendarAuthFailed: 'Failed to connect to Google Calendar. Please try again.',
    settingsSaveFailed: 'Failed to save settings. Please try again.',
    generalError: 'An unexpected error occurred.'
  }
};
