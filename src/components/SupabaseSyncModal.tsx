import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Database,
  ArrowUpRight,
  Shield,
  Download,
  Upload,
  Lock
} from 'lucide-react';
import { SupabaseConfig, Task, Project } from '../types';
import { getSupabaseSQLSchema, getSupabaseClient } from '../services/storage';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (cfg: SupabaseConfig) => void;
  tasks: Task[];
  projects: Project[];
  onImportData: (tasks: Task[], projects: Project[]) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  tasks,
  projects,
  onImportData,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anon_key || '');
  const [autoSync, setAutoSync] = useState(config.auto_sync || false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = getSupabaseSQLSchema();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan Supabase URL dan Anon Key terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const client = getSupabaseClient(url.trim(), anonKey.trim());
      if (!client) {
        throw new Error('Inisialisasi klien Supabase gagal.');
      }

      // Test query to tasks or projects
      const { data, error } = await client.from('tasks').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // Table might not be created yet, but connection was made
        if (error.message.includes('relation "public.tasks" does not exist')) {
          setTestResult({
            success: true,
            message: 'Terkoneksi ke Supabase! Jangan lupa jalankan skrip SQL di bawah untuk membuat tabel.',
          });
          onSaveConfig({
            url: url.trim(),
            anon_key: anonKey.trim(),
            is_connected: true,
            auto_sync: autoSync,
            last_synced_at: new Date().toISOString(),
          });
          return;
        }
        throw error;
      }

      setTestResult({
        success: true,
        message: 'Koneksi ke Supabase Berhasil! Tabel tasks siap digunakan.',
      });

      onSaveConfig({
        url: url.trim(),
        anon_key: anonKey.trim(),
        is_connected: true,
        auto_sync: autoSync,
        last_synced_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Gagal terhubung: ${err.message || 'Cek URL dan Anon Key'}. Pastikan URL berformat https://xyz.supabase.co`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSyncPush = async () => {
    setIsSyncing(true);
    try {
      const client = getSupabaseClient(url.trim(), anonKey.trim());
      if (!client) {
        throw new Error('Supabase client tidak aktif.');
      }

      // Upsert projects
      if (projects.length > 0) {
        await client.from('projects').upsert(projects, { onConflict: 'id' });
      }

      // Upsert tasks
      if (tasks.length > 0) {
        await client.from('tasks').upsert(tasks, { onConflict: 'id' });
      }

      onSaveConfig({
        url: url.trim(),
        anon_key: anonKey.trim(),
        is_connected: true,
        auto_sync: autoSync,
        last_synced_at: new Date().toISOString(),
      });

      setTestResult({
        success: true,
        message: `Sinkronisasi berhasil! ${tasks.length} tugas & ${projects.length} proyek telah di-push ke cloud Supabase.`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Sinkronisasi gagal: ${err.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      exported_at: new Date().toISOString(),
      tasks,
      projects,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `timeline_tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[32px] shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1C1E] dark:text-white font-google">
                Integrasi Supabase & Sinkronisasi
              </h2>
              <p className="text-[11px] font-medium text-[#8E8E93]">
                Penyimpanan cloud PostgreSQL & Realtime sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-[#1C1C1E] dark:text-white">
          {/* Status Badge */}
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between border ${
              config.is_connected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {config.is_connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <span className="font-bold">
                {config.is_connected
                  ? 'Supabase Terhubung (Siap Sinkron)'
                  : 'Mode Offline Aktif (Tersimpan Lokal)'}
              </span>
            </div>
            {config.last_synced_at && (
              <span className="text-[10px] font-semibold opacity-75">
                Terakhir: {new Date(config.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Form Credentials */}
          <div className="space-y-3.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 p-4 rounded-[24px]">
            <div>
              <label className="block font-semibold text-[#8E8E93] mb-1.5">
                Supabase Project URL
              </label>
              <input
                id="supabase-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzprojectid.supabase.co"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1C1C1E] rounded-2xl outline-none border border-black/5 dark:border-white/5 font-mono text-[11px] focus:border-[#007AFF]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#8E8E93] mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                id="supabase-key-input"
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1C1C1E] rounded-2xl outline-none border border-black/5 dark:border-white/5 font-mono text-[11px] focus:border-[#007AFF]/50 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#007AFF] text-white font-bold rounded-full text-xs shadow-md shadow-blue-500/25 disabled:opacity-40 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji & Simpan Koneksi'}</span>
              </button>

              {config.is_connected && (
                <button
                  type="button"
                  onClick={handleManualSyncPush}
                  disabled={isSyncing}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-full text-xs shadow-md shadow-emerald-600/25 disabled:opacity-40 active:scale-95 transition-all"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
                  <span>{isSyncing ? 'Sinkronisasi...' : 'Push ke Supabase'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Test feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* SQL Setup Script Helper */}
          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-[#1C1C1E] dark:text-white">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Skrip SQL Skema Database Supabase</span>
              </span>

              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#1C1C1E] text-[#007AFF] font-semibold rounded-lg shadow-sm border border-black/5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#8E8E93]">
              Buka menu <b>SQL Editor</b> di dashboard Supabase Anda, tempelkan skrip ini, lalu klik <b>Run</b> untuk membuat tabel tasks & projects beserta RLS.
            </p>

            <pre className="p-2.5 bg-[#1C1C1E] text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-28 scrollbar-thin">
              {sqlSchema}
            </pre>
          </div>

          {/* Backup & Restore Option */}
          <div className="flex items-center justify-between p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl">
            <div>
              <h4 className="font-bold text-[#1C1C1E] dark:text-white">Backup Data Lokal</h4>
              <p className="text-[10px] text-[#8E8E93]">Unduh arsip data JSON pekerjaan Anda</p>
            </div>

            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white font-semibold rounded-xl border border-black/5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh JSON</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
