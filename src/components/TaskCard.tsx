import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Pin,
  MoreHorizontal,
  Trash2,
  Edit3,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const ACCENT: Record<string, string> = {
  blue: '#007AFF',
  green: '#34C759',
  purple: '#AF52DE',
  orange: '#FF9500',
  red: '#FF3B30',
  yellow: '#EAB308',
  default: '#8E8E93',
};

const HIGHLIGHT_BG: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10',
  green: 'bg-emerald-50 dark:bg-emerald-500/10',
  purple: 'bg-purple-50 dark:bg-purple-500/10',
  orange: 'bg-orange-50 dark:bg-orange-500/10',
  red: 'bg-rose-50 dark:bg-rose-500/10',
  yellow: 'bg-amber-100 dark:bg-amber-500/10',
  default: 'bg-white dark:bg-[#1C1C1E]',
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
  const accent = ACCENT[task.color] || ACCENT.default;
  const cardBg = task.pinned ? HIGHLIGHT_BG[task.color] || HIGHLIGHT_BG.default : 'bg-white dark:bg-[#1C1C1E]';

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = task.due_date === todayStr;
  const isOverdue = !isDone && task.due_date < todayStr;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: TaskStatus = isDone ? 'todo' : 'done';
    const newProgress = isDone ? 0 : 100;

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-[28px] p-5 border border-black/5 dark:border-white/5 shadow-sm transition-all ${cardBg} ${
        isDone ? 'opacity-60' : ''
      }`}
    >
      {/* Top row: date/time + pin + menu (minimal, no badges) */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide ${
            isOverdue ? 'text-rose-500' : isToday ? 'text-[#FF9500]' : 'text-[#8E8E93]'
          }`}
        >
          {isOverdue && <AlertCircle className="w-3 h-3" />}
          {isToday ? 'Hari Ini' : task.due_date}
          {task.due_time && ` · ${task.due_time}`}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            id={`pin-task-${task.id}`}
            onClick={handlePinToggle}
            className={`p-1.5 rounded-full transition-colors ${
              task.pinned ? 'text-[#FF9500]' : 'text-[#C7C7CC] hover:text-[#8E8E93]'
            }`}
            title={task.pinned ? 'Lepas Sematan' : 'Sematkan'}
          >
            <Pin className="w-3.5 h-3.5" fill={task.pinned ? 'currentColor' : 'none'} />
          </button>

          <div className="relative">
            <button
              id={`menu-task-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-[#C7C7CC] hover:text-[#8E8E93] rounded-full transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
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
                <div className="absolute right-0 top-8 z-50 w-36 py-1 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-xl border border-black/10 dark:border-white/10 text-sm text-[#1C1C1E] dark:text-white overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 text-left"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    <span>Edit</span>
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
                    <span>Hapus</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title + description */}
      <div onClick={() => onEdit(task)} className="cursor-pointer">
        <h3
          className={`text-[17px] font-extrabold tracking-tight leading-snug transition-all ${
            isDone ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E] dark:text-white'
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="text-[13px] text-[#8E8E93] dark:text-[#98989D] mt-1 line-clamp-1 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Slim progress bar — only when actively in progress */}
      {!isDone && task.progress > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%`, backgroundColor: accent }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#8E8E93] flex-shrink-0">{task.progress}%</span>
        </div>
      )}

      {/* Bottom row: project pill + subtask pill, and a circular complete button */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {task.project_name && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#1C1C1E] dark:text-white truncate max-w-[120px]">
              {task.project_name}
            </span>
          )}

          {totalSubtasks > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtasks(!showSubtasks);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white transition-colors"
            >
              <ListChecks className="w-3 h-3" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
              {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        <button
          id={`check-task-${task.id}`}
          onClick={handleToggleComplete}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all active:scale-90 shadow-sm"
          style={{ backgroundColor: isDone ? accent : '#1C1C1E' }}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Subtasks list — expands under the footer only when tapped */}
      <AnimatePresence>
        {showSubtasks && totalSubtasks > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 pt-3 mt-1 border-t border-black/5 dark:border-white/5"
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
