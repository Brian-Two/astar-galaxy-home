import { cn } from "@/lib/utils";

interface RocketProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function RocketProgressBar({ currentStep, totalSteps, className }: RocketProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={cn("relative w-full", className)}>
      {/* Track */}
      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
        {/* Fill */}
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Rocket */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
        style={{ left: `calc(${progress}% - 12px)` }}
      >
        <div className="animate-float" style={{ animationDuration: '2s' }}>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Rocket body - silver/metallic */}
            <ellipse cx="12" cy="10" rx="4" ry="8" fill="url(#rocketGradient)" />
            
            {/* Rocket nose cone */}
            <path d="M12 2L8 8H16L12 2Z" fill="url(#noseGradient)" />
            
            {/* Windows */}
            <circle cx="12" cy="8" r="1.5" fill="#4B5563" />
            <circle cx="12" cy="8" r="1" fill="#9CA3AF" />
            
            {/* Fins */}
            <path d="M8 14L5 18L8 16V14Z" fill="#9CA3AF" />
            <path d="M16 14L19 18L16 16V14Z" fill="#9CA3AF" />
            
            {/* Engine flame */}
            <ellipse cx="12" cy="19" rx="2" ry="3" fill="url(#flameGradient)" opacity="0.9" />
            <ellipse cx="12" cy="18.5" rx="1.2" ry="2" fill="#FCD34D" opacity="0.8" />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="rocketGradient" x1="8" y1="2" x2="16" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E5E7EB" />
                <stop offset="0.5" stopColor="#9CA3AF" />
                <stop offset="1" stopColor="#6B7280" />
              </linearGradient>
              <linearGradient id="noseGradient" x1="12" y1="2" x2="12" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F3F4F6" />
                <stop offset="1" stopColor="#9CA3AF" />
              </linearGradient>
              <linearGradient id="flameGradient" x1="12" y1="16" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary))" />
                <stop offset="0.5" stopColor="#FCD34D" />
                <stop offset="1" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
