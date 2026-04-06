import { Global, css } from '@emotion/react';
import { tokens } from './tokens';

const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  /* Light mode (default) */
  body {
    font-family: ${tokens.typography.fontFamily.base};
    font-size: ${tokens.typography.fontSize.base};
    line-height: ${tokens.typography.lineHeight.normal};
    color: ${tokens.colors.text.light.primary};
    background-color: ${tokens.colors.light.background};
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${tokens.typography.fontWeight.semibold};
    line-height: ${tokens.typography.lineHeight.tight};
    margin-bottom: ${tokens.spacing[3]};
    letter-spacing: -0.02em;
  }

  h1 {
    font-size: ${tokens.typography.fontSize['4xl']};
    font-weight: ${tokens.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${tokens.typography.fontSize['3xl']};
    font-weight: ${tokens.typography.fontWeight.bold};
  }

  h3 {
    font-size: ${tokens.typography.fontSize['2xl']};
    font-weight: ${tokens.typography.fontWeight.semibold};
  }

  h4 {
    font-size: ${tokens.typography.fontSize.xl};
  }

  h5 {
    font-size: ${tokens.typography.fontSize.lg};
  }

  h6 {
    font-size: ${tokens.typography.fontSize.base};
  }

  p {
    margin-bottom: ${tokens.spacing[4]};
    line-height: 1.7;
  }

  a {
    color: ${tokens.colors.accent[500]};
    text-decoration: none;
    transition: color ${tokens.transitions.fast} ease;

    &:hover {
      color: ${tokens.colors.pink[500]};
    }

    &:active {
      color: ${tokens.colors.accent[600]};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    transition: all ${tokens.transitions.base} ease;
    border: none;
  }

  input,
  textarea,
  select {
    font-family: inherit;
    font-size: inherit;
  }

  ::selection {
    background-color: ${tokens.colors.accent[500]};
    color: white;
  }

  ::-moz-selection {
    background-color: ${tokens.colors.accent[500]};
    color: white;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${tokens.colors.light.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: ${tokens.borderRadius.full};

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  .drag-region {
    -webkit-app-region: drag;
    -webkit-user-select: none;
    user-select: none;
  }

  .no-drag {
    -webkit-app-region: no-drag;
  }

  /* Gradient text utility */
  .gradient-text {
    background: linear-gradient(135deg, ${tokens.colors.accent[500]} 0%, ${tokens.colors.pink[500]} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Dark mode - using data-theme for manual control */
  [data-theme="dark"],
  html.dark {
    body {
      color: ${tokens.colors.text.dark.primary};
      background-color: ${tokens.colors.dark.background};
    }

    ::-webkit-scrollbar-track {
      background: ${tokens.colors.dark.surface};
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  /* Fallback for system preference when no theme is set */
  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) {
      body {
        color: ${tokens.colors.text.dark.primary};
        background-color: ${tokens.colors.dark.background};
      }

      ::-webkit-scrollbar-track {
        background: ${tokens.colors.dark.surface};
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const GlobalStyles = () => <Global styles={globalStyles} />;
