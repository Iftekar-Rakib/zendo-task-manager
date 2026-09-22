import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Bell, BellOff, Settings2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (notificationEnabled) {
      new Notification(mode === 'focus' ? 'Focus Session Complete!' : 'Break Over!', {
        body: mode === 'focus' ? 'Time to take a breather.' : 'Ready to dive back in?',
      });
    }
    // Simple visual alert if needed
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? customMinutes * 60 : 5 * 60);
  };

  const setFocusMode = (minutes: number) => {
    setMode('focus');
    setIsActive(false);
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
  };

  const setBreakMode = () => {
    setMode('break');
    setIsActive(false);
    setTimeLeft(5 * 60);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationEnabled(permission === 'granted');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus' 
    ? (timeLeft / (customMinutes * 60)) * 100 
    : (timeLeft / (5 * 60)) * 100;

  return (
    <div className="p-6 pb-32 max-w-xl mx-auto h-full flex flex-col justify-center items-center">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-display font-medium text-neutral-900 leading-tight">
          Deep <span className="font-light italic text-neutral-400">Focus</span>
        </h1>
        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-[0.2em] font-mono">Silence the noise</p>
      </header>

      {/* Timer Display */}
      <div className="relative flex justify-center items-center mb-16">
        {/* Progress Ring Background */}
        <svg className="w-80 h-80 -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-neutral-100"
          />
          <motion.circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="942.48"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 942.48 * (1 - progress / 100) }}
            transition={{ type: 'spring', damping: 50, stiffness: 100 }}
            className={mode === 'focus' ? 'text-neutral-900' : 'text-neutral-400'}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl font-display font-bold tabular-nums tracking-tighter">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mt-2">
            {mode === 'focus' ? 'Concentration' : 'Recovery'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6 mb-12">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full border border-neutral-100 hover:bg-neutral-50 transition-colors text-neutral-400"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-xl shadow-neutral-900/20"
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 translate-x-0.5" />}
        </button>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 rounded-full border border-neutral-100 hover:bg-neutral-50 transition-colors text-neutral-400"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="flex space-x-3">
        <button 
          onClick={() => setFocusMode(25)}
          className={`px-6 py-3 rounded-2xl text-xs font-medium transition-all flex items-center space-x-2 ${
            mode === 'focus' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-white border border-neutral-100 text-neutral-500'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Pomodoro</span>
        </button>
        <button 
          onClick={setBreakMode}
          className={`px-6 py-3 rounded-2xl text-xs font-medium transition-all flex items-center space-x-2 ${
            mode === 'break' ? 'bg-neutral-900 text-white shadow-lg' : 'bg-white border border-neutral-100 text-neutral-500'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Short Break</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-12 flex items-center space-x-4">
        <button 
          onClick={requestNotificationPermission}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-[10px] uppercase font-mono tracking-widest transition-all ${
            notificationEnabled ? 'border-neutral-900 text-neutral-900 bg-neutral-50' : 'border-neutral-100 text-neutral-400 hover:border-neutral-200'
          }`}
        >
          {notificationEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          <span>{notificationEnabled ? 'Alerts Active' : 'Enable Alerts'}</span>
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[60] flex items-end justify-center sm:items-center p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 card-shadow"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold font-display italic">Adjust Flow</h3>
                  <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Customize duration</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-neutral-400 hover:text-neutral-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-mono text-neutral-500 uppercase tracking-widest">
                    <span>Duration</span>
                    <span>{customMinutes}m</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="60" 
                    value={customMinutes} 
                    onChange={(e) => {
                      const mins = parseInt(e.target.value);
                      setFocusMode(mins);
                    }}
                    className="w-full accent-neutral-900"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 25, 45, 60].map(m => (
                      <button 
                        key={m}
                        onClick={() => setFocusMode(m)}
                        className={`py-2 rounded-xl text-[10px] font-mono border transition-all ${
                          customMinutes === m ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-neutral-50 border-transparent text-neutral-400'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-neutral-900 text-white rounded-2xl py-4 font-bold text-sm hover:bg-black transition-all"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
