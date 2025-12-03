import { Star, Settings, LogOut } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserStatusProps {
  name: string;
  points: number;
  email?: string;
}

export const UserStatus = ({ name, points, email = 'user@example.com' }: UserStatusProps) => {
  return (
    <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
      {/* Points Box with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="glass-panel px-4 py-2 flex items-center gap-2 cursor-pointer">
            <Star className="w-4 h-4 text-white fill-white" />
            <span className="font-display font-bold text-foreground">
              {points.toLocaleString()}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-sm">
            Earn points by completing assignments, study sessions, and projects.
          </p>
        </TooltipContent>
      </Tooltip>

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50">
            <span className="text-sm font-bold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <div className="px-3 py-3">
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
