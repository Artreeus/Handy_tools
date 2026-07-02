'use client';

import { useState } from 'react';
import { QrCode, Download, Copy, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadFile } from '@/lib/download';
import { toast } from 'sonner';

export default function URLToQRPage() {
  const [url, setUrl] = useState('');
  const [size, setSize] = useState([256]);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [qrCodeSvg, setQrCodeSvg] = useState('');

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const generateQR = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to generate QR code');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL (include http:// or https://)');
      return;
    }

    try {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        width: size[0],
        margin: 1,
        errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
      });
      setQrCodeSvg(svg);
      toast.success('QR code generated successfully!');
    } catch (err) {
      toast.error('Failed to generate QR code — URL may be too long for this size/error-correction level');
    }
  };

  const downloadQR = () => {
    if (!qrCodeSvg) return;
    downloadFile(qrCodeSvg, 'url-qrcode.svg', 'image/svg+xml');
    toast.success('QR code downloaded!');
  };

  const copyQR = () => {
    if (!qrCodeSvg) return;
    copyToClipboard(qrCodeSvg, 'QR code SVG copied to clipboard!', 'Failed to copy QR code');
  };

  const testUrl = () => {
    if (!url || !isValidUrl(url)) {
      toast.error('Please enter a valid URL first');
      return;
    }
    window.open(url, '_blank');
  };

  const instructions = [
    'Enter the URL you want to encode (include http:// or https://)',
    'Adjust the size and error correction level if needed',
    'Click "Generate QR Code" to create your QR code',
    'Test the URL or download the QR code'
  ];

  return (
    <ToolLayout
      title="URL to QR Code"
      description="Convert any URL into a scannable QR code"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url">URL to encode</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={testUrl}
              disabled={!url || !isValidUrl(url)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          {url && !isValidUrl(url) && (
            <p className="text-sm text-red-500">Please enter a valid URL (include http:// or https://)</p>
          )}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Size: {size[0]}px</Label>
            <Slider
              value={size}
              onValueChange={setSize}
              max={512}
              min={128}
              step={32}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Error Correction</Label>
            <Select value={errorCorrection} onValueChange={setErrorCorrection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Button */}
        <Button onClick={generateQR} className="w-full" size="lg">
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR Code
        </Button>

        {/* QR Code Display */}
        {qrCodeSvg && (
          <div className="space-y-4">
            <div className="flex justify-center p-8 bg-white rounded-lg border-2 border-dashed border-border">
              <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadQR} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download SVG
              </Button>
              <Button onClick={copyQR} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy SVG
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}