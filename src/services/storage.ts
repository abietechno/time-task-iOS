import { Task, Project, User, SupabaseConfig } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  TASKS: 'ios_timeline_tasks_v1',
  PROJECTS: 'ios_timeline_projects_v1',
  USER: 'ios_timeline_user_v1',
  SUPABASE_CONFIG: 'ios_timeline_supabase_cfg_v1',
};

// Helper: Format today as YYYY-MM-DD
export const getTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Redesign UI/UX Mobile App',
    description: 'Proyek perombakan tampilan dashboard iOS native dengan glassmorphism dan bottom navigation.',
    color: '#007AFF', // iOS System Blue
    icon: 'layout',
    start_date: getRelativeDate(-5),
    deadline: getRelativeDate(14),
    status: 'active',
    client: 'Acme Mobile Corp',
  },
  {
    id: 'proj-2',
    name: 'Sinkronisasi Backend & Supabase',
    description: 'Setup database PostgreSQL, autentikasi Google/Email, dan webhook realtime sync.',
    color: '#34C759', // iOS System Green
    icon: 'database',
    start_date: getRelativeDate(-2),
    deadline: getRelativeDate(10),
    status: 'active',
    client: 'Internal Tech Stack',
  },
  {
    id: 'proj-3',
    name: 'Kampanye Marketing Q3',
    description: 'Peluncuran landing page, assets media sosial, dan penjangkauan influencer.',
    color: '#AF52DE', // iOS System Purple
    icon: 'trending-up',
    start_date: getRelativeDate(-10),
    deadline: getRelativeDate(25),
    status: 'active',
    client: 'Marketing Team',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalisasi Desain Wireframe iOS Cupertino',
    description: 'Review interaksi bottom tab bar, blur glass effect di header, dan dynamic modal sheet.',
    project_id: 'proj-1',
    project_name: 'Redesign UI/UX Mobile App',
    status: 'in_progress',
    priority: 'high',
    due_date: getTodayDate(),
    due_time: '14:00',
    start_date: getRelativeDate(-1),
    progress: 75,
    subtasks: [
      { id: 'sub-1', title: 'Buat komponen tab bar melayang dengan blur', completed: true },
      { id: 'sub-2', title: 'Atur palet warna iOS System Gray & Blue', completed: true },
      { id: 'sub-3', title: 'Uji responsivitas swipe dan sheet modal', completed: false },
    ],
    tags: ['Design', 'iOS', 'UI'],
    color: 'blue',
    pinned: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Setup Database Supabase & Tabel Tasks',
    description: 'Buat skema SQL tabel projects dan tasks dengan Row Level Security (RLS) serta trigger updated_at.',
    project_id: 'proj-2',
    project_name: 'Sinkronisasi Backend & Supabase',
    status: 'in_progress',
    priority: 'urgent',
    due_date: getTodayDate(),
    due_time: '17:30',
    start_date: getTodayDate(),
    progress: 40,
    subtasks: [
      { id: 'sub-4', title: 'Tulis skrip DDL SQL untuk Supabase Editor', completed: true },
      { id: 'sub-5', title: 'Integrasikan Supabase JS Client di web', completed: false },
      { id: 'sub-6', title: 'Uji Google OAuth & Email Login sync', completed: false },
    ],
    tags: ['Backend', 'Supabase', 'Database'],
    color: 'green',
    pinned: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Meeting Evaluasi Timeline & Sprint Jobs',
    description: 'Sinkronisasi mingguan bersama tim pengembang dan pemegang proyek untuk review blocker.',
    project_id: 'proj-1',
    project_name: 'Redesign UI/UX Mobile App',
    status: 'todo',
    priority: 'medium',
    due_date: getRelativeDate(1),
    due_time: '10:00',
    start_date: getRelativeDate(1),
    progress: 0,
    subtasks: [
      { id: 'sub-7', title: 'Siapkan deck presentasi progress mingguan', completed: false },
      { id: 'sub-8', title: 'Kompilasi log bug dan timeline rilis', completed: false },
    ],
    tags: ['Meeting', 'Sprint'],
    color: 'purple',
    pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Publish Artikel Launching & Press Release',
    description: 'Tulis draft pengumuman fitur baru di blog resmi dan distribusi ke kanal media.',
    project_id: 'proj-3',
    project_name: 'Kampanye Marketing Q3',
    status: 'todo',
    priority: 'low',
    due_date: getRelativeDate(3),
    due_time: '16:00',
    start_date: getRelativeDate(2),
    progress: 10,
    subtasks: [
      { id: 'sub-9', title: 'Draft copywriting artikel utama', completed: true },
      { id: 'sub-10', title: 'Buat banner visual promosi resolusi tinggi', completed: false },
    ],
    tags: ['Marketing', 'Copywriting'],
    color: 'orange',
    pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Uji Coba PWA & Install Shortcut ke Homescreen iOS',
    description: 'Pastikan web manifest dan standalone display berjalan mulus di Safari iPhone dan browser Chrome.',
    project_id: 'proj-1',
    project_name: 'Redesign UI/UX Mobile App',
    status: 'done',
    priority: 'medium',
    due_date: getRelativeDate(-1),
    due_time: '11:00',
    start_date: getRelativeDate(-2),
    progress: 100,
    subtasks: [
      { id: 'sub-11', title: 'Konfigurasi meta viewport & safe areas', completed: true },
      { id: 'sub-12', title: 'Test di device iPhone', completed: true },
    ],
    tags: ['Mobile', 'PWA'],
    color: 'blue',
    pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_USER: User = {
  id: 'usr-1',
  email: 'bagusboss.hd@gmail.com',
  full_name: 'Bagus Boss',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  provider: 'google',
  created_at: new Date().toISOString(),
};

// Storage Utilities
export const getStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored tasks', e);
    return INITIAL_TASKS;
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored projects', e);
    return INITIAL_PROJECTS;
  }
};

