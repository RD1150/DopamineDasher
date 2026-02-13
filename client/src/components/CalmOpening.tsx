import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';

interface CalmOpeningProps {
  onComplete?: () => void;
}

export default function CalmOpening({ onComplete }: CalmOpeningProps) {
  const [phase, setPhase] = useState<'greeting' | 'pause' | 'ready'>('greeting');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play opening music
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio autoplay may be blocked, that's okay
      });
    }

    // Phase 1: Show "It's okay" for 2 seconds
    const phase1Timer = setTimeout(() => {
      setPhase('pause');
    }, 2000);

    return () => clearTimeout(phase1Timer);
  }, []);

  useEffect(() => {
    if (phase === 'pause') {
      // Phase 2: Quiet pause for 2-3 seconds
      const phase2Timer = setTimeout(() => {
        setPhase('ready');
      }, 2500);

      return () => clearTimeout(phase2Timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'ready') {
      // Phase 3: Show ready message, then complete after 2 seconds
      const phase3Timer = setTimeout(() => {
        // Fade out music
        if (audioRef.current) {
          audioRef.current.pause();
        }
        onComplete?.();
      }, 2000);

      return () => clearTimeout(phase3Timer);
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 overflow-hidden">
        {/* Opening Music */}
        <audio
          ref={audioRef}
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/vwjZmpNajZiqgvDL.mp3"
          loop
          className="hidden"
        />

        {/* Calm background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-8 px-4">
          {/* Mascot - calm pose */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-32 h-32"
          >
            <Mascot pose="rest" className="w-full h-full" />
          </motion.div>

          {/* Phase 1: "It's okay" */}
          <AnimatePresence mode="wait">
            {phase === 'greeting' && (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-2"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  It's okay.
                </h1>
                <p className="text-muted-foreground text-lg">
                  No pressure right now.
                </p>
              </motion.div>
            )}

            {/* Phase 2: Quiet pause - just breathing space */}
            {phase === 'pause' && (
              <motion.div
                key="pause"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="space-y-4">
                  {/* Gentle breathing indicator */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 mx-auto rounded-full bg-primary/10 border-2 border-primary/20"
                  />
                  <p className="text-sm text-muted-foreground">
                    Take a moment...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Phase 3: Ready message */}
            {phase === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-3"
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  When you're ready,
                </h2>
                <p className="text-lg text-muted-foreground">
                  we'll touch one small thing.
                </p>
                <p className="text-sm text-muted-foreground/70 pt-2">
                  No rush. You can stop anytime.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator - minimal */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 text-muted-foreground/50 text-xs"
          >
            {phase === 'ready' && 'Loading...'}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
