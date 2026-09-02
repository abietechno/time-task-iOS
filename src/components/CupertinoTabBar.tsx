import React from 'react';
import { CheckSquare, Calendar, Layers, FolderKanban, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface CupertinoTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
  pendingCount: number;
  isAuthenticated: boolean;
}

export const CupertinoTabBar: React.FC<CupertinoTabBarProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
  pendingCount,
  isAuthenticated,
}) => {
  const tabs = [
    {
      id: 'today' as ActiveTab,
      label: 'Tugas',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'timeline' as ActiveTab,
      label: 'Timeline',
      icon: Layers,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Kalender',
      icon: Calendar,
    },
    {
      id: 'projects' as ActiveTab,
      label: 'Proyek',
      icon: FolderKanban,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Profil',
      icon: User,
      indicator: isAuthenticated ? 'green' : 'gray',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto pointer-events-auto">
      {/* Background Frosted Glass blur with soft outer shadow */}
      <div className="relative mx-3.5 mb-3 px-2 py-2 rounded-[28px] bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/70 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                  isActive
                    ? 'text-[#007AFF] font-bold'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white font-medium'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8px]'
                    }`}
                  />
                  {/* Badge count */}
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[9px] font-extrabold text-white bg-[#FF3B30] rounded-full shadow-sm animate-pulse border border-white dark:border-[#1C1C1E]">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                  {/* Sync status indicator */}
                  {tab.indicator && (
                    <span
                      className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full border-2 border-white dark:border-gray-900 ${
                        tab.indicator === 'green' ? 'bg-[#34C759]' : 'bg-[#C7C7CC]'
                      }`}
                    />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {tab.label}
                </span>

                {/* iOS Active Indicator Pill */}
                {isActive && (
                  <span className="absolute -bottom-1 w-4 h-1 bg-[#007AFF] rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
