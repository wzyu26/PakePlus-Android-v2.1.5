import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, BarChart2, X } from 'lucide-react';
import { TimerDisplay } from './components/TimerDisplay';
import { StatsChart } from './components/StatsChart';
import { TimerMode, DailyStats } from './types';
import { TIMER_CONFIG, BG_COLORS } from './constants';

// Simple beep generator
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const MODE_LABELS: Record<TimerMode, string> = {
  [TimerMode.FOCUS]: '专注',
  [TimerMode.SHORT_BREAK]: '短休',
  [TimerMode.LONG_BREAK]: '长休',
};

const App: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  
  // Mock data for charts with Chinese labels
  const [stats] = useState<DailyStats[]>([
    { date: '周一', minutes: 120 },
    { date: '周二', minutes: 150 },
    { date: '周三', minutes: 75 },
    { date: '周四', minutes: 200 },
    { date: '周五', minutes: 100 },
    { date: '周六', minutes: 50 },
    { date: '周日', minutes: 0 },
  ]);

  const intervalRef = useRef<number | null>(null);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode]);
    setIsActive(false);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    if (soundEnabled) playNotificationSound();

    if (mode === TimerMode.FOCUS) {
      // Auto switch to short break suggestion
      switchMode(TimerMode.SHORT_BREAK);
    } else {
      switchMode(TimerMode.FOCUS);
    }
  }, [mode, soundEnabled, switchMode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, handleTimerComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_CONFIG[mode]);
  };

  const currentStatus = isActive 
    ? (mode === TimerMode.FOCUS ? '保持专注...' : '放松一下...') 
    : (timeLeft === 0 ? '完成!' : '准备好了吗?');

  return (
    <div className={`h-[100dvh] transition-colors duration-700 ease-in-out ${BG_COLORS[mode]} flex flex-col items-center justify-between py-12 px-6 font-sans text-white relative overflow-hidden`}>
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[80px]" />
      </div>

      {/* Header/Status */}
      <div className="z-10 text-center mt-4">
         <h1 className="text-2xl font-bold tracking-tight mb-2">极简番茄钟</h1>
         <p className="text-white/60 text-sm animate-fade-in">{currentStatus}</p>
      </div>

      {/* Main Timer Area */}
      <div className="z-10 flex flex-col items-center w-full max-w-sm">
        <TimerDisplay 
          timeLeft={timeLeft} 
          totalTime={TIMER_CONFIG[mode]} 
          mode={mode} 
          isActive={isActive}
        />

        {/* Mode Selectors */}
        <div className="flex gap-3 p-1.5 bg-black/20 rounded-full backdrop-blur-sm mt-8 mb-10">
          {Object.values(TimerMode).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === m ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-900 shadow-xl hover:scale-105 active:scale-95 transition-all"
            aria-label={isActive ? "暂停" : "开始"}
          >
            {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
            aria-label="重置"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer / Utilities */}
      <div className="z-10 flex gap-6 pb-4">
         <button 
           onClick={() => setSoundEnabled(!soundEnabled)} 
           className="p-3 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
           aria-label="声音开关"
         >
           {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
         </button>
         <button 
           onClick={() => setShowStats(true)} 
           className="p-3 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
           aria-label="统计"
         >
           <BarChart2 className="w-6 h-6" />
         </button>
      </div>

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-gray-900 border-t sm:border border-gray-700 p-8 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setShowStats(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-800 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">数据统计</h2>
            <p className="text-gray-400 text-sm mb-6">本周累计专注时长 12.5 小时。</p>
            <StatsChart data={stats} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;