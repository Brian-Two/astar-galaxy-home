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
  subjectColor
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
      <div className="w-12 bg-[#0a0b0d] border-r border-[#1a1b1e] flex flex-col">
        <div className="p-2 border-b border-[#1a1b1e]">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1a1b1e] text-[#6b6b6b]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1 p-2">
          <button
            onClick={() => { setActiveTab('members'); setIsCollapsed(false); }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded",
              activeTab === 'members' ? "bg-[#1a1b1e] text-[#e0e0e0]" : "text-[#6b6b6b] hover:bg-[#1a1b1e]"
            )}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('sources'); setIsCollapsed(false); }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded",
              activeTab === 'sources' ? "bg-[#1a1b1e] text-[#e0e0e0]" : "text-[#6b6b6b] hover:bg-[#1a1b1e]"
            )}
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#0a0b0d] border-r border-[#1a1b1e] flex flex-col">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-[#1a1b1e]">
        <div className="flex">
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === 'members' 
                ? "text-[#e0e0e0] border-b-2 border-[#e0e0e0]" 
                : "text-[#6b6b6b] hover:text-[#a0a0a0]"
            )}
          >
            <Users className="w-4 h-4" />
            Members
            <span className="text-xs text-[#6b6b6b]">{members.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2",
              activeTab === 'sources' 
                ? "text-[#e0e0e0] border-b-2 border-[#e0e0e0]" 
                : "text-[#6b6b6b] hover:text-[#a0a0a0]"
            )}
          >
            <FolderOpen className="w-4 h-4" />
            Knowledge
            <span className="text-xs text-[#6b6b6b]">{sources.length}</span>
          </button>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 mr-2 rounded hover:bg-[#1a1b1e] text-[#6b6b6b]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New space button */}
      <div className="p-3 border-b border-[#1a1b1e]">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#1a1b1e] rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          New space
        </button>
      </div>

      {/* Spaces list */}
      <div className="p-3 border-b border-[#1a1b1e]">
        <div className="text-xs text-[#6b6b6b] uppercase tracking-wider mb-2 px-2">Spaces</div>
        <div className="space-y-1">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => onSpaceSelect(space.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors",
                space.active 
                  ? "bg-[#1a1b1e] text-[#e0e0e0]" 
                  : "text-[#a0a0a0] hover:bg-[#1a1b1e] hover:text-[#e0e0e0]"
              )}
              style={space.active ? { borderLeft: `3px solid ${subjectColor}` } : undefined}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">{space.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'members' && (
          <div>
            <div className="text-xs text-[#6b6b6b] uppercase tracking-wider mb-3 px-2">
              Members in this space
            </div>
            <div className="space-y-2 mb-6">
              {members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a1b1e] flex items-center justify-center text-sm font-medium text-[#a0a0a0]">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm text-[#e0e0e0]">{member.name}</div>
                    <div className="text-xs text-[#6b6b6b]">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Why invite members section */}
            <div className="bg-[#0d0e10] rounded-lg p-4 border border-[#1a1b1e]">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-[#1a1b1e] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#6b6b6b]" />
                </div>
              </div>
              <h4 className="text-sm font-medium text-[#e0e0e0] text-center mb-3">
                Why invite members to your space?
              </h4>
              <div className="space-y-3 text-xs text-[#a0a0a0]">
                <p>Members in your space can add, remove, and use knowledge in your space.</p>
                <p>The more members you add, the smarter ASTAR becomes for everyone in your space.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4 bg-transparent border-[#2a2b2e] text-[#e0e0e0] hover:bg-[#1a1b1e]"
              >
                Invite members
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="text-xs text-[#6b6b6b] uppercase tracking-wider">
                Sources in this space
              </div>
              <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
                <DialogTrigger asChild>
                  <button className="text-xs text-[#a0a0a0] hover:text-[#e0e0e0] flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#0d0e10] border-[#1a1b1e]">
                  <DialogHeader>
                    <DialogTitle className="text-[#e0e0e0]">Add Source</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-[#a0a0a0] mb-1 block">Title</label>
                      <Input
                        value={newSource.title}
                        onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                        placeholder="e.g., Lecture Notes Week 3"
                        className="bg-[#0a0b0d] border-[#2a2b2e] text-[#e0e0e0]"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#a0a0a0] mb-1 block">Type</label>
                      <Select 
                        value={newSource.type} 
                        onValueChange={(v) => setNewSource({ ...newSource, type: v as 'Text' | 'Link' | 'File' })}
                      >
                        <SelectTrigger className="bg-[#0a0b0d] border-[#2a2b2e] text-[#e0e0e0]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0e10] border-[#1a1b1e]">
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="Link">Link</SelectItem>
                          <SelectItem value="File">File (placeholder)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-[#a0a0a0] mb-1 block">Content / Snippet</label>
                      <Textarea
                        value={newSource.snippet}
                        onChange={(e) => setNewSource({ ...newSource, snippet: e.target.value })}
                        placeholder="Paste content or URL here..."
                        className="bg-[#0a0b0d] border-[#2a2b2e] text-[#e0e0e0] min-h-[100px]"
                      />
                    </div>
                    <Button 
                      onClick={handleAddSource} 
                      className="w-full bg-[#2a2b2e] hover:bg-[#3a3b3e] text-[#e0e0e0]"
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
                    className="bg-[#0d0e10] border border-[#1a1b1e] rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-[#6b6b6b] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#e0e0e0] font-medium truncate">{source.title}</div>
                        <div className="text-xs text-[#6b6b6b] mt-1 line-clamp-2">{source.snippet}</div>
                        <button
                          onClick={() => onUseInPrompt(source.title)}
                          className="text-xs mt-2 hover:underline"
                          style={{ color: subjectColor }}
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
      </div>
    </div>
  );
};
