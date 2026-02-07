export interface Course {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  responsible: string;
  imageUrl: string;
  viewsCount: number;
  lessonsCount: number;
  totalDuration: number;
  isPublished: boolean;
  shareLink: string;
  visibility?: string;
  accessRules?: string[];
  price?: number;
  responsibleUserId?: string;
  adminUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  _id: string;
  courseId: string;
  title: string;
  category: 'video' | 'document' | 'image' | 'article' | 'quiz' | 'presentation' | 'infographic';
  videoLink?: string;
  videoFileId?: string; // GridFS file ID for uploaded videos
  fileUrl?: string;
  imageUrl?: string;
  duration: number;
  allowDownload?: boolean;
  description?: string;
  responsible?: string;
  attachmentUrl?: string;
  attachmentLink?: string;
  order: number;
  url: string;
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

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  token?: string;
}

export type ViewMode = 'kanban' | 'list';
