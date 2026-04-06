/**
 * Break Window Component
 * 
 * This is the full-screen break reminder that appears when it's time for a break.
 * 
 * Features:
 * - Countdown timer with circular progress indicator
 * - Theme-aware styling (light/dark mode)
 * - Keyboard shortcut support (Cmd/Ctrl + X to skip)
 * - Optional sound notification when break ends
 * - Different behaviors for quick vs long breaks:
 *   - Quick breaks: Close automatically when done
 *   - Long breaks: Show completion message before closing
 * 
 * How it works:
 * 1. Electron's WindowManager creates this window and sends a BREAK_START event
 * 2. React receives the event and starts the countdown timer
 * 3. User can skip the break or let it complete naturally
 * 4. When time runs out, plays sound (if enabled) and triggers BREAK_END
 * 5. WindowManager closes the window and restores focus to previous app
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { tokens } from '@/theme/tokens';
import { strings } from '@/constants/strings';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Button } from '@/components/ui/Button';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useColorScheme } from '@/theme/useTheme';
import { playBreakEndSound } from '@/utils/audio';

const Container = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${tokens.colors.light.background};
  border-radius: ${tokens.borderRadius.xl};
  padding: ${tokens.spacing[12]} ${tokens.spacing[8]};
  position: relative;
  overflow: hidden;

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.dark.background};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.dark.background};
    }
  }
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
  pointer-events: none;

  [data-theme="dark"] &,
  html.dark & {
    background: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.12) 0%, transparent 50%);
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.12) 0%, transparent 50%);
    }
  }
`;

const ContentWrapper = styled(motion.div)`
  text-align: center;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled(motion.h1)`
  font-size: ${tokens.typography.fontSize['5xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.light.primary};
  margin-bottom: ${tokens.spacing[3]};
  letter-spacing: -0.02em;
  line-height: 1.1;

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.text.dark.primary};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.text.dark.primary};
    }
  }
`;

const Subtitle = styled(motion.p)`
  font-size: ${tokens.typography.fontSize.xl};
  color: ${tokens.colors.text.light.secondary};
  margin-bottom: ${tokens.spacing[8]};
  font-weight: ${tokens.typography.fontWeight.regular};
  line-height: 1.7;
  max-width: 600px;

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.text.dark.secondary};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.text.dark.secondary};
    }
  }
`;

const TimerWrapper = styled(motion.div)`
  margin: ${tokens.spacing[8]} 0;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const TimerContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const CountdownText = styled(motion.div)`
  font-size: ${tokens.typography.fontSize['5xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  background: linear-gradient(135deg, ${tokens.colors.accent[500]} 0%, ${tokens.colors.pink[500]} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-variant-numeric: tabular-nums;
  line-height: 1;

  [data-theme="dark"] &,
  html.dark & {
    background: linear-gradient(135deg, ${tokens.colors.accent[400]} 0%, ${tokens.colors.pink[400]} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: linear-gradient(135deg, ${tokens.colors.accent[400]} 0%, ${tokens.colors.pink[400]} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
`;

const CountdownLabel = styled.div`
  font-size: ${tokens.typography.fontSize.lg};
  color: ${tokens.colors.text.light.tertiary};
  margin-top: ${tokens.spacing[2]};
  font-weight: ${tokens.typography.fontWeight.medium};

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.text.dark.tertiary};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.text.dark.tertiary};
    }
  }
`;

const SkipButton = styled(Button)`
  margin-top: ${tokens.spacing[10]};
  font-size: ${tokens.typography.fontSize.lg};
  
  kbd {
    opacity: 0.7;
    font-size: 0.9em;
    margin-left: ${tokens.spacing[2]};
    font-family: ${tokens.typography.fontFamily.mono};
  }
`;

export const BreakWindow: React.FC = () => {
  // === STATE MANAGEMENT ===
  
  // Total duration of the break in seconds (set by BREAK_START event)
  const [duration, setDuration] = useState(5);
  
  // Current time remaining in seconds (counts down from duration to 0)
  const [timeRemaining, setTimeRemaining] = useState(5);
  
  // Whether we're showing the "break complete" message (long breaks only)
  const [isEnding, setIsEnding] = useState(false);
  
  // Type of break: 'quick' (short, eye rest) or 'long' (stretch, walk around)
  const [breakType, setBreakType] = useState<'quick' | 'long'>('quick');
  
  // useRef to store break type - needed because the timer callback
  // doesn't have access to the latest state value (closure issue)
  const breakTypeRef = useRef<'quick' | 'long'>('quick');
  
  // User's theme preference: 'light', 'dark', or 'system' (follows OS)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Whether to play sound when break ends (user-configurable)
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Calculate the effective color scheme based on user preference and system setting
  const colorScheme = useColorScheme(theme);

  /**
   * Handle skip button click - tells Electron to close the break window
   * This triggers the WindowManager's closeBreakWindow method
   */
  const handleSkip = () => {
    console.log('[BreakWindow] Skip button clicked');
    window.electronAPI.skipBreak();
  };

  /**
   * Effect: Load user preferences from Electron store on mount
   * 
   * Runs once when component first loads to get theme and sound settings.
   * These preferences are stored persistently by Electron.
   */
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await window.electronAPI.getPreferences();
        setTheme(prefs.theme);
        setSoundEnabled(prefs.soundEnabled);
      } catch (error) {
        console.error('[BreakWindow] Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  /**
   * Effect: Set up event listeners for break lifecycle
   * 
   * This effect runs once on mount and sets up three key event listeners:
   * 
   * 1. BREAK_START - Sent by WindowManager when break window is shown
   *    - Receives: duration (seconds) and type ('quick' or 'long')
   *    - Updates: All state to start the countdown
   * 
   * 2. BREAK_END - Sent by WindowManager when it's time to close
   *    - For long breaks: Shows completion message
   *    - For quick breaks: Window closes immediately
   * 
   * 3. Keyboard shortcuts - Allow user to skip break with Cmd/Ctrl+X
   * 
   * Returns cleanup function to unsubscribe when component unmounts.
   */
  useEffect(() => {
    console.log('[BreakWindow] ===== COMPONENT MOUNTED =====');
    
    // === EVENT LISTENER 1: BREAK START ===
    // This is triggered by WindowManager after creating the window
    const unsubscribeStart = window.electronAPI.onBreakStart((_event, data) => {
      console.log('[BreakWindow] ===== BREAK_START EVENT RECEIVED =====');
      console.log('[BreakWindow] Data received:', JSON.stringify(data));
      console.log('[BreakWindow] Duration:', data.duration);
      console.log('[BreakWindow] Type:', data.type);
      
      // Get break type, defaulting to 'quick' if not specified
      const type = data.type || 'quick';
      console.log('[BreakWindow] Resolved type:', type);
      
      // Initialize all state for the new break
      setDuration(data.duration);           // Total break duration
      setTimeRemaining(data.duration);      // Start countdown at full duration
      setBreakType(type);                   // 'quick' or 'long'
      breakTypeRef.current = type;          // Store in ref for timer callback
      setIsEnding(false);                   // Not showing end message yet
      
      console.log('[BreakWindow] State updated:');
      console.log('[BreakWindow]   - duration:', data.duration);
      console.log('[BreakWindow]   - breakType state:', type);
      console.log('[BreakWindow]   - breakTypeRef.current:', breakTypeRef.current);
      console.log('[BreakWindow]   - isEnding:', false);
      console.log('[BreakWindow] ===== BREAK_START COMPLETE =====');
    });

    // === EVENT LISTENER 2: BREAK END ===
    // Triggered by WindowManager when break duration completes
    const unsubscribeEnd = window.electronAPI.onBreakEnd(() => {
      console.log('[BreakWindow] ===== BREAK_END EVENT RECEIVED =====');
      console.log('[BreakWindow] breakTypeRef.current:', breakTypeRef.current);
      console.log('[BreakWindow] Checking if should show end message...');
      
      // Different behavior for different break types:
      // - Long breaks: Show "Great job!" message for a moment
      // - Quick breaks: Close immediately (no message needed)
      if (breakTypeRef.current === 'long') {
        console.log('[BreakWindow] Type is LONG - SHOWING end message');
        setIsEnding(true);
      } else {
        console.log('[BreakWindow] Type is QUICK - NOT showing end message');
        console.log('[BreakWindow] Window should close immediately');
      }
      console.log('[BreakWindow] ===== BREAK_END COMPLETE =====');
    });

    // === EVENT LISTENER 3: KEYBOARD SHORTCUTS ===
    // Allow users to skip break with Cmd+X (Mac) or Ctrl+X (Windows/Linux)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (metaKey) or Ctrl (ctrlKey) is pressed along with X
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'x') {
        console.log('[BreakWindow] Keyboard shortcut triggered: Skip break');
        e.preventDefault(); // Prevent default "cut" behavior
        handleSkip();       // Trigger skip action
      }
    };

    // Register keyboard listener on the window
    window.addEventListener('keydown', handleKeyDown);

    // === CLEANUP FUNCTION ===
    // Called when component unmounts - removes all listeners
    return () => {
      console.log('[BreakWindow] Component unmounting');
      unsubscribeStart();   // Stop listening for BREAK_START
      unsubscribeEnd();     // Stop listening for BREAK_END
      window.removeEventListener('keydown', handleKeyDown); // Remove keyboard listener
    };
  }, []);

  /**
   * Effect: Countdown timer logic
   * 
   * This effect manages the 1-second countdown timer that updates the UI.
   * 
   * How it works:
   * 1. Runs whenever timeRemaining changes
   * 2. Sets up an interval that fires every 1000ms (1 second)
   * 3. Each tick decrements timeRemaining by 1
   * 4. When timeRemaining hits 0:
   *    - Plays sound (if enabled in settings)
   *    - Shows end message for long breaks
   *    - Window auto-closes for quick breaks (handled by WindowManager)
   * 5. Cleans up the interval when component unmounts or timeRemaining changes
   * 
   * Why we use breakTypeRef instead of breakType:
   * The setInterval callback "captures" the initial value of breakType due to
   * JavaScript closure rules. By using a ref, we can access the latest value
   * even inside the timer callback.
   */
  useEffect(() => {
    // Don't start timer if time is already 0 (prevents unnecessary interval)
    if (timeRemaining <= 0) {
      console.log('[BreakWindow] Time remaining is 0, not starting timer');
      return;
    }

    console.log('[BreakWindow] Starting countdown timer, time remaining:', timeRemaining);
    console.log('[BreakWindow] Current break type:', breakTypeRef.current);
    
    // Set up interval to decrement time every second
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        console.log('[BreakWindow] Countdown tick, prev:', prev);
        
        // When we hit 1, it means next tick would be 0 (break complete)
        if (prev <= 1) {
          console.log('[BreakWindow] ===== COUNTDOWN REACHED 0 =====');
          console.log('[BreakWindow] Break type:', breakTypeRef.current);
          
          // === PLAY COMPLETION SOUND ===
          // Only if user has sound enabled in settings
          if (soundEnabled) {
            playBreakEndSound();
          }
          
          // === HANDLE BREAK COMPLETION ===
          // Long breaks: Show "Great job!" message
          // Quick breaks: Window closes immediately (WindowManager handles this)
          if (breakTypeRef.current === 'long') {
            console.log('[BreakWindow] Type is LONG - showing end message from countdown');
            setIsEnding(true);
          } else {
            console.log('[BreakWindow] Type is QUICK - NOT showing end message from countdown');
            console.log('[BreakWindow] Window will close via WindowManager auto-close');
          }
          
          // Return 0 to stop the countdown
          return 0;
        }
        
        // Decrement time remaining by 1 second
        return prev - 1;
      });
    }, 1000); // Run every 1000ms (1 second)

    // Cleanup function - clear interval when effect re-runs or component unmounts
    return () => {
      console.log('[BreakWindow] Clearing timer');
      clearInterval(timer);
    };
  }, [timeRemaining, soundEnabled]); // Re-run when timeRemaining or soundEnabled changes

  // Calculate progress percentage for the circular progress indicator
  // Goes from 0% (start) to 100% (complete)
  const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0;

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <BackgroundPattern />
        
        {!isEnding ? (
        <ContentWrapper>
          <Title>{breakType === 'long' ? '☕ Long Break!' : '⚡ Quick Break!'}</Title>
          
          <Subtitle>
            {breakType === 'long' 
              ? 'Get up, take deep belly breaths, and stretch your body' 
              : 'Look away from your screen for a moment'}
          </Subtitle>
          
          <TimerWrapper>
            <CircularProgress 
              progress={progress} 
              size={240} 
              strokeWidth={10}
              useGradient={true}
              gradientStart={colorScheme === 'dark' ? tokens.colors.accent[400] : tokens.colors.accent[500]}
              gradientEnd={colorScheme === 'dark' ? tokens.colors.pink[400] : tokens.colors.pink[500]}
              backgroundColor={colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)'}
            />
            <TimerContent>
              <CountdownText>
                {breakType === 'long' && timeRemaining >= 60
                  ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
                  : timeRemaining}
              </CountdownText>
              <CountdownLabel>
                {breakType === 'long' && timeRemaining >= 60 
                  ? 'minutes remaining'
                  : strings.break.countdownLabel}
              </CountdownLabel>
            </TimerContent>
          </TimerWrapper>
          
          <div>
            <SkipButton onClick={handleSkip} variant="secondary" size="large">
              {strings.break.skipButton} <kbd>(⌘X)</kbd>
            </SkipButton>
          </div>
        </ContentWrapper>
      ) : (
        <ContentWrapper>
          <Title>{strings.break.endMessage}</Title>
        </ContentWrapper>
      )}
      </Container>
    </ThemeProvider>
  );
};
