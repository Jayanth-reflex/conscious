// Domain Categorization Utility
export const domainCategories = {
  // Social Media
  'facebook.com': 'social',
  'www.facebook.com': 'social',
  'twitter.com': 'social',
  'www.twitter.com': 'social',
  'x.com': 'social',
  'www.x.com': 'social',
  'instagram.com': 'social',
  'www.instagram.com': 'social',
  'linkedin.com': 'social',
  'www.linkedin.com': 'social',
  'reddit.com': 'social',
  'www.reddit.com': 'social',
  'tiktok.com': 'social',
  'www.tiktok.com': 'social',
  'snapchat.com': 'social',
  'www.snapchat.com': 'social',
  'discord.com': 'social',
  'www.discord.com': 'social',
  'telegram.org': 'social',
  'web.telegram.org': 'social',
  'whatsapp.com': 'social',
  'web.whatsapp.com': 'social',

  // Entertainment
  'youtube.com': 'entertainment',
  'www.youtube.com': 'entertainment',
  'netflix.com': 'entertainment',
  'www.netflix.com': 'entertainment',
  'hulu.com': 'entertainment',
  'www.hulu.com': 'entertainment',
  'disneyplus.com': 'entertainment',
  'www.disneyplus.com': 'entertainment',
  'primevideo.com': 'entertainment',
  'www.primevideo.com': 'entertainment',
  'twitch.tv': 'entertainment',
  'www.twitch.tv': 'entertainment',
  'spotify.com': 'entertainment',
  'open.spotify.com': 'entertainment',
  'soundcloud.com': 'entertainment',
  'www.soundcloud.com': 'entertainment',

  // News
  'cnn.com': 'news',
  'www.cnn.com': 'news',
  'bbc.com': 'news',
  'www.bbc.com': 'news',
  'nytimes.com': 'news',
  'www.nytimes.com': 'news',
  'washingtonpost.com': 'news',
  'www.washingtonpost.com': 'news',
  'reuters.com': 'news',
  'www.reuters.com': 'news',
  'apnews.com': 'news',
  'www.apnews.com': 'news',
  'foxnews.com': 'news',
  'www.foxnews.com': 'news',
  'nbcnews.com': 'news',
  'www.nbcnews.com': 'news',
  'abcnews.go.com': 'news',
  'cbsnews.com': 'news',
  'www.cbsnews.com': 'news',
  'theguardian.com': 'news',
  'www.theguardian.com': 'news',
  'wsj.com': 'news',
  'www.wsj.com': 'news',

  // Utility/Productivity
  'gmail.com': 'utility',
  'mail.google.com': 'utility',
  'google.com': 'utility',
  'www.google.com': 'utility',
  'github.com': 'utility',
  'www.github.com': 'utility',
  'stackoverflow.com': 'utility',
  'www.stackoverflow.com': 'utility',
  'docs.google.com': 'utility',
  'drive.google.com': 'utility',
  'calendar.google.com': 'utility',
  'outlook.com': 'utility',
  'www.outlook.com': 'utility',
  'office.com': 'utility',
  'www.office.com': 'utility',
  'notion.so': 'utility',
  'www.notion.so': 'utility',
  'slack.com': 'utility',
  'app.slack.com': 'utility',
  'zoom.us': 'utility',
  'www.zoom.us': 'utility',
  'teams.microsoft.com': 'utility',

  // Shopping
  'amazon.com': 'shopping',
  'www.amazon.com': 'shopping',
  'ebay.com': 'shopping',
  'www.ebay.com': 'shopping',
  'etsy.com': 'shopping',
  'www.etsy.com': 'shopping',
  'walmart.com': 'shopping',
  'www.walmart.com': 'shopping',
  'target.com': 'shopping',
  'www.target.com': 'shopping',

  // Education
  'coursera.org': 'education',
  'www.coursera.org': 'education',
  'udemy.com': 'education',
  'www.udemy.com': 'education',
  'khanacademy.org': 'education',
  'www.khanacademy.org': 'education',
  'edx.org': 'education',
  'www.edx.org': 'education',
  'wikipedia.org': 'education',
  'en.wikipedia.org': 'education',
};

export const categoryColors = {
  social: '#FF6B6B',
  entertainment: '#4ECDC4',
  news: '#45B7D1',
  utility: '#96CEB4',
  shopping: '#FFEAA7',
  education: '#DDA0DD',
  other: '#95A5A6',
};

export const categoryIcons = {
  social: '👥',
  entertainment: '🎬',
  news: '📰',
  utility: '🔧',
  shopping: '🛒',
  education: '📚',
  other: '🌐',
};

/**
 * Categorizes a domain based on predefined mappings
 * @param {string} domain - The domain to categorize
 * @returns {string} - The category ('social', 'entertainment', 'news', 'utility', 'shopping', 'education', 'other')
 */
export const categorizeDomain = (domain) => {
  // Remove www. prefix if present for consistency
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  
  // Check exact match first
  if (domainCategories[domain.toLowerCase()]) {
    return domainCategories[domain.toLowerCase()];
  }
  
  // Check without www prefix
  if (domainCategories[cleanDomain]) {
    return domainCategories[cleanDomain];
  }
  
  // Check for subdomain matches (e.g., mail.google.com)
  for (const [mappedDomain, category] of Object.entries(domainCategories)) {
    if (domain.toLowerCase().endsWith(mappedDomain)) {
      return category;
    }
  }
  
  return 'other';
};

/**
 * Gets the color associated with a category
 * @param {string} category - The category
 * @returns {string} - Hex color code
 */
export const getCategoryColor = (category) => {
  return categoryColors[category] || categoryColors.other;
};

/**
 * Gets the icon associated with a category
 * @param {string} category - The category
 * @returns {string} - Emoji icon
 */
export const getCategoryIcon = (category) => {
  return categoryIcons[category] || categoryIcons.other;
};

/**
 * Gets all available categories
 * @returns {string[]} - Array of category names
 */
export const getAllCategories = () => {
  return Object.keys(categoryColors);
};

/**
 * Formats time duration in a human-readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} - Formatted time string (e.g., "2h 30m", "45m", "30s")
 */
export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

