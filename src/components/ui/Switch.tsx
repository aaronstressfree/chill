import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { tokens } from '@/theme/tokens';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Container = styled.label<{ disabled: boolean }>`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const Track = styled.div<{ checked: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.checked 
    ? tokens.colors.accent[500] 
    : tokens.colors.neutral[300]};
  border-radius: ${tokens.borderRadius.full};
  transition: background-color ${tokens.transitions.fast} ease;

  [data-theme="dark"] &,
  html.dark & {
    background: ${props => props.checked 
      ? tokens.colors.accent[500] 
      : tokens.colors.neutral[600]};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${props => props.checked 
        ? tokens.colors.accent[500] 
        : tokens.colors.neutral[600]};
    }
  }
`;

const Thumb = styled(motion.div)`
  position: absolute;
  top: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: ${tokens.borderRadius.full};
  box-shadow: ${tokens.shadows.sm};
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  disabled = false 
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <Container disabled={disabled} onClick={(e) => e.stopPropagation()}>
      <HiddenInput
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <Track checked={checked} />
      <Thumb
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </Container>
  );
};
