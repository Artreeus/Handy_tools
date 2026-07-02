'use client';

import { useState } from 'react';
import { Mail, Plus, Clock, CheckCircle, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatsGrid } from '@/components/ui/stats-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { ToolLayout } from '@/components/ui/tool-layout';
import { useLocalStorage } from '@/lib/use-local-storage';
import { generateId } from '@/lib/id';
import { getPriorityColor } from '@/lib/colors';
import { toLocalDateString } from '@/lib/utils';
import { toast } from 'sonner';

interface FollowUp {
  id: string;
  recipient: string;
  subject: string;
  context: string;
  sentDate: string;
  followUpDate: string;
  status: 'pending' | 'sent' | 'replied' | 'closed';
  priority: 'high' | 'medium' | 'low';
  type: 'job-application' | 'client-proposal' | 'business-inquiry' | 'networking' | 'other';
  notes: string;
}

export default function FollowUpTrackerPage() {
  const [followUps, setFollowUps] = useLocalStorage<FollowUp[]>('followUpTracker', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState<Partial<FollowUp>>({
    recipient: '',
    subject: '',
    context: '',
    sentDate: toLocalDateString(),
    followUpDate: '',
    status: 'pending',
    priority: 'medium',
    type: 'other',
    notes: ''
  });

  const addFollowUp = () => {
    if (!newFollowUp.recipient || !newFollowUp.subject) {
      toast.error('Please fill in recipient and subject');
      return;
    }

    const followUp: FollowUp = {
      id: generateId(),
      recipient: newFollowUp.recipient!,
      subject: newFollowUp.subject!,
      context: newFollowUp.context || '',
      sentDate: newFollowUp.sentDate!,
      followUpDate: newFollowUp.followUpDate || calculateFollowUpDate(newFollowUp.type!),
      status: 'pending',
      priority: newFollowUp.priority!,
      type: newFollowUp.type!,
      notes: newFollowUp.notes || ''
    };

    setFollowUps([...followUps, followUp]);
    setNewFollowUp({
      recipient: '',
      subject: '',
      context: '',
      sentDate: toLocalDateString(),
      followUpDate: '',
      status: 'pending',
      priority: 'medium',
      type: 'other',
      notes: ''
    });
    setIsAddingNew(false);
    toast.success('Follow-up added successfully!');
  };

  const calculateFollowUpDate = (type: string) => {
    const today = new Date();
    let daysToAdd = 7; // default

    switch (type) {
      case 'job-application': daysToAdd = 7; break;
      case 'client-proposal': daysToAdd = 3; break;
      case 'business-inquiry': daysToAdd = 5; break;
      case 'networking': daysToAdd = 14; break;
      default: daysToAdd = 7;
    }

    const followUpDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return toLocalDateString(followUpDate);
  };

  const updateFollowUpStatus = (id: string, status: FollowUp['status']) => {
    setFollowUps(followUps.map(f => 
      f.id === id ? { ...f, status } : f
    ));
    toast.success('Status updated!');
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps(followUps.filter(f => f.id !== id));
    toast.success('Follow-up deleted!');
  };

  const getDaysUntilFollowUp = (followUpDate: string) => {
    const today = new Date();
    const followUp = new Date(followUpDate);
    const diffTime = followUp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const overdueFollowUps = followUps.filter(f =>
    f.status === 'pending' && getDaysUntilFollowUp(f.followUpDate) < 0
  );

  const upcomingFollowUps = followUps.filter(f => 
    f.status === 'pending' && getDaysUntilFollowUp(f.followUpDate) >= 0 && getDaysUntilFollowUp(f.followUpDate) <= 3
  );

  const instructions = [
    'Add emails you\'ve sent that need follow-up tracking',
    'Set automatic reminders based on email type',
    'Update status when you send follow-ups or receive replies',
    'Monitor overdue and upcoming follow-ups in the dashboard'
  ];

  return (
    <ToolLayout
      title="Email Follow-up Tracker"
      description="Track sent emails and schedule follow-up reminders for job applications, proposals, and business inquiries"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Add New Follow-up */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Follow-up Dashboard</h3>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Follow-up</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <Input
                    placeholder="recipient@company.com"
                    value={newFollowUp.recipient || ''}
                    onChange={(e) => setNewFollowUp({...newFollowUp, recipient: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    placeholder="Application for Software Developer Position"
                    value={newFollowUp.subject || ''}
                    onChange={(e) => setNewFollowUp({...newFollowUp, subject: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={newFollowUp.type} 
                      onValueChange={(value) => setNewFollowUp({...newFollowUp, type: value as FollowUp['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job-application">Job Application</SelectItem>
                        <SelectItem value="client-proposal">Client Proposal</SelectItem>
                        <SelectItem value="business-inquiry">Business Inquiry</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={newFollowUp.priority} 
                      onValueChange={(value) => setNewFollowUp({...newFollowUp, priority: value as FollowUp['priority']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Sent Date</Label>
                    <Input
                      type="date"
                      value={newFollowUp.sentDate || ''}
                      onChange={(e) => setNewFollowUp({...newFollowUp, sentDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={newFollowUp.followUpDate || ''}
                      onChange={(e) => setNewFollowUp({...newFollowUp, followUpDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Context/Notes</Label>
                  <Textarea
                    placeholder="Additional context about this email..."
                    value={newFollowUp.context || ''}
                    onChange={(e) => setNewFollowUp({...newFollowUp, context: e.target.value})}
                    rows={3}
                  />
                </div>
                <Button onClick={addFollowUp} className="w-full">
                  Add Follow-up
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts */}
        {(overdueFollowUps.length > 0 || upcomingFollowUps.length > 0) && (
          <div className="space-y-3">
            {overdueFollowUps.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      {overdueFollowUps.length} overdue follow-up{overdueFollowUps.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            {upcomingFollowUps.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      {upcomingFollowUps.length} follow-up{upcomingFollowUps.length > 1 ? 's' : ''} due in next 3 days
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Follow-ups List */}
        {followUps.length > 0 ? (
          <div className="space-y-4">
            {followUps.map((followUp) => {
              const daysUntil = getDaysUntilFollowUp(followUp.followUpDate);
              return (
                <Card key={followUp.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-foreground">{followUp.subject}</h4>
                          <Badge className={getStatusColor(followUp.status)}>
                            {followUp.status}
                          </Badge>
                          <Badge className={getPriorityColor(followUp.priority)}>
                            {followUp.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">To: {followUp.recipient}</p>
                        {followUp.context && (
                          <p className="text-sm text-muted-foreground">{followUp.context}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Sent: {followUp.sentDate}</span>
                          <span>Follow-up: {followUp.followUpDate}</span>
                          <span className={daysUntil < 0 ? 'text-red-600 font-medium' : daysUntil <= 3 ? 'text-yellow-600 font-medium' : ''}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                             daysUntil === 0 ? 'Due today' : 
                             `${daysUntil} days remaining`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={followUp.status} 
                          onValueChange={(value) => updateFollowUpStatus(followUp.id, value as FollowUp['status'])}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFollowUp(followUp.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Mail}
            title="No follow-ups yet"
            description="Start tracking your email follow-ups to never miss an opportunity."
            actionLabel="Add Your First Follow-up"
            onAction={() => setIsAddingNew(true)}
          />
        )}

        {/* Statistics */}
        {followUps.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Follow-up Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsGrid
                stats={[
                  { label: 'Total', value: followUps.length },
                  { label: 'Pending', value: followUps.filter(f => f.status === 'pending').length, valueClassName: 'text-yellow-600' },
                  { label: 'Replied', value: followUps.filter(f => f.status === 'replied').length, valueClassName: 'text-green-600' },
                  { label: 'Overdue', value: overdueFollowUps.length, valueClassName: 'text-red-600' },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}