import React from 'react';
import { Search, User as UserIcon, Plus, Moon, Sun } from 'lucide-react';
import { User } from '../types';

interface CupertinoHeaderProps {
  title: string;
  subtitle?: string;
  user: User;
  isGuest: boolean;
  onOpenAuth: () => void;
  onQuickAdd: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const CupertinoHeader: React.FC<CupertinoHeaderProps> = ({
  title,
  subtitle,
  user,
  isGuest,
  onOpenAuth,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  showSearch = true,
  isDarkMode,
  onToggleDarkMode,
}) => {
  // Format formatted Indonesian date
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-4 pb-3.5 backdrop-blur-xl bg-white/70 dark:bg-[#121214]/75 border-b border-black/5 dark:border-white/5 transition-all">
      <div className="max-w-lg mx-auto">
        {/* Top meta row */}
        <div className="flex items-center justify-between text-xs text-[#8E8E93] font-medium tracking-wide uppercase">
          <span className="text-[11px] font-semibold text-[#8E8E93] tracking-wider">{dateFormatted}</span>

          <div className="flex items-center gap-2">
            {/* Theme Dark/Light Mode Quick Toggle */}
            {onToggleDarkMode && (
              <button
                id="header-theme-toggle-btn"
                onClick={onToggleDarkMode}
                className="w-9 h-9 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 text-[#1C1C1E] dark:text-white flex items-center justify-center text-xs active:scale-95 transition-all shadow-sm"
                title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500 stroke-[2.2]" />
                )}
              </button>
            )}

            {/* User Profile Avatar with Frosted Ring */}
            <button
              id="header-user-profile-btn"
              onClick={onOpenAuth}
              className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white/80 dark:border-white/20 shadow-sm flex items-center justify-center text-white font-bold text-xs active:scale-95 transition-transform"
              title={`Akun: ${user.full_name} (${user.email})`}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JD'}
                </span>
              )}
              {!isGuest && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-white dark:border-[#121214] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Big Navigation Title Row */}
        <div className="flex items-center justify-between mt-1.5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1C1E] dark:text-white font-google">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-medium text-[#8E8E93] mt-0.5">{subtitle}</p>
            )}
          </div>

          <button
            id="header-quick-add-btn"
            onClick={onQuickAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#007AFF] hover:bg-[#0062CC] active:scale-95 text-white font-bold text-xs rounded-full shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tugas Baru</span>
          </button>
        </div>

        {/* Search Bar (Frosted iOS Style) */}
        {showSearch && (
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8E8E93]" />
            <input
              id="task-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari tugas, timeline, catatan, tag..."
              className="w-full pl-9 pr-8 py-2 bg-white/60 dark:bg-[#2C2C2E]/60 backdrop-blur-md border border-white/50 dark:border-white/10 text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] text-sm rounded-2xl outline-none focus:ring-2 focus:ring-[#007AFF]/40 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 w-4 h-4 rounded-full bg-[#8E8E93] text-white flex items-center justify-center text-[10px] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
