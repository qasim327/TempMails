export interface EmailMessage {
  id: string;
  toEmail: string;
  from: string;
  senderName: string;
  subject: string;
  body: string;
  htmlBody?: string;
  otp?: string;
  createdAt: string;
  timestamp: number;
  read: boolean;
}

export interface TempEmail {
  id: string;
  email: string;
  username: string;
  domain: string;
  createdAt: string;
}

export const DEFAULT_DOMAINS = [
  'maxxspace.com',
] as const;

export type SupportedDomain = string;

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
