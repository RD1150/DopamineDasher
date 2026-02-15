import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ActivationFlowProps {
  onSelect: (minutes: number) => void;
}

const COMMITMENT_OPTIONS = [
  {
    id: 'two-min',
    label: 'Just 2 minutes',
    minutes: 2,
    preview: "You'll feel lighter.",
    emoji: '🌱',
  },
  {
    id: 'five-min',
    label: 'A quick 5',
    minutes: 5,
    preview: 'Noticeable relief.',
    emoji: '✨',
  },
  {
    id: 'burst',
    label: 'A short burst',
    minutes: 10,
    preview: 'Momentum unlocked.',
    emoji: '🚀',
  },
  {
    id: 'go',
    label: "I'm in — let's go",
    minutes: 15,
    preview: "Let's build flow.",
    emoji: '💪',
  },
];

export default function ActivationFlow({ onSelect }: ActivationFlowProps) {
  const [hesitationTime, setHesitationTime] = useState(0);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    // Detect hesitation - if user hasn't selected after 5 seconds, auto-start 2-minute timer
    const hesitationInterval = setInterval(() => {
      setHesitationTime((prev) => prev + 1);
    }, 1000);

    const autoStartTimer = setTimeout(() => {
      if (!autoStarted) {
        setAutoStarted(true);
        onSelect(2); // Auto-start with 2 minutes
      }
    }, 5000);

    return () => {
      clearInterval(hesitationInterval);
      clearTimeout(autoStartTimer);
    };
  }, [autoStarted, onSelect]);

  const handleSelect = (minutes: number) => {
    setAutoStarted(true);
    onSelect(minutes);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">How small do you want to start?</h2>
          <p className="text-sm text-muted-foreground">
            No pressure. Pick what feels right.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3">
          {COMMITMENT_OPTIONS.map((option, index) => {
            const shouldHighlight = hesitationTime >= 3 && option.id === 'two-min' && !autoStarted;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.minutes)}
                className={`p-4 rounded-lg border-2 transition-all text-left space-y-2 ${
                  shouldHighlight
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/50'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {option.minutes}m
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground italic">{option.preview}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Auto-start indicator */}
        {hesitationTime >= 3 && !autoStarted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center text-muted-foreground"
          >
            Starting in {5 - hesitationTime} seconds...
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
