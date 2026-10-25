import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, KeyRound, MailCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail: string;
  onSend: (preset: { sender: string; subject: string; body: string; otp?: string }) => void;
}

export const TestEmailModal: React.FC<TestEmailModalProps> = ({
  isOpen,
  onClose,
  toEmail,
  onSend,
}) => {
  const toast = useToast();

  const presets = [
    {
      title: 'Google Verification',
      sender: 'security@accounts.google.com',
      subject: 'Google Verification Code: 489201',
      body: 'Hi there,\n\nUse verification code 489201 to verify your identity and finish signing in to your account. This code is valid for 10 minutes.',
      otp: '489201',
    },
    {
      title: 'Discord Security PIN',
      sender: 'auth@discord.com',
      subject: 'Your Discord Login Security PIN: 739184',
      body: 'Hey!\n\nHere is your single-use Discord authentication pin: 739184.\n\nEnter it inside the app to confirm your login session.',
      otp: '739184',
    },
    {
      title: 'GitHub 2FA Token',
      sender: 'no-reply@github.com',
      subject: 'GitHub Device Verification Code [628491]',
      body: 'Someone recently attempted to sign in to your GitHub account.\n\nPlease enter the verification code: 628491.\n\nSecurity tip: Never share this code with anyone.',
      otp: '628491',
    },
    {
      title: 'Amazon OTP Code',
      sender: 'orders@amazon.com',
      subject: 'Amazon Verification Passcode: 310572',
      body: 'Dear Customer,\n\nTo access your order details securely, please verify your temporary passcode: 310572.',
      otp: '310572',
    },
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customSender, setCustomSender] = useState(presets[0].sender);
  const [customSubject, setCustomSubject] = useState(presets[0].subject);
  const [customBody, setCustomBody] = useState(presets[0].body);
  const [customOtp, setCustomOtp] = useState(presets[0].otp);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = presets[idx];
    setCustomSender(p.sender);
    setCustomSubject(p.subject);
    setCustomBody(p.body);
    setCustomOtp(p.otp);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubject || !customBody) {
      toast.error('Please enter subject and body');
      return;
    }

    onSend({
      sender: customSender,
      subject: customSubject,
      body: customBody,
      otp: customOtp || undefined,
    });

    toast.success(`Simulated email sent to ${toEmail}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-xl rounded-[24px] bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Simulate Incoming Email</h3>
                <p className="text-xs text-zinc-400">Test real-time delivery and OTP auto-detection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="py-4">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Choose Quick Preset
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                    selectedPresetIndex === idx
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-bold truncate">{preset.title}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">OTP: {preset.otp}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Recipient (Your Active Address)
              </label>
              <input
                type="text"
                disabled
                value={toEmail}
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Sender Email</label>
                <input
                  type="text"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 font-mono text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Custom OTP Code (optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customOtp}
                    onChange={(e) => setCustomOtp(e.target.value)}
                    placeholder="e.g. 582910"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 font-mono text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Subject</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Message Body</label>
              <textarea
                rows={3}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-sans"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Deliver to Inbox</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
