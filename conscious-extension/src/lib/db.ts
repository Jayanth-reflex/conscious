import Dexie, { Table } from 'dexie';

// --- Interfaces ---
export interface Session {
  sessionId: string;
  domain: string;
  date: string;
  startTime: number;
  endTime: number;
  totalSecs: number;
  activeSecs: number;
  url?: string;
  browser?: string;
  os?: string;
  extensionVersion?: string;
  windowId?: number;
  tabId?: number;
  interruptions?: Array<{ type: 'idle' | 'sleep' | 'crash'; start: number; end: number }>;
  tags?: string[];
}

export interface Setting {
  key: 'whitelist' | 'limits' | 'lastExport' | 'timezone' | 'preferences' | 'platformMap' | 'retention' | 'backups' | 'undoBuffer' | 'telemetry' | 'errorReporting' | 'version';
  value: any;
}

export interface Backup {
  backupId: string;
  createdAt: number;
  data: any;
  encrypted?: boolean;
}

export interface ErrorLog {
  errorId: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: number;
  sessionId?: string;
  extensionVersion?: string;
}

export interface Telemetry {
  eventId: string;
  event: string;
  timestamp: number;
  details?: any;
}

export interface PlatformMap {
  [platform: string]: string[]; // e.g., { "YouTube": ["youtube.com", "m.youtube.com", "youtu.be"] }
}

// --- Dexie DB ---
export class ConsciousTabDB extends Dexie {
  sessions!: Table<Session>;
  settings!: Table<Setting>;
  backups!: Table<Backup>;
  errors!: Table<ErrorLog>;
  telemetry!: Table<Telemetry>;

  constructor() {
    super('ConsciousTabDB');
    this.version(2).stores({
      sessions: 'sessionId, domain, date, startTime, endTime',
      settings: '&key',
      backups: 'backupId, createdAt',
      errors: 'errorId, type, timestamp',
      telemetry: 'eventId, event, timestamp'
    });
  }
}

export const db = new ConsciousTabDB();

// --- Data Retention & Purge ---
export async function purgeOldSessions(retentionDays: number) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  await db.sessions.where('startTime').below(cutoff).delete();
}

// --- Backup/Restore ---
export async function createBackup(encrypted = false, password?: string): Promise<Backup> {
  const sessions = await db.sessions.toArray();
  const settings = await db.settings.toArray();
  const data = { sessions, settings, createdAt: Date.now() };
  let backupData = data;
  if (encrypted && password) {
    // Placeholder: encryption logic to be implemented in utils
    backupData = data; // Encryption will be handled and returned as a string or encrypted object
  }
  const backup: Backup = {
    backupId: crypto.randomUUID(),
    createdAt: Date.now(),
    data: backupData,
    encrypted
  };
  await db.backups.add(backup);
  return backup;
}

export async function restoreBackup(backup: Backup, password?: string) {
  let data = backup.data;
  if (backup.encrypted && password) {
    // Placeholder: decryption logic to be implemented in utils
    data = data.data;
  }
  if (data.sessions && data.settings) {
    await db.sessions.clear();
    await db.settings.clear();
    await db.sessions.bulkAdd(data.sessions);
    await db.settings.bulkAdd(data.settings);
  }
}

// --- Error Logging ---
export async function logError(type: string, message: string, stack?: string, sessionId?: string) {
  await db.errors.add({
    errorId: crypto.randomUUID(),
    type,
    message,
    stack,
    timestamp: Date.now(),
    sessionId,
    extensionVersion: (await getSettings('version')) || '1.0.0'
  });
}

export async function clearErrorLogs() {
  await db.errors.clear();
}

// --- Telemetry ---
export async function logTelemetry(event: string, details?: any) {
  await db.telemetry.add({
    eventId: crypto.randomUUID(),
    event,
    timestamp: Date.now(),
    details
  });
}

// --- Undo/Redo Buffer ---
export async function pushUndoBuffer(action: any) {
  let buffer = (await getSettings('undoBuffer')) || [];
  buffer = [action, ...buffer].slice(0, 5);
  await setSettings('undoBuffer', buffer);
}

export async function popUndoBuffer() {
  let buffer = (await getSettings('undoBuffer')) || [];
  const last = buffer.shift();
  await setSettings('undoBuffer', buffer);
  return last;
}

// --- Platform Map & Whitelist Initialization ---
export async function initializeDefaultSettings(): Promise<void> {
  const defaultWhitelist = [
    'instagram.com', 'tiktok.com', 'youtube.com', 'primevideo.com', 'hotstar.com',
    'netflix.com', 'facebook.com', 'twitter.com', 'snapchat.com', 'linkedin.com',
    'reddit.com', 'pinterest.com', 'discord.com', 'twitch.tv'
  ];
  const defaultPlatformMap: PlatformMap = {
    'YouTube': ['youtube.com', 'm.youtube.com', 'youtu.be'],
    'Twitter': ['twitter.com', 'x.com'],
    'Instagram': ['instagram.com'],
    'TikTok': ['tiktok.com'],
    'Prime Video': ['primevideo.com'],
    'Hotstar': ['hotstar.com'],
    'Netflix': ['netflix.com'],
    'Facebook': ['facebook.com'],
    'Snapchat': ['snapchat.com'],
    'LinkedIn': ['linkedin.com'],
    'Reddit': ['reddit.com'],
    'Pinterest': ['pinterest.com'],
    'Discord': ['discord.com'],
    'Twitch': ['twitch.tv']
  };
  if (!(await getSettings('whitelist'))) {
    await setSettings('whitelist', defaultWhitelist);
  }
  if (!(await getSettings('platformMap'))) {
    await setSettings('platformMap', defaultPlatformMap);
  }
  if (!(await getSettings('retention'))) {
    await setSettings('retention', 90); // 90 days default
  }
}

// --- Existing helpers (getSessions, addSession, etc.) remain unchanged ---
export async function getSessions(startDate?: Date, endDate?: Date): Promise<Session[]> {
  let query = db.sessions.orderBy('startTime');
  
  if (startDate && endDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    query = query.filter(session => 
      session.date >= startDateStr && session.date <= endDateStr
    );
  }
  
  return await query.toArray();
}

export async function addSession(session: Session): Promise<void> {
  await db.sessions.add(session);
}

export async function getSettings(key: Setting['key']): Promise<any> {
  const setting = await db.settings.get(key);
  return setting?.value;
}

export async function setSettings(key: Setting['key'], value: any): Promise<void> {
  await db.settings.put({ key, value });
}

export async function getTodaySessions(): Promise<Session[]> {
  const today = new Date().toISOString().split('T')[0];
  return await db.sessions.where('date').equals(today).toArray();
}

export async function getSessionsByDateRange(days: number): Promise<Session[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await getSessions(startDate, endDate);
}
