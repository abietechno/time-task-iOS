import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FolderKanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import { Project, Task } from '../types';
import { getTodayDate } from '../services/storage';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProjectFilter: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProjectFilter,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [deadline, setDeadline] = useState(getTodayDate());
  const [color, setColor] = useState('#007AFF');

  const handleOpenCreate = () => {
    setProjectToEdit(null);
    setName('');
    setDescription('');
    setClient('');
    setStartDate(getTodayDate());
    setDeadline(getTodayDate());
    setColor('#007AFF');
    setShowModal(true);
  };

  const handleOpenEdit = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(proj);
    setName(proj.name);
    setDescription(proj.description);
    setClient(proj.client || '');
    setStartDate(proj.start_date);
    setDeadline(proj.deadline);
    setColor(proj.color);
    setShowModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (projectToEdit) {
      onUpdateProject({
        ...projectToEdit,
        name: name.trim(),
        description: description.trim(),
        client: client.trim() || undefined,
        start_date: startDate,
        deadline,
        color,
      });
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        client: client.trim() || undefined,
        start_date: startDate,
        deadline,
        color,
        icon: 'folder',
        status: 'active',
      };
      onAddProject(newProj);
    }

    setShowModal(false);
  };

  const PROJECT_COLORS = ['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55'];

  return (
    <div className="space-y-4 pb-24">
      {/* Header with Project Count & Add button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-[#1C1C1E] dark:text-white font-google">
            Daftar Proyek & Jobs
          </h2>
          <p className="text-xs text-[#8E8E93]">
            {projects.length} proyek aktif dengan timeline terintegrasi
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Proyek Baru</span>
        </button>
      </div>

      {/* Projects Grid / List */}
      <div className="grid grid-cols-1 gap-3.5">
        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.project_id === proj.id);
          const totalTasks = projTasks.length;
          const completedTasks = projTasks.filter((t) => t.status === 'done').length;
          const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <motion.div
              key={proj.id}
              layout
              className="backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70 rounded-[28px] p-5 border border-white/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: proj.color }}
                  >
                    <FolderKanban className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white font-google">
                      {proj.name}
                    </h3>
                    {proj.client && (
                      <span className="inline-block text-[11px] text-[#007AFF] font-semibold">
                        Klien: {proj.client}
                      </span>
                    )}
                    {proj.description && (
                      <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(proj, e)}
                    className="p-2 text-[#8E8E93] hover:text-[#007AFF] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Edit Proyek"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus proyek "${proj.name}"?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    className="p-2 text-[#8E8E93] hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#8E8E93]">
                    Progres ({completedTasks}/{totalTasks} Tugas)
                  </span>
                  <span className="text-[#007AFF] font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: proj.color || '#007AFF',
                    }}
                  />
                </div>
              </div>

              {/* Timeline duration & Quick Filter action */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#8E8E93]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {proj.start_date} s/d {proj.deadline}
                  </span>
                </div>

                <button
                  onClick={() => onSelectProjectFilter(proj.id)}
                  className="flex items-center gap-1 text-[#007AFF] font-bold hover:underline"
                >
                  <span>Lihat Tugas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md backdrop-blur-2xl bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[32px] p-6 shadow-2xl border border-white/60 dark:border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
              <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white font-google">
                {projectToEdit ? 'Edit Proyek' : 'Buat Proyek Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#8E8E93] mb-1.5">Nama Proyek</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Redesign Aplikasi iOS..."
                  className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none text-sm text-[#1C1C1E] dark:text-white focus:border-[#007AFF]/50 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8E8E93] mb-1.5">Klien / Departemen</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Contoh: Acme Corp..."
                  className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none text-[#1C1C1E] dark:text-white focus:border-[#007AFF]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#8E8E93] mb-1.5">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan sasaran atau scope timeline pekerjaan..."
                  className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none text-[#1C1C1E] dark:text-white resize-none focus:border-[#007AFF]/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#8E8E93] mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#8E8E93] mb-1.5">Deadline Selesai</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#8E8E93] mb-1.5">Warna Aksen Proyek</label>
                <div className="flex items-center gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-[#007AFF] scale-110 shadow-md' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-black/5 dark:bg-[#2C2C2E] text-[#8E8E93] rounded-full font-semibold hover:text-[#1C1C1E] dark:hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-5 py-2.5 bg-[#007AFF] text-white rounded-full font-bold shadow-md shadow-blue-500/25 disabled:opacity-40 active:scale-95 transition-all"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
