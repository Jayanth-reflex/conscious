// Popup JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const timeValue = document.getElementById('timeValue');
  const siteBreakdown = document.getElementById('siteBreakdown');
  const nudgeBanner = document.getElementById('nudgeBanner');
  const nudgeMessage = document.getElementById('nudgeMessage');
  const nudgeDismiss = document.getElementById('nudgeDismiss');
  const settingsBtn = document.getElementById('settingsBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');

  // Category icons
  const categoryIcons = {
    social: '👥',
    entertainment: '🎬',
    news: '📰',
    utility: '🔧',
    shopping: '🛒',
    education: '📚',
    other: '🌐',
  };

  // Format time function
  function formatTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Load today's stats
  function loadStats() {
    chrome.runtime.sendMessage({ type: 'GET_TODAY_STATS' }, (response) => {
      if (response && response.success) {
        const { byDomain, byCategory, total } = response.data;
        
        // Update total time
        timeValue.textContent = formatTime(total);
        
        // Convert domain data to array and sort by time
        const sitesArray = Object.entries(byDomain).map(([domain, time]) => ({
          domain,
          time,
          category: 'other', // This would be determined by categorization logic
        })).sort((a, b) => b.time - a.time);

        // Update site breakdown
        siteBreakdown.innerHTML = '';
        sitesArray.slice(0, 3).forEach(site => {
          const siteItem = document.createElement('div');
          siteItem.className = 'site-item';
          siteItem.innerHTML = `
            <span class="site-icon">${categoryIcons[site.category] || '🌐'}</span>
            <span class="site-domain">${site.domain.replace('www.', '').substring(0, 12)}</span>
            <span class="site-time">${formatTime(site.time)}</span>
          `;
          siteBreakdown.appendChild(siteItem);
        });

        // Check for nudges
        const socialTime = byCategory.social || 0;
        if (socialTime > 7200000) { // 2 hours
          nudgeMessage.textContent = 'You\'ve spent over 2 hours on social media today!';
          nudgeBanner.style.display = 'flex';
        }
      }
    });
  }

  // Event listeners
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });

  dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });

  nudgeDismiss.addEventListener('click', () => {
    nudgeBanner.style.display = 'none';
  });

  // Load stats on popup open
  loadStats();
});

