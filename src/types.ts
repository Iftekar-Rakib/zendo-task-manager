export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  tags: string[];
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  subtasks: SubTask[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
  pinned: boolean;
  color?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  tags: string[];
  category: string;
}

export type View = 'dashboard' | 'calendar' | 'notes' | 'settings' | 'focus';
