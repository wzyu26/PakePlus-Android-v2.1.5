import { TimerMode } from './types';

export const TIMER_CONFIG = {
  [TimerMode.FOCUS]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
};

export const BG_COLORS = {
  [TimerMode.FOCUS]: 'bg-rose-500',
  [TimerMode.SHORT_BREAK]: 'bg-teal-500',
  [TimerMode.LONG_BREAK]: 'bg-indigo-500',
};

export const RING_COLORS = {
  [TimerMode.FOCUS]: '#f43f5e',       // rose-500
  [TimerMode.SHORT_BREAK]: '#14b8a6', // teal-500
  [TimerMode.LONG_BREAK]: '#6366f1',  // indigo-500
};
