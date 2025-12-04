import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Subject } from '@/data/subjects';

interface AddPlanetButtonProps {
  onAddPlanet: (subject: Subject) => void;
}

const planetColors = [
  '#F5A623', '#50E3C2', '#BD10E0', '#4A90E2', '#D0021B',
  '#7ED321', '#9013FE', '#F8E71C', '#417505', '#B8E986',
];

export const AddPlanetButton = ({ onAddPlanet }: AddPlanetButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planetName, setPlanetName] = useState('');

  const handleAddPlanet = () => {
    if (planetName.trim()) {
      const newSubject: Subject = {
        name: planetName.trim(),
        lastActiveDaysAgo: 0,
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        stats: {
          assignmentsCompleted: 0,
          studySessions: 0,
          projects: 0,
        },
      };
      onAddPlanet(newSubject);
      setPlanetName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
            >
              <Plus className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Add a planet</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-panel border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add a New Planet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter subject name..."
              value={planetName}
              onChange={(e) => setPlanetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlanet()}
              className="bg-background/50 border-border"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlanet} disabled={!planetName.trim()}>
              Add Planet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
