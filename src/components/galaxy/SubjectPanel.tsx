import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subject } from '@/data/subjects';
import { useNavigate } from 'react-router-dom';

interface SubjectPanelProps {
  subject: Subject | null;
  onClose: () => void;
}

export const SubjectPanel = ({ subject, onClose }: SubjectPanelProps) => {
  const navigate = useNavigate();

  if (!subject) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 z-50 animate-slide-in">
      <div className="h-full glass-panel m-4 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div 
              className="w-12 h-12 rounded-full mb-3"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${subject.color}ee, ${subject.color}aa)`,
                boxShadow: `0 0 20px ${subject.color}50`,
              }}
            />
            <h2 className="font-display text-2xl font-bold text-foreground">
              {subject.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              Last active: {subject.lastActiveDaysAgo === 0 ? 'Today' : `${subject.lastActiveDaysAgo} days ago`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="glass-panel p-4 mb-6 bg-secondary/30">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Keep this planet close by doing an assignment, study session, or project in <span className="text-foreground font-medium">{subject.name}</span>.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-panel p-3 text-center">
              <div className="text-2xl font-display font-bold text-foreground">
                {subject.stats.assignmentsCompleted}
              </div>
              <div className="text-xs text-muted-foreground">Assignments</div>
            </div>
            <div className="glass-panel p-3 text-center">
              <div className="text-2xl font-display font-bold text-foreground">
                {subject.stats.studySessions}
              </div>
              <div className="text-xs text-muted-foreground">Study Sessions</div>
            </div>
            <div className="glass-panel p-3 text-center">
              <div className="text-2xl font-display font-bold text-foreground">
                {subject.stats.projects}
              </div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => navigate(`/astar-ai?subject=${encodeURIComponent(subject.name)}`)}
          >
            Open ASTAR.AI for this subject
          </Button>
          <Button 
            variant="secondary"
            className="w-full"
            onClick={() => navigate(`/board?subject=${encodeURIComponent(subject.name)}`)}
          >
            View assignments on Board
          </Button>
        </div>
      </div>
    </div>
  );
};
