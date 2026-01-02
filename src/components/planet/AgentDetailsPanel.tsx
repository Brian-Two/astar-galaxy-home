import { X, Users, Zap, Target, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Agent, agentTemplates } from './types';

interface AgentDetailsPanelProps {
  open: boolean;
  onClose: () => void;
  agent: Agent | null;
  onStartSession: (agent: Agent) => void;
  planetColor: string;
}

export function AgentDetailsPanel({
  open,
  onClose,
  agent,
  onStartSession,
  planetColor,
}: AgentDetailsPanelProps) {
  if (!agent) return null;

  const template = agentTemplates.find(t => t.id === agent.template);

  const handleStart = () => {
    onStartSession(agent);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700"
              style={{ borderColor: planetColor }}
            >
              {template && <template.icon className="w-6 h-6" style={{ color: planetColor }} />}
            </div>
            <div>
              <DialogTitle className="text-foreground">{agent.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{template?.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Usage stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>Used {agent.timesUsed} times</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{agent.uniqueUsers === 0 ? 'No students yet' : `by ${agent.uniqueUsers} students`}</span>
            </div>
          </div>

          {/* Learning objectives */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Target className="w-4 h-4" style={{ color: planetColor }} />
              Learning objectives
            </div>
            <ul className="space-y-1.5">
              {agent.learningObjectives.map(obj => (
                <li key={obj.id} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  {obj.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Sources info */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <BookOpen className="w-4 h-4" style={{ color: planetColor }} />
              Sources
            </div>
            <p className="text-sm text-muted-foreground">
              {agent.useAllSources 
                ? 'Uses all sources on this planet'
                : `Uses ${agent.selectedSourceIds.length} selected sources`}
            </p>
          </div>

          {/* Scaffolding */}
          <div className="text-sm">
            <span className="text-muted-foreground">Support level: </span>
            <span className="text-foreground capitalize">{agent.scaffoldingLevel}</span>
          </div>

          {/* Description */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
            <p className="text-sm text-muted-foreground">
              This agent will use the planet's sources to help you study, work on assignments, 
              plan projects, or do research based on your learning objectives.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1 text-white"
            style={{ backgroundColor: planetColor }}
          >
            Start session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
