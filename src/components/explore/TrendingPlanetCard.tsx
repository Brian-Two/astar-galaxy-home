import { Users } from 'lucide-react';
import { ExploreItem } from '@/data/exploreData';

// Planet colors matching the galaxy theme
const planetColors = [
  'from-cyan-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-lime-400 to-green-600',
  'from-fuchsia-400 to-pink-600',
  'from-sky-400 to-indigo-600',
];

interface TrendingPlanetCardProps {
  item: ExploreItem;
  onClick: () => void;
  index: number;
}

export const TrendingPlanetCard = ({ item, onClick, index }: TrendingPlanetCardProps) => {
  const colorClass = planetColors[index % planetColors.length];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-4 group flex-shrink-0 w-[140px]"
    >
      {/* Planet sphere */}
      <div 
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${colorClass} relative overflow-hidden transition-transform duration-300 group-hover:scale-110`}
        style={{
          boxShadow: `0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.1)`,
        }}
      >
        {/* Surface details */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-3 left-4 w-6 h-3 rounded-full bg-white/20" />
          <div className="absolute bottom-4 right-3 w-8 h-4 rounded-full bg-black/10" />
          <div className="absolute top-1/2 left-1/3 w-4 h-2 rounded-full bg-white/10" />
        </div>
        {/* Shine effect */}
        <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-white/40 blur-sm" />
      </div>

      {/* Planet name */}
      <span className="font-display text-sm text-foreground text-center line-clamp-2 group-hover:text-white transition-colors">
        {item.title}
      </span>

      {/* Stats */}
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        {item.stats?.activeUsers && item.stats.activeUsers >= 1000 
          ? `${(item.stats.activeUsers / 1000).toFixed(1)}k` 
          : item.stats?.activeUsers} active
      </span>
    </button>
  );
};
