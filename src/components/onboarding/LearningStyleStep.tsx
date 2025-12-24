import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LEARNING_LEVELS = [
  {
    index: 1,
    label: "Struggling",
    description: "You often need extra time to understand new topics.",
  },
  {
    index: 2,
    label: "Struggling/Average",
    description: "You can learn it, but getting started is the hard part.",
  },
  {
    index: 3,
    label: "Average",
    description: "You usually understand with normal effort and structure.",
  },
  {
    index: 4,
    label: "Average/Gifted",
    description: "You learn quickly once you see the pattern.",
  },
  {
    index: 5,
    label: "Gifted",
    description: "You pick things up fast and like being pushed.",
  },
];

const BARTLE_TYPES = {
  achiever: {
    label: "Achiever",
    description: "Goal-driven. You like clear progress, badges, streaks, and finishing quests.",
  },
  explorer: {
    label: "Explorer",
    description: "Curiosity-driven. You like discovering new topics, tools, and hidden 'bonus' knowledge.",
  },
  socializer: {
    label: "Socializer",
    description: "People-driven. You learn best with teamwork, study groups, and helping others.",
  },
  killer: {
    label: "Competitive",
    description: "Competition-driven. You enjoy leaderboards, challenges, and proving skill under pressure.",
  },
  balanced: {
    label: "Balanced",
    description: "A bit of everything. ASTAR will mix progress goals, exploration, teamwork, and light competition.",
  },
};

interface LearningStyleStepProps {
  learningLevelIndex: number;
  bartleX: number;
  bartleY: number;
  onChange: (field: string, value: number | string) => void;
}

export function LearningStyleStep({
  learningLevelIndex,
  bartleX,
  bartleY,
  onChange,
}: LearningStyleStepProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentLevel = LEARNING_LEVELS.find(l => l.index === learningLevelIndex) || LEARNING_LEVELS[2];

  // Calculate Bartle type from position
  const getBartleType = (x: number, y: number): string => {
    const threshold = 0.3;
    
    if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
      return 'balanced';
    }
    
    // Determine quadrant(s)
    const types: string[] = [];
    
    if (y > threshold) {
      if (x < -threshold) types.push('killer');
      if (x > threshold) types.push('achiever');
    }
    if (y < -threshold) {
      if (x < -threshold) types.push('socializer');
      if (x > threshold) types.push('explorer');
    }
    
    if (types.length === 0) {
      if (y > 0) return x < 0 ? 'killer' : 'achiever';
      return x < 0 ? 'socializer' : 'explorer';
    }
    
    if (types.length === 1) return types[0];
    return types.join(' / ');
  };

  const bartleType = getBartleType(bartleX, bartleY);
  const primaryType = bartleType.split(' / ')[0] as keyof typeof BARTLE_TYPES;
  const bartleInfo = BARTLE_TYPES[primaryType] || BARTLE_TYPES.balanced;

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!graphRef.current) return;
    
    const rect = graphRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let x = ((clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // Clamp values
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));
    
    onChange('bartleX', x);
    onChange('bartleY', y);
    onChange('bartlePrimaryType', getBartleType(x, y));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleDrag(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleDrag(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleDrag(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          How do you learn best?
        </h2>
        <p className="text-muted-foreground">
          Help us tailor your experience
        </p>
      </div>

      {/* Learning Ability Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-base">Learning Ability</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">This helps A★STAR tune pacing + difficulty.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-4">
          <Slider
            value={[learningLevelIndex]}
            onValueChange={([value]) => {
              onChange('learningLevelIndex', value);
              onChange('learningLevelLabel', LEARNING_LEVELS.find(l => l.index === value)?.label || '');
            }}
            min={1}
            max={5}
            step={1}
            className="py-4"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Struggling</span>
            <span>Average</span>
            <span>Gifted</span>
          </div>

          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
            <p className="font-medium text-foreground">{currentLevel.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{currentLevel.description}</p>
          </div>
        </div>
      </div>

      {/* Play Style Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-base">Play Style</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">This helps A★STAR tailor motivation (progress, discovery, social, or competitive).</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Bartle Graph */}
          <div 
            ref={graphRef}
            className={cn(
              "relative w-full max-w-[280px] aspect-square rounded-lg cursor-crosshair select-none",
              "bg-secondary/30 border border-border/30"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Grid lines */}
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50" />
            </div>

            {/* Quadrant labels */}
            <span className="absolute top-2 left-2 text-xs text-muted-foreground">Competitive</span>
            <span className="absolute top-2 right-2 text-xs text-muted-foreground">Achiever</span>
            <span className="absolute bottom-2 left-2 text-xs text-muted-foreground">Socializer</span>
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">Explorer</span>

            {/* Axis labels */}
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 -rotate-90">Players</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 rotate-90">World</span>
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50">Acting</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50">Interacting</span>

            {/* Draggable dot */}
            <div
              className="absolute w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/50 -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
              style={{
                left: `${((bartleX + 1) / 2) * 100}%`,
                top: `${((1 - bartleY) / 2) * 100}%`,
              }}
            />
          </div>

          {/* Description */}
          <div className="w-full p-4 rounded-lg bg-secondary/30 border border-border/30">
            <p className="font-medium text-foreground">
              Your play style: {bartleType.includes('/') ? bartleType : bartleInfo.label}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {bartleType.includes('/') 
                ? `${BARTLE_TYPES[bartleType.split(' / ')[0] as keyof typeof BARTLE_TYPES]?.description.split('.')[0]}. ${BARTLE_TYPES[bartleType.split(' / ')[1] as keyof typeof BARTLE_TYPES]?.description.split('.')[0]}.`
                : bartleInfo.description
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
