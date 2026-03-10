import React from "react";
import { useLocation } from "wouter";
import { Zap, Target, Trophy, Sparkles, Heart, Brain, LogIn, Wand2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import PickAndWinSection from "@/components/PickAndWinSection";
import ArrowToBullseye from "@/components/ArrowToBullseye";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showLabel, setShowLabel] = React.useState(false);

  const handlePlayAgain = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setShowLabel(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      // Show label in the last 1.5 seconds of the 8.2 second video
      const timeRemaining = videoRef.current.duration - videoRef.current.currentTime;
      setShowLabel(timeRemaining < 1.5 && timeRemaining > 0);
    }
  };

  const whyItWorks = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Small tasks, fast wins",
      description: "Micro-steps designed for ADHD brains. No overwhelm."
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Visual progress tracking",
      description: "See your wins build in real-time."
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Built-in reward feedback",
      description: "Celebrate every step forward."
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "No overwhelm interface",
      description: "Clean, focused, distraction-free."
    }
  ];

  const immediateOutcomes = [
    "Capture what's overwhelming you",
    "Break it into doable micro-steps",
    "Complete your first task",
    "Get a visible progress boost"
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Wins",
      description: "Bite-sized tasks designed for quick dopamine hits. No overwhelming lists."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "ADHD-Friendly",
      description: "Built by understanding executive dysfunction. No guilt, just progress."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Gamified Progress",
      description: "Level up, earn coins, unlock badges. Make productivity actually fun."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Your Companion",
      description: "A virtual buddy that celebrates every win, no matter how small."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Bullseye Wins",
      description: "Dashie helps you hit your targets. Every win counts, no matter the size."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Boss Battles",
      description: "Turn overwhelming tasks into epic quests. Slay your dragons."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* HERO SECTION - Redesigned for ADHD dopamine trigger */}
      <div className="container max-w-5xl mx-auto px-4 pt-20 pb-16 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Early Access Badge */}
          <div className="inline-block">
            <span className="px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold border border-accent/30">
              🚀 Early Access
            </span>
          </div>

          {/* Main Headline - Action-oriented */}
          <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-tight">
            Finish What Matters<br />in 60 Seconds
          </h1>

          {/* Subheadline - Clear value prop */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A productivity system built for ADHD brains — fast, visual, and rewarding.
          </p>

          {/* Primary CTA - Bold and centered */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => setLocation('/dash')}
                className="text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => window.location.href = getLoginUrl()}
                  className="text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Start My First Win
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation('/brain-check')}
                  className="text-lg px-10 py-7 rounded-full"
                >
                  See How It Works
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground pt-2">
            Free signup • No credit card needed • Built by someone with ADHD, for ADHD brains
          </p>
        </motion.div>
      </div>

      {/* VIDEO DEMO - Immediate visual proof */}
      <div className="w-full py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/25 z-10"></div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-auto block"
              style={{ maxHeight: '60vh', objectFit: 'cover' }}
            >
              <source src="https://d2xsxph8kpxj0f.cloudfront.net/310419663026756998/KeSi6Ejr7uHPV3mimmzDSf/1773127285_68110ca9.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

          </div>
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAgain}
              className="gap-2"
            >
              ▶ Play Again
            </Button>
          </div>
        </motion.div>
      </div>

      {/* WHY THIS WORKS - Micro-reward explanation */}
      <div className="container max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold">Why This Actually Works for ADHD</h2>
            <p className="text-lg text-muted-foreground">Designed for how your brain works, not against it</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyItWorks.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary/50 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* IN 3 MINUTES - Immediate outcome promise */}
      <div className="container max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-3xl p-8 md:p-12 space-y-8"
        >
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">In 3 Minutes You'll…</h2>
            <p className="text-muted-foreground">Everything you need to feel momentum</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {immediateOutcomes.map((outcome, index) => (
              <motion.div
                key={outcome}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">{outcome}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            {!isAuthenticated && (
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="text-lg px-10 py-7 rounded-full bg-primary hover:bg-primary/90"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Start Now
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* SOCIAL PROOF - Built by ADHD, for ADHD */}
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center space-y-8"
        >
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground font-medium">
              Built by someone with ADHD, for ADHD brains.
            </p>

            <div className="border-t border-border pt-6 space-y-4">
              <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed italic">
                "I can finally put the entire dishwasher away before randomly switching to something else. I think it's the dopamine spikes this app helps me get."
              </p>
              <p className="text-muted-foreground">
                — MomTo3, Early Tester
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation(isAuthenticated ? '/dash' : '/brain-check')}
              className="text-lg px-8 py-6 rounded-full"
            >
              {isAuthenticated ? "Start a New Task" : "Try Demo First"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* FEATURES GRID - Secondary details */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Built Different</h2>
            <p className="text-muted-foreground">
              For brains that work differently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 space-y-3 hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pick & Win Section */}
      {!isAuthenticated ? (
        <PickAndWinSection
          onEmailCapture={(email, character, discountCode) => {
            const signupUrl = new URL(getLoginUrl());
            signupUrl.searchParams.set('email', email);
            signupUrl.searchParams.set('discount', discountCode);
            signupUrl.searchParams.set('character', character);
            window.location.href = signupUrl.toString();
          }}
        />
      ) : null}

      {/* Beta Tester Program */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-y border-primary/20 py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold">Join Our Beta Testers</h2>
              <p className="text-lg text-muted-foreground">Get lifetime free Pro access + shape Dopamine Dasher's future</p>
            </div>

            <div className="bg-card border border-primary/30 rounded-2xl p-8 space-y-4 inline-block">
              <div className="space-y-3">
                <p className="font-semibold text-foreground">What You Get:</p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Lifetime Pro access (50% off retail)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Direct input on features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Private beta community
                  </li>
                </ul>
              </div>

              <Button
                size="lg"
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Become a Beta Tester
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
