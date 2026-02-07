export interface Course {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  responsible?: string;
  imageUrl?: string;
  viewsCount: number;
  lessonsCount: number;
  totalDuration: number; // in minutes
  isPublished: boolean;
  shareLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Content {
  _id: string;
  courseId: string;
  title: string;
  category: 'Video' | 'Document' | 'Quiz' | 'Article' | 'Other';
  duration: number;
  order: number;
  url?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}
