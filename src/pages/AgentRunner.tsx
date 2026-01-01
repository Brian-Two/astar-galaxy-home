import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Star, Send, Loader2, Check, FolderOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlanets } from '@/hooks/usePlanets';
import { useAgentConversation, Message } from '@/hooks/useAgentConversation';
import { useObjectiveProgress } from '@/hooks/useObjectiveProgress';
import { CollapsedSidebar } from '@/components/navigation/CollapsedSidebar';
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
  const objectives = Array.isArray(db.learning_objectives)
    ? (db.learning_objectives as { text: string; visible?: boolean; showToOthers?: boolean }[]).map((o, i) => ({
        id: `obj-${i}`,
        text: o.text,
        showToOthers: o.showToOthers ?? o.visible ?? true,
      }))
    : [];

  const rawGuardrails = typeof db.guardrails === 'object' && db.guardrails !== null
    ? (db.guardrails as Partial<AgentGuardrails>)
    : {};

  const guardrails: AgentGuardrails = { ...defaultGuardrails, ...rawGuardrails };

  return {
    id: db.id,
    name: db.name,
    template: db.type as Agent['template'],
    description: db.description || '',
    learningObjectives: objectives,
    guardrails,
    scaffoldingLevel: db.scaffolding_level as 'light' | 'medium' | 'heavy',
    scaffoldingBehaviors: Array.isArray(db.scaffolding_behaviors)
      ? (db.scaffolding_behaviors as string[])
      : [],
    useAllSources: db.source_mode === 'all',
    selectedSourceIds: Array.isArray(db.selected_source_ids)
      ? (db.selected_source_ids as string[])
      : [],
    timesUsed: db.times_used,
    uniqueUsers: db.unique_users,
    createdAt: new Date(db.created_at),
    planetId: db.planet_id,
  };
}

const AgentRunner = () => {
  const { planetId, agentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeObjectiveIndex, setActiveObjectiveIndex] = useState<number | null>(null);

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

        setAgent(mapDbAgentToAgent(data as DbAgent));
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast.error('Failed to load agent');
      } finally {
        setAgentLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, planetId, user, navigate, planetName]);

  // Animated stars background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 160;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 100; i++) {
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
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(`/planet/${encodeURIComponent(planetName)}`);
    }, 250);
  };

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
      active_objective_text: activeObjectiveIndex !== null
        ? agent.learningObjectives[activeObjectiveIndex]?.text
        : undefined,
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

  const handleMarkObjectiveHit = async () => {
    if (activeObjectiveIndex === null) return;

    const success = await markObjectiveHit(activeObjectiveIndex);
    if (success) {
      toast.success('Objective marked as complete!');
    } else {
      toast.error('Failed to mark objective');
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

  const visibleObjectives = agent.learningObjectives.filter(o => o.showToOthers);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden relative">
      <CollapsedSidebar />

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

        {/* Starry header */}
        <div className="relative h-40 shrink-0 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'linear-gradient(180deg, hsl(230, 35%, 4%) 0%, hsl(230, 35%, 8%) 100%)',
            }}
          />

          {/* Logo */}
          <div className="absolute top-4 left-4 z-20">
            <img src={astarLogo} alt="ASTAR" className="h-8" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>

          {/* Agent name */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <h1 className="text-2xl font-display font-semibold text-foreground">{agent.name}</h1>
          </div>

          {/* Curved horizon */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full"
            height="56"
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            style={{ transform: 'translateY(1px)' }}
          >
            <path
              d="M0,56 L0,28 Q720,0 1440,28 L1440,56 Z"
              fill={planetColor}
              fillOpacity="0.15"
            />
            <path
              d="M0,28 Q720,0 1440,28"
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
          {/* Learning objectives header */}
          {visibleObjectives.length > 0 && (
            <div className="px-6 py-4 border-b border-border/30">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-muted-foreground">Objectives:</span>
                <div className="flex items-center gap-2">
                  {visibleObjectives.map((obj, idx) => {
                    const isHit = isObjectiveHit(idx);
                    const isActive = activeObjectiveIndex === idx;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => setActiveObjectiveIndex(isActive ? null : idx)}
                        className={`p-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
                            : 'hover:bg-slate-800/50'
                        }`}
                        title={obj.text}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isHit
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                {activeObjectiveIndex !== null && visibleObjectives[activeObjectiveIndex] && (
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
                      {visibleObjectives[activeObjectiveIndex].text}
                    </Badge>
                    {!isObjectiveHit(activeObjectiveIndex) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleMarkObjectiveHit}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark as hit
                      </Button>
                    )}
                  </div>
                )}
                {activeObjectiveIndex === null && (
                  <span className="text-sm text-muted-foreground italic">
                    Select an objective to focus (optional)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Chat area */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-4 max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Start a conversation with {agent.name}
                  </p>
                  {agent.description && (
                    <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-800/50 text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick actions */}
          {messages.length === 0 && (
            <div className="px-6 pb-2">
              <div className="flex items-center gap-2 justify-center flex-wrap max-w-3xl mx-auto">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(action)}
                    className="bg-slate-800/50 border-slate-700 hover:bg-slate-700"
                    disabled={isStreaming}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-6 border-t border-border/30">
            <div className="max-w-3xl mx-auto flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/planets/${planetId}/sources`)}
                className="shrink-0 bg-slate-800/50 border-slate-700 hover:bg-slate-700"
                title="View sources"
              >
                <FolderOpen className="w-5 h-5" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${agent.name}...`}
                className="min-h-[44px] max-h-32 resize-none bg-slate-900/50 border-slate-700"
                disabled={isStreaming}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isStreaming}
                style={{ backgroundColor: planetColor }}
                className="shrink-0 hover:opacity-90"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRunner;
