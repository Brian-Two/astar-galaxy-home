import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CenterStar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/room')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer transition-transform duration-500"
      style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
    >
      {/* Outer glow rings */}
      <div 
        className="absolute inset-0 rounded-full transition-all duration-500"
        style={{
          width: isHovered ? '200px' : '180px',
          height: isHovered ? '200px' : '180px',
          marginLeft: isHovered ? '-100px' : '-90px',
          marginTop: isHovered ? '-100px' : '-90px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
          filter: `blur(${isHovered ? '30px' : '20px'})`,
        }}
      />
      
      {/* Middle glow */}
      <div 
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: '140px',
          height: '140px',
          marginLeft: '-70px',
          marginTop: '-70px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />

      {/* Core star shape */}
      <div 
        className="relative transition-all duration-300"
        style={{
          width: '100px',
          height: '100px',
          marginLeft: '-50px',
          marginTop: '-50px',
          filter: isHovered 
            ? 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.9)) drop-shadow(0 0 60px rgba(16, 185, 129, 0.5))'
            : 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.7)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.4))',
        }}
      >
        {/* Star SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="starGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* 5-pointed star */}
          <polygon
            points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"
            fill="url(#starGradient)"
            filter="url(#starGlow)"
          />
          {/* Inner highlight */}
          <polygon
            points="50,20 56,38 75,38 60,50 66,68 50,56 34,68 40,50 25,38 44,38"
            fill="rgba(255,255,255,0.2)"
          />
        </svg>
      </div>

      {/* Hover label */}
      <div 
        className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: `translateX(-50%) translateY(${isHovered ? '0' : '-10px'})`,
        }}
      >
        <div className="glass-panel px-4 py-2 text-sm text-foreground">
          Enter Spaceship Room
        </div>
      </div>
    </button>
  );
};
