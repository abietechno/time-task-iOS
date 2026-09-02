import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Sliders,
  Filter,
  Plus
} from './icons';
import { Task, Project, TaskStatus, TaskPriority } from '../types';
import { TaskCard } from './TaskCard';
import { CupertinoSegmentedControl } from './CupertinoSegmentedControl';

interface TimelineKanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAdd: (defaultStatus?: TaskStatus) => void;
}

export const TimelineKanbanView: React.FC<TimelineKanbanViewProps> = ({
  tasks,
  projects,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onQuickAdd,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<TaskStatus | 'all'>('all');

  // Filter tasks based on project
  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectId !== 'all' && t.project_id !== selectedProjectId) {
      return false;
    }
    return true;
  });

  // Calculate high-level progress statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const urgentTasksCount = tasks.filter(
    (t) => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high')
  ).length;

  const LANES: { id: TaskStatus; label: string; color: string; count: number }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-500', count: todoTasks },
    { id: 'in_progress', label: 'Sedang Berjalan', color: 'bg-[#007AFF]', count: inProgressTasks },
    { id: 'review', label: 'Tahap Review', color: 'bg-[#AF52DE]', count: reviewTasks },
    { id: 'done', label: 'Selesai', color: 'bg-[#34C759]', count: completedTasks },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Real-time Project Progress Metrics Header (Frosted Glass Style) */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70 rounded-[28px] p-5 border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center border border-[#007AFF]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C1C1E] dark:text-white font-google">
                Ringkasan Timeline Jobs
              </h2>
              <p className="text-xs font-medium text-[#8E8E93]">
                {completedTasks} dari {totalTasks} tugas telah diselesaikan
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[#007AFF] font-google tracking-tight">
              {overallProgress}%
            </span>
            <span className="block text-[9px] text-[#8E8E93] font-bold uppercase tracking-wider">TOTAL PROGRES</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden mb-3.5 p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-2.5 rounded-2xl border border-white/40 dark:border-white/5">
            <span className="block font-bold text-sm text-[#1C1C1E] dark:text-white">{todoTasks}</span>
            <span className="text-[10px] text-[#8E8E93] font-medium">To Do</span>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-md p-2.5 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="block font-bold text-sm">{inProgressTasks}</span>
            <span className="text-[10px] font-medium">Berjalan</span>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-md p-2.5 rounded-2xl text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <span className="block font-bold text-sm">{reviewTasks}</span>
            <span className="text-[10px] font-medium">Review</span>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-md p-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="block font-bold text-sm">{completedTasks}</span>
            <span className="text-[10px] font-medium">Selesai</span>
          </div>
        </div>
      </div>

      {/* Project Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedProjectId('all')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedProjectId === 'all'
              ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/25'
              : 'backdrop-blur-md bg-white/60 dark:bg-[#1C1C1E]/60 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white border border-white/50 dark:border-white/10'
          }`}
        >
          Semua Proyek ({tasks.length})
        </button>

        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.project_id === proj.id);
          const isSelected = selectedProjectId === proj.id;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/25'
                  : 'backdrop-blur-md bg-white/60 dark:bg-[#1C1C1E]/60 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white border border-white/50 dark:border-white/10'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: proj.color || '#007AFF' }}
              />
              <span>{proj.name}</span>
              <span className="text-[10px] opacity-75">({projTasks.length})</span>
            </button>
          );
        })}
      </div>

      {/* Segmented Lane Switcher for Mobile Ease */}
      <CupertinoSegmentedControl
        options={[
          { id: 'all', label: 'Semua Alur' },
          { id: 'todo', label: 'To Do', badge: todoTasks },
          { id: 'in_progress', label: 'Berjalan', badge: inProgressTasks },
          { id: 'review', label: 'Review', badge: reviewTasks },
          { id: 'done', label: 'Selesai', badge: completedTasks },
        ]}
        value={activeStatusTab}
        onChange={(val) => setActiveStatusTab(val as any)}
        size="sm"
      />

      {/* Lanes List */}
      <div className="space-y-4">
        {LANES.filter(
          (lane) => activeStatusTab === 'all' || activeStatusTab === lane.id
        ).map((lane) => {
          const laneTasks = filteredTasks.filter((t) => t.status === lane.id);

          return (
            <div
              key={lane.id}
              className="backdrop-blur-xl bg-white/65 dark:bg-[#1C1C1E]/65 rounded-[28px] p-4 border border-white/60 dark:border-white/10 shadow-sm space-y-3"
            >
              {/* Lane Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${lane.color}`} />
                  <h3 className="text-xs font-bold text-[#1C1C1E] dark:text-white uppercase tracking-wider">
                    {lane.label}
                  </h3>
                  <span className="text-xs font-bold text-[#8E8E93] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {laneTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onQuickAdd(lane.id)}
                  className="px-2.5 py-1 text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-full text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  title={`Tambah tugas ke ${lane.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Tasks in lane */}
              {laneTasks.length === 0 ? (
                <div className="py-5 text-center text-[#8E8E93] text-xs border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                  Belum ada tugas di tahap ini
                </div>
              ) : (
                <div className="space-y-2.5">
                  {laneTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
