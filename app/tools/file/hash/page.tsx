'use client';

import { useState, useRef } from 'react';
import { Hash, Upload, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export default function HashGeneratorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [hashResults, setHashResults] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File is too large (max 200MB)');
        return;
      }
      setSelectedFile(file);
      setHashResults({});
      toast.success('File selected successfully!');
    }
  };

  const generateHashes = async (data: BufferSource) => {
    setIsGenerating(true);
    const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const results: Record<string, string> = {};

    for (const algorithm of algorithms) {
      try {
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        results[algorithm] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        results[algorithm] = 'Not supported';
      }
    }

    setHashResults(results);
    setIsGenerating(false);
    toast.success('Hashes generated successfully!');
  };

  const generateFileHashes = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      await generateHashes(buffer);
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsArrayBuffer(selectedFile);
  };

  const generateTextHashes = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }
    await generateHashes(new TextEncoder().encode(textInput));
  };

  const copyHash = (algorithm: string, hash: string) => {
    copyToClipboard(hash, `${algorithm} hash copied to clipboard!`, 'Failed to copy hash');
  };

  const loadSampleText = () => {
    setTextInput('Hello, World! This is a sample text for hash generation.');
  };

  const instructions = [
    'Choose between file or text input for hash generation',
    'Select a file or enter text in the input area',
    'Click "Generate Hashes" to create multiple hash values',
    'Copy individual hashes or compare them for verification'
  ];

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512) for files and text"
      instructions={instructions}
    >
      <div className="space-y-6">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="file">File Input</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text">Text to hash</Label>
                <Button variant="outline" size="sm" onClick={loadSampleText}>
                  Load Sample
                </Button>
              </div>
              <Textarea
                id="text"
                placeholder="Enter text to generate hashes..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={generateTextHashes} 
              className="w-full" 
              size="lg"
              disabled={isGenerating}
            >
              <Hash className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Hashes'}
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label>Select File</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : 'Select File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  File size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
            <Button 
              onClick={generateFileHashes} 
              className="w-full" 
              size="lg"
              disabled={!selectedFile || isGenerating}
            >
              <Hash className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Hashes'}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Hash Results */}
        {Object.keys(hashResults).length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Generated Hashes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(hashResults).map(([algorithm, hash]) => (
                <div key={algorithm} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{algorithm}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyHash(algorithm, hash)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <code className="text-xs font-mono break-all text-foreground">
                      {hash}
                    </code>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Hash Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Hash Algorithm Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">SHA-1</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• 160-bit hash value</li>
                  <li>• Deprecated for security</li>
                  <li>• Still used in some systems</li>
                  <li>• Being phased out</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">SHA-256</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• 256-bit hash value</li>
                  <li>• Cryptographically secure</li>
                  <li>• Used in Bitcoin</li>
                  <li>• Current standard</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">SHA-512</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• 512-bit hash value</li>
                  <li>• Highest security</li>
                  <li>• Slower computation</li>
                  <li>• Future-proof</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>File Integrity:</strong> Verify that files haven't been corrupted or tampered with.
            </p>
            <p>
              <strong>Password Storage:</strong> Store hashed passwords instead of plain text (with salt).
            </p>
            <p>
              <strong>Digital Signatures:</strong> Create unique fingerprints for documents and data.
            </p>
            <p>
              <strong>Blockchain:</strong> Secure transactions and create proof-of-work systems.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}