'use client';

import { useState } from 'react';
import { Heart, Plus, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatsGrid } from '@/components/ui/stats-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { ToolLayout } from '@/components/ui/tool-layout';
import { useLocalStorage } from '@/lib/use-local-storage';
import { generateId } from '@/lib/id';
import { toast } from 'sonner';

interface TaskEntry {
  id: string;
  date: string;
  task1: string;
  task2: string;
  mood: string;
  moodScore: number;
  notes: string;
  productivity: number;
}

const moodEmojis = [
  { emoji: '😢', label: 'Very Sad', score: 1 },
  { emoji: '😔', label: 'Sad', score: 2 },
  { emoji: '😐', label: 'Neutral', score: 3 },
  { emoji: '🙂', label: 'Happy', score: 4 },
  { emoji: '😄', label: 'Very Happy', score: 5 }
];

export default function TaskMoodLoggerPage() {
  const [entries, setEntries] = useLocalStorage<TaskEntry[]>('taskMoodLogger', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TaskEntry>>({
    date: new Date().toISOString().split('T')[0],
    task1: '',
    task2: '',
    mood: '😐',
    moodScore: 3,
    notes: '',
    productivity: 5
  });

  const addEntry = () => {
    if (!newEntry.task1 || !newEntry.task2) {
      toast.error('Please fill in both tasks');
      return;
    }

    const entry: TaskEntry = {
      id: generateId(),
      date: newEntry.date!,
      task1: newEntry.task1!,
      task2: newEntry.task2!,
      mood: newEntry.mood!,
      moodScore: newEntry.moodScore!,
      notes: newEntry.notes || '',
      productivity: newEntry.productivity!
    };

    setEntries([entry, ...entries]);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      task1: '',
      task2: '',
      mood: '😐',
      moodScore: 3,
      notes: '',
      productivity: 5
    });
    setIsAddingNew(false);
    toast.success('Daily entry logged successfully!');
  };

  const selectMood = (emoji: string, score: number) => {
    setNewEntry({...newEntry, mood: emoji, moodScore: score});
  };

  const getWeeklyStats = () => {
    const lastWeek = entries.slice(0, 7);
    if (lastWeek.length === 0) return null;

    const avgMood = lastWeek.reduce((sum, entry) => sum + entry.moodScore, 0) / lastWeek.length;
    const avgProductivity = lastWeek.reduce((sum, entry) => sum + entry.productivity, 0) / lastWeek.length;
    const totalTasks = lastWeek.length * 2; // 2 tasks per entry
    
    return {
      avgMood: avgMood.toFixed(1),
      avgProductivity: avgProductivity.toFixed(1),
      totalTasks,
      daysLogged: lastWeek.length
    };
  };

  const getMoodTrend = () => {
    if (entries.length < 2) return 'stable';
    const recent = entries.slice(0, 3).map(e => e.moodScore);
    const older = entries.slice(3, 6).map(e => e.moodScore);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  };

  const weeklyStats = getWeeklyStats();
  const moodTrend = getMoodTrend();

  const instructions = [
    'Log what you accomplished each day in 2 simple lines',
    'Select your mood and rate your productivity level',
    'Add optional notes about your day or feelings',
    'Track your weekly mood and productivity trends'
  ];

  return (
    <ToolLayout
      title="Daily Task & Mood Logger"
      description="Track your daily accomplishments and mood to understand your productivity patterns"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Add New Entry */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Daily Logs</h3>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Today
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log Your Day</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEntry.date || ''}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>What did you accomplish? (Task 1)</Label>
                  <Input
                    placeholder="Completed the project proposal"
                    value={newEntry.task1 || ''}
                    onChange={(e) => setNewEntry({...newEntry, task1: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>What else did you do? (Task 2)</Label>
                  <Input
                    placeholder="Had a productive team meeting"
                    value={newEntry.task2 || ''}
                    onChange={(e) => setNewEntry({...newEntry, task2: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>How did you feel today?</Label>
                  <div className="flex justify-between">
                    {moodEmojis.map((mood) => (
                      <button
                        key={mood.score}
                        onClick={() => selectMood(mood.emoji, mood.score)}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          newEntry.mood === mood.emoji 
                            ? 'bg-blue-100 scale-110'
                            : 'hover:bg-muted'
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Productivity Level (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">1</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEntry.productivity || 5}
                      onChange={(e) => setNewEntry({...newEntry, productivity: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm">10</span>
                    <Badge variant="outline">{newEntry.productivity}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional thoughts about your day..."
                    value={newEntry.notes || ''}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <Button onClick={addEntry} className="w-full">
                  Log Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Weekly Stats */}
        {weeklyStats && (
          <StatsGrid
            variant="cards"
            stats={[
              {
                label: 'Avg Mood', icon: Heart, iconClassName: 'text-pink-500', value: `${weeklyStats.avgMood}/5`,
                caption: `Trend: ${moodTrend === 'improving' ? '📈 Improving' : moodTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}`,
              },
              { label: 'Avg Productivity', icon: TrendingUp, iconClassName: 'text-blue-500', value: `${weeklyStats.avgProductivity}/10`, caption: 'Last 7 days' },
              { label: 'Tasks Logged', icon: BarChart3, iconClassName: 'text-green-500', value: weeklyStats.totalTasks, caption: 'This week' },
              { label: 'Days Logged', icon: Calendar, iconClassName: 'text-purple-500', value: `${weeklyStats.daysLogged}/7`, caption: 'This week' },
            ]}
          />
        )}

        {/* Entries List */}
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">{entry.date}</span>
                        <span className="text-xl">{entry.mood}</span>
                        <Badge variant="outline">Productivity: {entry.productivity}/10</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-foreground">✓ {entry.task1}</p>
                        <p className="text-sm text-foreground">✓ {entry.task2}</p>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground italic">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Start logging your daily progress"
            description="Track what you accomplish each day and how you feel to identify patterns in your productivity."
            actionLabel="Log Your First Day"
            onAction={() => setIsAddingNew(true)}
          />
        )}

        {/* Tips */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Tips for Better Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Be specific:</strong> Instead of "worked on project", try "completed user interface mockups for login page"
            </p>
            <p>
              <strong>Track consistently:</strong> Log your day at the same time each evening for best results
            </p>
            <p>
              <strong>Note patterns:</strong> Look for connections between your mood, productivity, and the type of work you do
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}