import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { tokens } from '@/theme/tokens';

interface CircularProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  useGradient?: boolean;
}

const Container = styled.div<{ size: number }>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const SVG = styled.svg`
  transform: rotate(-90deg);
`;

const BackgroundCircle = styled.circle`
  fill: none;
  stroke-linecap: round;
`;

const ProgressCircle = styled(motion.circle)`
  fill: none;
  stroke-linecap: round;
`;

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 4,
  color = tokens.colors.primary[500],
  backgroundColor = tokens.colors.primary[100],
  gradientStart = tokens.colors.accent[500],
  gradientEnd = tokens.colors.pink[500],
  useGradient = false
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Container size={size}>
      <SVG width={size} height={size}>
        {useGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
          </defs>
        )}
        <BackgroundCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <ProgressCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={useGradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1,
            ease: 'linear'
          }}
        />
      </SVG>
    </Container>
  );
};
