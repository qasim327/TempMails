import React from 'react';
import { Mail, Shield, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 mt-16 pt-12 pb-12 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Crucial Legal Notice Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="leading-relaxed">
              <strong className="text-zinc-200 dark:text-zinc-200 light:text-zinc-800 block mb-0.5">
                Legal & Domain Usage Notice:
              </strong>
              TempMailVault provides free disposable inboxes exclusively through verified privacy domains
              including <span className="font-mono text-purple-400">@tempmailvault.live</span>,{' '}
              <span className="font-mono text-purple-400">@maildrop.store</span>,{' '}
              <span className="font-mono text-purple-400">@vaultmail.pro</span>,{' '}
              <span className="font-mono text-purple-400">@tempmail.ltd</span>, and{' '}
              <span className="font-mono text-purple-400">@disposable.email</span>.
              We do not provide and cannot generate <span className="font-mono">@gmail.com</span> addresses, as Gmail
              is a registered trademark of Google LLC and cannot be created programmatically by third-party systems.
            </div>
          </div>
        </div>

        {/* Brand & Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500 light:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
              TempMailVault
            </span>
            <span>· Unlimited Free Disposable Emails</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> No logs &amp; zero tracking
            </span>
            <span>·</span>
            <span>© {new Date().getFullYear()} TempMailVault. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
