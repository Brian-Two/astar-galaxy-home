import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Sparkles, 
  LayoutDashboard, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    icon: Home, 
    label: 'Home', 
    path: '/',
    description: 'Your learning galaxy'
  },
  { 
    icon: Compass, 
    label: 'Explore', 
    path: '/explore',
    description: 'Find ways to apply your skills'
  },
  { 
    icon: Sparkles, 
    label: 'ASTAR.AI', 
    path: '/astar-ai',
    description: 'AI-powered task breakdown'
  },
  { 
    icon: LayoutDashboard, 
    label: 'Board', 
    path: '/board',
    description: 'Your upcoming assignments'
  },
  { 
    icon: BarChart3, 
    label: 'Stats', 
    path: '/stats',
    description: 'Track your progress'
  },
];

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
    <div 
      className={cn(
        "fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300",
        isExpanded ? "w-56" : "w-14"
      )}
    >
      <div className="glass-panel py-3 px-2 flex flex-col gap-1">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-primary/10 transition-colors group mb-2"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center flex-shrink-0 star-glow">
            <span className="font-display font-bold text-lg text-primary-foreground">A★</span>
          </div>
          {isExpanded && (
            <span className="font-display font-bold text-lg text-foreground animate-fade-in">
              ASTAR
            </span>
          )}
        </button>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                isActive ? "bg-primary/20" : "group-hover:bg-muted"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              
              {isExpanded && (
                <div className="animate-fade-in overflow-hidden">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-3 px-3 py-2 glass-panel opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="font-medium text-sm text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              )}
            </NavLink>
          );
        })}

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center mt-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Hint text */}
      {!isExpanded && (
        <div className="text-center mt-3">
          <p className="text-[10px] text-muted-foreground/50 leading-tight">
            Click to<br />expand
          </p>
        </div>
      )}
    </div>
  );
};
