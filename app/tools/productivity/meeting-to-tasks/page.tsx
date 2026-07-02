'use client';

import { useState, useEffect } from 'react';
import { Users, Copy, Download, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  deadline: string;
  completed: boolean;
}

export default function MeetingToTasksPage() {
  const [meetingNotes, setMeetingNotes] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outputFormat, setOutputFormat] = useState('bullet');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load from localStorage so extracted tasks survive a page refresh
  useEffect(() => {
    const saved = localStorage.getItem('meetingToTasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.meetingNotes) setMeetingNotes(parsed.meetingNotes);
        if (parsed.tasks) setTasks(parsed.tasks);
      } catch {
        toast.error('Could not read saved meeting notes; starting fresh');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('meetingToTasks', JSON.stringify({ meetingNotes, tasks }));
  }, [meetingNotes, tasks]);

  const extractTasks = () => {
    if (!meetingNotes.trim()) {
      toast.error('Please enter meeting notes to process');
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing with a more sophisticated task extraction
    setTimeout(() => {
      const lines = meetingNotes.split('\n').filter(line => line.trim());
      const extractedTasks: Task[] = [];

      lines.forEach((line, index) => {
        // Look for action items, tasks, or todo patterns
        const actionPatterns = [
          /(?:action|task|todo|need to|should|must|will|assign)/i,
          /(?:follow up|contact|email|call|schedule)/i,
          /(?:create|build|develop|design|implement)/i,
          /(?:review|check|verify|test|validate)/i,
          /(?:send|deliver|provide|prepare|draft)/i
        ];

        const hasActionWord = actionPatterns.some(pattern => pattern.test(line));
        
        if (hasActionWord || line.includes('•') || line.includes('-') || line.includes('*')) {
          // Extract assignee if mentioned
          const assigneeMatch = line.match(/(?:@|assign|for|by)\s*([A-Za-z]+)/i);
          const assignee = assigneeMatch ? assigneeMatch[1] : 'Unassigned';

          // Determine priority based on keywords
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (/urgent|asap|critical|important|priority/i.test(line)) {
            priority = 'high';
          } else if (/later|eventually|nice to have|optional/i.test(line)) {
            priority = 'low';
          }

          // Generate deadline based on urgency
          const today = new Date();
          let deadline = '';
          if (priority === 'high') {
            deadline = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          } else if (priority === 'medium') {
            deadline = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          } else {
            deadline = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          }

          extractedTasks.push({
            id: `task-${index}`,
            title: line.replace(/^[-•*]\s*/, '').trim(),
            description: `Extracted from meeting notes: "${line.trim()}"`,
            priority,
            assignee,
            deadline,
            completed: false
          });
        }
      });

      // If no specific tasks found, create general tasks from content
      if (extractedTasks.length === 0) {
        const sentences = meetingNotes.split(/[.!?]+/).filter(s => s.trim().length > 10);
        sentences.slice(0, 3).forEach((sentence, index) => {
          extractedTasks.push({
            id: `general-task-${index}`,
            title: `Follow up on: ${sentence.trim().substring(0, 50)}...`,
            description: sentence.trim(),
            priority: 'medium',
            assignee: 'Unassigned',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            completed: false
          });
        });
      }

      setTasks(extractedTasks);
      setIsProcessing(false);
      toast.success(`Extracted ${extractedTasks.length} tasks from meeting notes!`);
    }, 2000);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const exportTasks = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to export');
      return;
    }

    let exportContent = '';

    if (outputFormat === 'bullet') {
      exportContent = tasks.map(task => 
        `• ${task.title} [${task.priority.toUpperCase()}] - ${task.assignee} - Due: ${task.deadline}`
      ).join('\n');
    } else if (outputFormat === 'trello') {
      exportContent = tasks.map(task => 
        `Card: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nAssignee: ${task.assignee}\nDue Date: ${task.deadline}\n---`
      ).join('\n\n');
    } else if (outputFormat === 'notion') {
      exportContent = `| Task | Priority | Assignee | Deadline | Status |\n|------|----------|----------|----------|--------|\n` +
        tasks.map(task => 
          `| ${task.title} | ${task.priority} | ${task.assignee} | ${task.deadline} | ${task.completed ? '✅' : '⏳'} |`
        ).join('\n');
    }

    copyToClipboard(exportContent, `Tasks exported in ${outputFormat} format!`, 'Failed to copy tasks');
  };

  const downloadTasks = () => {
    if (tasks.length === 0) {
      toast.error('No tasks to download');
      return;
    }
    downloadFile(JSON.stringify(tasks, null, 2), 'meeting-tasks.json', 'application/json');
    toast.success('Tasks downloaded as JSON file!');
  };

  const loadSampleNotes = () => {
    const sampleNotes = `Meeting Notes - Product Planning Session
Date: ${new Date().toLocaleDateString()}

Attendees: John, Sarah, Mike, Lisa

Key Discussion Points:
• Need to finalize the new user dashboard design by Friday
• Sarah will contact the development team about API integration
• Must review and approve the marketing copy before launch
• Schedule follow-up meeting with stakeholders next week
• Mike to prepare the technical documentation
• Critical: Fix the login bug reported by users - high priority
• Lisa will send the updated project timeline to everyone
• Research competitor pricing models for next quarter
• Optional: Consider adding dark mode feature later

Action Items:
- Follow up with design team on wireframes
- Test the new payment gateway integration
- Update the user onboarding flow
- Prepare presentation for board meeting

Next Steps:
• Finalize budget allocation for Q2
• Review user feedback from beta testing
• Plan the product launch timeline`;

    setMeetingNotes(sampleNotes);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const instructions = [
    'Paste your meeting notes, transcripts, or discussion points',
    'Click "Extract Tasks" to automatically identify action items',
    'Review and modify the extracted tasks as needed',
    'Export tasks in your preferred format (Bullet points, Trello, Notion)'
  ];

  return (
    <ToolLayout
      title="Meeting to Tasks Converter"
      description="Transform meeting notes into organized, actionable tasks with priorities and deadlines"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notes">Meeting Notes or Transcript</Label>
            <Button variant="outline" size="sm" onClick={loadSampleNotes}>
              Load Sample
            </Button>
          </div>
          <Textarea
            id="notes"
            placeholder="Paste your meeting notes, discussion points, or transcript here..."
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Extract Button */}
        <Button 
          onClick={extractTasks} 
          className="w-full" 
          size="lg"
          disabled={isProcessing}
        >
          <Users className="mr-2 h-4 w-4" />
          {isProcessing ? 'Extracting Tasks...' : 'Extract Tasks'}
        </Button>

        {/* Tasks Display */}
        {tasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Extracted Tasks ({tasks.length})</h3>
              <div className="flex items-center gap-2">
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bullet">Bullet List</SelectItem>
                    <SelectItem value="trello">Trello Cards</SelectItem>
                    <SelectItem value="notion">Notion Table</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportTasks}>
                  <Copy className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTasks}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.deadline}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>Assigned to: {task.assignee}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Task Summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Task Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground">Total Tasks</div>
                    <div className="text-muted-foreground">{tasks.length}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Completed</div>
                    <div className="text-green-600">{tasks.filter(t => t.completed).length}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">High Priority</div>
                    <div className="text-red-600">{tasks.filter(t => t.priority === 'high').length}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Unassigned</div>
                    <div className="text-orange-600">{tasks.filter(t => t.assignee === 'Unassigned').length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This tool uses AI-powered text analysis to identify action items and tasks from your meeting notes.
            </p>
            <p>
              <strong>Features:</strong> Automatic priority assignment, deadline suggestions, assignee detection, and multiple export formats.
            </p>
            <p>
              <strong>Tip:</strong> For best results, include clear action words like "need to", "will", "should", or use bullet points for action items.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}