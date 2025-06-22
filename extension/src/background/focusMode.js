// Focus Mode Implementation - Extension to Background Script

// Add to background.js - Focus Mode functionality
let focusModeState = {
  active: false,
  blockedDomains: new Set(),
  sessionBlocks: new Set(), // Temporary blocks for current session
};

// Handle focus mode messages
const handleFocusModeMessage = (request, sender, sendResponse) => {
  switch (request.type) {
    case 'TOGGLE_FOCUS_MODE':
      toggleFocusMode(request.domain, sendResponse);
      return true;
      
    case 'CHECK_FOCUS_MODE':
      checkFocusMode(request.domain, sendResponse);
      return true;
      
    case 'DISABLE_FOCUS_MODE':
      disableFocusMode(request.domain, sendResponse);
      return true;
      
    case 'GET_FOCUS_STATUS':
      getFocusStatus(sendResponse);
      return true;
  }
};

const toggleFocusMode = async (domain, sendResponse) => {
  try {
    if (focusModeState.sessionBlocks.has(domain)) {
      // Remove from blocked domains
      focusModeState.sessionBlocks.delete(domain);
      
      // Send message to content script to remove overlay
      const tabs = await chrome.tabs.query({ url: `*://${domain}/*` });
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'REMOVE_FOCUS_MODE' });
      });
      
      sendResponse({ success: true, blocked: false });
    } else {
      // Add to blocked domains
      focusModeState.sessionBlocks.add(domain);
      
      // Send message to content script to apply overlay
      const tabs = await chrome.tabs.query({ url: `*://${domain}/*` });
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'APPLY_FOCUS_MODE' });
      });
      
      sendResponse({ success: true, blocked: true });
    }
  } catch (error) {
    console.error('Error toggling focus mode:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const checkFocusMode = (domain, sendResponse) => {
  const isBlocked = focusModeState.sessionBlocks.has(domain);
  sendResponse({ focusModeActive: isBlocked });
};

const disableFocusMode = async (domain, sendResponse) => {
  try {
    focusModeState.sessionBlocks.delete(domain);
    
    // Send message to content script to remove overlay
    const tabs = await chrome.tabs.query({ url: `*://${domain}/*` });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { type: 'REMOVE_FOCUS_MODE' });
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error disabling focus mode:', error);
    sendResponse({ success: false, error: error.message });
  }
};

const getFocusStatus = (sendResponse) => {
  sendResponse({
    success: true,
    data: {
      active: focusModeState.active,
      blockedDomains: Array.from(focusModeState.sessionBlocks),
    }
  });
};

// Enhanced nudge checking with focus mode suggestions
const checkNudgesEnhanced = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const logs = await getTimeLogs(today.getTime(), tomorrow.getTime());
  const aggregates = aggregateTimeLogs(logs);
  
  // Check category limits
  const categoryLimits = {
    social: 7200000, // 2 hours
    entertainment: 10800000, // 3 hours
    news: 3600000, // 1 hour
  };
  
  for (const [category, limit] of Object.entries(categoryLimits)) {
    const timeSpent = aggregates.byCategory[category] || 0;
    
    if (timeSpent > limit) {
      // Create notification with focus mode option
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Conscious Media',
        message: `You've spent ${Math.round(timeSpent / 3600000 * 10) / 10} hours on ${category} today. Consider taking a break!`,
        buttons: [
          { title: 'Enable Focus Mode' },
          { title: 'Dismiss' }
        ]
      });
    }
  }
  
  // Check individual domain limits
  const domainLimits = {
    'facebook.com': 1800000, // 30 minutes
    'twitter.com': 1800000, // 30 minutes
    'youtube.com': 3600000, // 1 hour
  };
  
  for (const [domain, limit] of Object.entries(domainLimits)) {
    const timeSpent = aggregates.byDomain[domain] || 0;
    
    if (timeSpent > limit) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Conscious Media',
        message: `You've spent ${Math.round(timeSpent / 60000)} minutes on ${domain} today.`,
        buttons: [
          { title: 'Block Site' },
          { title: 'Dismiss' }
        ]
      });
    }
  }
};

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Enable focus mode or block site
    // This would need to be enhanced to know which domain triggered the notification
    chrome.notifications.clear(notificationId);
  } else {
    // Dismiss
    chrome.notifications.clear(notificationId);
  }
});

// Export focus mode functions for use in other parts of the extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleFocusMode,
    checkFocusMode,
    disableFocusMode,
    getFocusStatus,
    handleFocusModeMessage,
  };
}

