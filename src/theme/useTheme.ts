import { useState, useEffect } from 'react';
import { tokens } from './tokens';

export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderHover: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  gradientStart: string;
  gradientEnd: string;
}

// Hook to get the system color scheme
const useSystemColorScheme = (): ColorScheme => {
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return systemScheme;
};

// Hook that respects user preference (light/dark/system)
export const useColorScheme = (userPreference: ThemePreference = 'system'): ColorScheme => {
  const systemScheme = useSystemColorScheme();

  if (userPreference === 'system') {
    return systemScheme;
  }
  
  return userPreference;
};

export const useThemeColors = (): ThemeColors => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    background: isDark ? tokens.colors.dark.background : tokens.colors.light.background,
    surface: isDark ? tokens.colors.dark.surface : tokens.colors.light.surface,
    surfaceElevated: isDark ? tokens.colors.dark.surfaceElevated : tokens.colors.light.surfaceElevated,
    border: isDark ? tokens.colors.dark.border : tokens.colors.light.border,
    borderHover: isDark ? tokens.colors.dark.borderHover : tokens.colors.light.borderHover,
    textPrimary: isDark ? tokens.colors.text.dark.primary : tokens.colors.text.light.primary,
    textSecondary: isDark ? tokens.colors.text.dark.secondary : tokens.colors.text.light.secondary,
    textTertiary: isDark ? tokens.colors.text.dark.tertiary : tokens.colors.text.light.tertiary,
    accent: tokens.colors.accent[500],
    accentHover: tokens.colors.accent[600],
    accentLight: `rgba(99, 102, 241, ${isDark ? '0.1' : '0.15'})`,
    gradientStart: tokens.colors.accent[500],
    gradientEnd: tokens.colors.pink[500]
  };
};
