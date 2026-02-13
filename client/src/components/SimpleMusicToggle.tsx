import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Simple music toggle button that controls global audio muting
 * Works by setting the muted property on all audio elements
 */
export default function SimpleMusicToggle() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('audioMuted') === 'true';
  });

  // Apply muted state to all audio elements
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = isMuted;
    });
    localStorage.setItem('audioMuted', isMuted ? 'true' : 'false');
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMute}
      className="gap-2 text-muted-foreground hover:text-primary transition-colors"
      title={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
}
