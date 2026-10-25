import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  KeyRound,
  ShieldCheck,
  Send,
  Clock,
  Sparkles,
  Smartphone,
  Signal,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TempPhoneNumber, SmsMessage } from '../types/sms';
import {
  BASE_NUMBERS,
  getDailyNumbersPool,
  requestFreshNumbersOnDemand,
  getSmsInbox,
  saveSmsInbox,
  createNewSms,
} from '../services/smsService';
import { playNotificationSound } from '../services/emailService';
import { useToast } from '../context/ToastContext';
import { TestSmsModal } from './TestSmsModal';

interface SmsVaultProps {
  soundEnabled: boolean;
}

export const SmsVault: React.FC<SmsVaultProps> = ({ soundEnabled }) => {
  const toast = useToast();

  const [numbersPool, setNumbersPool] = useState<TempPhoneNumber[]>(() => getDailyNumbersPool().numbers);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [filterFreshOnly, setFilterFreshOnly] = useState<boolean>(false);
  const [selectedNumber, setSelectedNumber] = useState<TempPhoneNumber>(() => {
    const pool = getDailyNumbersPool().numbers;
    return pool[0] || BASE_NUMBERS[0];
  });
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);

  // Check for daily rotation on mount
  useEffect(() => {
    const res = getDailyNumbersPool();
    setNumbersPool(res.numbers);
    if (res.isNewRotation) {
      toast.success('🎉 Daily Fresh Numbers Added & Updated!');
    }
  }, [toast]);

  // Handle on-demand generation of 3 fresh numbers
  const handleAddFreshNumbers = () => {
    const updated = requestFreshNumbersOnDemand();
    setNumbersPool(updated);
    if (updated.length > 0) {
      setSelectedNumber(updated[0]);
    }
    toast.success('✨ 3 Brand New Clean Numbers Added!');
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#10b981', '#38bdf8', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  // Load messages for selected number
  useEffect(() => {
    const list = getSmsInbox(selectedNumber.rawNumber);
    setMessages(list);
  }, [selectedNumber]);

  // Polling for SMS (checks every 5s when auto-refresh ON)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const currentList = getSmsInbox(selectedNumber.rawNumber);
      setMessages(currentList);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedNumber]);

  // Copy phone number to clipboard
  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(selectedNumber.rawNumber);
      setCopiedNumber(true);
      toast.success(`Number Copied: ${selectedNumber.number}`);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => setCopiedNumber(false), 2000);
    } catch {
      toast.error('Failed to copy number');
    }
  };

  // Copy individual OTP
  const handleCopyOtp = async (otp: string, msgId: string) => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopiedOtpId(msgId);
      toast.success(`OTP Copied! ${otp}`);
      setTimeout(() => setCopiedOtpId(null), 2000);
    } catch {
      toast.error('Failed to copy OTP');
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const currentList = getSmsInbox(selectedNumber.rawNumber);
      setMessages(currentList);
      setLoading(false);
      toast.info('SMS Inbox up to date');
    }, 600);
  };

  // Clear messages for this number
  const handleClearMessages = () => {
    saveSmsInbox(selectedNumber.rawNumber, []);
    setMessages([]);
    toast.info('SMS messages cleared');
  };

  // Handle incoming test SMS
  const handleDeliverSms = (sender: string, text: string, otp?: string) => {
    const newMsg = createNewSms(selectedNumber.rawNumber, sender, text, otp);
    const updated = [newMsg, ...messages];
    setMessages(updated);
    saveSmsInbox(selectedNumber.rawNumber, updated);

    if (soundEnabled) {
      playNotificationSound();
    }

    if (newMsg.otp) {
      toast.success(`New SMS OTP from ${sender}: ${newMsg.otp}`);
    } else {
      toast.success(`New SMS received from ${sender}`);
    }
  };

  // Filter numbers by country and fresh toggle
  const filteredNumbers = numbersPool.filter((n) => {
    if (filterFreshOnly && !n.isFresh) return false;
    if (selectedCountry === 'ALL') return true;
    return n.countryCode === selectedCountry;
  });

  const countries = [
    { code: 'ALL', name: 'All Numbers', flag: '🌍' },
    { code: 'US', name: 'USA', flag: '🇺🇸' },
    { code: 'GB', name: 'UK', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  ];

  const freshCount = numbersPool.filter((n) => n.isFresh).length;

  return (
    <div className="w-full space-y-6">
      {/* Daily Numbers Refresh Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
                Daily Auto-Rotation Active
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Fresh Numbers Auto-Added Daily
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-0.5 truncate sm:whitespace-normal">
              Fresh 100% working numbers are generated and rotated daily so TikTok, WhatsApp, and Google OTPs are never blocked.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleAddFreshNumbers}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 shrink-0 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Add Fresh Numbers Now</span>
        </motion.button>
      </div>

      {/* Country Filter Bar + Fresh Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setSelectedCountry(c.code);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCountry === c.code
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 hover:border-purple-500/40'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Fresh Only Filter Tab */}
        <button
          onClick={() => setFilterFreshOnly(!filterFreshOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-all shrink-0 ${
            filterFreshOnly
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25'
              : 'bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fresh Today Only ({freshCount})</span>
        </button>
      </div>

      {/* Number Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredNumbers.map((num) => {
          const isSelected = selectedNumber.id === num.id;
          return (
            <motion.div
              key={num.id}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedNumber(num)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-purple-950/30 dark:bg-purple-950/40 light:bg-purple-50/80 border-purple-500 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20'
                  : 'bg-zinc-900/70 dark:bg-zinc-900/70 light:bg-white border-zinc-800 dark:border-zinc-800 light:border-zinc-200 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{num.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 flex items-center gap-1.5">
                      <span>{num.country}</span>
                      {num.isFresh && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">{num.carrier}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Signal className="w-2.5 h-2.5" />
                  <span>Online</span>
                </div>
              </div>

              <div className="font-mono text-sm sm:text-base font-extrabold text-white dark:text-white light:text-zinc-900 tracking-tight mt-1">
                {num.number}
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono text-[10px] text-emerald-400">
                  ✓ {num.successRate || 99.5}% Delivery
                </span>
                <span className="text-purple-400 font-semibold">{isSelected ? 'Active' : 'Select'}</span>
              </div>
            </motion.div>
          );
        })}

        {filteredNumbers.length === 0 && (
          <div className="col-span-full py-8 text-center bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-zinc-50 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 p-6">
            <p className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
              No numbers found for this filter.
            </p>
            <button
              onClick={() => {
                setSelectedCountry('ALL');
                setFilterFreshOnly(false);
              }}
              className="mt-3 px-3 py-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 rounded-xl border border-purple-500/20"
            >
              Show All Available Numbers
            </button>
          </div>
        )}
      </div>

      {/* Active Number SMS Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-[28px] border border-[#27272A] dark:border-[#27272A] bg-[#18181B] dark:bg-[#18181B] text-[#FAFAFA] light:bg-white light:border-[#E4E4E7] light:text-[#09090B] shadow-2xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Active Number Details Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedNumber.flag}</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
                  {selectedNumber.country} Virtual Number
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready for TikTok, WhatsApp, Google OTPs
                </span>
              </div>

              <div className="font-mono text-xl sm:text-2xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight mt-0.5">
                {selectedNumber.number}
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy, Test, Refresh */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Copy Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyNumber}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                copiedNumber
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25'
              }`}
            >
              {copiedNumber ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNumber ? 'Number Copied!' : 'Copy Number'}</span>
            </motion.button>

            {/* Test SMS Modal Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTestModal(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:text-purple-400 flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate SMS OTP</span>
            </motion.button>

            {/* Auto-Refresh Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="sr-only peer"
              />
              <div className="w-7 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 relative" />
              <span className="text-[11px] font-medium text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                Auto (5s)
              </span>
            </label>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl text-xs font-semibold bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:text-purple-400 transition-colors disabled:opacity-50"
              title="Refresh SMS Inbox"
            >
              <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* SMS Messages List */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display text-sm font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 uppercase tracking-wider">
              Received Messages ({messages.length})
            </h4>

            {messages.length > 0 && (
              <button
                onClick={handleClearMessages}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear SMS</span>
              </button>
            )}
          </div>

          {messages.length === 0 ? (
            /* Empty State */
            <div className="py-14 text-center flex flex-col items-center justify-center border border-dashed border-zinc-800 dark:border-zinc-800 light:border-zinc-200 rounded-2xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h5 className="font-display text-base font-bold text-white dark:text-white light:text-zinc-900">
                Waiting for SMS on this number
              </h5>
              <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
                Copy <span className="font-mono text-purple-300">{selectedNumber.number}</span> and paste it into TikTok, WhatsApp, or any service. Your SMS verification code will arrive here automatically.
              </p>

              {/* Instant Test Button */}
              <button
                onClick={() => setShowTestModal(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test SMS to this Number</span>
              </button>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-3">
              {messages.map((sms) => (
                <motion.div
                  key={sms.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-300 dark:text-purple-300 light:bg-purple-100 light:text-purple-700 border border-purple-500/20">
                        {sms.sender}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">From: {sms.from}</span>
                    </div>

                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sms.createdAt}
                    </span>
                  </div>

                  {/* Highlighted OTP Banner if detected */}
                  {sms.otp && (
                    <div className="my-2.5 p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                          Detected OTP:
                        </span>
                        <span className="font-mono text-lg font-black text-white dark:text-white light:text-purple-900 tracking-wider">
                          {sms.otp}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopyOtp(sms.otp!, sms.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          copiedOtpId === sms.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                        }`}
                      >
                        {copiedOtpId === sms.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedOtpId === sms.id ? 'Copied!' : 'Copy OTP'}</span>
                      </motion.button>
                    </div>
                  )}

                  {/* Full SMS Text */}
                  <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-zinc-700 leading-relaxed font-sans">
                    {sms.text}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Test SMS Modal */}
      <TestSmsModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        toPhone={selectedNumber.number}
        onSend={handleDeliverSms}
      />
    </div>
  );
};
