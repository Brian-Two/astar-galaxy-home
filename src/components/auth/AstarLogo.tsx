import { cn } from "@/lib/utils";
import astarLogo from "@/assets/astar-logo-new.png";

interface AstarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AstarLogo({ className, size = 'md' }: AstarLogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src={astarLogo} 
        alt="ASTAR" 
        className={cn(sizeClasses[size], "w-auto")} 
      />
    </div>
  );
}
