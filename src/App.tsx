import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Task,
  Project,
  User,
  ActiveTab,
  TaskStatus,
} from './types';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredProjects,
  saveStoredProjects,
  getStoredUser,
  saveStoredUser,
  clearLocalMirror,
  getTodayDate,
} from './services/storage';
import { db } from './services/firebase';
import { useAuthSession } from './services/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

import { CupertinoTabBar } from './components/CupertinoTabBar';
import { CupertinoHeader } from './components/CupertinoHeader';
import { CupertinoSegmentedControl } from './components/CupertinoSegmentedControl';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { CalendarView } from './components/CalendarView';
import { TimelineKanbanView } from './components/TimelineKanbanView';
import { ProjectsView } from './components/ProjectsView';
import { QuickKeepBar } from './components/QuickKeepBar';
import { AuthModal } from './components/AuthModal';

import {
  Pin,
  CheckCircle2,
  ListFilter,
  Layers,
  Calendar,
  Cloud,
  FolderKanban,
  Sparkles,
  Inbox,
  Moon,
  Sun,
  Palette,
  Download,
  LogOut,
} from './components/icons';

export default function App() {
  // Auth: currentUser is null in guest mode, non-null once logged in.
  const { currentUser } = useAuthSession();
  const isGuest = !currentUser;

  // Global States
  const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
  const [projects, setProjects] = useState<Project[]>(getStoredProjects);
  const [guestUser, setGuestUser] = useState<User>(getStoredUser);

  // Displayed user: derived from the real Firebase user when logged in,
  // else the local guest profile (unchanged demo identity).
  const user: User = currentUser
    ? {
        id: currentUser.uid,
        email: currentUser.email ?? '',
        full_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Pengguna',
        avatar_url: currentUser.photoURL || '',
        provider: currentUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
        created_at: currentUser.metadata.creationTime ?? new Date().toISOString(),
      }
    : guestUser;

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'in_progress' | 'done'>('all');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string>(getTodayDate());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dark mode state: default to system preference or stored setting
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ios_app_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to html/root element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('ios_app_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ios_app_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync to local storage on changes — this is the offline mirror once logged in.
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (isGuest) saveStoredUser(guestUser);
  }, [guestUser, isGuest]);

  // Firestore realtime listeners, scoped to the logged-in user's own
  // subcollections (users/{uid}/tasks, users/{uid}/projects). onSnapshot
  // delivers the initial data AND every live update afterwards in one go —
  // Firestore is the source of truth once logged in; local storage stays as
  // an offline mirror (see the save effects above).
  useEffect(() => {
    if (!db || !currentUser) return;
    const uid = currentUser.uid;

    const unsubTasks = onSnapshot(collection(db, 'users', uid, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map((d) => d.data() as Task));
    });
    const unsubProjects = onSnapshot(collection(db, 'users', uid, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map((d) => d.data() as Project));
    });

    return () => {
      unsubTasks();
      unsubProjects();
    };
  }, [currentUser?.uid]);

  // Task Actions — push to Firestore only when logged in; in guest mode this
  // is byte-for-byte the original local-only behavior.
  const handleSaveTask = async (task: Task) => {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === task.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = task;
        return copy;
      }
      return [task, ...prev];
    });

    if (db && currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'tasks', task.id), task);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

    if (db && currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'tasks', updatedTask.id), updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (db && currentUser) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newProgress = newStatus === 'done' ? 100 : newStatus === 'todo' ? 0 : t.progress;
        return {
          ...t,
          status: newStatus,
          progress: newProgress,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  // Project Actions — same session-gated pattern as tasks above.
  const handleAddProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    if (db && currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'projects', project.id), project);
    }
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    if (db && currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'projects', updatedProj.id), updatedProj);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (db && currentUser) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'projects', projectId));
    }
  };

  const handleExportJSON = () => {
    const backupData = { exported_at: new Date().toISOString(), tasks, projects };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `timeline_tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  // Filter tasks for Today/Tasks tab
  const todayDateStr = getTodayDate();
  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  const searchedTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.project_name && t.project_name.toLowerCase().includes(query)) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const filteredTasks = searchedTasks.filter((t) => {
    if (taskFilter === 'today') return t.due_date === todayDateStr;
    if (taskFilter === 'in_progress') return t.status === 'in_progress' || t.status === 'review';
    if (taskFilter === 'done') return t.status === 'done';
    return true;
  });

  const pinnedTasks = filteredTasks.filter((t) => t.pinned);
  const regularTasks = filteredTasks.filter((t) => !t.pinned);

  // Tab Title & Subtitle helper
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'today':
        return {
          title: 'Daftar Tugas',
          subtitle: `${pendingTasksCount} pekerjaan aktif perlu diselesaikan`,
        };
      case 'timeline':
        return {
          title: 'Timeline & Status',
          subtitle: 'Pemantauan alur kemajuan proyek secara real-time',
        };
      case 'calendar':
        return {
          title: 'Kalender & Jadwal',
          subtitle: 'Perencanaan tenggat waktu harian & bulanan',
        };
      case 'projects':
        return {
          title: 'Proyek & Jobs',
          subtitle: `${projects.length} proyek terdaftar dengan timeline terpadu`,
        };
      case 'settings':
        return {
          title: 'Profil Saya',
          subtitle: isGuest ? 'Mode Tamu — data tersimpan lokal di perangkat ini' : `Masuk sebagai ${user.email}`,
        };
      default:
        return { title: 'Timeline & Task iOS', subtitle: '' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="relative min-h-screen bg-[#F2F2F7] dark:bg-[#121214] text-[#1C1C1E] dark:text-white flex flex-col font-sans transition-colors overflow-x-hidden selection:bg-[#007AFF]/20">
      {/* Frosted Glass Ambient Lighting Layer */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-[#d2e3ff] via-[#f2f2f7] to-[#ffdce5] dark:from-[#141b2d] dark:via-[#121214] dark:to-[#281526] opacity-60 dark:opacity-40 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* iOS Cupertino Sticky Header with Frosted Blur */}
      <div className="relative z-30">
        <CupertinoHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          user={user}
          isGuest={isGuest}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onQuickAdd={() => {
            setTaskToEdit(null);
            setDefaultTaskDate(getTodayDate());
            setIsTaskModalOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={activeTab !== 'settings'}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />
      </div>

      {/* Main Content View with Smooth Spring Transitions */}
      <main className="relative z-10 flex-1 w-full max-w-lg mx-auto px-4 pt-3 pb-safe">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="tab-today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pb-24"
            >
              {/* Google Keep Quick Input Bar */}
              <QuickKeepBar
                onQuickCreate={(partialTask) => {
                  const newTask: Task = {
                    id: `task-${Date.now()}`,
                    title: partialTask.title || 'Tugas Baru',
                    description: partialTask.description || '',
                    project_id: partialTask.project_id,
                    project_name: partialTask.project_name,
                    status: 'todo',
                    priority: 'medium',
                    due_date: getTodayDate(),
                    progress: 0,
                    subtasks: [],
                    tags: ['Tugas'],
                    color: 'blue',
                    pinned: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  handleSaveTask(newTask);
                }}
                onOpenFullModal={() => {
                  setTaskToEdit(null);
                  setDefaultTaskDate(getTodayDate());
                  setIsTaskModalOpen(true);
                }}
                projects={projects}
              />

              {/* Segmented Filter Control */}
              <CupertinoSegmentedControl
                options={[
                  { id: 'all', label: 'Semua', badge: tasks.length },
                  {
                    id: 'today',
                    label: 'Hari Ini',
                    badge: tasks.filter((t) => t.due_date === todayDateStr && t.status !== 'done')
                      .length,
                  },
                  {
                    id: 'in_progress',
                    label: 'Berjalan',
                    badge: tasks.filter((t) => t.status === 'in_progress').length,
                  },
                  {
                    id: 'done',
                    label: 'Selesai',
                    badge: tasks.filter((t) => t.status === 'done').length,
                  },
                ]}
                value={taskFilter}
                onChange={(val) => setTaskFilter(val as any)}
                size="sm"
              />

              {/* Pinned Tasks Section (Google Keep style) */}
              {pinnedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E8E93] uppercase tracking-wider px-1">
                    <Pin className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>Disematkan ({pinnedTasks.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {pinnedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onEdit={(t) => {
                          setTaskToEdit(t);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Tasks Section */}
              <div className="space-y-2">
                {pinnedTasks.length > 0 && (
                  <div className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider px-1 pt-1">
                    Lainnya
                  </div>
                )}

                {regularTasks.length === 0 && pinnedTasks.length === 0 ? (
                  <div className="py-12 text-center text-[#8E8E93] bg-white/50 dark:bg-[#1C1C1E]/50 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                    <Inbox className="w-10 h-10 mx-auto text-[#C7C7CC] mb-2 stroke-1" />
                    <p className="text-sm font-semibold text-[#1C1C1E] dark:text-white">
                      Belum Ada Tugas di Kategori Ini
                    </p>
                    <p className="text-xs text-[#8E8E93] mt-1 max-w-xs mx-auto">
                      Gunakan bar di atas atau tombol Tugas Baru untuk mencatat pekerjaan harian Anda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {regularTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onEdit={(t) => {
                          setTaskToEdit(t);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="tab-timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TimelineKanbanView
                tasks={searchedTasks}
                projects={projects}
                onUpdateTask={handleUpdateTask}
                onEditTask={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onQuickAdd={(status) => {
                  setTaskToEdit(null);
                  setDefaultTaskDate(getTodayDate());
                  setIsTaskModalOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="tab-calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarView
                tasks={searchedTasks}
                onUpdateTask={handleUpdateTask}
                onEditTask={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onAddTaskOnDate={(dateStr) => {
                  setTaskToEdit(null);
                  setDefaultTaskDate(dateStr);
                  setIsTaskModalOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="tab-projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectsView
                projects={projects}
                tasks={tasks}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onSelectProjectFilter={(projId) => {
                  setActiveTab('timeline');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="tab-settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pb-24"
            >
              {/* iOS Inset Group 1: User Profile Header */}
              <div className="cupertino-grouped-list p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-full overflow-hidden bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white/60 dark:border-white/10">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.full_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white font-google">
                      {user.full_name}
                    </h3>
                    <p className="text-xs text-[#8E8E93]">{user.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF]/10 text-[#007AFF] dark:bg-blue-950/40 dark:text-blue-300">
                      {isGuest ? 'Mode Tamu' : 'Akun Tersinkron'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] rounded-full text-xs font-bold transition-all active:scale-95"
                >
                  {isGuest ? 'Masuk / Daftar' : 'Kelola Akun'}
                </button>
              </div>

              {/* iOS Inset Group 2: Tampilan / Theme (Dark Mode) */}
              <div className="cupertino-grouped-list p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center border border-[#5856D6]/20">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white font-google">
                        Tampilan & Tema iOS
                      </h3>
                      <p className="text-[11px] text-[#8E8E93]">Mode Gelap (Dark Mode) & Terang</p>
                    </div>
                  </div>

                  <label className="cupertino-switch">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={(e) => setIsDarkMode(e.target.checked)}
                    />
                    <span className="cupertino-slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 dark:border-white/5 text-[#8E8E93]">
                  <span>Status Aktif</span>
                  <span className="font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                    {isDarkMode ? (
                      <>
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Dark Mode Aktif</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Light Mode Aktif</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* iOS Inset Group 3: Account identity (guest CTA vs logged-in) */}
              {isGuest ? (
                <div className="cupertino-grouped-list p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#34C759]/15 text-[#34C759] flex items-center justify-center border border-[#34C759]/20">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white font-google">
                        Simpan Data ke Cloud
                      </h3>
                      <p className="text-[11px] text-[#8E8E93]">Data saat ini hanya tersimpan di perangkat ini</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    Daftar akun gratis supaya tugas & proyek Anda tersimpan aman di cloud, dan bisa diakses dari perangkat lain.
                  </p>

                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-2.5 bg-[#007AFF] hover:bg-[#0062CC] active:scale-[0.98] text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>Daftar Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="cupertino-grouped-list p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#34C759]/15 text-[#34C759] flex items-center justify-center border border-[#34C759]/20">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white font-google">
                          Akun Cloud Aktif
                        </h3>
                        <p className="text-[11px] text-[#8E8E93]">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    Tugas & proyek Anda otomatis tersinkron ke cloud secara real-time.
                  </p>

                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}

              {/* iOS Inset Group 3: Statistics & App Info */}
              <div className="cupertino-grouped-list p-4 space-y-2 text-xs">
                <h4 className="font-bold text-[#1C1C1E] dark:text-white font-google text-xs uppercase tracking-wider text-[#8E8E93] mb-1">
                  Informasi Sistem & Statistik
                </h4>
                <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5 text-[#8E8E93]">
                  <span>Total Tugas Tersimpan</span>
                  <span className="font-bold text-[#1C1C1E] dark:text-white">{tasks.length} item</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5 text-[#8E8E93]">
                  <span>Total Proyek Aktif</span>
                  <span className="font-bold text-[#1C1C1E] dark:text-white">{projects.length} proyek</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/5 dark:border-white/5 text-[#8E8E93]">
                  <span>Desain UI/UX & Tipografi</span>
                  <span className="font-bold text-[#007AFF]">iOS Cupertino + Google Sans</span>
                </div>

                <button
                  onClick={handleExportJSON}
                  className="w-full mt-1 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-black/5 dark:hover:bg-white/10 text-[#1C1C1E] dark:text-white rounded-full text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Cadangan Data (JSON)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* iOS Cupertino Bottom Tab Bar */}
      <CupertinoTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={() => {
          setTaskToEdit(null);
          setDefaultTaskDate(getTodayDate());
          setIsTaskModalOpen(true);
        }}
        pendingCount={pendingTasksCount}
        isAuthenticated={!isGuest}
      />

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        projects={projects}
        defaultDate={defaultTaskDate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        isGuest={isGuest}
      />
    </div>
  );
}
