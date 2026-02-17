import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/Mascot';
import { Play, Pause, X, CheckCircle2, CloudRain, Trees, Waves, StopCircle } from 'lucide-react';
import { soundManager } from '@/lib/sound';
import { useStore } from '@/lib/store';
import MicroTryPrompt from '@/components/MicroTryPrompt';
import FocusMusic from '@/components/FocusMusic';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  onComplete: () => void;
  taskDuration?: number;
  userState?: 'squirrel' | 'tired' | 'focused' | 'hurting';
  encouragementMessage?: string;
}

export default function FocusMode({ isOpen, onClose, taskName, onComplete, taskDuration = 15, userState, encouragementMessage }: FocusModeProps) {
  const microTryMode = useStore((state) => state.microTryMode);
  const continueMicroTry = useStore((state) => state.continueMicroTry);
  const endMicroTry = useStore((state) => state.endMicroTry);
  const momentumMode = useStore((state) => state.momentumMode);
  
  const [timeLeft, setTimeLeft] = useState((taskDuration || 15) * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMicroTryPrompt, setShowMicroTryPrompt] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [userIsActive, setUserIsActive] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const encouragementMessages = [
    "You've got this! 💪",
    "Take your time, I'll be here! ✨",
    "No rush, just breathe 🌬️",
    "You're doing amazing! 🎉",
    "Come back whenever you're ready 💚",
    "I believe in you! 🚀",
    "Rest is productive too 🧘"
  ];

  const getRandomEncouragement = () => {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      soundManager.playSuccess();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      if (microTryMode) {
        setTimeLeft(2 * 60);
      } else {
        setTimeLeft((taskDuration || 15) * 60);
      }
      setIsActive(false);
    }
  }, [isOpen, microTryMode, taskDuration]);

  // Handle micro-try timer reaching 2 minutes
  useEffect(() => {
    if (microTryMode && timeLeft === 0) {
      setIsActive(false);
      soundManager.playSuccess();
      
      // If Momentum mode is enabled and user is active, auto-continue
      if (momentumMode && userIsActive) {
        continueMicroTry();
        setTimeLeft(15 * 60);
        setIsActive(true);
      } else {
        setShowMicroTryPrompt(true);
      }
    }
  }, [microTryMode, timeLeft, momentumMode, userIsActive, continueMicroTry]);

  // Activity detection
  useEffect(() => {
    const handleActivity = () => {
      setLastActivityTime(Date.now());
      setUserIsActive(true);
    };

    if (isOpen && isActive) {
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('touchstart', handleActivity);

      // Check if user has been inactive for more than 3 seconds
      const inactivityTimer = setInterval(() => {
        if (Date.now() - lastActivityTime > 3000) {
          setUserIsActive(false);
        }
      }, 1000);

      return () => {
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
        clearInterval(inactivityTimer);
      };
    }
  }, [isOpen, isActive, lastActivityTime]);

  const handleStopAnytime = () => {
    soundManager.playPop();
    if (microTryMode) {
      endMicroTry();
    }
    onClose();
  };

  const handleMicroTryContinue = () => {
    continueMicroTry();
    setShowMicroTryPrompt(false);
    setTimeLeft(15 * 60); // Reset to full 15 minutes
    setIsActive(true);
  };

  const handleMicroTryStop = () => {
    endMicroTry();
    setShowMicroTryPrompt(false);
    onComplete();
    onClose();
  };

  const handleMicroTryContinueAuto = () => {
    continueMicroTry();
    setTimeLeft(15 * 60);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isActive && !isPaused) {
      // Starting timer
      setIsActive(true);
      setIsPaused(false);
    } else if (isActive) {
      // Pausing timer
      setIsActive(false);
      setIsPaused(true);
      setShowEncouragement(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => setShowEncouragement(false), 3000);
    } else if (isPaused) {
      // Resuming timer
      setIsActive(true);
      setIsPaused(false);
      setShowEncouragement(false);
    }
    soundManager.playPop();
  };

  const toggleAmbient = (type: 'white_noise' | 'rain' | 'forest') => {
    soundManager.playAmbient(type);
  };

  // Stop ambient sound when closing
  useEffect(() => {
    if (!isOpen) {
      soundManager.stopAmbient();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
      >
        {/* Focus Music */}
        <FocusMusic isActive={isActive} />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="text-center space-y-8 max-w-md w-full">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Focus Mode</h2>
            <h3 className="text-2xl font-bold text-foreground">{taskName}</h3>
          </div>

          {/* Mascot "Working" */}
          <div className="relative w-48 h-48 mx-auto">
            <Mascot pose={isActive ? "hero" : "waiting"} className="w-full h-full" />
            {isActive && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -right-4 top-0 bg-card border shadow-sm px-3 py-1 rounded-full text-xs font-medium"
                >
                  I'm working too!
                </motion.div>
                {/* Typing/Working Animation Overlay */}
                <motion.div
                  className="absolute bottom-0 right-8 text-2xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ⌨️
                </motion.div>
              </>
            )}
          </div>

          {/* Timer */}
          <div className="text-center space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">{microTryMode ? 'Try for 2 minutes' : 'Time remaining'}</p>
            <div className="text-7xl font-mono font-bold tabular-nums tracking-tight text-primary">
              {formatTime(timeLeft)}
            </div>
            {momentumMode && microTryMode && isActive && (
              <p className="text-xs text-primary/70 animate-pulse">Momentum mode active ✨</p>
            )}
          </div>

          {/* Ambient Sounds */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => toggleAmbient('white_noise')}
              className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="White Noise"
            >
              <Waves className="w-5 h-5" />
            </button>
            <button 
              onClick={() => toggleAmbient('rain')}
              className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Rain"
            >
              <CloudRain className="w-5 h-5" />
            </button>
            <button 
              onClick={() => toggleAmbient('forest')}
              className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Forest"
            >
              <Trees className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant={isActive || isPaused ? "secondary" : "default"}
                className="rounded-full w-16 h-16 p-0"
                onClick={toggleTimer}
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>
              
              {showEncouragement && isPaused && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
                >
                  {getRandomEncouragement()}
                </motion.div>
              )}
              
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-16 px-8 gap-2 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary"
                onClick={() => {
                  onComplete();
                  onClose();
                }}
              >
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Done!
              </Button>
            </div>
            
            {/* Add 5 Minutes Button */}
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={() => setTimeLeft(prev => prev + (5 * 60))}
            >
              +5 min
            </Button>
            
            {/* Stop Anytime Button */}
            <Button
              size="sm"
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleStopAnytime}
            >
              <StopCircle className="w-4 h-4" />
              Stop anytime
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Micro-Try Prompt */}
      <MicroTryPrompt
        isOpen={showMicroTryPrompt}
        onContinue={handleMicroTryContinue}
        onStop={handleMicroTryStop}
        taskName={taskName}
      />
    </AnimatePresence>
  );
}
