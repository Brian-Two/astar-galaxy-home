// Types for Explore page
export interface UserProfile {
  careerGoal: string;
  learnerLevel: 'challenged' | 'average' | 'gifted';
  bartleType: 'achiever' | 'explorer' | 'socializer' | 'competitor';
}

export type PostType = 'opportunity' | 'project' | 'planet' | 'agent' | 'tutoring-need' | 'tutoring-offer';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExploreItem {
  id: string;
  type: PostType;
  title: string;
  description: string;
  subject?: string;
  difficulty?: Difficulty;
  link?: string;
  tags: string[];
  stats?: {
    activeUsers?: number;
    uses?: number;
    rating?: number;
  };
  availability?: string;
  preferredFormat?: 'text' | 'voice' | 'both';
  author?: string;
  createdAt: Date;
  // For personalization scoring
  keywords: string[];
}

// Mock user profile
export const mockUserProfile: UserProfile = {
  careerGoal: 'software engineer',
  learnerLevel: 'average',
  bartleType: 'achiever',
};

// Seed data for External Opportunities
export const externalOpportunities: ExploreItem[] = [
  {
    id: 'opp-1',
    type: 'opportunity',
    title: 'HackerRank 30 Days of Code',
    description: 'Complete daily coding challenges to build your programming fundamentals. Perfect for interview prep.',
    subject: 'Computer Science',
    difficulty: 'beginner',
    link: 'https://hackerrank.com/30-days-of-code',
    tags: ['coding', 'interview prep', 'certification'],
    keywords: ['software engineer', 'programming', 'developer', 'coding'],
    createdAt: new Date(),
  },
  {
    id: 'opp-2',
    type: 'opportunity',
    title: 'LeetCode Weekly Contest',
    description: 'Compete in weekly algorithmic challenges against developers worldwide. Climb the leaderboard!',
    subject: 'Computer Science',
    difficulty: 'advanced',
    link: 'https://leetcode.com/contest',
    tags: ['competition', 'algorithms', 'ranked'],
    keywords: ['software engineer', 'competitive programming', 'algorithms'],
    createdAt: new Date(),
  },
  {
    id: 'opp-3',
    type: 'opportunity',
    title: 'Google Summer of Code 2025',
    description: 'Apply to work on open source projects with mentorship from top tech companies.',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    link: 'https://summerofcode.withgoogle.com',
    tags: ['internship', 'open source', 'mentorship'],
    keywords: ['software engineer', 'internship', 'career'],
    createdAt: new Date(),
  },
  {
    id: 'opp-4',
    type: 'opportunity',
    title: 'MLH Hackathon Season',
    description: 'Join hackathons across the globe. Build projects, win prizes, and meet other hackers.',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    link: 'https://mlh.io/seasons',
    tags: ['hackathon', 'projects', 'networking'],
    keywords: ['software engineer', 'group projects', 'collaboration'],
    createdAt: new Date(),
  },
  {
    id: 'opp-5',
    type: 'opportunity',
    title: 'Khan Academy SAT Prep',
    description: 'Free personalized SAT practice with official College Board questions and instant feedback.',
    subject: 'Math',
    difficulty: 'intermediate',
    link: 'https://khanacademy.org/sat',
    tags: ['test prep', 'certification', 'college'],
    keywords: ['college', 'standardized testing', 'math'],
    createdAt: new Date(),
  },
  {
    id: 'opp-6',
    type: 'opportunity',
    title: 'NASA STEM Internships',
    description: 'Apply for internships at NASA centers across the country. Work on real space missions.',
    subject: 'Physics',
    difficulty: 'advanced',
    link: 'https://intern.nasa.gov',
    tags: ['internship', 'STEM', 'aerospace'],
    keywords: ['aerospace engineer', 'physics', 'engineering'],
    createdAt: new Date(),
  },
  {
    id: 'opp-7',
    type: 'opportunity',
    title: 'Codecademy Pro Free Trial',
    description: 'Get hands-on coding practice with interactive lessons in Python, JavaScript, and more.',
    subject: 'Computer Science',
    difficulty: 'beginner',
    link: 'https://codecademy.com',
    tags: ['learning', 'certification', 'interactive'],
    keywords: ['software engineer', 'programming', 'web development'],
    createdAt: new Date(),
  },
  {
    id: 'opp-8',
    type: 'opportunity',
    title: 'Coursera Financial Aid',
    description: 'Apply for financial aid to access premium courses from top universities for free.',
    subject: 'General',
    difficulty: 'beginner',
    link: 'https://coursera.org/financial-aid',
    tags: ['courses', 'certification', 'free'],
    keywords: ['learning', 'education', 'career'],
    createdAt: new Date(),
  },
];

