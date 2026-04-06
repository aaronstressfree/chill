import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { WINDOW_CONFIG } from '../constants/config';
import { IPC_CHANNELS } from '../constants/messages';
import { isDevelopment, getAppUrl } from '../utils/environment';

export class WindowManager {
  private breakWindow: BrowserWindow | null = null;
  private breakTimer: NodeJS.Timeout | null = null;

  async showBreakWindow(durationSeconds: number, type: 'quick' | 'long' = 'quick'): Promise<void> {
    console.log('[WindowManager] ===== SHOW BREAK WINDOW START =====');
    console.log('[WindowManager] Duration requested:', durationSeconds, 'seconds');
    console.log('[WindowManager] Break type:', type.toUpperCase());

    if (this.breakWindow && !this.breakWindow.isDestroyed()) {
      console.log('[WindowManager] Break window already exists, closing it first...');
      this.closeBreakWindow();
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Get primary display dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    console.log('[WindowManager] Screen size:', screenWidth, 'x', screenHeight);

    // Create break window
    console.log('[WindowManager] Creating BrowserWindow...');
    this.breakWindow = new BrowserWindow({
      width: WINDOW_CONFIG.BREAK.width,
      height: WINDOW_CONFIG.BREAK.height,
      x: Math.floor((screenWidth - WINDOW_CONFIG.BREAK.width) / 2),
      y: Math.floor((screenHeight - WINDOW_CONFIG.BREAK.height) / 2),
      alwaysOnTop: true,
      skipTaskbar: false,
      frame: false,
      transparent: false,
      hasShadow: true,
      backgroundColor: '#e6f4ff',
      resizable: false,
      movable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
        devTools: true
      }
    });
    console.log('[WindowManager] BrowserWindow created');

    // Open dev tools in development
    if (isDevelopment()) {
      this.breakWindow.webContents.openDevTools({ mode: 'detach' });
    }

    // Load break window HTML
    const url = isDevelopment() ? getAppUrl('/break') : '';
    console.log('[WindowManager] Loading URL:', url);
    
    if (isDevelopment()) {
      await this.breakWindow.loadURL(url).catch(err => {
        console.error('[WindowManager] ERROR loading URL:', err);
        throw err;
      });
    } else {
      await this.breakWindow.loadFile(path.join(__dirname, '../../renderer/index.html'), {
        hash: '/break'
      });
    }
    
    console.log('[WindowManager] URL loaded successfully');

    // Wait a bit for React to mount
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('[WindowManager] Waited for React mount');

    // Send the break start event
    console.log('[WindowManager] Sending BREAK_START event with duration:', durationSeconds, 'type:', type);
    this.breakWindow.webContents.send(IPC_CHANNELS.BREAK_START, { 
      duration: durationSeconds,
      type: type 
    });
    console.log('[WindowManager] BREAK_START event sent');

    // Show the window (NO FOCUS CALLS to prevent focus stealing)
    this.breakWindow.show();
    this.breakWindow.setAlwaysOnTop(true, 'screen-saver');
    console.log('[WindowManager] Window shown (focus NOT forced)');

    // Handle window close
    this.breakWindow.on('closed', () => {
      console.log('[WindowManager] Break window closed event');
      if (this.breakTimer) {
        clearTimeout(this.breakTimer);
        this.breakTimer = null;
      }
      this.breakWindow = null;
    });

    // Auto-close after duration + buffer time
    // Quick breaks: close almost instantly (100ms buffer)
    // Long breaks: 2 second buffer to show the "Great job!" message
    const buffer = type === 'quick' ? 100 : 2000;
    const closeDelay = (durationSeconds * 1000) + buffer;
    console.log('[WindowManager] Setting timer to auto-close window in', closeDelay, 'ms (buffer:', buffer, 'ms for', type, 'break)');
    this.breakTimer = setTimeout(() => {
      console.log('[WindowManager] Auto-close timer expired for', type, 'break - natural end');
      this.closeBreakWindow();
    }, closeDelay);

    console.log('[WindowManager] ===== SHOW BREAK WINDOW COMPLETE =====');
  }

  closeBreakWindow() {
    try {
      console.log('[WindowManager] closeBreakWindow called');

      if (this.breakTimer) {
        console.log('[WindowManager] Clearing timer');
        clearTimeout(this.breakTimer);
        this.breakTimer = null;
      }

      if (this.breakWindow && !this.breakWindow.isDestroyed()) {
        try {
          console.log('[WindowManager] Sending BREAK_END event');
          this.breakWindow.webContents.send(IPC_CHANNELS.BREAK_END);
        } catch (err) {
          // Window might be closing, ignore
        }

        setTimeout(() => {
          try {
            if (this.breakWindow && !this.breakWindow.isDestroyed()) {
              console.log('[WindowManager] Closing break window');
              this.breakWindow.close();
            }
          } catch (err) {
            // Ignore close errors
          }
          this.breakWindow = null;
        }, 300);
      } else {
        console.log('[WindowManager] Window already destroyed or null');
        this.breakWindow = null;
      }
    } catch (error) {
      console.log('[WindowManager] Error in closeBreakWindow, cleaning up:', error);
      this.breakWindow = null;
      if (this.breakTimer) {
        clearTimeout(this.breakTimer);
        this.breakTimer = null;
      }
    }
  }

  isBreakWindowOpen(): boolean {
    return this.breakWindow !== null && !this.breakWindow.isDestroyed();
  }

  cleanup() {
    console.log('[WindowManager] Cleanup called - clearing all state');

    if (this.breakTimer) {
      clearTimeout(this.breakTimer);
      this.breakTimer = null;
    }

    if (this.breakWindow && !this.breakWindow.isDestroyed()) {
      try {
        this.breakWindow.close();
      } catch (err) {
        // Ignore errors during quit
      }
    }
    this.breakWindow = null;

    console.log('[WindowManager] Cleanup complete');
  }
}
