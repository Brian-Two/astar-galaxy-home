import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, FileEdit, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; intention: 'study' | 'homework' | 'project' }) => void;
}

const intentionOptions = [
  {
    value: 'study' as const,
    label: 'Study',
    description: 'Review notes, learn concepts, quiz yourself',
    icon: BookOpen
  },
  {
    value: 'homework' as const,
    label: 'Do Homework',
    description: 'Complete assignments, solve problems',
    icon: FileEdit
  },
  {
    value: 'project' as const,
    label: 'Project / Research',
    description: 'Explore ideas, organize research, brainstorm',
    icon: Lightbulb
  }
];

export const NewSessionModal = ({ open, onOpenChange, onSubmit }: NewSessionModalProps) => {
  const [name, setName] = useState('');
  const [intention, setIntention] = useState<'study' | 'homework' | 'project' | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !intention) return;
    onSubmit({ name, intention });
    setName('');
    setIntention(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d0e10] border-[#1a1b1e] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#e0e0e0]">Start a new session</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div>
            <label className="text-sm text-[#a0a0a0] mb-2 block">
              Session name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Midterm 1 Review, Homework 3"
              className="bg-[#0a0b0d] border-[#2a2b2e] text-[#e0e0e0] placeholder:text-[#6b6b6b]"
            />
          </div>

          <div>
            <label className="text-sm text-[#a0a0a0] mb-3 block">
              What are you here to do?
            </label>
            <div className="grid gap-3">
              {intentionOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setIntention(opt.value)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                      intention === opt.value
                        ? "bg-[#1a1b1e] border-[#3a3b3e]"
                        : "bg-[#0a0b0d] border-[#1a1b1e] hover:border-[#2a2b2e]"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      intention === opt.value ? "bg-[#2a2b2e]" : "bg-[#1a1b1e]"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        intention === opt.value ? "text-[#e0e0e0]" : "text-[#6b6b6b]"
                      )} />
                    </div>
                    <div>
                      <h4 className={cn(
                        "font-medium",
                        intention === opt.value ? "text-[#e0e0e0]" : "text-[#a0a0a0]"
                      )}>
                        {opt.label}
                      </h4>
                      <p className="text-sm text-[#6b6b6b]">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-[#2a2b2e] hover:bg-[#3a3b3e] text-[#e0e0e0] border border-[#3a3b3e]"
            disabled={!name.trim() || !intention}
          >
            Start Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
