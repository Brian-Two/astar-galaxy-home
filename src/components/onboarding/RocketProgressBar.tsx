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
        style={{ left: `calc(${progress}% - 11px)` }}
      >
        <img 
          src={rocketImage} 
          alt="Progress rocket" 
          className="h-[18px] w-auto md:h-[20px] drop-shadow-lg"
        />
      </div>
    </div>
  );
}
