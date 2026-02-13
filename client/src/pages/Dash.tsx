import Layout from '@/components/Layout';
import Mascot, { MascotPose } from '@/components/Mascot';
import { haptics } from '@/lib/haptics';
import { soundManager } from '@/lib/soundManager';
import { useStore } from '@/lib/store';
import { detectTaskType, getOutfitForTaskType } from '@/lib/taskTypeDetector';
import { cn } from '@/lib/utils';
import canvasConfetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pencil, Settings, Sparkles, BrainCircuit, Zap, Sword, RefreshCw, Plus, Mic, MicOff, Tag, Star, Heart, Home, Briefcase, User, Users } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import TutorialOverlay from '@/components/TutorialOverlay';
import LootBox from '@/components/LootBox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FocusMode from '@/components/FocusMode';
import BossBattle from '@/components/BossBattle';
import BodyDouble from '@/components/BodyDouble';
import AffirmationOverlay from '@/components/AffirmationOverlay';
import BubblePop from '@/components/BubblePop';
import WeeklyReview from '@/components/WeeklyReview';
import BrainDump from '@/components/BrainDump';
import SoundMixer from '@/components/SoundMixer';
import Questlines from '@/components/Questlines';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import DashieSlide from '@/components/DashieSlide';
import MilestoneCelebration from '@/components/MilestoneCelebration';
import TaskBreakdown from '@/components/TaskBreakdown';
import MoodCheck from '@/components/MoodCheck';
import EnergySelector from '@/components/EnergySelector';
import SurpriseMe from '@/components/SurpriseMe';
import TaskBreakdownModal from '@/components/TaskBreakdownModal';
import ContextSwitchValidator from '@/components/ContextSwitchValidator';
import QuickWinSuggestions from '@/components/QuickWinSuggestions';
import MoodSelector from '@/components/MoodSelector';
import DailyCheckIn from '@/components/DailyCheckIn';
import DashieOutfitDisplay, { TaskType } from '@/components/DashieOutfitDisplay';
import BrainCheckDemo from '@/pages/BrainCheckDemo';
import { Timer, CircleDashed, StickyNote, Volume2, Map, Wand2 } from 'lucide-react';
import ClarityMessage from '@/components/ClarityMessage';
import AffirmationFeedback from '@/components/AffirmationFeedback';
import BetaAccountGate from '@/components/BetaAccountGate';
import DemoModeGate from '@/components/DemoModeGate';
import DemoOnboarding from '@/components/DemoOnboarding';
import { demoAnalytics } from '@/lib/demoAnalytics';
import CalmOpening from '@/components/CalmOpening';
import FreezeMode from '@/components/FreezeMode';
import DynamicMusicPlayer from '@/components/DynamicMusicPlayer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dash() {
  const [, setLocation] = useLocation();
  const actions = useStore((state) => state.todaysActions);
  const toggleAction = useStore((state) => state.toggleAction);
  const resetDay = useStore((state) => state.resetDay);
  const updateActionText = useStore((state) => state.updateActionText);
  const addAction = useStore((state) => state.addAction);
  const saveTask = useStore((state) => state.saveTask);
  const savedTasks = useStore((state) => state.savedTasks);
  const removeSavedTask = useStore((state) => state.removeSavedTask);
  const coins = useStore((state) => state.coins);
  const addCoins = useStore((state) => state.addCoins);
  const zenMode = useStore((state) => state.zenMode);
  const context = useStore((state) => state.context);
  const setContext = useStore((state) => state.setContext);
  const swapAction = useStore((state) => state.swapAction);
  const streakCount = useStore((state) => state.streakCount);
  const streakMultiplier = useStore((state) => state.streakMultiplier);
  const brainDumpBacklog = useStore((state) => state.brainDumpBacklog);
  const addToBrainDump = useStore((state) => state.addToBrainDump);
  const removeFromBrainDump = useStore((state) => state.removeFromBrainDump);
  const moveBrainDumpToToday = useStore((state) => state.moveBrainDumpToToday);
  const dailyChallenges = useStore((state) => state.dailyChallenges);
  const generateDailyChallenges = useStore((state) => state.generateDailyChallenges);
  const updateChallengeProgress = useStore((state) => state.updateChallengeProgress);
  const setOnboardingChecklist = useStore((state) => state.setOnboardingChecklist);
  const moodCheckEnabled = useStore((state) => state.moodCheckEnabled);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [magicMode, setMagicMode] = useState(false);
  const [focusTask, setFocusTask] = useState<{id: string, text: string} | null>(null);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeTime, setChallengeTime] = useState<number | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [showLootBox, setShowLootBox] = useState(false);
  const [showBossBattle, setShowBossBattle] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [showSoundMixer, setShowSoundMixer] = useState(false);
  const [showQuestlines, setShowQuestlines] = useState(false);
  const [showTaskBreakdown, setShowTaskBreakdown] = useState(false);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [showEnergySelector, setShowEnergySelector] = useState(false);
  const [showTaskBreakdownModal, setShowTaskBreakdownModal] = useState(false);
  const [selectedTaskForBreakdown, setSelectedTaskForBreakdown] = useState<string | null>(null);
  const [showContextSwitch, setShowContextSwitch] = useState(false);
  const [contextSwitchFrom, setContextSwitchFrom] = useState<string | null>(null);
  const [contextSwitchTo, setContextSwitchTo] = useState<string | null>(null);
  const [showStreakBadge, setShowStreakBadge] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>('grind');
  const [showOutfitDisplay, setShowOutfitDisplay] = useState(false);
  const [completedTaskType, setCompletedTaskType] = useState<TaskType | null>(null);
  const [showDecisionTree, setShowDecisionTree] = useState(false);

  const [showBubblePop, setShowBubblePop] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'focus' | 'energy' | 'momentum'>('focus');
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'focus' | 'energy' | 'momentum' | null>(() => {
    const saved = localStorage.getItem('selectedCategory');
    return (saved as 'focus' | 'energy' | 'momentum' | null) || null;
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  const [brainDumpInput, setBrainDumpInput] = useState('');
  const [brainDumpCategory, setBrainDumpCategory] = useState<'focus' | 'energy' | 'momentum'>('focus');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [demoTasksCompleted, setDemoTasksCompleted] = useState(0);
  const [showDemoOnboarding, setShowDemoOnboarding] = useState(false);
  const [showDemoGate, setShowDemoGate] = useState(false);
  const [dismissedDemoGate, setDismissedDemoGate] = useState(false);
  const demoMode = useStore((state) => state.demoMode);
  const setDemoMode = useStore((state) => state.setDemoMode);
  const incrementDemoTasksCompleted = useStore((state) => state.incrementDemoTasksCompleted);
  const showDemoTutorial = useStore((state) => state.showDemoTutorial);
  const setShowDemoTutorial = useStore((state) => state.setShowDemoTutorial);
  const [selectedMood, setSelectedMood] = useState<'anxious' | 'bored' | 'overwhelmed' | 'energized' | null>(null);
  const setEmotionalState = useStore((state) => state.setEmotionalState);
  const currentEmotionalState = useStore((state) => state.currentEmotionalState);
  const [tasksCompletedInSession, setTasksCompletedInSession] = useState(0);
  const [showBetaGate, setShowBetaGate] = useState(false);
  const totalTasksCompleted = useStore((state) => state.totalTasksCompleted);
  const [showCalmOpening, setShowCalmOpening] = useState(true);
  const [showFreezeMode, setShowFreezeMode] = useState(false);
  const currentEnergyState = useStore((state) => state.currentEnergyState) || 'focus';
  
  const handleMoodSelect = (mood: 'anxious' | 'bored' | 'overwhelmed' | 'energized') => {
    setSelectedMood(mood);
    setEmotionalState(mood);
    soundManager.playCombo(1);
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize daily challenges on component mount
  useEffect(() => {
    generateDailyChallenges();
  }, [generateDailyChallenges]);

  // Show streak badge when multiplier is active
  useEffect(() => {
    if (streakMultiplier === 2) {
      setShowStreakBadge(true);
      const timer = setTimeout(() => setShowStreakBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streakMultiplier]);

  // Filter actions by selected category and preset
  let filteredActions = selectedCategory 
    ? actions.filter(a => a.category === selectedCategory)
    : actions;
  
  // Apply preset filters (visual presets for now - can be enhanced with task properties)
  if (selectedPreset === 'quick-wins') {
    filteredActions = filteredActions.slice(0, 3);
  } else if (selectedPreset === 'high-priority') {
    filteredActions = filteredActions.slice(0, 2);
  } else if (selectedPreset === 'urgent') {
    filteredActions = filteredActions.slice(0, 1);
  }
  
  // Check if current category is empty
  const isCategoryEmpty = selectedCategory && filteredActions.length === 0;
  
  // Count tasks per category
  const focusCount = actions.filter(a => a.category === 'focus').length;
  const energyCount = actions.filter(a => a.category === 'energy').length;
  const momentumCount = actions.filter(a => a.category === 'momentum').length;
  
  // Empty state messages
  const emptyStateMessages: Record<string, string> = {
    focus: 'No focus tasks yet—add one to get started!',
    energy: 'No energy tasks yet—add one to get started!',
    momentum: 'No momentum tasks yet—add one to get started!'
  };
  
  // Category color and styling config
  const categoryConfig = {
    focus: {
      color: 'from-blue-500 to-blue-600',
      bgInactive: 'bg-blue-50 dark:bg-blue-950',
      textInactive: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
    },
    energy: {
      color: 'from-amber-500 to-amber-600',
      bgInactive: 'bg-amber-50 dark:bg-amber-950',
      textInactive: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
    },
    momentum: {
      color: 'from-emerald-500 to-emerald-600',
      bgInactive: 'bg-emerald-50 dark:bg-emerald-950',
      textInactive: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
    }
  };
  
  // Ensure we have actions if page is loaded directly
  useEffect(() => {
    if (actions.length === 0) {
      resetDay();
    }
  }, [actions.length, resetDay]);

  // Persist category selection to localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('selectedCategory', selectedCategory);
    } else {
      localStorage.removeItem('selectedCategory');
    }
  }, [selectedCategory]);

  // Night Mode Schedule
  useEffect(() => {
    const checkNightMode = () => {
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 6) {
        document.documentElement.classList.add('dark');
      }
    };
    
    checkNightMode();
    const interval = setInterval(checkNightMode, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Show Daily Check-in on first load
  useEffect(() => {
    const hasSeenCheckIn = localStorage.getItem('dailyCheckInSeen');
    const today = new Date().toISOString().split('T')[0];
    if (hasSeenCheckIn !== today) {
      setShowDailyCheckIn(true);
      localStorage.setItem('dailyCheckInSeen', today);
    }
  }, []);

  // Check for completion to trigger reward
  useEffect(() => {
    if (actions.length > 0 && actions.every(a => a.completed)) {
      // Mark first task as complete in checklist
      setOnboardingChecklist('first_task', true);
      soundManager.playSuccess();
      haptics.celebrate();
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A7F3D0', '#6EE7B7', '#34D399', '#FCD34D', '#FDBA74'] // Sage/Green/Gold theme
      });
      
      // Challenge Mode Bonus
      if (challengeMode && challengeTime && challengeTime > 0) {
        // Double coins logic would go here if we had a method for it
        // For now just extra confetti
        setTimeout(() => {
          canvasConfetti({
            particleCount: 50,
            spread: 100,
            origin: { y: 0.3 },
            colors: ['#FFD700']
          });
        }, 500);
      }
      
      // 20% chance for Loot Box
      if (Math.random() < 0.2) {
        setTimeout(() => setShowLootBox(true), 1000);
      } else {
        const timer = setTimeout(() => {
          setLocation('/reward');
        }, 1500); // Longer delay to enjoy confetti
        return () => clearTimeout(timer);
      }
    }
  }, [actions, setLocation, challengeMode, challengeTime]);

  // Challenge Timer
  useEffect(() => {
    if (challengeMode && challengeTime !== null && challengeTime > 0 && !actions.every(a => a.completed)) {
      const timer = setInterval(() => {
        setChallengeTime(prev => (prev && prev > 0) ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    } else if (challengeTime === 0) {
      setChallengeMode(false); // Challenge failed
    }
  }, [challengeMode, challengeTime, actions]);

  const startChallenge = () => {
    if (actions.some(a => a.completed)) {
      if (!confirm("Start a Speed Dash? It's best to start with 0 tasks done.")) return;
    }
    setChallengeMode(true);
    setChallengeTime(300); // 5 minutes
    soundManager.playPop();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = (id: string) => {
    if (editingId === id) return; // Don't toggle while editing
    const action = actions.find(a => a.id === id);
    
    if (action && !action.completed) {
      // Combo Logic
      const now = Date.now();
      const timeDiff = now - lastActionTime;
      let newCombo = 1;
      
      if (timeDiff < 5000) { // 5 second window for combo
        newCombo = comboCount + 1;
        setComboCount(newCombo);
        soundManager.playCombo(newCombo);
        
        // Visual shake effect
        const container = document.getElementById('dash-container');
        if (container) {
          container.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
          ], { duration: 200 });
        }
      } else {
        setComboCount(1);
        soundManager.playCompletion();
      }
      
      setLastActionTime(now);
      haptics.success();
      
      // Update streak count and apply multiplier
      const completedCount = actions.filter(a => a.completed).length + 1;
      useStore.getState().updateStreakCount(completedCount);
      
      addCoins(1); // Earn 1 coin per task (multiplier applied in store)

      // Update challenge progress for focus tasks
      const focusTasks = actions.filter(a => a.category === 'focus' && a.completed).length + 1;
      useStore.getState().updateChallengeProgress('focus-2', focusTasks);
      
      // Trigger confetti if challenge completed
      if (focusTasks >= 2) {
        canvasConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Loot box chance
      if (Math.random() < 0.1) {
        setTimeout(() => setShowLootBox(true), 500);
      }
      
      // Show Dashie outfit completion with confetti and sounds
      const taskType = detectTaskType(action.text);
      setCompletedTaskType(taskType);
      
      // Play celebration sound sequence
      soundManager.playCompletionSequence();
      
      setTimeout(() => {
        // Confetti from Dashie's butt
        canvasConfetti({
          particleCount: 150,
          spread: 180,
          origin: { x: 0.5, y: 0.85 },
          colors: ['#A7F3D0', '#6EE7B7', '#34D399', '#FCD34D', '#FDBA74', '#FF6B6B'],
          gravity: 0.5,
          scalar: 1.2,
        });
      }, 200);
      
      // Show mood check after task completion (with slight delay)
      if (moodCheckEnabled) {
        setTimeout(() => setShowMoodCheck(true), 800);
      }
      
      // Beta gate: Show account creation prompt after 1 task
      const newCompletedCount = tasksCompletedInSession + 1;
      setTasksCompletedInSession(newCompletedCount);
      if (newCompletedCount === 1) {
        setTimeout(() => setShowBetaGate(true), 2500);
      }
      
      // Demo mode tracking
      if (demoMode) {
        const newDemoCount = demoTasksCompleted + 1;
        setDemoTasksCompleted(newDemoCount);
        demoAnalytics.trackTaskCompleted(newDemoCount);
        
        // Show demo gate after 5 tasks
        if (newDemoCount === 5 && !dismissedDemoGate) {
          setTimeout(() => setShowDemoGate(true), 2500);
        }
      }
    }
    
    toggleAction(id);
  };

  const startEditing = (e: React.MouseEvent, id: string, currentText: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditText(currentText);
    // Focus will be handled by useEffect or autoFocus
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateActionText(editingId, editText.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addAction(newTaskText.trim(), newTaskCategory);
      setNewTaskText('');
      setNewTaskCategory('focus');
      setIsAddingTask(false);
      setShowOutfitDisplay(true);
      soundManager.playPop();
      haptics.success();
    }
  };

  const handleSaveTask = () => {
    if (newTaskText.trim()) {
      saveTask(newTaskText.trim(), newTaskCategory);
      soundManager.playSuccess();
      haptics.success();
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewTaskText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleNewTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskText('');
    }
  };

  const handleMagicButton = () => {
    const incomplete = actions.filter(a => !a.completed);
    if (incomplete.length === 0) return;
    
    setMagicMode(true);
    soundManager.playPop();
    
    // Simulate "thinking"
    setTimeout(() => {
      const random = incomplete[Math.floor(Math.random() * incomplete.length)];
      haptics.success();
      
      // Open the task immediately
      setFocusTask({ id: random.id, text: random.text });
      setMagicMode(false);
    }, 1000);
  };

  const completedCount = actions.filter((a) => a.completed).length;
  const currentEnergyLevel = useStore((state) => state.currentEnergyLevel);
  const parallelTasks = useStore((state) => state.parallelTasks);
  const expandedTaskId = useStore((state) => state.expandedTaskId);
  const progress = Math.round((completedCount / 3) * 100);

  // Determine mascot pose based on progress
  let mascotPose: MascotPose = 'waiting';
  if (completedCount === 1) mascotPose = 'happy';
  if (completedCount === 2) mascotPose = 'proud';
  if (completedCount === 3) mascotPose = 'hero';
  
  // Override with jumping pose if on a combo streak
  if (comboCount > 3) mascotPose = 'jumping';

  const handleMascotInteraction = (type: 'pet' | 'feed') => {
    if (type === 'pet') {
      soundManager.playSquish();
      haptics.medium();
      setOnboardingChecklist('pet_mascot', true);
      // Visual feedback handled by Mascot component internal state or we could lift it
    } else if (type === 'feed') {
      soundManager.playPop();
      haptics.success();
      setOnboardingChecklist('pet_mascot', true);
      // Could add a feeding animation state here
    }
  };

  return (
    <Layout>
      {/* Calm Opening - shows on first load */}
      <AnimatePresence>
        {showCalmOpening && (
          <CalmOpening onComplete={() => setShowCalmOpening(false)} />
        )}
      </AnimatePresence>
      
      {/* Freeze Mode */}
      <FreezeMode
        isOpen={showFreezeMode}
        onClose={() => setShowFreezeMode(false)}
        onReady={() => setShowFreezeMode(false)}
      />
      
      {/* Dynamic Music Player */}
      <div className="fixed bottom-4 left-4 z-40">
        <DynamicMusicPlayer energyState={currentEnergyState as 'focus' | 'energy' | 'momentum' | 'freeze'} />
      </div>
      
      <AffirmationOverlay />
      <TutorialOverlay />
      <BetaAccountGate 
        tasksCompleted={tasksCompletedInSession}
        onDismiss={() => setShowBetaGate(false)}
      />
      {showBetaGate && <BetaAccountGate tasksCompleted={tasksCompletedInSession} />}
      <AnimatePresence>
        {showLootBox && <LootBox onClose={() => {
          setShowLootBox(false);
          setLocation('/reward');
        }} />}
        {showBossBattle && <BossBattle onClose={() => setShowBossBattle(false)} />}
        {showBubblePop && <BubblePop onClose={() => setShowBubblePop(false)} />}
        {showDailyCheckIn && <DailyCheckIn isOpen={showDailyCheckIn} onComplete={() => setShowDailyCheckIn(false)} />}
        {showOutfitDisplay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowOutfitDisplay(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Pick Your Mode</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['grind', 'housework', 'self-care'] as TaskType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTaskType(type)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all font-medium text-sm",
                      selectedTaskType === type
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                  >
                    {type === 'grind' && '📚💼'}
                    {type === 'housework' && '🧹'}
                    {type === 'self-care' && '🛁'}
                    <br />
                    <span className="text-xs">{type === 'grind' ? 'Grind' : type === 'housework' ? 'Chores' : 'Self-Care'}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center mb-6">
                <DashieOutfitDisplay taskType={selectedTaskType} isCompleted={false} />
              </div>
              <Button
                onClick={() => setShowOutfitDisplay(false)}
                className="w-full"
              >
                Let\'s Go!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <DashieSlide 
        completedCount={actions.filter(a => a.completed).length}
        totalCount={actions.length}
      />
      <MilestoneCelebration 
        percentage={Math.round((actions.filter(a => a.completed).length / Math.max(actions.length, 1)) * 100)} 
      />
      <WeeklyReview />
      <BrainDump isOpen={showBrainDump} onClose={() => setShowBrainDump(false)} />
      <SoundMixer isOpen={showSoundMixer} onClose={() => setShowSoundMixer(false)} />
      <Questlines isOpen={showQuestlines} onClose={() => setShowQuestlines(false)} />
      <TaskBreakdown isOpen={showTaskBreakdown} onClose={() => setShowTaskBreakdown(false)} />
      <MoodCheck isOpen={showMoodCheck} onClose={() => setShowMoodCheck(false)} />
      <TaskBreakdownModal
        isOpen={showTaskBreakdownModal}
        onClose={() => {
          setShowTaskBreakdownModal(false);
          setSelectedTaskForBreakdown(null);
        }}
        taskId={selectedTaskForBreakdown || ''}
        taskText={actions.find(a => a.id === selectedTaskForBreakdown)?.text || ''}
      />
      <ContextSwitchValidator
        isOpen={showContextSwitch}
        onClose={() => {
          setShowContextSwitch(false);
          setContextSwitchFrom(null);
          setContextSwitchTo(null);
        }}
        fromTaskId={contextSwitchFrom || ''}
        toTaskId={contextSwitchTo || ''}
        fromTaskText={actions.find(a => a.id === contextSwitchFrom)?.text || ''}
        toTaskText={actions.find(a => a.id === contextSwitchTo)?.text || ''}
      />
      <BodyDouble />
      <AffirmationFeedback isVisible={false} />
      <div className="flex flex-col h-full">
        {/* Clarity Message */}
        <ClarityMessage />
        
        {/* Header */}
        <header className="pt-8 pb-8 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-primary">Today's Dash</h1>
                {/* Daily Streak Counter */}
                {streakCount > 0 && (
                  <div className="ml-auto bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-md border border-primary/30">
                    <span>🔥</span> {streakCount} day streak!
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-muted-foreground">Just start. That's enough.</p>
                {!zenMode && (
                  <>
                    <div className="bg-primary/5 text-primary px-3 py-0.5 rounded-full text-sm font-bold flex items-center gap-1 border border-primary/20">
                      <span>⭐</span> {coins}
                    </div>
                    {comboCount > 1 && (
                      <div className="animate-bounce bg-primary/10 text-primary px-3 py-0.5 rounded-full text-sm font-bold flex items-center gap-1 border border-primary/30">
                        <span>🔥</span> {comboCount}x COMBO!
                      </div>
                    )}
                    {showStreakBadge && streakMultiplier === 2 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-sm font-bold flex items-center gap-1 border border-primary/30"
                      >
                        <span>⚡</span> 2x STREAK!
                      </motion.div>
                    )}
                  </>
                )}
                {/* Advanced Options Menu - Mood, Brain Dump, Settings */}
                <div className="flex gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setShowMoodSelector(true)} className="gap-2 cursor-pointer">
                        <span>Check Mood</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowBrainDumpModal(true)} className="gap-2 cursor-pointer">
                        <span>Brain Dump</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/settings')} className="gap-2 cursor-pointer">
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Hidden original */}
                <div className="flex gap-2 items-center hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Mission
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setShowTaskBreakdown(true)} className="gap-2 cursor-pointer">
                      <BrainCircuit className="w-4 h-4 text-purple-500" />
                      <span>Break It Down (AI)</span>
                    </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEnergySelector(true)} className="gap-2 cursor-pointer">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span>Check Energy Level</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBrainDump(true)} className="gap-2 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Quick Win (Minor)</span>
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowBossBattle(true)} className="gap-2 cursor-pointer">
                      <Sword className="w-4 h-4 text-red-500" />
                      <span>Slay a Monster (Major)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => useStore.getState().startBodyDouble("Focus Sprint")} className="gap-2 cursor-pointer">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span>Body Double (Sprint)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            </div>
            
            {/* Mascot & Progress */}
            <div className="flex items-center gap-4" role="status" aria-label={`Progress: ${completedCount} of 3 actions completed`}>
              <div className="w-16 h-16 relative group" aria-hidden="true">
                <Mascot pose={mascotPose} />
                
                {/* Interaction Menu (Hover/Focus) */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-full shadow-lg border border-border">
                  <button 
                    onClick={() => handleMascotInteraction('pet')}
                    className="p-1.5 hover:bg-primary/10 rounded-full text-xs"
                    title="Pet"
                  >
                    👋
                  </button>
                  <button 
                    onClick={() => handleMascotInteraction('feed')}
                    className="p-1.5 hover:bg-primary/10 rounded-full text-xs"
                    title="Feed"
                  >
                    🍎
                  </button>
                </div>
              </div>
              {/* Progress Ring */}
              <div className="relative w-12 h-12 flex items-center justify-center" aria-hidden="true">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <motion.path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${progress}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progress}, 100` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Life Area Tabs */}
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Choose Your Context</p>
          <div className="flex flex-wrap gap-2 pb-2">
            <button
              onClick={() => setContext('nest')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                context === 'nest' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <Home className="w-4 h-4" /> Nest
            </button>
            <button
              onClick={() => setContext('grind')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                context === 'grind' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <Briefcase className="w-4 h-4" /> Grind
            </button>
            <button
              onClick={() => setContext('self')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                context === 'self' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <User className="w-4 h-4" /> Self
            </button>
            <button
              onClick={() => setShowDecisionTree(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2 bg-primary text-primary-foreground border-primary shadow-md hover:shadow-lg"
              title="Smart task sequencing based on your state"
            >
              <Wand2 className="w-4 h-4" /> Brain Check
            </button>
            <button
              onClick={() => setContext('family')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                context === 'family' ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <Users className="w-4 h-4" /> Family
            </button>
          </div>
          </div>
          
          {/* Category Stats */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-muted-foreground px-4 py-2 bg-accent/30 rounded-lg"
            >
              {selectedCategory === 'focus' && focusCount} task(s) in Focus
              {selectedCategory === 'energy' && energyCount} task(s) in Energy
              {selectedCategory === 'momentum' && momentumCount} task(s) in Momentum
            </motion.div>
          )}
          
          {/* Daily Challenges moved to Rewards tab for cleaner dashboard */}
          
          {/* Category Filter Tabs */}
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Filter By Category</p>
          <div className="flex flex-wrap gap-2 pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                selectedCategory === null ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              All
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20">{actions.length}</span>
            </button>
            <button
              onClick={() => setSelectedCategory('focus')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                selectedCategory === 'focus' 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <BrainCircuit className="w-4 h-4" /> Focus
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20">{focusCount}</span>
            </button>
            <button
              onClick={() => setSelectedCategory('energy')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                selectedCategory === 'energy' 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <Zap className="w-4 h-4" /> Energy
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20">{energyCount}</span>
            </button>
            <button
              onClick={() => setSelectedCategory('momentum')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                selectedCategory === 'momentum' 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : "bg-primary/5 text-primary border-primary/30 hover:border-primary/50"
              )}
            >
              <RefreshCw className="w-4 h-4" /> Momentum
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20">{momentumCount}</span>
            </button>
          </div>
          </div>
          
          {/* Filter Presets */}
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Filters</p>
          <div className="flex flex-wrap gap-2 pb-2">
            <button
              onClick={() => setSelectedPreset(selectedPreset === 'quick-wins' ? null : 'quick-wins')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                selectedPreset === 'quick-wins' ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Quick Wins (3)
            </button>
            <button
              onClick={() => setSelectedPreset(selectedPreset === 'high-priority' ? null : 'high-priority')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                selectedPreset === 'high-priority' ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Top 2
            </button>
            <button
              onClick={() => setSelectedPreset(selectedPreset === 'urgent' ? null : 'urgent')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                selectedPreset === 'urgent' ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Focus on 1
            </button>
          </div>
          </div>
        </header>

        {/* Empty State */}
        <AnimatePresence mode="wait">
        {isCategoryEmpty && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground mb-4">
                {emptyStateMessages[selectedCategory || 'focus']}
              </p>
              <button
                onClick={() => setIsAddingTask(true)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Add Task
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
        
        {/* Actions List */}
        <AnimatePresence mode="wait">
        {!isCategoryEmpty && (
        <motion.div
          key="actions-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 space-y-6"
        >
          <AnimatePresence>
            {filteredActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleToggle(action.id)}
                role="checkbox"
                aria-checked={action.completed}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleToggle(action.id);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "bg-card shadow-sm border border-transparent hover:shadow-md",
                  action.completed ? "bg-primary/5 border-primary/20" : "hover:border-primary/10"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    action.completed 
                      ? "bg-primary border-primary scale-110" 
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}>
                    <AnimatePresence>
                      {action.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    {editingId === action.id ? (
                      <Input
                        ref={inputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="text-lg font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center justify-between group/text">
                        <div className="flex-1 flex items-center justify-between gap-3">
                          <p className={cn(
                            "text-lg font-medium transition-all duration-300",
                            action.completed ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground"
                          )}>
                            {action.text}
                          </p>
                          {action.duration && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                              action.duration === 2 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              action.duration === 5 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              ~{action.duration}m
                            </span>
                          )}
                        </div>
                        {!action.completed && (
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskForBreakdown(action.id);
                                setShowTaskBreakdownModal(true);
                              }}
                              className="p-2 text-muted-foreground hover:text-primary"
                              aria-label="Break down task"
                              title="Break Into Steps"
                            >
                              <BrainCircuit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                useStore.getState().startMicroTry(action.id);
                                setFocusTask({ id: action.id, text: action.text });
                              }}
                              className="p-2 text-muted-foreground hover:text-primary"
                              aria-label="Try for 2 minutes"
                              title="Try for 2 Minutes"
                            >
                              <Timer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => startEditing(e, action.id, action.text)}
                              className="p-2 text-muted-foreground hover:text-primary"
                              aria-label="Edit action"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                swapAction(action.id);
                                soundManager.playPop();
                              }}
                              className="p-2 text-muted-foreground hover:text-primary"
                              aria-label="Swap task"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                useStore.getState().archiveTask(action.id);
                                soundManager.playPop();
                              }}
                              className="p-2 text-muted-foreground hover:text-amber-500"
                              aria-label="Archive task"
                              title="Archive to Later"
                            >
                              <StickyNote className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Subtle fill animation on click */}
                {action.completed && (
                  <motion.div
                    layoutId={`fill-${action.id}`}
                    className="absolute inset-0 bg-primary/5 z-[-1]"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}

            {/* Energy Selector Modal */}
            {showEnergySelector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-4"
              >
                <EnergySelector
                  onSelect={() => setShowEnergySelector(false)}
                />
                <div className="mt-4">
                  <SurpriseMe
                    onTaskSelected={(taskId) => {
                      setShowEnergySelector(false);
                      // Optionally focus on the selected task
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Add Custom Task Button */}
            {isAddingTask ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl p-6 shadow-sm border-2 border-dashed border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                  </div>
                  <Input
                    ref={newTaskInputRef}
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleNewTaskKeyDown}
                    placeholder="What's one small step?"
                    className="h-8 text-lg font-medium bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleVoiceInput}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isListening ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-accent text-muted-foreground"
                      )}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                          <Tag className={cn("w-4 h-4", 
                            newTaskCategory === 'focus' && "text-blue-500",
                            newTaskCategory === 'energy' && "text-green-500",
                            newTaskCategory === 'momentum' && "text-orange-500"
                          )} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setNewTaskCategory('focus')} className="gap-2">
                          <BrainCircuit className="w-4 h-4 text-blue-500" /> Focus
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setNewTaskCategory('energy')} className="gap-2">
                          <Zap className="w-4 h-4 text-green-500" /> Energy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setNewTaskCategory('momentum')} className="gap-2">
                          <Sparkles className="w-4 h-4 text-orange-500" /> Momentum
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                      onClick={handleSaveTask}
                      className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-yellow-500 transition-colors"
                      title="Save to Favorites"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <Button size="sm" onClick={handleAddTask} disabled={!newTaskText.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
                
                {/* Saved Tasks Quick Pick */}
                {savedTasks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {savedTasks.map((task, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          addAction(task.text, task.category);
                          setIsAddingTask(false);
                          soundManager.playPop();
                        }}
                        className="text-xs bg-accent/50 hover:bg-accent px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors group"
                      >
                        {task.category === 'focus' && <BrainCircuit className="w-3 h-3 text-blue-500" />}
                        {task.category === 'energy' && <Zap className="w-3 h-3 text-green-500" />}
                        {task.category === 'momentum' && <Sparkles className="w-3 h-3 text-orange-500" />}
                        {task.text}
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedTask(task.text);
                          }}
                          className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500"
                        >
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { addAction('Make coffee', 'energy'); soundManager.playDing(); }}
                    className="py-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium hover:shadow-md"
                  >
                    Coffee
                  </button>
                  <button
                    onClick={() => { addAction('Make the bed', 'momentum'); soundManager.playDing(); }}
                    className="py-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium hover:shadow-md"
                  >
                    Make Bed
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { addAction('Morning routine', 'energy'); soundManager.playDing(); }}
                    className="py-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium hover:shadow-md"
                  >
                    Morning
                  </button>
                  <button
                    onClick={() => { addAction('Evening routine', 'energy'); soundManager.playDing(); }}
                    className="py-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:shadow-md"
                  >
                    Evening
                  </button>
                </div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsAddingTask(true)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-accent/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Add your own task</span>
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
        )}
        </AnimatePresence>

        {focusTask && (
          <FocusMode 
            isOpen={!!focusTask}
            onClose={() => setFocusTask(null)}
            taskName={focusTask.text}
            onComplete={() => {
              handleToggle(focusTask.id);
              setFocusTask(null);
            }}
          />
        )}

        {/* Quick Start Presets */}
        {!selectedCategory && (
          <div className="py-8 px-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {actions.filter(a => !a.completed).slice(0, 3).map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFocusTask({ id: action.id, text: action.text });
                  }}
                  className="p-3 rounded-lg bg-card border border-primary/20 hover:border-primary/50 transition-all text-left"
                >
                  <p className="text-sm font-medium line-clamp-2">{action.text}</p>
                  {action.duration && (
                    <p className="text-xs text-muted-foreground mt-2">~{action.duration} min</p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Magic Button & Challenge */}
        <div className="py-8 flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <Button
              onClick={handleMagicButton}
              disabled={actions.every(a => a.completed) || magicMode}
              className={cn(
                "rounded-full px-6 py-6 h-auto text-lg gap-2 shadow-lg transition-all hover:scale-105 active:scale-95",
                magicMode ? "animate-pulse bg-purple-500 hover:bg-purple-600" : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              )}
            >
              <Sparkles className={cn("w-6 h-6", magicMode && "animate-spin")} />
              {magicMode ? "Picking..." : "Pick for me"}
            </Button>

            <Button
              onClick={startChallenge}
              disabled={actions.every(a => a.completed) || challengeMode}
              variant="outline"
              className={cn(
                "rounded-full px-6 py-6 h-auto text-lg gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 border-2",
                challengeMode ? "border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-950/30" : "border-orange-200 hover:border-orange-400 text-orange-600"
              )}
            >
              <Zap className={cn("w-6 h-6", challengeMode && "animate-pulse")} />
              {challengeMode ? formatTime(challengeTime || 0) : "Speed Dash"}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground/40 text-center max-w-xs">
            Use <strong>Pick for me</strong> if you're stuck, or <strong>Speed Dash</strong> to race against the clock (5 min).
          </p>

          <div className="flex gap-2 pb-8">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowBossBattle(true)}
            >
              <Sword className="w-4 h-4" />
              Slay a Monster
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowBubblePop(true)}
            >
              <CircleDashed className="w-4 h-4" />
              Bubble Pop
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowBrainDump(true)}
            >
              <StickyNote className="w-4 h-4" />
              Brain Dump
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowSoundMixer(!showSoundMixer)}
            >
              <Volume2 className="w-4 h-4" />
              Focus Sounds
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => setShowQuestlines(true)}
            >
              <Map className="w-4 h-4" />
              Quests
            </Button>
          </div>
        </div>
      </div>
      
      {/* Onboarding Checklist */}
      <OnboardingChecklist />
      
      {/* Mood Selector Modal */}
      <MoodSelector
        isOpen={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
        onSelect={handleMoodSelect}
        currentMood={currentEmotionalState}
      />
      
      {/* Decision Tree Modal */}
      {showDecisionTree && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BrainCheckDemo />
          </div>
        </div>
      )}
      
      {/* Demo Mode Components */}
      <DemoOnboarding 
        isOpen={showDemoOnboarding && demoMode} 
        onComplete={() => {
          setShowDemoOnboarding(false);
          setShowDemoTutorial(false);
        }}
      />
      
      <DemoModeGate
        tasksCompleted={demoTasksCompleted}
        onDismiss={() => setDismissedDemoGate(true)}
      />
    </Layout>
  );
}
