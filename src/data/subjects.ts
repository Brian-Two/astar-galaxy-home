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

export const subjects: Subject[] = [
  { 
    name: "Calculus", 
    lastActiveDaysAgo: 1, 
    color: "#F5A623",
    stats: {
      assignmentsCompleted: 8,
      studySessions: 5,
      projects: 1
    }
  },
  { 
    name: "Physics", 
    lastActiveDaysAgo: 3, 
    color: "#50E3C2",
    stats: {
      assignmentsCompleted: 6,
      studySessions: 4,
      projects: 2
    }
  },
  { 
    name: "English", 
    lastActiveDaysAgo: 7, 
    color: "#BD10E0",
    stats: {
      assignmentsCompleted: 12,
      studySessions: 3,
      projects: 0
    }
  },
  { 
    name: "Computer Science", 
    lastActiveDaysAgo: 0, 
    color: "#4A90E2",
    stats: {
      assignmentsCompleted: 15,
      studySessions: 8,
      projects: 4
    }
  },
  { 
    name: "History", 
    lastActiveDaysAgo: 14, 
    color: "#D0021B",
    stats: {
      assignmentsCompleted: 4,
      studySessions: 2,
      projects: 1
    }
  },
];

// Calculate orbit radius based on last activity
export const getOrbitRadius = (lastActiveDaysAgo: number): number => {
  const minRadius = 140;
  const maxRadius = 320;
  
  if (lastActiveDaysAgo <= 2) return minRadius;
  if (lastActiveDaysAgo <= 7) return minRadius + (maxRadius - minRadius) * 0.4;
  return maxRadius;
};

// Distribute planets around the star at different angles
export const getPlanetAngle = (index: number, total: number): number => {
  const baseAngle = (360 / total) * index;
  // Add some variation to make it look more natural
  const variation = (index % 2 === 0 ? 15 : -10);
  return baseAngle + variation;
};
