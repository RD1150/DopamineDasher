import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusMusicProps {
  isActive: boolean;
  onToggle?: (enabled: boolean) => void;
}

export default function FocusMusic({ isActive, onToggle }: FocusMusicProps) {
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Ambient music tracks - soft, non-intrusive background music
  const ambientTracks = [
    'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/dayfox-weeknds-122592.mp3', // Weeknds - chill
    'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/fassounds-lofi-study-calm-peaceful-chill-hop-112191.mp3', // Lo-fi study
  ];

  useEffect(() => {
    if (!audioRef.current) return;

    if (isActive && isMusicEnabled) {
      // Play ambient music at low volume
      audioRef.current.volume = 0.35; // Background level
      audioRef.current.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    } else {
      // Fade out and pause
      if (audioRef.current.volume > 0) {
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
          } else {
            clearInterval(fadeInterval);
            audioRef.current?.pause();
          }
        }, 100);
      } else {
        audioRef.current.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isActive, isMusicEnabled]);

  const handleToggle = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    onToggle?.(newState);
    localStorage.setItem('focusMusicEnabled', newState ? 'true' : 'false');
  };

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('focusMusicEnabled');
    if (saved !== null) {
      setIsMusicEnabled(saved === 'true');
    }
  }, []);

  return (
    <>
      {/* Hidden audio element for ambient music */}
      <audio
        ref={audioRef}
        src={ambientTracks[0]}
        loop
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Music toggle button */}
      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="absolute top-4 right-4 z-10"
          title={isMusicEnabled ? 'Mute focus music' : 'Enable focus music'}
        >
          {isMusicEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>
      )}
    </>
  );
}
