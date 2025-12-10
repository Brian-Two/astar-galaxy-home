import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SessionHeader } from '@/components/astar/SessionHeader';
import { SpacesSidebar } from '@/components/astar/SpacesSidebar';
import { ChatPanel } from '@/components/astar/ChatPanel';
import { RightPanel } from '@/components/astar/RightPanel';
import { EndSessionModal } from '@/components/astar/EndSessionModal';
import { NewSessionModal } from '@/components/astar/NewSessionModal';
import { Space, Source, Member, Message, SessionStats } from '@/components/astar/types';

const initialSpaces: Space[] = [
  { id: 'midterm-review', name: 'Midterm 1 Review', active: true, intention: 'study' },
  { id: 'hw3-vectors', name: 'Homework 3 – Vectors', active: false, intention: 'homework' },
  { id: 'final-project', name: 'Final Project Ideas', active: false, intention: 'project' },
];

const initialSources: Source[] = [
  {
    id: 'assn',
    title: 'Homework 3 Instructions',
    type: 'Text',
    snippet: 'Prove the following properties of vector spaces...'
  },
  {
    id: 'lecture',
    title: 'Lecture Notes – Week 5 (Forces)',
    type: 'Text',
    snippet: "Newton's second law states that F = ma..."
  },
  {
    id: 'slides',
    title: "Professor's Slides – Midterm Review",
    type: 'Link',
    snippet: 'https://example.com/physics-midterm-slides'
  },
];

const initialMembers: Member[] = [
  { name: 'You', role: 'Owner' },
  { name: 'Alex', role: 'Study Partner' },
  { name: 'Jordan', role: 'Tutor' },
];

const initialMessages: Message[] = [
  { id: '1', role: 'user', content: 'Break this assignment into steps.' },
  { id: '2', role: 'assistant', content: "Here's a plan with 5 steps to tackle your assignment:\n\n1. Read through the entire assignment to understand requirements\n2. Identify key concepts you need to apply\n3. Break down each problem into smaller parts\n4. Work through problems systematically, checking your work\n5. Review and proofread before submission\n\nWant me to dive deeper into any of these steps?" },
];

const AstarAI = () => {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject') || 'Physics 101';

  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [stats, setStats] = useState<SessionStats>({
    totalPoints: 1240,
    sessionXP: 40,
    maxSessionXP: 100
  });
  const [chatInput, setChatInput] = useState('');
  const [endSessionOpen, setEndSessionOpen] = useState(false);
  const [newSessionOpen, setNewSessionOpen] = useState(false);

  const currentSpace = spaces.find(s => s.active) || null;

  const handleSpaceSelect = (spaceId: string) => {
    setSpaces(spaces.map(s => ({
      ...s,
      active: s.id === spaceId
    })));
  };

  const handleSendMessage = (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    // Fake AI response
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `(AI response placeholder using your sources...)\n\nBased on the materials in your space, here's my response to "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}":\n\nThis is where ASTAR.AI would provide a helpful, grounded response using the sources you've added to this space.`
    };

    setMessages([...messages, userMsg, aiMsg]);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleAddSource = (source: Omit<Source, 'id'>) => {
    setSources([...sources, { ...source, id: Date.now().toString() }]);
    toast.success('Source added successfully');
  };

  const handleUseInPrompt = (title: string) => {
    const prefill = `Using "${title}": `;
    handleSendMessage(prefill);
  };

  const handleEndSession = (data: { work: string; focus: number; confidence: number }) => {
    const earnedXP = Math.floor(10 + data.focus * 5 + data.confidence * 3);
    setStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + earnedXP,
      sessionXP: Math.min(prev.sessionXP + earnedXP, prev.maxSessionXP)
    }));
    setEndSessionOpen(false);
    toast.success(`Nice work, Pilot. You've earned +${earnedXP} points for this session.`);
  };

  const handleNewSession = (data: { name: string; intention: 'study' | 'homework' | 'project' }) => {
    const newSpace: Space = {
      id: Date.now().toString(),
      name: data.name,
      active: true,
      intention: data.intention
    };
    setSpaces([
      ...spaces.map(s => ({ ...s, active: false })),
      newSpace
    ]);
    setMessages([]);
    setNewSessionOpen(false);
    toast.success(`Started new session: ${data.name}`);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <div className="relative z-10 h-screen flex flex-col">
        <SessionHeader
          subjectName={subject}
          currentSpace={currentSpace}
          stats={stats}
          onEndSession={() => setEndSessionOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          <SpacesSidebar
            spaces={spaces}
            onSpaceSelect={handleSpaceSelect}
            onNewSession={() => setNewSessionOpen(true)}
          />

          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            currentSpace={currentSpace}
            onPromptClick={handlePromptClick}
          />

          <RightPanel
            sources={sources}
            members={initialMembers}
            onAddSource={handleAddSource}
            onUseInPrompt={handleUseInPrompt}
          />
        </div>
      </div>

      <EndSessionModal
        open={endSessionOpen}
        onOpenChange={setEndSessionOpen}
        onSubmit={handleEndSession}
      />

      <NewSessionModal
        open={newSessionOpen}
        onOpenChange={setNewSessionOpen}
        onSubmit={handleNewSession}
      />
    </div>
  );
};

export default AstarAI;
