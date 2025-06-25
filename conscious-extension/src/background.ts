// ConsciousTab Background Script
// FAANG-level: Robust session, idle, and analytics management

import {
  addSession, getSettings, setSettings, initializeDefaultSettings, Session, logError, logTelemetry, purgeOldSessions, pushUndoBuffer, popUndoBuffer, getTodaySessions
} from './lib/db';
import {
  formatTime, getDomain, uuid, isWhitelistedDomain, getTimestamp, getPlatformByDomain, getFocusScore
} from './lib/utils';

interface CurrentSession {
  sessionId: string;
  domain: string;
  startTime: number;
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
  status?: 'active' | 'idle' | 'paused';
}

let currentSession: CurrentSession | null = null;
let timer: number | null = null;
let idleCheckInterval: number | null = null;
let idleCounter = 0;
const IDLE_THRESHOLD = 10; // seconds
const IDLE_AUTO_CLOSE = 600; // 10 min
const SESSION_MERGE_GRACE = 30; // seconds
let lastSessionEnd: number | null = null;
let paused = false;
let midnightAlarmSet = false;

// --- Initialization ---
chrome.runtime.onInstalled.addListener(() => {
  console.log('Service worker running');
  initializeDefaultSettings();
  scheduleMidnightReset();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleMidnightReset();
});

// --- Tab/Window/Idle Event Listeners ---
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await getTabById(activeInfo.tabId);
  handleTabActivated(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    handleTabActivated(tab);
  }
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    handleSessionEnd('sleep');
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) {
    handleSessionEnd('sleep');
  }
});

chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === 'idle' || newState === 'locked') {
    handleSessionEnd('idle');
  }
});

// --- Midnight Reset ---
function scheduleMidnightReset() {
  if (midnightAlarmSet) return;
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();
  chrome.alarms.create('midnightReset', { when: Date.now() + msUntilMidnight });
  midnightAlarmSet = true;
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'midnightReset') {
    await handleMidnightReset();
    scheduleMidnightReset();
  }
});

async function handleMidnightReset() {
  if (currentSession) {
    handleSessionEnd('midnight');
  }
  // Purge old sessions
  const retention = (await getSettings('retention')) || 90;
  await purgeOldSessions(retention);
}

// --- Session Management ---
async function handleTabActivated(tab: chrome.tabs.Tab) {
  if (paused) return;
  const url = tab.url;
  if (!url) return;
  const domain = getDomain(url);
  const whitelist = await getSettings('whitelist');
  if (!isWhitelistedDomain(domain, whitelist)) {
    handleSessionEnd('switch');
    return;
  }
  // Merge session if within grace period
  const now = getTimestamp();
  if (lastSessionEnd && now - lastSessionEnd < SESSION_MERGE_GRACE * 1000 && currentSession && currentSession.domain === domain) {
    // Continue previous session
    startTimer();
    return;
  }
  // Start new session
  if (!currentSession) {
    const sessionId = uuid();
    currentSession = {
      sessionId,
      domain,
      startTime: now,
      totalSecs: 0,
      activeSecs: 0,
      url,
      browser: undefined, // Not available in service worker
      os: undefined,      // Not available in service worker
      extensionVersion: chrome.runtime.getManifest().version,
      windowId: tab.windowId,
      tabId: tab.id,
      interruptions: [],
      tags: [],
      status: 'active'
    };
    startTimer();
    notifyPopup();
  }
}

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(async () => {
    if (currentSession && !paused) {
      currentSession.totalSecs++;
      idleCounter++;
      if (idleCounter < IDLE_THRESHOLD) {
        currentSession.activeSecs++;
        currentSession.status = 'active';
      } else {
        currentSession.status = 'idle';
      }
      // Auto-close on extended idle
      if (idleCounter >= IDLE_AUTO_CLOSE) {
        handleSessionEnd('idle');
      }
      await checkDailyLimit();
      notifyPopup();
    }
  }, 1000);
  if (idleCheckInterval) clearInterval(idleCheckInterval);
  idleCheckInterval = setInterval(() => {
    if (idleCounter >= IDLE_THRESHOLD && currentSession) {
      currentSession.status = 'idle';
      notifyPopup();
    }
  }, 1000);
}

async function checkDailyLimit() {
  const limits = await getSettings('limits');
  const todaySessions = await getTodaySessions();
  const totalActive = todaySessions.reduce((sum, s) => sum + s.activeSecs, 0);
  if (limits && limits.dailyLimit && totalActive >= limits.dailyLimit * 60) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Daily Limit Reached',
      message: 'You have reached your daily limit!'
    });
    // Optionally, pause tracking or take other action
  }
}

// --- Listen for user activity from content scripts ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('BG received:', msg);
  if (msg.action === 'resetIdle') {
    idleCounter = 0;
    if (currentSession) {
      currentSession.status = 'active';
      notifyPopup();
    }
  }
  if (msg.action === 'getCurrentSession') {
    sendResponse({ session: currentSession });
  }
  if (msg.action === 'pauseTracking') {
    paused = true;
    if (currentSession) currentSession.status = 'paused';
    notifyPopup();
  }
  if (msg.action === 'resumeTracking') {
    paused = false;
    if (currentSession) currentSession.status = 'active';
    notifyPopup();
  }
  if (msg.action === 'undoSession') {
    popUndoBuffer().then(last => {
      if (last) {
        // Restore last session (implementation depends on undo buffer structure)
      }
    });
  }
  if (msg.action === 'logTelemetry') {
    logTelemetry(msg.event, msg.details);
  }
  if (msg.action === 'logError') {
    logError(msg.type, msg.message, msg.stack, msg.sessionId);
  }
  sendResponse({ ack: true });
});

function handleSessionEnd(reason: 'idle' | 'sleep' | 'switch' | 'midnight' | 'manual' = 'manual') {
  if (!currentSession) return;
  clearInterval(timer!);
  clearInterval(idleCheckInterval!);
  const endTime = getTimestamp();
  // Map reason to allowed interruption types
  let interruptionType: 'idle' | 'sleep' | 'crash' = 'crash';
  if (reason === 'idle' || reason === 'sleep') {
    interruptionType = reason;
  } else {
    interruptionType = 'crash';
  }
  const sessionData: Session = {
    ...currentSession,
    endTime,
    date: new Date().toISOString().split('T')[0],
    interruptions: [
      ...(currentSession.interruptions || []),
      { type: interruptionType, start: currentSession.startTime, end: endTime }
    ]
  };
  addSession(sessionData);
  pushUndoBuffer(sessionData);
  lastSessionEnd = endTime;
  currentSession = null;
  notifyPopup();
}

function notifyPopup() {
  chrome.runtime.sendMessage({ action: 'sessionUpdate', session: currentSession });
}

function getTabById(tabId: number): Promise<chrome.tabs.Tab> {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      resolve(tab);
    });
  });
}
