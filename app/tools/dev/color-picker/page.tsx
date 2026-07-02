'use client';

import { useState, useEffect } from 'react';
import { Palette, Copy, Eye, Pipette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';

export default function ColorPickerPage() {
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [hue, setHue] = useState([217]);
  const [saturation, setSaturation] = useState([91]);
  const [lightness, setLightness] = useState([60]);
  const [red, setRed] = useState([59]);
  const [green, setGreen] = useState([130]);
  const [blue, setBlue] = useState([246]);

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };

    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Convert Hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Update color from HSL sliders
  useEffect(() => {
    const [r, g, b] = hslToRgb(hue[0], saturation[0], lightness[0]);
    setRed([r]);
    setGreen([g]);
    setBlue([b]);
    setSelectedColor(rgbToHex(r, g, b));
  }, [hue, saturation, lightness]);

  // Update color from RGB sliders — takes the new r/g/b directly instead of
  // reading the red/green/blue state, since a slider's onValueChange fires
  // before that slider's own setState has committed.
  const updateFromRgb = (r: number, g: number, b: number) => {
    const [h, s, l] = rgbToHsl(r, g, b);
    setHue([h]);
    setSaturation([s]);
    setLightness([l]);
    setSelectedColor(rgbToHex(r, g, b));
  };

  // Update color from hex input
  const updateFromHex = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const [r, g, b] = hexToRgb(hex);
      const [h, s, l] = rgbToHsl(r, g, b);

      setRed([r]);
      setGreen([g]);
      setBlue([b]);
      setHue([h]);
      setSaturation([s]);
      setLightness([l]);
      setSelectedColor(hex);
    }
  };

  // Keep the hex text field's raw value (which may be an incomplete/invalid
  // in-progress edit) in sync whenever the color changes from another source
  // (sliders, palette clicks, the native color swatch).
  useEffect(() => {
    setHexInput(selectedColor);
  }, [selectedColor]);

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    updateFromHex(value);
  };

  const copyColor = (format: string, value: string) => {
    copyToClipboard(value, `${format} color copied to clipboard!`, 'Failed to copy color');
  };

  const generatePalette = () => {
    const baseHue = hue[0];
    const baseSat = saturation[0];
    const baseLit = lightness[0];
    
    return [
      { name: 'Lighter', color: rgbToHex(...hslToRgb(baseHue, baseSat, Math.min(baseLit + 20, 100))) },
      { name: 'Light', color: rgbToHex(...hslToRgb(baseHue, baseSat, Math.min(baseLit + 10, 100))) },
      { name: 'Base', color: selectedColor },
      { name: 'Dark', color: rgbToHex(...hslToRgb(baseHue, baseSat, Math.max(baseLit - 10, 0))) },
      { name: 'Darker', color: rgbToHex(...hslToRgb(baseHue, baseSat, Math.max(baseLit - 20, 0))) },
    ];
  };

  const palette = generatePalette();

  const instructions = [
    'Use the color picker or sliders to select your desired color',
    'Switch between HSL and RGB modes for different controls',
    'Enter hex codes directly for precise color selection',
    'Copy colors in different formats or generate color palettes'
  ];

  return (
    <ToolLayout
      title="Color Picker & Converter"
      description="Pick colors and convert between different color formats"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Color Display */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-lg border-2 border-border shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Color Input */}
        <div className="space-y-2">
          <Label htmlFor="hex">Hex Color</Label>
          <div className="flex gap-2">
            <Input
              id="hex"
              value={hexInput}
              onChange={(e) => handleHexInputChange(e.target.value)}
              className="font-mono"
              placeholder="#000000"
            />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-12 h-10 rounded border border-border cursor-pointer"
            />
          </div>
        </div>

        {/* Color Controls */}
        <Tabs defaultValue="hsl" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hsl">HSL</TabsTrigger>
            <TabsTrigger value="rgb">RGB</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hsl" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hue: {hue[0]}°</Label>
                <Slider
                  value={hue}
                  onValueChange={setHue}
                  max={360}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Saturation: {saturation[0]}%</Label>
                <Slider
                  value={saturation}
                  onValueChange={setSaturation}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Lightness: {lightness[0]}%</Label>
                <Slider
                  value={lightness}
                  onValueChange={setLightness}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rgb" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Red: {red[0]}</Label>
                <Slider
                  value={red}
                  onValueChange={(value) => { setRed(value); updateFromRgb(value[0], green[0], blue[0]); }}
                  max={255}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Green: {green[0]}</Label>
                <Slider
                  value={green}
                  onValueChange={(value) => { setGreen(value); updateFromRgb(red[0], value[0], blue[0]); }}
                  max={255}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Blue: {blue[0]}</Label>
                <Slider
                  value={blue}
                  onValueChange={(value) => { setBlue(value); updateFromRgb(red[0], green[0], value[0]); }}
                  max={255}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Color Formats */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Color Formats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">HEX</span>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">{selectedColor}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyColor('HEX', selectedColor)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">RGB</span>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  rgb({red[0]}, {green[0]}, {blue[0]})
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyColor('RGB', `rgb(${red[0]}, ${green[0]}, ${blue[0]})`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">HSL</span>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  hsl({hue[0]}, {saturation[0]}%, {lightness[0]}%)
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyColor('HSL', `hsl(${hue[0]}, ${saturation[0]}%, ${lightness[0]}%)`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Generated Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {palette.map((color, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-full h-16 rounded-lg border border-border cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color.color }}
                    onClick={() => copyColor('Palette Color', color.color)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{color.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{color.color}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}