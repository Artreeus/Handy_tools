'use client';

import { useState, useMemo } from 'react';
import { Hash, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

export default function TextCounterPage() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const lines = text.split('\n').length;
    
    // Reading time calculation (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(words / 200);
    
    // Speaking time calculation (average 150 words per minute)
    const speakingTimeMinutes = Math.ceil(words / 150);
    
    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTimeMinutes,
      speakingTimeMinutes
    };
  }, [text]);

  const copyStats = () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading time: ${stats.readingTimeMinutes} min
Speaking time: ${stats.speakingTimeMinutes} min`;

    copyToClipboard(statsText, 'Statistics copied to clipboard!', 'Failed to copy statistics');
  };

  const loadSampleText = () => {
    const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.`;
    
    setText(sampleText);
  };

  const instructions = [
    'Type or paste your text into the text area',
    'Watch the statistics update in real-time as you type',
    'Use the copy button to save the statistics',
    'Load sample text to see how the tool works'
  ];

  return (
    <ToolLayout
      title="Character & Word Counter"
      description="Count characters, words, sentences, and get reading time estimates"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="text">Enter your text</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleText}
            >
              Load Sample
            </Button>
          </div>
          <Textarea
            id="text"
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Characters</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.characters.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Characters (no spaces)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.charactersNoSpaces.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Words</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.words.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sentences</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.sentences.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paragraphs</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.paragraphs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lines</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.lines.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reading Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.readingTimeMinutes}</div>
              <div className="text-xs text-muted-foreground">minutes</div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Speaking Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground">{stats.speakingTimeMinutes}</div>
              <div className="text-xs text-muted-foreground">minutes</div>
            </CardContent>
          </Card>
        </div>

        {/* Copy Statistics */}
        {text && (
          <div className="flex justify-center">
            <Button onClick={copyStats} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Statistics
            </Button>
          </div>
        )}

        {/* Additional Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">About Reading & Speaking Times</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Reading time</strong> is calculated based on an average reading speed of 200 words per minute.
            </p>
            <p>
              <strong>Speaking time</strong> is calculated based on an average speaking speed of 150 words per minute.
            </p>
            <p>
              These are estimates and actual times may vary based on complexity of text and individual reading/speaking speed.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}