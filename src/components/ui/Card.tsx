import styled from '@emotion/styled';
import { tokens } from '@/theme/tokens';

export const Card = styled.div`
  background: ${tokens.colors.light.surface};
  border: 1px solid ${tokens.colors.light.border};
  border-radius: ${tokens.borderRadius.lg};
  padding: ${tokens.spacing[6]};
  transition: all ${tokens.transitions.slow} ease;
  
  &:hover {
    background: ${tokens.colors.light.surfaceElevated};
    border-color: ${tokens.colors.light.borderHover};
    transform: translateY(-2px);
  }

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.dark.surface};
    border-color: ${tokens.colors.dark.border};

    &:hover {
      background: ${tokens.colors.dark.surfaceElevated};
      border-color: ${tokens.colors.dark.borderHover};
    }
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.dark.surface};
      border-color: ${tokens.colors.dark.border};

      &:hover {
        background: ${tokens.colors.dark.surfaceElevated};
        border-color: ${tokens.colors.dark.borderHover};
      }
    }
  }
`;
