import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SourcesTab } from './SourcesTab';
import { MembersTab } from './MembersTab';
import { Source, Member } from './types';
import { FileText, Users } from 'lucide-react';

interface RightPanelProps {
  sources: Source[];
  members: Member[];
  onAddSource: (source: Omit<Source, 'id'>) => void;
  onUseInPrompt: (title: string) => void;
}

export const RightPanel = ({ sources, members, onAddSource, onUseInPrompt }: RightPanelProps) => {
  return (
    <div className="w-80 h-full bg-card/50 border-l border-border flex flex-col">
      <Tabs defaultValue="sources" className="flex flex-col h-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger 
            value="sources" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
          >
            <FileText className="w-4 h-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger 
            value="members"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
          >
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sources" className="flex-1 mt-0 overflow-hidden">
          <SourcesTab sources={sources} onAddSource={onAddSource} onUseInPrompt={onUseInPrompt} />
        </TabsContent>
        <TabsContent value="members" className="flex-1 mt-0 overflow-hidden">
          <MembersTab members={members} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