export const saveStoredProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getStoredUser = (): User => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USER;
  }
};

export const saveStoredUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (!raw) {
      const defaultCfg: SupabaseConfig = {
        url: '',
        anon_key: '',
        is_connected: false,
        auto_sync: false,
      };
      return defaultCfg;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      url: '',
      anon_key: '',
      is_connected: false,
      auto_sync: false,
    };
  }
};

export const saveStoredSupabaseConfig = (cfg: SupabaseConfig): void => {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(cfg));
};

// Supabase Client Helper
let supabaseClientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const currentCfg = getStoredSupabaseConfig();
  const targetUrl = url || currentCfg.url;
  const targetKey = key || currentCfg.anon_key;

  if (!targetUrl || !targetKey) return null;

  try {
    if (!supabaseClientInstance || url || key) {
      supabaseClientInstance = createClient(targetUrl, targetKey);
    }
    return supabaseClientInstance;
  } catch (e) {
    console.error('Supabase initialization failed', e);
    return null;
  }
};

// SQL Schema Generator for Supabase
export const getSupabaseSQLSchema = (): string => {
  return `-- ==========================================
-- SQL SETUP UNTUK SUPABASE DATABASE
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- ==========================================

-- 1. Buat tabel Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#007AFF',
    icon TEXT DEFAULT 'layout',
    start_date DATE,
    deadline DATE,
    status TEXT DEFAULT 'active',
    client TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat tabel Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name TEXT,
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    due_date DATE NOT NULL,
    due_time TEXT,
    start_date DATE,
    progress INTEGER DEFAULT 0,
    subtasks JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    color TEXT DEFAULT 'blue',
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Buat Policy untuk Public Access (atau sesuaikan dengan auth.uid())
CREATE POLICY "Allow anonymous read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert/update projects" ON public.projects FOR ALL USING (true);

CREATE POLICY "Allow anonymous read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert/update tasks" ON public.tasks FOR ALL USING (true);

-- 5. Aktifkan Realtime Replication untuk sinkronisasi seketika
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
`;
};
