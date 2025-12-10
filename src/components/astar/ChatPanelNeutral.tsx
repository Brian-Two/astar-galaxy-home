import { useState } from 'react';
import { Send } from 'lucide-react';
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
    <div className="flex-1 flex flex-col h-full bg-card/30">
      {/* Suggested prompts */}
      <div className="p-4 border-b border-border/30">
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onPromptClick(prompt)}
              className="px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border/30"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-3",
                message.role === 'user'
                  ? "bg-secondary text-foreground"
                  : "text-foreground"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border/30">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ASTAR.AI..."
            className="min-h-[52px] pr-12 resize-none rounded-2xl bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            variant="ghost"
            className="absolute right-2 bottom-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
