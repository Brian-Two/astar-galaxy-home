import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Sparkles, LayoutDashboard, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import astarLogo from '@/assets/astar-logo.png';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Sparkles, label: 'ASTAR.AI', path: '/astar-ai' },
  { icon: LayoutDashboard, label: 'Board', path: '/board' },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
];

export const GlobalNav = () => {
  const navigate = useNavigate();

  return (
    <div className="w-14 bg-[#050608] border-r border-[#1a1b1e] flex flex-col items-center py-3">
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="w-10 h-10 flex items-center justify-center mb-4 hover:opacity-80 transition-opacity"
      >
        <img src={astarLogo} alt="ASTAR" className="w-8 h-8 object-contain" />
      </button>

      {/* Menu Items */}
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "w-10 h-10 flex items-center justify-center rounded-lg transition-colors group relative",
                isActive
                  ? "bg-[#1a1b1e] text-[#e0e0e0]"
                  : "text-[#6b6b6b] hover:text-[#a0a0a0] hover:bg-[#0d0e10]"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1b1e] border border-[#2a2b2e] rounded text-xs text-[#e0e0e0] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
