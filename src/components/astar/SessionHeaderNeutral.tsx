import { Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SessionStats, Space } from './types';

interface SessionHeaderNeutralProps {
  subjectName: string;
  currentSpace: Space | null;
  stats: SessionStats;
  onEndSession: () => void;
  subjectColor: string;
}

const intentionLabels = {
  study: {
    label: 'Study',
    subtitle: 'ASTAR.AI will prioritize breaking down concepts and quizzing you'
  },
  homework: {
    label: 'Homework',
    subtitle: 'ASTAR.AI will help you structure and complete your assignment'
  },
  project: {
    label: 'Project / Research',
    subtitle: 'ASTAR.AI will help you explore ideas and organize your research'
  }
};

export const SessionHeaderNeutral = ({ 
  subjectName, 
  currentSpace, 
  stats, 
  onEndSession,
  subjectColor 
}: SessionHeaderNeutralProps) => {
  const intention = currentSpace?.intention || 'study';
  const intentionInfo = intentionLabels[intention];

  return (
    <div className="sticky top-0 z-20 px-6 py-3 relative overflow-hidden">
      {/* Starry background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 50%, hsl(270 60% 25% / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 50%, hsl(220 70% 20% / 0.3) 0%, transparent 50%),
            hsl(230 35% 7%)
          `,
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 160px 20px, white, transparent),
            radial-gradient(2px 2px at 200px 60px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 250px 90px, white, transparent),
            radial-gradient(2px 2px at 300px 30px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 350px 70px, white, transparent),
            radial-gradient(2px 2px at 400px 50px, rgba(255,255,255,0.5), transparent),
            radial-gradient(ellipse at 30% 50%, hsl(270 60% 25% / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 50%, hsl(220 70% 20% / 0.3) 0%, transparent 50%),
            linear-gradient(to bottom, hsl(230 35% 4%), hsl(230 35% 7%))
          `,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border/30" />
      
      <div className="flex items-center justify-between relative z-10">
        {/* Left side */}
        <div className="flex flex-col">
          <h1 
            className="font-display text-lg font-bold"
            style={{ color: subjectColor }}
          >
            {subjectName}
          </h1>
          <span className="text-sm text-muted-foreground">{currentSpace?.name || 'No space selected'}</span>
        </div>

        {/* Middle */}
        <div className="flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-secondary text-foreground text-sm font-medium border border-border/30">
            {intentionInfo.label}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">{stats.totalPoints.toLocaleString()} points</span>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Session XP
              </span>
              <span>{stats.sessionXP} / {stats.maxSessionXP}</span>
            </div>
            <Progress value={(stats.sessionXP / stats.maxSessionXP) * 100} className="h-2" />
          </div>

          <Button 
            onClick={onEndSession} 
            variant="outline"
            size="sm"
          >
            End Session & Claim Points
          </Button>
        </div>
      </div>
    </div>
  );
};
