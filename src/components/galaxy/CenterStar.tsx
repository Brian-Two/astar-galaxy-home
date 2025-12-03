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

      {/* Core star */}
      <div 
        className="relative rounded-full transition-all duration-300"
        style={{
          width: '100px',
          height: '100px',
          marginLeft: '-50px',
          marginTop: '-50px',
          background: 'radial-gradient(circle at 30% 30%, #34D399 0%, #10B981 40%, #059669 100%)',
          boxShadow: isHovered 
            ? '0 0 60px rgba(16, 185, 129, 0.8), 0 0 120px rgba(16, 185, 129, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.3)'
            : '0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Inner highlight */}
        <div 
          className="absolute top-3 left-4 w-6 h-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
          }}
        />
        
        {/* ASTAR text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-lg text-white/90 tracking-wide">
            A★
          </span>
        </div>
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
