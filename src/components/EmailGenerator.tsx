import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Sparkles,
  QrCode,
  Send,
  AlertTriangle,
  AtSign,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupportedDomain, DEFAULT_DOMAINS } from '../types';
import { useToast } from '../context/ToastContext';

interface EmailGeneratorProps {
  currentEmail: string;
  selectedDomain: SupportedDomain;
  setSelectedDomain: (domain: SupportedDomain) => void;
  availableDomains?: string[];
  onGenerateNew: () => void;
  onDeleteEmail: () => void;
  onCreateCustom: (customUsername: string) => void;
  onSendTestEmail: () => void;
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({
  currentEmail,
  selectedDomain,
  setSelectedDomain,
  availableDomains = DEFAULT_DOMAINS as unknown as string[],
  onGenerateNew,
  onDeleteEmail,
  onCreateCustom,
  onSendTestEmail,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [confettiBurst, setConfettiBurst] = useState(false);
  const copyBtnRef = useRef<HTMLButtonElement>(null);

  // Trigger copy email + confetti
  const handleCopyEmail = async () => {
    if (!currentEmail) return;
    try {
      await navigator.clipboard.writeText(currentEmail);
      setCopied(true);
      toast.success('Email Copied!');

      // Trigger confetti particles
      setConfettiBurst(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#7c3aed', '#a855f7', '#38bdf8', '#f59e0b'],
        });
      } catch {
        // Fallback to motion dots
      }

      setTimeout(() => {
        setCopied(false);
        setConfettiBurst(false);
      }, 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Handle Domain Change
  const handleDomainChange = (newDomain: SupportedDomain) => {
    setSelectedDomain(newDomain);
    toast.info(`Domain changed to @${newDomain}`);
  };

  // Handle Custom Username Submit
  const handleCreateCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customUsername.trim().toLowerCase().replace(/\s+/g, '.');
    if (!clean) {
      toast.error('Please enter username');
      return;
    }
    onCreateCustom(clean);
    setCustomUsername('');
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDeleteEmail();
  };

  const previewUsername = customUsername.trim().toLowerCase().replace(/\s+/g, '.') || 'username';

  return (
    <section id="generator" className="relative w-full py-6 sm:py-10">
      {/* 3D Tilt Main Card */}
      <motion.div
        whileHover={{
          rotateX: 2,
          rotateY: -2,
          scale: 1.01,
          transition: { duration: 0.25 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full rounded-[28px] border border-[#27272A] dark:border-[#27272A] bg-[#18181B] dark:bg-[#18181B] text-[#FAFAFA] light:bg-white light:border-[#E4E4E7] light:text-[#09090B] shadow-2xl p-6 sm:p-8 backdrop-blur-xl transition-colors duration-300 relative overflow-hidden"
      >
        {/* Subtle Ambient Card Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Header row in card */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80 pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-purple-400 dark:text-purple-400 light:text-purple-600">
                Your Temporary Address
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white light:text-zinc-900 mt-0.5">
                Instant Disposable Inbox
              </h2>
            </div>

            {/* Quick Actions & Demo Tester */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-700/80 dark:border-zinc-800 bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 light:border-zinc-300 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-purple-400 dark:hover:text-purple-400 flex items-center gap-1.5 transition-colors"
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR Code</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSendTestEmail}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 text-purple-300 dark:text-purple-300 light:bg-purple-100 light:text-purple-700 border border-purple-500/30 hover:bg-purple-600/30 flex items-center gap-1.5 transition-colors"
                title="Send simulated verification email right now"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Mail</span>
              </motion.button>
            </div>
          </div>

          {/* Large Email Display Box */}
          <div className="relative group">
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-inner transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1 px-1">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <AtSign className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 uppercase tracking-wider font-semibold">
                    Current Active Email
                  </div>
                  <div
                    tabIndex={0}
                    onClick={handleCopyEmail}
                    title="Click to copy"
                    className="font-mono text-base sm:text-2xl font-bold tracking-tight text-white dark:text-white light:text-zinc-900 truncate cursor-pointer hover:text-purple-400 dark:hover:text-purple-300 transition-colors select-all"
                  >
                    {currentEmail || 'Generating address...'}
                  </div>
                </div>
              </div>

              {/* Primary Copy Button with Burst Effect */}
              <div className="relative shrink-0 flex items-center gap-2">
                <motion.button
                  ref={copyBtnRef}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopyEmail}
                  className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Email</span>
                    </>
                  )}
                </motion.button>

                {/* Framer Motion Confetti Burst Dots */}
                <AnimatePresence>
                  {confettiBurst && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {Array.from({ length: 15 }).map((_, i) => {
                        const randomX = (Math.random() - 0.5) * 160;
                        const randomY = -40 - Math.random() * 80;
                        const colors = ['#7c3aed', '#a855f7', '#38bdf8', '#34d399', '#f59e0b'];
                        return (
                          <motion.span
                            key={i}
                            initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                            animate={{ y: randomY, x: randomX, opacity: 0, scale: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="absolute w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: colors[i % colors.length] }}
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Live MX Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-2">
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live MX Verified · Active for TikTok, Google, Discord &amp; OTPs</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {currentEmail.includes('@maxxspace.com') ? '✓ Live MX DNS Online' : ''}
              </span>
            </div>
          </div>

          {/* Action Row: Change Email & Delete Email */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Button 2: Change / New Email */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGenerateNew}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-700/80 dark:border-zinc-700/80 bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:border-purple-500/50 hover:text-purple-400 dark:hover:text-purple-400 flex items-center gap-2 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>Change / New Email</span>
              </motion.button>

              {/* Button 3: Delete Email */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-900/40 dark:border-rose-900/40 bg-rose-950/20 dark:bg-rose-950/30 light:bg-rose-50 light:border-rose-200 text-rose-400 dark:text-rose-400 light:text-rose-600 hover:bg-rose-900/30 flex items-center gap-2 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Email</span>
              </motion.button>
            </div>

            {/* Quick Domain Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">Active Domain:</span>
              <div className="relative">
                <select
                  aria-label="Active domain"
                  value={selectedDomain}
                  onChange={(e) => handleDomainChange(e.target.value as SupportedDomain)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-mono font-medium border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 bg-zinc-900 dark:bg-zinc-900 light:bg-white text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
                >
                  {availableDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      @{domain}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Custom Username Input Section */}
          <div className="pt-5 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200/80">
            <label htmlFor="custom-email-input" className="block text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mb-2">
              Create Custom Email
            </label>

            <form onSubmit={handleCreateCustom} className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1 flex items-center">
                <input
                  id="custom-email-input"
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="Enter custom username (e.g. alex.dev)"
                  className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base font-mono transition-colors"
                />
              </div>

              {/* Domain Dropdown for Custom Email */}
              <div className="relative shrink-0">
                <select
                  aria-label="Custom email domain"
                  value={selectedDomain}
                  onChange={(e) => handleDomainChange(e.target.value as SupportedDomain)}
                  className="w-full sm:w-auto appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 text-base font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {availableDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      @{domain}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Create Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 shrink-0 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create</span>
              </motion.button>
            </form>

            {/* Live Preview */}
            {customUsername && (
              <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                <span>Preview:</span>
                <span className="text-purple-400 font-medium">
                  {previewUsername}@{selectedDomain}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-100 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Delete Email & All Inbox?</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Are you sure? This will delete <strong className="text-zinc-200 font-mono">{currentEmail}</strong> and all received messages permanently. A fresh address will be generated.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-colors"
                >
                  Yes, Delete Email
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-100 shadow-2xl text-center"
            >
              <h3 className="font-display text-lg font-bold text-white">Scan to Copy Address</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-4">Scan with your smartphone camera to quickly copy this email</p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    currentEmail
                  )}`}
                  alt={`QR code for ${currentEmail}`}
                  width={180}
                  height={180}
                  className="w-44 h-44 rounded-lg"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-xs font-mono text-purple-300 truncate mb-4 select-all">
                {currentEmail}
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
