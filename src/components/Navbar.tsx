import React from 'react';
import { motion } from 'motion/react';
import { Mail, Sun, Moon, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface NavbarProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onLogoClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  setIsDark,
  soundEnabled,
  setSoundEnabled,
  onLogoClick,
}) => {
  const toast = useToast();

  const handleToggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.success('Dark mode ON');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.info('Light mode ON');
    }
  };

  const handleToggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    localStorage.setItem('tmv_sound_enabled', String(nextSound));
    toast.info(nextSound ? 'Sound chime ON' : 'Sound chime muted');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0A0A0B]/80 dark:bg-[#0A0A0B]/85 border-b border-[#27272A] dark:border-[#27272A] light:bg-[#FAFAF8]/90 light:border-[#E4E4E7] transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onLogoClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1 -ml-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
                TempMail<span className="text-purple-600 dark:text-purple-400">Vault</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-3 h-3" /> Anonymous
              </span>
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a
            href="#generator"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
          >
            Email Generator
          </a>
          <a
            href="#inbox"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
          >
            Live Inbox
          </a>
          <a
            href="#how-it-works"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
          >
            How It Works
          </a>
          <a
            href="#faq"
            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Interactive Controls (Sound & Theme Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Notification Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleSound}
            aria-label="Toggle notification sound"
            title={soundEnabled ? 'Mute incoming email chimes' : 'Enable email sound alerts'}
            className="p-2 sm:p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-400/40 transition-colors shadow-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 sm:p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-400/40 transition-colors shadow-sm flex items-center justify-center relative overflow-hidden"
          >
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
