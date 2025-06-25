import { getTodaySessions } from '../lib/db';
import { formatTime, getDomain } from '../lib/utils';

let currentSessionTimer: number | null = null;
let currentSessionData = { totalSecs: 0, activeSecs: 0, status: 'idle', domain: '' };

// DOM elements
const timerElement = document.getElementById('timer') as HTMLElement | null;
const statusElement = document.getElementById('status') as HTMLElement | null;
const domainElement = document.getElementById('current-domain') as HTMLElement | null;
const totalTimeElement = document.getElementById('total-time') as HTMLElement | null;
const activeTimeElement = document.getElementById('active-time') as HTMLElement | null;
const dashboardBtn = document.getElementById('dashboard-btn') as HTMLButtonElement | null;
const exportBtn = document.getElementById('export-btn') as HTMLButtonElement | null;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement | null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadTodaySummary();
    setupEventListeners();
    startCurrentSessionTimer();
    // Minimal test: send a ping to background on popup load
    chrome.runtime.sendMessage({ test: 'ping' }, (resp) => {
      console.log('Popup got response:', resp, chrome.runtime.lastError);
    });
  } catch (err) {
    console.error('Popup initialization error:', err);
    showError('Failed to initialize popup.');
  }
});

async function loadTodaySummary() {
  try {
    const sessions = await getTodaySessions();
    let totalSeconds = 0;
    let activeSeconds = 0;
    sessions.forEach(session => {
      totalSeconds += session.totalSecs;
      activeSeconds += session.activeSecs;
    });
    if (totalTimeElement) totalTimeElement.textContent = formatTime(totalSeconds);
    if (activeTimeElement) activeTimeElement.textContent = formatTime(activeSeconds);
  } catch (err) {
    console.error('Error loading today summary:', err);
    showError('Failed to load today summary.');
  }
}

function startCurrentSessionTimer() {
  // Get current session data from background script
  try {
    chrome.runtime.sendMessage({ action: 'getCurrentSession' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting current session:', chrome.runtime.lastError);
        showError('Background not available.');
        return;
      }
      if (response && response.session) {
        currentSessionData = response.session;
        updateCurrentSessionDisplay();
      }
    });
    // Update every second
    currentSessionTimer = setInterval(() => {
      try {
        chrome.runtime.sendMessage({ action: 'getCurrentSession' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error getting current session:', chrome.runtime.lastError);
            showError('Background not available.');
            return;
          }
          if (response && response.session) {
            currentSessionData = response.session;
            updateCurrentSessionDisplay();
          }
        });
      } catch (err) {
        console.error('Error in session timer interval:', err);
        showError('Failed to update session timer.');
      }
    }, 1000);
  } catch (err) {
    console.error('Error starting session timer:', err);
    showError('Failed to start session timer.');
  }
}

function updateCurrentSessionDisplay() {
  if (timerElement) timerElement.textContent = formatTime(currentSessionData.totalSecs);
  if (statusElement) {
    statusElement.textContent = currentSessionData.status === 'active' ? 'Active' : 'Idle';
    statusElement.style.color = currentSessionData.status === 'active' ? '#03DAC6' : '#FFA726';
  }
  if (domainElement) domainElement.textContent = currentSessionData.domain || 'No active session';
}

function setupEventListeners() {
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      try {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html') });
        window.close();
      } catch (err) {
        console.error('Dashboard button error:', err);
        showError('Failed to open dashboard.');
      }
    });
  }
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        chrome.runtime.sendMessage({ action: 'exportData' });
        window.close();
      } catch (err) {
        console.error('Export button error:', err);
        showError('Failed to export data.');
      }
    });
  }
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      try {
        chrome.runtime.openOptionsPage();
        window.close();
      } catch (err) {
        console.error('Settings button error:', err);
        showError('Failed to open settings.');
      }
    });
  }
}

function showError(msg: string) {
  // Show a user-friendly error message in the popup (could be improved with a dedicated error div)
  alert(msg);
}

// Clean up on popup close
window.addEventListener('beforeunload', () => {
  if (currentSessionTimer) {
    clearInterval(currentSessionTimer);
  }
});
