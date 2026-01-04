import React from 'react';
import { TimerMode } from '../types';
import { RING_COLORS } from '../constants';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
  isActive: boolean;
}

const MODE_LABELS: Record<TimerMode, string> = {
  [TimerMode.FOCUS]: '专注',
  [TimerMode.SHORT_BREAK]: '短休',
  [TimerMode.LONG_BREAK]: '长休',
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime, mode, isActive }) => {
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative flex items-center justify-center my-8">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-500"
      >
        <circle
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={RING_COLORS[mode]}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-6xl font-bold tracking-tighter ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300 text-white font-mono`}>
          {formattedTime}
        </span>
        <span className="text-white/60 text-lg mt-2 font-medium tracking-widest">
          {MODE_LABELS[mode]}
        </span>
      </div>
    </div>
  );
};