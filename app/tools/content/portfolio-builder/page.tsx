'use client';

import { useState, useEffect } from 'react';
import { User, Link, Eye, EyeOff, Copy, Download, Github, Linkedin, Mail, Globe, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '@/lib/use-local-storage';
import { generateId } from '@/lib/id';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolLayout } from '@/components/ui/tool-layout';
import { toast } from 'sonner';

interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  skills: string[];
  projects: Project[];
  isPublic: boolean;
  customUrl: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  tech: string[];
}

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  name: '',
  title: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
  resumeUrl: '',
  skills: [],
  projects: [],
  isPublic: true,
  customUrl: ''
};

export default function PortfolioBuilderPage() {
  const [portfolioData, setPortfolioData] = useLocalStorage<PortfolioData>('portfolioBuilder', DEFAULT_PORTFOLIO_DATA);
  const [skillInput, setSkillInput] = useState('');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    url: '',
    tech: []
  });
  const [techInput, setTechInput] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  // Keep the displayed URL in sync with the saved custom slug (covers both
  // the initial load and any later regeneration).
  useEffect(() => {
    if (portfolioData.customUrl) {
      setGeneratedUrl(`https://portfolio.toolbox.dev/${portfolioData.customUrl}`);
    }
  }, [portfolioData.customUrl]);

  const addSkill = () => {
    if (skillInput.trim() && !portfolioData.skills.includes(skillInput.trim())) {
      setPortfolioData({
        ...portfolioData,
        skills: [...portfolioData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setPortfolioData({
      ...portfolioData,
      skills: portfolioData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addTech = () => {
    if (techInput.trim() && !newProject.tech?.includes(techInput.trim())) {
      setNewProject({
        ...newProject,
        tech: [...(newProject.tech || []), techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setNewProject({
      ...newProject,
      tech: newProject.tech?.filter(tech => tech !== techToRemove) || []
    });
  };

  const addProject = () => {
    if (!newProject.name || !newProject.description) {
      toast.error('Please fill in project name and description');
      return;
    }

    const project: Project = {
      id: generateId(),
      name: newProject.name!,
      description: newProject.description!,
      url: newProject.url || '',
      tech: newProject.tech || []
    };

    setPortfolioData({
      ...portfolioData,
      projects: [...portfolioData.projects, project]
    });

    setNewProject({
      name: '',
      description: '',
      url: '',
      tech: []
    });

    toast.success('Project added successfully!');
  };

  const removeProject = (projectId: string) => {
    setPortfolioData({
      ...portfolioData,
      projects: portfolioData.projects.filter(p => p.id !== projectId)
    });
  };

  const generatePortfolioUrl = () => {
    if (!portfolioData.name) {
      toast.error('Please enter your name first');
      return;
    }

    const baseUrl = portfolioData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'user';
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const customUrl = `${baseUrl}-${randomSuffix}`;
    
    setPortfolioData({
      ...portfolioData,
      customUrl
    });
    toast.success('Portfolio URL generated!');
  };

  const copyPortfolioUrl = () => {
    if (!generatedUrl) {
      toast.error('Generate a portfolio URL first');
      return;
    }
    copyToClipboard(generatedUrl, 'Portfolio URL copied to clipboard!', 'Failed to copy URL');
  };

  const exportPortfolio = () => {
    downloadFile(JSON.stringify(portfolioData, null, 2), 'portfolio-data.json', 'application/json');
    toast.success('Portfolio data exported!');
  };

  const loadSampleData = () => {
    const sampleData: PortfolioData = {
      name: 'Alex Johnson',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with 5+ years of experience building web applications. I love creating user-friendly interfaces and solving complex problems with clean, efficient code.',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'https://alexjohnson.dev',
      github: 'https://github.com/alexjohnson',
      linkedin: 'https://linkedin.com/in/alexjohnson',
      resumeUrl: 'https://drive.google.com/file/d/resume.pdf',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'],
      projects: [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with payment integration and admin dashboard',
          url: 'https://github.com/alexjohnson/ecommerce',
          tech: ['React', 'Node.js', 'MongoDB', 'Stripe']
        },
        {
          id: '2',
          name: 'Task Management App',
          description: 'Collaborative task management tool with real-time updates',
          url: 'https://github.com/alexjohnson/taskapp',
          tech: ['Vue.js', 'Express', 'Socket.io', 'PostgreSQL']
        }
      ],
      isPublic: true,
      customUrl: 'alex-johnson-dev'
    };

    setPortfolioData(sampleData);
    toast.success('Sample data loaded!');
  };

  const instructions = [
    'Fill in your personal information and professional details',
    'Add your skills, projects, and relevant links',
    'Generate a custom portfolio URL to share with employers',
    'Toggle visibility and export your data as needed'
  ];

  return (
    <ToolLayout
      title="One-Link Portfolio Builder"
      description="Create a professional portfolio page with a single shareable link"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Portfolio Builder</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadSampleData}>
              Load Sample
            </Button>
            <Button variant="outline" size="sm" onClick={exportPortfolio}>
              <Download className="mr-2 h-3 w-3" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={portfolioData.name}
                  onChange={(e) => setPortfolioData({...portfolioData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Professional Title</Label>
                <Input
                  placeholder="Software Developer"
                  value={portfolioData.title}
                  onChange={(e) => setPortfolioData({...portfolioData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={portfolioData.email}
                  onChange={(e) => setPortfolioData({...portfolioData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={portfolioData.phone}
                  onChange={(e) => setPortfolioData({...portfolioData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="San Francisco, CA"
                  value={portfolioData.location}
                  onChange={(e) => setPortfolioData({...portfolioData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="https://johndoe.dev"
                  value={portfolioData.website}
                  onChange={(e) => setPortfolioData({...portfolioData, website: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>GitHub</Label>
                <Input
                  placeholder="https://github.com/johndoe"
                  value={portfolioData.github}
                  onChange={(e) => setPortfolioData({...portfolioData, github: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  placeholder="https://linkedin.com/in/johndoe"
                  value={portfolioData.linkedin}
                  onChange={(e) => setPortfolioData({...portfolioData, linkedin: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resume URL</Label>
              <Input
                placeholder="https://drive.google.com/file/d/your-resume.pdf"
                value={portfolioData.resumeUrl}
                onChange={(e) => setPortfolioData({...portfolioData, resumeUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Brief description about yourself and your experience..."
                value={portfolioData.bio}
                onChange={(e) => setPortfolioData({...portfolioData, bio: e.target.value})}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-2">
              <Label>Add Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="JavaScript, React, Node.js..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
            </div>
            {portfolioData.skills.length > 0 && (
              <div className="space-y-2">
                <Label>Your Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {portfolioData.skills.map(skill => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Add New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      placeholder="My Awesome Project"
                      value={newProject.name || ''}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project URL</Label>
                    <Input
                      placeholder="https://github.com/user/project"
                      value={newProject.url || ''}
                      onChange={(e) => setNewProject({...newProject, url: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the project..."
                    value={newProject.description || ''}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Technologies</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="React, Node.js, MongoDB..."
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTech()}
                    />
                    <Button onClick={addTech}>Add</Button>
                  </div>
                  {newProject.tech && newProject.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {newProject.tech.map(tech => (
                        <Badge 
                          key={tech} 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => removeTech(tech)}
                        >
                          {tech} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={addProject}>Add Project</Button>
              </CardContent>
            </Card>

            {portfolioData.projects.length > 0 && (
              <div className="space-y-4">
                <Label>Your Projects</Label>
                {portfolioData.projects.map(project => (
                  <Card key={project.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium text-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                              View Project →
                            </a>
                          )}
                          {project.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.tech.map(tech => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(project.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {/* Portfolio URL Generation */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Portfolio URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={portfolioData.isPublic}
                    onCheckedChange={(checked) => setPortfolioData({...portfolioData, isPublic: checked})}
                  />
                  <Label className="text-sm">
                    {portfolioData.isPublic ? (
                      <span className="flex items-center"><Eye className="mr-1 h-3 w-3" />Public</span>
                    ) : (
                      <span className="flex items-center"><EyeOff className="mr-1 h-3 w-3" />Private</span>
                    )}
                  </Label>
                </div>
                
                {generatedUrl ? (
                  <div className="flex items-center space-x-2">
                    <Input value={generatedUrl} readOnly className="font-mono text-sm" />
                    <Button onClick={copyPortfolioUrl} size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button onClick={generatePortfolioUrl} size="sm" variant="outline" title="Regenerate URL">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={generatePortfolioUrl}>
                    <Link className="mr-2 h-4 w-4" />
                    Generate Portfolio URL
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Preview */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">Portfolio Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-6 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">{portfolioData.name || 'Your Name'}</h1>
                    <p className="text-lg text-slate-600">{portfolioData.title || 'Your Title'}</p>
                    <p className="text-slate-500">{portfolioData.location}</p>
                  </div>

                  {/* Bio */}
                  {portfolioData.bio && (
                    <div className="text-center">
                      <p className="text-slate-700 max-w-2xl mx-auto">{portfolioData.bio}</p>
                    </div>
                  )}

                  {/* Contact Links */}
                  <div className="flex justify-center space-x-4">
                    {portfolioData.email && (
                      <a href={`mailto:${portfolioData.email}`} className="flex items-center text-blue-600 hover:underline">
                        <Mail className="mr-1 h-4 w-4" />
                        Email
                      </a>
                    )}
                    {portfolioData.github && (
                      <a href={portfolioData.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Github className="mr-1 h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {portfolioData.linkedin && (
                      <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Linkedin className="mr-1 h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {portfolioData.website && (
                      <a href={portfolioData.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <Globe className="mr-1 h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>

                  {/* Skills */}
                  {portfolioData.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {portfolioData.skills.map(skill => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {portfolioData.projects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Projects</h3>
                      <div className="space-y-4">
                        {portfolioData.projects.map(project => (
                          <div key={project.id} className="border rounded-lg p-4">
                            <h4 className="font-medium text-slate-900">{project.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                            {project.tech.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.tech.map(tech => (
                                  <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                                ))}
                              </div>
                            )}
                            {project.url && (
                              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                View Project →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}