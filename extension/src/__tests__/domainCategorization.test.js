// Unit tests for domain categorization
import { 
  categorizeDomain, 
  getCategoryColor, 
  getCategoryIcon, 
  formatDuration,
  getAllCategories 
} from '../src/utils/domainCategorization.js';

describe('Domain Categorization', () => {
  describe('categorizeDomain', () => {
    test('should categorize social media domains correctly', () => {
      expect(categorizeDomain('facebook.com')).toBe('social');
      expect(categorizeDomain('www.facebook.com')).toBe('social');
      expect(categorizeDomain('twitter.com')).toBe('social');
      expect(categorizeDomain('instagram.com')).toBe('social');
      expect(categorizeDomain('linkedin.com')).toBe('social');
    });

    test('should categorize entertainment domains correctly', () => {
      expect(categorizeDomain('youtube.com')).toBe('entertainment');
      expect(categorizeDomain('netflix.com')).toBe('entertainment');
      expect(categorizeDomain('twitch.tv')).toBe('entertainment');
      expect(categorizeDomain('spotify.com')).toBe('entertainment');
    });

    test('should categorize news domains correctly', () => {
      expect(categorizeDomain('cnn.com')).toBe('news');
      expect(categorizeDomain('bbc.com')).toBe('news');
      expect(categorizeDomain('nytimes.com')).toBe('news');
      expect(categorizeDomain('reuters.com')).toBe('news');
    });

    test('should categorize utility domains correctly', () => {
      expect(categorizeDomain('gmail.com')).toBe('utility');
      expect(categorizeDomain('google.com')).toBe('utility');
      expect(categorizeDomain('github.com')).toBe('utility');
      expect(categorizeDomain('stackoverflow.com')).toBe('utility');
    });

    test('should return "other" for unknown domains', () => {
      expect(categorizeDomain('unknown-domain.com')).toBe('other');
      expect(categorizeDomain('random-site.org')).toBe('other');
    });

    test('should handle case insensitive domains', () => {
      expect(categorizeDomain('FACEBOOK.COM')).toBe('social');
      expect(categorizeDomain('YouTube.COM')).toBe('entertainment');
    });

    test('should handle subdomains correctly', () => {
      expect(categorizeDomain('mail.google.com')).toBe('utility');
      expect(categorizeDomain('docs.google.com')).toBe('utility');
    });
  });

  describe('getCategoryColor', () => {
    test('should return correct colors for categories', () => {
      expect(getCategoryColor('social')).toBe('#FF6B6B');
      expect(getCategoryColor('entertainment')).toBe('#4ECDC4');
      expect(getCategoryColor('news')).toBe('#45B7D1');
      expect(getCategoryColor('utility')).toBe('#96CEB4');
    });

    test('should return default color for unknown category', () => {
      expect(getCategoryColor('unknown')).toBe('#95A5A6');
    });
  });

  describe('getCategoryIcon', () => {
    test('should return correct icons for categories', () => {
      expect(getCategoryIcon('social')).toBe('👥');
      expect(getCategoryIcon('entertainment')).toBe('🎬');
      expect(getCategoryIcon('news')).toBe('📰');
      expect(getCategoryIcon('utility')).toBe('🔧');
    });

    test('should return default icon for unknown category', () => {
      expect(getCategoryIcon('unknown')).toBe('🌐');
    });
  });

  describe('formatDuration', () => {
    test('should format hours and minutes correctly', () => {
      expect(formatDuration(3661000)).toBe('1h 1m'); // 1 hour 1 minute 1 second
      expect(formatDuration(7200000)).toBe('2h'); // 2 hours exactly
      expect(formatDuration(3900000)).toBe('1h 5m'); // 1 hour 5 minutes
    });

    test('should format minutes correctly', () => {
      expect(formatDuration(300000)).toBe('5m'); // 5 minutes
      expect(formatDuration(1800000)).toBe('30m'); // 30 minutes
    });

    test('should format seconds correctly', () => {
      expect(formatDuration(30000)).toBe('30s'); // 30 seconds
      expect(formatDuration(5000)).toBe('5s'); // 5 seconds
    });

    test('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });

  describe('getAllCategories', () => {
    test('should return all available categories', () => {
      const categories = getAllCategories();
      expect(categories).toContain('social');
      expect(categories).toContain('entertainment');
      expect(categories).toContain('news');
      expect(categories).toContain('utility');
      expect(categories).toContain('shopping');
      expect(categories).toContain('education');
      expect(categories).toContain('other');
    });

    test('should return an array', () => {
      expect(Array.isArray(getAllCategories())).toBe(true);
    });
  });
});

