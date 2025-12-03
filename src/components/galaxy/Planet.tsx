import { useState } from 'react';
import { Subject } from '@/data/subjects';

interface PlanetProps {
  subject: Subject;
  orbitRadius: number;
  angle: number;
  onSelect: (subject: Subject) => void;
}

export const Planet = ({ subject, orbitRadius, angle, onSelect }: PlanetProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate position based on angle and orbit radius
  const x = Math.cos((angle * Math.PI) / 180) * orbitRadius;
  const y = Math.sin((angle * Math.PI) / 180) * orbitRadius;

  // Planet size based on activity (more recent = slightly larger)
  const baseSize = 40;
  const activityBonus = Math.max(0, 10 - subject.lastActiveDaysAgo);
  const size = baseSize + activityBonus;

  return (
    <div
      className="absolute transition-all duration-500 cursor-pointer pointer-events-auto"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 1})`,
        zIndex: isHovered ? 50 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(subject)}
    >
      {/* Orbit trail (subtle) */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: `${size + 20}px`,
          height: `${size + 20}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${subject.color}20 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Planet body */}
      <div
        className="relative rounded-full transition-all duration-300"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle at 30% 30%, ${subject.color}ee, ${subject.color}aa, ${subject.color}77)`,
          boxShadow: isHovered 
            ? `0 0 30px ${subject.color}80, 0 0 60px ${subject.color}40, inset -5px -5px 15px rgba(0,0,0,0.3)`
            : `0 0 15px ${subject.color}50, inset -3px -3px 10px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Surface highlight */}
        <div 
          className="absolute top-1 left-2 w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 animate-fade-in"
          style={{ width: '200px' }}
        >
          <div className="glass-panel p-3 text-sm">
            <h4 className="font-display font-semibold text-foreground mb-1">
              {subject.name}
            </h4>
            <p className="text-muted-foreground text-xs mb-2">
              Last activity: {subject.lastActiveDaysAgo === 0 ? 'Today' : `${subject.lastActiveDaysAgo} days ago`}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Assignments completed:</span>
                <span className="text-foreground">{subject.stats.assignmentsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Study sessions:</span>
                <span className="text-foreground">{subject.stats.studySessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Projects:</span>
                <span className="text-foreground">{subject.stats.projects}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject label (always visible) */}
      <div 
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
      >
        <span 
          className="text-xs font-medium transition-colors duration-300"
          style={{ color: isHovered ? subject.color : 'hsl(var(--muted-foreground))' }}
        >
          {subject.name}
        </span>
      </div>
    </div>
  );
};
