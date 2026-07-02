'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolLayout } from '@/components/ui/tool-layout';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function ImageConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('png');
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep the original-image preview URL in sync with the selected file and
  // revoke it on change/unmount so we don't leak object URLs.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Revoke the converted-image object URL whenever it's replaced or on unmount.
  useEffect(() => {
    if (!convertedImage) return;
    return () => URL.revokeObjectURL(convertedImage);
  }, [convertedImage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Image is too large (max 25MB)');
        return;
      }
      setSelectedFile(file);
      setConvertedImage(null);
      toast.success('Image selected successfully!');
    }
  };

  const convertImage = () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsConverting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // JPEG has no alpha channel; fill white first so transparent areas
        // don't render as black after drawImage.
        if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to desired format
        const quality = outputFormat === 'jpeg' || outputFormat === 'jpg' ? 0.9 : undefined;
        const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedImage(url);
            setIsConverting(false);
            toast.success(`Image converted to ${outputFormat.toUpperCase()} successfully!`);
          } else {
            setIsConverting(false);
            toast.error('Failed to convert image');
          }
        }, mimeType, quality);
      };
      img.onerror = () => {
        setIsConverting(false);
        toast.error('Failed to load image — the file may be corrupted');
      };

      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsConverting(false);
      toast.error('Failed to read image file');
    };

    reader.readAsDataURL(selectedFile);
  };

  const downloadImage = () => {
    if (!convertedImage || !selectedFile) return;

    const a = document.createElement('a');
    a.href = convertedImage;
    const originalName = selectedFile.name.replace(/\.[^./]+$/, '');
    a.download = `${originalName}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Image downloaded successfully!');
  };

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Lossless compression, supports transparency' },
    { value: 'jpg', label: 'JPEG', description: 'Lossy compression, smaller file size' },
    { value: 'webp', label: 'WebP', description: 'Modern format, excellent compression' },
  ];

  const instructions = [
    'Click "Select Image" to choose an image file from your device',
    'Choose the output format you want to convert to',
    'Click "Convert Image" to process the conversion',
    'Download the converted image to your device'
  ];

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert images between different formats (PNG, JPEG, WebP, BMP)"
      instructions={instructions}
    >
      <div className="space-y-6">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="converter-file-input">Select Image</Label>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? selectedFile.name : 'Select Image'}
            </Button>
            <input
              id="converter-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Output Format</Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div>
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-muted-foreground">{format.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Convert Button */}
        <Button 
          onClick={convertImage} 
          className="w-full" 
          size="lg"
          disabled={!selectedFile || isConverting}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {isConverting ? 'Converting...' : 'Convert Image'}
        </Button>

        {/* Original Image Preview */}
        {selectedFile && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Original Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img
                  src={previewUrl ?? undefined}
                  alt="Original"
                  className="max-w-full max-h-64 object-contain rounded-lg border border-border"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>Format: {selectedFile.type}</p>
                <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Converted Image */}
        {convertedImage && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Converted Image ({outputFormat.toUpperCase()})
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadImage}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img
                  src={convertedImage}
                  alt="Converted"
                  className="max-w-full max-h-64 object-contain rounded-lg border border-border"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <Button onClick={downloadImage}>
                  <Download className="mr-2 h-4 w-4" />
                  Download {outputFormat.toUpperCase()}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Format Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Format Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">PNG</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Lossless compression</li>
                  <li>• Supports transparency</li>
                  <li>• Best for graphics, logos</li>
                  <li>• Larger file sizes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">JPEG</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Lossy compression</li>
                  <li>• No transparency support</li>
                  <li>• Best for photographs</li>
                  <li>• Smaller file sizes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">WebP</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Modern format</li>
                  <li>• Excellent compression</li>
                  <li>• Supports transparency</li>
                  <li>• Not universally supported</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}