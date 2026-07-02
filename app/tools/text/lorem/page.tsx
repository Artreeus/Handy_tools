'use client';

import { useState } from 'react';
import { FileText, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

export default function LoremGeneratorPage() {
  const [generatedText, setGeneratedText] = useState('');
  const [count, setCount] = useState([3]);
  const [type, setType] = useState('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
    'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
    'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
    'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit', 'sed',
    'quia', 'consequuntur', 'magni', 'dolores', 'ratione', 'sequi', 'nesciunt'
  ];

  const generateWord = () => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = () => {
    const sentenceLength = Math.floor(Math.random() * 10) + 8; // 8-17 words
    let sentence = [];
    
    for (let i = 0; i < sentenceLength; i++) {
      sentence.push(generateWord());
    }
    
    // Capitalize first word
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
    
    return sentence.join(' ') + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences
    let sentences = [];
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    
    return sentences.join(' ');
  };

  const generateLorem = () => {
    let result = [];
    const numItems = count[0];

    if (type === 'words') {
      for (let i = 0; i < numItems; i++) {
        result.push(generateWord());
      }
      if (startWithLorem && numItems > 0) {
        result[0] = 'Lorem';
        if (numItems > 1) result[1] = 'ipsum';
      }
      setGeneratedText(result.join(' ') + '.');
    } else if (type === 'sentences') {
      for (let i = 0; i < numItems; i++) {
        result.push(generateSentence());
      }
      if (startWithLorem && numItems > 0) {
        result[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      }
      setGeneratedText(result.join(' '));
    } else if (type === 'paragraphs') {
      for (let i = 0; i < numItems; i++) {
        result.push(generateParagraph());
      }
      if (startWithLorem && numItems > 0) {
        result[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
      }
      setGeneratedText(result.join('\n\n'));
    }

    toast.success(`Generated ${numItems} ${type}!`);
  };

  const copyText = () => {
    if (!generatedText) {
      toast.error('No text to copy');
      return;
    }
    copyToClipboard(generatedText, 'Lorem ipsum text copied to clipboard!', 'Failed to copy text');
  };

  const getMaxCount = () => {
    switch (type) {
      case 'words': return 200;
      case 'sentences': return 50;
      case 'paragraphs': return 20;
      default: return 10;
    }
  };

  const instructions = [
    'Choose the type of content you want to generate',
    'Set the number of items using the slider',
    'Toggle whether to start with classic "Lorem ipsum"',
    'Click "Generate Lorem Ipsum" to create placeholder text'
  ];

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs and layouts"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="sentences">Sentences</SelectItem>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Count: {count[0]} {type}</Label>
            <Slider
              value={count}
              onValueChange={setCount}
              max={getMaxCount()}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="start-lorem"
            checked={startWithLorem}
            onCheckedChange={(checked) => setStartWithLorem(checked === true)}
          />
          <Label htmlFor="start-lorem" className="text-sm">
            Start with "Lorem ipsum"
          </Label>
        </div>

        {/* Generate Button */}
        <Button onClick={generateLorem} className="w-full" size="lg">
          <FileText className="mr-2 h-4 w-4" />
          Generate Lorem Ipsum
        </Button>

        {/* Generated Text */}
        {generatedText && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Generated Text
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {generatedText.split(' ').length} words, {generatedText.length} chars
                  </span>
                  <Button variant="ghost" size="sm" onClick={generateLorem}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyText}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedText}
                readOnly
                rows={12}
                className="resize-none bg-muted border-border"
              />
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">About Lorem Ipsum</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Lorem ipsum is placeholder text commonly used in the printing and typesetting industry.
            </p>
            <p>
              It's derived from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" by Cicero, written in 45 BC.
            </p>
            <p>
              The text is scrambled Latin that doesn't distract readers from focusing on the visual elements of a document or typeface.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}