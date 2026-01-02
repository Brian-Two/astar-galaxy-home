import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Star, Loader2, Sparkles, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlanets } from '@/hooks/usePlanets';
import { useAgentConversation, Message } from '@/hooks/useAgentConversation';
import { useObjectiveProgress } from '@/hooks/useObjectiveProgress';
import { CollapsedSidebar } from '@/components/navigation/CollapsedSidebar';
import { StarFloodAnimation } from '@/components/astar/StarFloodAnimation';
import { toast } from 'sonner';
import { Agent, LearningObjective, AgentGuardrails } from '@/components/planet/types';
import astarLogo from '@/assets/astar-logo-new.png';

// Quick action chips by agent type
const quickActionsByType: Record<string, string[]> = {
  'quiz-master': ['Start quiz', 'Harder', 'Review mistakes'],
  'flashcard-creator': ['Make cards', 'Test me', 'Review'],
  'study-planner': ['Break into steps', 'Make timeline', 'Next action'],
  'research-assistant': ['Summarize sources', 'Compare', 'Find gaps'],
  'socratic-tutor': ['Explain simply', 'Give example', 'Ask me questions'],
  'explainer': ['Explain simply', 'Give example', 'Ask me questions'],
  'essay-coach': ['Outline ideas', 'Strengthen argument', 'Check flow'],
  'problem-solver': ['Break down', 'Show steps', 'Check my work'],
  'debate-partner': ['Counter argument', 'Steelman', 'New perspective'],
  'project-manager': ['List tasks', 'Set deadlines', 'Priority check'],
  'code-mentor': ['Review code', 'Debug help', 'Explain concept'],
  'language-tutor': ['Practice vocab', 'Grammar check', 'Conversation'],
  'memorization-coach': ['Create mnemonics', 'Test recall', 'Spaced review'],
  'concept-mapper': ['Map concepts', 'Find links', 'Simplify'],
  'practice-coach': ['Give exercise', 'Harder drill', 'Quick quiz'],
  'summary-writer': ['Summarize this', 'Key points', 'Condense more'],
};

interface DbAgent {
  id: string;
  planet_id: string;
  created_by: string;
  name: string;
  type: string;
  description: string | null;
  learning_objectives: unknown;
  guardrails: unknown;
  scaffolding_level: string;
  scaffolding_behaviors: unknown;
  source_mode: string;
  selected_source_ids: unknown;
  times_used: number;
  unique_users: number;
  created_at: string;
  updated_at: string;
}

const defaultGuardrails: AgentGuardrails = {
  dontGiveFullAnswers: false,
  askWhatKnown: false,
  stayWithinSources: false,
  keepConcise: false,
  customAvoid: '',
};

function mapDbAgentToAgent(db: DbAgent): Agent {
  const raw = db.learning_objectives as unknown;

  const objectives = Array.isArray(raw)
    ? (raw as any[])
        .map((o, i) => {
          // string[] support
          if (typeof o === 'string') {
            return {
              id: `obj-${i}`,
              text: o,
              showToOthers: true,
            };
          }

          // {text: ...}[] support
          if (o && typeof o === 'object') {
            const text = (o as any).text;
            if (typeof text === 'string' && text.trim().length > 0) {
              return {
                id: `obj-${i}`,
                text,
                showToOthers: (o as any).showToOthers ?? (o as any).visible ?? true,
              };
            }
          }

          return null;
        })
        .filter(Boolean)
    : [];

  const rawGuardrails =
    typeof db.guardrails === 'object' && db.guardrails !== null
      ? (db.guardrails as Partial<AgentGuardrails>)
      : {};

  const guardrails: AgentGuardrails = { ...defaultGuardrails, ...rawGuardrails };

  return {
    id: db.id,
    name: db.name,
    template: db.type as Agent['template'],
    description: db.description || '',
    learningObjectives: objectives as LearningObjective[],
    guardrails,
    scaffoldingLevel: db.scaffolding_level as 'light' | 'medium' | 'heavy',
    scaffoldingBehaviors: Array.isArray(db.scaffolding_behaviors) ? (db.scaffolding_behaviors as string[]) : [],
    useAllSources: db.source_mode === 'all',
    selectedSourceIds: Array.isArray(db.selected_source_ids) ? (db.selected_source_ids as string[]) : [],
    timesUsed: db.times_used,
    uniqueUsers: db.unique_users,
    createdAt: new Date(db.created_at),
    planetId: db.planet_id,
  };
}

