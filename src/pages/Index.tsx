import { useState } from 'react';
import { GalaxyBackground } from '@/components/galaxy/GalaxyBackground';
import { CenterStar } from '@/components/galaxy/CenterStar';
import { Planet } from '@/components/galaxy/Planet';
import { SubjectPanel } from '@/components/galaxy/SubjectPanel';
import { UserStatus } from '@/components/galaxy/UserStatus';
import { Sidebar } from '@/components/navigation/Sidebar';
import { subjects, getOrbitRadius, getPlanetAngle, Subject } from '@/data/subjects';

const Index = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GalaxyBackground />
      
      {/* Navigation */}
      <Sidebar />
      
      {/* User Status */}
      <UserStatus name="Brian" points={1250} />


      {/* Center Star */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="pointer-events-auto">
          <CenterStar />
        </div>
      </div>

      {/* Orbit rings (visual guide) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        {[140, 220, 320].map((radius, i) => (
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

      {/* Planets */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        {subjects.map((subject, index) => (
          <Planet
            key={subject.name}
            subject={subject}
            orbitRadius={getOrbitRadius(subject.lastActiveDaysAgo)}
            angle={getPlanetAngle(index, subjects.length)}
            onSelect={setSelectedSubject}
          />
        ))}
      </div>

      {/* Subject Panel */}
      <SubjectPanel 
        subject={selectedSubject} 
        onClose={() => setSelectedSubject(null)} 
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
