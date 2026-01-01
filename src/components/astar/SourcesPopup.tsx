import { useState } from 'react';
import { Plus, Link, FileText, X, Check, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Source } from '@/hooks/usePlanetSources';

interface SourcesPopupProps {
  sources: Source[];
  selectedSourceIds: string[];
  onToggleSource: (sourceId: string) => void;
  onAddSource: (type: 'link' | 'text', title: string, content?: string) => Promise<void>;
  useAllSources: boolean;
  planetColor?: string;
}

export function SourcesPopup({
  sources,
  selectedSourceIds,
  onToggleSource,
  onAddSource,
  useAllSources,
  planetColor = '#5A67D8',
}: SourcesPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<'link' | 'text'>('link');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSource = async () => {
    if (!newTitle.trim()) return;
    
    setIsAdding(true);
    try {
      await onAddSource(addType, newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      setShowAddForm(false);
    } finally {
      setIsAdding(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="shrink-0 p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          title="Add sources"
        >
          <Plus className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start"
        className="w-80 p-0 bg-slate-900 border-slate-700"
      >
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Sources</h3>
            {!showAddForm && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddForm(true)}
                className="h-7 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>
          
          {useAllSources && (
            <p className="text-xs text-muted-foreground mt-1">
              Using all sources for this agent
            </p>
          )}
        </div>

        {showAddForm && (
          <div className="p-3 border-b border-slate-700 space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={addType === 'link' ? 'secondary' : 'ghost'}
                onClick={() => setAddType('link')}
                className="h-7 px-2 text-xs"
              >
                <Link className="w-3 h-3 mr-1" />
                Link
              </Button>
              <Button
                size="sm"
                variant={addType === 'text' ? 'secondary' : 'ghost'}
                onClick={() => setAddType('text')}
                className="h-7 px-2 text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Text
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="h-7 px-2 text-xs ml-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8 text-sm bg-slate-800 border-slate-700"
            />
            
            <Input
              placeholder={addType === 'link' ? 'URL' : 'Content'}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="h-8 text-sm bg-slate-800 border-slate-700"
            />
            
            <Button
              size="sm"
              onClick={handleAddSource}
              disabled={!newTitle.trim() || isAdding}
              className="w-full h-7 text-xs"
              style={{ backgroundColor: planetColor }}
            >
              {isAdding ? 'Adding...' : 'Add Source'}
            </Button>
          </div>
        )}

        <ScrollArea className="max-h-60">
          <div className="p-2 space-y-1">
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sources yet
              </p>
            ) : (
              sources.map((source) => {
                const isSelected = useAllSources || selectedSourceIds.includes(source.id);
                return (
                  <button
                    key={source.id}
                    onClick={() => !useAllSources && onToggleSource(source.id)}
                    disabled={useAllSources}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      useAllSources 
                        ? 'opacity-70 cursor-default' 
                        : 'hover:bg-slate-800'
                    } ${isSelected ? 'bg-slate-800/50' : ''}`}
                  >
                    <div className="shrink-0 text-slate-400">
                      {getSourceIcon(source.type)}
                    </div>
                    <span className="flex-1 text-sm truncate text-foreground">
                      {source.title}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0" style={{ color: planetColor }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
