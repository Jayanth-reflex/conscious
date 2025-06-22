// Background Service Worker for conscious extension
import { openDB } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

// Database setup
let db;
const DB_NAME = 'consciousDB';
const DB_VERSION = 1;

const initDB = async () => {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store
      const sessionsStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
      sessionsStore.createIndex('domain', 'domain');
      sessionsStore.createIndex('date', 'date');
      sessionsStore.createIndex('startTime', 'startTime');

      // Settings store
      const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
      
      // Initialize default settings
      const defaultSettings = {
        whitelist: [
          'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 
          'reddit.com', 'linkedin.com', 'tiktok.com', 'snapchat.com',
          'discord.com', 'twitch.tv'
        ],
        sessionLimit: 1800, // 30 minutes in seconds
        remindersEnabled: true,
        idleTimeout: 300, // 5 minutes in seconds
        lastExportDate: null,
        darkTheme: true,
        animationsEnabled: true
      };
      
      Object.entries(defaultSettings).forEach(([key, value]) => {
        settingsStore.put({ key, value });
      });
    },
  });
};

// Session tracking state
let currentSession = null;
let sessionTimer = null;
let activityTimer = null;
let lastActivityTime = Date.now();
let isUserActive = false;

// Default whitelist domains
const DEFAULT_WHITELIST = [
  'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 
  'reddit.com', 'linkedin.com', 'tiktok.com', 'snapchat.com',
  'discord.com', 'twitch.tv'
];

// Initialize on startup
initDB();

// Utility functions
const getDomainFromUrl = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const isWhitelistedDomain = async (domain) => {
  if (!domain) return false;
  const settings = await getSetting('whitelist');
  const whitelist = settings || DEFAULT_WHITELIST;
  return whitelist.some(whitelistedDomain => 
    domain === whitelistedDomain || domain.endsWith('.' + whitelistedDomain)
  );
};

const getSetting = async (key) => {
  if (!db) await initDB();
  try {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const result = await store.get(key);
    return result?.value;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
};

const setSetting = async (key, value) => {
  if (!db) await initDB();
  try {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    await store.put({ key, value });
    await tx.done;
  } catch (error) {
    console.error('Error setting setting:', error);
  }
};

// Session management
const startSession = async (domain, url) => {
  if (currentSession) {
    await endSession();
  }

  const now = Date.now();
  currentSession = {
    sessionId: uuidv4(),
    domain,
    url,
    date: new Date().toISOString().split('T')[0],
    startTime: now,
    endTime: null,
    totalSecs: 0,
    activeSecs: 0,
    idleSecs: 0,
    lastUpdate: now
  };

  // Start session timer (updates every second)
  sessionTimer = setInterval(updateSession, 1000);
  
  // Start activity monitoring
  lastActivityTime = now;
  isUserActive = true;
  
  console.log('Session started for:', domain);
};

const updateSession = () => {
  if (!currentSession) return;

  const now = Date.now();
  const elapsed = Math.floor((now - currentSession.lastUpdate) / 1000);
  
  currentSession.totalSecs += elapsed;
  
  // Check if user is active (activity within last 10 seconds)
  const timeSinceActivity = now - lastActivityTime;
  if (timeSinceActivity <= 10000) {
    currentSession.activeSecs += elapsed;
    isUserActive = true;
  } else {
    currentSession.idleSecs += elapsed;
    isUserActive = false;
  }
  
  currentSession.lastUpdate = now;
  
  // Update popup if open
  chrome.runtime.sendMessage({
    type: 'SESSION_UPDATE',
    session: currentSession,
    isActive: isUserActive
  }).catch(() => {}); // Ignore if popup is closed
  
  // Check session limits
  checkSessionLimits();
};

const endSession = async () => {
  if (!currentSession || !sessionTimer) return;

  clearInterval(sessionTimer);
  sessionTimer = null;

  currentSession.endTime = Date.now();
  
  // Save session to database
  await saveSession(currentSession);
  
  console.log('Session ended for:', currentSession.domain, 
    `Total: ${currentSession.totalSecs}s, Active: ${currentSession.activeSecs}s`);
  
  currentSession = null;
};

const saveSession = async (session) => {
  if (!db) await initDB();
  
  try {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    await store.put(session);
    await tx.done;
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

// Activity tracking
const updateActivity = () => {
  lastActivityTime = Date.now();
};

// Session limit checking
const checkSessionLimits = async () => {
  if (!currentSession) return;
  
  const sessionLimit = await getSetting('sessionLimit') || 1800; // 30 minutes default
  const remindersEnabled = await getSetting('remindersEnabled');
  
  if (remindersEnabled && currentSession.totalSecs >= sessionLimit) {
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'conscious',
      message: `You've been on ${currentSession.domain} for ${Math.floor(currentSession.totalSecs / 60)} minutes. Consider taking a break!`
    });
    
    // Disable further notifications for this session
    await setSetting('remindersEnabled', false);
    setTimeout(async () => {
      await setSetting('remindersEnabled', true);
    }, 300000); // Re-enable after 5 minutes
  }
};

// Tab event listeners
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await handleTabChange(tab);
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    await handleTabChange(tab);
  }
});

