export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project_id?: string;
  project_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:mm
  start_date?: string; // YYYY-MM-DD
  progress: number; // 0 - 100
  subtasks: Subtask[];
  tags: string[];
  color: string; // iOS theme color tag (e.g., 'blue', 'purple', 'green', 'orange', 'red', 'yellow')
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  start_date: string;
  deadline: string;
  status: 'active' | 'completed' | 'on_hold';
  budget?: string;
  client?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  provider: 'email' | 'google' | 'guest';
  created_at: string;
}

export type ActiveTab = 'today' | 'timeline' | 'calendar' | 'projects' | 'settings';
export type CalendarViewType = 'month' | 'timeline' | 'week';
