import { useState } from 'react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { CenterStar } from '@/components/galaxy/CenterStar';
import { Planet } from '@/components/galaxy/Planet';
import { SubjectPanel } from '@/components/galaxy/SubjectPanel';
import { UserStatus } from '@/components/galaxy/UserStatus';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AddPlanetButton } from '@/components/galaxy/AddPlanetButton';
import { subjects as initialSubjects, getOrbitRadius, getPlanetAngle, orbitRadii, Subject } from '@/data/subjects';

const Index = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);

  const handleAddPlanet = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleDeletePlanet = (subjectName: string) => {
    setSubjects((prev) => prev.filter((s) => s.name !== subjectName));
    setSelectedSubject(null);
  };

  const handleRenamePlanet = (oldName: string, newName: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.name === oldName ? { ...s, name: newName } : s))
    );
    if (selectedSubject?.name === oldName) {
      setSelectedSubject((prev) => (prev ? { ...prev, name: newName } : null));
    }
  };

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

      {/* Planets - Orbiting */}
      <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
        {subjects.map((subject, index) => {
          const orbitRadius = getOrbitRadius(subject.lastActiveDaysAgo);
          const baseAngle = getPlanetAngle(index, subjects.length);
          // Slower rotation for outer orbits
          const duration = 60 + orbitRadius * 0.2;
          
          return (
            <div
              key={subject.name}
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
                  onSelect={setSelectedSubject}
                  orbitDuration={duration}
                  animationDelay={-(baseAngle / 360) * duration}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Planet Button */}
      <AddPlanetButton onAddPlanet={handleAddPlanet} existingSubjects={subjects} />

      {/* Subject Panel */}
      <SubjectPanel 
        subject={selectedSubject} 
        onClose={() => setSelectedSubject(null)}
        onDelete={handleDeletePlanet}
        onRename={handleRenamePlanet}
      />

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
