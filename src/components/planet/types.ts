import { LucideIcon, HelpCircle, Layers, BookOpen, ClipboardList, Search, Target, MessageCircleQuestion, Lightbulb, CalendarCheck, PenTool, Sparkles, ArrowRight, CheckCircle, Ticket } from 'lucide-react';

export type AgentTemplate = 
  | 'socratic-tutor'
  | 'explainer'
  | 'flashcard-coach'
  | 'quiz-master'
  | 'research-buddy'
  | 'project-planner'
  | 'study-plan-builder'
  | 'practice-coach'
  | 'writing-coach'
  | 'feedback-coach'
  | 'next-steps-coach'
  | 'understanding-check'
  | 'exit-ticket';

export type AgentCategory = 'learn' | 'build' | 'write' | 'assess';

export interface AgentTemplateInfo {
  id: AgentTemplate;
  name: string;
  description: string;
  icon: LucideIcon;
  category: AgentCategory;
}

export const agentTemplatesByCategory: Record<AgentCategory, AgentTemplateInfo[]> = {
  learn: [
    { id: 'socratic-tutor', name: 'Socratic Tutor', description: 'Guide learning through questions', icon: MessageCircleQuestion, category: 'learn' },
    { id: 'explainer', name: 'Explainer', description: 'Clear explanations and breakdowns', icon: BookOpen, category: 'learn' },
    { id: 'flashcard-coach', name: 'Flashcard Coach', description: 'Spaced repetition practice', icon: Layers, category: 'learn' },
    { id: 'quiz-master', name: 'Quiz Master', description: 'Test knowledge with questions', icon: HelpCircle, category: 'learn' },
    { id: 'research-buddy', name: 'Research Buddy', description: 'Help gather and synthesize info', icon: Search, category: 'learn' },
  ],
  build: [
    { id: 'project-planner', name: 'Project Planner', description: 'Break down projects into tasks', icon: ClipboardList, category: 'build' },
    { id: 'study-plan-builder', name: 'Study Plan Builder', description: 'Create structured study plans', icon: CalendarCheck, category: 'build' },
    { id: 'practice-coach', name: 'Practice Coach', description: 'Drills and repetition practice', icon: Target, category: 'build' },
  ],
  write: [
    { id: 'writing-coach', name: 'Writing Coach', description: 'Thesis → outline → draft flow', icon: PenTool, category: 'write' },
    { id: 'feedback-coach', name: 'Feedback (Glows & Grows)', description: 'Constructive feedback on work', icon: Sparkles, category: 'write' },
    { id: 'next-steps-coach', name: 'Next Steps Coach', description: 'What to do next guidance', icon: ArrowRight, category: 'write' },
  ],
  assess: [
    { id: 'understanding-check', name: 'Understanding Check', description: 'Quick comprehension questions', icon: CheckCircle, category: 'assess' },
    { id: 'exit-ticket', name: 'Exit Ticket', description: 'End-of-session knowledge check', icon: Ticket, category: 'assess' },
  ],
};

// Flat list for backward compatibility
export const agentTemplates: AgentTemplateInfo[] = [
  ...agentTemplatesByCategory.learn,
  ...agentTemplatesByCategory.build,
  ...agentTemplatesByCategory.write,
  ...agentTemplatesByCategory.assess,
];

export const categoryLabels: Record<AgentCategory, string> = {
  learn: 'Learn',
  build: 'Build',
  write: 'Write',
  assess: 'Assess',
};

export type ScaffoldingLevel = 'light' | 'medium' | 'heavy';

export interface ScaffoldingBehavior {
  level: ScaffoldingLevel;
  behaviors: string[];
}

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
  scaffoldingBehaviors: string[];
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

// Idea cards for quick agent creation
export interface IdeaCard {
  id: string;
  title: string;
  template: AgentTemplate;
  description: string;
}

export const ideaCards: IdeaCard[] = [
  { id: 'idea-1', title: 'Socratic Tutor for any topic', template: 'socratic-tutor', description: 'Help me learn by asking questions instead of giving answers. Guide me to discover concepts myself.' },
  { id: 'idea-2', title: 'Exam Cram Quiz', template: 'quiz-master', description: 'Generate practice questions based on my notes and materials. Focus on key concepts likely to be on the exam.' },
  { id: 'idea-3', title: 'Flashcards from my notes', template: 'flashcard-coach', description: 'Create flashcards from my uploaded notes. Use spaced repetition to help me memorize key terms and concepts.' },
  { id: 'idea-4', title: 'Project Breakdown Agent', template: 'project-planner', description: 'Break down my project into manageable steps. Help me estimate time and identify dependencies.' },
  { id: 'idea-5', title: 'Writing Coach (outline → draft)', template: 'writing-coach', description: 'Guide me from thesis to outline to full draft. Ask clarifying questions and suggest improvements at each stage.' },
  { id: 'idea-6', title: 'Understanding Check (quick questions)', template: 'understanding-check', description: 'Ask me quick questions to check if I really understand the material. Identify gaps in my knowledge.' },
];

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
    template: 'quiz-master',
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
    scaffoldingBehaviors: ['Ask clarifying questions', 'Provide hints before answers', 'Break down complex problems'],
    timesUsed: 12,
    uniqueUsers: 5,
    createdAt: new Date(),
    planetId: 'physics',
  },
];

// Generated setup from AI
export interface GeneratedAgentSetup {
  learning_objectives: string[];
  guardrails: {
    dont_give_full_answers_immediately: boolean;
    ask_what_i_know_first: boolean;
    stay_within_selected_sources: boolean;
    keep_responses_concise: boolean;
    avoid_or_never_do: string[];
  };
  scaffolding: {
    level: ScaffoldingLevel;
    behaviors: string[];
  };
}
