// Content Script for Activity Tracking
(function() {
  'use strict';

  // Avoid running multiple times
  if (window.consciousActivityTracker) {
    return;
  }
  window.consciousActivityTracker = true;

  let lastActivityTime = Date.now();
  let activityThrottle = null;

  // Activity events to track
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown', 'scroll', 
    'touchstart', 'click', 'focus', 'blur'
  ];

  // Throttled activity update function
  const updateActivity = () => {
    if (activityThrottle) return;
    
    activityThrottle = setTimeout(() => {
      lastActivityTime = Date.now();
      
      // Send activity update to background script
      chrome.runtime.sendMessage({
        type: 'ACTIVITY_UPDATE',
        timestamp: lastActivityTime
      }).catch(() => {
        // Ignore errors if background script is not ready
      });
      
      activityThrottle = null;
    }, 1000); // Throttle to once per second
  };

  // Add event listeners for activity detection
  activityEvents.forEach(eventType => {
    document.addEventListener(eventType, updateActivity, {
      passive: true,
      capture: true
    });
  });

  // Handle visibility changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateActivity();
    }
  });

  // Handle window focus/blur
  window.addEventListener('focus', updateActivity);
  window.addEventListener('blur', updateActivity);

  // Initial activity signal
  updateActivity();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (activityThrottle) {
      clearTimeout(activityThrottle);
    }
  });

})();