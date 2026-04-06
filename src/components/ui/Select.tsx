import React from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/theme/tokens';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledSelect = styled.select<{ disabled?: boolean }>`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  padding-right: ${tokens.spacing[10]};
  font-size: ${tokens.typography.fontSize.base};
  font-family: ${tokens.typography.fontFamily.base};
  color: ${tokens.colors.text.light.primary};
  background: ${tokens.colors.light.surfaceElevated};
  border: 1px solid ${tokens.colors.light.border};
  border-radius: ${tokens.borderRadius.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all ${tokens.transitions.base} ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  color-scheme: light;

  option {
    background: ${tokens.colors.light.surfaceElevated};
    color: ${tokens.colors.text.light.primary};
    padding: ${tokens.spacing[2]};
  }

  &:hover:not(:disabled) {
    border-color: ${tokens.colors.light.borderHover};
  }

  &:focus {
    outline: none;
    border-color: ${tokens.colors.accent[500]};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.text.dark.primary};
    background: ${tokens.colors.dark.surfaceElevated};
    border-color: ${tokens.colors.dark.border};
    color-scheme: dark;

    option {
      background: ${tokens.colors.dark.surfaceElevated};
      color: ${tokens.colors.text.dark.primary};
    }

    &:hover:not(:disabled) {
      border-color: ${tokens.colors.dark.borderHover};
    }

    &:focus {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.text.dark.primary};
      background: ${tokens.colors.dark.surfaceElevated};
      border-color: ${tokens.colors.dark.border};
      color-scheme: dark;

      option {
        background: ${tokens.colors.dark.surfaceElevated};
        color: ${tokens.colors.text.dark.primary};
      }

      &:hover:not(:disabled) {
        border-color: ${tokens.colors.dark.borderHover};
      }

      &:focus {
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      }
    }
  }
`;

const ChevronIcon = styled.div`
  position: absolute;
  right: ${tokens.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${tokens.colors.text.light.tertiary};
  font-size: ${tokens.typography.fontSize.sm};
  line-height: 1;

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

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  disabled = false 
}) => {
  return (
    <SelectWrapper>
      <StyledSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      <ChevronIcon>▼</ChevronIcon>
    </SelectWrapper>
  );
};
