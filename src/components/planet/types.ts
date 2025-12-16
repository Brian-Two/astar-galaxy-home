import { LucideIcon, HelpCircle, Layers, BookOpen, ClipboardList, Search, Target } from 'lucide-react';

export type AgentTemplate = 
  | 'quiz-me'
  | 'flashcard-coach'
  | 'explainer-tutor'
  | 'project-planner'
  | 'research-buddy'
  | 'goal-setter';

export interface AgentTemplateInfo {
  id: AgentTemplate;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const agentTemplates: AgentTemplateInfo[] = [
  { id: 'quiz-me', name: 'Quiz Me', description: 'Test your knowledge with adaptive questions', icon: HelpCircle },
  { id: 'flashcard-coach', name: 'Flashcard Coach', description: 'Spaced repetition and active recall practice', icon: Layers },
  { id: 'explainer-tutor', name: 'Explainer / Tutor', description: 'Clear explanations and guided learning', icon: BookOpen },
  { id: 'project-planner', name: 'Project Planner', description: 'Break down projects into manageable tasks', icon: ClipboardList },
  { id: 'research-buddy', name: 'Research Buddy', description: 'Help gather and synthesize information', icon: Search },
  { id: 'goal-setter', name: 'Goal Setter', description: 'Set and track learning milestones', icon: Target },
];

export type ScaffoldingLevel = 'light' | 'medium' | 'heavy';

export interface AgentGuardrails {
  dontGiveFullAnswers: boolean;
  askWhatKnown: boolean;
  stayWithinSources: boolean;
  keepConcise: boolean;
  customAvoid: string;
}

export interface LearningObjective {
  id: string;
  text: string;
  showToOthers: boolean;
}

export interface Agent {
  id: string;
  name: string;
  template: AgentTemplate;
  description: string;
  learningObjectives: LearningObjective[];
  selectedSourceIds: string[];
  useAllSources: boolean;
  guardrails: AgentGuardrails;
  scaffoldingLevel: ScaffoldingLevel;
  timesUsed: number;
  uniqueUsers: number;
  createdAt: Date;
  planetId: string;
}

export interface PlanetSource {
  id: string;
  title: string;
  type: 'Text' | 'Link' | 'File' | 'Note';
}

// Mock sources for planets
export const mockPlanetSources: PlanetSource[] = [
  { id: 'src-1', title: 'Chapter 3 Notes', type: 'Note' },
  { id: 'src-2', title: 'Lecture Slides Week 5', type: 'File' },
  { id: 'src-3', title: 'Practice Problems Set', type: 'File' },
  { id: 'src-4', title: 'Khan Academy Link', type: 'Link' },
  { id: 'src-5', title: 'Textbook Excerpt', type: 'Text' },
];

// Mock agents for testing pagination
export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Physics Quiz Master',
    template: 'quiz-me',
    description: 'Test your physics knowledge',
    learningObjectives: [
      { id: 'obj-1', text: 'Master Newton\'s laws', showToOthers: true },
      { id: 'obj-2', text: 'Understand momentum conservation', showToOthers: true },
    ],
    selectedSourceIds: ['src-1', 'src-2'],
    useAllSources: false,
    guardrails: {
      dontGiveFullAnswers: true,
      askWhatKnown: true,
      stayWithinSources: true,
      keepConcise: false,
      customAvoid: '',
    },
    scaffoldingLevel: 'medium',
    timesUsed: 12,
    uniqueUsers: 5,
    createdAt: new Date(),
    planetId: 'physics',
  },
];
