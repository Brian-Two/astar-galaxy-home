import { useSearchParams } from 'react-router-dom';
import { Sparkles, Send, FileText, BookOpen, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Sidebar } from '@/components/navigation/Sidebar';

const AstarAI = () => {
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject');

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      <Sidebar />

      <div className="relative z-10 min-h-screen p-8 pl-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              ASTAR.AI
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your AI helper that breaks down assignments, study sessions, or projects into manageable steps.
              {subject && (
                <span className="block mt-2 text-primary">
                  Currently focused on: {subject}
                </span>
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button className="glass-panel p-4 hover:bg-card/80 transition-colors text-center group">
              <FileText className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-foreground">Paste Assignment</span>
            </button>
            <button className="glass-panel p-4 hover:bg-card/80 transition-colors text-center group">
              <BookOpen className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-foreground">Study Session</span>
            </button>
            <button className="glass-panel p-4 hover:bg-card/80 transition-colors text-center group">
              <Hammer className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-foreground">Start Project</span>
            </button>
          </div>

          {/* Chat Interface Placeholder */}
          <div className="glass-panel p-6">
            <div className="min-h-[300px] flex items-center justify-center text-center">
              <div>
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  This is where you'll paste assignments or choose tasks for AI-guided breakdowns.
                </p>
                <p className="text-sm text-muted-foreground/60">
                  The AI will help you understand what's needed and create step-by-step plans.
                </p>
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="Paste an assignment or describe what you want to work on..."
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button size="lg" className="gap-2">
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstarAI;