// Seed data for Community Projects
export const communityProjects: ExploreItem[] = [
  {
    id: 'proj-1',
    type: 'project',
    title: 'Build a Study Tracker App',
    description: 'Looking for 2-3 teammates to build a Pomodoro-based study app with stats and achievements.',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    tags: ['group project', 'React', 'productivity'],
    author: 'Sarah K.',
    keywords: ['software engineer', 'group projects', 'collaboration'],
    createdAt: new Date(),
  },
  {
    id: 'proj-2',
    type: 'project',
    title: 'Physics Simulation Challenge',
    description: 'Create a realistic physics simulation (projectile motion, pendulums, etc.) using any framework.',
    subject: 'Physics',
    difficulty: 'advanced',
    tags: ['challenge', 'simulation', 'solo/team'],
    author: 'Dr. Martinez',
    keywords: ['physics', 'simulation', 'programming'],
    createdAt: new Date(),
  },
  {
    id: 'proj-3',
    type: 'project',
    title: 'Math Art Gallery',
    description: 'Create visual art using mathematical concepts. Fractals, tessellations, golden ratio - anything goes!',
    subject: 'Mathematics',
    difficulty: 'beginner',
    tags: ['creative', 'interdisciplinary', 'art'],
    author: 'Alex T.',
    keywords: ['math', 'creative', 'new', 'weird'],
    createdAt: new Date(),
  },
  {
    id: 'proj-4',
    type: 'project',
    title: 'Climate Data Visualization',
    description: 'Analyze and visualize climate change data. Looking for data science enthusiasts!',
    subject: 'Environmental Science',
    difficulty: 'intermediate',
    tags: ['data science', 'group project', 'impact'],
    author: 'Maya R.',
    keywords: ['data science', 'environment', 'collaboration'],
    createdAt: new Date(),
  },
  {
    id: 'proj-5',
    type: 'project',
    title: 'Algorithm Visualization Library',
    description: 'Building an open-source library to visualize sorting, searching, and graph algorithms.',
    subject: 'Computer Science',
    difficulty: 'advanced',
    tags: ['open source', 'algorithms', 'visualization'],
    author: 'James L.',
    keywords: ['software engineer', 'algorithms', 'open source'],
    createdAt: new Date(),
  },
  {
    id: 'proj-6',
    type: 'project',
    title: 'Language Learning Discord Bot',
    description: 'Building a bot that sends daily vocabulary and quizzes. Need help with Spanish content!',
    subject: 'Languages',
    difficulty: 'beginner',
    tags: ['group project', 'languages', 'automation'],
    author: 'Carlos M.',
    keywords: ['languages', 'automation', 'collaboration'],
    createdAt: new Date(),
  },
  {
    id: 'proj-7',
    type: 'project',
    title: 'Historical Event Mapper',
    description: 'Interactive timeline/map showing historical events. Great for visual learners!',
    subject: 'History',
    difficulty: 'intermediate',
    tags: ['visualization', 'history', 'interactive'],
    author: 'Emma W.',
    keywords: ['history', 'visualization', 'education'],
    createdAt: new Date(),
  },
  {
    id: 'proj-8',
    type: 'project',
    title: 'Chemistry Molecule Builder',
    description: '3D molecular structure builder for organic chemistry. Looking for WebGL enthusiasts.',
    subject: 'Chemistry',
    difficulty: 'advanced',
    tags: ['3D', 'chemistry', 'visualization'],
    author: 'Dr. Chen',
    keywords: ['chemistry', '3D', 'science'],
    createdAt: new Date(),
  },
];

