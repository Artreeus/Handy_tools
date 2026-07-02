'use client';

import { useState } from 'react';
import { Type, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsGrid } from '@/components/ui/stats-grid';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

export default function CaseConverterPage() {
  const [inputText, setInputText] = useState('');

  const convertCase = (type: string) => {
    if (!inputText.trim()) {
      return '';
    }

    switch (type) {
      case 'upper':
        return inputText.toUpperCase();
      case 'lower':
        return inputText.toLowerCase();
      case 'title':
        return inputText.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      case 'sentence':
        return inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase();
      case 'camel':
        return inputText
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, '');
      case 'pascal':
        return inputText
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
      case 'snake':
        return inputText
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('_');
      case 'kebab':
        return inputText
          .replace(/\W+/g, ' ')
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('-');
      default:
        return inputText;
    }
  };

  const copyConverted = (text: string) => {
    if (!text) {
      toast.error('No text to copy');
      return;
    }
    copyToClipboard(text, 'Copied to clipboard!', 'Failed to copy text');
  };

  const caseTypes = [
    { id: 'upper', name: 'UPPERCASE', description: 'Convert to uppercase' },
    { id: 'lower', name: 'lowercase', description: 'Convert to lowercase' },
    { id: 'title', name: 'Title Case', description: 'Capitalize first letter of each word' },
    { id: 'sentence', name: 'Sentence case', description: 'Capitalize first letter only' },
    { id: 'camel', name: 'camelCase', description: 'First word lowercase, others capitalized' },
    { id: 'pascal', name: 'PascalCase', description: 'All words capitalized, no spaces' },
    { id: 'snake', name: 'snake_case', description: 'Lowercase with underscores' },
    { id: 'kebab', name: 'kebab-case', description: 'Lowercase with hyphens' }
  ];

  const instructions = [
    'Enter or paste your text in the input area',
    'Click on any case conversion button to see the result',
    'Use the copy button to copy the converted text',
    'Try different formats to see what works best for your needs'
  ];

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text between different case formats"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="input">Enter your text</Label>
          <Textarea
            id="input"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Case Conversions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseTypes.map((caseType) => {
            const convertedText = convertCase(caseType.id);
            return (
              <Card key={caseType.id} className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {caseType.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyConverted(convertedText)}
                      disabled={!convertedText}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-muted rounded-md p-3 min-h-[60px] text-sm font-mono break-words">
                    {convertedText || (
                      <span className="text-muted-foreground italic">
                        {caseType.description}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Character Count */}
        {inputText && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Text Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsGrid
                stats={[
                  { label: 'Characters', value: inputText.length },
                  { label: 'Characters (no spaces)', value: inputText.replace(/\s/g, '').length },
                  { label: 'Words', value: inputText.trim().split(/\s+/).filter(word => word.length > 0).length },
                  { label: 'Lines', value: inputText.split('\n').length },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}