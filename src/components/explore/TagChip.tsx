import { cn } from '@/lib/utils';

interface TagChipProps {
  label: string;
  variant?: 'default' | 'difficulty' | 'subject';
  size?: 'sm' | 'md';
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export const TagChip = ({ label, variant = 'default', size = 'sm' }: TagChipProps) => {
  const baseStyles = cn(
    'inline-flex items-center rounded-full border font-medium',
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  );

  if (variant === 'difficulty') {
    const colorClass = difficultyColors[label.toLowerCase()] || 'bg-secondary text-muted-foreground border-border';
    return <span className={cn(baseStyles, colorClass)}>{label}</span>;
  }

  if (variant === 'subject') {
    return (
      <span className={cn(baseStyles, 'bg-primary/20 text-primary border-primary/30')}>
        {label}
      </span>
    );
  }

  return (
    <span className={cn(baseStyles, 'bg-secondary text-muted-foreground border-border/50')}>
      {label}
    </span>
  );
};
