import { formatTime, getDomain, uuid, isWhitelistedDomain } from './utils';

describe('Utils', () => {
  describe('formatTime', () => {
    it('should format seconds to HH:MM:SS', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(61)).toBe('00:01:01');
      expect(formatTime(3661)).toBe('01:01:01');
      expect(formatTime(86400)).toBe('24:00:00');
    });
  });

  describe('getDomain', () => {
    it('should extract domain from URL', () => {
      expect(getDomain('https://www.github.com/user/repo')).toBe('github.com');
      expect(getDomain('http://example.com')).toBe('example.com');
      expect(getDomain('https://subdomain.example.com/path')).toBe('subdomain.example.com');
    });

    it('should return empty string for invalid URLs', () => {
      expect(getDomain('invalid-url')).toBe('');
      expect(getDomain('')).toBe('');
    });
  });

  describe('uuid', () => {
    it('should generate valid UUID v4', () => {
      const id = uuid();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const id1 = uuid();
      const id2 = uuid();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isWhitelistedDomain', () => {
    const whitelist = ['github.com', 'stackoverflow.com', 'docs.google.com'];

    it('should return true for exact matches', () => {
      expect(isWhitelistedDomain('github.com', whitelist)).toBe(true);
      expect(isWhitelistedDomain('stackoverflow.com', whitelist)).toBe(true);
    });

    it('should return true for subdomains', () => {
      expect(isWhitelistedDomain('api.github.com', whitelist)).toBe(true);
      expect(isWhitelistedDomain('meta.stackoverflow.com', whitelist)).toBe(true);
    });

    it('should return false for non-whitelisted domains', () => {
      expect(isWhitelistedDomain('facebook.com', whitelist)).toBe(false);
      expect(isWhitelistedDomain('twitter.com', whitelist)).toBe(false);
    });
  });
});
