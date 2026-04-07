import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, powerMonitor } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { BreakScheduler, BreakSettings } from './services/BreakScheduler';
import { GoogleCalendarService } from './services/GoogleCalendarService';
import { WindowManager } from './services/WindowManager';
import { MESSAGES, IPC_CHANNELS } from './constants/messages';
import { isDevelopment, getAppUrl } from './utils/environment';

// CRITICAL FIX: Disable hardware acceleration to reduce WindowServer conflicts
// Electron's GPU process competes heavily with macOS WindowServer during startup
// causing system-wide window freezing. Running without hardware acceleration
// reduces the load on WindowServer and prevents the freeze.
console.log('[Main] Disabling hardware acceleration to prevent WindowServer conflicts...');
app.disableHardwareAcceleration();

// CRITICAL: Hide dock icon IMMEDIATELY before app becomes visible
// This prevents Electron from appearing as the active app
if (app.dock) {
  console.log('[Main] Hiding dock icon immediately...');
  app.dock.hide();
}

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let breakScheduler: BreakScheduler | null = null;
let calendarService: GoogleCalendarService | null = null;
let windowManager: WindowManager | null = null;

// Track if breaks were manually paused vs auto-paused due to system sleep/lock
let wasManuallyPaused: boolean = false;


function createMainWindow() {
  console.log('[Main Window] Creating window...');
  mainWindow = new BrowserWindow({
    width: 360,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: false, // FIXED: Don't steal focus, only set on top when shown
    vibrancy: 'popover', // macOS vibrancy effect
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  console.log('[Main Window] Window created successfully');

  if (isDevelopment()) {
    const url = getAppUrl();
    mainWindow.loadURL(url).catch(err => {
      console.error('Failed to load dev server, trying again...', err);
      setTimeout(() => {
        mainWindow?.loadURL(url);
      }, 2000);
    });
    // Don't open dev tools for menu bar app
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Hide window when it loses focus (with a small delay to allow for clicks)
  mainWindow.on('blur', () => {
    // Don't hide if DevTools are open (for debugging)
    if (mainWindow?.webContents.isDevToolsOpened()) {
      return;
    }
    
    // Add a small delay to prevent accidental hiding during clicks
    setTimeout(() => {
      // Check if window still exists and is not focused
      if (mainWindow && !mainWindow.isFocused() && mainWindow.isVisible()) {
        console.log('[Main Window] Hiding after blur');
        mainWindow.hide();
      }
    }, 200);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getWindowPosition() {
  const trayBounds = tray?.getBounds();
  const windowBounds = { width: 360, height: 600 };
  
  if (!trayBounds) {
    // Fallback to center of screen
    return { x: 0, y: 0 };
  }
  
  // Position window below tray icon (macOS menu bar)
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  const y = Math.round(trayBounds.y + trayBounds.height);
  
  return { x, y };
}

function toggleMainWindow() {
  if (!mainWindow) {
    console.log('[Tray] Creating main window for first time');
    createMainWindow();
  }
  
  // At this point mainWindow should exist
  if (!mainWindow) {
    console.error('[Tray] Failed to create main window');
    return;
  }
  
  if (mainWindow.isVisible()) {
    console.log('[Tray] Hiding main window');
    mainWindow.setAlwaysOnTop(false); // Release focus lock
    mainWindow.hide();
    // CRITICAL: Blur the window to fully release focus
    mainWindow.blur();
  } else {
    console.log('[Tray] Showing main window');
    const { x, y } = getWindowPosition();
    mainWindow.setPosition(x, y, false);
    mainWindow.setAlwaysOnTop(true); // Only grab focus when showing
    mainWindow.show();
    // NO FOCUS CALL - let macOS handle focus naturally
  }
}

function createTray() {
  // Destroy existing tray if it exists (prevents multiple tray icons)
  if (tray) {
    console.log('[Tray] Destroying existing tray icon');
    tray.destroy();
    tray = null;
  }
  
  console.log('[Tray] Creating new tray icon');
  
  let icon: Electron.NativeImage;
  
  // Try to load Template image (best for macOS menu bar)
  // Template images automatically adapt to light/dark mode
  try {
    // Try the coffee cup icon first (most visually appealing) - now using PNG!
    const coffeeIconPath = path.join(__dirname, '../../assets/iconTemplate.png');
    console.log('[Tray] Trying coffee cup template icon (PNG):', coffeeIconPath);
    icon = nativeImage.createFromPath(coffeeIconPath);
    
    // If coffee cup doesn't work, try the C letter
    if (icon.isEmpty()) {
      const simpleIconPath = path.join(__dirname, '../../assets/iconTemplate-simple.png');
      console.log('[Tray] Trying C letter template icon (PNG):', simpleIconPath);
      icon = nativeImage.createFromPath(simpleIconPath);
    }
    
    // If neither works, try simple dot icon (most reliable fallback)
    if (icon.isEmpty()) {
      const dotIconPath = path.join(__dirname, '../../assets/iconTemplate-dot.png');
      console.log('[Tray] Trying dot template icon (PNG):', dotIconPath);
      icon = nativeImage.createFromPath(dotIconPath);
    }
    
    // Mark as template so macOS handles it properly
    if (!icon.isEmpty()) {
      icon.setTemplateImage(true);
      console.log('[Tray] ✅ Using template icon (auto light/dark mode)');
    } else {
      throw new Error('All template icons empty');
    }
  } catch (error) {
    console.log('[Tray] Template icons failed, using system icon:', error);
    // Fallback to macOS system icon
    icon = nativeImage.createFromNamedImage('NSStatusAvailable', [16, 16, 1]);
  }
  
  tray = new Tray(icon);
  tray.setToolTip('Chill - Break Reminder');
  console.log('[Tray] Tray icon created successfully');
  
  // Click on tray icon toggles the popover window
  tray.on('click', () => {
    toggleMainWindow();
  });
  
  // Right-click shows context menu with quick actions
  tray.on('right-click', () => {
    const isPaused = store.get('isPaused', false) as boolean;
    const contextMenu = Menu.buildFromTemplate([
      {
        label: isPaused ? 'Resume Breaks' : 'Pause Breaks',
        click: () => {
          const newState = !isPaused;
          store.set('isPaused', newState);
          // Track that this is a manual pause/unpause (not from power management)
          wasManuallyPaused = newState;
          breakScheduler?.setPaused(newState);
        }
      },
      { type: 'separator' },
      {
        label: MESSAGES.TRAY.quit,
        click: () => {
          app.quit();
        }
      }
    ]);
    tray?.popUpContextMenu(contextMenu);
  });
}


function setupIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.GET_PREFERENCES, () => {
    const prefs = {
      // Legacy settings (for backward compatibility)
      breakInterval: store.get('breakInterval', 10),
      breakDuration: store.get('breakDuration', 5),
      
      // New two-break-type settings
      quickBreakInterval: store.get('quickBreakInterval', 10),
      quickBreakDuration: store.get('quickBreakDuration', 5),
      longBreakInterval: store.get('longBreakInterval', 30),
      longBreakDuration: store.get('longBreakDuration', 300),
      
      isPaused: store.get('isPaused', false),
      googleCalendarEnabled: store.get('googleCalendarEnabled', false),
      pauseDuringMeetings: store.get('pauseDuringMeetings', true),
      activeHoursEnabled: store.get('activeHoursEnabled', true),
      activeHoursStart: store.get('activeHoursStart', 9),
      activeHoursEnd: store.get('activeHoursEnd', 18),
      startAtLogin: store.get('startAtLogin', true),
      theme: store.get('theme', 'system'),
      soundEnabled: store.get('soundEnabled', true)
    };
    console.log('[Main] GET_PREFERENCES returning:', prefs);
    return prefs;
  });

  ipcMain.handle(IPC_CHANNELS.GET_NEXT_BREAK_TIME, () => {
    const nextBreakTime = breakScheduler?.getNextBreakTime();
    const nextBreakType = breakScheduler?.getNextBreakType();
    return { nextBreakTime, nextBreakType };
  });

  ipcMain.handle(IPC_CHANNELS.GET_BLOCKING_EVENT, async () => {
    const blockingEvent = await breakScheduler?.getCurrentBlockingEvent();
    if (blockingEvent) {
      console.log('[Main] GET_BLOCKING_EVENT returning:', blockingEvent.summary);
    }
    return { blockingEvent };
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_PREFERENCES, async (_, preferences) => {
    console.log('[Main] UPDATE_PREFERENCES called with:', preferences);
    
    Object.keys(preferences).forEach(key => {
      console.log(`[Main] Setting store key "${key}" to:`, preferences[key]);
      store.set(key, preferences[key]);
    });
    
    // Only update break scheduler settings if they were actually changed
    const settingsUpdate: Partial<BreakSettings> = {};
    
    // Legacy support for old single break settings
    if (preferences.breakInterval !== undefined) {
      console.log('[Main] Adding breakInterval to settings update (legacy):', preferences.breakInterval);
      settingsUpdate.quickBreakInterval = preferences.breakInterval;
    }
    if (preferences.breakDuration !== undefined) {
      console.log('[Main] Adding breakDuration to settings update (legacy):', preferences.breakDuration);
      settingsUpdate.quickBreakDuration = preferences.breakDuration;
    }
    
    // New break type settings
    if (preferences.quickBreakInterval !== undefined) {
      console.log('[Main] Adding quickBreakInterval to settings update:', preferences.quickBreakInterval);
      settingsUpdate.quickBreakInterval = preferences.quickBreakInterval;
    }
    if (preferences.quickBreakDuration !== undefined) {
      console.log('[Main] Adding quickBreakDuration to settings update:', preferences.quickBreakDuration);
      settingsUpdate.quickBreakDuration = preferences.quickBreakDuration;
    }
    if (preferences.longBreakInterval !== undefined) {
      console.log('[Main] Adding longBreakInterval to settings update:', preferences.longBreakInterval);
      settingsUpdate.longBreakInterval = preferences.longBreakInterval;
    }
    if (preferences.longBreakDuration !== undefined) {
      console.log('[Main] Adding longBreakDuration to settings update:', preferences.longBreakDuration);
      settingsUpdate.longBreakDuration = preferences.longBreakDuration;
    }
    
    if (Object.keys(settingsUpdate).length > 0) {
      console.log('[Main] Updating break scheduler settings:', settingsUpdate);
      breakScheduler?.updateSettings(settingsUpdate);
    } else {
      console.log('[Main] No break scheduler settings to update');
    }
    
    // Handle pauseDuringMeetings setting change
    if (preferences.pauseDuringMeetings !== undefined) {
      console.log('[Main] pauseDuringMeetings changed, re-evaluating schedule');
      await breakScheduler?.updatePauseDuringMeetingsSetting();
    }
    
    if (preferences.startAtLogin !== undefined) {
      console.log('[Main] Updating login item settings:', preferences.startAtLogin);
      app.setLoginItemSettings({
        openAtLogin: preferences.startAtLogin,
        openAsHidden: true
      });
    }
    
    if (preferences.isPaused !== undefined) {
      console.log('[Main] Setting paused state:', preferences.isPaused);
      // Track that this is a manual pause/unpause (not from power management)
      wasManuallyPaused = preferences.isPaused;
      breakScheduler?.setPaused(preferences.isPaused);
    }
    
    console.log('[Main] Preferences update complete');
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.GOOGLE_AUTH_START, async () => {
    try {
      const success = await calendarService?.startAuthFlow();
      return { success: success || false };
    } catch (error) {
      console.error('Auth error:', error);
      return { success: false, error: String(error) };
    }
  });

  // Auth callback is now handled internally by GoogleCalendarService
  ipcMain.handle(IPC_CHANNELS.GOOGLE_AUTH_CALLBACK, async () => {
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.GOOGLE_AUTH_DISCONNECT, async () => {
    try {
      await calendarService?.disconnect();
      store.set('googleCalendarEnabled', false);
      return { success: true };
    } catch (error) {
      console.error('Disconnect error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_CALENDAR_EVENTS, async () => {
    try {
      const events = await calendarService?.getUpcomingEvents(24);
      return { success: true, events: events || [] };
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      return { success: false, events: [], error: String(error) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.PREVIEW_BREAK, async () => {
    try {
      const quickBreakDuration = store.get('quickBreakDuration', 5) as number;
      console.log('[Main] Preview QUICK break requested, duration:', quickBreakDuration);
      await windowManager?.showBreakWindow(quickBreakDuration, 'quick');
      console.log('[Main] Preview break completed');
      return { success: true };
    } catch (error) {
      console.error('[Main] Preview break error:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, () => {
    mainWindow?.close();
  });

  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
    mainWindow?.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.SKIP_BREAK, () => {
    console.log('[Main] Skip break requested');
    windowManager?.closeBreakWindow();
    return { success: true };
  });
  
  // App controls
  ipcMain.handle(IPC_CHANNELS.QUIT_APP, () => {
    console.log('[Main] Quit app requested');
    app.quit();
  });
}

app.whenReady().then(() => {
  // CRITICAL: Delay ALL window/tray operations to avoid WindowServer conflicts
  // Electron spawning multiple helper processes competes with macOS WindowServer
  // causing it to spike CPU and freeze all windows system-wide
  console.log('[Main] App ready, waiting 3 seconds before creating UI to let WindowServer stabilize...');
  
  setTimeout(() => {
    console.log('[Main] Creating tray and initializing services...');
    
    createTray();
    setupIpcHandlers();
    
    // DON'T create main window here - only create it when user clicks tray
    // This prevents invisible windows from holding focus during startup
    
    // Initialize services
    windowManager = new WindowManager();
    calendarService = new GoogleCalendarService(store);
    breakScheduler = new BreakScheduler(
      windowManager,
      calendarService,
      store
    );
    
    // Delay starting the break scheduler even more to avoid interfering with app startup
    // and macOS WindowServer initialization (prevents window focus issues)
    console.log('[Main] Delaying break scheduler start by 15 seconds to avoid startup conflicts...');
    setTimeout(() => {
      console.log('[Main] Starting break scheduler now');
      breakScheduler?.start();
    }, 15000); // 15 second delay from service initialization
    
    // Set up auto-launch if enabled (defaults to FALSE - disabled by default)
    const startAtLogin = store.get('startAtLogin', false) as boolean;
    app.setLoginItemSettings({
      openAtLogin: startAtLogin,
      openAsHidden: true
    });
    
    console.log('[Main] Initialization complete');
    
    // CRITICAL: Deactivate the app so it doesn't steal focus
    // Menu bar apps should never be the active app
    console.log('[Main] Deactivating app to release focus...');
    app.hide();
  }, 3000); // 3 second delay after app ready
});

// ===== POWER MANAGEMENT: Auto-pause when computer sleeps/locks =====
// Automatically pause breaks when the user is away and resume when they return

app.on('ready', () => {
  // SUSPEND: Computer is going to sleep
  powerMonitor.on('suspend', () => {
    console.log('[PowerMonitor] Computer suspending (sleep/close lid)...');
    
    // Check if breaks are currently active (not manually paused)
    const currentlyPaused = store.get('isPaused', false) as boolean;
    wasManuallyPaused = currentlyPaused;
    
    if (!currentlyPaused) {
      console.log('[PowerMonitor] Auto-pausing breaks during sleep');
      store.set('isPaused', true);
      breakScheduler?.setPaused(true);
    } else {
      console.log('[PowerMonitor] Breaks already paused (manual), no change needed');
    }
  });

  // RESUME: Computer woke up from sleep
  powerMonitor.on('resume', () => {
    console.log('[PowerMonitor] Computer resuming from sleep...');
    
    // Only resume if breaks were NOT manually paused before sleep
    if (!wasManuallyPaused) {
      console.log('[PowerMonitor] Auto-resuming breaks after wake');
      store.set('isPaused', false);
      breakScheduler?.setPaused(false);
    } else {
      console.log('[PowerMonitor] Breaks remain paused (were manually paused)');
    }
    
    // Reset the flag
    wasManuallyPaused = false;
  });

  // LOCK-SCREEN: User locked their screen
  powerMonitor.on('lock-screen', () => {
    console.log('[PowerMonitor] Screen locked...');
    
    const currentlyPaused = store.get('isPaused', false) as boolean;
    wasManuallyPaused = currentlyPaused;
    
    if (!currentlyPaused) {
      console.log('[PowerMonitor] Auto-pausing breaks while screen locked');
      store.set('isPaused', true);
      breakScheduler?.setPaused(true);
    }
  });

  // UNLOCK-SCREEN: User unlocked their screen
  powerMonitor.on('unlock-screen', () => {
    console.log('[PowerMonitor] Screen unlocked...');
    
    if (!wasManuallyPaused) {
      console.log('[PowerMonitor] Auto-resuming breaks after unlock');
      store.set('isPaused', false);
      breakScheduler?.setPaused(false);
    }
    
    wasManuallyPaused = false;
  });

  // SHUTDOWN: Computer is shutting down
  powerMonitor.on('shutdown', () => {
    console.log('[PowerMonitor] System shutting down, cleaning up...');
    // Let the shutdown proceed, cleanup will happen in before-quit
  });

  console.log('[PowerMonitor] Power management listeners registered');
});

app.on('window-all-closed', () => {
  // Don't quit when all windows are closed (keep running in tray)
  // This is standard behavior for menu bar apps
});

app.on('activate', () => {
  // For menu bar apps, we don't auto-create windows on activate
  // User should click the tray icon to show settings
});

app.on('before-quit', () => {
  console.log('[App] Cleaning up before quit');
  
  // Stop the break scheduler
  breakScheduler?.stop();
  
  // Clean up window manager (prevents lingering focus restoration attempts)
  windowManager?.cleanup();
  
  // Clean up tray icon
  if (tray) {
    console.log('[Tray] Destroying tray on quit');
    tray.destroy();
    tray = null;
  }
});
