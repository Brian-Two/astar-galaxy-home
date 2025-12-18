import { X, ExternalLink, Bookmark, Users, Star, Zap, Clock, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TagChip } from './TagChip';
import { ExploreItem } from '@/data/exploreData';
import { toast } from '@/hooks/use-toast';

interface DetailModalProps {
  item: ExploreItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailModal = ({ item, isOpen, onClose }: DetailModalProps) => {
  if (!item) return null;

  const handlePrimaryCTA = () => {
    if (item.link) {
      window.open(item.link, '_blank');
    } else if (item.type === 'project') {
      toast({ title: 'Joined project!', description: `You've joined "${item.title}"` });
      onClose();
    } else if (item.type === 'planet') {
      toast({ title: 'Added to Galaxy!', description: `"${item.title}" is now in your galaxy` });
      onClose();
    } else if (item.type === 'agent') {
      toast({ title: 'Agent added!', description: `"${item.title}" is now on your planet` });
      onClose();
    } else if (item.type === 'tutoring-need' || item.type === 'tutoring-offer') {
      toast({ title: 'Response sent!', description: `You've responded to "${item.title}"` });
      onClose();
    }
  };

  const handleSave = () => {
    toast({ title: 'Saved!', description: `"${item.title}" saved to your library` });
  };

  const getPrimaryCTAText = () => {
    switch (item.type) {
      case 'opportunity': return 'Open Link';
      case 'project': return 'Join Project';
      case 'planet': return 'Add to Galaxy';
      case 'agent': return 'Try Agent';
      case 'tutoring-need':
      case 'tutoring-offer': return 'Respond';
      default: return 'Open';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="glass-panel border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground pr-8">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <p className="text-muted-foreground">{item.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.subject && (
              <TagChip label={item.subject} variant="subject" size="md" />
            )}
            {item.difficulty && (
              <TagChip label={item.difficulty} variant="difficulty" size="md" />
            )}
            {item.tags.map(tag => (
              <TagChip key={tag} label={tag} size="md" />
            ))}
          </div>

          {/* Stats & Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground py-2 border-t border-b border-border/30">
            {item.author && (
              <span>by <span className="text-foreground">{item.author}</span></span>
            )}
            {item.stats?.activeUsers && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {item.stats.activeUsers.toLocaleString()} active
              </span>
            )}
            {item.stats?.uses && (
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {item.stats.uses.toLocaleString()} uses
              </span>
            )}
            {item.stats?.rating && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                {item.stats.rating}
              </span>
            )}
            {item.availability && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.availability}
              </span>
            )}
            {item.preferredFormat && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {item.preferredFormat === 'both' ? 'Text or Voice' : item.preferredFormat}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handlePrimaryCTA}
              className="flex-1"
            >
              {item.link && <ExternalLink className="w-4 h-4 mr-2" />}
              {getPrimaryCTAText()}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              className="px-4"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
