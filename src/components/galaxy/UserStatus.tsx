import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Settings, LogOut, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const UserStatus = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      localStorage.removeItem('astar_onboarding_complete_animation_seen');
      navigate('/auth', { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an issue signing out. Redirecting to login...",
      });
      navigate('/auth', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSignIn = () => {
    navigate('/onboarding');
  };

  // Show loading state briefly
  if (loading) {
    return (
      <div className="fixed top-6 right-6 z-40">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Signed OUT state - show Sign in button
  if (!user) {
    return (
      <div className="fixed top-6 right-6 z-40">
        <Button 
          onClick={handleSignIn}
          variant="default"
          className="font-display"
        >
          Sign in
        </Button>
      </div>
    );
  }

  // Signed IN state - show stars + avatar
  const displayName = profile?.username || user.email?.split('@')[0] || 'User';
  const stars = profile?.stars ?? 50;
  const email = user.email || '';

  return (
    <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
      {/* Stars Box with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="glass-panel px-4 py-2 flex items-center gap-2 cursor-pointer">
            <Star className="w-4 h-4 text-white fill-white" />
            <span className="font-display font-bold text-foreground">
              {stars.toLocaleString()}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-sm">
            Earn stars by completing assignments, study sessions, and projects.
          </p>
        </TooltipContent>
      </Tooltip>

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50">
            <span className="text-sm font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <div className="px-3 py-3">
            <p className="font-semibold text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
