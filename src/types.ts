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
  created_by?: string; // uid of creator, set for tasks created inside a shared workspace
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
  created_by?: string; // uid of creator, set for projects created inside a shared workspace
}

/** A shared team: tasks/projects created while a workspace is active live
 * under workspaces/{id}/tasks and workspaces/{id}/projects instead of the
 * signed-in user's own users/{uid} subtree. */
export interface Workspace {
  id: string;
  name: string;
  owner_uid: string;
  member_uids: string[];
  member_emails: string[]; // lowercased, mirrors member_uids for display + invite dedup
  created_at: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'declined';

/** Doc id is deterministic: `${workspace_id}__${email}` (lowercased) so
 * Firestore security rules can look one up directly by path instead of
 * running a query. */
export interface Invite {
  id: string;
  workspace_id: string;
  workspace_name: string;
  email: string; // lowercased invitee email
  invited_by_uid: string;
  invited_by_name: string;
  status: InviteStatus;
  created_at: string;
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
