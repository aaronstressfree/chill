import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/theme/tokens';

const Container = styled.div`
  width: 100%;
  border-radius: ${tokens.borderRadius.lg};
  background: ${tokens.colors.light.surfaceElevated};
  border: 1px solid ${tokens.colors.light.border};
  overflow: hidden;
  transition: all ${tokens.transitions.base};
  
  &:hover {
    border-color: ${tokens.colors.light.borderHover};
    box-shadow: ${tokens.shadows.sm};
  }

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.dark.surfaceElevated};
    border-color: ${tokens.colors.dark.border};

    &:hover {
      border-color: ${tokens.colors.dark.borderHover};
    }
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.dark.surfaceElevated};
      border-color: ${tokens.colors.dark.border};

      &:hover {
        border-color: ${tokens.colors.dark.borderHover};
      }
    }
  }
`;

const Header = styled.button<{ expanded: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${tokens.spacing[4]};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all ${tokens.transitions.base};
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
  
  &:active {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="dark"] &,
  html.dark & {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    &:active {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      &:active {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
  min-width: 0; /* Allow text truncation */
`;

const Icon = styled.span`
  font-size: ${tokens.typography.fontSize.xl};
  line-height: 1;
  flex-shrink: 0;
`;

const HeaderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-size: ${tokens.typography.fontSize.base};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.light.primary};
  margin-bottom: ${tokens.spacing[1]};

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.text.dark.primary};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.text.dark.primary};
    }
  }
`;

const Subtitle = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.text.light.secondary};
  line-height: ${tokens.typography.lineHeight.tight};

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

const Summary = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.accent[600]};
  font-weight: ${tokens.typography.fontWeight.medium};
  margin-top: ${tokens.spacing[1]};

  [data-theme="dark"] &,
  html.dark & {
    color: ${tokens.colors.accent[400]};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      color: ${tokens.colors.accent[400]};
    }
  }
`;

const ChevronIcon = styled(motion.span)`
  font-size: ${tokens.typography.fontSize.xl};
  color: ${tokens.colors.text.light.tertiary};
  line-height: 1;
  flex-shrink: 0;

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

const Content = styled(motion.div)`
  padding: ${tokens.spacing[4]};
  border-top: 1px solid ${tokens.colors.light.border};

  [data-theme="dark"] &,
  html.dark & {
    border-top-color: ${tokens.colors.dark.border};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      border-top-color: ${tokens.colors.dark.border};
    }
  }
`;

interface DrillRowProps {
  icon: string;
  title: string;
  subtitle: string;
  summary?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const DrillRow: React.FC<DrillRowProps> = ({
  icon,
  title,
  subtitle,
  summary,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Container>
      <Header 
        expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <HeaderLeft>
          <Icon>{icon}</Icon>
          <HeaderContent>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
            {summary && !isExpanded && (
              <Summary>{summary}</Summary>
            )}
          </HeaderContent>
        </HeaderLeft>
        
        <ChevronIcon
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </ChevronIcon>
      </Header>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <Content
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </Content>
        )}
      </AnimatePresence>
    </Container>
  );
};

