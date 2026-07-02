import { LucideIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-8 text-center">
        <Icon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-4">{description}</p>
        <Button onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
