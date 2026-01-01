import { useState } from 'react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { CenterStar } from '@/components/galaxy/CenterStar';
import { Planet } from '@/components/galaxy/Planet';
import { SubjectPanel } from '@/components/galaxy/SubjectPanel';
import { UserStatus } from '@/components/galaxy/UserStatus';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AddPlanetButton } from '@/components/galaxy/AddPlanetButton';
import { getOrbitRadius, getPlanetAngle, orbitRadii } from '@/data/subjects';
import { usePlanets, Planet as PlanetType } from '@/hooks/usePlanets';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetType | null>(null);
  const { planets, loading, updatePlanet, deletePlanet } = usePlanets();

  const handleDeletePlanet = async (planetId: string) => {
    const success = await deletePlanet(planetId);
    if (success) {
      setSelectedPlanet(null);
    }
  };

  const handleRenamePlanet = async (planetId: string, newName: string) => {
    const success = await updatePlanet(planetId, { name: newName });
    if (success && selectedPlanet?.id === planetId) {
      setSelectedPlanet((prev) => (prev ? { ...prev, name: newName } : null));
    }
  };

  // Convert Planet to Subject format for existing components
  const planetAsSubject = selectedPlanet ? {
    name: selectedPlanet.name,
    lastActiveDaysAgo: selectedPlanet.lastActiveDaysAgo,
    color: selectedPlanet.color,
    stats: selectedPlanet.stats,
  } : null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      
      {/* Navigation */}
      <Sidebar />
      
      {/* User Status */}
      <UserStatus />

      {/* Center Star */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="pointer-events-auto">
          <CenterStar />
        </div>
      </div>

      {/* Orbit rings (visual guide) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        {orbitRadii.map((radius) => (
          <div
            key={radius}
            className="absolute rounded-full border border-border/20"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading your galaxy...</span>
          </div>
        </div>
      )}


      {/* Planets - Orbiting */}
      {!loading && planets.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
          {planets.map((planet, index) => {
            const orbitRadius = getOrbitRadius(planet.lastActiveDaysAgo);
            const baseAngle = getPlanetAngle(index, planets.length);
            // Slower rotation for outer orbits
            const duration = 60 + orbitRadius * 0.2;
            
            // Convert to subject format for Planet component
            const subject = {
              name: planet.name,
              lastActiveDaysAgo: planet.lastActiveDaysAgo,
              color: planet.color,
              stats: planet.stats,
            };
            
            return (
              <div
                key={planet.id}
                className="absolute origin-center"
                style={{
                  animation: `orbit ${duration}s linear infinite`,
                  animationDelay: `-${(baseAngle / 360) * duration}s`,
                }}
              >
                <div
                  className="pointer-events-auto"
                  style={{
                    transform: `translateX(${orbitRadius}px)`,
                  }}
                >
                  <Planet
                    subject={subject}
                    onSelect={() => setSelectedPlanet(planet)}
                    orbitDuration={duration}
                    animationDelay={-(baseAngle / 360) * duration}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Planet Button - always show */}
      {!loading && <AddPlanetButton />}

      {/* Subject Panel */}
      {selectedPlanet && (
        <SubjectPanel 
          subject={planetAsSubject!}
          planetId={selectedPlanet.id}
          onClose={() => setSelectedPlanet(null)}
          onDelete={() => handleDeletePlanet(selectedPlanet.id)}
          onRename={(_, newName) => handleRenamePlanet(selectedPlanet.id, newName)}
        />
      )}

      {/* Bottom hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center z-30">
        <p className="text-muted-foreground/60 text-xs">
          Click the big star to visit your Spaceship Room
        </p>
      </div>
    </div>
  );
};

export default Index;
