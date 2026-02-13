import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface DynamicMusicPlayerProps {
  emotionalState?: 'anxious' | 'bored' | 'overwhelmed' | 'energized' | 'sluggish' | 'scattered';
  energyState?: 'focus' | 'energy' | 'momentum' | 'freeze';
}

const MUSIC_TRACKS = {
  // Emotional states (primary)
  anxious: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/fdmtspcOLsXXYPPq.mp3', // Lo-fi Study - FasSounds
  bored: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/vcrYUJCHNMYYjbbP.mp3', // Bounce On It - Alex Grohl
  overwhelmed: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/zIJHPHPLUdfJAFpR.mp3', // Nostalgic Memories - Clavier
  energized: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/vcrYUJCHNMYYjbbP.mp3', // Bounce On It - Alex Grohl
  sluggish: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/JdgMSSGZhctHPrOT.mp3', // Silent Bloom - Paul Yudin
  scattered: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/JsRCCmqtWESWgHWg.mp3', // Minimal Ambient - Mihai Landrei

  // Energy states (fallback)
  focus: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/jMNaKdGZwdHmmfrr.mp3', // Weeknds - Dayfox
  energy: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/vcrYUJCHNMYYjbbP.mp3', // Bounce On It - Alex Grohl
  momentum: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/vcrYUJCHNMYYjbbP.mp3', // Bounce On It - Alex Grohl
  freeze: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026756998/fdmtspcOLsXXYPPq.mp3', // Lo-fi Study - FasSounds
};

export default function DynamicMusicPlayer({ 
  emotionalState,
  energyState = 'focus' 
}: DynamicMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('musicEnabled') !== 'false';
  });
  
  // Determine which track to play (emotional state takes priority)
  const currentTrack = emotionalState 
    ? MUSIC_TRACKS[emotionalState]
    : MUSIC_TRACKS[energyState];

  const [prevTrack, setPrevTrack] = useState<string>(currentTrack);

  // Set up user interaction listener for autoplay policy
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Remove listeners after first interaction
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Switch track when state changes
  useEffect(() => {
    if (currentTrack !== prevTrack && audioRef.current) {
      setPrevTrack(currentTrack);
      audioRef.current.src = currentTrack;
      
      if (isMusicEnabled && userInteracted) {
        audioRef.current.play().catch(() => {
          // Autoplay may be blocked
        });
      }
    }
  }, [currentTrack, prevTrack, isMusicEnabled, userInteracted]);

  // Play/pause based on enabled state
  useEffect(() => {
    if (audioRef.current && userInteracted) {
      if (isMusicEnabled) {
        audioRef.current.play().catch(() => {
          // Autoplay may be blocked
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicEnabled, userInteracted]);

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('musicEnabled', isMusicEnabled ? 'true' : 'false');
  }, [isMusicEnabled]);

  const toggleMusic = () => {
    setUserInteracted(true);
    setIsMusicEnabled(!isMusicEnabled);
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack}
        loop
        className="hidden"
        crossOrigin="anonymous"
      />

      {/* Music toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMusic}
        className="gap-2 text-muted-foreground hover:text-primary"
        title={isMusicEnabled ? 'Music on' : 'Music off'}
      >
        {isMusicEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </Button>
    </>
  );
}
