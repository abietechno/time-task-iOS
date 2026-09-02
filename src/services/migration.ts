import { doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Task, Project } from '../types';

const MIGRATION_FLAG_KEY = 'ios_timeline_migrated_v1';

export interface MigrationResult {
  taskCount: number;
  projectCount: number;
}

/**
 * On first successful login/register for a given user on this device, pushes
 * a snapshot of the guest's local tasks/projects up to their new account's
 * Firestore subcollections (users/{uid}/tasks, users/{uid}/projects).
 *
 * Callers MUST snapshot the guest data (via getStoredTasks()/getStoredProjects())
 * *before* signing in — the moment sign-in succeeds, App.tsx's realtime Firestore
 * listener starts, sees the (still-empty) remote collections, and overwrites the
 * local storage mirror with that empty result. Reading storage here, after
 * sign-in, would race that listener and can end up migrating nothing.
 *
 * Guarded so it only ever runs once per (user, device) pair.
 */
export async function migrateGuestDataToAccount(
  userId: string,
  tasks: Task[],
  projects: Project[]
): Promise<MigrationResult | null> {
  if (!db) return null;
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === userId) return null;

  const batch = writeBatch(db);
  // Projects first — tasks.project_id references a project's id.
  for (const project of projects) {
    batch.set(doc(db, 'users', userId, 'projects', project.id), project);
  }
  for (const task of tasks) {
    batch.set(doc(db, 'users', userId, 'tasks', task.id), task);
  }
  if (projects.length > 0 || tasks.length > 0) {
    await batch.commit();
  }

  localStorage.setItem(MIGRATION_FLAG_KEY, userId);
  return { taskCount: tasks.length, projectCount: projects.length };
}
