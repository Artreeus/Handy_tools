const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] ?? 'bg-gray-100 text-gray-800 border-gray-200';
}
