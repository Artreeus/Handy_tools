'use client';

import { useState } from 'react';
import { Code, Copy, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatsGrid } from '@/components/ui/stats-grid';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { toast } from 'sonner';

export default function JSONFormatterPage() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [error, setError] = useState('');

  const formatJson = () => {
    if (!inputJson.trim()) {
      toast.error('Please enter JSON to format');
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize));
      setOutputJson(formatted);
      setError('');
      toast.success('JSON formatted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutputJson('');
      toast.error('Invalid JSON format');
    }
  };

  const minifyJson = () => {
    if (!inputJson.trim()) {
      toast.error('Please enter JSON to minify');
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setError('');
      toast.success('JSON minified successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutputJson('');
      toast.error('Invalid JSON format');
    }
  };

  const validateJson = () => {
    if (!inputJson.trim()) {
      toast.error('Please enter JSON to validate');
      return;
    }

    try {
      JSON.parse(inputJson);
      setError('');
      toast.success('JSON is valid!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      toast.error('JSON is invalid');
    }
  };

  const copyOutput = () => {
    if (!outputJson) {
      toast.error('No formatted JSON to copy');
      return;
    }
    copyToClipboard(outputJson, 'Formatted JSON copied to clipboard!', 'Failed to copy JSON');
  };

  const downloadJson = () => {
    if (!outputJson) {
      toast.error('No formatted JSON to download');
      return;
    }
    downloadFile(outputJson, 'formatted.json', 'application/json');
    toast.success('JSON file downloaded!');
  };

  const loadSampleJson = () => {
    const sampleJson = {
      "name": "John Doe",
      "age": 30,
      "city": "New York",
      "hobbies": ["reading", "coding", "traveling"],
      "address": {
        "street": "123 Main St",
        "zipCode": "10001"
      },
      "isActive": true,
      "balance": 1250.75
    };
    setInputJson(JSON.stringify(sampleJson, null, 2));
  };

  const instructions = [
    'Paste your JSON data into the input area',
    'Choose your preferred indentation size',
    'Click "Format JSON" to beautify or "Minify JSON" to compress',
    'Use "Validate JSON" to check if your JSON is valid'
  ];

  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format, validate, and minify JSON data with syntax highlighting"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="input">JSON Input</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleJson}
            >
              Load Sample
            </Button>
          </div>
          <Textarea
            id="input"
            placeholder="Paste your JSON here..."
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            rows={8}
            className="font-mono text-sm resize-none"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="indent">Indent Size:</Label>
            <Select value={indentSize} onValueChange={setIndentSize}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={validateJson} variant="outline">
              <Code className="mr-2 h-4 w-4" />
              Validate
            </Button>
            <Button onClick={minifyJson} variant="outline">
              Minify
            </Button>
            <Button onClick={formatJson}>
              Format JSON
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>JSON Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Output Section */}
        {outputJson && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Formatted JSON
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {outputJson.split('\n').length} lines, {outputJson.length} chars
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyOutput}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadJson}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={outputJson}
                  readOnly
                  rows={12}
                  className="font-mono text-sm resize-none bg-muted border-border"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* JSON Statistics */}
        {inputJson && !error && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">JSON Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsGrid
                stats={[
                  { label: 'Characters', value: inputJson.length },
                  { label: 'Lines', value: inputJson.split('\n').length },
                  { label: 'Size', value: `${(new Blob([inputJson]).size / 1024).toFixed(2)} KB` },
                  { label: 'Status', value: 'Valid JSON', valueClassName: 'text-green-600' },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}