'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  instructions?: string[];
}

export function ToolLayout({ title, description, children, instructions }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            All tools
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Tool Header */}
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Tool Interface */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
          </div>

          {/* Instructions Sidebar */}
          {instructions && (
            <aside className="lg:col-span-1">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-20">
                <h2 className="text-sm font-semibold text-foreground">How to use</h2>
                <p className="mt-1 text-sm text-muted-foreground">Follow these simple steps</p>
                <ol className="mt-5 space-y-4">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
