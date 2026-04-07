import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { tokens } from '@/theme/tokens';
import { strings } from '@/constants/strings';
import { Preferences, CalendarEvent, BlockingEvent } from '@/types/electron';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { DrillRow } from '@/components/ui/DrillRow';
import { Select } from '@/components/ui/Select';

const Container = styled.div`
  padding: ${tokens.spacing[5]};
  max-width: 100%;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${tokens.spacing[5]};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  color: ${tokens.colors.text.light.primary};
  margin-bottom: ${tokens.spacing[2]};
  font-weight: ${tokens.typography.fontWeight.bold};
  letter-spacing: -0.02em;

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

const Subtitle = styled.p`
  font-size: ${tokens.typography.fontSize.base};
  color: ${tokens.colors.text.light.secondary};
  line-height: 1.7;

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

const NextBreakTimer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  padding: ${tokens.spacing[3]} ${tokens.spacing[5]};
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: ${tokens.borderRadius.full};
  margin-top: ${tokens.spacing[3]};
  font-size: ${tokens.typography.fontSize.base};
  color: ${tokens.colors.accent[600]};
  font-weight: ${tokens.typography.fontWeight.semibold};
  transition: all ${tokens.transitions.base} ease;

  &:hover {
    background: rgba(99, 102, 241, 0.15);
  }

  [data-theme="dark"] &,
  html.dark & {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    color: ${tokens.colors.accent[400]};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.3);
      color: ${tokens.colors.accent[400]};
    }
  }
`;

const BreakIcon = styled.span`
  font-size: ${tokens.typography.fontSize.base};
`;

const PauseControl = styled(motion.div)`
  background: ${tokens.colors.light.surface};
  border: 1px solid ${tokens.colors.light.border};
  border-radius: ${tokens.borderRadius.lg};
  padding: ${tokens.spacing[5]};
  margin-bottom: ${tokens.spacing[5]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all ${tokens.transitions.base} ease;

  &:hover {
    border-color: ${tokens.colors.light.borderHover};
  }

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.dark.surface};
    border-color: ${tokens.colors.dark.border};

    &:hover {
      border-color: ${tokens.colors.dark.borderHover};
    }
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.dark.surface};
      border-color: ${tokens.colors.dark.border};

      &:hover {
        border-color: ${tokens.colors.dark.borderHover};
      }
    }
  }
`;

const PauseLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
`;

const PauseIcon = styled.span`
  font-size: ${tokens.typography.fontSize['2xl']};
  line-height: 1;
`;

const PauseText = styled.div``;

const PauseTitle = styled.div`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.light.primary};
  margin-bottom: ${tokens.spacing[1]};

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

const PauseDescription = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.text.light.secondary};

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

const DrillRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[3]};
`;

const Setting = styled.div`
  padding-top: ${tokens.spacing[4]};
  padding-bottom: ${tokens.spacing[4]};
  
  /* Add subtle divider between settings (but not before the first one) */
  &:not(:first-child) {
    border-top: 1px solid ${tokens.colors.light.border};
  }
  
  &:last-child {
    padding-bottom: 0;
  }

  /* Dark mode dividers */
  [data-theme="dark"] &:not(:first-child),
  html.dark &:not(:first-child) {
    border-top-color: ${tokens.colors.dark.border};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) &:not(:first-child) {
      border-top-color: ${tokens.colors.dark.border};
    }
  }
`;

const SettingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${tokens.spacing[2]};
`;

const SettingLabel = styled.label`
  font-size: ${tokens.typography.fontSize.base};
  color: ${tokens.colors.text.light.primary};
  font-weight: ${tokens.typography.fontWeight.semibold};

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

const SettingDescription = styled.p`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.text.light.tertiary};
  margin-bottom: ${tokens.spacing[2]};
  line-height: 1.6;

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

const SettingValue = styled.span`
  font-size: ${tokens.typography.fontSize.base};
  color: ${tokens.colors.accent[500]};
  font-weight: ${tokens.typography.fontWeight.bold};
`;

const CalendarStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  margin-bottom: ${tokens.spacing[3]};
`;

const StatusDot = styled.div<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: ${tokens.borderRadius.full};
  background: ${props => props.connected ? tokens.colors.success.main : tokens.colors.neutral[400]};
