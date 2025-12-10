import { useState } from 'react';
import { Users, FolderOpen, Plus, ChevronLeft, ChevronRight, FileText, Link as LinkIcon, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Space, Source, Member } from './types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkstationSidebarProps {
  spaces: Space[];
  sources: Source[];
  members: Member[];
  onSpaceSelect: (spaceId: string) => void;
  onNewSession: () => void;
  onAddSource: (source: Omit<Source, 'id'>) => void;
  onUseInPrompt: (title: string) => void;
  subjectColor: string;
  subjectName: string;
}

type TabType = 'members' | 'sources';

const typeIcons = {
  Text: FileText,
  Link: LinkIcon,
  File: File
};

export const WorkstationSidebar = ({
  spaces,
  sources,
  members,
  onSpaceSelect,
  onNewSession,
  onAddSource,
  onUseInPrompt,
  subjectColor,
  subjectName
}: WorkstationSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState<{ title: string; type: 'Text' | 'Link' | 'File'; snippet: string }>({ title: '', type: 'Text', snippet: '' });

  const handleAddSource = () => {
    if (!newSource.title.trim()) return;
    onAddSource(newSource);
    setNewSource({ title: '', type: 'Text', snippet: '' });
    setAddSourceOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 glass-panel border-r border-border/30 flex flex-col rounded-none">
        <div className="p-2 border-b border-border/30">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-2">
          <button
            onClick={() => { setActiveTab('members'); setIsCollapsed(false); }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded",
              activeTab === 'members' ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('sources'); setIsCollapsed(false); }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded",
              activeTab === 'sources' ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 glass-panel border-r border-border/30 flex flex-col rounded-none">
      {/* Subject name header */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" style={{ color: subjectColor }} />
          <span className="text-lg font-semibold" style={{ color: subjectColor }}>
            {subjectName}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-secondary text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30">
        <button
          onClick={() => setActiveTab('members')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'members' 
              ? "text-foreground border-b-2 border-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          Members
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'sources' 
              ? "text-foreground border-b-2 border-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderOpen className="w-4 h-4" />
          Knowledge
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'members' && (
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Members in this space
            </div>
            <div className="space-y-2 mb-6">
              {members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm text-foreground">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Why invite members section */}
            <div className="bg-card rounded-lg p-4 border border-border/30">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <h4 className="text-sm font-medium text-foreground text-center mb-3">
                Why invite members to your space?
              </h4>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>Members in your space can add, remove, and use knowledge in your space.</p>
                <p>The more members you add, the smarter ASTAR becomes for everyone in your space.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
              >
                Invite members
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Sources in this space
              </div>
              <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
                <DialogTrigger asChild>
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add Source</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                      <Input
                        value={newSource.title}
                        onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                        placeholder="e.g., Lecture Notes Week 3"
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                      <Select 
                        value={newSource.type} 
                        onValueChange={(v) => setNewSource({ ...newSource, type: v as 'Text' | 'Link' | 'File' })}
                      >
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="Link">Link</SelectItem>
                          <SelectItem value="File">File (placeholder)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Content / Snippet</label>
                      <Textarea
                        value={newSource.snippet}
                        onChange={(e) => setNewSource({ ...newSource, snippet: e.target.value })}
                        placeholder="Paste content or URL here..."
                        className="bg-secondary border-border text-foreground min-h-[100px]"
                      />
                    </div>
                    <Button 
                      onClick={handleAddSource} 
                      className="w-full"
                    >
                      Add Source
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              {sources.map((source) => {
                const Icon = typeIcons[source.type] || FileText;
                return (
                  <div
                    key={source.id}
                    className="bg-card border border-border/30 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground font-medium truncate">{source.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.snippet}</div>
                        <button
                          onClick={() => onUseInPrompt(source.title)}
                          className="text-xs mt-2 hover:underline text-primary"
                        >
                          Use in prompt
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Spaces list - moved below tab content */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Spaces</div>
            <button
              onClick={onNewSession}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
          </div>
          <div className="space-y-1">
            {spaces.map((space) => (
              <button
                key={space.id}
                onClick={() => onSpaceSelect(space.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors",
                  space.active 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                style={space.active ? { borderLeft: `3px solid ${subjectColor}` } : undefined}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">{space.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
