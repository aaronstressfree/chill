export const tokens = {
  colors: {
    // Accent colors (indigo/purple from website)
    accent: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',  // Primary accent
      600: '#4F46E5',  // Hover state
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81'
    },
    // Alias for backward compatibility
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81'
    },
    // Pink for gradients
    pink: {
      400: '#F472B6',
      500: '#EC4899',
      600: '#DB2777'
    },
    // Neutral colors (grays)
    neutral: {
      0: '#FFFFFF',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#000000'
    },
    // Dark mode colors (from website)
    dark: {
      background: '#0A0E12',
      surface: '#131921',
      surfaceElevated: '#1A2332',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.15)'
    },
    // Light mode colors
    light: {
      background: '#FFFFFF',
      surface: '#F8F9FA',
      surfaceElevated: '#FFFFFF',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(0, 0, 0, 0.15)'
    },
    // Text colors
    text: {
      dark: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        tertiary: 'rgba(255, 255, 255, 0.5)'
      },
      light: {
        primary: '#0A0E12',
        secondary: 'rgba(10, 14, 18, 0.7)',
        tertiary: 'rgba(10, 14, 18, 0.5)'
      }
    },
    success: {
      light: '#52c41a',
      main: '#389e0d',
      dark: '#237804'
    },
    warning: {
      light: '#faad14',
      main: '#d48806',
      dark: '#ad6800'
    },
    error: {
      light: '#ff4d4f',
      main: '#cf1322',
      dark: '#a8071a'
    }
  },
  
  typography: {
    fontFamily: {
      base: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Menlo, Consolas, "Courier New", monospace'
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    7: '1.75rem',  // 28px
    8: '2rem',     // 32px
    9: '2.25rem',  // 36px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
    40: '10rem',   // 160px
    48: '12rem',   // 192px
    56: '14rem',   // 224px
    64: '16rem'    // 256px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  },
  
  transitions: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};
