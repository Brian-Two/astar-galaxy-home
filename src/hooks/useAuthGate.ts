import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Action types for return-to-action system
export type AuthActionType = 
  | 'OPEN_ADD_SOURCE_MODAL'
  | 'OPEN_CREATE_AGENT_WIZARD'
  | 'OPEN_CREATE_PLANET_MODAL'
  | 'NAVIGATE_TO_SOURCES_PAGE';

export interface AuthAction {
  type: AuthActionType;
  payload?: Record<string, unknown>;
}

export interface PostAuthPayload {
  redirectTo: string;
  action?: AuthAction;
}

const STORAGE_KEY = 'astar_post_auth';

// Save redirect payload to localStorage
export function savePostAuthPayload(payload: PostAuthPayload): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save post-auth payload:', error);
  }
}

// Get and clear redirect payload from localStorage
export function getPostAuthPayload(): PostAuthPayload | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      localStorage.removeItem(STORAGE_KEY);
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to get post-auth payload:', error);
  }
  return null;
}

// Clear the payload without returning it
export function clearPostAuthPayload(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear post-auth payload:', error);
  }
}

// Hook for gating actions that require authentication
export function useAuthGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const requireAuth = (
    action?: AuthAction,
    redirectTo?: string
  ): boolean => {
    if (loading) return false;
    
    if (!user) {
      // Save the return-to-action payload
      const currentPath = redirectTo || window.location.pathname;
      savePostAuthPayload({
        redirectTo: currentPath,
        action,
      });

      // Show toast before redirecting
      toast({
        title: "Sign in to save your work",
        description: "You'll be redirected back after signing in.",
      });

      // Navigate to onboarding/auth
      navigate('/onboarding');
      return false;
    }

    return true;
  };

  return {
    isAuthenticated: !!user,
    loading,
    requireAuth,
  };
}
