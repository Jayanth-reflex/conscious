// Digest Generation Implementation

// Add to background.js - Digest Generation functionality
const digestGeneration = {
  // Generate daily digest
  generateDailyDigest: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const logs = await getTimeLogs(today.getTime(), tomorrow.getTime());
    const aggregates = aggregateTimeLogs(logs);
    
    const digest = {
      date: today.toISOString().split('T')[0],
      totalTime: aggregates.total,
      categories: aggregates.byCategory,
      domains: aggregates.byDomain,
      insights: generateInsights(aggregates),
      recommendations: generateRecommendations(aggregates),
      generatedAt: Date.now(),
    };
    
    // Store digest in IndexedDB
    await storeDigest('daily', digest);
    
    return digest;
  },

  // Generate weekly digest
  generateWeeklyDigest: async () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const logs = await getTimeLogs(weekAgo.getTime(), today.getTime());
    const aggregates = aggregateTimeLogs(logs);
    
    // Group logs by day for trend analysis
    const dailyBreakdown = groupLogsByDay(logs);
    
    const digest = {
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      totalTime: aggregates.total,
      categories: aggregates.byCategory,
      domains: aggregates.byDomain,
      dailyBreakdown,
      trends: analyzeTrends(dailyBreakdown),
      insights: generateWeeklyInsights(aggregates, dailyBreakdown),
      recommendations: generateWeeklyRecommendations(aggregates, dailyBreakdown),
      generatedAt: Date.now(),
    };
    
    // Store digest in IndexedDB
    await storeDigest('weekly', digest);
    
    return digest;
  },

  // Get stored digest
  getDigest: async (type, date) => {
    if (!db) await initDB();
    
    try {
      const tx = db.transaction('digests', 'readonly');
      const store = tx.objectStore('digests');
      const key = `${type}_${date}`;
      const digest = await store.get(key);
      return digest;
    } catch (error) {
      console.error('Error getting digest:', error);
      return null;
    }
  },
};

// Helper functions
const generateInsights = (aggregates) => {
  const insights = [];
  
  // Most used category
  const topCategory = Object.entries(aggregates.byCategory)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topCategory) {
    const [category, time] = topCategory;
    const hours = Math.round(time / 3600000 * 10) / 10;
    insights.push(`You spent the most time on ${category} content (${hours} hours)`);
  }
  
  // Most visited domain
  const topDomain = Object.entries(aggregates.byDomain)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topDomain) {
    const [domain, time] = topDomain;
    const minutes = Math.round(time / 60000);
    insights.push(`${domain} was your most visited site (${minutes} minutes)`);
  }
  
  // Social media usage
  const socialTime = aggregates.byCategory.social || 0;
  if (socialTime > 3600000) { // More than 1 hour
    const hours = Math.round(socialTime / 3600000 * 10) / 10;
    insights.push(`You spent ${hours} hours on social media today`);
  }
  
  return insights;
};

const generateRecommendations = (aggregates) => {
  const recommendations = [];
  
  // High social media usage
  const socialTime = aggregates.byCategory.social || 0;
  if (socialTime > 7200000) { // More than 2 hours
    recommendations.push({
      type: 'reduce',
      category: 'social',
      message: 'Consider reducing social media time tomorrow',
      action: 'Set a 1-hour daily limit for social media'
    });
  }
  
  // Low educational content
  const educationTime = aggregates.byCategory.education || 0;
  if (educationTime < 1800000) { // Less than 30 minutes
    recommendations.push({
      type: 'increase',
      category: 'education',
      message: 'Try to include more educational content',
      action: 'Spend 30 minutes on learning platforms'
    });
  }
  
  // Balanced usage
  const totalTime = aggregates.total;
  if (totalTime < 14400000) { // Less than 4 hours
    recommendations.push({
      type: 'maintain',
      message: 'Great job maintaining balanced screen time!',
      action: 'Keep up the conscious media consumption'
    });
  }
  
  return recommendations;
};

