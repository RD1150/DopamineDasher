import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AutoFreezeDetectionProps {
  inactivityThreshold?: number; // milliseconds before triggering (default 10 seconds)
}

export default function AutoFreezeDetection({ inactivityThreshold = 10000 }: AutoFreezeDetectionProps) {
  const [showBreathingOverlay, setShowBreathingOverlay] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  // Breathing animation: 4-7-8 pattern (inhale 4s, hold 7s, exhale 8s)
  const breathingVariants = {
    inhale: {
      scale: 1.2,
      opacity: 0.8,
      transition: { duration: 4, ease: 'easeInOut' },
    },
    hold: {
      scale: 1.2,
      opacity: 0.8,
      transition: { duration: 7, ease: 'easeInOut' },
    },
    exhale: {
      scale: 1,
      opacity: 0.4,
      transition: { duration: 8, ease: 'easeInOut' },
    },
  };

  // Reset inactivity timer on any user interaction
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    const newTimer = setTimeout(() => {
      setShowBreathingOverlay(true);
    }, inactivityThreshold);

    setInactivityTimer(newTimer);
  };

  // Set up event listeners for user activity
  useEffect(() => {
    // Start initial timer
    resetInactivityTimer();

    // Listen for user interactions
    const handleActivity = () => {
      // If overlay is already showing, don't reset timer on activity
      if (!showBreathingOverlay) {
        resetInactivityTimer();
      }
    };

    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityThreshold, showBreathingOverlay]);

  const dismissOverlay = () => {
    setShowBreathingOverlay(false);
    // Reset timer after dismissing
    resetInactivityTimer();
  };

  return (
    <AnimatePresence>
      {showBreathingOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50"
          onClick={dismissOverlay}
        >
          {/* Breathing Circle */}
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center"
            animate={['inhale', 'hold', 'exhale']}
            variants={breathingVariants}
            transition={{
              repeat: Infinity,
              repeatType: 'sequence',
            }}
          >
            {/* Inner circle for depth */}
            <div className="w-24 h-24 rounded-full bg-primary/10" />
          </motion.div>

          {/* Subtle text hint */}
          <motion.p
            className="mt-8 text-sm text-muted-foreground text-center max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Just breathe. No rush.
          </motion.p>

          {/* Dismiss button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              dismissOverlay();
            }}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
