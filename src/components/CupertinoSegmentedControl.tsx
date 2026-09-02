import React from 'react';
import { motion } from 'motion/react';

interface SegmentOption<T extends string> {
  id: T;
  label: string;
  badge?: number | string;
}

interface CupertinoSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function CupertinoSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: CupertinoSegmentedControlProps<T>) {
  return (
    <div
      className={`relative flex items-center p-1 backdrop-blur-md bg-white/50 dark:bg-[#1C1C1E]/50 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm select-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            id={`segment-${option.id}`}
            type="button"
            onClick={() => onChange(option.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 z-10 transition-colors duration-150 rounded-xl text-center font-medium ${
              size === 'sm' ? 'text-xs' : 'text-[13px]'
            } ${
              isSelected
                ? 'text-[#1C1C1E] dark:text-white font-bold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white font-medium'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-pill-active"
                className="absolute inset-0 bg-white/90 dark:bg-[#2C2C2E]/90 backdrop-blur-md rounded-xl border border-white/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 truncate">{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? 'bg-[#007AFF]/15 text-[#007AFF]'
                    : 'bg-[#8E8E93]/15 text-[#8E8E93]'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
