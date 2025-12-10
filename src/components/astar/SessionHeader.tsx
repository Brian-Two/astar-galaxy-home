import { Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SessionStats, Space } from './types';

interface SessionHeaderProps {
  subjectName: string;
  currentSpace: Space | null;
  stats: SessionStats;
  onEndSession: () => void;
}

const intentionLabels = {
  study: {
    label: 'Studying',
    subtitle: 'ASTAR.AI will prioritize breaking down concepts and quizzing you'
  },
  homework: {
    label: 'Doing Homework',
    subtitle: 'ASTAR.AI will help you structure and complete your assignment'
  },
  project: {
    label: 'Project / Research',
    subtitle: 'ASTAR.AI will help you explore ideas and organize your research'
  }
};

export const SessionHeader = ({ subjectName, currentSpace, stats, onEndSession }: SessionHeaderProps) => {
  const intention = currentSpace?.intention || 'study';
  const intentionInfo = intentionLabels[intention];

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex flex-col">
          <h1 className="font-display text-lg font-bold text-foreground">{subjectName}</h1>
          <span className="text-sm text-muted-foreground">{currentSpace?.name || 'No space selected'}</span>
        </div>

        {/* Middle */}
        <div className="flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            {intentionInfo.label}
          </span>
          <span className="text-xs text-muted-foreground mt-1 max-w-md text-center">
            {intentionInfo.subtitle}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
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

          <Button onClick={onEndSession} variant="default" size="sm">
            End Session & Claim Points
          </Button>
        </div>
      </div>
    </div>
  );
};
