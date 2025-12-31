import { useState, useEffect, useRef } from 'react';
import { X, Plus, Link2, FileText, StickyNote, ExternalLink, Eye, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Source {
  id: string;
  planet_id: string;
  user_id: string;
  title: string;
  type: 'link' | 'file' | 'text';
  content?: string;
  url?: string;
  file_path?: string;
  created_at: string;
}

interface SourcesOverlayProps {
  open: boolean;
  onClose: () => void;
  planetId: string;
  planetColor: string;
  onSourceCountChange?: (count: number) => void;
}

const typeIcons = {
  link: Link2,
  file: FileText,
  text: StickyNote,
};

const typeLabels = {
  link: 'Links',
  file: 'Files',
  text: 'Notes',
};

export const SourcesOverlay = ({ 
  open, 
  onClose, 
  planetId, 
  planetColor,
  onSourceCountChange 
}: SourcesOverlayProps) => {
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'link' | 'file' | 'text'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewingSource, setViewingSource] = useState<Source | null>(null);
  
  // Add source form state
  const [newSourceType, setNewSourceType] = useState<'link' | 'file' | 'text'>('link');
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch sources
  useEffect(() => {
    if (open && user) {
      fetchSources();
    }
  }, [open, user, planetId]);

  // Animated stars background for top bar
  useEffect(() => {
    if (!open) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [open]);

  const fetchSources = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('planet_id', planetId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedSources = (data || []).map(s => ({
        ...s,
        type: s.type as 'link' | 'file' | 'text'
      }));
      
      setSources(typedSources);
      onSourceCountChange?.(typedSources.length);
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!user || !newSourceTitle.trim()) return;
    
    setSubmitting(true);
    try {
      const sourceData: any = {
        planet_id: planetId,
        user_id: user.id,
        title: newSourceTitle.trim(),
        type: newSourceType,
      };

      if (newSourceType === 'link') {
        sourceData.url = newSourceContent.trim();
      } else {
        sourceData.content = newSourceContent.trim();
      }

      const { data, error } = await supabase
        .from('sources')
        .insert(sourceData)
        .select()
        .single();

      if (error) throw error;

      const typedSource = {
        ...data,
        type: data.type as 'link' | 'file' | 'text'
      };

      setSources(prev => [typedSource, ...prev]);
      onSourceCountChange?.(sources.length + 1);
      
      // Reset form
      setNewSourceTitle('');
      setNewSourceContent('');
      setNewSourceType('link');
      setAddDialogOpen(false);
      toast.success('Source added!');
    } catch (error) {
      console.error('Error adding source:', error);
      toast.error('Failed to add source');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from('sources')
        .update({ is_deleted: true })
        .eq('id', sourceId);

      if (error) throw error;

      setSources(prev => prev.filter(s => s.id !== sourceId));
      onSourceCountChange?.(sources.length - 1);
      toast.success('Source removed');
    } catch (error) {
      console.error('Error removing source:', error);
      toast.error('Failed to remove source');
    }
  };

  const handleOpenSource = (source: Source) => {
    if (source.type === 'link' && source.url) {
      window.open(source.url, '_blank');
    } else if (source.type === 'text') {
      setViewingSource(source);
    }
  };

  const filteredSources = filter === 'all' 
    ? sources 
    : sources.filter(s => s.type === filter);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Starry top bar */}
      <div className="relative h-24 shrink-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            background: 'linear-gradient(180deg, hsl(230, 35%, 4%) 0%, hsl(230, 35%, 8%) 100%)' 
          }}
        />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <X className="w-5 h-5 text-slate-300" />
        </button>

        {/* Title */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <h1 className="text-2xl font-display font-semibold text-foreground">Sources</h1>
        </div>
      </div>

      {/* Main panel with planet color */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${planetColor}15 0%, ${planetColor}08 50%, hsl(230, 35%, 7%) 100%)`,
        }}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="bg-slate-900/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
                All
              </TabsTrigger>
              <TabsTrigger value="link" className="data-[state=active]:bg-slate-700 gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Links
              </TabsTrigger>
              <TabsTrigger value="file" className="data-[state=active]:bg-slate-700 gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Files
              </TabsTrigger>
              <TabsTrigger value="text" className="data-[state=active]:bg-slate-700 gap-1.5">
                <StickyNote className="w-3.5 h-3.5" />
                Notes
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button 
            onClick={() => setAddDialogOpen(true)}
            style={{ backgroundColor: planetColor }}
            className="hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add source
          </Button>
        </div>

        {/* Sources list */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'No sources yet. Add your first source to get started.'
                    : `No ${typeLabels[filter as keyof typeof typeLabels].toLowerCase()} found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSources.map(source => {
                  const Icon = typeIcons[source.type];
                  return (
                    <div
                      key={source.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${planetColor}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: planetColor }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {source.title}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {source.type}
                          </Badge>
                        </div>
                        {source.url && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {source.url}
                          </p>
                        )}
                        {source.content && source.type === 'text' && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {source.content.substring(0, 100)}...
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {source.type === 'link' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenSource(source)}
                            className="h-8 w-8"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        {source.type === 'text' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenSource(source)}
                            className="h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSource(source.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Source Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Source</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Type selector */}
            <Tabs value={newSourceType} onValueChange={(v) => setNewSourceType(v as typeof newSourceType)}>
              <TabsList className="w-full">
                <TabsTrigger value="link" className="flex-1 gap-2">
                  <Link2 className="w-4 h-4" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="file" className="flex-1 gap-2">
                  <FileText className="w-4 h-4" />
                  File
                </TabsTrigger>
                <TabsTrigger value="text" className="flex-1 gap-2">
                  <StickyNote className="w-4 h-4" />
                  Text
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Input
              placeholder="Title"
              value={newSourceTitle}
              onChange={(e) => setNewSourceTitle(e.target.value)}
            />

            {newSourceType === 'link' && (
              <Input
                placeholder="https://..."
                value={newSourceContent}
                onChange={(e) => setNewSourceContent(e.target.value)}
              />
            )}

            {newSourceType === 'file' && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  File upload coming soon
                </p>
              </div>
            )}

            {newSourceType === 'text' && (
              <Textarea
                placeholder="Paste or type your notes..."
                value={newSourceContent}
                onChange={(e) => setNewSourceContent(e.target.value)}
                rows={6}
              />
            )}

            <Button 
              onClick={handleAddSource}
              disabled={!newSourceTitle.trim() || submitting}
              className="w-full"
              style={{ backgroundColor: planetColor }}
            >
              {submitting ? 'Adding...' : 'Add Source'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Text Source Dialog */}
      <Dialog open={!!viewingSource} onOpenChange={() => setViewingSource(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingSource?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {viewingSource?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
