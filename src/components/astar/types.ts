export interface Space {
  id: string;
  name: string;
  active: boolean;
  intention: 'study' | 'homework' | 'project';
}

export interface Source {
  id: string;
  title: string;
  type: 'Text' | 'Link' | 'File';
  snippet: string;
}

export interface Member {
  name: string;
  role: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionStats {
  totalPoints: number;
  sessionXP: number;
  maxSessionXP: number;
}
