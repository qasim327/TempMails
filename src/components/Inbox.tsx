import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Inbox as InboxIcon,
  RefreshCw,
  Trash2,
  ChevronRight,
  KeyRound,
  Mail,
  Clock,
  Sparkles,
  Send,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { EmailMessage } from '../types';
import { useToast } from '../context/ToastContext';

interface InboxProps {
  inbox: EmailMessage[];
  loading: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean | ((prev: boolean) => boolean)) => void;
  onRefresh: () => void;
  onSelectEmail: (email: EmailMessage) => void;
  onDeleteAll: () => void;
  onSendTestEmail: () => void;
}

export const Inbox: React.FC<InboxProps> = ({
  inbox,
  loading,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  onSelectEmail,
  onDeleteAll,
  onSendTestEmail,
}) => {
  const toast = useToast();
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = inbox.filter((m) => !m.read).length;

  const handleToggleAutoRefresh = () => {
    const nextVal = !autoRefresh;
    setAutoRefresh(nextVal);
    localStorage.setItem('tmv_auto_refresh', String(nextVal));
    if (nextVal) {
      toast.success('Auto-refresh ON (every 10s)');
    } else {
      toast.info('Auto-refresh OFF');
    }
  };

  const handleConfirmDeleteAll = () => {
    setShowConfirmDeleteAll(false);
    onDeleteAll();
  };

  const filteredInbox = inbox.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.from.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      (m.otp && m.otp.includes(q))
    );
  });

  return (
    <section id="inbox" className="w-full py-6 sm:py-8">
      {/* 3D Tilt Inbox Card */}
      <motion.div
        whileHover={{
          rotateX: 1,
          rotateY: 1,
          transition: { duration: 0.25 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full rounded-[28px] border border-[#27272A] dark:border-[#27272A] bg-[#18181B] dark:bg-[#18181B] text-[#FAFAFA] light:bg-white light:border-[#E4E4E7] light:text-[#09090B] shadow-2xl p-5 sm:p-8 backdrop-blur-xl transition-colors duration-300 relative overflow-hidden"
      >
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <InboxIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white dark:text-white light:text-zinc-900">
                  Inbox
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 dark:text-purple-300 light:bg-purple-100 light:text-purple-700 font-mono">
                  {unreadCount} unread
                </span>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-0.5">
                Incoming messages appear automatically in real time
              </p>
            </div>
          </div>

          {/* Right Controls: Auto-refresh Toggle & Manual Refresh Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Refresh Toggle */}
            <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={handleToggleAutoRefresh}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600 relative" />
              <span className="text-xs font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                Auto-refresh (10s)
              </span>
            </label>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:border-purple-500/50 hover:text-purple-400 flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <motion.div
                animate={{
                  rotate: loading ? 360 : autoRefresh ? 360 : 0,
                }}
                transition={{
                  repeat: loading ? Infinity : autoRefresh ? Infinity : 0,
                  duration: loading ? 0.8 : 12,
                  ease: 'linear',
                }}
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              </motion.div>
              <span>{loading ? 'Checking...' : 'Refresh'}</span>
            </motion.button>
          </div>
        </div>

        {/* Search bar when inbox has multiple items */}
        {inbox.length > 2 && (
          <div className="pt-4 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sender, subject, or OTP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>
          </div>
        )}

        {/* Email List or Empty State */}
        <div className="mt-4">
          {inbox.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-20 h-20 rounded-3xl bg-purple-500/10 dark:bg-purple-500/10 light:bg-purple-100 border border-purple-500/20 flex items-center justify-center text-purple-400 dark:text-purple-400 light:text-purple-600 mb-4 shadow-xl shadow-purple-500/10"
              >
                <Mail className="w-10 h-10" />
              </motion.div>

              <h4 className="font-display text-lg font-bold text-white dark:text-white light:text-zinc-900">
                Inbox is active &amp; waiting
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 max-w-md mt-1.5 leading-relaxed">
                Copy your temporary email above and use it on any website, app, or service. When they send a verification code, OTP, or link, it will appear here automatically!
              </p>

              {/* Animated Waiting Dots */}
              <div className="flex items-center gap-1.5 my-4">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-purple-500"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-purple-400"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-indigo-400"
                />
              </div>

              {/* Manual Optional Test Tool */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSendTestEmail}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-purple-400" />
                <span>Test with Simulated Email</span>
              </motion.button>
            </div>
          ) : (
            /* Email List Rows */
            <div className="divide-y divide-zinc-800/80 dark:divide-zinc-800/80 light:divide-zinc-200/80 border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80 rounded-2xl overflow-hidden bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white shadow-sm">
              {filteredInbox.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No emails match "{searchQuery}"
                </div>
              ) : (
                filteredInbox.map((email) => (
                  <motion.div
                    key={email.id}
                    whileHover={{ x: 2 }}
                    onClick={() => onSelectEmail(email)}
                    className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 cursor-pointer transition-colors ${
                      !email.read
                        ? 'bg-purple-950/25 dark:bg-purple-950/25 light:bg-purple-50/60 hover:bg-purple-900/35'
                        : 'hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50 light:hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Unread / Read Indicator */}
                      <div className="shrink-0">
                        {!email.read ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/60 dark:bg-zinc-700/60 light:bg-zinc-300" />
                        )}
                      </div>

                      {/* Sender & Subject info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm truncate ${
                              !email.read
                                ? 'font-bold text-white dark:text-white light:text-zinc-900'
                                : 'font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700'
                            }`}
                          >
                            {email.senderName}
                          </span>
                          <span className="text-xs text-zinc-500 hidden sm:inline truncate font-mono">
                            &lt;{email.from}&gt;
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs truncate ${
                              !email.read
                                ? 'text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-medium'
                                : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-500'
                            }`}
                          >
                            {email.subject}
                          </span>
                        </div>
                      </div>

                      {/* Detected OTP preview badge in row */}
                      {email.otp && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 dark:text-purple-300 light:bg-purple-100 light:text-purple-700 border border-purple-500/30 text-xs font-mono font-bold shrink-0">
                          <KeyRound className="w-3 h-3 text-purple-400" />
                          <span>OTP: {email.otp}</span>
                        </div>
                      )}
                    </div>

                    {/* Right side: Time Ago + Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {email.createdAt}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Row: Delete All Button */}
        {inbox.length > 0 && (
          <div className="mt-5 pt-4 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              Showing {filteredInbox.length} of {inbox.length} messages
            </span>

            <button
              onClick={() => setShowConfirmDeleteAll(true)}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Mails</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDeleteAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-100 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Delete All Emails?</h3>
              <p className="text-sm text-zinc-400 mt-2">
                This will delete all {inbox.length} messages received in this inbox. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmDeleteAll(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteAll}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-colors"
                >
                  Yes, Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
