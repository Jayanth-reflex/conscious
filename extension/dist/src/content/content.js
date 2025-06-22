// Content Script for Source Bias Overlay
(function() {
  'use strict';

  // Avoid running multiple times on the same page
  if (window.consciousMediaContentScript) {
    return;
  }
  window.consciousMediaContentScript = true;

  // Configuration
  const BIAS_DOT_SIZE = '8px';
  const BIAS_COLORS = {
    'left': '#FF6B6B',
    'lean-left': '#FF9999',
    'center': '#4ECDC4',
    'lean-right': '#FFB366',
    'right': '#FF8C42',
    'unknown': '#95A5A6'
  };

  // Cache for bias data to avoid repeated requests
  const biasCache = new Map();

  // Focus mode state
  let focusModeActive = false;

  /**
   * Extract unique domains from links and articles on the page
   */
  function extractDomains() {
    const domains = new Set();
    
    // Get domains from links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      try {
        const url = new URL(link.href);
        if (url.hostname && url.hostname !== window.location.hostname) {
          domains.add(url.hostname);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    // Get domains from article sources (if any meta tags exist)
    const metaTags = document.querySelectorAll('meta[property="article:author"], meta[name="author"]');
    metaTags.forEach(meta => {
      const content = meta.getAttribute('content');
      if (content) {
        try {
          const url = new URL(content);
          domains.add(url.hostname);
        } catch (e) {
          // Not a URL, skip
        }
      }
    });

    return Array.from(domains);
  }

  /**
   * Request bias data for a domain from the background script
   */
  async function getBiasData(domain) {
    if (biasCache.has(domain)) {
      return biasCache.get(domain);
    }

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'GET_BIAS', domain },
        (response) => {
          if (response && response.success) {
            biasCache.set(domain, response.data);
            resolve(response.data);
          } else {
            const fallbackData = {
              domain,
              biasRating: 'unknown',
              credibility: 0,
              lastFetched: Date.now()
            };
            biasCache.set(domain, fallbackData);
            resolve(fallbackData);
          }
        }
      );
    });
  }

  /**
   * Create a bias indicator dot
   */
  function createBiasDot(biasData) {
    const dot = document.createElement('span');
    dot.className = 'conscious-media-bias-dot';
    dot.style.cssText = `
      display: inline-block;
      width: ${BIAS_DOT_SIZE};
      height: ${BIAS_DOT_SIZE};
      border-radius: 50%;
      background-color: ${BIAS_COLORS[biasData.biasRating] || BIAS_COLORS.unknown};
      margin-right: 4px;
      vertical-align: middle;
      cursor: help;
      position: relative;
      z-index: 10000;
    `;
    
    // Add tooltip
    const tooltip = `${biasData.domain}\nBias: ${biasData.biasRating}\nCredibility: ${biasData.credibility}/100`;
    dot.title = tooltip;
    
    return dot;
  }

  /**
   * Add bias indicators to links
   */
  async function addBiasIndicators() {
    const domains = extractDomains();
    
    // Get bias data for all domains
    const biasPromises = domains.map(domain => getBiasData(domain));
    const biasDataArray = await Promise.all(biasPromises);
    
    // Create a map for quick lookup
    const biasMap = new Map();
    biasDataArray.forEach(data => {
      biasMap.set(data.domain, data);
    });

    // Add dots to relevant links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      try {
        const url = new URL(link.href);
        const biasData = biasMap.get(url.hostname);
        
        if (biasData && !link.querySelector('.conscious-media-bias-dot')) {
          const dot = createBiasDot(biasData);
          link.insertBefore(dot, link.firstChild);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
  }

  /**
   * Apply focus mode overlay
   */
  function applyFocusMode() {
    if (focusModeActive) return;
    
    focusModeActive = true;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'conscious-media-focus-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 24px;
      text-align: center;
      pointer-events: auto;
    `;
    
    overlay.innerHTML = `
      <div>
        <h2 style="margin-bottom: 20px;">Focus Mode Active</h2>
        <p style="margin-bottom: 30px;">This site is currently blocked to help you stay focused.</p>
        <button id="conscious-media-disable-focus" style="
          background: #4ECDC4;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        ">Disable Focus Mode</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add click handler to disable focus mode
    document.getElementById('conscious-media-disable-focus').addEventListener('click', () => {
      removeFocusMode();
      chrome.runtime.sendMessage({ type: 'DISABLE_FOCUS_MODE', domain: window.location.hostname });
    });
    
    // Disable page interactions
    document.body.style.pointerEvents = 'none';
    overlay.style.pointerEvents = 'auto';
  }

  /**
   * Remove focus mode overlay
   */
  function removeFocusMode() {
    focusModeActive = false;
    
    const overlay = document.getElementById('conscious-media-focus-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    document.body.style.pointerEvents = '';
  }

  /**
   * Handle messages from background script
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case 'APPLY_FOCUS_MODE':
        applyFocusMode();
        sendResponse({ success: true });
        break;
        
      case 'REMOVE_FOCUS_MODE':
        removeFocusMode();
        sendResponse({ success: true });
        break;
        
      case 'REFRESH_BIAS_INDICATORS':
        addBiasIndicators();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  });

  /**
   * Initialize content script
   */
  function init() {
    // Add bias indicators on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addBiasIndicators);
    } else {
      addBiasIndicators();
    }

    // Re-add indicators when new content is loaded (for SPAs)
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain links
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'A' || node.querySelector('a')) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        // Debounce the update to avoid excessive calls
        clearTimeout(window.consciousMediaUpdateTimeout);
        window.consciousMediaUpdateTimeout = setTimeout(addBiasIndicators, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Check if focus mode should be applied for this domain
    chrome.runtime.sendMessage(
      { type: 'CHECK_FOCUS_MODE', domain: window.location.hostname },
      (response) => {
        if (response && response.focusModeActive) {
          applyFocusMode();
        }
      }
    );
  }

  // Start the content script
  init();

})();

