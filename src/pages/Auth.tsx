import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AstarLogo } from "@/components/auth/AstarLogo";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthBackground } from "@/components/auth/AuthBackground";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.has_completed_onboarding) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } else if (!loading && !user) {
      // Redirect to onboarding which now handles auth
      navigate('/onboarding');
    }
  }, [user, profile, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
    }
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              variant: "destructive",
              title: "Invalid credentials",
              description: "Please check your email and password and try again.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign in failed",
              description: error.message,
            });
          }
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              variant: "destructive",
              title: "Account exists",
              description: "An account with this email already exists. Please sign in instead.",
            });
            setMode('signin');
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Account created",
            description: "Welcome to ASTAR! Let's set up your profile.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthBackground>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <AstarLogo size="lg" />
        
        {/* Auth Card */}
        <AuthCard>
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-display font-semibold text-foreground">
                {mode === 'signin' ? 'Log in to ASTAR' : 'Create your account'}
              </h1>
            </div>
            
            {!showEmailForm ? (
              <div className="space-y-3">
                {/* Google Button */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium bg-card hover:bg-secondary border-border/50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                
                {/* Email Button */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium bg-card hover:bg-secondary border-border/50"
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Continue with email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-secondary/50 border-border/50"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-secondary/50 border-border/50"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : null}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setShowEmailForm(false)}
                >
                  Back to options
                </Button>
              </form>
            )}
            
            {/* Toggle mode */}
            <div className="text-center text-sm text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => setMode('signup')}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => setMode('signin')}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        </AuthCard>
      </div>
    </AuthBackground>
  );
}
