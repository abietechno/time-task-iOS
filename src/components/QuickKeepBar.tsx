import React from 'react';
import { Plus } from 'lucide-react';

interface QuickKeepBarProps {
  onOpenFullModal: () => void;
}

export const QuickKeepBar: React.FC<QuickKeepBarProps> = ({ onOpenFullModal }) => {
  return (
    <button
      onClick={onOpenFullModal}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] font-bold text-sm rounded-full shadow-sm active:scale-[0.98] transition-all"
    >
      <Plus className="w-4 h-4 stroke-[2.5]" />
      <span>Buat Tugas Baru</span>
    </button>
  );
};
