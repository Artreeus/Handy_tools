'use client';

import { useState } from 'react';
import { Code, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

export default function Base64Page() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const encodeBase64 = () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to encode');
      return;
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setOutputText(encoded);
      toast.success('Text encoded successfully!');
    } catch (err) {
      toast.error('Failed to encode text');
    }
  };

  const decodeBase64 = () => {
    if (!inputText.trim()) {
      toast.error('Please enter Base64 text to decode');
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(inputText)));
      setOutputText(decoded);
      toast.success('Text decoded successfully!');
    } catch (err) {
      toast.error('Invalid Base64 format');
    }
  };

  const copyOutput = () => {
    if (!outputText) {
      toast.error('No output to copy');
      return;
    }
    copyToClipboard(outputText, 'Output copied to clipboard!', 'Failed to copy output');
  };

  const swapInputOutput = () => {
    if (!outputText) {
      toast.error('No output to swap');
      return;
    }
    
    setInputText(outputText);
    setOutputText('');
    setActiveTab(activeTab === 'encode' ? 'decode' : 'encode');
    toast.success('Input and output swapped!');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  const loadSample = () => {
    if (activeTab === 'encode') {
      setInputText('Hello, World! This is a sample text for Base64 encoding.');
    } else {
      setInputText('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=');
    }
  };

  const instructions = [
    'Choose between Encode or Decode tabs',
    'Enter your text in the input area',
    'Click the corresponding button to process',
    'Copy the result or swap input/output for reverse operation'
  ];

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode and decode text using Base64 encoding"
      instructions={instructions}
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>
          
          <TabsContent value="encode" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input">Text to encode</Label>
                <Button variant="outline" size="sm" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>
              <Textarea
                id="input"
                placeholder="Enter text to encode..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button onClick={encodeBase64} className="w-full">
              <Code className="mr-2 h-4 w-4" />
              Encode to Base64
            </Button>
          </TabsContent>
          
          <TabsContent value="decode" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input">Base64 text to decode</Label>
                <Button variant="outline" size="sm" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>
              <Textarea
                id="input"
                placeholder="Enter Base64 text to decode..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none font-mono text-sm"
              />
            </div>
            <Button onClick={decodeBase64} className="w-full">
              <Code className="mr-2 h-4 w-4" />
              Decode from Base64
            </Button>
          </TabsContent>
        </Tabs>

        {/* Output */}
        {outputText && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                {activeTab === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={swapInputOutput}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyOutput}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outputText}
                readOnly
                rows={6}
                className={`resize-none bg-muted border-border ${
                  activeTab === 'encode' ? 'font-mono text-sm' : ''
                }`}
              />
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={clearAll} variant="outline" className="flex-1">
            Clear All
          </Button>
        </div>

        {/* Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">About Base64 Encoding</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format.
            </p>
            <p>
              It's commonly used for encoding data in email, web pages, and other text-based formats where binary data needs to be transmitted or stored.
            </p>
            <p>
              <strong>Note:</strong> Base64 encoding increases the size of data by approximately 33%.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}