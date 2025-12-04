import { CheckCircle2, BookOpen, Hammer, TrendingUp } from 'lucide-react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Sidebar } from '@/components/navigation/Sidebar';

const stats = {
  assignmentsCompleted: 45,
  studySessions: 22,
  projectsCompleted: 8,
  totalPoints: 1250,
  streak: 7,
};

const weeklyProgress = [
  { day: 'Mon', value: 3 },
  { day: 'Tue', value: 5 },
  { day: 'Wed', value: 2 },
  { day: 'Thu', value: 4 },
  { day: 'Fri', value: 6 },
  { day: 'Sat', value: 1 },
  { day: 'Sun', value: 3 },
];

const Stats = () => {
  const maxValue = Math.max(...weeklyProgress.map(d => d.value));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      <Sidebar />

      <div className="relative z-10 min-h-screen p-8 pl-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Stats
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Overview of your assignments, study sessions, and projects completed.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-panel p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-foreground">
                {stats.assignmentsCompleted}
              </div>
              <div className="text-sm text-muted-foreground">Assignments</div>
            </div>
            <div className="glass-panel p-5 text-center">
              <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-foreground">
                {stats.studySessions}
              </div>
              <div className="text-sm text-muted-foreground">Study Sessions</div>
            </div>
            <div className="glass-panel p-5 text-center">
              <Hammer className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-foreground">
                {stats.projectsCompleted}
              </div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="glass-panel p-5 text-center">
              <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-foreground">
                {stats.streak}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="glass-panel p-6 mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              Weekly Activity
            </h2>
            <div className="flex items-end justify-between gap-2 h-40">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary/60 to-primary transition-all duration-500"
                    style={{ 
                      height: `${(day.value / maxValue) * 100}%`,
                      minHeight: '8px'
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Tasks completed per day
            </p>
          </div>

          {/* Total Points */}
          <div className="glass-panel p-6 text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <div className="font-display text-5xl font-bold text-gradient mb-2">
              {stats.totalPoints.toLocaleString()}
            </div>
            <div className="text-muted-foreground">
              Total Points Earned
            </div>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Keep learning to earn more points and unlock customizations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
