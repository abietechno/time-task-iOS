import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Pin,
  FolderKanban,
} from 'lucide-react';
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
  { id: 'blue', class: 'bg-[#007AFF]' },
  { id: 'green', class: 'bg-[#34C759]' },
  { id: 'purple', class: 'bg-[#AF52DE]' },
  { id: 'orange', class: 'bg-[#FF9500]' },
  { id: 'red', class: 'bg-[#FF3B30]' },
  { id: 'yellow', class: 'bg-[#EAB308]' },
];

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'Berjalan' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Selesai' },
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
    }
  }, [taskToEdit, defaultDate, isOpen, projects]);

  if (!isOpen) return null;

  const handleStatusChange = (id: TaskStatus) => {
    setStatus(id);
    if (id === 'done') setProgress(100);
    else if (id === 'todo') setProgress(0);
    else if (progress === 0 || progress === 100) setProgress(50);
  };

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
    const doneCount = updated.filter((s) => s.completed).length;
    if (updated.length > 0) {
      const calcProgress = Math.round((doneCount / updated.length) * 100);
      setProgress(calcProgress);
      if (calcProgress === 100) setStatus('done');
      else if (calcProgress > 0 && status === 'todo') setStatus('in_progress');
    }
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
      tags: taskToEdit?.tags || [],
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
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden"
      >
        {/* iOS Grabber handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#C7C7CC] dark:bg-[#3A3A3C] rounded-full" />
        </div>

        {/* Header Bar — minimal: close, title, pin */}
        <div className="flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 text-[#1C1C1E] dark:text-white flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white font-google">
            {taskToEdit ? 'Edit Tugas' : 'Tugas Baru'}
          </h2>
          <button
            type="button"
            onClick={() => setPinned(!pinned)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              pinned ? 'bg-amber-100 dark:bg-amber-500/20 text-[#FF9500]' : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
            }`}
            title={pinned ? 'Lepas Sematan' : 'Sematkan'}
          >
            <Pin className="w-4 h-4" fill={pinned ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5 text-sm text-[#1C1C1E] dark:text-white">
          {/* Title & Description */}
          <div className="space-y-2">
            <input
              id="task-modal-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Tugas..."
              className="w-full text-xl font-extrabold bg-transparent outline-none placeholder-[#C7C7CC] text-[#1C1C1E] dark:text-white font-google tracking-tight"
              autoFocus
            />
            <textarea
              id="task-modal-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan deskripsi (opsional)..."
              className="w-full bg-transparent outline-none resize-none text-[14px] text-[#8E8E93] placeholder-[#C7C7CC]"
            />
          </div>

          {/* Meta Row: Tanggal / Waktu / Prioritas — simple bordered boxes */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl border border-black/10 dark:border-white/10">
              <label className="flex items-center gap-1 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1">
                <Calendar className="w-3 h-3" />
                <span>Tanggal</span>
              </label>
              <input
                id="task-modal-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-transparent text-[12px] font-semibold outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl border border-black/10 dark:border-white/10">
              <label className="flex items-center gap-1 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1">
                <Clock className="w-3 h-3" />
                <span>Waktu</span>
              </label>
              <input
                id="task-modal-time-input"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-transparent text-[12px] font-semibold outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl border border-black/10 dark:border-white/10">
              <label className="block text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide mb-1">
                Prioritas
              </label>
              <select
                id="task-modal-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-transparent text-[12px] font-semibold outline-none"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="urgent">Mendesak</option>
              </select>
            </div>
          </div>

          {/* Project chips + color dot picker */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setProjectId('')}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !projectId
                    ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E]'
                    : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Umum</span>
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProjectId(p.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    projectId === p.id
                      ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E]'
                      : 'bg-black/5 dark:bg-white/10 text-[#8E8E93]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-6 h-6 rounded-full ${c.class} transition-transform ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-[#007AFF] dark:ring-offset-[#1C1C1E] scale-110' : 'opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Status Segmented Control */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl text-xs font-medium text-center">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStatusChange(st.id)}
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

          {/* Subtasks — plain list, no boxed background */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#8E8E93] uppercase tracking-wide">
              <span>Subtugas</span>
              {subtasks.length > 0 && (
                <span>{subtasks.filter((s) => s.completed).length}/{subtasks.length}</span>
              )}
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2.5 py-2 border-b border-black/5 dark:border-white/5 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                      st.completed
                        ? 'bg-[#FF9500] border-[#FF9500] text-white'
                        : 'border-[#C7C7CC]'
                    }`}
                  >
                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`flex-1 truncate ${
                      st.completed ? 'line-through text-[#8E8E93]' : ''
                    }`}
                  >
                    {st.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-[#C7C7CC] hover:text-rose-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
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
                placeholder="+ Tambah subtugas..."
                className="flex-1 px-3.5 py-2 bg-black/5 dark:bg-white/5 text-xs rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-xl text-[#1C1C1E] dark:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: full-width action button */}
        <div className="px-6 pt-2 pb-6 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-3.5 bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] font-bold text-sm rounded-full disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {taskToEdit ? 'Simpan Perubahan' : 'Simpan Tugas'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
