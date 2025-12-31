import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { getPostAuthPayload } from "@/hooks/useAuthGate";

export default function OnboardingComplete() {
  const { user, profile, loading, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fillProgress, setFillProgress] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
    else if (!loading && profile?.has_completed_onboarding) navigate('/');
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setFillProgress(prev => {
          if (prev >= 100) { clearInterval(interval); setTimeout(() => setShowButtons(true), 500); return 100; }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async (goToQuickplay: boolean) => {
    setIsCompleting(true);
    await updateProfile({ has_completed_onboarding: true, onboarding_step: 0 });
    
    // Refresh profile to ensure state is updated
    await refreshProfile();
    
    // Check for return-to-action payload
    const postAuthPayload = getPostAuthPayload();
    
    if (postAuthPayload) {
      // Navigate to the saved redirect path
      navigate(postAuthPayload.redirectTo);
      
      // If there's an action to execute, we'll handle it via a custom event
      if (postAuthPayload.action) {
        // Dispatch a custom event that components can listen for
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('astar-post-auth-action', {
            detail: postAuthPayload.action
          }));
        }, 500); // Small delay to ensure navigation completes
      }
    } else {
      // Default navigation
      navigate(goToQuickplay ? '/' : '/');
    }
  };

  if (loading) return <AuthBackground><div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AuthBackground>;

  return (
    <AuthBackground>
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 40 40" fill="none" className="drop-shadow-2xl">
            <defs><clipPath id="starFillClip"><rect x="0" y={40 - (40 * fillProgress / 100)} width="40" height={40 * fillProgress / 100} /></clipPath></defs>
            <path d="M20 2L24.5 14.5H37.5L27 23L31.5 36L20 28L8.5 36L13 23L2.5 14.5H15.5L20 2Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
            <path d="M20 2L24.5 14.5H37.5L27 23L31.5 36L20 28L8.5 36L13 23L2.5 14.5H15.5L20 2Z" fill="hsl(var(--primary))" clipPath="url(#starFillClip)" className="transition-all duration-100" />
          </svg>
          {fillProgress >= 100 && <div className="absolute inset-0 animate-pulse-glow rounded-full" style={{ boxShadow: '0 0 60px hsl(var(--primary) / 0.6)' }} />}
        </div>
        
        {showButtons && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <h2 className="text-2xl font-display font-semibold text-foreground">Welcome to ASTAR!</h2>
            <Button size="lg" onClick={() => handleComplete(true)} disabled={isCompleting} className="min-w-[200px]">
              {isCompleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Start Quick Play
            </Button>
            <Button variant="ghost" onClick={() => handleComplete(false)} disabled={isCompleting} className="text-muted-foreground">
              Go to Galaxy Home
            </Button>
          </div>
        )}
      </div>
    </AuthBackground>
  );
}
