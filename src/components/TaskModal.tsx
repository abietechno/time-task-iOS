import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Pin,
  FolderKanban,
  Sliders,
  Tag,
  Sparkles,
  AlertCircle
} from './icons';
import { Task, Project, TaskStatus, TaskPriority, Subtask } from '../types';
import { getTodayDate } from '../services/storage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit?: Task | null;
  projects: Project[];
  defaultDate?: string;
}

const COLOR_OPTIONS = [
  { id: 'blue', name: 'Biru iOS', class: 'bg-[#007AFF]' },
  { id: 'green', name: 'Hijau Sukses', class: 'bg-[#34C759]' },
  { id: 'purple', name: 'Ungu Kreatif', class: 'bg-[#AF52DE]' },
  { id: 'orange', name: 'Oranye Job', class: 'bg-[#FF9500]' },
  { id: 'red', name: 'Merah Urgent', class: 'bg-[#FF3B30]' },
  { id: 'yellow', name: 'Kuning Catatan', class: 'bg-[#EAB308]' },
  { id: 'default', name: 'Netral', class: 'bg-[#8E8E93]' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  projects,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>(getTodayDate());
  const [dueTime, setDueTime] = useState<string>('17:00');
  const [progress, setProgress] = useState<number>(0);
  const [color, setColor] = useState<string>('blue');
  const [pinned, setPinned] = useState<boolean>(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setProjectId(taskToEdit.project_id || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.due_date || getTodayDate());
      setDueTime(taskToEdit.due_time || '17:00');
      setProgress(taskToEdit.progress || 0);
      setColor(taskToEdit.color || 'blue');
      setPinned(taskToEdit.pinned || false);
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setStatus('todo');
      setPriority('medium');
      setDueDate(defaultDate || getTodayDate());
      setDueTime('17:00');
      setProgress(0);
      setColor('blue');
      setPinned(false);
      setSubtasks([]);
      setTags(['Proyek']);
    }
  }, [taskToEdit, defaultDate, isOpen, projects]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSub: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskText.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updated);
    // Recalculate progress if appropriate
    const doneCount = updated.filter((s) => s.completed).length;
    if (updated.length > 0) {
      const calcProgress = Math.round((doneCount / updated.length) * 100);
      setProgress(calcProgress);
      if (calcProgress === 100) setStatus('done');
      else if (calcProgress > 0 && status === 'todo') setStatus('in_progress');
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedProject = projects.find((p) => p.id === projectId);

    const taskData: Task = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      project_id: projectId || undefined,
      project_name: selectedProject ? selectedProject.name : undefined,
      status,
      priority,
      due_date: dueDate,
      due_time: dueTime,
      progress,
      subtasks,
      tags,
      color,
      pinned,
      created_at: taskToEdit ? taskToEdit.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md transition-all">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-lg max-h-[92vh] flex flex-col backdrop-blur-2xl bg-white/90 dark:bg-[#1C1C1E]/90 rounded-t-[32px] sm:rounded-[36px] shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden"
      >
        {/* iOS Grabber handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#C7C7CC] dark:bg-[#3A3A3C] rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="text-[#007AFF] font-semibold text-sm hover:opacity-75 transition-opacity"
          >
            Batal
          </button>
          <h2 className="text-base font-bold text-[#1C1C1E] dark:text-white font-google">
            {taskToEdit ? 'Edit Tugas & Job' : 'Tugas / Catatan Baru'}
          </h2>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-1.5 bg-[#007AFF] text-white font-bold text-xs rounded-full disabled:opacity-40 hover:bg-[#0062CC] shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            Simpan
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-[#1C1C1E] dark:text-white">
          {/* Title & Description Note (Keep Style) */}
          <div className="space-y-2.5">
            <input
              id="task-modal-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Tugas atau Pekerjaan..."
              className="w-full text-lg font-bold bg-transparent outline-none placeholder-[#8E8E93] text-[#1C1C1E] dark:text-white font-google"
              autoFocus
            />
            <textarea
              id="task-modal-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan detail, deskripsi pekerjaan, instruksi..."
              className="w-full bg-white/60 dark:bg-[#2C2C2E]/60 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 outline-none resize-none text-xs text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] focus:border-[#007AFF]/50 transition-colors"
            />
          </div>

          {/* Project & Color Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5 flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                <span>Kategori / Proyek</span>
              </label>
              <select
                id="task-modal-project-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 text-xs font-semibold rounded-2xl outline-none text-[#1C1C1E] dark:text-white border border-black/5 dark:border-white/5 focus:border-[#007AFF]/50"
              >
                <option value="">Tanpa Proyek (Umum)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Warna Catatan (Frosted Glass)
              </label>
              <div className="flex items-center gap-2 py-1.5 overflow-x-auto">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center transition-transform ${
                      color === c.id ? 'ring-2 ring-offset-2 ring-[#007AFF] scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.name}
                  >
                    {color === c.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
              Status Progres
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl text-xs font-medium text-center">
              {(
                [
                  { id: 'todo', label: 'To Do' },
                  { id: 'in_progress', label: 'Berjalan' },
                  { id: 'review', label: 'Review' },
                  { id: 'done', label: 'Selesai' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setStatus(st.id);
                    if (st.id === 'done') setProgress(100);
                    if (st.id === 'todo' && progress === 100) setProgress(0);
                  }}
                  className={`py-1.5 px-2 rounded-xl transition-all ${
                    status === st.id
                      ? 'bg-white dark:bg-[#3A3A3C] text-[#007AFF] font-bold shadow-sm'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Progress Slider */}
          <div className="p-4 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-[24px]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1C1C1E] dark:text-white mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>Persentase Kemajuan Real-time</span>
              </span>
              <span className="text-sm font-extrabold text-[#007AFF]">{progress}%</span>
            </div>
            <input
              id="task-modal-progress-range"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgress(val);
                if (val === 100) setStatus('done');
                else if (val > 0 && status === 'todo') setStatus('in_progress');
                else if (val === 0 && status === 'done') setStatus('todo');
              }}
              className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
            />
          </div>

          {/* Due Date, Time, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tenggat Waktu</span>
              </label>
              <input
                id="task-modal-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 text-xs font-medium rounded-2xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span>Jam (Opsional)</span>
              </label>
              <input
                id="task-modal-time-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 text-xs font-medium rounded-2xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Prioritas
              </label>
              <select
                id="task-modal-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 text-xs font-semibold rounded-2xl outline-none"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Mendesak ⚠️</option>
              </select>
            </div>
          </div>

          {/* Subtasks (Checklist) */}
          <div className="p-4 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-[24px] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1C1C1E] dark:text-white">
              <span>Subtugas / Butir Checklist</span>
              <span className="text-[11px] text-[#8E8E93] font-bold">
                {subtasks.filter((s) => s.completed).length}/{subtasks.length} Selesai
              </span>
            </div>

            {/* List of subtasks */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 p-2 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-sm rounded-xl text-xs border border-black/5 dark:border-white/5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                      st.completed
                        ? 'bg-[#34C759] border-[#34C759] text-white'
                        : 'border-[#8E8E93]'
                    }`}
                  >
                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`flex-1 truncate font-medium ${
                      st.completed ? 'line-through text-[#8E8E93]' : ''
                    }`}
                  >
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask field */}
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Tambahkan butir subtugas..."
                className="flex-1 px-3.5 py-2 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 text-xs rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#0062CC] transition-all"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Tag & Pin Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {/* Tags */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-[#007AFF] dark:text-blue-300 text-[11px] font-semibold border border-blue-200/50"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 text-xs ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ketik tag lalu tekan enter..."
                  className="px-3 py-1.5 text-xs bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-xl outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 text-xs bg-[#8E8E93]/15 hover:bg-[#8E8E93]/25 rounded-xl font-bold transition-colors"
                >
                  + Tag
                </button>
              </div>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center gap-2 pl-3 border-l border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setPinned(!pinned)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  pinned
                    ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 shadow-sm'
                    : 'bg-black/5 dark:bg-[#2C2C2E] text-[#8E8E93]'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-current' : ''}`} />
                <span>{pinned ? 'Disematkan' : 'Sematkan'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
