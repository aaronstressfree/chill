import { useState, useEffect } from 'react';

export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

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
