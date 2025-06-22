// Popup JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const sessionInfo = document.getElementById('sessionInfo');
  const noSession = document.getElementById('noSession');
  const activeSession = document.getElementById('activeSession');
  const siteIcon = document.getElementById('siteIcon');
  const siteName = document.getElementById('siteName');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const mainTimer = document.getElementById('mainTimer');
  const activeTimer = document.getElementById('activeTimer');
  const idleTimer = document.getElementById('idleTimer');
  const focusFill = document.getElementById('focusFill');
  const focusPercentage = document.getElementById('focusPercentage');
  const settingsBtn = document.getElementById('settingsBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const exportBtn = document.getElementById('exportBtn');

  // Site icons mapping
  const siteIcons = {
    'facebook.com': '📘',
    'twitter.com': '🐦',
    'instagram.com': '📷',
    'youtube.com': '📺',
    'reddit.com': '🤖',
    'linkedin.com': '💼',
    'tiktok.com': '🎵',
    'snapchat.com': '👻',
    'discord.com': '🎮',
    'twitch.tv': '🎮'
  };

  let updateInterval = null;

  // Format seconds to HH:MM:SS
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update session display
  function updateSessionDisplay(sessionData) {
    if (!sessionData || !sessionData.session) {
      // No active session
      noSession.style.display = 'block';
      activeSession.style.display = 'none';
      return;
    }

    const { session, isActive } = sessionData;
    
    // Show active session
    noSession.style.display = 'none';
    activeSession.style.display = 'block';
    
    // Update site info
    siteName.textContent = session.domain;
    siteIcon.textContent = siteIcons[session.domain] || '🌐';
    
    // Update activity status
    statusDot.className = `status-dot ${isActive ? '' : 'idle'}`;
    statusText.textContent = isActive ? 'Active' : 'Idle';
    
    // Update timers
    mainTimer.textContent = formatTime(session.totalSecs);
    activeTimer.textContent = formatTime(session.activeSecs);
    idleTimer.textContent = formatTime(session.idleSecs);
    
    // Update focus ratio
    const focusRatio = session.totalSecs > 0 ? (session.activeSecs / session.totalSecs) * 100 : 0;
    focusFill.style.width = `${focusRatio}%`;
    focusPercentage.textContent = `${Math.round(focusRatio)}%`;
  }

  // Load current session
  function loadCurrentSession() {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_SESSION' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting current session:', chrome.runtime.lastError);
        return;
      }
      updateSessionDisplay(response);
    });
  }

  // Listen for session updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SESSION_UPDATE') {
      updateSessionDisplay({
        session: message.session,
        isActive: message.isActive
      });
    }
  });

  // Event listeners
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/dashboard.html') });
    window.close();
  });

  dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/dashboard.html') });
    window.close();
  });

  exportBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'EXPORT_DATA' }, (response) => {
      if (response && response.success) {
        // Create and download file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `conscious-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      } else {
        console.error('Export failed:', response?.error);
      }
    });
  });

  // Initialize
  loadCurrentSession();
  
  // Update every second
  updateInterval = setInterval(loadCurrentSession, 1000);
  
  // Cleanup on popup close
  window.addEventListener('beforeunload', () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
});