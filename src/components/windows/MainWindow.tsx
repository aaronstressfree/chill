import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/theme/tokens';
import { strings } from '@/constants/strings';
import { TitleBar } from '@/components/ui/TitleBar';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Preferences } from '@/types/electron';
import { ThemeProvider } from '@/theme/ThemeProvider';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 8px;
`;

const PopoverCard = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${tokens.colors.light.surfaceElevated};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24),
              0 2px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid ${tokens.colors.light.border};
  transition: background-color 0.3s ease, border-color 0.3s ease;

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.dark.surfaceElevated};
    border-color: ${tokens.colors.dark.border};
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6),
                0 2px 8px rgba(0, 0, 0, 0.4);
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.dark.surfaceElevated};
      border-color: ${tokens.colors.dark.border};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6),
                  0 2px 8px rgba(0, 0, 0, 0.4);
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const MainWindow: React.FC = () => {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await window.electronAPI.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceUpdate = async (updates: Partial<Preferences>) => {
    if (!preferences) return;

    try {
      const result = await window.electronAPI.updatePreferences(updates);
      if (result.success) {
        setPreferences({ ...preferences, ...updates });
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleReloadPreferences = async () => {
    try {
      const prefs = await window.electronAPI.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to reload preferences:', error);
    }
  };

  if (isLoading || !preferences) {
    return (
      <ThemeProvider theme="system">
        <Container>
          <PopoverCard>
            <TitleBar title={strings.app.name} />
            <Content>
              <LoadingState>Loading...</LoadingState>
            </Content>
          </PopoverCard>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={preferences.theme}>
      <Container>
        <PopoverCard>
          <TitleBar title={strings.app.name} />
          <Content>
            <SettingsPanel
              preferences={preferences}
              onUpdate={handlePreferenceUpdate}
              onReloadPreferences={handleReloadPreferences}
            />
          </Content>
        </PopoverCard>
      </Container>
    </ThemeProvider>
  );
};

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${tokens.colors.neutral[500]};
  font-size: ${tokens.typography.fontSize.lg};
`;
