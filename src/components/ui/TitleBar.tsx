import React from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/theme/tokens';

const Container = styled.div`
  height: 38px;
  background: ${tokens.colors.light.surfaceElevated};
  border-bottom: 1px solid ${tokens.colors.light.border};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  -webkit-app-region: drag;
  user-select: none;

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.dark.surfaceElevated};
    border-bottom-color: ${tokens.colors.dark.border};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.dark.surfaceElevated};
      border-bottom-color: ${tokens.colors.dark.border};
    }
  }
`;

const Title = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.text.light.secondary};

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.text.dark.secondary};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.text.dark.secondary};
    }
  }
`;

const WindowControls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: ${tokens.spacing[3]};
  gap: ${tokens.spacing[2]};
  -webkit-app-region: no-drag;
`;

const WindowButton = styled.button`
  width: 12px;
  height: 12px;
  border-radius: ${tokens.borderRadius.full};
  border: none;
  outline: none;
  cursor: pointer;
  transition: opacity ${tokens.transitions.fast} ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &.close {
    background: #ff5f57;
  }
  
  &.minimize {
    background: #ffbd2e;
  }
  
  &.maximize {
    background: #28ca42;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

interface TitleBarProps {
  title: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ title }) => {
  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  return (
    <Container>
      <WindowControls>
        <WindowButton className="close" onClick={handleClose} />
        <WindowButton className="minimize" onClick={handleMinimize} />
        <WindowButton className="maximize" disabled />
      </WindowControls>
      <Title>{title}</Title>
    </Container>
  );
};
