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
    <div 
      className="sticky top-0 z-20 border-b border-border px-6 py-3 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, hsl(230, 35%, 6%) 0%, hsl(230, 35%, 9%) 50%, hsl(250, 30%, 12%) 100%)'
      }}
    >
      {/* Starry overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 50px 160px, white, transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 130px 80px, white, transparent),
            radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 200px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 250px 90px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 300px 140px, white, transparent),
            radial-gradient(1px 1px at 350px 30px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 400px 100px, white, transparent),
            radial-gradient(1px 1px at 450px 60px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 500px 130px, white, transparent),
            radial-gradient(1.5px 1.5px at 550px 40px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 600px 80px, white, transparent),
            radial-gradient(1px 1px at 650px 150px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 700px 20px, white, transparent),
            radial-gradient(1px 1px at 750px 110px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 800px 70px, white, transparent),
            radial-gradient(1.5px 1.5px at 900px 45px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 1000px 90px, white, transparent),
            radial-gradient(1px 1px at 1100px 55px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 1200px 120px, white, transparent),
            radial-gradient(1px 1px at 1300px 35px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 1400px 85px, white, transparent)
          `,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'repeat'
        }}
      />
      
      {/* Nebula glow */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(88, 28, 135, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(30, 64, 175, 0.3) 0%, transparent 50%)'
        }}
      />

      <div className="flex items-center justify-between relative z-10">
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
