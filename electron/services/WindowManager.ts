/**
 * WindowManager Service
 * 
 * Manages the break reminder window lifecycle:
 * - Creates and displays the break window
 * - Handles window positioning and sizing
 * - Manages focus restoration after breaks
 * - Automatically closes windows after break duration
 * 
 * Key Features:
 * 1. Focus Restoration: Remembers which app you were using and returns focus to it
 * 2. Smart Positioning: Centers the window on your primary display
 * 3. Auto-close: Automatically closes quick breaks, shows message for long breaks
 * 4. Development Support: Opens dev tools in development mode for debugging
 */

import { BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { WINDOW_CONFIG } from '../constants/config';
import { IPC_CHANNELS } from '../constants/messages';
import { isDevelopment, getAppUrl } from '../utils/environment';

// Convert callback-based exec to Promise-based for async/await usage
const execAsync = promisify(exec);

export class WindowManager {
  // The break window instance (null when not showing)
  private breakWindow: BrowserWindow | null = null;
  
  // Timer for automatic window closing (null when not set)
  private breakTimer: NodeJS.Timeout | null = null;
  
  // Stores the name of the app that was focused before the break started
  // This allows us to restore focus after the break ends
  private previousAppName: string | null = null;
  
  // Flag to control whether focus should be restored when closing
  // Only true when a break ends naturally, not when skipped or interrupted
  private shouldRestoreFocus: boolean = false;
  
  // Track when the WindowManager was created to avoid running AppleScript
  // too early during app startup (prevents WindowServer conflicts)
  private startupTime: number = Date.now();

  /**
   * DISABLED: Focus capture removed to prevent WindowServer conflicts
   */
  private async capturePreviousApp(): Promise<void> {
    // DISABLED: All AppleScript focus manipulation removed
    console.log('[WindowManager] Focus capture DISABLED - no AppleScript will run');
    this.previousAppName = null;
  }

  /**
   * DISABLED: Focus restoration removed to prevent WindowServer conflicts
   */
  private async restorePreviousAppFocus(): Promise<void> {
    // DISABLED: All AppleScript focus manipulation removed
    console.log('[WindowManager] Focus restoration DISABLED - no AppleScript will run');
    this.previousAppName = null;
  }

  async showBreakWindow(durationSeconds: number, type: 'quick' | 'long' = 'quick'): Promise<void> {
    try {
      console.log('[WindowManager] ===== SHOW BREAK WINDOW START =====');
      console.log('[WindowManager] Duration requested:', durationSeconds, 'seconds');
      console.log('[WindowManager] Break type:', type.toUpperCase());
      
      // If a break window already exists, close it first WITHOUT restoring focus
      // (we're interrupting the previous break, not ending it naturally)
      if (this.breakWindow && !this.breakWindow.isDestroyed()) {
        console.log('[WindowManager] Break window already exists, closing it first...');
        this.closeBreakWindow(false); // false = don't restore focus
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for cleanup
      }
      
      // Capture the currently focused app before showing the new break window
      // This must happen AFTER closing any existing window to capture the correct app
      await this.capturePreviousApp();
      
      // Enable focus restoration for this break (will trigger when break ends naturally)
      this.shouldRestoreFocus = true;
      console.log('[WindowManager] Focus restoration enabled for this break');
      
    } catch (error) {
      // Ignore console errors during cleanup
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
      this.closeBreakWindow(true); // true = restore focus (natural break end)
    }, closeDelay);

    console.log('[WindowManager] ===== SHOW BREAK WINDOW COMPLETE =====');
  }

  /**
   * Closes the break window
   * 
   * @param restoreFocus - If true AND this break ended naturally (not skipped),
   *                       will restore focus to the previous app. If false, will
   *                       NOT restore focus (e.g., when user manually skips).
   */
  closeBreakWindow(restoreFocus: boolean = false) {
    try {
      console.log('[WindowManager] closeBreakWindow called, restoreFocus:', restoreFocus);
      console.log('[WindowManager] shouldRestoreFocus flag:', this.shouldRestoreFocus);
      
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
        
        // Store whether we should restore focus (before the setTimeout)
        const shouldRestore = restoreFocus && this.shouldRestoreFocus;
        console.log('[WindowManager] Will restore focus after closing:', shouldRestore);
        
        setTimeout(async () => {
          try {
            if (this.breakWindow && !this.breakWindow.isDestroyed()) {
              console.log('[WindowManager] Closing break window');
              this.breakWindow.close();
            }
          } catch (err) {
            // Ignore close errors
          }
          this.breakWindow = null;
          
          // Only restore focus if both conditions are met:
          // 1. restoreFocus parameter is true (natural break end, not skipped)
          // 2. shouldRestoreFocus flag is true (break wasn't interrupted)
          if (shouldRestore) {
            console.log('[WindowManager] Restoring focus to previous app...');
            await this.restorePreviousAppFocus();
          } else {
            console.log('[WindowManager] Skipping focus restoration');
            // Clear the previous app name without restoring focus
            this.previousAppName = null;
          }
          
          // Always reset the flag after closing
          this.shouldRestoreFocus = false;
        }, 300); // Reduced delay
      } else {
        console.log('[WindowManager] Window already destroyed or null');
        this.breakWindow = null;
        this.previousAppName = null;
        this.shouldRestoreFocus = false;
      }
    } catch (error) {
      // Ignore any console/logging errors but clean up
      console.log('[WindowManager] Error in closeBreakWindow, cleaning up:', error);
      this.breakWindow = null;
      this.previousAppName = null;
      this.shouldRestoreFocus = false;
      if (this.breakTimer) {
        clearTimeout(this.breakTimer);
        this.breakTimer = null;
      }
    }
  }

  isBreakWindowOpen(): boolean {
    return this.breakWindow !== null && !this.breakWindow.isDestroyed();
  }

  /**
   * Cleanup method to be called when the app is quitting
   * Prevents any lingering focus restoration attempts
   */
  cleanup() {
    console.log('[WindowManager] Cleanup called - clearing all state');
    
    // Clear all timers
    if (this.breakTimer) {
      clearTimeout(this.breakTimer);
      this.breakTimer = null;
    }
    
    // Clear state without restoring focus (app is quitting)
    this.previousAppName = null;
    this.shouldRestoreFocus = false;
    
    // Close window if open
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
