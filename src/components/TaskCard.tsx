import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  Pin,
  MoreVertical,
  FolderKanban,
  Trash2,
  Edit3,
  AlertCircle,
} from './icons';
import { Task, TaskStatus, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; accent: string; badge: string }> = {
  blue: {
    bg: 'bg-white/80 dark:bg-[#152033]/80 backdrop-blur-xl',
    border: 'border-blue-200/60 dark:border-blue-900/40',
    accent: '#007AFF',
    badge: 'bg-blue-100/80 text-[#007AFF] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50',
  },
  green: {
    bg: 'bg-white/80 dark:bg-[#112419]/80 backdrop-blur-xl',
    border: 'border-emerald-200/60 dark:border-emerald-900/40',
    accent: '#34C759',
    badge: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50',
  },
  purple: {
    bg: 'bg-white/80 dark:bg-[#251533]/80 backdrop-blur-xl',
    border: 'border-purple-200/60 dark:border-purple-900/40',
    accent: '#AF52DE',
    badge: 'bg-purple-100/80 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/50',
  },
  orange: {
    bg: 'bg-white/80 dark:bg-[#2B1B10]/80 backdrop-blur-xl',
    border: 'border-orange-200/60 dark:border-orange-900/40',
    accent: '#FF9500',
    badge: 'bg-orange-100/80 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200/50',
  },
  red: {
    bg: 'bg-white/80 dark:bg-[#2C1418]/80 backdrop-blur-xl',
    border: 'border-red-200/60 dark:border-red-900/40',
    accent: '#FF3B30',
    badge: 'bg-red-100/80 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/50',
  },
  yellow: {
    bg: 'bg-white/80 dark:bg-[#2B260E]/80 backdrop-blur-xl',
    border: 'border-amber-200/60 dark:border-amber-900/40',
    accent: '#EAB308',
    badge: 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/50',
  },
  default: {
    bg: 'bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl',
    border: 'border-white/60 dark:border-white/10',
    accent: '#8E8E93',
    badge: 'bg-black/5 dark:bg-white/10 text-[#8E8E93] border border-black/5',
  },
};

const PRIORITY_BADGES: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Rendah', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
  medium: { label: 'Sedang', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  high: { label: 'Tinggi', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  urgent: { label: 'Mendesak', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 font-bold' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isDone = task.status === 'done';
  const colorStyle = COLOR_MAP[task.color] || COLOR_MAP.default;

  // Due Date calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = task.due_date === todayStr;
  const isOverdue = !isDone && task.due_date < todayStr;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: TaskStatus = isDone ? 'todo' : 'done';
    const newProgress = isDone ? 0 : 100;

    // Trigger celebratory confetti if marking as done
    if (!isDone) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#007AFF', '#34C759', '#FF9500', '#AF52DE'],
        });
      } catch (err) {
        // Safe fallback
      }
    }

    onUpdate({
      ...task,
      status: newStatus,
      progress: newProgress,
      updated_at: new Date().toISOString(),
    });
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      ...task,
      pinned: !task.pinned,
      updated_at: new Date().toISOString(),
    });
  };

  const handleSubtaskToggle = (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const completedCount = updatedSubtasks.filter((s) => s.completed).length;
    const autoProgress =
      updatedSubtasks.length > 0
        ? Math.round((completedCount / updatedSubtasks.length) * 100)
        : task.progress;

    const newStatus: TaskStatus =
      autoProgress === 100 ? 'done' : autoProgress > 0 ? 'in_progress' : task.status;

    onUpdate({
      ...task,
      subtasks: updatedSubtasks,
      progress: autoProgress,
      status: newStatus,
      updated_at: new Date().toISOString(),
    });
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-[24px] p-4 border transition-all duration-200 shadow-sm hover:shadow-md ${colorStyle.bg} ${colorStyle.border} ${
        isDone ? 'opacity-70 dark:opacity-60' : ''
      }`}
    >
      {/* Top Bar: Project + Priority, Pin & Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {task.project_name && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${colorStyle.badge} truncate max-w-[140px]`}
            >
              <FolderKanban className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{task.project_name}</span>
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${PRIORITY_BADGES[task.priority].color}`}>
            {PRIORITY_BADGES[task.priority].label}
          </span>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            id={`pin-task-${task.id}`}
            onClick={handlePinToggle}
            className={`p-2 rounded-full transition-colors ${
              task.pinned
                ? 'text-[#FF9500] bg-orange-100 dark:bg-orange-950/50'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
            title={task.pinned ? 'Lepas Sematan' : 'Sematkan Catatan'}
          >
            <Pin className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              id={`menu-task-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-9 z-50 w-40 py-1 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-xl border border-black/10 dark:border-white/10 text-sm text-[#1C1C1E] dark:text-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-left"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    <span>Edit Tugas</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(task.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Tugas</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Checkbox + Title + Description */}
      <div className="flex items-start gap-3">
        <button
          id={`check-task-${task.id}`}
          onClick={handleToggleComplete}
          className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            isDone
              ? 'bg-[#34C759] text-white shadow-sm'
              : 'border-2 border-[#C7C7CC] hover:border-[#007AFF] text-transparent hover:text-blue-200'
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] transition-transform ${isDone ? 'scale-100' : 'scale-0'}`} />
        </button>

        <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
          <h3
            className={`text-[15px] font-semibold tracking-tight leading-snug cursor-pointer transition-all ${
              isDone
                ? 'line-through text-[#8E8E93] dark:text-[#8E8E93]'
                : 'text-[#1C1C1E] dark:text-white hover:text-[#007AFF]'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-[13px] text-[#8E8E93] dark:text-[#98989D] mt-1 line-clamp-2 leading-relaxed font-normal">
              {task.description}
            </p>
          )}

          {/* Slim inline progress bar — no header, no divider, just the essentials */}
          {!isDone && task.progress > 0 && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%`, backgroundColor: colorStyle.accent }}
                />
              </div>
              <span className="text-[11px] font-semibold text-[#8E8E93] flex-shrink-0">{task.progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Due date, subtask chip (tap to expand), tags — one row */}
      <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2 flex-wrap text-[13px] text-[#8E8E93]">
        <div className="flex items-center gap-1 font-medium">
          <Calendar className="w-4 h-4" />
          <span
            className={
              isOverdue
                ? 'text-rose-600 font-semibold flex items-center gap-1'
                : isToday
                ? 'text-orange-600 font-semibold'
                : ''
            }
          >
            {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
            {isToday ? 'Hari Ini' : task.due_date}
            {task.due_time && ` • ${task.due_time}`}
          </span>
        </div>

        {totalSubtasks > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSubtasks(!showSubtasks);
            }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 font-medium"
          >
            <span>{completedSubtasks}/{totalSubtasks} subtugas</span>
            {showSubtasks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {task.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[#8E8E93] dark:text-[#AEAEC2]">
                #{tag}
              </span>
            ))}
            {task.tags.length > 2 && <span>+{task.tags.length - 2}</span>}
          </div>
        )}
      </div>

      {/* Subtasks list — expands under the footer, no extra bordered section */}
      <AnimatePresence>
        {showSubtasks && totalSubtasks > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 pt-2"
          >
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={(e) => handleSubtaskToggle(st.id, e)}
                className="flex items-center gap-2 py-1.5 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-[13px]"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                    st.completed ? 'bg-[#34C759] border-[#34C759] text-white' : 'border-[#8E8E93] bg-transparent'
                  }`}
                >
                  {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={`flex-1 truncate ${st.completed ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E] dark:text-white'}`}>
                  {st.title}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
