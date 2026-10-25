import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { ThreeBackground } from './components/ThreeBackground';
import { EmailGenerator } from './components/EmailGenerator';
import { Inbox } from './components/Inbox';
import { EmailModal } from './components/EmailModal';
import { TestEmailModal } from './components/TestEmailModal';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './context/ToastContext';
import {
  EmailMessage,
  SupportedDomain,
  DEFAULT_DOMAINS,
} from './types';
import {
  generateRandomUsername,
  getLiveDomains,
  setupRealAccount,
  fetchLiveEmails,
  deleteLiveMessage,
  getSavedEmail,
  saveEmail,
  getSavedInbox,
  saveInbox,
  clearInboxStorage,
  getSavedAccountSession,
  playNotificationSound,
  createManualTestEmail,
  AccountSession,
} from './services/emailService';

function MainApp() {
  const toast = useToast();

  // Dark / Light Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    } catch {
      // fallback
    }
    return true; // default dark
  });

  // Sound chime state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tmv_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Live Domains from server
  const [availableDomains, setAvailableDomains] = useState<string[]>([...DEFAULT_DOMAINS]);
  const [selectedDomain, setSelectedDomain] = useState<SupportedDomain>('maxxspace.com');

  // Active email & account session
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [accountSession, setAccountSession] = useState<AccountSession | null>(() => getSavedAccountSession());

  // Inbox & Polling state
  const [inbox, setInbox] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tmv_auto_refresh') !== 'false';
    } catch {
      return true;
    }
  });

  // Modals
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);

  // Sync theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // 1. Initialize real domains and mailbox on mount
  useEffect(() => {
    let isMounted = true;

    async function initMailbox() {
      // Fetch active domains from real mail server
      const liveDomains = await getLiveDomains();
      if (isMounted) {
        setAvailableDomains(liveDomains);
      }

      const defaultDomain = liveDomains[0] || 'maxxspace.com';
      const saved = getSavedEmail();

      let targetEmail = saved;
      if (!targetEmail || !targetEmail.includes('@')) {
        const username = generateRandomUsername();
        targetEmail = `${username}@${defaultDomain}`;
      }

      const domainPart = targetEmail.split('@')[1];
      if (isMounted) {
        setCurrentEmail(targetEmail);
        setSelectedDomain(domainPart);
        saveEmail(targetEmail);
      }

      // Load saved inbox for this email (starts empty if new)
      const savedInbox = getSavedInbox(targetEmail);
      if (isMounted) {
        setInbox(savedInbox);
      }

      // Initialize real session on mail server
      const session = await setupRealAccount(targetEmail);
      if (isMounted) {
        setAccountSession(session);

        // Immediate check for any existing real messages
        if (session.token) {
          const remoteMessages = await fetchLiveEmails(session.token, targetEmail);
          if (remoteMessages.length > 0 && isMounted) {
            setInbox(remoteMessages);
            saveInbox(targetEmail, remoteMessages);
          }
        }
      }
    }

    initMailbox();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save inbox locally whenever it changes
  useEffect(() => {
    if (currentEmail) {
      saveInbox(currentEmail, inbox);
    }
  }, [inbox, currentEmail]);

  // Keep ref for polling to avoid stale closures
  const sessionRef = useRef(accountSession);
  sessionRef.current = accountSession;

  const currentEmailRef = useRef(currentEmail);
  currentEmailRef.current = currentEmail;

  const inboxRef = useRef(inbox);
  inboxRef.current = inbox;

  // Poll for REAL incoming emails (only real emails from external services)
  const checkLiveInbox = useCallback(
    async (isManual = false) => {
      const session = sessionRef.current;
      const email = currentEmailRef.current;
      if (!session?.token || !email) {
        if (isManual) {
          toast.info('Inbox up to date · Waiting for emails');
        }
        return;
      }

      try {
        const remoteMessages = await fetchLiveEmails(session.token, email);

        // Check if there are new messages not yet in state
        const existingIds = new Set(inboxRef.current.map((m) => m.id));
        const newArrivals = remoteMessages.filter((m) => !existingIds.has(m.id));

        if (newArrivals.length > 0) {
          // Play sound
          if (soundEnabled) {
            playNotificationSound();
          }

          // Merge and update
          setInbox(remoteMessages);
          saveInbox(email, remoteMessages);

          // Toast alert for the new real email
          const firstNew = newArrivals[0];
          if (firstNew.otp) {
            toast.success(`Code Received from ${firstNew.senderName}: ${firstNew.otp}`);
          } else {
            toast.success(`New email from ${firstNew.senderName}!`);
          }
        } else if (isManual) {
          toast.info('Inbox up to date · Waiting for emails');
        }
      } catch (e) {
        console.error('Check error', e);
      }
    },
    [soundEnabled, toast]
  );

  // Background poller: runs every 6 seconds when auto-refresh is ON
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkLiveInbox(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoRefresh, checkLiveInbox]);

  // Handle Domain Change
  const handleDomainChange = async (newDomain: SupportedDomain) => {
    setSelectedDomain(newDomain);
    if (currentEmail) {
      const username = currentEmail.split('@')[0];
      const updatedEmail = `${username}@${newDomain}`;
      setCurrentEmail(updatedEmail);
      saveEmail(updatedEmail);
      setInbox([]);

      // Create new live account session
      const session = await setupRealAccount(updatedEmail);
      setAccountSession(session);
      toast.info(`Switched to @${newDomain}`);
    }
  };

  // Button 2: Generate New Random Email
  const handleGenerateNew = async () => {
    setLoading(true);
    const newUsername = `${Math.random().toString(36).substring(2, 8)}${Math.floor(
      Math.random() * 100
    )}`;
    const newEmail = `${newUsername}@${selectedDomain}`;
    setCurrentEmail(newEmail);
    saveEmail(newEmail);
    setInbox([]);

    const session = await setupRealAccount(newEmail);
    setAccountSession(session);
    setLoading(false);
    toast.success('New Real Email Ready!');
  };

  // Button 3: Delete Email
  const handleDeleteEmail = async () => {
    if (currentEmail) {
      clearInboxStorage(currentEmail);
    }
    setInbox([]);
    setCurrentEmail('');
    setAccountSession(null);
    toast.info('Email Deleted');

    // Auto-generate fresh email after 0.5s
    setTimeout(async () => {
      const newUsername = generateRandomUsername();
      const newEmail = `${newUsername}@${selectedDomain}`;
      setCurrentEmail(newEmail);
      saveEmail(newEmail);
      const session = await setupRealAccount(newEmail);
      setAccountSession(session);
      toast.success('Fresh email ready!');
    }, 500);
  };

  // Create Custom Username Email
  const handleCreateCustom = async (customUsername: string) => {
    setLoading(true);
    const customEmail = `${customUsername}@${selectedDomain}`;
    setCurrentEmail(customEmail);
    saveEmail(customEmail);
    setInbox([]);

    const session = await setupRealAccount(customEmail);
    setAccountSession(session);
    setLoading(false);
    toast.success(`Custom email ready: ${customEmail}`);
  };

  // Manual Refresh Handler
  const handleRefresh = async () => {
    setLoading(true);
    await checkLiveInbox(true);
    setLoading(false);
  };

  // Delete single message
  const handleDeleteSingleMessage = async (messageId: string) => {
    setInbox((prev) => prev.filter((m) => m.id !== messageId));
    if (accountSession?.token) {
      await deleteLiveMessage(accountSession.token, messageId);
    }
  };

  // Delete all messages
  const handleDeleteAllMessages = () => {
    setInbox([]);
    if (currentEmail) {
      clearInboxStorage(currentEmail);
    }
    toast.info('All mails deleted');
  };

  // Open modal & mark as read
  const handleSelectEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
    setInbox((prev) =>
      prev.map((m) => (m.id === email.id ? { ...m, read: true } : m))
    );
  };

  // Manual optional test sender (only triggered when user explicitly clicks "Test with Simulated Email")
  const handleManualTestEmail = (customPreset: { sender: string; subject: string; body: string; otp?: string }) => {
    if (!currentEmail) return;
    const testMsg = createManualTestEmail(currentEmail, customPreset);
    setInbox((prev) => [testMsg, ...prev]);

    if (soundEnabled) {
      playNotificationSound();
    }

    if (testMsg.otp) {
      toast.success(`Test Code: ${testMsg.otp}`);
    } else {
      toast.success(`Test email received from ${testMsg.senderName}`);
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-300 ${
        isDark ? 'bg-[#0A0A0B] text-[#FAFAFA]' : 'bg-[#FAFAF8] text-[#09090B]'
      }`}
    >
      {/* 3D Background with Canvas & Ambient Gradient Orbs */}
      <ThreeBackground isDark={isDark} />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          isDark={isDark}
          setIsDark={setIsDark}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

        {/* Page Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Hero Presentation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real Live Inbox · Ready to Receive Verification Codes</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1] text-balance">
              TempMail<span className="text-purple-600 dark:text-purple-400">Vault</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-3 max-w-xl mx-auto leading-relaxed text-balance">
              Paste this disposable address anywhere you need an OTP or email confirmation. Only real emails sent to your address will appear in your inbox.
            </p>
          </motion.div>

          {/* Staggered Children: Generator Card & Inbox */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="flex flex-col gap-6"
          >
            {/* Email Generator Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <EmailGenerator
                currentEmail={currentEmail}
                selectedDomain={selectedDomain}
                setSelectedDomain={handleDomainChange}
                availableDomains={availableDomains}
                onGenerateNew={handleGenerateNew}
                onDeleteEmail={handleDeleteEmail}
                onCreateCustom={handleCreateCustom}
                onSendTestEmail={() => setShowTestModal(true)}
              />
            </motion.div>

            {/* Inbox Section */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <Inbox
                inbox={inbox}
                loading={loading}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                onRefresh={handleRefresh}
                onSelectEmail={handleSelectEmail}
                onDeleteAll={handleDeleteAllMessages}
                onSendTestEmail={() => setShowTestModal(true)}
              />
            </motion.div>

            {/* How It Works Section */}
            <HowItWorks />

            {/* FAQ Accordion Section */}
            <FAQ />
          </motion.div>
        </main>

        {/* Footer with Legal Notice */}
        <Footer />
      </div>

      {/* Email Reader Modal */}
      <EmailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
        onDeleteMessage={handleDeleteSingleMessage}
      />

      {/* Manual Test Email Sender Modal */}
      <TestEmailModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        toEmail={currentEmail}
        onSend={handleManualTestEmail}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
