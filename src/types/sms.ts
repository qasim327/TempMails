export interface TempPhoneNumber {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  dialCode: string;
  number: string;
  rawNumber: string;
  status: 'online' | 'busy';
  carrier: string;
  totalReceived: number;
  isFresh?: boolean;
  addedAt?: string;
  successRate?: number;
  usageLevel?: 'clean' | 'low' | 'medium';
}

export interface SmsMessage {
  id: string;
  toPhone: string;
  from: string;
  sender: string;
  text: string;
  otp?: string;
  timestamp: number;
  createdAt: string;
}
