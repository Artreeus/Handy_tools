'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatsGrid } from '@/components/ui/stats-grid';
import { ToolLayout } from '@/components/ui/tool-layout';
import { useLocalStorage } from '@/lib/use-local-storage';
import { generateId } from '@/lib/id';
import { toast } from 'sonner';

interface FocusSession {
  id: string;
  date: string;
  duration: number; // in minutes
  accomplished: string;
  distractionLevel: number; // 1-5 scale
  notes: string;
  completed: boolean;
}

export default function FocusTimerPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focusSessions', []);
  const [showReflection, setShowReflection] = useState(false);
  const [currentReflection, setCurrentReflection] = useState({
    accomplished: '',
    distractionLevel: 3,
    notes: ''
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowReflection(true);
            playNotificationSound();
            toast.success('Focus session completed! Time for reflection.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveReflection = () => {
    const session: FocusSession = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      duration: sessionDuration,
      accomplished: currentReflection.accomplished,
      distractionLevel: currentReflection.distractionLevel,
      notes: currentReflection.notes,
      completed: timeLeft === 0
    };

    setSessions([session, ...sessions]);
    setCurrentReflection({
      accomplished: '',
      distractionLevel: 3,
      notes: ''
    });
    setShowReflection(false);
    resetTimer();
    toast.success('Session reflection saved!');
  };

  const getProductivityStats = () => {
    const last7Days = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    if (last7Days.length === 0) return null;

    const totalMinutes = last7Days.reduce((sum, s) => sum + s.duration, 0);
    const avgDistraction = last7Days.reduce((sum, s) => sum + s.distractionLevel, 0) / last7Days.length;
    const completedSessions = last7Days.filter(s => s.completed).length;
    const completionRate = (completedSessions / last7Days.length) * 100;

    return {
      totalMinutes,
      avgDistraction: avgDistraction.toFixed(1),
      completionRate: completionRate.toFixed(0),
      sessionsCount: last7Days.length
    };
  };

  const progress = ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100;
  const stats = getProductivityStats();

  const instructions = [
    'Set your focus session duration (default 25 minutes - Pomodoro technique)',
    'Click start and focus on your work until the timer completes',
    'When the session ends, reflect on what you accomplished',
    'Track your productivity patterns over time'
  ];

  return (
    <ToolLayout
      title="Focus Session Timer"
      description="Pomodoro-style focus timer with post-session reflection and productivity tracking"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Timer Settings */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="space-y-2">
                <Label>Session Duration (minutes)</Label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={sessionDuration}
                  onChange={(e) => {
                    const duration = parseInt(e.target.value) || 25;
                    setSessionDuration(duration);
                    if (!isRunning) {
                      setTimeLeft(duration * 60);
                    }
                  }}
                  className="w-20 text-center"
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-mono font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <div className="flex justify-center space-x-2">
                {!isRunning ? (
                  <Button onClick={startTimer} size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Start Focus
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="outline">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="lg" variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Stats */}
        {stats && (
          <StatsGrid
            variant="cards"
            stats={[
              { label: 'Total Focus Time', icon: Timer, iconClassName: 'text-blue-500', value: `${stats.totalMinutes}m`, caption: 'Last 7 days' },
              { label: 'Completion Rate', icon: TrendingUp, iconClassName: 'text-green-500', value: `${stats.completionRate}%`, caption: 'Sessions completed' },
              { label: 'Sessions', icon: Calendar, iconClassName: 'text-purple-500', value: stats.sessionsCount, caption: 'This week' },
              { label: 'Avg Distraction', value: `${stats.avgDistraction}/5`, caption: 'Lower is better' },
            ]}
          />
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Recent Focus Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{session.date}</span>
                        <Badge variant={session.completed ? "default" : "secondary"}>
                          {session.duration}m
                        </Badge>
                        <Badge variant="outline">
                          Distraction: {session.distractionLevel}/5
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{session.accomplished}</p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reflection Dialog */}
        <Dialog open={showReflection} onOpenChange={setShowReflection}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Session Reflection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What did you accomplish?</Label>
                <Textarea
                  placeholder="Describe what you worked on during this session..."
                  value={currentReflection.accomplished}
                  onChange={(e) => setCurrentReflection({
                    ...currentReflection,
                    accomplished: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>How distracted were you? (1 = Very focused, 5 = Very distracted)</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">1</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentReflection.distractionLevel}
                    onChange={(e) => setCurrentReflection({
                      ...currentReflection,
                      distractionLevel: parseInt(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <span className="text-sm">5</span>
                  <Badge variant="outline">{currentReflection.distractionLevel}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any thoughts about this session..."
                  value={currentReflection.notes}
                  onChange={(e) => setCurrentReflection({
                    ...currentReflection,
                    notes: e.target.value
                  })}
                  rows={2}
                />
              </div>
              <Button onClick={saveReflection} className="w-full">
                Save Reflection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ToolLayout>
  );
}