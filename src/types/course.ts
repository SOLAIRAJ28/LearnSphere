export interface Course {
  id: string;
  title: string;
  tags: string[];
  views: number;
  contents: number;
  duration: string; // Format: HH:MM
  published: boolean;
}

export type ViewMode = 'kanban' | 'list';
