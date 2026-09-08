import { Task, Project, User } from '../types';

const STORAGE_KEYS = {
  TASKS: 'ios_timeline_tasks_v1',
  PROJECTS: 'ios_timeline_projects_v1',
  USER: 'ios_timeline_user_v1',
};

const MIGRATION_FLAG_KEY = 'ios_timeline_migrated_v1';

// Helper: Format today as YYYY-MM-DD
export const getTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_USER: User = {
  id: 'usr-guest',
  email: 'tamu@timeline.app',
  full_name: 'Pengguna Tamu',
  avatar_url: '',
  provider: 'guest',
  created_at: new Date().toISOString(),
};

// Storage Utilities
export const getStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse stored tasks', e);
    return [];
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse stored projects', e);
    return [];
  }
};

export const saveStoredProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getStoredUser = (): User => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USER;
  }
};

export const saveStoredUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

/** Wipes the local tasks/projects/user mirror — used on sign-out so a shared
 * device doesn't keep showing the previous account's data. */
export const clearLocalMirror = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const clearGuestMigrationFlag = (): void => {
  localStorage.removeItem(MIGRATION_FLAG_KEY);
};
