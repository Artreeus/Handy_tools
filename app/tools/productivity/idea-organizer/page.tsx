'use client';

import { useState } from 'react';
import { Lightbulb, Plus, Search, Tag, Star, Archive, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: 'video-idea' | 'business-tool' | 'random-thought' | 'project' | 'improvement';
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in-progress' | 'completed' | 'archived';
  tags: string[];
  dateCreated: string;
  dateModified: string;
  isPinned: boolean;
}

const categories = [
  { value: 'video-idea', label: 'Video Idea', color: 'bg-red-100 text-red-800' },
  { value: 'business-tool', label: 'Business Tool', color: 'bg-blue-100 text-blue-800' },
  { value: 'project', label: 'Project', color: 'bg-green-100 text-green-800' },
  { value: 'improvement', label: 'Improvement', color: 'bg-purple-100 text-purple-800' },
  { value: 'random-thought', label: 'Random Thought', color: 'bg-gray-100 text-gray-800' }
];

export default function IdeaOrganizerPage() {
  const [ideas, setIdeas] = useLocalStorage<Idea[]>('ideaOrganizer', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIdea, setNewIdea] = useState<Partial<Idea>>({
    title: '',
    description: '',
    category: 'random-thought',
    priority: 'medium',
    status: 'new',
    tags: [],
    isPinned: false
  });
  const [tagInput, setTagInput] = useState('');

  const addIdea = () => {
    if (!newIdea.title || !newIdea.description) {
      toast.error('Please fill in title and description');
      return;
    }

    const idea: Idea = {
      id: generateId(),
      title: newIdea.title!,
      description: newIdea.description!,
      category: newIdea.category!,
      priority: newIdea.priority!,
      status: 'new',
      tags: newIdea.tags || [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPinned: false
    };

    setIdeas([idea, ...ideas]);
    setNewIdea({
      title: '',
      description: '',
      category: 'random-thought',
      priority: 'medium',
      status: 'new',
      tags: [],
      isPinned: false
    });
    setTagInput('');
    setIsAddingNew(false);
    toast.success('Idea added successfully!');
  };

  const addTag = () => {
    if (tagInput.trim() && !newIdea.tags?.includes(tagInput.trim())) {
      setNewIdea({
        ...newIdea,
        tags: [...(newIdea.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewIdea({
      ...newIdea,
      tags: newIdea.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const togglePin = (id: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, isPinned: !idea.isPinned, dateModified: new Date().toISOString() } : idea
    ));
  };

  const updateStatus = (id: string, status: Idea['status']) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, status, dateModified: new Date().toISOString() } : idea
    ));
    toast.success('Status updated!');
  };

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
    toast.success('Idea deleted!');
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredIdeas = ideas
    .filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || idea.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || idea.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by date modified (newest first)
      return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    });

  const quickAddIdea = (text: string) => {
    // AI-powered categorization based on keywords
    let category: Idea['category'] = 'random-thought';
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('video') || lowerText.includes('youtube') || lowerText.includes('content')) {
      category = 'video-idea';
    } else if (lowerText.includes('business') || lowerText.includes('tool') || lowerText.includes('app')) {
      category = 'business-tool';
    } else if (lowerText.includes('project') || lowerText.includes('build') || lowerText.includes('create')) {
      category = 'project';
    } else if (lowerText.includes('improve') || lowerText.includes('better') || lowerText.includes('fix')) {
      category = 'improvement';
    }

    const idea: Idea = {
      id: generateId(),
      title: text.length > 50 ? text.substring(0, 50) + '...' : text,
      description: text,
      category,
      priority: 'medium',
      status: 'new',
      tags: [],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPinned: false
    };

    setIdeas([idea, ...ideas]);
    toast.success(`Idea categorized as "${categories.find(c => c.value === category)?.label}" and added!`);
  };

  const instructions = [
    'Quickly capture ideas using the brain dump feature',
    'AI automatically categorizes your ideas based on content',
    'Use tags, priorities, and status to organize your thoughts',
    'Pin important ideas and search through your collection'
  ];

  return (
    <ToolLayout
      title="Idea Organizer & AI Categorizer"
      description="Capture, organize, and categorize your ideas with AI-powered sorting"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Quick Add & Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Quick brain dump: Type any idea and press Enter..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  quickAddIdea(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="flex-1"
            />
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Detailed
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Idea</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Brief title for your idea"
                      value={newIdea.title || ''}
                      onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Detailed description of your idea..."
                      value={newIdea.description || ''}
                      onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={newIdea.category} 
                        onValueChange={(value) => setNewIdea({...newIdea, category: value as Idea['category']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select 
                        value={newIdea.priority} 
                        onValueChange={(value) => setNewIdea({...newIdea, priority: value as Idea['priority']})}
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
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Tag className="h-3 w-3" />
                      </Button>
                    </div>
                    {newIdea.tags && newIdea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {newIdea.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={addIdea} className="w-full">
                    Add Idea
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <div className="grid gap-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className={`border-border ${idea.isPinned ? 'ring-2 ring-yellow-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {idea.isPinned && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        <h4 className="font-medium text-foreground">{idea.title}</h4>
                        <Badge className={getCategoryColor(idea.category)}>
                          {categories.find(c => c.value === idea.category)?.label}
                        </Badge>
                        <Badge className={getPriorityColor(idea.priority)}>
                          {idea.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{idea.description}</p>
                      {idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {idea.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(idea.dateCreated).toLocaleDateString()}
                        {idea.dateModified !== idea.dateCreated && (
                          <span> • Modified: {new Date(idea.dateModified).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={idea.status} 
                        onValueChange={(value) => updateStatus(idea.id, value as Idea['status'])}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(idea.id)}
                      >
                        <Star className={`h-3 w-3 ${idea.isPinned ? 'text-yellow-500 fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIdea(idea.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="No ideas yet"
            description="Start capturing your thoughts and let AI help organize them."
            actionLabel="Add Your First Idea"
            onAction={() => setIsAddingNew(true)}
          />
        )}

        {/* Statistics */}
        {ideas.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Idea Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsGrid
                stats={[
                  { label: 'Total Ideas', value: ideas.length },
                  { label: 'Pinned', value: ideas.filter(i => i.isPinned).length, valueClassName: 'text-yellow-600' },
                  { label: 'In Progress', value: ideas.filter(i => i.status === 'in-progress').length, valueClassName: 'text-blue-600' },
                  { label: 'Completed', value: ideas.filter(i => i.status === 'completed').length, valueClassName: 'text-green-600' },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}