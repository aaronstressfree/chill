import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { tokens } from '@/theme/tokens';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const Container = styled.div<{ disabled: boolean }>`
  position: relative;
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background: ${tokens.colors.neutral[200]};
  border-radius: ${tokens.borderRadius.full};
  overflow: hidden;

  [data-theme="dark"] &,
  html.dark & {
    background: ${tokens.colors.neutral[700]};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${tokens.colors.neutral[700]};
    }
  }
`;

const Progress = styled.div<{ progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.progress}%;
  background: ${tokens.colors.accent[500]};
  border-radius: ${tokens.borderRadius.full};
  transition: width ${tokens.transitions.fast} ease;
`;

const Thumb = styled.div<{ position: number; isDragging: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => props.position}%;
  transform: translate(-50%, -50%) scale(${props => props.isDragging ? 1.2 : 1});
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid ${tokens.colors.accent[500]};
  border-radius: ${tokens.borderRadius.full};
  box-shadow: ${tokens.shadows.md};
  transition: transform ${tokens.transitions.fast} ease, 
              box-shadow ${tokens.transitions.fast} ease;
  cursor: grab;
  z-index: 10;
  pointer-events: auto;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: ${tokens.shadows.lg};
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const TickMarks = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  pointer-events: none;
`;

const Tick = styled.div<{ active: boolean }>`
  width: 1px;
  height: 8px;
  background: ${props => props.active 
    ? tokens.colors.accent[400] 
    : tokens.colors.neutral[300]};
  opacity: 0.5;

  [data-theme="dark"] &,
  html.dark & {
    background: ${props => props.active 
      ? tokens.colors.accent[400] 
      : tokens.colors.neutral[600]};
  }

  @media (prefers-color-scheme: dark) {
    html:not([data-theme]) & {
      background: ${props => props.active 
        ? tokens.colors.accent[400] 
        : tokens.colors.neutral[600]};
    }
  }
`;

export const Slider: React.FC<SliderProps> = ({ 
  min, 
  max, 
  step = 1, 
  value, 
  onChange,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const progress = ((value - min) / (max - min)) * 100;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e);
  };
  
  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current || disabled) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const percentage = x / rect.width;
    const rawValue = min + (percentage * (max - min));
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.min(Math.max(min, steppedValue), max);
    
    if (clampedValue !== value) {
      onChange(clampedValue);
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, disabled]);
  
  // Calculate tick marks
  const numTicks = Math.floor((max - min) / step) + 1;
  const ticks = Array.from({ length: Math.min(numTicks, 20) }, (_, i) => {
    const tickValue = min + (i * step);
    return tickValue <= value;
  });
  
  return (
    <Container 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      disabled={disabled}
    >
      <Track>
        <Progress progress={progress} />
        {numTicks <= 20 && (
          <TickMarks>
            {ticks.map((active, index) => (
              <Tick key={index} active={active} />
            ))}
          </TickMarks>
        )}
      </Track>
      <Thumb 
        position={progress} 
        isDragging={isDragging}
      />
    </Container>
  );
};
