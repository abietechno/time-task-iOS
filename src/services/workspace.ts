import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  query,
  where,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Workspace, Invite } from '../types';

function assertDb() {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  return db;
}

/** Every workspace the given uid is a member of, live. */
export function listenMyWorkspaces(
  uid: string,
  callback: (workspaces: Workspace[]) => void
): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'workspaces'), where('member_uids', 'array-contains', uid));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => d.data() as Workspace));
  });
}

/** Pending invites addressed to the given email, live. */
export function listenMyInvites(
  email: string | null | undefined,
  callback: (invites: Invite[]) => void
): Unsubscribe {
  if (!db || !email) return () => {};
  const q = query(collection(db, 'invites'), where('email', '==', email.toLowerCase()));
  return onSnapshot(q, (snapshot) => {
    const all = snapshot.docs.map((d) => d.data() as Invite);
    callback(all.filter((inv) => inv.status === 'pending'));
  });
}

/** Outstanding (pending) invites sent out for one workspace, live — for the
 * team management screen so members can see/cancel who's been invited. */
export function listenWorkspaceInvites(
  workspaceId: string,
  callback: (invites: Invite[]) => void
): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, 'invites'), where('workspace_id', '==', workspaceId));
  return onSnapshot(q, (snapshot) => {
    const all = snapshot.docs.map((d) => d.data() as Invite);
    callback(all.filter((inv) => inv.status === 'pending'));
  });
}

export async function createWorkspace(uid: string, email: string, name: string): Promise<Workspace> {
  const database = assertDb();
  const id = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const workspace: Workspace = {
    id,
    name: name.trim(),
    owner_uid: uid,
    member_uids: [uid],
    member_emails: [email.toLowerCase()],
    created_at: new Date().toISOString(),
  };
  await setDoc(doc(database, 'workspaces', id), workspace);
  return workspace;
}

export async function inviteMember(
  workspace: Workspace,
  inviterUid: string,
  inviterName: string,
  inviteeEmail: string
): Promise<void> {
  const database = assertDb();
  const email = inviteeEmail.trim().toLowerCase();
  const inviteId = `${workspace.id}__${email}`;
  const invite: Invite = {
    id: inviteId,
    workspace_id: workspace.id,
    workspace_name: workspace.name,
    email,
    invited_by_uid: inviterUid,
    invited_by_name: inviterName,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  await setDoc(doc(database, 'invites', inviteId), invite);
}

export async function cancelInvite(inviteId: string): Promise<void> {
  const database = assertDb();
  await deleteDoc(doc(database, 'invites', inviteId));
}

/** Order matters: the workspace-membership security rule only allows this
 * update while the matching invite doc is still 'pending', so the workspace
 * must be updated BEFORE the invite is flipped to 'accepted'. */
export async function acceptInvite(invite: Invite, uid: string, email: string): Promise<void> {
  const database = assertDb();
  await updateDoc(doc(database, 'workspaces', invite.workspace_id), {
    member_uids: arrayUnion(uid),
    member_emails: arrayUnion(email.toLowerCase()),
  });
  await updateDoc(doc(database, 'invites', invite.id), { status: 'accepted' });
}

export async function declineInvite(invite: Invite): Promise<void> {
  const database = assertDb();
  await updateDoc(doc(database, 'invites', invite.id), { status: 'declined' });
}

export async function leaveWorkspace(workspaceId: string, uid: string, email: string): Promise<void> {
  const database = assertDb();
  await updateDoc(doc(database, 'workspaces', workspaceId), {
    member_uids: arrayRemove(uid),
    member_emails: arrayRemove(email.toLowerCase()),
  });
}

/** Owner-only: deletes a workspace along with its tasks/projects subcollections. */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const database = assertDb();
  const [taskDocs, projectDocs] = await Promise.all([
    getDocs(collection(database, 'workspaces', workspaceId, 'tasks')),
    getDocs(collection(database, 'workspaces', workspaceId, 'projects')),
  ]);
  const batch = writeBatch(database);
  taskDocs.forEach((d) => batch.delete(d.ref));
  projectDocs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(database, 'workspaces', workspaceId));
  await batch.commit();
}
