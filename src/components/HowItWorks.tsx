import React from 'react';
import { motion } from 'motion/react';
import { Copy, MailCheck, ShieldCheck, Zap } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Generate or Pick Address',
      desc: 'Get an instant random temporary email or choose your custom prefix across 5 high-reputation domains with zero registration.',
      icon: Copy,
    },
    {
      num: '02',
      title: 'Instant OTP & Mail Delivery',
      desc: 'Use the disposable email anywhere. Verification emails, OTPs, and confirmation links arrive live in your dashboard within seconds.',
      icon: MailCheck,
    },
    {
      num: '03',
      title: 'Stay Spam-Free & Anonymous',
      desc: 'Prevent data leaks, spam newsletters, and tracking on your personal email. Delete the temporary mailbox whenever you finish.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest font-semibold text-purple-400">
          Effortless Disposable Email
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-zinc-900 mt-1">
          How TempMailVault Works
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-2">
          3 simple steps to guard your real identity and receive one-time passwords safely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-[24px] border border-zinc-800 dark:border-zinc-800 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white light:border-zinc-200 shadow-xl backdrop-blur-md relative overflow-hidden group transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-purple-500/40 dark:text-purple-500/40 light:text-purple-300">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-white dark:text-white light:text-zinc-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-zinc-600 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
