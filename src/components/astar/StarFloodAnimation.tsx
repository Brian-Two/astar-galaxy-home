import { useEffect, useRef } from 'react';

interface StarFloodAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  duration?: number;
}

interface FloodStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinklePhase: number;
  driftAngle: number;
}

export function StarFloodAnimation({ isVisible, onComplete, duration = 5000 }: StarFloodAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create stars
    const stars: FloodStar[] = [];
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5, // Start above screen
        size: Math.random() * 4 + 2,
        speed: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.4,
        twinklePhase: Math.random() * Math.PI * 2,
        driftAngle: Math.random() * 0.4 - 0.2, // Slight horizontal drift
      });
    }

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate global opacity (fade in then out)
      let globalOpacity = 1;
      if (progress < 0.1) {
        globalOpacity = progress / 0.1;
      } else if (progress > 0.7) {
        globalOpacity = 1 - (progress - 0.7) / 0.3;
      }

      // Draw stars
      stars.forEach((star, i) => {
        // Update position
        star.y += star.speed;
        star.x += Math.sin(star.driftAngle) * star.speed * 0.5;
        star.twinklePhase += 0.1;

        // Reset if off screen
        if (star.y > canvas.height + 50) {
          star.y = -20;
          star.x = Math.random() * canvas.width;
        }

        // Calculate twinkle
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const finalOpacity = star.opacity * twinkle * globalOpacity;

        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
        gradient.addColorStop(0.3, `rgba(255, 255, 200, ${finalOpacity * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.fill();
      });

      // Add some sparkle bursts
      if (Math.random() > 0.9 && progress < 0.8) {
        const burstX = Math.random() * canvas.width;
        const burstY = Math.random() * canvas.height;
        const burstSize = Math.random() * 30 + 20;

        const burstGradient = ctx.createRadialGradient(
          burstX, burstY, 0,
          burstX, burstY, burstSize
        );
        burstGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * globalOpacity})`);
        burstGradient.addColorStop(0.5, `rgba(255, 255, 200, ${0.3 * globalOpacity})`);
        burstGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(burstX, burstY, burstSize, 0, Math.PI * 2);
        ctx.fillStyle = burstGradient;
        ctx.fill();
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-auto"
      style={{ zIndex: 9999 }}
    >
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Star canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Center celebration text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-2xl font-display font-semibold text-white">
            Objective Complete!
          </p>
          <p className="text-lg text-white/80 mt-2">+10 Stars</p>
        </div>
      </div>
    </div>
  );
}
