// Background Script for Time Tracking
import { openDB } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

// IndexedDB setup
let db;

const initDB = async () => {
  db = await openDB('consciousMediaDB', 1, {
    upgrade(db) {
      // Create time_logs object store
      const timeLogsStore = db.createObjectStore('time_logs', { keyPath: 'id' });
      timeLogsStore.createIndex('domain', 'domain');
      timeLogsStore.createIndex('category', 'category');
      timeLogsStore.createIndex('startTs', 'startTs');

      // Create settings object store
      db.createObjectStore('settings', { keyPath: 'key' });

      // Create bias_cache object store
      const biasCacheStore = db.createObjectStore('bias_cache', { keyPath: 'domain' });
      biasCacheStore.createIndex('lastFetched', 'lastFetched');
    },
  });
};

// Domain categorization mapping
const domainCategories = {
  'facebook.com': 'social',
  'twitter.com': 'social',
  'instagram.com': 'social',
  'linkedin.com': 'social',
  'reddit.com': 'social',
  'youtube.com': 'entertainment',
  'netflix.com': 'entertainment',
  'cnn.com': 'news',
  'bbc.com': 'news',
  'nytimes.com': 'news',
  'washingtonpost.com': 'news',
  'gmail.com': 'utility',
  'google.com': 'utility',
  'github.com': 'utility',
  'stackoverflow.com': 'utility',
};

const categorizeDomain = (domain) => {
  return domainCategories[domain] || 'other';
};

// Time tracking state
let currentTimeLog = null;
let lastActiveTabId = null;

// Initialize database on startup
initDB();

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabChange(activeInfo.tabId);
});

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    await handleTabChange(tabId);
  }
});

// Handle tab changes and time logging
const handleTabChange = async (tabId) => {
  const now = Date.now();
  
  // End current time log if exists
  if (currentTimeLog) {
    currentTimeLog.endTs = now;
    await saveTimeLog(currentTimeLog);
  }

  // Get current tab info
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && !tab.url.startsWith('chrome://')) {
      const url = new URL(tab.url);
      const domain = url.hostname;
      const category = categorizeDomain(domain);

      // Start new time log
      currentTimeLog = {
        id: uuidv4(),
        domain,
        category,
        startTs: now,
        endTs: null,
      };
    }
  } catch (error) {
    console.error('Error getting tab info:', error);
    currentTimeLog = null;
  }

  lastActiveTabId = tabId;
};

// Save time log to IndexedDB
const saveTimeLog = async (timeLog) => {
  if (!db) await initDB();
  
  try {
    const tx = db.transaction('time_logs', 'readwrite');
    await tx.objectStore('time_logs').put(timeLog);
    await tx.done;
  } catch (error) {
    console.error('Error saving time log:', error);
  }
};

// Get time logs for a date range
const getTimeLogs = async (startDate, endDate) => {
  if (!db) await initDB();
  
  try {
    const tx = db.transaction('time_logs', 'readonly');
    const store = tx.objectStore('time_logs');
    const index = store.index('startTs');
    const range = IDBKeyRange.bound(startDate, endDate);
    const logs = await index.getAll(range);
    return logs;
  } catch (error) {
    console.error('Error getting time logs:', error);
    return [];
  }
};

// Aggregate time logs by category/domain
const aggregateTimeLogs = (logs) => {
  const aggregates = {
    byCategory: {},
    byDomain: {},
    total: 0,
  };

  logs.forEach(log => {
    if (log.endTs) {
      const duration = log.endTs - log.startTs;
      
      // Aggregate by category
      if (!aggregates.byCategory[log.category]) {
        aggregates.byCategory[log.category] = 0;
      }
      aggregates.byCategory[log.category] += duration;
      
      // Aggregate by domain
      if (!aggregates.byDomain[log.domain]) {
        aggregates.byDomain[log.domain] = 0;
      }
      aggregates.byDomain[log.domain] += duration;
      
      aggregates.total += duration;
    }
  });

  return aggregates;
};

// Message handling for popup/dashboard communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_TODAY_STATS':
      handleGetTodayStats(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'GET_WEEKLY_STATS':
      handleGetWeeklyStats(sendResponse);
      return true;
      
    case 'GET_BIAS':
      handleGetBias(request.domain, sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

const handleGetTodayStats = async (sendResponse) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const logs = await getTimeLogs(today.getTime(), tomorrow.getTime());
  const aggregates = aggregateTimeLogs(logs);
  
  sendResponse({ success: true, data: aggregates });
};

const handleGetWeeklyStats = async (sendResponse) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  const logs = await getTimeLogs(weekAgo.getTime(), today.getTime());
  const aggregates = aggregateTimeLogs(logs);
  
  sendResponse({ success: true, data: aggregates });
};

const handleGetBias = async (domain, sendResponse) => {
  // This would integrate with MediaBiasFactCheck API
  // For now, return mock data
  const mockBiasData = {
    domain,
    biasRating: 'center',
    credibility: 75,
    lastFetched: Date.now(),
  };
  
  sendResponse({ success: true, data: mockBiasData });
};

// Alarm for periodic checks (nudges, cleanup)
chrome.alarms.create('periodicCheck', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodicCheck') {
    checkNudges();
  }
});

const checkNudges = async () => {
  // Check if user has exceeded daily limits
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const logs = await getTimeLogs(today.getTime(), tomorrow.getTime());
  const aggregates = aggregateTimeLogs(logs);
  
  // Example: Check if social media time exceeds 2 hours (7200000 ms)
  if (aggregates.byCategory.social > 7200000) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Conscious Media',
      message: 'You\'ve spent over 2 hours on social media today. Consider taking a break!',
    });
  }
};

