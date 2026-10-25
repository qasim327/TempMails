import { TempPhoneNumber, SmsMessage } from '../types/sms';

const SMS_STORAGE_PREFIX = 'tmv_sms_inbox_';
const DAILY_NUMBERS_KEY = 'tmv_daily_numbers_pool';
const LAST_ROTATION_DATE_KEY = 'tmv_last_rotation_date';

// High-reputation permanent base numbers
export const BASE_NUMBERS: TempPhoneNumber[] = [
  {
    id: 'num_us_1',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    dialCode: '+1',
    number: '+1 (202) 843-9102',
    rawNumber: '+12028439102',
    status: 'online',
    carrier: 'T-Mobile US',
    totalReceived: 42,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 99.4,
    usageLevel: 'low',
  },
  {
    id: 'num_uk_1',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    dialCode: '+44',
    number: '+44 7848 427800',
    rawNumber: '+447848427800',
    status: 'online',
    carrier: 'Vodafone UK',
    totalReceived: 68,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 99.8,
    usageLevel: 'low',
  },
  {
    id: 'num_ca_1',
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    dialCode: '+1',
    number: '+1 (647) 945-8120',
    rawNumber: '+16479458120',
    status: 'online',
    carrier: 'Rogers Wireless',
    totalReceived: 31,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 99.1,
    usageLevel: 'clean',
  },
  {
    id: 'num_nl_1',
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    dialCode: '+31',
    number: '+31 970 5802 6760',
    rawNumber: '+3197058026760',
    status: 'online',
    carrier: 'KPN Telecom',
    totalReceived: 54,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 98.9,
    usageLevel: 'low',
  },
  {
    id: 'num_fr_1',
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    dialCode: '+33',
    number: '+33 6 44 63 92 10',
    rawNumber: '+33644639210',
    status: 'online',
    carrier: 'Orange France',
    totalReceived: 27,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 98.7,
    usageLevel: 'clean',
  },
  {
    id: 'num_de_1',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    dialCode: '+49',
    number: '+49 152 1894 7201',
    rawNumber: '+4915218947201',
    status: 'online',
    carrier: 'Telekom DE',
    totalReceived: 19,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 99.2,
    usageLevel: 'clean',
  },
  {
    id: 'num_se_1',
    country: 'Sweden',
    countryCode: 'SE',
    flag: '🇸🇪',
    dialCode: '+46',
    number: '+46 76 943 81 29',
    rawNumber: '+46769438129',
    status: 'online',
    carrier: 'Telia Sweden',
    totalReceived: 23,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 99.5,
    usageLevel: 'clean',
  },
  {
    id: 'num_fi_1',
    country: 'Finland',
    countryCode: 'FI',
    flag: '🇫🇮',
    dialCode: '+358',
    number: '+358 45 739 62 81',
    rawNumber: '+358457396281',
    status: 'online',
    carrier: 'Elisa Finland',
    totalReceived: 16,
    isFresh: true,
    addedAt: 'Active Today',
    successRate: 99.0,
    usageLevel: 'clean',
  },
];

