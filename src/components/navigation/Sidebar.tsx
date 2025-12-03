import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Sparkles, LayoutDashboard, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import astarLogo from '@/assets/astar-logo.png';

const menuItems = [{
  icon: Home,
  label: 'Home',
  path: '/'
}, {
  icon: Compass,
  label: 'Explore',
  path: '/explore'
}, {
  icon: Sparkles,
  label: 'ASTAR.AI',
  path: '/astar-ai'
}, {
  icon: LayoutDashboard,
  label: 'Board',
  path: '/board'
}, {
  icon: BarChart3,
  label: 'Stats',
  path: '/stats'
}];

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className={cn("fixed left-3 top-1/2 -translate-y-1/2 z-50 transition-all duration-300", isExpanded ? "w-44" : "w-12")}>
      <div className="glass-panel flex flex-col gap-0.5 py-1.5 px-1.5">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-2 px-1 py-2 rounded-lg transition-colors group">
          <img src={astarLogo} alt="ASTAR" className="w-8 h-8 flex-shrink-0" />
          {isExpanded && (
            <span className="font-display font-bold text-sm text-foreground animate-fade-in">
              STAR
            </span>
          )}
        </button>

        {/* Menu Items */}
        {menuItems.map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-1 py-1.5 rounded-lg transition-all duration-200 group relative",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              
              {isExpanded && (
                <span className="font-medium text-xs animate-fade-in">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 glass-panel opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="font-medium text-xs text-foreground">{item.label}</span>
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Expand/Collapse Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center justify-center mt-1 py-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};