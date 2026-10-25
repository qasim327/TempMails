import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Trash2,
  KeyRound,
  Calendar,
  User,
  Mail,
  Printer,
  Code,
  Eye,
} from 'lucide-react';
import { EmailMessage } from '../types';
import { useToast } from '../context/ToastContext';

interface EmailModalProps {
  email: EmailMessage | null;
  onClose: () => void;
  onDeleteMessage: (id: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ email, onClose, onDeleteMessage }) => {
  const toast = useToast();
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!email) return null;

  const handleCopyOtp = async () => {
    if (!email.otp) return;
    try {
      await navigator.clipboard.writeText(email.otp);
      setCopiedOtp(true);
      toast.success(`OTP Copied! ${email.otp}`);
      setTimeout(() => setCopiedOtp(false), 2000);
    } catch {
      toast.error('Failed to copy OTP');
    }
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(email.body);
      setCopiedBody(true);
      toast.success('Email text copied');
      setTimeout(() => setCopiedBody(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = () => {
    onDeleteMessage(email.id);
    toast.info('Email deleted');
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[85vh] rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100"
        >
          {/* Top Bar Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="font-semibold text-purple-600 dark:text-purple-400">Incoming Message</span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {email.createdAt}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-900 dark:text-white break-words">
                {email.subject}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>From:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                    {email.senderName} &lt;{email.from}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>To:</span>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400">{email.toEmail}</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Prominent OTP Banner if detected */}
            {email.otp && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/15 to-indigo-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/25 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400">
                      Detected Verification Code / OTP
                    </span>
                    <div className="font-mono text-2xl font-extrabold tracking-wider text-purple-700 dark:text-purple-300">
                      {email.otp}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyOtp}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                    copiedOtp
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {copiedOtp ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy OTP</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* View Mode Toggle: Formatted vs Plain */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Message Content
              </span>
              <button
                onClick={() => setViewRaw(!viewRaw)}
                className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                {viewRaw ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                <span>{viewRaw ? 'View Formatted HTML' : 'View Plain Text'}</span>
              </button>
            </div>

            {/* Message Content View */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-[160px]">
              {viewRaw ? (
                <pre className="font-mono text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed select-text">
                  {email.body}
                </pre>
              ) : email.htmlBody ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 font-sans"
                  dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                />
              ) : (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {email.body}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBody}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBody ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Mail</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
