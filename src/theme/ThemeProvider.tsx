import React, { useEffect } from 'react';
import { useColorScheme, ThemePreference } from './useTheme';

interface ThemeProviderProps {
  theme: ThemePreference;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  const colorScheme = useColorScheme(theme);

  useEffect(() => {
    // Apply the theme to the document root
    document.documentElement.setAttribute('data-theme', colorScheme);
    
    // Also set a class for easier styling
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(colorScheme);
  }, [colorScheme]);

  return <>{children}</>;
};
