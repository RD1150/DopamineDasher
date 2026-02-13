import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trophy, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { soundManager } from '@/lib/sound';
import { haptics } from '@/lib/haptics';
import { trpc } from '@/lib/trpc';

interface StreakMilestoneCelebrationProps {
  streakDays: number;
  onClose?: () => void;
}

export default function StreakMilestoneCelebration({
  streakDays,
  onClose,
}: StreakMilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const recordMilestone = trpc.analytics.recordMilestone.useMutation();

  const getMilestoneInfo = (days: number) => {
    if (days === 7) {
      return {
        title: '7-Day Streak! 🔥',
        message: 'You\'re on fire! A week of consistency is incredible.',
        coinReward: 50,
        emoji: '🔥',
      };
    } else if (days === 30) {
      return {
        title: '30-Day Streak! 🚀',
        message: 'A whole month of showing up for yourself. That\'s legendary.',
        coinReward: 200,
        emoji: '🚀',
      };
    } else if (days === 100) {
      return {
        title: '100-Day Streak! 👑',
        message: 'You\'re unstoppable. 100 days of pure dedication.',
        coinReward: 500,
        emoji: '👑',
      };
    }
    return {
      title: `${days}-Day Streak! ⭐`,
      message: `${days} days of consistent progress. You\'re amazing!`,
      coinReward: Math.floor(days * 5),
      emoji: '⭐',
    };
  };

  const milestone = getMilestoneInfo(streakDays);

  useEffect(() => {
    // Play celebration sound
    soundManager.playSuccess();
    haptics.celebrate();

    // Record milestone
    recordMilestone.mutate({
      streakDays,
      coinReward: milestone.coinReward,
    });

    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [streakDays]);

  const handleShare = async () => {
    const text = `🎉 I just hit a ${streakDays}-day streak on Dopamine Dasher! Just start. That's enough. 💪`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dopamine Dasher Streak',
          text,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Streak message copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-card rounded-3xl p-8 max-w-sm mx-4 shadow-2xl border-2 border-primary/20 space-y-6"
      >
        {/* Confetti effect */}
        {showConfetti && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 400 - 200,
                  y: -20,
                  opacity: 1,
                }}
                animate={{
                  x: Math.random() * 400 - 200,
                  y: 400,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.3,
                }}
                className="absolute w-2 h-2 bg-primary rounded-full"
              />
            ))}
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <div className="text-6xl">{milestone.emoji}</div>
        </motion.div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-primary">{milestone.title}</h2>
          <p className="text-muted-foreground">{milestone.message}</p>
        </div>

        {/* Reward */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-primary/10 rounded-2xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <Sparkles className="w-5 h-5" />
            <span>+{milestone.coinReward} Coins</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Continue
          </Button>
        </div>

        {/* Encouragement */}
        <p className="text-xs text-center text-muted-foreground">
          Keep it up! Your next milestone is waiting. 🎯
        </p>
      </motion.div>
    </motion.div>
  );
}