// Seed data for Trending Planets
export const trendingPlanets: ExploreItem[] = [
  {
    id: 'planet-1',
    type: 'planet',
    title: 'Machine Learning Fundamentals',
    description: 'A comprehensive planet covering ML basics, neural networks, and practical projects.',
    subject: 'Computer Science',
    tags: ['AI', 'trending', 'certification'],
    stats: { activeUsers: 2340 },
    author: 'AI Academy',
    keywords: ['software engineer', 'AI', 'machine learning'],
    createdAt: new Date(),
  },
  {
    id: 'planet-2',
    type: 'planet',
    title: 'Calculus for Engineers',
    description: 'Applied calculus with real-world engineering problems. Great for STEM majors.',
    subject: 'Mathematics',
    tags: ['engineering', 'applied math'],
    stats: { activeUsers: 1820 },
    author: 'Prof. Anderson',
    keywords: ['engineering', 'math', 'calculus'],
    createdAt: new Date(),
  },
  {
    id: 'planet-3',
    type: 'planet',
    title: 'Creative Writing Workshop',
    description: 'Daily prompts, peer feedback, and publishing tips for aspiring writers.',
    subject: 'English',
    tags: ['creative', 'writing', 'community'],
    stats: { activeUsers: 1560 },
    author: 'Writers Guild',
    keywords: ['writing', 'creative', 'english'],
    createdAt: new Date(),
  },
  {
    id: 'planet-4',
    type: 'planet',
    title: 'Quantum Physics Explorer',
    description: 'Mind-bending quantum concepts explained with interactive simulations.',
    subject: 'Physics',
    tags: ['advanced', 'interactive', 'new'],
    stats: { activeUsers: 980 },
    author: 'Quantum Labs',
    keywords: ['physics', 'quantum', 'new', 'weird'],
    createdAt: new Date(),
  },
  {
    id: 'planet-5',
    type: 'planet',
    title: 'Data Structures Mastery',
    description: 'Master arrays, trees, graphs, and more with 100+ practice problems.',
    subject: 'Computer Science',
    tags: ['interview prep', 'algorithms', 'practice'],
    stats: { activeUsers: 3120 },
    author: 'Code Masters',
    keywords: ['software engineer', 'algorithms', 'interview prep'],
    createdAt: new Date(),
  },
  {
    id: 'planet-6',
    type: 'planet',
    title: 'World History: Modern Era',
    description: 'From the Industrial Revolution to today. Includes primary sources and debates.',
    subject: 'History',
    tags: ['comprehensive', 'discussion'],
    stats: { activeUsers: 1240 },
    author: 'History Hub',
    keywords: ['history', 'world history', 'social studies'],
    createdAt: new Date(),
  },
  {
    id: 'planet-7',
    type: 'planet',
    title: 'Spanish Immersion',
    description: 'Learn Spanish through conversation practice, music, and culture.',
    subject: 'Languages',
    tags: ['immersive', 'culture', 'beginner-friendly'],
    stats: { activeUsers: 2100 },
    author: 'Lingua Franca',
    keywords: ['languages', 'spanish', 'culture'],
    createdAt: new Date(),
  },
  {
    id: 'planet-8',
    type: 'planet',
    title: 'AP Chemistry Prep',
    description: 'Complete AP Chemistry review with practice exams and lab simulations.',
    subject: 'Chemistry',
    tags: ['AP', 'test prep', 'certification'],
    stats: { activeUsers: 890 },
    author: 'AP Masters',
    keywords: ['chemistry', 'AP', 'test prep'],
    createdAt: new Date(),
  },
];

