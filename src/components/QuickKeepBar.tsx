import React, { useState } from 'react';
import { Plus, Pin, Calendar, CheckSquare, Sparkles } from './icons';
import { Task, Project } from '../types';
import { getTodayDate } from '../services/storage';

interface QuickKeepBarProps {
  onQuickCreate: (task: Partial<Task>) => void;
  onOpenFullModal: () => void;
  projects: Project[];
}

export const QuickKeepBar: React.FC<QuickKeepBarProps> = ({
  onQuickCreate,
  onOpenFullModal,
  projects,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const project = projects.find((p) => p.id === selectedProjectId);

    onQuickCreate({
      title: title.trim(),
      description: description.trim(),
      project_id: selectedProjectId || undefined,
      project_name: project?.name,
      status: 'todo',
      priority: 'medium',
      due_date: getTodayDate(),
      progress: 0,
      subtasks: [],
      tags: ['Tugas'],
      color: 'blue',
      pinned: false,
    });

    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70 rounded-[24px] p-3.5 border border-white/60 dark:border-white/10 shadow-sm transition-all duration-200">
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer px-2 py-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-md border-2 border-[#C7C7CC] dark:border-[#3A3A3C] flex items-center justify-center" />
            <span className="text-sm font-medium text-[#8E8E93]">
              Catat tugas atau job baru dengan cepat...
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#007AFF] bg-blue-50 dark:bg-blue-950/30 p-1.5 rounded-full">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul tugas / catatan pekerjaan..."
            className="w-full text-sm font-semibold bg-transparent outline-none text-[#1C1C1E] dark:text-white placeholder-[#8E8E93]"
            autoFocus
          />

          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan tambahan (opsional)..."
            className="w-full text-xs bg-white/50 dark:bg-[#2C2C2E]/60 backdrop-blur-md p-2.5 rounded-xl border border-black/5 dark:border-white/5 outline-none text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] resize-none"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs bg-white/60 dark:bg-[#2C2C2E]/60 backdrop-blur-md border border-black/5 dark:border-white/5 px-3 py-1.5 rounded-xl outline-none font-medium text-[#1C1C1E] dark:text-white"
              >
                <option value="">Umum</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onOpenFullModal}
                className="text-xs text-[#007AFF] hover:underline font-semibold"
              >
                Opsi Lengkap...
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1.5 text-xs text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 bg-[#007AFF] text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all active:scale-95"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
