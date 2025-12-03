import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Sidebar } from '@/components/navigation/Sidebar';

const assignments = [
  {
    id: 1,
    title: "Calculus Problem Set 5",
    subject: "Calculus",
    dueDate: "Dec 5, 2025",
    dueIn: "2 days",
    status: "Not started",
    color: "#F5A623",
  },
  {
    id: 2,
    title: "Physics Lab Report: Momentum",
    subject: "Physics",
    dueDate: "Dec 7, 2025",
    dueIn: "4 days",
    status: "In progress",
    color: "#50E3C2",
  },
  {
    id: 3,
    title: "English Essay: Literary Analysis",
    subject: "English",
    dueDate: "Dec 10, 2025",
    dueIn: "1 week",
    status: "Not started",
    color: "#BD10E0",
  },
  {
    id: 4,
    title: "CS Project: Algorithm Implementation",
    subject: "Computer Science",
    dueDate: "Dec 12, 2025",
    dueIn: "9 days",
    status: "In progress",
    color: "#4A90E2",
  },
  {
    id: 5,
    title: "History Research Paper Outline",
    subject: "History",
    dueDate: "Dec 15, 2025",
    dueIn: "12 days",
    status: "Not started",
    color: "#D0021B",
  },
];

const Board = () => {
  const [searchParams] = useSearchParams();
  const subjectFilter = searchParams.get('subject');

  const filteredAssignments = subjectFilter
    ? assignments.filter(a => a.subject === subjectFilter)
    : assignments;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      <Sidebar />

      <div className="relative z-10 min-h-screen p-8 pl-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Board
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upcoming assignments and tests synced from Canvas, Google Classroom, and more.
              {subjectFilter && (
                <span className="block mt-2 text-primary">
                  Filtered by: {subjectFilter}
                </span>
              )}
            </p>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment.id}
                className="glass-panel p-5 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: assignment.color }}
                    />
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {assignment.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due in {assignment.dueIn}
                        </span>
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            assignment.status === 'In progress' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="gap-1">
                    Get started
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="glass-panel p-8 text-center">
              <p className="text-muted-foreground">
                No assignments found for this subject.
              </p>
            </div>
          )}

          {/* Sync Notice */}
          <div className="glass-panel p-4 mt-8 text-center bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              📚 Connect your Canvas or Google Classroom account to automatically sync assignments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
