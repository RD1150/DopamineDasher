import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import Mascot from './Mascot';

interface FreezeModeProps {
  isOpen: boolean;
  onClose: () => void;
  onReady: () => void;
}

export default function FreezeMode({ isOpen, onClose, onReady }: FreezeModeProps) {
  const [phase, setPhase] = useState<'intro' | 'quiet' | 'action'>('intro');

  useEffect(() => {
    if (!isOpen) {
      setPhase('intro');
      return;
    }

    // Phase 1: Show intro message for 2 seconds
    const phase1Timer = setTimeout(() => {
      setPhase('quiet');
    }, 2000);

    return () => clearTimeout(phase1Timer);
  }, [isOpen]);

  useEffect(() => {
    if (phase === 'quiet' && isOpen) {
      // Phase 2: Quiet presence for 10 seconds
      const phase2Timer = setTimeout(() => {
        setPhase('action');
      }, 10000);

      return () => clearTimeout(phase2Timer);
    }
  }, [phase, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full space-y-6 border border-border shadow-xl relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 mx-auto"
            >
              <Mascot pose="rest" className="w-full h-full" />
            </motion.div>

            {/* Phase 1: Intro */}
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-3"
                >
                  <h2 className="text-2xl font-bold">🧊 Frozen?</h2>
                  <p className="text-muted-foreground">
                    Nothing is urgent right now.
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Let's take a moment together.
                  </p>
                </motion.div>
              )}

              {/* Phase 2: Quiet presence */}
              {phase === 'quiet' && (
                <motion.div
                  key="quiet"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6"
                >
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      Just breathing...
                    </p>
                    {/* Breathing animation */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-20 h-20 mx-auto rounded-full bg-primary/10 border-2 border-primary/30"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/60">
                    No timer. No pressure. Just presence.
                  </p>
                </motion.div>
              )}

              {/* Phase 3: Action prompt */}
              {phase === 'action' && (
                <motion.div
                  key="action"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center space-y-4"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Let's reduce one small weight.
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Just one tiny thing. That's all.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Not now
                    </Button>
                    <Button
                      onClick={onReady}
                      className="flex-1"
                    >
                      I'm ready
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
