import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, KeyRound, MessageSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface TestSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  toPhone: string;
  onSend: (sender: string, text: string, otp?: string) => void;
}

export const TestSmsModal: React.FC<TestSmsModalProps> = ({
  isOpen,
  onClose,
  toPhone,
  onSend,
}) => {
  const toast = useToast();

  const presets = [
    {
      title: 'TikTok OTP',
      sender: 'TikTok',
      text: '[TikTok] Your verification code is 849201. Valid for 5 minutes. Never share this with anyone.',
      otp: '849201',
    },
    {
      title: 'WhatsApp Code',
      sender: 'WhatsApp',
      text: 'Your WhatsApp code: 492-108. You can also tap this link to verify your phone number.',
      otp: '492108',
    },
    {
      title: 'Telegram PIN',
      sender: 'Telegram',
      text: 'Telegram code: 73918. Do not give this code to anyone, even if they say they are from Telegram.',
      otp: '73918',
    },
    {
      title: 'Google Auth',
      sender: 'Google',
      text: 'G-619284 is your Google verification code. Do not share your code with anyone.',
      otp: '619284',
    },
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customSender, setCustomSender] = useState(presets[0].sender);
  const [customText, setCustomText] = useState(presets[0].text);
  const [customOtp, setCustomOtp] = useState(presets[0].otp);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = presets[idx];
    setCustomSender(p.sender);
    setCustomText(p.text);
    setCustomOtp(p.otp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSender || !customText) {
      toast.error('Please enter sender and SMS text');
      return;
    }

    onSend(customSender, customText, customOtp || undefined);
    toast.success(`SMS delivered to ${toPhone}`);
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
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Simulate Incoming SMS</h3>
                <p className="text-xs text-zinc-400">Test real-time phone OTP delivery and extraction</p>
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
              Choose Quick Platform Preset
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Target Phone Number
              </label>
              <input
                type="text"
                disabled
                value={toPhone}
                className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Sender Name</label>
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
                    placeholder="e.g. 849201"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-100 font-mono text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">SMS Message Body</label>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
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
                <span>Deliver SMS to Inbox</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
