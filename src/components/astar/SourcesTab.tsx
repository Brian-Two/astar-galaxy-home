import { useState } from 'react';
import { Plus, FileText, Link as LinkIcon, File, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Source } from './types';
import { Badge } from '@/components/ui/badge';

interface SourcesTabProps {
  sources: Source[];
  onAddSource: (source: Omit<Source, 'id'>) => void;
  onUseInPrompt: (title: string) => void;
}

const typeIcons = {
  Text: FileText,
  Link: LinkIcon,
  File: File
};

export const SourcesTab = ({ sources, onAddSource, onUseInPrompt }: SourcesTabProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Text' | 'Link' | 'File'>('Text');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAddSource({
      title,
      type,
      snippet: content.slice(0, 100) + (content.length > 100 ? '...' : '')
    });
    setTitle('');
    setType('Text');
    setContent('');
    setOpen(false);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Sources in this space</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-4 h-4" />
              Add source
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Add a new source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lecture Notes Week 5"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text">Text</SelectItem>
                    <SelectItem value="Link">Link</SelectItem>
                    <SelectItem value="File">File (placeholder)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your text, link, or notes here..."
                  className="min-h-[120px]"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Save Source
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {sources.map((source) => {
          const Icon = typeIcons[source.type];
          return (
            <div
              key={source.id}
              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-2 mb-2">
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">{source.title}</h4>
                  <Badge variant="secondary" className="text-xs mt-1">{source.type}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{source.snippet}</p>
              <button
                onClick={() => onUseInPrompt(source.title)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Use in prompt <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