`;

const StatusText = styled.span`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.text.light.secondary};
  font-weight: ${tokens.typography.fontWeight.medium};

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${tokens.borderRadius.lg};
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing[6]};
  border-bottom: 1px solid ${tokens.colors.neutral[200]};

  h2 {
    margin: 0;
    font-size: ${tokens.typography.fontSize.xl};
    color: ${tokens.colors.neutral[900]};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${tokens.colors.neutral[500]};
  cursor: pointer;
  padding: ${tokens.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${tokens.borderRadius.md};
  transition: all 0.2s;

  &:hover {
    background: ${tokens.colors.neutral[100]};
    color: ${tokens.colors.neutral[700]};
  }
`;

const ModalBody = styled.div`
  padding: ${tokens.spacing[6]};
  overflow-y: auto;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${tokens.spacing[8]};
  color: ${tokens.colors.neutral[600]};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${tokens.spacing[8]};
  color: ${tokens.colors.neutral[600]};

  p {
    margin: ${tokens.spacing[2]} 0;
  }
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[3]};
`;

const EventCard = styled.div<{ skipped?: boolean }>`
  background: ${props => props.skipped ? tokens.colors.neutral[50] : tokens.colors.primary[50]};
  border: 1px solid ${props => props.skipped ? tokens.colors.neutral[200] : tokens.colors.primary[200]};
  border-radius: ${tokens.borderRadius.md};
  padding: ${tokens.spacing[4]};
  transition: all 0.2s;
  opacity: ${props => props.skipped ? 0.7 : 1};

  &:hover {
    background: ${props => props.skipped ? tokens.colors.neutral[100] : tokens.colors.primary[100]};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const EventTitle = styled.div`
  font-size: ${tokens.typography.fontSize.base};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.neutral[900]};
  margin-bottom: ${tokens.spacing[1]};
`;

const EventTime = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.neutral[600]};
`;

const SkipBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${tokens.spacing[1]};
  margin-top: ${tokens.spacing[2]};
  padding: ${tokens.spacing[1]} ${tokens.spacing[2]};
  background: ${tokens.colors.neutral[100]};
  border: 1px solid ${tokens.colors.neutral[300]};
  border-radius: ${tokens.borderRadius.sm};
  font-size: ${tokens.typography.fontSize.xs};
  color: ${tokens.colors.neutral[700]};
  font-weight: ${tokens.typography.fontWeight.medium};
`;

interface SettingsPanelProps {
  preferences: Preferences;
  onUpdate: (updates: Partial<Preferences>) => Promise<void>;
  onReloadPreferences: () => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  preferences, 
  onUpdate,
  onReloadPreferences
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [nextBreakTime, setNextBreakTime] = useState<string | null>(null);
  const [nextBreakType, setNextBreakType] = useState<'quick' | 'long' | null>(null);
  const [blockingEvent, setBlockingEvent] = useState<BlockingEvent | null>(null);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Poll for next break time and blocking event every second
  useEffect(() => {
    const updateBreakStatus = async () => {
      try {
        const [timeResult, eventResult] = await Promise.all([
          window.electronAPI.getNextBreakTime(),
          window.electronAPI.getBlockingEvent()
        ]);
        setNextBreakTime(timeResult.nextBreakTime);
        setNextBreakType(timeResult.nextBreakType);
        setBlockingEvent(eventResult.blockingEvent);
      } catch (error) {
        console.error('Failed to get break status:', error);
      }
    };

    updateBreakStatus();
    const interval = setInterval(updateBreakStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGoogleConnect = async () => {
    setIsAuthenticating(true);
    try {
      const result = await window.electronAPI.startGoogleAuth();
      if (result.success) {
        // Reload preferences to reflect the connected status
        await onReloadPreferences();
      } else {
        console.error('Authentication failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to start authentication:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      const result = await window.electronAPI.disconnectGoogle();
      if (result.success) {
        // Reload preferences to reflect the disconnected status
        await onReloadPreferences();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleViewBlockedTimes = async () => {
    setShowEventsModal(true);
    setLoadingEvents(true);
    try {
      const result = await window.electronAPI.getCalendarEvents();
      setCalendarEvents(result.events || []);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      setCalendarEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleQuitApp = async () => {
    try {
      await window.electronAPI.quitApp();
    } catch (error) {
      console.error('Failed to quit app:', error);
    }
  };

  const getQuickBreakSummary = () => {
    const interval = preferences.quickBreakInterval < 1 
      ? `${Math.round(preferences.quickBreakInterval * 60)}s` 
      : `${preferences.quickBreakInterval}m`;
    return `Every ${interval} • ${preferences.quickBreakDuration}s break`;
  };

  const getLongBreakSummary = () => {
    const mins = Math.floor(preferences.longBreakDuration / 60);
    const secs = preferences.longBreakDuration % 60;
    const duration = secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    return `Every ${preferences.longBreakInterval}m • ${duration} break`;
  };

  const getCalendarSummary = () => {
    return preferences.googleCalendarEnabled ? 'Connected' : 'Not connected';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const getActiveHoursSummary = () => {
    if (!preferences.activeHoursEnabled) return 'Off';
    return `${formatHour(preferences.activeHoursStart)} – ${formatHour(preferences.activeHoursEnd)}`;
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: formatHour(i)
  }));

  const isOutsideActiveHours = (() => {
    if (!preferences.activeHoursEnabled) return false;
    const currentHour = new Date().getHours();
    const start = preferences.activeHoursStart;
    const end = preferences.activeHoursEnd;
    if (start < end) return currentHour < start || currentHour >= end;
    if (start > end) return currentHour >= end && currentHour < start;
    return false; // start === end means 24h
  })();

  return (
    <Container>
      <Header>
        <Title>{strings.settings.title}</Title>
        <Subtitle>{strings.app.tagline}</Subtitle>
        {isOutsideActiveHours && !preferences.isPaused && (
          <NextBreakTimer>
            <BreakIcon>🌙</BreakIcon>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600 }}>Outside active hours</span>
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                Breaks resume at {formatHour(preferences.activeHoursStart)}
              </span>
            </div>
          </NextBreakTimer>
        )}
        {blockingEvent && !preferences.isPaused && !isOutsideActiveHours && (
          <NextBreakTimer style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
            <BreakIcon>📅</BreakIcon>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600 }}>In meeting - breaks paused</span>
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                {blockingEvent.summary} until {new Date(blockingEvent.end).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </NextBreakTimer>
        )}
        {!blockingEvent && !isOutsideActiveHours && nextBreakTime && !preferences.isPaused && (
          <NextBreakTimer>
            <BreakIcon>{nextBreakType === 'long' ? '☕' : '⚡'}</BreakIcon>
            <span>
              Next {nextBreakType === 'long' ? 'long' : 'quick'} break in {nextBreakTime}
            </span>
          </NextBreakTimer>
        )}
        {preferences.isPaused && (
          <NextBreakTimer>
            <BreakIcon>⏸️</BreakIcon>
            <span>Breaks paused</span>
          </NextBreakTimer>
        )}
      </Header>

      {/* Prominent Pause Control */}
      <PauseControl
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PauseLabel>
          <PauseIcon>{preferences.isPaused ? '▶️' : '⏸️'}</PauseIcon>
          <PauseText>
            <PauseTitle>
              {preferences.isPaused ? 'Resume Breaks' : 'Pause Breaks'}
            </PauseTitle>
            <PauseDescription>
              {preferences.isPaused 
                ? 'Start showing break reminders again' 
                : 'Temporarily stop all break reminders'}
            </PauseDescription>
          </PauseText>
        </PauseLabel>
        <Switch
          checked={preferences.isPaused}
          onChange={(checked) => onUpdate({ isPaused: checked })}
        />
      </PauseControl>

      {/* Collapsible Settings Sections */}
      <DrillRowsContainer>
        <DrillRow
          icon="⚡"
          title="Quick Breaks"
          subtitle="Frequent short breaks for eyes & posture"
          summary={getQuickBreakSummary()}
        >
          <Setting>
            <SettingHeader>
              <SettingLabel>Break Interval</SettingLabel>
              <SettingValue>
                {preferences.quickBreakInterval < 1 
                  ? `${Math.round(preferences.quickBreakInterval * 60)} seconds` 
                  : `${preferences.quickBreakInterval} minutes`}
              </SettingValue>
            </SettingHeader>
            <SettingDescription>
              How often to show quick break reminders
            </SettingDescription>
            <Slider
              min={0.25}
              max={60}
              step={0.25}
              value={preferences.quickBreakInterval}
              onChange={(value) => onUpdate({ quickBreakInterval: value })}
            />
          </Setting>

          <Setting>
            <SettingHeader>
              <SettingLabel>Break Duration</SettingLabel>
              <SettingValue>{preferences.quickBreakDuration} seconds</SettingValue>
            </SettingHeader>
            <SettingDescription>
              How long each quick break lasts
            </SettingDescription>
            <Slider
              min={5}
              max={30}
              step={5}
              value={preferences.quickBreakDuration}
              onChange={(value) => onUpdate({ quickBreakDuration: value })}
            />
          </Setting>
        </DrillRow>

        <DrillRow
          icon="☕"
          title="Long Breaks"
          subtitle="Extended breaks for movement & rest"
          summary={getLongBreakSummary()}
        >
          <Setting>
            <SettingHeader>
              <SettingLabel>Break Interval</SettingLabel>
              <SettingValue>{preferences.longBreakInterval} minutes</SettingValue>
            </SettingHeader>
            <SettingDescription>
              How often to show long break reminders
            </SettingDescription>
            <Slider
              min={15}
              max={120}
              step={5}
              value={preferences.longBreakInterval}
              onChange={(value) => onUpdate({ longBreakInterval: value })}
            />
          </Setting>

          <Setting>
            <SettingHeader>
              <SettingLabel>Break Duration</SettingLabel>
              <SettingValue>
                {Math.floor(preferences.longBreakDuration / 60)} minutes {preferences.longBreakDuration % 60} seconds
              </SettingValue>
            </SettingHeader>
            <SettingDescription>
              How long each long break lasts
            </SettingDescription>
            <Slider
              min={60}
              max={900}
              step={30}
              value={preferences.longBreakDuration}
              onChange={(value) => onUpdate({ longBreakDuration: value })}
            />
          </Setting>
        </DrillRow>

        <DrillRow
          icon="📅"
          title={strings.settings.calendar.title}
          subtitle="Auto-pause during calendar events"
          summary={getCalendarSummary()}
        >
          <CalendarStatus>
            <StatusDot connected={preferences.googleCalendarEnabled} />
            <StatusText>
              {preferences.googleCalendarEnabled 
                ? strings.settings.calendar.connected 
                : strings.settings.calendar.notConnected}
            </StatusText>
          </CalendarStatus>
          
          <SettingDescription style={{ marginBottom: tokens.spacing[3] }}>
            {strings.settings.calendar.description}
          </SettingDescription>
          
          {!preferences.googleCalendarEnabled ? (
            <>
              <SettingDescription style={{ fontStyle: 'italic', marginBottom: tokens.spacing[3] }}>
                {strings.settings.calendar.authInstructions}
              </SettingDescription>
              <Button 
                variant="primary" 
                size="small"
                onClick={handleGoogleConnect}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Connecting...' : strings.settings.calendar.connectButton}
              </Button>
            </>
          ) : (
            <>
              <Setting>
                <SettingHeader>
                  <SettingLabel>Pause During Meetings</SettingLabel>
                  <Switch
                    checked={preferences.pauseDuringMeetings}
                    onChange={(checked) => onUpdate({ pauseDuringMeetings: checked })}
                  />
                </SettingHeader>
                <SettingDescription>
                  Automatically skip breaks when you're in a calendar meeting
                </SettingDescription>
              </Setting>

              <div style={{ display: 'flex', gap: '8px', marginTop: tokens.spacing[4] }}>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={handleViewBlockedTimes}
                >
                  📅 View Blocked Times
                </Button>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={handleGoogleDisconnect}
                >
                  {strings.settings.calendar.disconnectButton}
                </Button>
              </div>
            </>
          )}
        </DrillRow>

        <DrillRow
          icon="🕐"
          title="Active Hours"
          subtitle="Only show breaks during work hours"
          summary={getActiveHoursSummary()}
        >
          <Setting>
            <SettingHeader>
              <SettingLabel>Enable Active Hours</SettingLabel>
              <Switch
                checked={preferences.activeHoursEnabled}
                onChange={(checked) => onUpdate({ activeHoursEnabled: checked })}
              />
            </SettingHeader>
            <SettingDescription>
              Only schedule breaks during your active hours. Uses your computer's local time zone.
            </SettingDescription>
          </Setting>

          {preferences.activeHoursEnabled && (
            <>
              <Setting>
                <SettingHeader>
                  <SettingLabel>Start Time</SettingLabel>
                  <SettingValue>{formatHour(preferences.activeHoursStart)}</SettingValue>
                </SettingHeader>
                <Select
                  value={String(preferences.activeHoursStart)}
                  onChange={(value) => onUpdate({ activeHoursStart: Number(value) })}
                  options={hourOptions}
                />
              </Setting>

              <Setting>
                <SettingHeader>
                  <SettingLabel>End Time</SettingLabel>
                  <SettingValue>{formatHour(preferences.activeHoursEnd)}</SettingValue>
                </SettingHeader>
                <Select
                  value={String(preferences.activeHoursEnd)}
                  onChange={(value) => onUpdate({ activeHoursEnd: Number(value) })}
                  options={hourOptions}
                />
              </Setting>
            </>
          )}
        </DrillRow>

        <DrillRow
          icon="⚙️"
          title="App Settings"
          subtitle="Appearance & launch behavior"
          summary={preferences.startAtLogin ? 'Auto-start' : 'Manual start'}
        >
          <Setting>
            <SettingHeader>
              <SettingLabel>Theme</SettingLabel>
            </SettingHeader>
            <SettingDescription>
              Choose your preferred color scheme
            </SettingDescription>
            <Select
              value={preferences.theme}
              onChange={(value) => onUpdate({ theme: value as 'light' | 'dark' | 'system' })}
              options={[
                { value: 'system', label: '🖥️ System (Auto)' },
                { value: 'light', label: '☀️ Light' },
                { value: 'dark', label: '🌙 Dark' }
              ]}
            />
          </Setting>

          <Setting>
            <SettingHeader>
              <SettingLabel>Break End Sound</SettingLabel>
              <Switch
                checked={preferences.soundEnabled}
                onChange={(checked) => onUpdate({ soundEnabled: checked })}
              />
            </SettingHeader>
            <SettingDescription>
              Play a gentle chime when breaks complete
            </SettingDescription>
          </Setting>

          <Setting>
            <SettingHeader>
              <SettingLabel>{strings.settings.general.startAtLogin}</SettingLabel>
              <Switch
                checked={preferences.startAtLogin}
                onChange={(checked) => onUpdate({ startAtLogin: checked })}
              />
            </SettingHeader>
            <SettingDescription>
              Automatically launch Chill when you log in
            </SettingDescription>
          </Setting>

          <Setting>
            <SettingDescription style={{ marginBottom: tokens.spacing[3] }}>
              Quit the application completely. Chill will stop running and won't show break reminders until you launch it again.
            </SettingDescription>
            <Button 
              variant="secondary" 
              size="medium"
              onClick={handleQuitApp}
              style={{ 
                width: '100%',
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[700],
                border: `1px solid ${tokens.colors.neutral[300]}`
              }}
            >
              🚪 Quit App
            </Button>
          </Setting>
        </DrillRow>
      </DrillRowsContainer>

      {/* Events Modal */}
      {showEventsModal && (
        <ModalOverlay onClick={() => setShowEventsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>📅 Upcoming Calendar Events</h2>
              <CloseButton onClick={() => setShowEventsModal(false)}>✕</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              {loadingEvents ? (
                <LoadingMessage>Loading events...</LoadingMessage>
              ) : calendarEvents.length === 0 ? (
                <EmptyMessage>
                  <span style={{ fontSize: '48px' }}>📭</span>
                  <p>No upcoming events in the next 24 hours</p>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Breaks will run normally
                  </p>
                </EmptyMessage>
              ) : (
                <EventsList>
                  {calendarEvents.map((event, index) => (
                    <EventCard key={index} skipped={event.skipped}>
                      <EventTitle>{event.summary}</EventTitle>
                      <EventTime>
                        {new Date(event.start).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                        {' → '}
                        {new Date(event.end).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </EventTime>
                      {event.skipped && (
                        <SkipBadge>
                          ✓ {event.skipReason}
                        </SkipBadge>
                      )}
                    </EventCard>
                  ))}
                </EventsList>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};