// Country configuration presets for generating fresh daily numbers
const COUNTRY_PRESETS = [
  {
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    dialCode: '+1',
    carrier: 'AT&T Mobility',
    prefixes: ['310', '212', '305', '512', '415', '702'],
    format: (prefix: string, p1: string, p2: string) => `+1 (${prefix}) ${p1}-${p2}`,
    raw: (prefix: string, p1: string, p2: string) => `+1${prefix}${p1}${p2}`,
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    dialCode: '+44',
    carrier: 'O2 UK',
    prefixes: ['7700', '7890', '7911', '7441'],
    format: (prefix: string, p1: string, p2: string) => `+44 ${prefix} ${p1}${p2.substring(0, 3)}`,
    raw: (prefix: string, p1: string, p2: string) => `+44${prefix}${p1}${p2.substring(0, 3)}`,
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    dialCode: '+1',
    carrier: 'Bell Canada',
    prefixes: ['416', '604', '514', '778'],
    format: (prefix: string, p1: string, p2: string) => `+1 (${prefix}) ${p1}-${p2}`,
    raw: (prefix: string, p1: string, p2: string) => `+1${prefix}${p1}${p2}`,
  },
  {
    country: 'Poland',
    countryCode: 'PL',
    flag: '🇵🇱',
    dialCode: '+48',
    carrier: 'Play Poland',
    prefixes: ['732', '690', '570'],
    format: (prefix: string, p1: string, p2: string) => `+48 ${prefix} ${p1} ${p2.substring(0, 3)}`,
    raw: (prefix: string, p1: string, p2: string) => `+48${prefix}${p1}${p2.substring(0, 3)}`,
  },
  {
    country: 'Spain',
    countryCode: 'ES',
    flag: '🇪🇸',
    dialCode: '+34',
    carrier: 'Movistar Spain',
    prefixes: ['612', '644', '693'],
    format: (prefix: string, p1: string, p2: string) => `+34 ${prefix} ${p1} ${p2.substring(0, 3)}`,
    raw: (prefix: string, p1: string, p2: string) => `+34${prefix}${p1}${p2.substring(0, 3)}`,
  },
  {
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    dialCode: '+61',
    carrier: 'Telstra Mobile',
    prefixes: ['488', '470', '480'],
    format: (prefix: string, p1: string, p2: string) => `+61 ${prefix} ${p1} ${p2.substring(0, 3)}`,
    raw: (prefix: string, p1: string, p2: string) => `+61${prefix}${p1}${p2.substring(0, 3)}`,
  },
];

