import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sliders,
  FolderKanban,
  Check
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { CupertinoSegmentedControl } from './CupertinoSegmentedControl';
import { TaskCard } from './TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTaskOnDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddTaskOnDate,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [calMode, setCalMode] = useState<'month' | 'day_timeline'>('month');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayJump = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Month metadata
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const weekdayShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Map tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    if (!tasksByDate[t.due_date]) {
      tasksByDate[t.due_date] = [];
    }
    tasksByDate[t.due_date].push(t);
  });

  // Selected date's tasks
  const selectedDateTasks = tasksByDate[selectedDateStr] || [];

  // Format nice selected date title
  const formattedSelectedDate = (() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  })();

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 pb-24">
      {/* Calendar Top Controls */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70 rounded-[28px] p-5 border border-white/60 dark:border-white/10 shadow-sm">
        {/* Mode Switcher */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <CupertinoSegmentedControl
            options={[
              { id: 'month', label: 'Kalender Bulanan' },
              { id: 'day_timeline', label: 'Jadwal Timeline' },
            ]}
            value={calMode}
            onChange={(val) => setCalMode(val as any)}
            className="w-full sm:w-72"
            size="sm"
          />

          <button
            onClick={handleTodayJump}
            className="px-3 py-1.5 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 rounded-full text-xs font-bold transition-all whitespace-nowrap border border-[#007AFF]/20"
          >
            Hari Ini
          </button>
        </div>

        {/* Month Title & Month Navigators */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-lg font-bold text-[#1C1C1E] dark:text-white font-jakarta">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs font-medium text-[#8E8E93]">
              {tasks.filter((t) => t.due_date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} tugas & jobs di bulan ini
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-[#007AFF] hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 text-[#007AFF] hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#8E8E93] uppercase mb-1.5">
          {weekdayShort.map((w, idx) => (
            <div key={idx} className={`py-1 ${idx === 0 ? 'text-[#FF3B30]' : ''}`}>
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Grid Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty offset slots */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-11 sm:h-12" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedDateStr;
            const dayTasks = tasksByDate[dayStr] || [];
            const hasOverdue = dayTasks.some((t) => t.status !== 'done' && dayStr < todayStr);
            const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.status === 'done');

            return (
              <button
                key={dayStr}
                onClick={() => setSelectedDateStr(dayStr)}
                className={`relative h-11 sm:h-12 rounded-2xl flex flex-col items-center justify-start pt-1 transition-all group ${
                  isSelected
                    ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/30 scale-105 z-10 font-bold'
                    : isToday
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-[#007AFF] font-bold border border-[#007AFF]/30 backdrop-blur-sm'
                    : 'hover:bg-white/60 dark:hover:bg-white/5 text-[#1C1C1E] dark:text-white'
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isSelected
                      ? 'text-white'
                      : isToday
                      ? 'text-[#007AFF]'
                      : 'text-[#1C1C1E] dark:text-white'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Event dots indicator */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : t.status === 'done'
                            ? 'bg-[#34C759]'
                            : t.status === 'in_progress'
                            ? 'bg-[#007AFF]'
                            : 'bg-[#FF9500]'
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span
                        className={`text-[8px] font-bold ${
                          isSelected ? 'text-white' : 'text-[#8E8E93]'
                        }`}
                      >
                        +
                      </span>
                    )}
                  </div>
                )}

                {/* Small indicator badge if completed */}
                {allDone && dayTasks.length > 0 && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-[#34C759] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Timeline Schedule */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70 rounded-[28px] p-5 border border-white/60 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#007AFF]" />
              <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white font-jakarta">
                {formattedSelectedDate}
              </h3>
            </div>
            <p className="text-xs font-medium text-[#8E8E93] mt-0.5">
              {selectedDateTasks.length} tugas/pekerjaan terdaftar
            </p>
          </div>

          <button
            onClick={() => onAddTaskOnDate(selectedDateStr)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tugas</span>
          </button>
        </div>

        {/* Tasks list for selected date */}
        {selectedDateTasks.length === 0 ? (
          <div className="py-8 text-center text-[#8E8E93]">
            <CalendarIcon className="w-10 h-10 mx-auto stroke-1 text-[#C7C7CC] mb-2" />
            <p className="text-sm font-medium">Tidak ada tugas pada tanggal ini</p>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Jadwalkan pekerjaan baru dengan menekan tombol Tambah Tugas di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateTasks.map((task) => (
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
    </div>
  );
};
