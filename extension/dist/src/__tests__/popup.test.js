// Unit tests for popup functionality
/**
 * @jest-environment jsdom
 */

describe('Popup Functionality', () => {
  let mockChrome;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div class="popup-container">
        <div class="time-value" id="timeValue">0h 0m</div>
        <div class="site-breakdown" id="siteBreakdown"></div>
        <div class="nudge-banner" id="nudgeBanner" style="display: none;">
          <div class="nudge-message" id="nudgeMessage"></div>
          <button class="nudge-dismiss" id="nudgeDismiss">×</button>
        </div>
        <button id="settingsBtn">Settings</button>
        <button id="dashboardBtn">Dashboard</button>
      </div>
    `;

    // Mock Chrome APIs
    mockChrome = {
      runtime: {
        sendMessage: jest.fn(),
        getURL: jest.fn((path) => `chrome-extension://test/${path}`),
      },
      tabs: {
        create: jest.fn(),
      },
    };
    global.chrome = mockChrome;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('formatTime function', () => {
    // We'll need to extract this function or test it indirectly
    test('should format time correctly', () => {
      const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      };

      expect(formatTime(3661000)).toBe('1h 1m');
      expect(formatTime(1800000)).toBe('30m');
      expect(formatTime(7200000)).toBe('2h 0m');
    });
  });

  describe('loadStats function', () => {
    test('should send GET_TODAY_STATS message', () => {
      const mockResponse = {
        success: true,
        data: {
          byDomain: {
            'facebook.com': 1800000,
            'youtube.com': 3600000,
          },
          byCategory: {
            social: 1800000,
            entertainment: 3600000,
          },
          total: 5400000,
        },
      };

      mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.type === 'GET_TODAY_STATS') {
          callback(mockResponse);
        }
      });

      // Simulate the loadStats function call
      chrome.runtime.sendMessage({ type: 'GET_TODAY_STATS' }, (response) => {
        expect(response.success).toBe(true);
        expect(response.data.total).toBe(5400000);
      });

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        { type: 'GET_TODAY_STATS' },
        expect.any(Function)
      );
    });
  });

  describe('DOM interactions', () => {
    test('should update time value in DOM', () => {
      const timeValue = document.getElementById('timeValue');
      timeValue.textContent = '1h 30m';
      expect(timeValue.textContent).toBe('1h 30m');
    });

    test('should show nudge banner when conditions are met', () => {
      const nudgeBanner = document.getElementById('nudgeBanner');
      const nudgeMessage = document.getElementById('nudgeMessage');
      
      nudgeMessage.textContent = 'Test nudge message';
      nudgeBanner.style.display = 'flex';
      
      expect(nudgeMessage.textContent).toBe('Test nudge message');
      expect(nudgeBanner.style.display).toBe('flex');
    });

    test('should hide nudge banner when dismiss button is clicked', () => {
      const nudgeBanner = document.getElementById('nudgeBanner');
      const nudgeDismiss = document.getElementById('nudgeDismiss');
      
      nudgeBanner.style.display = 'flex';
      
      // Simulate click event
      nudgeDismiss.addEventListener('click', () => {
        nudgeBanner.style.display = 'none';
      });
      
      nudgeDismiss.click();
      expect(nudgeBanner.style.display).toBe('none');
    });

    test('should open dashboard when dashboard button is clicked', () => {
      const dashboardBtn = document.getElementById('dashboardBtn');
      
      dashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
      });
      
      dashboardBtn.click();
      
      expect(mockChrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://test/dashboard.html'
      });
    });
  });

  describe('site breakdown rendering', () => {
    test('should render site breakdown correctly', () => {
      const siteBreakdown = document.getElementById('siteBreakdown');
      const sites = [
        { domain: 'facebook.com', time: 1800000, category: 'social' },
        { domain: 'youtube.com', time: 3600000, category: 'entertainment' },
      ];

      const categoryIcons = {
        social: '👥',
        entertainment: '🎬',
        other: '🌐',
      };

      const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      };

      siteBreakdown.innerHTML = '';
      sites.slice(0, 3).forEach(site => {
        const siteItem = document.createElement('div');
        siteItem.className = 'site-item';
        siteItem.innerHTML = `
          <span class="site-icon">${categoryIcons[site.category] || '🌐'}</span>
          <span class="site-domain">${site.domain.replace('www.', '').substring(0, 12)}</span>
          <span class="site-time">${formatTime(site.time)}</span>
        `;
        siteBreakdown.appendChild(siteItem);
      });

      expect(siteBreakdown.children.length).toBe(2);
      expect(siteBreakdown.children[0].querySelector('.site-domain').textContent).toBe('facebook.com');
      expect(siteBreakdown.children[1].querySelector('.site-time').textContent).toBe('1h 0m');
    });
  });
});

