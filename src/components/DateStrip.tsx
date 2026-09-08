import React, { useMemo } from 'react';

interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  taskCountByDate?: Record<string, number>;
}

const WEEKDAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onSelectDate, taskCountByDate = {} }) => {
  const days = useMemo(() => {
    const today = new Date();
    const arr: Date[] = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const todayStr = toDateStr(new Date());

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
      {days.map((d) => {
        const dateStr = toDateStr(d);
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === todayStr;
        const hasTasks = (taskCountByDate[dateStr] || 0) > 0;

        return (
          <button
            key={dateStr}
            onClick={() => onSelectDate(dateStr)}
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 w-[52px] h-[64px] rounded-[20px] transition-all ${
              isSelected
                ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/25 scale-105'
                : isToday
                ? 'bg-blue-50 dark:bg-blue-500/10 text-[#007AFF] border border-[#007AFF]/30'
                : 'bg-black/5 dark:bg-white/5 text-[#1C1C1E] dark:text-white'
            }`}
          >
            <span className="text-[17px] font-extrabold leading-none">{d.getDate()}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? 'text-white/80' : 'text-[#8E8E93]'}`}>
              {WEEKDAY_SHORT[d.getDay()]}
            </span>
            {hasTasks && !isSelected && <span className="w-1 h-1 rounded-full bg-[#007AFF]" />}
          </button>
        );
      })}
    </div>
  );
};
