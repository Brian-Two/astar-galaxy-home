import { Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Space } from './types';
import { cn } from '@/lib/utils';
import astarLogo from '@/assets/astar-logo.png';

interface SpacesSidebarProps {
  spaces: Space[];
  onSpaceSelect: (spaceId: string) => void;
  onNewSession: () => void;
}

export const SpacesSidebar = ({ spaces, onSpaceSelect, onNewSession }: SpacesSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-full bg-card/50 border-r border-border flex flex-col">
      {/* Logo */}
      <div 
        className="p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-2">
          <img src={astarLogo} alt="ASTAR" className="w-8 h-8" />
          <span className="font-display font-bold text-foreground">ASTAR.AI</span>
        </div>
      </div>

      {/* Spaces */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs uppercase text-muted-foreground font-semibold mb-3">
          Spaces in this subject
        </h3>
        <div className="space-y-1">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => onSpaceSelect(space.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors text-sm",
                space.active
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="truncate">{space.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* New Session Button */}
      <div className="p-4 border-t border-border">
        <Button onClick={onNewSession} className="w-full gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          New ASTAR Session
        </Button>
      </div>
    </div>
  );
};
