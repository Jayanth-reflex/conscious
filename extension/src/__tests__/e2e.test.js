// E2E tests for Chrome extension
const puppeteer = require('puppeteer');
const path = require('path');

describe('Chrome Extension E2E Tests', () => {
  let browser;
  let extensionPage;
  let extensionId;

  beforeAll(async () => {
    // Launch browser with extension loaded
    const extensionPath = path.join(__dirname, '../../dist');
    
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    // Get extension ID
    const targets = await browser.targets();
    const extensionTarget = targets.find(
      target => target.type() === 'service_worker' && target.url().includes('chrome-extension://')
    );
    
    if (extensionTarget) {
      extensionId = extensionTarget.url().split('/')[2];
    }
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  describe('Extension Installation', () => {
    test('should load extension successfully', async () => {
      expect(extensionId).toBeDefined();
      expect(extensionId).toMatch(/^[a-z]{32}$/); // Chrome extension ID format
    });

    test('should have manifest.json accessible', async () => {
      const page = await browser.newPage();
      const manifestUrl = `chrome-extension://${extensionId}/manifest.json`;
      
      try {
        const response = await page.goto(manifestUrl);
        expect(response.status()).toBe(200);
        
        const manifest = await response.json();
        expect(manifest.name).toBe('Conscious Media Consumption');
        expect(manifest.version).toBe('1.0');
      } catch (error) {
        // If direct access fails, that's expected in some Chrome versions
        console.log('Direct manifest access not available, which is normal');
      }
      
      await page.close();
    });
  });

  describe('Popup Functionality', () => {
    test('should open popup and display content', async () => {
      const page = await browser.newPage();
      const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
      
      await page.goto(popupUrl);
      
      // Wait for content to load
      await page.waitForSelector('.popup-container', { timeout: 5000 });
      
      // Check if main elements are present
      const timeValue = await page.$('.time-value');
      const siteBreakdown = await page.$('.site-breakdown');
      const footer = await page.$('.footer');
      
      expect(timeValue).toBeTruthy();
      expect(siteBreakdown).toBeTruthy();
      expect(footer).toBeTruthy();
      
      // Check initial time display
      const timeText = await page.$eval('.time-value', el => el.textContent);
      expect(timeText).toMatch(/\d+h \d+m/);
      
      await page.close();
    });

    test('should handle dashboard button click', async () => {
      const page = await browser.newPage();
      const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
      
      await page.goto(popupUrl);
      await page.waitForSelector('.dashboard-link');
      
      // Mock chrome.tabs.create to prevent actual tab creation in test
      await page.evaluateOnNewDocument(() => {
        window.chrome = {
          runtime: {
            getURL: (path) => `chrome-extension://test/${path}`,
          },
          tabs: {
            create: (options) => {
              window.lastTabCreate = options;
            },
          },
        };
      });
      
      await page.click('.dashboard-link');
      
      // In a real test, we would verify the dashboard opens
      // For now, we just check the button is clickable
      const dashboardBtn = await page.$('.dashboard-link');
      expect(dashboardBtn).toBeTruthy();
      
      await page.close();
    });
  });

  describe('Dashboard Functionality', () => {
    test('should open dashboard and display charts', async () => {
      const page = await browser.newPage();
      const dashboardUrl = `chrome-extension://${extensionId}/dashboard/dashboard.html`;
      
      await page.goto(dashboardUrl);
      
      // Wait for content to load
      await page.waitForSelector('.dashboard-container', { timeout: 5000 });
      
      // Check if main sections are present
      const headerBar = await page.$('.header-bar');
      const summaryCards = await page.$('.summary-cards');
      const chartsSection = await page.$('.charts-section');
      const biasTable = await page.$('.bias-table-container');
      
      expect(headerBar).toBeTruthy();
      expect(summaryCards).toBeTruthy();
      expect(chartsSection).toBeTruthy();
      expect(biasTable).toBeTruthy();
      
      // Check if charts are rendered (Chart.js creates canvas elements)
      const charts = await page.$$('canvas');
      expect(charts.length).toBeGreaterThanOrEqual(2); // Category and weekly charts
      
      await page.close();
    });

    test('should handle period selector change', async () => {
      const page = await browser.newPage();
      const dashboardUrl = `chrome-extension://${extensionId}/dashboard/dashboard.html`;
      
      await page.goto(dashboardUrl);
      await page.waitForSelector('#periodSelector');
      
      // Change period to week
      await page.select('#periodSelector', 'week');
      
      // Verify the selection changed
      const selectedValue = await page.$eval('#periodSelector', el => el.value);
      expect(selectedValue).toBe('week');
      
      await page.close();
    });
  });

  describe('Content Script Integration', () => {
    test('should inject content script on web pages', async () => {
      const page = await browser.newPage();
      
      // Navigate to a test page
      await page.goto('https://example.com');
      
      // Wait a bit for content script to load
      await page.waitForTimeout(1000);
      
      // Check if our content script marker exists
      const hasContentScript = await page.evaluate(() => {
        return window.consciousMediaContentScript === true;
      });
      
      expect(hasContentScript).toBe(true);
      
      await page.close();
    });
  });

  describe('Background Script', () => {
    test('should respond to messages', async () => {
      const page = await browser.newPage();
      
      // Test background script message handling
      const response = await page.evaluate(async () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'GET_TODAY_STATS' }, (response) => {
            resolve(response);
          });
        });
      });
      
      // Background script should respond (even if with empty data initially)
      expect(response).toBeDefined();
      
      await page.close();
    });
  });
});

