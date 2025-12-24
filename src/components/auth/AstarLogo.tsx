import { cn } from "@/lib/utils";

interface AstarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fillProgress?: number; // 0-100 for star fill animation
}

export function AstarLogo({ className, size = 'md', fillProgress }: AstarLogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <svg 
          className={cn(sizeClasses[size], "w-auto")} 
          viewBox="0 0 40 40" 
          fill="none"
        >
          {/* Star outline */}
          <path
            d="M20 2L24.5 14.5H37.5L27 23L31.5 36L20 28L8.5 36L13 23L2.5 14.5H15.5L20 2Z"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
            fill="none"
          />
          {/* Star fill (for animation) */}
          {fillProgress !== undefined && (
            <defs>
              <clipPath id="starFillClip">
                <rect 
                  x="0" 
                  y={40 - (40 * fillProgress / 100)} 
                  width="40" 
                  height={40 * fillProgress / 100}
                />
              </clipPath>
            </defs>
          )}
          {fillProgress !== undefined && (
            <path
              d="M20 2L24.5 14.5H37.5L27 23L31.5 36L20 28L8.5 36L13 23L2.5 14.5H15.5L20 2Z"
              fill="hsl(var(--primary))"
              clipPath="url(#starFillClip)"
            />
          )}
        </svg>
      </div>
      <span className={cn(
        "font-display font-bold tracking-tight",
        size === 'sm' && 'text-xl',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-4xl',
      )}>
        A<span className="text-primary">★</span>STAR
      </span>
    </div>
  );
}
