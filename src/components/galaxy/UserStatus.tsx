import { Star } from 'lucide-react';

interface UserStatusProps {
  name: string;
  points: number;
}

export const UserStatus = ({ name, points }: UserStatusProps) => {
  return (
    <div className="fixed top-6 left-6 z-40">
      <div className="glass-panel p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">
              {name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">
              Hey, {name} 👋
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-display font-bold text-foreground">
            {points.toLocaleString()} points
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
          Earn points by completing assignments, study sessions, and projects.
        </p>
      </div>
    </div>
  );
};