const AgentRunner = () => {
  const { planetId, agentId } = useParams();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  // Canvas ref removed - using CSS starfield instead
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeObjectiveIndex, setActiveObjectiveIndex] = useState<number>(0);
  const [showStarFlood, setShowStarFlood] = useState(false);

  // Get planet info
  const { planets } = usePlanets();
  const planet = planets.find(p => p.id === planetId);
  const planetColor = planet?.color || '#5A67D8';
  const planetName = planet?.name || 'Planet';

  // Conversation and progress hooks
  const {
    messages,
    loading: conversationLoading,
    addUserMessage,
    addAssistantMessage,
    updateLastAssistantMessage,
  } = useAgentConversation(agentId, planetId);

  const { isObjectiveHit, markObjectiveHit } = useObjectiveProgress(agentId, planetId);

  // Fetch agent
  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId || !user) {
        setAgentLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', agentId)
          .single();

        if (error) throw error;

        // Verify agent belongs to this planet
        if (data.planet_id !== planetId) {
          toast.error('Agent not found on this planet');
          navigate(`/planet/${encodeURIComponent(planetName)}`);
          return;
        }

        const mappedAgent = mapDbAgentToAgent(data as DbAgent);
        setAgent(mappedAgent);
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast.error('Failed to load agent');
      } finally {
        setAgentLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, planetId, user, navigate, planetName]);

  // Canvas star animation removed - using CSS starfield instead

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea - expand upwards without scrollbar
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.overflow = 'hidden';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(`/planet/${encodeURIComponent(planetName)}`);
    }, 250);
  };

  // Award stars and show animation
  const awardStarsForObjective = useCallback(async (objectiveIndex: number) => {
    // Mark as hit in DB
    const success = await markObjectiveHit(objectiveIndex);
    if (success) {
      // Award +10 stars to profile
      if (profile) {
        const newStars = (profile.stars || 0) + 10;
        await updateProfile({ stars: newStars });
      }
      
      // Show flood animation
      setShowStarFlood(true);
    }
  }, [markObjectiveHit, profile, updateProfile]);

  // Check for objective completion after assistant response
  const checkObjectiveCompletion = useCallback(async (
    allMessages: Message[],
    objectives: LearningObjective[]
  ) => {
    if (!agent || objectives.length === 0) return;

    // Get last 20 messages for evaluation
    const recentMessages = allMessages.slice(-20);
    if (recentMessages.length < 2) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          objectives: objectives.map((o, i) => ({ index: i, text: o.text })),
          messages: recentMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) return;

      const data = await response.json();
      const hitIndexes: number[] = data.hit || [];

      for (const idx of hitIndexes) {
        if (!isObjectiveHit(idx)) {
          await awardStarsForObjective(idx);
          toast.success(`Objective completed: "${objectives[idx]?.text.substring(0, 50)}..."`);
          break; // Only show one animation at a time
        }
      }
    } catch (error) {
      console.error('Error checking objectives:', error);
    }
  }, [agent, isObjectiveHit, awardStarsForObjective]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !agent || isStreaming) return;

    setInput('');
    setIsStreaming(true);

    // Add user message to DB
    await addUserMessage(messageText);

    // Build agent config for the edge function
    const agentConfig = {
      agent_type: agent.template,
      name: agent.name,
      description: agent.description,
      learning_objectives: agent.learningObjectives.map(o => ({ text: o.text, visible: o.showToOthers })),
      guardrails: agent.guardrails,
      scaffolding_level: agent.scaffoldingLevel,
      scaffolding_behaviors: agent.scaffoldingBehaviors,
      source_mode: agent.useAllSources ? 'all' : 'selected',
      active_objective_text: agent.learningObjectives[activeObjectiveIndex]?.text,
    };

    // Prepare messages for API (exclude system messages, include history)
    const apiMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));
    apiMessages.push({ role: 'user' as const, content: messageText });

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, agentConfig }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limited. Please try again later.');
        } else if (response.status === 402) {
          toast.error('Please add credits to continue.');
        } else {
          toast.error('Failed to get response');
        }
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                updateLastAssistantMessage(assistantContent);
              }
            } catch {
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
        }
      }

      // Save the final assistant message to DB
      if (assistantContent) {
        await addAssistantMessage(assistantContent);

        // Check for objective completion after response
        const visibleObjectives = agent.learningObjectives.filter(o => o.showToOthers);
        const updatedMessages = [
          ...messages,
          { id: 'temp-user', role: 'user' as const, content: messageText, conversation_id: '', created_at: new Date().toISOString() },
          { id: 'temp-assistant', role: 'assistant' as const, content: assistantContent, conversation_id: '', created_at: new Date().toISOString() },
        ] as Message[];
        checkObjectiveCompletion(updatedMessages, visibleObjectives);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = agent ? (quickActionsByType[agent.template] || ['Help me learn', 'Explain this', 'Quiz me']) : [];

  const loading = agentLoading || conversationLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  // Use all objectives (they're all visible by default from DB mapping)
  const visibleObjectives = agent.learningObjectives;
  // Display text based on selected index with safe clamping
  const safeIndex = visibleObjectives.length > 0 ? Math.min(activeObjectiveIndex, visibleObjectives.length - 1) : 0;
  const displayedObjectiveText = visibleObjectives.length > 0 ? visibleObjectives[safeIndex]?.text : '';

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden relative">
      <CollapsedSidebar />

      {/* Star flood animation overlay */}
      <StarFloodAnimation
        isVisible={showStarFlood}
        onComplete={() => setShowStarFlood(false)}
        duration={5000}
      />

      <div
        className="flex-1 flex flex-col relative"
        style={{
          animation: isExiting
            ? 'agentSlideUp 0.25s ease-in forwards'
            : 'agentSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes agentSlideDown {
            from { transform: translateY(-40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes agentSlideUp {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-40px); opacity: 0; }
          }
        `}</style>

        {/* Starry header - reduced to h-32 with CSS starfield */}
        <div className="relative h-32 shrink-0 overflow-hidden">
          {/* Starfield background */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(180deg, hsl(230, 35%, 4%) 0%, hsl(230, 35%, 8%) 100%)',
              zIndex: 0
            }}
          />
          {/* CSS-based starfield overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-90"
            style={{
              backgroundImage: `
                radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,.85) 50%, transparent 60%),
                radial-gradient(1px 1px at 80px 120px, rgba(255,255,255,.65) 50%, transparent 60%),
                radial-gradient(1px 1px at 140px 70px, rgba(255,255,255,.75) 50%, transparent 60%),
                radial-gradient(1px 1px at 210px 40px, rgba(255,255,255,.55) 50%, transparent 60%),
                radial-gradient(1px 1px at 260px 110px, rgba(255,255,255,.8) 50%, transparent 60%),
                radial-gradient(1px 1px at 330px 90px, rgba(255,255,255,.6) 50%, transparent 60%),
                radial-gradient(1px 1px at 410px 20px, rgba(255,255,255,.7) 50%, transparent 60%)
              `,
              backgroundSize: "480px 180px",
              backgroundRepeat: "repeat",
              zIndex: 1
            }}
          />

          {/* Logo */}
          <div className="absolute top-3 left-3 z-20">
            <img src={astarLogo} alt="ASTAR" className="h-7" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-300" />
          </button>

          {/* Agent name */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <h1 className="text-xl font-display font-semibold text-foreground">{agent.name}</h1>
          </div>

          {/* Curved horizon */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full"
            height="48"
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            style={{ transform: 'translateY(1px)', zIndex: 2 }}
          >
            <path
              d="M0,48 L0,24 Q720,0 1440,24 L1440,48 Z"
              fill={planetColor}
              fillOpacity="0.15"
            />
            <path
              d="M0,24 Q720,0 1440,24"
              fill="none"
              stroke={planetColor}
              strokeOpacity="0.3"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Main content */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${planetColor}15 0%, ${planetColor}08 50%, hsl(230, 35%, 7%) 100%)`,
          }}
        >
          {/* Learning objectives header - smaller spacing */}
          {visibleObjectives.length > 0 && (
            <div className="px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                {/* Label */}
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  Learning Objectives
                </span>

                {/* Star icons in pill container */}
                <div 
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                  style={{ 
                    border: `1.5px solid ${planetColor}40`,
                    backgroundColor: `${planetColor}10`
                  }}
                >
                  {visibleObjectives.map((obj, idx) => {
                    const isHit = isObjectiveHit(idx);
                    const isActive = activeObjectiveIndex === idx;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => setActiveObjectiveIndex(idx)}
                        className="relative p-1 rounded-full transition-all"
                        style={{
                          boxShadow: isActive 
                            ? `0 0 0 2px ${planetColor}` 
                            : 'none',
                        }}
                        title={obj.text}
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            isHit
                              ? 'fill-white text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]'
                              : 'text-slate-400'
                          }`}
                        />
                        {/* Subtle sparkle for completed */}
                        {isHit && (
                          <Sparkles 
                            className="absolute -top-0.5 -right-0.5 w-2 h-2" 
                            style={{ color: planetColor }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-border/50" />
                
                {/* Current objective text */}
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {displayedObjectiveText}
                </span>
              </div>
            </div>
          )}

          {/* Chat area - smaller padding */}
          <ScrollArea className="flex-1 px-4">
            <div className="py-3 space-y-3 max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">
                    Start a conversation with {agent.name}
                  </p>
                  {agent.description && (
                    <p className="text-xs text-muted-foreground/70 mt-1.5 max-w-md mx-auto">
                      {agent.description}
                    </p>
                  )}
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-800/50 text-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick actions - smaller buttons */}
          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-1.5 justify-center flex-wrap max-w-3xl mx-auto">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    onClick={() => handleSendMessage(action)}
                    className="h-8 px-3 text-xs bg-slate-800/50 border-slate-700 hover:bg-slate-700"
                    disabled={isStreaming}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* ChatGPT-style input area - smaller padding */}
          <div className="p-3 pb-5">
            <div className="max-w-3xl mx-auto">
              <div 
                className="relative flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 transition-colors focus-within:border-slate-600"
              >

                {/* Textarea - expands upward, no scrollbar */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${agent.name}...`}
                  className="flex-1 bg-transparent border-0 text-sm text-foreground placeholder:text-slate-500 resize-none focus:outline-none focus:ring-0 min-h-[22px] py-0.5 overflow-hidden"
                  style={{ height: '22px' }}
                  disabled={isStreaming}
                  rows={1}
                />

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="shrink-0 p-1.5 -mr-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: input.trim() && !isStreaming ? planetColor : 'transparent',
                    color: input.trim() && !isStreaming ? 'white' : 'currentColor'
                  }}
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRunner;
