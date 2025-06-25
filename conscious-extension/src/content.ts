// Content script for user activity detection
// This script runs on all web pages to detect user interactions

console.log('Content script loaded');
chrome.runtime.sendMessage({ test: 'ping' }, (resp) => {
  console.log('Content got response:', resp, chrome.runtime.lastError);
});

let lastActivity = Date.now();

function resetIdleCounter() {
  lastActivity = Date.now();
  try {
    chrome.runtime.sendMessage({ action: 'resetIdle' }, () => {
      if (chrome.runtime.lastError) {
        // Ignore or log error
      }
    });
  } catch (e) {
    // Ignore or log error
  }
}

// Add event listeners for user activity
document.addEventListener('mousemove', resetIdleCounter, { passive: true });
document.addEventListener('keydown', resetIdleCounter, { passive: true });
document.addEventListener('click', resetIdleCounter, { passive: true });
document.addEventListener('scroll', resetIdleCounter, { passive: true });

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.status === 'idle') {
    // Could add visual indicators here for idle state
    console.log('User is idle');
  }
  
  if (message.action === 'checkActivity') {
    const timeSinceActivity = Date.now() - lastActivity;
    sendResponse({ timeSinceActivity });
  }
});

// Initialize
resetIdleCounter();
