export interface Subject {
  name: string;
  lastActiveDaysAgo: number;
  color: string;
  stats: {
    assignmentsCompleted: number;
    studySessions: number;
    projects: number;
  };
}

// Orbit radii for 4 layers
export const orbitRadii = [140, 200, 270, 350];

// Calculate orbit radius based on last activity
export const getOrbitRadius = (lastActiveDaysAgo: number): number => {
  if (lastActiveDaysAgo <= 1) return orbitRadii[0];
  if (lastActiveDaysAgo <= 4) return orbitRadii[1];
  if (lastActiveDaysAgo <= 10) return orbitRadii[2];
  return orbitRadii[3];
};

// Find a non-overlapping angle for a new planet
export const findNonOverlappingAngle = (
  existingSubjects: Subject[],
  newOrbitRadius: number
): number => {
  const subjectsOnSameOrbit = existingSubjects.filter(
    (s) => getOrbitRadius(s.lastActiveDaysAgo) === newOrbitRadius
  );
  
  if (subjectsOnSameOrbit.length === 0) return 0;
  
  // Find the largest gap between existing planets
  const existingAngles = subjectsOnSameOrbit
    .map((_, i) => getPlanetAngle(i, subjectsOnSameOrbit.length))
    .sort((a, b) => a - b);
  
  let maxGap = 0;
  let bestAngle = 0;
  
  for (let i = 0; i < existingAngles.length; i++) {
    const nextIdx = (i + 1) % existingAngles.length;
    const gap = nextIdx === 0 
      ? (360 - existingAngles[i] + existingAngles[0])
      : (existingAngles[nextIdx] - existingAngles[i]);
    
    if (gap > maxGap) {
      maxGap = gap;
      bestAngle = (existingAngles[i] + gap / 2) % 360;
    }
  }
  
  return bestAngle;
};

// Distribute planets around the star at different angles
export const getPlanetAngle = (index: number, total: number): number => {
  const baseAngle = (360 / total) * index;
  // Add some variation to make it look more natural
  const variation = (index % 2 === 0 ? 15 : -10);
  return baseAngle + variation;
};
