import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // If user exists but hasn't completed onboarding, redirect to onboarding
    if (profile && !profile.has_completed_onboarding) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render children until we confirm user is authenticated and onboarded
  if (!user) return null;
  if (profile && !profile.has_completed_onboarding) return null;

  return <>{children}</>;
}
