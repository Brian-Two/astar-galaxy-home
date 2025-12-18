import { useState } from 'react';
import { X, Lightbulb, HelpCircle, GraduationCap, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExploreItem, Difficulty, PostType } from '@/data/exploreData';
import { toast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: ExploreItem) => void;
}

type PostFormType = 'project' | 'tutoring-need' | 'tutoring-offer' | 'resource';

const postTypes: { value: PostFormType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'project', label: 'Project / Challenge', icon: <Lightbulb className="w-5 h-5" />, description: 'Share a project idea or challenge' },
  { value: 'tutoring-need', label: 'Need Help', icon: <HelpCircle className="w-5 h-5" />, description: 'Request tutoring or study help' },
  { value: 'tutoring-offer', label: 'Offering Help', icon: <GraduationCap className="w-5 h-5" />, description: 'Offer to tutor or mentor others' },
  { value: 'resource', label: 'Share Resource', icon: <Link2 className="w-5 h-5" />, description: 'Share an external link or resource' },
];

const subjects = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Languages',
  'Art',
  'Music',
  'General',
];

export const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<PostFormType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: '' as Difficulty | '',
    link: '',
    tags: '',
    availability: '',
    preferredFormat: '' as 'text' | 'voice' | 'both' | '',
  });

  const handleTypeSelect = (type: PostFormType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      toast({ title: 'Missing fields', description: 'Please fill in title and description', variant: 'destructive' });
      return;
    }

    const mapType = (type: PostFormType): PostType => {
      if (type === 'resource') return 'opportunity';
      return type;
    };

    const newItem: ExploreItem = {
      id: `user-${Date.now()}`,
      type: mapType(selectedType!),
      title: formData.title,
      description: formData.description,
      subject: formData.subject || undefined,
      difficulty: formData.difficulty || undefined,
      link: formData.link || undefined,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      availability: formData.availability || undefined,
      preferredFormat: formData.preferredFormat || undefined,
      author: 'You',
      keywords: [],
      createdAt: new Date(),
    };

    onSubmit(newItem);
    toast({ title: 'Posted to Explore!', description: 'Your post is now visible to the community' });
    
    // Reset form
    setStep('type');
    setSelectedType(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      difficulty: '',
      link: '',
      tags: '',
      availability: '',
      preferredFormat: '',
    });
    onClose();
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-panel border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            {step === 'type' ? 'Create a Post' : `New ${postTypes.find(p => p.value === selectedType)?.label}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          <div className="grid gap-3">
            {postTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  {type.icon}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your post a clear title"
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project, request, or resource..."
                className="bg-secondary/50 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject / Planet</Label>
                <Select value={formData.subject} onValueChange={v => setFormData(prev => ({ ...prev, subject: v }))}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={v => setFormData(prev => ({ ...prev, difficulty: v as Difficulty }))}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedType === 'resource' && (
              <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://..."
                  className="bg-secondary/50"
                />
              </div>
            )}

            {(selectedType === 'tutoring-need' || selectedType === 'tutoring-offer') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={e => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                    placeholder="e.g., Weekday evenings, Flexible"
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Format</Label>
                  <Select value={formData.preferredFormat} onValueChange={v => setFormData(prev => ({ ...prev, preferredFormat: v as 'text' | 'voice' | 'both' }))}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., beginner, group project, urgent"
                className="bg-secondary/50"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Post
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