// Seed data for Trending Agents
export const trendingAgents: ExploreItem[] = [
  {
    id: 'agent-1',
    type: 'agent',
    title: 'Quiz Master Pro',
    description: 'Generates adaptive quizzes based on your study materials. Tracks weak areas.',
    subject: 'General',
    tags: ['quiz', 'adaptive', 'analytics'],
    stats: { uses: 15420, rating: 4.8 },
    author: 'ASTAR Team',
    keywords: ['practice', 'quiz', 'progress'],
    createdAt: new Date(),
  },
  {
    id: 'agent-2',
    type: 'agent',
    title: 'Flashcard Genius',
    description: 'Spaced repetition flashcards with audio pronunciation and image support.',
    subject: 'General',
    tags: ['flashcards', 'spaced repetition', 'audio'],
    stats: { uses: 12300, rating: 4.7 },
    author: 'Memory Labs',
    keywords: ['memorization', 'flashcards', 'learning'],
    createdAt: new Date(),
  },
  {
    id: 'agent-3',
    type: 'agent',
    title: 'Code Explainer',
    description: 'Breaks down complex code into simple explanations. Supports 20+ languages.',
    subject: 'Computer Science',
    tags: ['coding', 'explanations', 'debugging'],
    stats: { uses: 8900, rating: 4.9 },
    author: 'DevTools',
    keywords: ['software engineer', 'programming', 'learning'],
    createdAt: new Date(),
  },
  {
    id: 'agent-4',
    type: 'agent',
    title: 'Essay Coach',
    description: 'Helps structure essays, provides feedback, and suggests improvements.',
    subject: 'English',
    tags: ['writing', 'feedback', 'structure'],
    stats: { uses: 6540, rating: 4.6 },
    author: 'Write Right',
    keywords: ['writing', 'essays', 'english'],
    createdAt: new Date(),
  },
  {
    id: 'agent-5',
    type: 'agent',
    title: 'Math Problem Solver',
    description: 'Step-by-step solutions for algebra, calculus, and statistics problems.',
    subject: 'Mathematics',
    tags: ['step-by-step', 'practice', 'explanations'],
    stats: { uses: 18200, rating: 4.8 },
    author: 'Math Wizards',
    keywords: ['math', 'problem solving', 'practice'],
    createdAt: new Date(),
  },
  {
    id: 'agent-6',
    type: 'agent',
    title: 'Project Planner',
    description: 'Breaks down projects into tasks, sets milestones, and sends reminders.',
    subject: 'General',
    tags: ['planning', 'productivity', 'reminders'],
    stats: { uses: 5420, rating: 4.5 },
    author: 'Productivity Pro',
    keywords: ['planning', 'projects', 'organization'],
    createdAt: new Date(),
  },
  {
    id: 'agent-7',
    type: 'agent',
    title: 'Science Lab Assistant',
    description: 'Virtual lab partner that guides experiments and explains scientific concepts.',
    subject: 'Science',
    tags: ['labs', 'experiments', 'interactive'],
    stats: { uses: 4200, rating: 4.7 },
    author: 'SciLabs',
    keywords: ['science', 'experiments', 'labs'],
    createdAt: new Date(),
  },
  {
    id: 'agent-8',
    type: 'agent',
    title: 'Language Tutor',
    description: 'Conversational AI for language practice with accent training and grammar tips.',
    subject: 'Languages',
    tags: ['conversation', 'pronunciation', 'grammar'],
    stats: { uses: 7800, rating: 4.6 },
    author: 'Polyglot AI',
    keywords: ['languages', 'conversation', 'practice'],
    createdAt: new Date(),
  },
];

// Seed data for Tutoring
export const tutoringNeeds: ExploreItem[] = [
  {
    id: 'tutor-need-1',
    type: 'tutoring-need',
    title: 'Need help with Calculus II',
    description: 'Struggling with integration techniques and series. Looking for patient tutor.',
    subject: 'Mathematics',
    difficulty: 'intermediate',
    tags: ['calculus', 'urgent'],
    availability: 'Weekday evenings',
    preferredFormat: 'voice',
    author: 'Mike S.',
    keywords: ['math', 'tutoring', 'study sessions'],
    createdAt: new Date(),
  },
  {
    id: 'tutor-need-2',
    type: 'tutoring-need',
    title: 'Python debugging help',
    description: 'Working on a data analysis project and stuck on pandas dataframes.',
    subject: 'Computer Science',
    difficulty: 'beginner',
    tags: ['Python', 'data science'],
    availability: 'Flexible',
    preferredFormat: 'text',
    author: 'Jenny L.',
    keywords: ['software engineer', 'programming', 'data science'],
    createdAt: new Date(),
  },
  {
    id: 'tutor-need-3',
    type: 'tutoring-need',
    title: 'AP Physics C Mechanics',
    description: 'Need help understanding rotational dynamics before the exam.',
    subject: 'Physics',
    difficulty: 'advanced',
    tags: ['AP', 'exam prep'],
    availability: 'Weekends',
    preferredFormat: 'voice',
    author: 'David K.',
    keywords: ['physics', 'AP', 'test prep'],
    createdAt: new Date(),
  },
  {
    id: 'tutor-need-4',
    type: 'tutoring-need',
    title: 'Essay review for college apps',
    description: 'Looking for someone to review my Common App essay and provide feedback.',
    subject: 'English',
    difficulty: 'intermediate',
    tags: ['college apps', 'writing'],
    availability: 'ASAP',
    preferredFormat: 'text',
    author: 'Sophia R.',
    keywords: ['writing', 'college', 'essays'],
    createdAt: new Date(),
  },
];

