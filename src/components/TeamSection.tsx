import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Check, X, Trash2, LogOut, Crown, Mail } from 'lucide-react';
import { Workspace, Invite } from '../types';
import {
  createWorkspace,
  inviteMember,
  cancelInvite,
  acceptInvite,
  declineInvite,
  leaveWorkspace,
  deleteWorkspace,
  listenWorkspaceInvites,
} from '../services/workspace';

interface TeamSectionProps {
  currentUserUid: string;
  currentUserEmail: string;
  currentUserName: string;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSwitchWorkspace: (id: string | null) => void;
  incomingInvites: Invite[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  currentUserUid,
  currentUserEmail,
  currentUserName,
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  incomingInvites,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [outgoingInvites, setOutgoingInvites] = useState<Invite[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;
  const isOwner = activeWorkspace?.owner_uid === currentUserUid;

  useEffect(() => {
    if (!activeWorkspaceId) {
      setOutgoingInvites([]);
      return;
    }
    return listenWorkspaceInvites(activeWorkspaceId, setOutgoingInvites);
  }, [activeWorkspaceId]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setBusy(true);
    setError('');
    try {
      const workspace = await createWorkspace(currentUserUid, currentUserEmail, newTeamName);
      onSwitchWorkspace(workspace.id);
      setNewTeamName('');
      setIsCreating(false);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat tim.');
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = async () => {
    if (!activeWorkspace || !inviteEmail.trim()) return;
    setBusy(true);
    setError('');
    try {
      await inviteMember(activeWorkspace, currentUserUid, currentUserName, inviteEmail);
      setInviteEmail('');
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim undangan.');
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (invite: Invite) => {
    setBusy(true);
    setError('');
    try {
      await acceptInvite(invite, currentUserUid, currentUserEmail);
      onSwitchWorkspace(invite.workspace_id);
    } catch (err: any) {
      setError(err?.message || 'Gagal menerima undangan.');
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async (invite: Invite) => {
    setBusy(true);
    setError('');
    try {
      await declineInvite(invite);
    } catch (err: any) {
      setError(err?.message || 'Gagal menolak undangan.');
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!activeWorkspace) return;
    if (!confirm(`Keluar dari tim "${activeWorkspace.name}"?`)) return;
    setBusy(true);
    try {
      await leaveWorkspace(activeWorkspace.id, currentUserUid, currentUserEmail);
      onSwitchWorkspace(null);
    } catch (err: any) {
      setError(err?.message || 'Gagal keluar dari tim.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!activeWorkspace) return;
    if (!confirm(`Hapus tim "${activeWorkspace.name}" beserta semua tugas & proyeknya? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      await deleteWorkspace(activeWorkspace.id);
      onSwitchWorkspace(null);
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus tim.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Incoming invites — shown regardless of which workspace is active */}
      {incomingInvites.length > 0 && (
        <div className="cupertino-grouped-list p-4 space-y-2.5">
          <h4 className="font-bold text-[#1C1C1E] dark:text-white font-google text-xs uppercase tracking-wider text-[#8E8E93] mb-1">
            Undangan Masuk
          </h4>
          {incomingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1C1C1E] dark:text-white truncate">{invite.workspace_name}</p>
                <p className="text-[11px] text-[#8E8E93] truncate">Diundang oleh {invite.invited_by_name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleAccept(invite)}
                  disabled={busy}
                  className="w-8 h-8 rounded-full bg-[#34C759] text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-40"
                  title="Terima"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <button
                  onClick={() => handleDecline(invite)}
                  disabled={busy}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#8E8E93] flex items-center justify-center active:scale-90 transition-all disabled:opacity-40"
                  title="Tolak"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workspace switcher + team management */}
      <div className="cupertino-grouped-list p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center border border-[#007AFF]/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white font-google">Tim & Kolaborasi</h3>
            <p className="text-[11px] text-[#8E8E93]">Kerja bareng, akses tugas & proyek bersama</p>
          </div>
        </div>

        {/* Switcher chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            onClick={() => onSwitchWorkspace(null)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              !activeWorkspaceId
                ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E]'
                : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
            }`}
          >
            Pribadi
          </button>
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => onSwitchWorkspace(w.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceId === w.id
                  ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E]'
                  : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>

        {/* Active workspace detail */}
        {activeWorkspace && (
          <div className="space-y-3 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide">
                Anggota ({activeWorkspace.member_emails.length})
              </span>
              {isOwner && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Crown className="w-3 h-3" />
                  <span>Pemilik</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activeWorkspace.member_emails.map((email) => (
                <span
                  key={email}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#1C1C1E] dark:text-white truncate max-w-[180px]"
                >
                  {email}
                </span>
              ))}
            </div>

            {/* Invite by email */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8E8E93]" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInvite();
                    }
                  }}
                  placeholder="Email rekan tim..."
                  className="w-full pl-8 pr-3 py-2 bg-black/5 dark:bg-white/5 text-xs rounded-xl outline-none text-[#1C1C1E] dark:text-white placeholder-[#8E8E93]"
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={busy || !inviteEmail.trim()}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#007AFF] text-white rounded-xl disabled:opacity-40 active:scale-90 transition-all"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Outgoing pending invites */}
            {outgoingInvites.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide">Menunggu Konfirmasi</span>
                {outgoingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5"
                  >
                    <span className="text-[11px] font-medium text-[#8E8E93] truncate">{invite.email}</span>
                    <button
                      onClick={() => cancelInvite(invite.id)}
                      className="p-1 text-[#C7C7CC] hover:text-rose-500 transition-colors flex-shrink-0"
                      title="Batalkan undangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Leave / delete */}
            <button
              onClick={isOwner ? handleDeleteTeam : handleLeave}
              disabled={busy}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {isOwner ? <Trash2 className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
              <span>{isOwner ? 'Hapus Tim' : 'Keluar dari Tim'}</span>
            </button>
          </div>
        )}

        {/* Create new team */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1C1E] dark:text-white rounded-full text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Buat Tim Baru</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateTeam();
                }
              }}
              placeholder="Nama tim..."
              autoFocus
              className="flex-1 px-3.5 py-2 bg-black/5 dark:bg-white/5 text-xs rounded-xl outline-none text-[#1C1C1E] dark:text-white placeholder-[#8E8E93]"
            />
            <button
              onClick={handleCreateTeam}
              disabled={busy || !newTeamName.trim()}
              className="px-4 py-2 bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] rounded-xl text-xs font-bold disabled:opacity-40 transition-all"
            >
              Buat
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewTeamName('');
              }}
              className="p-2 text-[#8E8E93]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
      </div>
    </div>
  );
};
