import { useState } from 'react';
import { Send, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Message, Space } from './types';
import { cn } from '@/lib/utils';

interface ChatPanelNeutralProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentSpace: Space | null;
  onPromptClick: (prompt: string) => void;
  subjectColor: string;
}

const suggestedPrompts = {
  study: [
    "Make a study plan for these notes.",
    "Quiz me on the key ideas.",
    "Explain this concept like I'm 12."
  ],
  homework: [
    "Help me break this assignment into steps.",
    "Check if my outline answers the prompt.",
    "What are common mistakes to avoid here?"
  ],
  project: [
    "Generate 3 project ideas based on my sources.",
    "Help me organize these articles.",
    "Turn this into a research question + sub-questions."
  ]
};

export const ChatPanelNeutral = ({ 
  messages, 
  onSendMessage, 
  currentSpace, 
  onPromptClick,
  subjectColor 
}: ChatPanelNeutralProps) => {
  const [input, setInput] = useState('');
  const intention = currentSpace?.intention || 'study';
  const prompts = suggestedPrompts[intention];

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0e10]">
      {/* Helper text and prompts */}
      <div className="p-6 border-b border-[#1a1b1e]">
        <p className="text-[#6b6b6b] text-sm mb-4">
          Talk to ASTAR.AI about anything in this space. It will use the sources you've added to help you study, do homework, or explore projects.
        </p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onPromptClick(prompt)}
              className="px-3 py-1.5 rounded-full bg-[#1a1b1e] text-sm text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#2a2b2e] transition-colors border border-[#2a2b2e]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1a1b1e] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#6b6b6b]" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? "bg-[#2a2b2e] text-[#e0e0e0]"
                  : "bg-[#1a1b1e] text-[#e0e0e0] border border-[#2a2b2e]"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {/* Highlight subject mentions in AI responses */}
              {message.role === 'assistant' && (
                <div className="mt-2 text-xs" style={{ color: subjectColor }}>
                  Using your sources
                </div>
              )}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#1a1b1e] flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[#6b6b6b]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-[#1a1b1e]">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ASTAR.AI anything about your assignment, notes, or project…"
            className="min-h-[60px] resize-none bg-[#0a0b0d] border-[#2a2b2e] text-[#e0e0e0] placeholder:text-[#6b6b6b]"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="h-[60px] w-[60px] bg-[#2a2b2e] hover:bg-[#3a3b3e] text-[#e0e0e0]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