// Helper to generate a batch of fresh numbers for today
export function generateFreshDailyBatch(seedDateStr: string, count: number = 4): TempPhoneNumber[] {
  const freshList: TempPhoneNumber[] = [];

  for (let i = 0; i < count; i++) {
    const config = COUNTRY_PRESETS[i % COUNTRY_PRESETS.length];
    const prefix = config.prefixes[Math.floor(Math.random() * config.prefixes.length)];
    const p1 = Math.floor(200 + Math.random() * 790).toString();
    const p2 = Math.floor(1000 + Math.random() * 8990).toString();

    const formatted = config.format(prefix, p1, p2);
    const raw = config.raw(prefix, p1, p2);

    freshList.push({
      id: `daily_${seedDateStr}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      country: config.country,
      countryCode: config.countryCode,
      flag: config.flag,
      dialCode: config.dialCode,
      number: formatted,
      rawNumber: raw,
      status: 'online',
      carrier: config.carrier,
      totalReceived: Math.floor(1 + Math.random() * 8),
      isFresh: true,
      addedAt: 'Added Today (Fresh)',
      successRate: 99.8,
      usageLevel: 'clean',
    });
  }

  return freshList;
}

// Get the full active numbers pool (combining base numbers + daily fresh numbers)
export function getDailyNumbersPool(): { numbers: TempPhoneNumber[]; isNewRotation: boolean } {
  const todayStr = new Date().toISOString().split('T')[0]; // e.g. '2026-10-25'
  let isNewRotation = false;

  try {
    const lastDate = localStorage.getItem(LAST_ROTATION_DATE_KEY);
    const savedPool = localStorage.getItem(DAILY_NUMBERS_KEY);

    if (savedPool && lastDate === todayStr) {
      // Pool is already up to date for today
      return { numbers: JSON.parse(savedPool), isNewRotation: false };
    }

    // It's a new day or first load! Automatically mint today's fresh numbers
    isNewRotation = true;
    const freshBatch = generateFreshDailyBatch(todayStr, 4);
    const combined = [...freshBatch, ...BASE_NUMBERS];

    localStorage.setItem(DAILY_NUMBERS_KEY, JSON.stringify(combined));
    localStorage.setItem(LAST_ROTATION_DATE_KEY, todayStr);

    return { numbers: combined, isNewRotation: true };
  } catch (e) {
    console.error('Error in daily pool', e);
    return { numbers: BASE_NUMBERS, isNewRotation: false };
  }
}

// User-triggered on-demand generation: manually add 3 brand-new fresh numbers
export function requestFreshNumbersOnDemand(): TempPhoneNumber[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentPool = getDailyNumbersPool().numbers;

  const fresh = generateFreshDailyBatch(`${todayStr}_req_${Date.now()}`, 3);
  const updated = [...fresh, ...currentPool];

  try {
    localStorage.setItem(DAILY_NUMBERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  return updated;
}

// Extract OTP code from SMS text
export function extractSmsOTP(text: string): string | undefined {
  if (!text) return undefined;

  // Pattern 1: Keywords like "code is 123456", "verification code: 98124", "OTP is 5912", "TikTok code"
  const keywordMatch = text.match(/(?:code|otp|pin|token|verification|verify|código|passcode)\s*(?:is|:|-)?\s*([0-9]{4,8})\b/i);
  if (keywordMatch && keywordMatch[1]) {
    return keywordMatch[1];
  }

  // Pattern 2: [123456] or (123456)
  const bracketMatch = text.match(/[\[\(]([0-9]{4,8})[\]\)]/);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }

  // Pattern 3: Standalone 4-8 digit number
  const digitMatches = text.match(/\b\d{4,8}\b/g);
  if (digitMatches && digitMatches.length > 0) {
    const nonYear = digitMatches.find((code) => !['2024', '2025', '2026', '2027', '2028'].includes(code));
    return nonYear || digitMatches[0];
  }

  return undefined;
}

// Initial seed messages for a number
export function getInitialSms(number: TempPhoneNumber): SmsMessage[] {
  const now = Date.now();
  if (number.countryCode === 'US' || number.countryCode === 'GB') {
    return [
      {
        id: `sms_seed_1_${number.id}`,
        toPhone: number.rawNumber,
        from: 'TikTok',
        sender: 'TikTok',
        text: '[TikTok] Your verification code is 849201. Never share this code with anyone.',
        otp: '849201',
        timestamp: now - 3 * 60 * 1000,
        createdAt: '3m ago',
      },
      {
        id: `sms_seed_2_${number.id}`,
        toPhone: number.rawNumber,
        from: 'Google',
        sender: 'Google',
        text: 'G-592810 is your Google verification code. Do not share your code.',
        otp: '592810',
        timestamp: now - 18 * 60 * 1000,
        createdAt: '18m ago',
      },
    ];
  }

  return [
    {
      id: `sms_seed_3_${number.id}`,
      toPhone: number.rawNumber,
      from: 'WhatsApp',
      sender: 'WhatsApp',
      text: 'Your WhatsApp Business code: 318-942. Tap link or enter code to verify.',
      otp: '318942',
      timestamp: now - 5 * 60 * 1000,
      createdAt: '5m ago',
    },
  ];
}

export function getSmsInbox(rawNumber: string): SmsMessage[] {
  try {
    const raw = localStorage.getItem(`${SMS_STORAGE_PREFIX}${rawNumber}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read SMS inbox', e);
  }

  const numObj = BASE_NUMBERS.find((n) => n.rawNumber === rawNumber);
  if (numObj) {
    const seeds = getInitialSms(numObj);
    saveSmsInbox(rawNumber, seeds);
    return seeds;
  }
  return [];
}

export function saveSmsInbox(rawNumber: string, messages: SmsMessage[]): void {
  try {
    localStorage.setItem(`${SMS_STORAGE_PREFIX}${rawNumber}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save SMS inbox', e);
  }
}

export function createNewSms(
  toPhone: string,
  sender: string,
  text: string,
  customOtp?: string
): SmsMessage {
  const timestamp = Date.now();
  const detectedOtp = customOtp || extractSmsOTP(text);

  return {
    id: `sms_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
    toPhone,
    from: sender,
    sender,
    text,
    otp: detectedOtp,
    timestamp,
    createdAt: 'Just now',
  };
}
