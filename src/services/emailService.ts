import { EmailMessage, SupportedDomain, DEFAULT_DOMAINS } from '../types';

const STORAGE_KEYS = {
  CURRENT_EMAIL: 'tmv_current_email',
  ACCOUNT_DATA: 'tmv_account_data',
  INBOX_PREFIX: 'tmv_inbox_',
  AUTO_REFRESH: 'tmv_auto_refresh',
  THEME: 'theme',
  SOUND_ENABLED: 'tmv_sound_enabled',
};

// API Base URLs - direct mail.tm works natively with CORS in browsers & Vercel
const API_BASE_DIRECT = 'https://api.mail.tm';
const API_BASE_PROXY = '/api/mail';

async function fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // 1. Try direct mail.tm API first (Essential for Vercel static deployment)
  try {
    const res = await fetch(`${API_BASE_DIRECT}${endpoint}`, options);
    const contentType = res.headers.get('content-type') || '';
    // 204 No Content has empty body, JSON/problem+json has data
    if (res.status === 204 || (res.ok && (contentType.includes('json') || contentType.includes('problem+json'))) || res.status === 400 || res.status === 422) {
      return res;
    }
  } catch {
    // Direct call network issue, try local proxy fallback
  }

  // 2. Fallback to proxy (used in local dev server if needed)
  try {
    const res = await fetch(`${API_BASE_PROXY}${endpoint}`, options);
    const contentType = res.headers.get('content-type') || '';
    // Explicitly reject text/html so Vercel SPA rewrites don't return index.html as a fake 200 JSON
    if (!contentType.includes('text/html') && (res.status === 204 || res.ok || res.status === 400 || res.status === 422)) {
      return res;
    }
  } catch {
    // Proxy failed
  }

  // Final fallback to direct
  return fetch(`${API_BASE_DIRECT}${endpoint}`, options);
}

// Extract OTP / 4-8 digit verification code from text or subject
export function extractOTP(text: string): string | undefined {
  if (!text) return undefined;

  // Priority 1: Match OTP keyword followed by number (e.g. "code is 482910", "OTP: 123456", "verification code 9831")
  const keywordMatch = text.match(/(?:code|otp|pin|token|verification|verify|passcode)\s*(?:is|:|-)?\s*([0-9]{4,8})\b/i);
  if (keywordMatch && keywordMatch[1]) {
    return keywordMatch[1];
  }

  // Priority 2: Standalone 4 to 8 digit number
  const digitMatches = text.match(/\b\d{4,8}\b/g);
  if (digitMatches && digitMatches.length > 0) {
    const nonYear = digitMatches.find((code) => !['2024', '2025', '2026', '2027', '2028'].includes(code));
    return nonYear || digitMatches[0];
  }

  return undefined;
}

// Generates a random username: letters + numbers
export function generateRandomUsername(): string {
  const syllables = ['k9', 'vx', 'zen', 'arc', 'nova', 'echo', 'flux', 'byte', 'core', 'luna', 'swift', 'sky'];
  const prefix = syllables[Math.floor(Math.random() * syllables.length)];
  const randomChars = Math.random().toString(36).substring(2, 6);
  const randomNum = Math.floor(10 + Math.random() * 89);
  return `${prefix}${randomChars}${randomNum}`.toLowerCase();
}

export interface AccountSession {
  address: string;
  token?: string;
  accountId?: string;
  password?: string;
}

// Fetch active live domains from mail.tm
export async function getLiveDomains(): Promise<string[]> {
  try {
    const res = await fetchWithFallback('/domains');
    if (res.ok) {
      const data = await res.json();
      const members = data['hydra:member'] || [];
      const live = members
        .filter((d: { isActive: boolean; domain: string }) => d.isActive)
        .map((d: { domain: string }) => d.domain);
      if (live.length > 0) {
        return live;
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote live domains, using default list', err);
  }
  return [...DEFAULT_DOMAINS];
}

// Create or login to real account on mail.tm
export async function setupRealAccount(address: string): Promise<AccountSession> {
  const clean = address.replace(/[^a-zA-Z0-9]/g, '');
  const candidatePasswords = ['Password123!', `Tmv_${clean}_99!`];

  let token: string | undefined;
  let accountId: string | undefined;
  let usedPassword = candidatePasswords[0];

  try {
    // 1. Try to create account with primary password
    const createRes = await fetchWithFallback('/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password: candidatePasswords[0] }),
    });

    if (createRes.ok) {
      const accData = await createRes.json();
      accountId = accData.id;
    }

    // 2. Obtain JWT token - try candidate passwords
    for (const pwd of candidatePasswords) {
      try {
        const tokenRes = await fetchWithFallback('/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, password: pwd }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          token = tokenData.token;
          accountId = tokenData.id || accountId;
          usedPassword = pwd;
          break;
        }
      } catch {
        // try next
      }
    }
  } catch (e) {
    console.warn('Live mail service notice:', e);
  }

  const session: AccountSession = { address, token, accountId, password: usedPassword };
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(session));
  } catch {
    // Ignore storage issues
  }
  return session;
}

const DELETED_IDS_PREFIX = 'tmv_deleted_ids_';

