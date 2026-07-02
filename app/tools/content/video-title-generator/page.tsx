'use client';

import { useState, useEffect } from 'react';
import { Video, Copy, RefreshCw, Hash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

interface GeneratedContent {
  titles: string[];
  hashtags: string[];
  shortDescription: string;
}

export default function VideoTitleGeneratorPage() {
  const [script, setScript] = useState('');
  const [videoType, setVideoType] = useState('general');
  const [platform, setPlatform] = useState('youtube');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  // Load from localStorage so generated content survives a page refresh
  useEffect(() => {
    const saved = localStorage.getItem('videoTitleGenerator');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.script) setScript(parsed.script);
        if (parsed.generatedContent) setGeneratedContent(parsed.generatedContent);
      } catch {
        toast.error('Could not read saved content; starting fresh');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('videoTitleGenerator', JSON.stringify({ script, generatedContent }));
  }, [script, generatedContent]);

  const generateContent = () => {
    if (!script.trim()) {
      toast.error('Please enter a video script or description');
      return;
    }

    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      const titles = generateTitles(script, videoType, platform);
      const hashtags = generateHashtags(script, videoType, platform);
      const shortDescription = generateShortDescription(script);

      setGeneratedContent({
        titles,
        hashtags,
        shortDescription
      });

      setIsGenerating(false);
      toast.success('Content generated successfully!');
    }, 2000);
  };

  const generateTitles = (content: string, type: string, platform: string): string[] => {
    const words = content.toLowerCase().split(' ');
    const keyWords = words.filter(word => word.length > 4);
    
    const titleTemplates = {
      tutorial: [
        'How to {topic} in {time} Minutes',
        'Complete {topic} Guide for Beginners',
        'Master {topic}: Step-by-Step Tutorial',
        '{topic} Explained Simply',
        'Learn {topic} Fast: Pro Tips'
      ],
      review: [
        '{product} Review: Is It Worth It?',
        'Honest {product} Review After {time}',
        '{product} vs Competition: Which Wins?',
        'Why {product} Changed Everything',
        '{product}: The Good, Bad & Ugly'
      ],
      entertainment: [
        'You Won\'t Believe What Happened...',
        'This {topic} Will Blow Your Mind',
        'Reacting to {topic}',
        '{topic} Gone Wrong!',
        'The Truth About {topic}'
      ],
      general: [
        'Everything You Need to Know About {topic}',
        '{topic}: What Nobody Tells You',
        'I Tried {topic} for {time}',
        'The Ultimate {topic} Experience',
        'Why {topic} is Taking Over'
      ]
    };

    const templates = titleTemplates[type as keyof typeof titleTemplates] || titleTemplates.general;
    const mainTopic = keyWords[0] || 'this';
    
    return templates.map(template => {
      let title = template
        .replace('{topic}', mainTopic)
        .replace('{product}', mainTopic)
        .replace('{time}', ['30', '10', '5', '24 Hours'][Math.floor(Math.random() * 4)]);
      
      if (includeEmojis) {
        const emojis = ['🔥', '💯', '⚡', '🚀', '✨', '🎯', '💡', '🔴'];
        title += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
      }
      
      if (includeNumbers && Math.random() > 0.5) {
        const numbers = ['5 Tips', '10 Secrets', '3 Ways', '7 Steps'];
        title = numbers[Math.floor(Math.random() * numbers.length)] + ': ' + title;
      }
      
      return title;
    });
  };

  const generateHashtags = (content: string, type: string, platform: string): string[] => {
    const words = content.toLowerCase().split(' ');
    const keyWords = words.filter(word => word.length > 3 && word.length < 15);
    
    const commonHashtags = {
      youtube: ['#YouTube', '#Subscribe', '#Like', '#Share', '#Comment'],
      tiktok: ['#TikTok', '#Viral', '#ForYou', '#Trending', '#FYP'],
      instagram: ['#Instagram', '#Reels', '#Story', '#IGTV', '#Explore'],
      shorts: ['#Shorts', '#YouTubeShorts', '#Short', '#QuickTip', '#Viral']
    };

    const typeHashtags = {
      tutorial: ['#Tutorial', '#HowTo', '#Learn', '#Guide', '#Tips'],
      review: ['#Review', '#Honest', '#Opinion', '#Recommendation', '#Test'],
      entertainment: ['#Fun', '#Entertainment', '#Funny', '#Comedy', '#Reaction'],
      general: ['#Content', '#Video', '#New', '#Amazing', '#Awesome']
    };

    const platformTags = commonHashtags[platform as keyof typeof commonHashtags] || commonHashtags.youtube;
    const categoryTags = typeHashtags[type as keyof typeof typeHashtags] || typeHashtags.general;
    
    const contentTags = keyWords.slice(0, 5).map(word => 
      '#' + word.charAt(0).toUpperCase() + word.slice(1)
    );

    return [...platformTags, ...categoryTags, ...contentTags].slice(0, 10);
  };

  const generateShortDescription = (content: string): string => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const firstSentence = sentences[0]?.trim() || content.substring(0, 100);
    
    const descriptions = [
      `${firstSentence}... Watch to find out more!`,
      `In this video: ${firstSentence}. Don't forget to like and subscribe!`,
      `${firstSentence}. What do you think? Let me know in the comments!`,
      `Quick video about ${firstSentence.toLowerCase()}. Hope you enjoy!`,
      `${firstSentence}. Hit that notification bell for more content like this!`
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const copyContent = (content: string, type: string) => {
    copyToClipboard(content, `${type} copied to clipboard!`, 'Failed to copy content');
  };

  const copyAllHashtags = () => {
    if (!generatedContent) return;
    const hashtagString = generatedContent.hashtags.join(' ');
    copyContent(hashtagString, 'All hashtags');
  };

  const loadSampleScript = () => {
    const sampleScript = `In this video, I'm going to show you how to create amazing content for social media. We'll cover the best practices for engagement, how to use trending hashtags effectively, and the secrets that top creators use to grow their audience. I'll also share my personal experience and the mistakes I made when starting out. By the end of this video, you'll have all the tools you need to create viral content that resonates with your audience. Don't forget to like and subscribe for more content creation tips!`;
    setScript(sampleScript);
  };

  const instructions = [
    'Paste your video script or description in the text area',
    'Select your video type and target platform',
    'Customize options like emojis and numbers in titles',
    'Click generate to get AI-powered titles, hashtags, and descriptions'
  ];

  return (
    <ToolLayout
      title="AI Video Title & Hashtag Generator"
      description="Generate click-worthy video titles, SEO hashtags, and descriptions for YouTube, TikTok, and more"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="script">Video Script or Description</Label>
            <Button variant="outline" size="sm" onClick={loadSampleScript}>
              Load Sample
            </Button>
          </div>
          <Textarea
            id="script"
            placeholder="Paste your video script, description, or main talking points here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Video Type</Label>
            <Select value={videoType} onValueChange={setVideoType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Content</SelectItem>
                <SelectItem value="tutorial">Tutorial/How-to</SelectItem>
                <SelectItem value="review">Review/Opinion</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="shorts">YouTube Shorts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emojis"
              checked={includeEmojis}
              onCheckedChange={(checked) => setIncludeEmojis(checked === true)}
            />
            <Label htmlFor="emojis" className="text-sm">
              Include emojis in titles
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
            />
            <Label htmlFor="numbers" className="text-sm">
              Include numbers/lists
            </Label>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateContent} 
          className="w-full" 
          size="lg"
          disabled={isGenerating}
        >
          <Video className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating Content...' : 'Generate Titles & Hashtags'}
        </Button>

        {/* Generated Content */}
        {generatedContent && (
          <div className="space-y-6">
            {/* Titles */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Click-Worthy Titles
                  </span>
                  <Button variant="ghost" size="sm" onClick={generateContent}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {generatedContent.titles.map((title, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium flex-1">{title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyContent(title, 'Title')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <Hash className="mr-2 h-4 w-4" />
                    SEO Hashtags
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyAllHashtags}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((hashtag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => copyContent(hashtag, 'Hashtag')}
                    >
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Short Description */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Short Description
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyContent(generatedContent.shortDescription, 'Description')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground bg-muted p-3 rounded-lg">
                  {generatedContent.shortDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tips */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Content Creation Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Titles:</strong> Use numbers, questions, and emotional triggers. Keep under 60 characters for YouTube.
            </p>
            <p>
              <strong>Hashtags:</strong> Mix popular and niche hashtags. Use 3-5 for YouTube, up to 30 for Instagram.
            </p>
            <p>
              <strong>Descriptions:</strong> Front-load important information and include a clear call-to-action.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}