const generateWeeklyInsights = (aggregates, dailyBreakdown) => {
  const insights = [];
  
  // Average daily time
  const avgDaily = aggregates.total / 7;
  const avgHours = Math.round(avgDaily / 3600000 * 10) / 10;
  insights.push(`Your average daily screen time was ${avgHours} hours`);
  
  // Most active day
  const dailyTotals = Object.entries(dailyBreakdown).map(([date, data]) => ({
    date,
    total: Object.values(data.byCategory).reduce((sum, time) => sum + time, 0)
  }));
  
  const mostActiveDay = dailyTotals.sort((a, b) => b.total - a.total)[0];
  if (mostActiveDay) {
    const dayName = new Date(mostActiveDay.date).toLocaleDateString('en-US', { weekday: 'long' });
    const hours = Math.round(mostActiveDay.total / 3600000 * 10) / 10;
    insights.push(`${dayName} was your most active day (${hours} hours)`);
  }
  
  return insights;
};

const generateWeeklyRecommendations = (aggregates, dailyBreakdown) => {
  const recommendations = [];
  
  // Consistency check
  const dailyTotals = Object.values(dailyBreakdown).map(data => 
    Object.values(data.byCategory).reduce((sum, time) => sum + time, 0)
  );
  
  const variance = calculateVariance(dailyTotals);
  if (variance > 7200000) { // High variance (more than 2 hours difference)
    recommendations.push({
      type: 'consistency',
      message: 'Try to maintain more consistent daily usage',
      action: 'Set daily time limits to create better habits'
    });
  }
  
  return recommendations;
};

const groupLogsByDay = (logs) => {
  const grouped = {};
  
  logs.forEach(log => {
    const date = new Date(log.startTs).toISOString().split('T')[0];
    
    if (!grouped[date]) {
      grouped[date] = {
        byCategory: {},
        byDomain: {},
        total: 0
      };
    }
    
    const duration = log.endTs - log.startTs;
    
    // Group by category
    if (!grouped[date].byCategory[log.category]) {
      grouped[date].byCategory[log.category] = 0;
    }
    grouped[date].byCategory[log.category] += duration;
    
    // Group by domain
    if (!grouped[date].byDomain[log.domain]) {
      grouped[date].byDomain[log.domain] = 0;
    }
    grouped[date].byDomain[log.domain] += duration;
    
    grouped[date].total += duration;
  });
  
  return grouped;
};

const analyzeTrends = (dailyBreakdown) => {
  const dates = Object.keys(dailyBreakdown).sort();
  const trends = {};
  
  // Analyze category trends
  const categories = new Set();
  Object.values(dailyBreakdown).forEach(day => {
    Object.keys(day.byCategory).forEach(cat => categories.add(cat));
  });
  
  categories.forEach(category => {
    const values = dates.map(date => 
      dailyBreakdown[date].byCategory[category] || 0
    );
    
    trends[category] = calculateTrend(values);
  });
  
  return trends;
};

const calculateTrend = (values) => {
  if (values.length < 2) return 'stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first) * 100;
  
  if (change > 20) return 'increasing';
  if (change < -20) return 'decreasing';
  return 'stable';
};

const calculateVariance = (values) => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
};

const storeDigest = async (type, digest) => {
  if (!db) await initDB();
  
  try {
    // Create digests object store if it doesn't exist
    if (!db.objectStoreNames.contains('digests')) {
      const version = db.version + 1;
      db.close();
      
      db = await openDB('consciousMediaDB', version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('digests')) {
            db.createObjectStore('digests', { keyPath: 'id' });
          }
        },
      });
    }
    
    const tx = db.transaction('digests', 'readwrite');
    const store = tx.objectStore('digests');
    
    const digestWithId = {
      ...digest,
      id: `${type}_${digest.date || digest.startDate}`,
      type
    };
    
    await store.put(digestWithId);
    await tx.done;
  } catch (error) {
    console.error('Error storing digest:', error);
  }
};

// Schedule daily digest generation
chrome.alarms.create('dailyDigest', { 
  when: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
  periodInMinutes: 24 * 60 // Every 24 hours
});

// Schedule weekly digest generation
chrome.alarms.create('weeklyDigest', { 
  when: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
  periodInMinutes: 7 * 24 * 60 // Every 7 days
});

// Handle digest generation alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyDigest') {
    digestGeneration.generateDailyDigest();
  } else if (alarm.name === 'weeklyDigest') {
    digestGeneration.generateWeeklyDigest();
  }
});

// Export digest functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = digestGeneration;
}

