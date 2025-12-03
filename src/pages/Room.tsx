import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Palette, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { Sidebar } from '@/components/navigation/Sidebar';

const Room = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      <Sidebar />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="glass-panel p-8 max-w-2xl w-full text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center star-glow">
              <Rocket className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Welcome to your Spaceship Room
            </h1>
            <p className="text-muted-foreground">
              Here you'll use points to decorate your character and ship.
            </p>
          </div>

          {/* Preview cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-panel p-6 bg-secondary/30">
              <User className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-foreground mb-1">
                Character
              </h3>
              <p className="text-sm text-muted-foreground">
                Customize your avatar with outfits, accessories, and more.
              </p>
            </div>
            <div className="glass-panel p-6 bg-secondary/30">
              <Palette className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-foreground mb-1">
                Spaceship
              </h3>
              <p className="text-sm text-muted-foreground">
                Design your ship with colors, decals, and upgrades.
              </p>
            </div>
          </div>

          {/* Coming soon notice */}
          <div className="glass-panel p-4 bg-primary/10 border-primary/30 mb-6">
            <p className="text-sm text-foreground">
              🚀 Customization features coming soon! Keep earning points to get ready.
            </p>
          </div>

          {/* Back button */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Galaxy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Room;
