import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthCard } from "@/components/auth/AuthCard";
import { AstarLogo } from "@/components/auth/AstarLogo";
import { RocketProgressBar } from "@/components/onboarding/RocketProgressBar";
import { UsernameStep } from "@/components/onboarding/UsernameStep";
import { EducationStep } from "@/components/onboarding/EducationStep";
import { LearningStyleStep } from "@/components/onboarding/LearningStyleStep";
import { GoalsStep } from "@/components/onboarding/GoalsStep";

const TOTAL_STEPS = 4;

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Onboarding() {
  const { user, profile, loading, updateProfile, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  
  // Auth state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authErrors, setAuthErrors] = useState<{ email?: string; password?: string }>({});
  
  // Form state
  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [majorIsCustom, setMajorIsCustom] = useState(false);
  const [school, setSchool] = useState("");
  const [schoolIsCustom, setSchoolIsCustom] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [occupationIsCustom, setOccupationIsCustom] = useState(false);
  const [learningLevelIndex, setLearningLevelIndex] = useState(3);
  const [learningLevelLabel, setLearningLevelLabel] = useState("Average");
  const [bartleX, setBartleX] = useState(0);
  const [bartleY, setBartleY] = useState(0);
  const [bartlePrimaryType, setBartlePrimaryType] = useState("Balanced");
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && profile?.has_completed_onboarding) {
      navigate('/');
    } else if (user && profile?.onboarding_step) {
      setCurrentStep(Math.min(profile.onboarding_step + 1, TOTAL_STEPS));
      if (profile.username) setUsername(profile.username);
      if (profile.major) setMajor(profile.major);
      if (profile.major_is_custom) setMajorIsCustom(profile.major_is_custom);
      if (profile.school) setSchool(profile.school);
      if (profile.school_is_custom) setSchoolIsCustom(profile.school_is_custom);
      if (profile.desired_occupation) setOccupation(profile.desired_occupation);
      if (profile.occupation_is_custom) setOccupationIsCustom(profile.occupation_is_custom);
      if (profile.learning_level_index) setLearningLevelIndex(profile.learning_level_index);
      if (profile.learning_level_label) setLearningLevelLabel(profile.learning_level_label);
      if (profile.bartle_x !== null) setBartleX(profile.bartle_x);
      if (profile.bartle_y !== null) setBartleY(profile.bartle_y);
      if (profile.bartle_primary_type) setBartlePrimaryType(profile.bartle_primary_type);
      if (profile.goals) setGoals(profile.goals);
    }
  }, [user, profile, loading, navigate]);

  // Auth functions
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
    
    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
    }
    setIsAuthLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsAuthLoading(true);
    
    try {
      if (authMode === 'signin') {
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
            setAuthMode('signin');
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
      setIsAuthLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isUsernameValid;
      case 2: return major && school && occupation;
      case 3: return true;
      case 4: return goals.length > 0;
      default: return false;
    }
  };

  const saveCurrentStep = async () => {
    setIsSaving(true);
    let updates: Record<string, unknown> = { onboarding_step: currentStep };
    
    switch (currentStep) {
      case 1:
        updates = { ...updates, username };
        break;
      case 2:
        updates = { ...updates, major, major_is_custom: majorIsCustom, school, school_is_custom: schoolIsCustom, desired_occupation: occupation, occupation_is_custom: occupationIsCustom };
        break;
      case 3:
        updates = { ...updates, learning_level_index: learningLevelIndex, learning_level_label: learningLevelLabel, bartle_x: bartleX, bartle_y: bartleY, bartle_primary_type: bartlePrimaryType };
        break;
      case 4:
        updates = { ...updates, goals };
        break;
    }
    
    const { error } = await updateProfile(updates);
    setIsSaving(false);
    
    if (error) {
      toast({ variant: "destructive", title: "Failed to save", description: error.message });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const saved = await saveCurrentStep();
    if (!saved) return;
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/onboarding/complete');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleEducationChange = (field: string, value: string, isCustom: boolean) => {
    if (field === 'major') { setMajor(value); setMajorIsCustom(isCustom); }
    if (field === 'school') { setSchool(value); setSchoolIsCustom(isCustom); }
    if (field === 'occupation') { setOccupation(value); setOccupationIsCustom(isCustom); }
  };

  const handleLearningStyleChange = (field: string, value: number | string) => {
    if (field === 'learningLevelIndex') setLearningLevelIndex(value as number);
    if (field === 'learningLevelLabel') setLearningLevelLabel(value as string);
    if (field === 'bartleX') setBartleX(value as number);
    if (field === 'bartleY') setBartleY(value as number);
    if (field === 'bartlePrimaryType') setBartlePrimaryType(value as string);
  };

  if (loading) {
    return <AuthBackground><div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AuthBackground>;
  }

  // If not logged in, show auth UI
  if (!user) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center gap-8">
          <AstarLogo size="lg" />
          
          <AuthCard>
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-display font-semibold text-foreground">
                  {authMode === 'signin' ? 'Log in to ASTAR' : 'Create your account'}
                </h1>
              </div>
              
              {!showEmailForm ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium bg-card hover:bg-secondary border-border/50"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Continue with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  
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
                      disabled={isAuthLoading}
                    />
                    {authErrors.email && (
                      <p className="text-sm text-destructive">{authErrors.email}</p>
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
                      disabled={isAuthLoading}
                    />
                    {authErrors.password && (
                      <p className="text-sm text-destructive">{authErrors.password}</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium"
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    {authMode === 'signin' ? 'Sign in' : 'Create account'}
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
              
              <div className="text-center text-sm text-muted-foreground">
                {authMode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => setAuthMode('signup')}
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
                      onClick={() => setAuthMode('signin')}
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

  // If logged in but not onboarded, show onboarding steps
  return (
    <AuthBackground>
      <div className="flex flex-col items-center gap-6 w-full max-w-[480px] mx-auto">
        <AstarLogo size="md" />
        <div className="w-full px-4"><RocketProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} /></div>
        <AuthCard className="max-w-[480px]">
          {currentStep === 1 && <UsernameStep value={username} onChange={setUsername} onValidChange={setIsUsernameValid} />}
          {currentStep === 2 && <EducationStep major={major} majorIsCustom={majorIsCustom} school={school} schoolIsCustom={schoolIsCustom} occupation={occupation} occupationIsCustom={occupationIsCustom} onChange={handleEducationChange} />}
          {currentStep === 3 && <LearningStyleStep learningLevelIndex={learningLevelIndex} bartleX={bartleX} bartleY={bartleY} onChange={handleLearningStyleChange} />}
          {currentStep === 4 && <GoalsStep selectedGoals={goals} onChange={setGoals} />}
          
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && <Button variant="outline" onClick={handleBack} disabled={isSaving} className="flex-1"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>}
            <Button onClick={handleNext} disabled={!canProceed() || isSaving} className="flex-1">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {currentStep === TOTAL_STEPS ? 'Finish' : 'Next'}{currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </AuthCard>
      </div>
    </AuthBackground>
  );
}
