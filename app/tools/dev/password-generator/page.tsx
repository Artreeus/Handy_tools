'use client';

import { useState } from 'react';
import { Key, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolLayout } from '@/components/ui/tool-layout';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  // Returns a uniformly distributed random integer in [0, max) using
  // crypto.getRandomValues, rejecting out-of-range draws to avoid modulo bias.
  const getSecureRandomInt = (max: number) => {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0xFFFFFFFF / max) * max;
    let value;
    do {
      crypto.getRandomValues(arr);
      value = arr[0];
    } while (value >= limit);
    return value % max;
  };

  const generatePassword = () => {
    let charset = '';

    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    if (charset === '') {
      toast.error('Please select at least one character type');
      return;
    }

    let generatedPassword = '';
    for (let i = 0; i < length[0]; i++) {
      generatedPassword += charset.charAt(getSecureRandomInt(charset.length));
    }

    setPassword(generatedPassword);
    toast.success('Password generated successfully!');
  };

  const copyPassword = () => {
    if (!password) {
      toast.error('No password to copy');
      return;
    }
    copyToClipboard(password, 'Password copied to clipboard!', 'Failed to copy password');
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'No password', color: 'bg-gray-300' };
    
    let score = 0;
    
    // Length
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    
    // Character types
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score < 3) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score < 5) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score < 7) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  const instructions = [
    'Set your desired password length using the slider',
    'Choose which character types to include in your password',
    'Click "Generate Password" to create a secure password',
    'Copy the password to use it in your accounts'
  ];

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure, random passwords with customizable options"
      instructions={instructions}
    >
      <div className="space-y-6">
        {/* Password Length */}
        <div className="space-y-2">
          <Label>Password Length: {length[0]} characters</Label>
          <Slider
            value={length}
            onValueChange={setLength}
            max={128}
            min={4}
            step={1}
            className="w-full"
          />
        </div>

        {/* Character Options */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Character Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
              />
              <Label htmlFor="uppercase" className="text-sm">
                Uppercase (A-Z)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
              />
              <Label htmlFor="lowercase" className="text-sm">
                Lowercase (a-z)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
              />
              <Label htmlFor="numbers" className="text-sm">
                Numbers (0-9)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
              />
              <Label htmlFor="symbols" className="text-sm">
                Symbols (!@#$%^&*)
              </Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exclude-similar"
              checked={excludeSimilar}
              onCheckedChange={(checked) => setExcludeSimilar(checked === true)}
            />
            <Label htmlFor="exclude-similar" className="text-sm">
              Exclude similar characters (0, O, 1, l, I)
            </Label>
          </div>
        </div>

        {/* Generate Button */}
        <Button onClick={generatePassword} className="w-full" size="lg">
          <Key className="mr-2 h-4 w-4" />
          Generate Password
        </Button>

        {/* Generated Password */}
        {password && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Generated Password
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs text-white ${strength.color}`}>
                    {strength.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generatePassword}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  value={password}
                  readOnly
                  className="font-mono text-sm pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPassword}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Strength Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Password Strength</span>
                  <span>{strength.label}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 7) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}