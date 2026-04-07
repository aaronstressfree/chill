# Chill - Mindful Break Reminder for Mac

A beautiful, native Mac app that reminds you to take regular breaks while respecting your Google Calendar schedule. Never get interrupted during important meetings again!

## Features

✨ **Smart Break Scheduling**
- Customizable break intervals (5-60 minutes)
- Adjustable break duration (5-30 seconds)
- Automatically pauses during Google Calendar meetings
- Beautiful, non-intrusive break notifications

🎨 **Thoughtful Design**
- Clean, modern interface with Inter typeface
- Smooth animations powered by Framer Motion
- Native Mac app experience
- System tray integration for quick access

🔗 **Google Calendar Integration**
- OAuth2 authentication
- Real-time meeting detection
- Privacy-focused (read-only calendar access)

🕐 **Active Hours**
- Set your working hours (default: 9 AM – 6 PM)
- Breaks only trigger during active hours
- Uses your computer's local time zone
- Supports overnight ranges (e.g. 10 PM – 6 AM)
- Toggle on/off anytime

⚙️ **Customization Options**
- Start automatically at login
- Pause/resume breaks anytime
- Adjustable timing preferences
- Minimal resource usage

## Setup Instructions

### Prerequisites

- macOS 10.15 or later
- Node.js 18+ and npm
- Google Cloud Console account (for Calendar API)

### Installation

1. **Clone the repository and install dependencies:**

```bash
cd /Users/aaronstevens/Documents/chill
npm install
```

2. **Set up Google Calendar API:**

   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Create a new project or select an existing one
   
   c. Enable the Google Calendar API:
      - Navigate to "APIs & Services" → "Library"
      - Search for "Google Calendar API"
      - Click "Enable"
   
   d. Create OAuth 2.0 credentials:
      - Go to "APIs & Services" → "Credentials"
      - Click "Create Credentials" → "OAuth client ID"
      - Select "Desktop" as application type
      - Add `http://localhost:3000/auth/callback` as authorized redirect URI
      - Download the credentials JSON file
   
   e. Update the configuration:
      - Open `electron/constants/config.ts`
      - Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your actual credentials

3. **Create icon assets (optional):**

```bash
mkdir -p assets
# Add your tray-icon.png (16x16 or 32x32) to the assets folder
# Add your icon.icns for the app icon
```

### Development

Run the app in development mode:

```bash
npm run dev
```

This will start both the Electron main process and the React dev server.

### Building for Production

Build the Mac app:

```bash
npm run dist
```

The built app will be in the `release` folder.

### Testing

1. Launch the app
2. Click on the menu bar icon to access preferences
3. Adjust break intervals and duration
4. Connect your Google Calendar (optional)
5. The app will start scheduling breaks automatically

## Project Structure

```
chill/
├── electron/           # Electron main process
│   ├── main.ts        # App entry point
│   ├── preload.ts     # Secure IPC bridge
│   ├── services/      # Core business logic
│   │   ├── BreakScheduler.ts
│   │   ├── GoogleCalendarService.ts
│   │   └── WindowManager.ts
│   └── constants/     # Configuration & messages
├── src/               # React renderer process
│   ├── components/    # UI components
│   │   ├── ui/       # Reusable components
│   │   ├── windows/  # App windows
│   │   └── settings/ # Settings panels
│   ├── theme/        # Design tokens & styles
│   ├── constants/    # App strings
│   └── types/        # TypeScript definitions
├── assets/           # Icons and images
└── dist/            # Build output
```

## Architecture Notes

The app follows a modular architecture with clear separation of concerns:

- **Main Process** (Electron): Handles system integration, window management, and scheduling
- **Renderer Process** (React): Manages UI and user interactions
- **IPC Bridge**: Secure communication between processes via contextBridge
- **Services**: Isolated business logic for breaks, calendar, and windows
- **Theme System**: Centralized design tokens for consistent styling
- **Constants**: All strings and configuration in dedicated files

## Configuration

The app stores preferences using `electron-store` in:
- macOS: `~/Library/Application Support/chill-break-reminder/`

Settings include:
- Break interval (minutes)
- Break duration (seconds)
- Google Calendar connection status
- Active hours (start/end time, enabled/disabled)
- Pause state
- Start at login preference

## Privacy & Security

- Calendar access is read-only
- OAuth tokens are stored securely using electron-store
- No data is sent to external servers (except Google Calendar API)
- All processing happens locally on your Mac

## Troubleshooting

**App doesn't start:**
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 18+)

**Google Calendar not connecting:**
- Ensure you've set up OAuth credentials correctly
- Check that redirect URI matches exactly: `http://localhost:3000/auth/callback`
- Try disconnecting and reconnecting in settings

**Breaks not appearing:**
- Check that breaks aren't paused in the menu bar
- Verify you're not in a calendar meeting
- Check system notification permissions

**Build fails:**
- Clear build cache: `rm -rf dist/ release/`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

Feel free to submit issues and pull requests. Please follow the existing code style and architecture patterns.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with Electron, React, and TypeScript
- UI animations powered by Framer Motion
- Typography by Inter
- Inspired by the need for healthier work habits

---

Made with ❤️ for a healthier, more mindful workday
