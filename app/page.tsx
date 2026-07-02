'use client';

import { useState } from 'react';
import {
  Search, Wrench, QrCode, Type, Image, FileText, Code2, Users, Video, DollarSign, ArrowUpRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';

const toolCategories = [
  {
    id: 'qr-tools',
    title: 'QR Code Tools',
    description: 'Generate scannable QR codes with customization options',
    icon: QrCode,
    tint: 'text-blue-600 bg-blue-500/10 dark:text-blue-400',
    tools: [
      { name: 'Text to QR', description: 'Convert any text into a QR code', href: '/tools/qr/text-to-qr' },
      { name: 'URL to QR', description: 'Create QR codes for links', href: '/tools/qr/url-to-qr' },
    ],
  },
  {
    id: 'text-tools',
    title: 'Text Utilities',
    description: 'Transform and analyze text with fast utilities',
    icon: Type,
    tint: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
    tools: [
      { name: 'Case Converter', description: 'Convert between 8 case formats', href: '/tools/text/case-converter' },
      { name: 'Character Counter', description: 'Count words, characters & reading time', href: '/tools/text/counter' },
      { name: 'Lorem Generator', description: 'Generate placeholder text', href: '/tools/text/lorem' },
      { name: 'Base64 Encoder', description: 'Encode and decode Base64', href: '/tools/text/base64' },
    ],
  },
  {
    id: 'dev-tools',
    title: 'Developer Tools',
    description: 'Essential utilities for developers',
    icon: Code2,
    tint: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
    tools: [
      { name: 'JSON Formatter', description: 'Format and validate JSON', href: '/tools/dev/json-formatter' },
      { name: 'CSS Minifier', description: 'Compress CSS code', href: '/tools/dev/css-minifier' },
      { name: 'Color Picker', description: 'Pick and convert colors', href: '/tools/dev/color-picker' },
      { name: 'Password Generator', description: 'Generate secure passwords', href: '/tools/dev/password-generator' },
    ],
  },
  {
    id: 'image-tools',
    title: 'Image & Files',
    description: 'Convert images and verify file integrity',
    icon: Image,
    tint: 'text-violet-600 bg-violet-500/10 dark:text-violet-400',
    tools: [
      { name: 'Format Converter', description: 'Convert between PNG, JPEG, WebP & BMP', href: '/tools/image/converter' },
      { name: 'Hash Generator', description: 'Generate SHA hashes for files & text', href: '/tools/file/hash' },
    ],
  },
  {
    id: 'productivity-tools',
    title: 'Productivity',
    description: 'Boost your focus and workflow',
    icon: Users,
    tint: 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400',
    tools: [
      { name: 'Focus Timer', description: 'Pomodoro timer with reflection', href: '/tools/productivity/focus-timer' },
      { name: 'Meeting to Tasks', description: 'Turn notes into actionable tasks', href: '/tools/productivity/meeting-to-tasks' },
      { name: 'Follow-up Tracker', description: 'Track and schedule email follow-ups', href: '/tools/productivity/follow-up-tracker' },
      { name: 'Idea Organizer', description: 'Capture and categorize ideas', href: '/tools/productivity/idea-organizer' },
      { name: 'Task & Mood Logger', description: 'Log daily tasks with mood tracking', href: '/tools/productivity/task-mood-logger' },
    ],
  },
  {
    id: 'content-tools',
    title: 'Content Creation',
    description: 'Tools for creators and marketers',
    icon: Video,
    tint: 'text-pink-600 bg-pink-500/10 dark:text-pink-400',
    tools: [
      { name: 'Video Title Generator', description: 'Generate titles, hashtags & descriptions', href: '/tools/content/video-title-generator' },
      { name: 'Portfolio Builder', description: 'Create a one-link portfolio', href: '/tools/content/portfolio-builder' },
      { name: 'Take a Breather', description: 'Guided mindful breathing break', href: '/tools/content/take-breather' },
    ],
  },
  {
    id: 'finance-tools',
    title: 'Finance',
    description: 'Track your money, privately',
    icon: DollarSign,
    tint: 'text-teal-600 bg-teal-500/10 dark:text-teal-400',
    tools: [
      { name: 'Income Tracker', description: 'Visual income & expense tracking', href: '/tools/finance/income-tracker' },
    ],
  },
];

const totalTools = toolCategories.reduce((sum, c) => sum + c.tools.length, 0);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = toolCategories
    .map((category) => ({
      ...category,
      tools: category.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.tools.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Toolbox</span>
          </Link>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              aria-label="Search tools"
              placeholder="Search tools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {totalTools} tools · 100% offline · privacy-first
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Every essential tool,{' '}
            <span className="text-brand">in one place</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A fast, privacy-first toolbox for developers, creators, and everyday tasks. Everything runs
            locally in your browser — nothing leaves your device.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-14">
          {filteredCategories.map((category) => (
            <section key={category.id} className="scroll-mt-20">
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.tint}`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.tools.map((tool) => (
                  <Link key={tool.name} href={tool.href} className="group block">
                    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-foreground">{tool.name}</h3>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No tools found</h3>
            <p className="mt-1 text-muted-foreground">Try a different search term.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>© 2026 Toolbox — every tool runs locally for your privacy.</p>
        </div>
      </footer>
    </div>
  );
}
