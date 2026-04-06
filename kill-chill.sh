#!/bin/bash
# Quick script to kill all Chill/Electron processes

echo "🛑 Stopping Chill/Electron..."
killall -9 Electron 2>/dev/null
killall -9 "node_modules/electron" 2>/dev/null

# Kill any npm/dev processes too
pkill -f "npm.*chill" 2>/dev/null
pkill -f "concurrently.*chill" 2>/dev/null

echo "✅ All Chill processes stopped!"
ps aux | grep -i electron | grep -v grep || echo "✓ Verified: No Electron processes running"



