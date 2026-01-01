import { useState } from 'react';
import { Plus, Rocket } from 'lucide-react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlanets } from '@/hooks/usePlanets';
import { useToast } from '@/hooks/use-toast';

interface AddPlanetButtonProps {
  variant?: 'icon' | 'button';
}

const planetColors = [
  '#F5A623', '#50E3C2', '#BD10E0', '#4A90E2', '#D0021B',
  '#7ED321', '#9013FE', '#F8E71C', '#417505', '#B8E986',
];

export const AddPlanetButton = ({ variant = 'icon' }: AddPlanetButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planetName, setPlanetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { addPlanet } = usePlanets();
  const { toast } = useToast();

  const handleAddPlanet = async () => {
    if (!planetName.trim()) return;

    setIsCreating(true);
    const color = planetColors[Math.floor(Math.random() * planetColors.length)];
    
    const planet = await addPlanet(planetName.trim(), color);
    
    if (planet) {
      toast({
        title: 'Planet created!',
        description: `"${planet.name}" has been added to your galaxy.`,
      });
      setPlanetName('');
      setIsDialogOpen(false);
    } else {
      toast({
        title: 'Failed to create planet',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsCreating(false);
  };

  return (
    <>
      {variant === 'icon' ? (
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
      ) : (
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Rocket className="w-4 h-4" />
          Create your first planet
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-panel border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add a New Planet</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new planet to organize your learning for a subject.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter subject name..."
              value={planetName}
              onChange={(e) => setPlanetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleAddPlanet()}
              className="bg-background/50 border-border"
              autoFocus
              disabled={isCreating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleAddPlanet} disabled={!planetName.trim() || isCreating}>
              {isCreating ? 'Creating...' : 'Add Planet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
