import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EndSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { work: string; focus: number; confidence: number }) => void;
}

export const EndSessionModal = ({ open, onOpenChange, onSubmit }: EndSessionModalProps) => {
  const [work, setWork] = useState('');
  const [focus, setFocus] = useState(0);
  const [confidence, setConfidence] = useState(0);

  const handleSubmit = () => {
    if (!work.trim() || focus === 0 || confidence === 0) return;
    onSubmit({ work, focus, confidence });
    setWork('');
    setFocus(0);
    setConfidence(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>End Session & Claim Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              What did you just work on?
            </label>
            <Input
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="e.g., Reviewed chapter 5, solved practice problems"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              How focused were you?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setFocus(n)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border transition-colors text-sm font-medium",
                    focus === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Not focused</span>
              <span>Very focused</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              How confident do you feel now?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setConfidence(n)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border transition-colors text-sm font-medium",
                    confidence === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!work.trim() || focus === 0 || confidence === 0}
          >
            Claim Points
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
