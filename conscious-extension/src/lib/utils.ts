export function formatTime(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return '';
  }
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isWhitelistedDomain(domain: string, whitelist: string[]): boolean {
  return whitelist.some(pattern => isDomainMatch(domain, pattern));
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTimestamp(): number {
  return Date.now();
}

export function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Platform/Domain Mapping ---
export function getPlatformDomains(platform: string, platformMap: Record<string, string[]>): string[] {
  return platformMap[platform] || [];
}

export function getPlatformByDomain(domain: string, platformMap: Record<string, string[]>): string | null {
  for (const [platform, domains] of Object.entries(platformMap)) {
    if (domains.some(d => isDomainMatch(domain, d))) {
      return platform;
    }
  }
  return null;
}

// --- Wildcard/Domain Matching ---
export function isDomainMatch(domain: string, pattern: string): boolean {
  // Supports wildcards like *.example.com
  if (pattern.startsWith('*.')) {
    return domain === pattern.slice(2) || domain.endsWith('.' + pattern.slice(2));
  }
  return domain === pattern || domain.endsWith('.' + pattern);
}

// --- AES-256 Encryption/Decryption (password-based) ---
// Uses Web Crypto API
export async function encryptDataAES256(data: any, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await getKeyMaterial(password);
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = enc.encode(JSON.stringify(data));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  // Return as base64 JSON: {salt, iv, ciphertext}
  return btoa(JSON.stringify({
    salt: Array.from(salt),
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext))
  }));
}

export async function decryptDataAES256(encrypted: string, password: string): Promise<any> {
  const dec = new TextDecoder();
  const { salt, iv, ciphertext } = JSON.parse(atob(encrypted));
  const keyMaterial = await getKeyMaterial(password);
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ciphertext)
  );
  return JSON.parse(dec.decode(decrypted));
}

async function getKeyMaterial(password: string) {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
}

// --- CSV/JSON Import (Partial Recovery) ---
export function parseJSONImport(jsonStr: string): { sessions: any[]; settings: any[]; errors: string[] } {
  try {
    const obj = JSON.parse(jsonStr);
    if (obj.sessions && obj.settings) {
      return { sessions: obj.sessions, settings: obj.settings, errors: [] };
    }
    return { sessions: [], settings: [], errors: ['Missing sessions or settings'] };
  } catch (e) {
    return { sessions: [], settings: [], errors: ['Invalid JSON'] };
  }
}

export function parseCSVImport(csvStr: string): { sessions: any[]; errors: string[] } {
  const lines = csvStr.split('\n');
  const headers = lines[0].split(',');
  const sessions = [];
  const errors = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length !== headers.length) {
      errors.push(`Row ${i + 1} malformed`);
      continue;
    }
    const session: any = {};
    headers.forEach((h, idx) => session[h] = row[idx]);
    sessions.push(session);
  }
  return { sessions, errors };
}

// --- Undo/Redo Buffer Logic ---
export class UndoBuffer<T> {
  private buffer: T[] = [];
  private max = 5;
  push(action: T) {
    this.buffer = [action, ...this.buffer].slice(0, this.max);
  }
  pop(): T | undefined {
    const last = this.buffer.shift();
    return last;
  }
  clear() {
    this.buffer = [];
  }
  getAll(): T[] {
    return this.buffer;
  }
}

// --- Tagging, Streak, Focus Score Utilities ---
export function getFocusScore(activeSecs: number, totalSecs: number): number {
  if (!totalSecs) return 0;
  return Math.round((activeSecs / totalSecs) * 100);
}

export function getStreaks(sessions: { date: string }[], minActiveSecs = 60 * 10): number {
  // Returns the current streak of days with at least minActiveSecs
  let streak = 0;
  let prevDate = '';
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (s.date !== prevDate && s['activeSecs'] >= minActiveSecs) {
      streak++;
      prevDate = s.date;
    } else if (s.date !== prevDate) {
      break;
    }
  }
  return streak;
}

// --- Accessibility & i18n Helpers (Scaffolding) ---
export function getI18n(msg: string): string {
  // Chrome i18n API wrapper
  return chrome.i18n ? chrome.i18n.getMessage(msg) : msg;
}

export function setAriaLabel(el: HTMLElement, label: string) {
  el.setAttribute('aria-label', label);
}

// --- Enhanced Time/Date Utilities ---
export function getLocalDateString(date: Date, timeZone?: string): string {
  return date.toLocaleDateString(undefined, { timeZone });
}

export function isPartialDay(date: Date, installDate: Date): boolean {
  return date.toDateString() === installDate.toDateString();
}
