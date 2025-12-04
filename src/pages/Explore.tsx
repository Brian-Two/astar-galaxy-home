import { Lightbulb, Trophy, ExternalLink } from 'lucide-react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Sidebar } from '@/components/navigation/Sidebar';

const suggestedProjects = [
  {
    title: "Build a Simple Calculator",
    subject: "Computer Science",
    description: "Apply your programming skills to create a functional calculator app.",
    points: 150,
    difficulty: "Easy",
  },
  {
    title: "Physics Simulation",
    subject: "Physics",
    description: "Create a visual simulation of projectile motion using real physics equations.",
    points: 300,
    difficulty: "Medium",
  },
  {
    title: "Historical Timeline",
    subject: "History",
    description: "Research and create an interactive timeline of a historical period.",
    points: 200,
    difficulty: "Medium",
  },
];

const Explore = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      <Sidebar />

      <div className="relative z-10 min-h-screen p-8 pl-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Explore
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Find ways to apply skills you've learned and earn points using outside resources.
            </p>
          </div>

          {/* Suggested Projects */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Suggested Projects
              </h2>
            </div>

            <div className="space-y-4">
              {suggestedProjects.map((project, index) => (
                <div 
                  key={index}
                  className="glass-panel p-5 hover:bg-card/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {project.subject}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-primary">
                          <Trophy className="w-3 h-3" />
                          {project.points} points
                        </span>
                        <span className="text-muted-foreground">
                          Difficulty: {project.difficulty}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="glass-panel p-6 text-center bg-primary/5 border-primary/20">
            <p className="text-muted-foreground">
              More exploration features coming soon! We'll recommend projects based on your skills and interests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
