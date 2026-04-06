import { contextBridge, ipcRenderer } from 'electron';

// Inline IPC channel constants to avoid import issues in preload
const IPC_CHANNELS = {
  GET_PREFERENCES: 'get-preferences',
  UPDATE_PREFERENCES: 'update-preferences',
  GET_NEXT_BREAK_TIME: 'get-next-break-time',
  GET_BLOCKING_EVENT: 'get-blocking-event',
  GOOGLE_AUTH_START: 'google-auth-start',
  GOOGLE_AUTH_CALLBACK: 'google-auth-callback',
  GOOGLE_AUTH_DISCONNECT: 'google-auth-disconnect',
  GET_CALENDAR_EVENTS: 'get-calendar-events',
  BREAK_START: 'break-start',
  BREAK_END: 'break-end',
  SKIP_BREAK: 'skip-break',
  PREVIEW_BREAK: 'preview-break',
  CLOSE_WINDOW: 'close-window',
  MINIMIZE_WINDOW: 'minimize-window',
  QUIT_APP: 'quit-app'
};

// Expose protected methods that allow the renderer process
// to communicate with the main process without exposing
// the entire Electron API
contextBridge.exposeInMainWorld('electronAPI', {
  getPreferences: () => ipcRenderer.invoke(IPC_CHANNELS.GET_PREFERENCES),
  updatePreferences: (preferences: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_PREFERENCES, preferences),
  getNextBreakTime: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NEXT_BREAK_TIME),
  getBlockingEvent: () => ipcRenderer.invoke(IPC_CHANNELS.GET_BLOCKING_EVENT),
  startGoogleAuth: () => ipcRenderer.invoke(IPC_CHANNELS.GOOGLE_AUTH_START),
  handleAuthCallback: (code: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.GOOGLE_AUTH_CALLBACK, code),
  disconnectGoogle: () => ipcRenderer.invoke(IPC_CHANNELS.GOOGLE_AUTH_DISCONNECT),
  getCalendarEvents: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CALENDAR_EVENTS),
  previewBreak: () => ipcRenderer.invoke(IPC_CHANNELS.PREVIEW_BREAK),
  skipBreak: () => ipcRenderer.invoke(IPC_CHANNELS.SKIP_BREAK),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW),
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW),
  quitApp: () => ipcRenderer.invoke(IPC_CHANNELS.QUIT_APP),
  onBreakStart: (callback: (event: Electron.IpcRendererEvent, data: { duration: number; type?: 'quick' | 'long' }) => void) => {
    ipcRenderer.on(IPC_CHANNELS.BREAK_START, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.BREAK_START, callback);
  },
  onBreakEnd: (callback: () => void) => {
    ipcRenderer.on(IPC_CHANNELS.BREAK_END, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.BREAK_END, callback);
  }
});
