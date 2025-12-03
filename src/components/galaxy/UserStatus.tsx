import { Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserStatusProps {
  name: string;
  points: number;
}

export const UserStatus = ({ name, points }: UserStatusProps) => {
  return (
    <div className="fixed top-6 right-6 z-40">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="glass-panel p-3 flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                {name.charAt(0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-display font-bold text-foreground">
                {points.toLocaleString()}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-sm">
            Earn points by completing assignments, study sessions, and projects.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};