export function getDeletedMessageIds(email: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${DELETED_IDS_PREFIX}${email}`);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function markMessageAsDeleted(email: string, messageId: string): void {
  try {
    const set = getDeletedMessageIds(email);
    set.add(messageId);
    localStorage.setItem(`${DELETED_IDS_PREFIX}${email}`, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function clearDeletedMessageIds(email: string): void {
  try {
    localStorage.removeItem(`${DELETED_IDS_PREFIX}${email}`);
  } catch {
    // ignore
  }
}

// Fetch REAL emails from mail.tm for this account
export async function fetchLiveEmails(token: string, toEmail: string): Promise<EmailMessage[]> {
  if (!token) return [];

  try {
    const res = await fetchWithFallback('/messages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const members = data['hydra:member'] || [];
    const deletedIds = getDeletedMessageIds(toEmail);

    // Filter out messages deleted by the user so they never reappear
    const activeMembers = members.filter((msg: { id: string }) => !deletedIds.has(msg.id));

    // Fetch full detail for each message
    const detailedMessages: EmailMessage[] = await Promise.all(
      activeMembers.map(async (msg: { id: string; from: { name: string; address: string }; subject: string; intro?: string; seen: boolean; createdAt: string }) => {
        let fullBody = msg.intro || '';
        let htmlBody: string | undefined;

        try {
          const detailRes = await fetchWithFallback(`/messages/${msg.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            fullBody = detail.text || detail.intro || fullBody;
            if (detail.html && detail.html.length > 0) {
              htmlBody = Array.isArray(detail.html) ? detail.html.join('') : String(detail.html);
            }
          }
        } catch {
          // fallback to summary
        }

        const detectedOtp = extractOTP(`${msg.subject} ${fullBody}`);
        const timestamp = new Date(msg.createdAt).getTime();

        return {
          id: msg.id,
          toEmail,
          from: msg.from.address,
          senderName: msg.from.name || msg.from.address.split('@')[0],
          subject: msg.subject || '(No Subject)',
          body: fullBody,
          htmlBody,
          otp: detectedOtp,
          createdAt: formatTimeAgo(timestamp),
          timestamp,
          read: msg.seen,
        };
      })
    );

    // Sort descending by timestamp
    return detailedMessages.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Failed to fetch live emails:', err);
    return [];
  }
}

// Delete message permanently on live server
export async function deleteLiveMessage(token: string | undefined, messageId: string, email?: string): Promise<boolean> {
  if (email) {
    markMessageAsDeleted(email, messageId);
  }
  if (!token) return true;
  try {
    const res = await fetchWithFallback(`/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

// Delete all messages permanently on live server
export async function deleteAllLiveMessages(token: string | undefined, email: string, messageIds: string[]): Promise<void> {
  messageIds.forEach((id) => markMessageAsDeleted(email, id));
  clearInboxStorage(email);

  if (!token || messageIds.length === 0) return;

  await Promise.allSettled(
    messageIds.map((id) =>
      fetchWithFallback(`/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    )
  );
}

// Delete entire account permanently on live server
export async function deleteLiveAccount(token: string | undefined, accountId: string | undefined): Promise<boolean> {
  if (!token || !accountId) return true;
  try {
    const res = await fetchWithFallback(`/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

// Storage helpers
export function getSavedEmail(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_EMAIL);
  } catch {
    return null;
  }
}

export function saveEmail(email: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_EMAIL, email);
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function getSavedAccountSession(): AccountSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT_DATA);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return null;
}

export function getSavedInbox(email: string): EmailMessage[] {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.INBOX_PREFIX}${email}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Inbox read error', e);
  }
  return [];
}

export function saveInbox(email: string, messages: EmailMessage[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.INBOX_PREFIX}${email}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Inbox save error', e);
  }
}

export function clearInboxStorage(email: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.INBOX_PREFIX}${email}`);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_DATA);
  } catch (e) {
    console.error('Clear error', e);
  }
}

// Format relative time
export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1m ago';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Procedural audio notification for incoming email
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.1);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);

    setTimeout(() => {
      ctx.close();
    }, 500);
  } catch {
    // Ignore audio errors
  }
}

// Helper to construct manual test email only when user explicitly clicks "Send Test Mail"
export function createManualTestEmail(toEmail: string, customPreset: { sender: string; subject: string; body: string; otp?: string }): EmailMessage {
  const now = new Date();
  const id = `test_${Date.now()}`;
  const detectedOtp = customPreset.otp || extractOTP(`${customPreset.subject} ${customPreset.body}`);

  return {
    id,
    toEmail,
    from: customPreset.sender,
    senderName: customPreset.sender.split('@')[0],
    subject: customPreset.subject,
    body: customPreset.body,
    htmlBody: `<div style="font-family:sans-serif;line-height:1.6;color:#18181b;">
      <h2 style="color:#7c3aed;margin-bottom:12px;">${customPreset.subject}</h2>
      <p style="white-space:pre-line;">${customPreset.body}</p>
      ${detectedOtp ? `<div style="margin:20px 0;padding:16px;background:#f3e8ff;border-radius:12px;border:1px solid #d8b4fe;text-align:center;">
        <div style="font-size:12px;color:#6b21a8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</div>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px;color:#581c87;margin-top:4px;">${detectedOtp}</div>
      </div>` : ''}
    </div>`,
    otp: detectedOtp,
    createdAt: 'Just now',
    timestamp: now.getTime(),
    read: false,
  };
}
