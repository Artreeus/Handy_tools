'use client';

import { useState, useEffect } from 'react';
import { Heart, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/ui/tool-layout';

const quotes = [
  "You're doing fine. Every step forward is progress.",
  "Take a moment to breathe. You've got this.",
  "It's okay to pause. Rest is part of the journey.",
  "You're stronger than you think. Keep going.",
  "This too shall pass. You're not alone.",
  "Progress, not perfection. You're on the right path.",
  "Be kind to yourself. You deserve compassion.",
  "Every breath is a new beginning.",
  "You've overcome challenges before. You can do it again.",
  "Trust the process. You're exactly where you need to be.",
  "Your efforts matter, even when they feel small.",
  "Take it one moment at a time. You're doing great.",
  "Breathe in peace, breathe out stress.",
  "You are enough, just as you are.",
  "This moment of rest will give you strength."
];

const breathingPattern = {
  inhale: 4000,   // 4 seconds
  hold: 2000,     // 2 seconds
  exhale: 6000    // 6 seconds
};

export default function TakeBreatherPage() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(3);
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isBreathing) return;

    let phaseHoldTimeout: NodeJS.Timeout;
    let phaseExhaleTimeout: NodeJS.Timeout;

    // Breathing animation cycle
    const cycleBreathing = () => {
      setBreathPhase('inhale');
      phaseHoldTimeout = setTimeout(() => setBreathPhase('hold'), breathingPattern.inhale);
      phaseExhaleTimeout = setTimeout(() => setBreathPhase('exhale'), breathingPattern.inhale + breathingPattern.hold);
    };

    cycleBreathing();
    const breathingInterval = setInterval(cycleBreathing,
      breathingPattern.inhale + breathingPattern.hold + breathingPattern.exhale
    );

    // Change quote every 30 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 30000);

    // Session timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsBreathing(false);
          return sessionDuration * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(phaseHoldTimeout);
      clearTimeout(phaseExhaleTimeout);
      clearInterval(breathingInterval);
      clearInterval(quoteInterval);
      clearInterval(timerInterval);
    };
  }, [isBreathing, sessionDuration]);

  const startBreathing = () => {
    setIsBreathing(true);
    setTimeLeft(sessionDuration * 60);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setTimeLeft(sessionDuration * 60);
  };

  const resetSession = () => {
    setIsBreathing(false);
    setTimeLeft(sessionDuration * 60);
    setBreathPhase('inhale');
    setCurrentQuote(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
    }
  };

  const getCircleScale = () => {
    switch (breathPhase) {
      case 'inhale': return 'scale-150';
      case 'hold': return 'scale-150';
      case 'exhale': return 'scale-100';
    }
  };

  const getCircleColor = () => {
    switch (breathPhase) {
      case 'inhale': return 'bg-blue-400';
      case 'hold': return 'bg-purple-400';
      case 'exhale': return 'bg-green-400';
    }
  };

  const instructions = [
    'Choose your preferred session duration (1-10 minutes)',
    'Click "Start Breathing" to begin your mindful break',
    'Follow the breathing circle and read the calming quotes',
    'Focus on your breath and let go of stress and overwhelm'
  ];

  return (
    <ToolLayout
      title="Take a Breather - Mindful Break Tool"
      description="A calming space with guided breathing, positive quotes, and soothing animations"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Session Controls */}
        {!isBreathing && (
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Duration</label>
                  <Select 
                    value={sessionDuration.toString()} 
                    onValueChange={(value) => {
                      const duration = parseInt(value);
                      setSessionDuration(duration);
                      setTimeLeft(duration * 60);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={startBreathing} size="lg" className="ml-4">
                  <Play className="mr-2 h-4 w-4" />
                  Start Breathing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Breathing Session */}
        {isBreathing && (
          <div className="space-y-8">
            {/* Timer and Controls */}
            <div className="flex items-center justify-center space-x-4">
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
              <Button onClick={stopBreathing} variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button onClick={resetSession} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button 
                onClick={() => setIsMuted(!isMuted)} 
                variant="ghost"
                size="sm"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Breathing Circle */}
            <div className="flex flex-col items-center justify-center space-y-8 py-12">
              <div className="relative">
                <div
                  style={{ transitionDuration: '4s' }}
                  className={`w-32 h-32 rounded-full transition-all ease-in-out ${getCircleColor()} ${getCircleScale()} opacity-70`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">
                  {getBreathingInstruction()}
                </h3>
                <div className="max-w-md mx-auto">
                  <p className="text-lg text-muted-foreground italic leading-relaxed">
                    &ldquo;{quotes[currentQuote]}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {!isBreathing && timeLeft !== sessionDuration * 60 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800">
                  Great job! You completed your breathing session.
                </h3>
                <p className="text-green-700">
                  Take a moment to notice how you feel. You&apos;re ready to continue with renewed focus.
                </p>
                <Button onClick={resetSession} className="mt-4">
                  Start Another Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Benefits of Mindful Breathing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Physical Benefits</h4>
                <ul className="space-y-1">
                  <li>• Reduces stress hormones</li>
                  <li>• Lowers blood pressure</li>
                  <li>• Improves oxygen flow</li>
                  <li>• Relaxes muscle tension</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Mental Benefits</h4>
                <ul className="space-y-1">
                  <li>• Increases focus and clarity</li>
                  <li>• Reduces anxiety and overwhelm</li>
                  <li>• Improves emotional regulation</li>
                  <li>• Enhances creativity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tips for Better Breathing Sessions</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Find a quiet space:</strong> Choose a comfortable, distraction-free environment.
              </p>
              <p>
                <strong>Sit comfortably:</strong> Keep your back straight but relaxed, feet flat on the floor.
              </p>
              <p>
                <strong>Focus on the circle:</strong> Let the visual guide your breathing rhythm naturally.
              </p>
              <p>
                <strong>Don&apos;t force it:</strong> If you miss a breath, simply return to the pattern gently.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}