const handleTabChange = async (tab) => {
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    await endSession();
    return;
  }

  const domain = getDomainFromUrl(tab.url);
  const isWhitelisted = await isWhitelistedDomain(domain);
  
  if (isWhitelisted) {
    if (!currentSession || currentSession.domain !== domain) {
      await startSession(domain, tab.url);
    }
  } else {
    await endSession();
  }
};

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_CURRENT_SESSION':
      sendResponse({
        session: currentSession,
        isActive: isUserActive,
        lastActivity: lastActivityTime
      });
      break;
      
    case 'ACTIVITY_UPDATE':
      updateActivity();
      sendResponse({ success: true });
      break;
      
    case 'GET_SESSIONS':
      handleGetSessions(request, sendResponse);
      return true; // Keep message channel open
      
    case 'GET_SETTINGS':
      handleGetSettings(sendResponse);
      return true;
      
    case 'UPDATE_SETTINGS':
      handleUpdateSettings(request, sendResponse);
      return true;
      
    case 'EXPORT_DATA':
      handleExportData(sendResponse);
      return true;
      
    case 'IMPORT_DATA':
      handleImportData(request, sendResponse);
      return true;
      
    case 'CLEAR_DATA':
      handleClearData(request, sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

const handleGetSessions = async (request, sendResponse) => {
  if (!db) await initDB();
  
  try {
    const { startDate, endDate, domain } = request;
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    
    let sessions = await store.getAll();
    
    // Apply filters
    if (startDate || endDate || domain) {
      sessions = sessions.filter(session => {
        if (startDate && session.date < startDate) return false;
        if (endDate && session.date > endDate) return false;
        if (domain && session.domain !== domain) return false;
        return true;
      });
    }
    
    // Sort by start time (newest first)
    sessions.sort((a, b) => b.startTime - a.startTime);
    
    sendResponse({ success: true, sessions });
  } catch (error) {
    console.error('Error getting sessions:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const handleGetSettings = async (sendResponse) => {
  if (!db) await initDB();
  
  try {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const allSettings = await store.getAll();
    
    const settings = {};
    allSettings.forEach(item => {
      settings[item.key] = item.value;
    });
    
    sendResponse({ success: true, settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const handleUpdateSettings = async (request, sendResponse) => {
  try {
    const { settings } = request;
    
    for (const [key, value] of Object.entries(settings)) {
      await setSetting(key, value);
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const handleExportData = async (sendResponse) => {
  if (!db) await initDB();
  
  try {
    const tx = db.transaction(['sessions', 'settings'], 'readonly');
    const sessionsStore = tx.objectStore('sessions');
    const settingsStore = tx.objectStore('settings');
    
    const sessions = await sessionsStore.getAll();
    const settingsArray = await settingsStore.getAll();
    
    const settings = {};
    settingsArray.forEach(item => {
      settings[item.key] = item.value;
    });
    
    const exportData = {
      version: '1.1.0',
      exportDate: new Date().toISOString(),
      sessions,
      settings
    };
    
    sendResponse({ success: true, data: exportData });
  } catch (error) {
    console.error('Error exporting data:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const handleImportData = async (request, sendResponse) => {
  if (!db) await initDB();
  
  try {
    const { data } = request;
    
    if (!data.sessions || !data.settings) {
      throw new Error('Invalid import data format');
    }
    
    const tx = db.transaction(['sessions', 'settings'], 'readwrite');
    const sessionsStore = tx.objectStore('sessions');
    const settingsStore = tx.objectStore('settings');
    
    // Import sessions (with conflict resolution)
    for (const session of data.sessions) {
      const existing = await sessionsStore.get(session.sessionId);
      if (!existing) {
        await sessionsStore.put(session);
      }
    }
    
    // Import settings
    for (const [key, value] of Object.entries(data.settings)) {
      await settingsStore.put({ key, value });
    }
    
    await tx.done;
    
    sendResponse({ success: true, imported: data.sessions.length });
  } catch (error) {
    console.error('Error importing data:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const handleClearData = async (request, sendResponse) => {
  if (!db) await initDB();
  
  try {
    const { type } = request;
    
    if (type === 'sessions' || type === 'all') {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      await store.clear();
      await tx.done;
    }
    
    if (type === 'settings' || type === 'all') {
      // Reset to defaults instead of clearing
      const defaultSettings = {
        whitelist: DEFAULT_WHITELIST,
        sessionLimit: 1800,
        remindersEnabled: true,
        idleTimeout: 300,
        lastExportDate: null,
        darkTheme: true,
        animationsEnabled: true
      };
      
      for (const [key, value] of Object.entries(defaultSettings)) {
        await setSetting(key, value);
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error clearing data:', error);
    sendResponse({ success: false, error: error.message });
  }
};

// Cleanup old sessions (run daily)
chrome.alarms.create('cleanup', { periodInMinutes: 24 * 60 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cleanup') {
    await cleanupOldSessions();
  }
});

const cleanupOldSessions = async () => {
  if (!db) await initDB();
  
  try {
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const index = store.index('startTime');
    
    const oldSessions = await index.getAll(IDBKeyRange.upperBound(oneYearAgo));
    
    for (const session of oldSessions) {
      await store.delete(session.sessionId);
    }
    
    await tx.done;
    
    console.log(`Cleaned up ${oldSessions.length} old sessions`);
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
  }
};

// Handle extension shutdown
chrome.runtime.onSuspend.addListener(async () => {
  await endSession();
});