import { ExternalLink, Users, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagChip } from './TagChip';
import { ExploreItem } from '@/data/exploreData';

interface ExploreCardProps {
  item: ExploreItem;
  onClick: () => void;
  variant?: 'default' | 'compact';
}

export const ExploreCard = ({ item, onClick, variant = 'default' }: ExploreCardProps) => {
  const isCompact = variant === 'compact';

  return (
    <button
      onClick={onClick}
      className={cn(
        'glass-panel text-left transition-all duration-200 hover:bg-card/80 hover:border-primary/30 group flex-shrink-0',
        isCompact ? 'p-4 w-[280px]' : 'p-5 w-[320px]'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={cn(
            'font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2',
            isCompact ? 'text-sm' : 'text-base'
          )}>
            {item.title}
          </h3>
          {item.link && (
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Description */}
        <p className={cn(
          'text-muted-foreground mb-3 line-clamp-2',
          isCompact ? 'text-xs' : 'text-sm'
        )}>
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.subject && (
            <TagChip label={item.subject} variant="subject" size="sm" />
          )}
          {item.difficulty && (
            <TagChip label={item.difficulty} variant="difficulty" size="sm" />
          )}
          {item.tags.slice(0, 2).map(tag => (
            <TagChip key={tag} label={tag} size="sm" />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          {item.stats?.activeUsers && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {item.stats.activeUsers >= 1000 
                ? `${(item.stats.activeUsers / 1000).toFixed(1)}k` 
                : item.stats.activeUsers} active
            </span>
          )}
          {item.stats?.uses && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {item.stats.uses >= 1000 
                ? `${(item.stats.uses / 1000).toFixed(1)}k` 
                : item.stats.uses} uses
            </span>
          )}
          {item.stats?.rating && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {item.stats.rating}
            </span>
          )}
          {item.author && !item.stats?.activeUsers && !item.stats?.uses && (
            <span>by {item.author}</span>
          )}
          {item.availability && (
            <span className="text-primary">{item.availability}</span>
          )}
        </div>
      </div>
    </button>
  );
};
