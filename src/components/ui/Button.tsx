import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { tokens } from '@/theme/tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}

const StyledButton = styled(motion.button)<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${tokens.spacing[2]};
  border: none;
  border-radius: ${tokens.borderRadius.md};
  font-weight: ${tokens.typography.fontWeight.medium};
  transition: all ${tokens.transitions.base} ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  position: relative;
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: ${tokens.spacing[2]} ${tokens.spacing[4]};
          font-size: ${tokens.typography.fontSize.sm};
        `;
      case 'large':
        return `
          padding: ${tokens.spacing[4]} ${tokens.spacing[7]};
          font-size: ${tokens.typography.fontSize.lg};
        `;
      default:
        return `
          padding: ${tokens.spacing[3]} ${tokens.spacing[6]};
          font-size: ${tokens.typography.fontSize.base};
        `;
    }
  }}
  
  /* Style variants */
  ${props => {
    switch (props.variant) {
      case 'gradient':
        return `
          background: linear-gradient(135deg, ${tokens.colors.accent[500]} 0%, ${tokens.colors.pink[500]} 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: ${tokens.colors.light.surfaceElevated};
          color: ${tokens.colors.text.light.primary};
          border: 1px solid ${tokens.colors.light.border};
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.light.surface};
            border-color: ${tokens.colors.light.borderHover};
          }
          
          [data-theme="dark"] &,
          html.dark & {
            background: ${tokens.colors.dark.surfaceElevated};
            color: ${tokens.colors.text.dark.primary};
            border-color: ${tokens.colors.dark.border};
            
            &:hover:not(:disabled) {
              background: ${tokens.colors.dark.surface};
              border-color: ${tokens.colors.dark.borderHover};
            }
          }
          
          @media (prefers-color-scheme: dark) {
            html:not([data-theme]) & {
              background: ${tokens.colors.dark.surfaceElevated};
              color: ${tokens.colors.text.dark.primary};
              border-color: ${tokens.colors.dark.border};
              
              &:hover:not(:disabled) {
                background: ${tokens.colors.dark.surface};
                border-color: ${tokens.colors.dark.borderHover};
              }
            }
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${tokens.colors.accent[500]};
          
          &:hover:not(:disabled) {
            background: rgba(99, 102, 241, 0.1);
          }
          
          &:active:not(:disabled) {
            background: rgba(99, 102, 241, 0.15);
          }
        `;
      default:
        return `
          background: ${tokens.colors.accent[500]};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.accent[600]};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            background: ${tokens.colors.accent[700]};
            transform: translateY(0);
          }
        `;
    }
  }}
`;

export const Button: React.FC<
  ButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style'> & { style?: React.CSSProperties }
> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
