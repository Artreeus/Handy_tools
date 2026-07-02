'use client';

import { useState } from 'react';
import { Minimize2, Copy, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsGrid } from '@/components/ui/stats-grid';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { toast } from 'sonner';

export default function CSSMinifierPage() {
  const [inputCSS, setInputCSS] = useState('');
  const [outputCSS, setOutputCSS] = useState('');

  const minifyCSS = () => {
    if (!inputCSS.trim()) {
      toast.error('Please enter CSS to minify');
      return;
    }

    try {
      // Basic CSS minification
      let minified = inputCSS
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around specific characters
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*>\s*/g, '>')
        .replace(/\s*\+\s*/g, '+')
        .replace(/\s*~\s*/g, '~')
        // Remove trailing semicolon before closing brace
        .replace(/;}/g, '}')
        // Remove leading/trailing whitespace
        .trim();

      setOutputCSS(minified);
      toast.success('CSS minified successfully!');
    } catch (err) {
      toast.error('Failed to minify CSS');
    }
  };

  const copyOutput = () => {
    if (!outputCSS) {
      toast.error('No minified CSS to copy');
      return;
    }
    copyToClipboard(outputCSS, 'Minified CSS copied to clipboard!', 'Failed to copy CSS');
  };

  const downloadCSS = () => {
    if (!outputCSS) {
      toast.error('No minified CSS to download');
      return;
    }
    downloadFile(outputCSS, 'minified.css', 'text/css');
    toast.success('CSS file downloaded!');
  };

  const loadSampleCSS = () => {
    const sampleCSS = `/* Sample CSS for minification */
.header {
  background-color: #ffffff;
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
}

.navigation ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.navigation li {
  margin-right: 20px;
}

.navigation a {
  text-decoration: none;
  color: #333333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.navigation a:hover {
  color: #007bff;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .navigation ul {
    flex-direction: column;
  }
  
  .navigation li {
    margin-right: 0;
    margin-bottom: 10px;
  }
}`;
    setInputCSS(sampleCSS);
  };

  const getCompressionStats = () => {
    if (!inputCSS || !outputCSS) return null;
    
    const originalSize = new Blob([inputCSS]).size;
    const minifiedSize = new Blob([outputCSS]).size;
    const savings = originalSize - minifiedSize;
    const percentage = ((savings / originalSize) * 100).toFixed(1);
    
    return {
      originalSize,
      minifiedSize,
      savings,
      percentage
    };
  };

  const stats = getCompressionStats();

  const instructions = [
    'Paste your CSS code into the input area',
    'Click "Minify CSS" to compress and optimize your code',
    'Copy the minified CSS or download it as a file',
    'Use minified CSS in production to reduce file size'
  ];

  return (
    <ToolLayout
      title="CSS Minifier"
      description="Compress and optimize CSS code by removing unnecessary whitespace and comments"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="input">CSS Input</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleCSS}
            >
              Load Sample
            </Button>
          </div>
          <Textarea
            id="input"
            placeholder="Paste your CSS here..."
            value={inputCSS}
            onChange={(e) => setInputCSS(e.target.value)}
            rows={12}
            className="font-mono text-sm resize-none"
          />
        </div>

        {/* Minify Button */}
        <Button onClick={minifyCSS} className="w-full" size="lg">
          <Minimize2 className="mr-2 h-4 w-4" />
          Minify CSS
        </Button>

        {/* Output Section */}
        {outputCSS && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Minified CSS
                <div className="flex items-center space-x-2">
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
                    onClick={downloadCSS}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outputCSS}
                readOnly
                rows={8}
                className="font-mono text-sm resize-none bg-muted border-border"
              />
            </CardContent>
          </Card>
        )}

        {/* Compression Stats */}
        {stats && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Compression Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsGrid
                stats={[
                  { label: 'Original Size', value: `${(stats.originalSize / 1024).toFixed(2)} KB` },
                  { label: 'Minified Size', value: `${(stats.minifiedSize / 1024).toFixed(2)} KB` },
                  { label: 'Saved', value: `${(stats.savings / 1024).toFixed(2)} KB`, valueClassName: 'text-green-600' },
                  { label: 'Compression', value: `${stats.percentage}%`, valueClassName: 'text-green-600' },
                ]}
              />
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">About CSS Minification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              CSS minification removes unnecessary characters from CSS code without changing its functionality.
            </p>
            <p>
              This includes removing whitespace, comments, and redundant semicolons to reduce file size.
            </p>
            <p>
              <strong>Benefits:</strong> Faster page load times, reduced bandwidth usage, and improved website performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}