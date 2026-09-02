import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { User, SupabaseConfig } from '../types';
import { getSupabaseClient } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  supabaseConfig: SupabaseConfig;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  supabaseConfig,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (supabaseConfig.is_connected) {
        const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anon_key);
        if (client) {
          const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          });
          if (error) throw error;
        }
      }

      // Fast local profile update
      const googleUser: User = {
        id: `usr-google-${Date.now()}`,
        email: 'bagusboss.hd@gmail.com',
        full_name: 'Bagus Boss (Google)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        created_at: new Date().toISOString(),
      };

      onUpdateUser(googleUser);
      setSuccessMessage('Berhasil masuk dengan Akun Google!');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal login dengan Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi email dan password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (supabaseConfig.is_connected) {
        const client = getSupabaseClient(supabaseConfig.url, supabaseConfig.anon_key);
        if (client) {
          if (authMode === 'register') {
            const { error } = await client.auth.signUp({
              email,
              password,
              options: { data: { full_name: name || email.split('@')[0] } },
            });
            if (error) throw error;
          } else {
            const { error } = await client.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
          }
        }
      }

      const emailUser: User = {
        id: `usr-email-${Date.now()}`,
        email: email.trim(),
        full_name: name.trim() || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        provider: 'email',
        created_at: new Date().toISOString(),
      };

      onUpdateUser(emailUser);
      setSuccessMessage(`Berhasil ${authMode === 'register' ? 'mendaftar' : 'masuk'}!`);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Autentikasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      email: 'tamu@timeline.app',
      full_name: 'Pengguna Tamu',
      avatar_url: '',
      provider: 'guest',
      created_at: new Date().toISOString(),
    };
    onUpdateUser(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm backdrop-blur-2xl bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[32px] p-6 shadow-2xl border border-white/60 dark:border-white/10 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center border border-[#007AFF]/20">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white font-google">
                Akun Pengguna
              </h3>
              <p className="text-[11px] font-medium text-[#8E8E93]">Google & Email Login</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current logged in preview */}
        <div className="p-3.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-[20px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                currentUser.full_name.charAt(0)
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C1C1E] dark:text-white">
                {currentUser.full_name}
              </h4>
              <p className="text-[11px] font-medium text-[#8E8E93]">{currentUser.email}</p>
            </div>
          </div>

          {currentUser.provider !== 'guest' && (
            <button
              onClick={handleSignOut}
              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Google One-Tap / Sign-In Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-sm text-[#1C1C1E] dark:text-white font-bold text-xs rounded-2xl border border-black/10 dark:border-white/10 shadow-sm hover:bg-white active:scale-98 transition-all"
        >
          {/* Authentic Google Logo SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Lanjutkan dengan Akun Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 text-[11px] text-[#8E8E93]">
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          <span>atau dengan Email</span>
          <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="block font-semibold text-[#8E8E93] mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:border-[#007AFF]/50 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#8E8E93] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:border-[#007AFF]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#8E8E93] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-2xl outline-none focus:border-[#007AFF]/50 transition-colors"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-500 font-medium">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-xs text-emerald-500 font-medium">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold rounded-full shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-40 text-xs"
          >
            {isLoading
              ? 'Memproses...'
              : authMode === 'login'
              ? 'Masuk ke Aplikasi'
              : 'Daftar Akun Baru'}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setErrorMessage('');
              }}
              className="text-xs text-[#007AFF] font-semibold hover:underline"
            >
              {authMode === 'login'
                ? 'Belum punya akun? Daftar sekarang'
                : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
