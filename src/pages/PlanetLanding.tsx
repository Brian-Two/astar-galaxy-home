import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Users, BookOpen, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subjects, Subject } from '@/data/subjects';

type SessionMode = 'Study' | 'Homework' | 'Project';

interface OtherPlanet {
  id: string;
  name: string;
  color: string;
  angleDeg: number;
  distance: number;
}

const sessionModeInfo: Record<SessionMode, { label: string; subtitle: string }> = {
  Study: { label: 'Study', subtitle: 'Focus on understanding and practice.' },
  Homework: { label: 'Homework', subtitle: 'Complete assignments efficiently.' },
  Project: { label: 'Project', subtitle: 'Build and create something new.' },
};

const PlanetLanding = () => {
  const { subjectName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Find the subject from data
  const decodedName = subjectName ? decodeURIComponent(subjectName) : searchParams.get('subject') || 'Linear Algebra';
  const subject = subjects.find(s => s.name === decodedName) || {
    name: decodedName,
    color: '#5A67D8',
    lastActiveDaysAgo: 0,
    stats: { assignmentsCompleted: 0, studySessions: 0, projects: 0 }
  };

  const [sessionMode, setSessionMode] = useState<SessionMode>('Study');
  const [points] = useState(1240);
  const [xp] = useState(40);
  const [xpGoal] = useState(100);
  const spaceName = "Midterm 1 Review";

  // Get other planets for the sky
  const otherPlanets: OtherPlanet[] = subjects
    .filter(s => s.name !== subject.name)
    .slice(0, 4)
    .map((s, i) => ({
      id: s.name.toLowerCase().replace(/\s/g, '-'),
      name: s.name,
      color: s.color,
      angleDeg: -30 + (i * 25),
      distance: 180 + (i * 40),
    }));

  // Animated stars background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Stars canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'linear-gradient(180deg, hsl(230, 35%, 4%) 0%, hsl(230, 35%, 8%) 60%, hsl(230, 35%, 12%) 100%)' }}
      />

      {/* Top HUD Bar */}
      <div className="relative z-20 w-full px-6 py-4 bg-card/40 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Galaxy
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${subject.color}ee, ${subject.color}aa)`,
                  boxShadow: `0 0 15px ${subject.color}50`,
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Planet</span>
                  <span className="font-display font-semibold text-foreground">{subject.name}</span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ borderColor: subject.color, color: subject.color }}
                >
                  {spaceName}
                </span>
              </div>
            </div>
          </div>

          {/* Center - Session Mode */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['Study', 'Homework', 'Project'] as SessionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSessionMode(mode)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    sessionMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground max-w-[200px]">
              {sessionModeInfo[sessionMode].subtitle}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm text-foreground font-medium">{points} points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Session XP:</span>
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(xp / xpGoal) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{xp}/{xpGoal}</span>
            </div>
            <Button variant="secondary" size="sm">
              End Session & Claim Points
            </Button>
          </div>
        </div>
      </div>

      {/* Sky with distant star and planets */}
      <div className="relative flex-1 z-10">
        {/* Distant green star */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '15%' }}
        >
          <div
            className="w-20 h-20 rounded-full animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(16, 185, 129, 0.4) 40%, transparent 70%)',
              filter: 'blur(8px)',
              boxShadow: '0 0 60px rgba(16, 185, 129, 0.5), 0 0 100px rgba(16, 185, 129, 0.3)',
            }}
          />
          {/* Star shape overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-8 h-8 opacity-60">
              <polygon
                points="50,10 61,40 95,40 68,60 79,90 50,72 21,90 32,60 5,40 39,40"
                fill="#34D399"
              />
            </svg>
          </div>
        </div>

        {/* Other planets in the distance */}
        {otherPlanets.map((planet) => {
          const angleRad = (planet.angleDeg * Math.PI) / 180;
          const x = 50 + Math.cos(angleRad) * (planet.distance / 8);
          const y = 25 + Math.sin(angleRad) * (planet.distance / 12);
          
          return (
            <div
              key={planet.id}
              className="absolute pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: '24px',
                  height: '24px',
                  background: `radial-gradient(circle at 30% 30%, ${planet.color}aa, ${planet.color}66)`,
                  filter: 'blur(2px)',
                  opacity: 0.6,
                  boxShadow: `0 0 20px ${planet.color}40`,
                }}
              />
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-muted-foreground/50 whitespace-nowrap">
                {planet.name}
              </span>
            </div>
          );
        })}

        {/* Curved planet surface */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center overflow-hidden" style={{ height: '55%' }}>
          <div
            className="relative rounded-[9999px] border border-border/30"
            style={{
              width: '180%',
              height: '800px',
              marginBottom: '-400px',
              background: `
                radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 50%),
                radial-gradient(circle at 70% 35%, rgba(255,255,255,0.05), transparent 50%),
                radial-gradient(circle at 50% 0%, ${subject.color}40, transparent 60%),
                linear-gradient(180deg, ${subject.color}30 0%, ${subject.color}60 50%, ${subject.color}80 100%)
              `,
              boxShadow: `0 -40px 100px rgba(0,0,0,0.6), inset 0 20px 60px ${subject.color}20`,
            }}
          >
            {/* Surface texture */}
            <div
              className="absolute inset-0 rounded-[9999px] opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Tool cards on the surface */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
              <div className="grid grid-cols-3 gap-8">
                {/* Sources Card */}
                <div
                  className="glass-panel p-6 hover:bg-card/80 transition-all cursor-pointer group"
                  onClick={() => console.log('Sources clicked')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground">Sources</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access your knowledge base, notes, and uploaded materials.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    12 sources available
                  </div>
                </div>

                {/* Workstation Card */}
                <div
                  className="glass-panel p-6 hover:bg-card/80 transition-all cursor-pointer group border-2"
                  style={{ borderColor: `${subject.color}40` }}
                  onClick={() => navigate(`/astar-ai?subject=${encodeURIComponent(subject.name)}`)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${subject.color}30` }}
                    >
                      <Briefcase className="w-5 h-5" style={{ color: subject.color }} />
                    </div>
                    <h3 className="font-display font-semibold text-foreground">Workstation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chat with ASTAR.AI about this subject.
                  </p>
                  <div className="mt-4">
                    <Button size="sm" className="w-full">
                      Open ASTAR.AI
                    </Button>
                  </div>
                </div>

                {/* Members Card */}
                <div
                  className="glass-panel p-6 hover:bg-card/80 transition-all cursor-pointer group"
                  onClick={() => console.log('Members clicked')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground">Members</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Collaborate with others studying this subject.
                  </p>
                  <div className="mt-4 flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-secondary border-2 border-card"
                      />
                    ))}
                    <div className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">
                      +5
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetLanding;
