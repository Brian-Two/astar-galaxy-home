import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, BookOpen, Monitor, ChevronUp } from 'lucide-react';
import { subjects } from '@/data/subjects';
import { Sidebar } from '@/components/navigation/Sidebar';
import { UserStatus } from '@/components/galaxy/UserStatus';

interface OtherPlanet {
  id: string;
  name: string;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  startAngle: number;
  size: number;
}

const toolInfo = {
  sources: { icon: BookOpen, title: 'Sources', description: 'View notes & assignments.' },
  workstation: { icon: Monitor, title: 'Workstation', description: 'Open ASTAR.AI.' },
  members: { icon: Users, title: 'Members', description: "See who's on this planet." },
};

const PlanetLanding = () => {
  const { subjectName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [orbitAngles, setOrbitAngles] = useState<number[]>([]);
  
  // Find the subject from data
  const decodedName = subjectName ? decodeURIComponent(subjectName) : searchParams.get('subject') || 'Linear Algebra';
  const subject = subjects.find(s => s.name === decodedName) || {
    name: decodedName,
    color: '#5A67D8',
    lastActiveDaysAgo: 0,
    stats: { assignmentsCompleted: 0, studySessions: 0, projects: 0 }
  };

  // Get other planets for orbiting
  const otherPlanets: OtherPlanet[] = subjects
    .filter(s => s.name !== subject.name)
    .slice(0, 4)
    .map((s, i) => ({
      id: s.name.toLowerCase().replace(/\s/g, '-'),
      name: s.name,
      color: s.color,
      orbitRadius: 100 + (i * 35),
      orbitSpeed: 0.0003 + (i * 0.0001),
      startAngle: (i * Math.PI) / 2,
      size: 16 + (i % 2) * 6,
    }));

  // Initialize orbit angles
  useEffect(() => {
    setOrbitAngles(otherPlanets.map(p => p.startAngle));
  }, []);

  // Animate orbiting planets
  useEffect(() => {
    let animationId: number;
    
    const animateOrbits = () => {
      setOrbitAngles(prev => 
        prev.map((angle, i) => angle + otherPlanets[i]?.orbitSpeed || 0)
      );
      animationId = requestAnimationFrame(animateOrbits);
    };
    
    animateOrbits();
    return () => cancelAnimationFrame(animationId);
  }, [otherPlanets.length]);

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
        y: Math.random() * canvas.height * 0.65,
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

  const handleToolClick = (tool: string) => {
    if (tool === 'workstation') {
      navigate(`/astar-ai?subject=${encodeURIComponent(subject.name)}`);
    } else {
      console.log(`${tool} clicked`);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden relative">
      {/* Global Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 relative">
        {/* Stars canvas */}
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: 'linear-gradient(180deg, hsl(230, 35%, 4%) 0%, hsl(230, 35%, 8%) 60%, hsl(230, 35%, 12%) 100%)' }}
        />

        {/* User status - top right */}
        <div className="absolute top-0 right-0 z-30">
          <UserStatus name="Explorer" points={1240} />
        </div>

        {/* Centered up arrow - top center */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full text-muted-foreground hover:text-emerald-400 hover:bg-slate-800/50 transition-all duration-200 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>

        {/* Sky with distant star and orbiting planets */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Orbiting planets - z-10, behind the sun */}
          {otherPlanets.map((planet, i) => {
            const angle = orbitAngles[i] || planet.startAngle;
            const centerX = 50;
            const centerY = 28;
            const x = centerX + Math.cos(angle) * (planet.orbitRadius / 10);
            const y = centerY + Math.sin(angle) * (planet.orbitRadius / 20);
            
            return (
              <div
                key={planet.id}
                className="absolute transition-all duration-100 z-10"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    background: `radial-gradient(circle at 30% 30%, ${planet.color}cc, ${planet.color}88)`,
                    filter: 'blur(1px)',
                    opacity: 0.7,
                    boxShadow: `0 0 15px ${planet.color}50`,
                  }}
                />
              </div>
            );
          })}

          {/* Distant green star/sun - z-20, in front of orbiting planets */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ top: '18%' }}
          >
            <div
              className="w-28 h-28 rounded-full"
              style={{
                background: 'radial-gradient(circle, #34d399 0%, #10b981 40%, rgba(16,185,129,0.25) 70%, transparent 100%)',
                filter: 'blur(3px)',
                opacity: 0.7,
              }}
            />
          </div>
        </div>

        {/* Tool icons - positioned above the surface */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ bottom: '18%' }}>
          <div className="flex items-center gap-10">
            {(Object.entries(toolInfo) as [string, typeof toolInfo.sources][]).map(([key, tool]) => {
              const Icon = tool.icon;
              const isHovered = hoveredTool === key;
              
              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => handleToolClick(key)}
                    onMouseEnter={() => setHoveredTool(key)}
                    onMouseLeave={() => setHoveredTool(null)}
                    className="w-16 h-16 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-1"
                    style={{
                      boxShadow: isHovered 
                        ? `0 0 20px ${subject.color}60, 0 8px 30px rgba(0,0,0,0.4)` 
                        : '0 4px 20px rgba(0,0,0,0.3)',
                      borderColor: isHovered ? subject.color : undefined,
                    }}
                  >
                    <Icon 
                      className="w-6 h-6 transition-colors" 
                      style={{ color: isHovered ? subject.color : '#94a3b8' }}
                    />
                  </button>
                  
                  {/* Tooltip */}
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 transition-all duration-200 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center whitespace-nowrap border border-slate-700/50">
                      <div className="text-sm font-medium text-foreground">{tool.title}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curved planet surface - shallower curve */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 overflow-hidden" style={{ height: '25%' }}>
          <div
            className="rounded-[50%] border-t border-slate-700/50"
            style={{
              width: '280%',
              height: '500px',
              marginBottom: '-320px',
              background: `
                radial-gradient(ellipse at 30% 10%, rgba(255,255,255,0.1) 0%, transparent 40%),
                radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.06) 0%, transparent 35%),
                radial-gradient(ellipse at 50% 0%, ${subject.color}90 0%, ${subject.color}70 30%, ${subject.color}50 60%, ${subject.color}40 100%)
              `,
              boxShadow: `inset 0 30px 80px ${subject.color}30, 0 -20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Surface texture - crater-like dots */}
            <div
              className="absolute inset-0 rounded-[50%] opacity-30 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 15%, rgba(0,0,0,0.3) 0%, transparent 8%),
                  radial-gradient(circle at 65% 25%, rgba(0,0,0,0.2) 0%, transparent 5%),
                  radial-gradient(circle at 40% 20%, rgba(0,0,0,0.25) 0%, transparent 6%),
                  radial-gradient(circle at 80% 18%, rgba(0,0,0,0.2) 0%, transparent 4%),
                  radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 20px 20px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetLanding;
