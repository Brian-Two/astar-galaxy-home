import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "assignments", label: "My own Assignments/Exams" },
  { id: "collaborate", label: "Collaborate with other ASTAR students" },
  { id: "projects", label: "Apply skills to real-world projects" },
  { id: "tutoring", label: "Find Tutors/Help Tutor others" },
  { id: "fun", label: "Make learning less miserable" },
];

interface GoalsStepProps {
  selectedGoals: string[];
  onChange: (goals: string[]) => void;
}

export function GoalsStep({ selectedGoals, onChange }: GoalsStepProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onChange(selectedGoals.filter(id => id !== goalId));
    } else {
      onChange([...selectedGoals, goalId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          What do you want ASTAR to help you with?
        </h2>
        <p className="text-muted-foreground">
          Select all that apply
        </p>
      </div>

      <div className="space-y-3">
        {GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "w-full p-4 rounded-xl text-left transition-all duration-200",
                "border border-border/50",
                "flex items-center justify-between gap-3",
                isSelected 
                  ? "bg-primary/10 border-primary/50" 
                  : "bg-secondary/30 hover:bg-secondary/50"
              )}
            >
              <span className={cn(
                "font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {goal.label}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-primary border-primary" 
                  : "border-border"
              )}>
                {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