export const tutoringOffers: ExploreItem[] = [
  {
    id: 'tutor-offer-1',
    type: 'tutoring-offer',
    title: 'CS Tutor - Data Structures & Algorithms',
    description: 'Senior CS student offering help with DSA, interview prep, and coding projects.',
    subject: 'Computer Science',
    difficulty: 'advanced',
    tags: ['algorithms', 'interview prep'],
    availability: 'Mon/Wed/Fri evenings',
    preferredFormat: 'both',
    author: 'Alex T.',
    keywords: ['software engineer', 'algorithms', 'tutoring'],
    createdAt: new Date(),
  },
  {
    id: 'tutor-offer-2',
    type: 'tutoring-offer',
    title: 'Math Tutor - All Levels',
    description: 'Math teacher with 5 years experience. Algebra through Calculus III.',
    subject: 'Mathematics',
    difficulty: 'beginner',
    tags: ['patient', 'experienced'],
    availability: 'Weekday afternoons',
    preferredFormat: 'voice',
    author: 'Mrs. Johnson',
    keywords: ['math', 'tutoring', 'patient'],
    createdAt: new Date(),
  },
  {
    id: 'tutor-offer-3',
    type: 'tutoring-offer',
    title: 'Spanish Conversation Partner',
    description: 'Native speaker offering casual conversation practice. Great for beginners!',
    subject: 'Languages',
    difficulty: 'beginner',
    tags: ['native speaker', 'conversation'],
    availability: 'Weekends',
    preferredFormat: 'voice',
    author: 'Maria G.',
    keywords: ['languages', 'spanish', 'conversation'],
    createdAt: new Date(),
  },
  {
    id: 'tutor-offer-4',
    type: 'tutoring-offer',
    title: 'Chemistry Lab Help',
    description: 'PhD student offering help with organic chemistry and lab techniques.',
    subject: 'Chemistry',
    difficulty: 'advanced',
    tags: ['organic chem', 'lab techniques'],
    availability: 'Flexible',
    preferredFormat: 'both',
    author: 'Dr. Patel',
    keywords: ['chemistry', 'science', 'labs'],
    createdAt: new Date(),
  },
];

// Personalization scoring function
export function scoreItem(item: ExploreItem, profile: UserProfile): number {
  let score = 0;

  // Career goal matching
  if (item.keywords.some(kw => kw.toLowerCase().includes(profile.careerGoal.toLowerCase()))) {
    score += 10;
  }

  // Learner level matching
  if (profile.learnerLevel === 'challenged') {
    if (item.difficulty === 'beginner') score += 5;
    if (item.tags.includes('patient') || item.tags.includes('beginner-friendly')) score += 3;
  } else if (profile.learnerLevel === 'gifted') {
    if (item.difficulty === 'advanced') score += 5;
    if (item.tags.includes('challenge') || item.tags.includes('competition')) score += 3;
  }

  // Bartle type matching
  const bartleKeywords: Record<string, string[]> = {
    achiever: ['progress', 'certification', 'competition', 'achievements', 'ranked', 'challenge'],
    explorer: ['new', 'weird', 'interdisciplinary', 'creative', 'unique'],
    socializer: ['group project', 'tutoring', 'study sessions', 'collaboration', 'community'],
    competitor: ['ranked', 'contest', 'competition', 'challenge', 'leaderboard'],
  };

  const matchingKeywords = bartleKeywords[profile.bartleType] || [];
  matchingKeywords.forEach(kw => {
    if (item.tags.some(tag => tag.toLowerCase().includes(kw)) || 
        item.keywords.some(keyword => keyword.toLowerCase().includes(kw))) {
      score += 2;
    }
  });

  return score;
}

// Sort items by personalization score
export function sortByPersonalization<T extends ExploreItem>(items: T[], profile: UserProfile): T[] {
  return [...items].sort((a, b) => scoreItem(b, profile) - scoreItem(a, profile));
}
