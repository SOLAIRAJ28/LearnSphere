export interface Course {
  id: string;
  title: string;
  tags: string[];
  views: number;
  contents: number;
  duration: string; // Format: HH:MM
  published: boolean;
}

export interface Answer {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id?: string;
  questionText: string;
  options: Answer[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rewards {
  correctPoints: number;
  wrongPoints: number;
  completionPoints: number;
}

export interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  questions: Question[];
  rewards: Rewards;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewMode = 'kanban' | 'list';
