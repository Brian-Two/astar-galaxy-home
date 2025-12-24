import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function Onboarding() {
  const { user, profile, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  
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
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && profile?.has_completed_onboarding) {
      navigate('/');
    } else if (profile?.onboarding_step) {
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
