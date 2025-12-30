import { cn } from "@/lib/utils";
import rocketImage from "@/assets/pb_rocket.png";

interface RocketProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function RocketProgressBar({ currentStep, totalSteps, className }: RocketProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={cn("relative isolate w-full overflow-visible", className)}>
      {/* Track */}
      <div className="relative z-0 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden mr-16 md:mr-20">
        {/* Fill */}
        <div 
          className="relative z-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Rocket */}
      <div 
        className="pointer-events-none absolute top-1/2 z-30 -translate-y-1/2 transition-all duration-500 ease-out"
        style={{ left: `calc(${progress}% - 48px)` }}
      >
        {/* This subtle backing prevents the fill from showing through transparent pixels */}
        <div className="absolute inset-2 -z-10 rounded-full bg-background/35 backdrop-blur-sm" />
        <img 
          src={rocketImage} 
          alt="Progress rocket" 
          className="h-[72px] w-auto md:h-[88px] drop-shadow-[0_2px_10px_hsl(var(--foreground)_/_0.18)]"
        />
      </div>
    </div>
  );
}
