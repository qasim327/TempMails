import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Why does TempMailVault NOT use @gmail.com domains?',
      answer:
        'The @gmail.com domain is owned by Google LLC. Legitimate, programmatic creation of random disposable inboxes with @gmail.com is impossible and unauthorized without direct Google Workspace authorization. TempMailVault operates strictly on dedicated disposable mail domains (@tempmailvault.live, @maildrop.store, @vaultmail.pro, @tempmail.ltd, @disposable.email) designed specifically for fast, spam-free disposable delivery.',
    },
    {
      question: 'How does OTP & verification code auto-detection work?',
      answer:
        'TempMailVault inspects incoming message subjects and bodies using an automated regex parser targeting 4-to-8-digit security tokens. When detected, the OTP is highlighted in a dedicated banner with a 1-click "Copy OTP" button for instant paste into your registration form.',
    },
    {
      question: 'How long do temporary email addresses and messages last?',
      answer:
        'Your temporary mailbox remains active as long as your session is open or until you manually click "Change / New Email" or "Delete Email". Incoming emails are stored temporarily in your local session and can be wiped with one click whenever you finish.',
    },
    {
      question: 'Can I choose my own custom email username?',
      answer:
        'Yes! Use the "Create Custom Email" input on the generator card to type any username (such as your name or project handle) and select any of our 5 active domain extensions.',
    },
    {
      question: 'Is TempMailVault free and anonymous?',
      answer:
        'Yes, TempMailVault is 100% free with unlimited generation. There are no registrations, passwords, or credit card requirements. No personal identification is stored.',
    },
    {
      question: 'Can I send emails from this disposable mailbox?',
      answer:
        'To protect our domain reputation and prevent spam abuse across the internet, TempMailVault is strictly an incoming receive-only service. It is optimized for OTPs, activations, download links, and confirmation emails.',
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest font-semibold text-purple-400">
          Got Questions?
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-zinc-900 mt-1">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-2">
          Everything you need to know about disposable emails, OTP auto-detection, and privacy.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              className="rounded-2xl border border-zinc-800 dark:border-zinc-800 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 overflow-hidden transition-colors"
            >
              <button
                onClick={() => handleToggle(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-zinc-800/40 dark:hover:bg-zinc-800/40 light:hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="font-display font-semibold text-sm sm:text-base text-zinc-100 dark:text-zinc-100 light:text-zinc-900">
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-zinc-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 leading-relaxed border-t border-zinc-800/40 dark:border-zinc-800/40 light:border-zinc-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
