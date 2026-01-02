import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, LayoutDashboard, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import astarLogo from '@/assets/astar-logo.png';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: LayoutDashboard, label: 'Board', path: '/board' },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
  { icon: Users, label: 'Friends', path: '/friends' },
];

export const CollapsedSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  return (
    <div className="fixed left-4 top-4 z-50">
      <div 
        className={cn(
          "glass-panel flex flex-col overflow-hidden transition-all duration-300 ease-out px-[4px]",
          isExpanded ? "py-2" : "py-1"
        )}
      >
        {/* Logo - always visible */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center justify-center w-12 h-12 shrink-0 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <img src={astarLogo} alt="ASTAR" className="w-9 h-9 object-contain" />
        </button>

        {/* Menu Items - visible when expanded */}
        {isExpanded && (
          <div className="flex flex-col gap-1 animate-fade-in">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsExpanded(false)}
                className={cn(
                  "flex items-center gap-3 px-1 py-2 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-2 glass-panel opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="font-medium text-sm text-foreground">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};
