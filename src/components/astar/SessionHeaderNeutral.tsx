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
    <div className="sticky top-0 z-20 bg-[#0a0b0d] border-b border-[#1a1b1e] px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex flex-col">
          <h1 
            className="font-display text-lg font-bold"
            style={{ color: subjectColor }}
          >
            {subjectName}
          </h1>
          <span className="text-sm text-[#a0a0a0]">{currentSpace?.name || 'No space selected'}</span>
        </div>

        {/* Middle */}
        <div className="flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-[#1a1b1e] text-[#e0e0e0] text-sm font-medium border border-[#2a2b2e]">
            {intentionInfo.label}
          </span>
          <span className="text-xs text-[#6b6b6b] mt-1 max-w-md text-center">
            {intentionInfo.subtitle}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#a0a0a0]" />
            <span className="font-display font-bold text-[#e0e0e0]">{stats.totalPoints.toLocaleString()} points</span>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex items-center justify-between text-xs text-[#6b6b6b]">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Session XP
              </span>
              <span>{stats.sessionXP} / {stats.maxSessionXP}</span>
            </div>
            <div className="h-2 bg-[#1a1b1e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3a3b3e] rounded-full transition-all"
                style={{ width: `${(stats.sessionXP / stats.maxSessionXP) * 100}%` }}
              />
            </div>
          </div>

          <Button 
            onClick={onEndSession} 
            variant="outline"
            size="sm"
            className="bg-[#1a1b1e] border-[#2a2b2e] text-[#e0e0e0] hover:bg-[#2a2b2e] hover:text-[#ffffff]"
          >
            End Session & Claim Points
          </Button>
        </div>
      </div>
    </div>
  );
};
