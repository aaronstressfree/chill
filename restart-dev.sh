#!/bin/bash

# Restart script for Chill development
# This ensures clean restarts by killing old processes, rebuilding, and launching fresh

echo "🛑 Stopping old Electron processes..."
# Kill Electron app processes (but NOT vite/node dev servers)
pkill -9 -f "Electron.app.*chill" 2>/dev/null
# Only kill the electron process itself, not other node processes
pkill -9 -f "npx electron" 2>/dev/null

echo "⏳ Waiting for processes to terminate and tray icons to clear..."
sleep 3

echo "🔨 Building TypeScript..."
cd /Users/aaronstevens/Documents/chill
npm run build:electron

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "🚀 Starting Electron app..."
ELECTRON_IS_DEV=1 NODE_ENV=development npx electron .

# If electron exits, show the exit code
echo ""
echo "Electron exited with code: $?"

