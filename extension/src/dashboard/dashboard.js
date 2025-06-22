// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const periodSelector = document.getElementById('periodSelector');
  const totalTimeEl = document.getElementById('totalTime');
  const sessionCountEl = document.getElementById('sessionCount');
  const avgSessionEl = document.getElementById('avgSession');
  const sourcesTableBody = document.getElementById('sourcesTableBody');

  let categoryChart = null;
  let weeklyChart = null;

  // Category colors
  const categoryColors = {
    social: '#FF6B6B',
    entertainment: '#4ECDC4',
    news: '#45B7D1',
    utility: '#96CEB4',
    shopping: '#FFEAA7',
    education: '#DDA0DD',
    other: '#95A5A6',
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

  // Get bias color
  function getBiasColor(bias) {
    const colors = {
      'left': '#FF6B6B',
      'lean-left': '#FF9999',
      'center': '#4ECDC4',
      'lean-right': '#FFB366',
      'right': '#FF8C42',
      'unknown': '#95A5A6'
    };
    return colors[bias] || colors.unknown;
  }

  // Initialize charts
  function initCharts() {
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');

    categoryChart = new Chart(categoryCtx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 0,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1A1A1A',
            titleColor: '#E0E0E0',
            bodyColor: '#E0E0E0',
            borderColor: '#4ECDC4',
            borderWidth: 1,
          },
        },
        maintainAspectRatio: false,
      },
    });

    weeklyChart = new Chart(weeklyCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Hours',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: '#4ECDC4',
          borderRadius: 4,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#1A1A1A',
            titleColor: '#E0E0E0',
            bodyColor: '#E0E0E0',
            borderColor: '#4ECDC4',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              color: '#A0A0A0',
            },
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(160, 160, 160, 0.1)',
            },
            ticks: {
              color: '#A0A0A0',
            },
          },
        },
        maintainAspectRatio: false,
      },
    });
  }

  // Load data
  function loadData(period) {
    const messageType = period === 'today' ? 'GET_TODAY_STATS' : 'GET_WEEKLY_STATS';
    
    chrome.runtime.sendMessage({ type: messageType }, (response) => {
      if (response && response.success) {
        const { byCategory, byDomain, total } = response.data;
        
        // Update summary cards
        totalTimeEl.textContent = formatTime(total);
        sessionCountEl.textContent = Object.keys(byDomain).length;
        
        const avgSession = Object.keys(byDomain).length > 0 ? total / Object.keys(byDomain).length : 0;
        avgSessionEl.textContent = formatTime(avgSession);

        // Update category chart
        const categoryLabels = Object.keys(byCategory);
        const categoryData = Object.values(byCategory);
        const categoryBgColors = categoryLabels.map(cat => categoryColors[cat] || '#95A5A6');

        categoryChart.data.labels = categoryLabels;
        categoryChart.data.datasets[0].data = categoryData;
        categoryChart.data.datasets[0].backgroundColor = categoryBgColors;
        categoryChart.update();

        // Update weekly chart with mock data
        if (period === 'week') {
          weeklyChart.data.datasets[0].data = [2.5, 3.2, 2.8, 4.1, 3.5, 1.8, 2.2];
          weeklyChart.update();
        }

        // Update sources table
        const sourcesArray = Object.entries(byDomain).map(([domain, time]) => ({
          domain,
          biasRating: 'center', // Mock data
          credibility: Math.floor(Math.random() * 40) + 60, // Mock data
          timeSpent: time,
        })).sort((a, b) => b.timeSpent - a.timeSpent);

        sourcesTableBody.innerHTML = '';
        sourcesArray.slice(0, 10).forEach(source => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="source-name">${source.domain}</td>
            <td>
              <span class="bias-indicator" style="background-color: ${getBiasColor(source.biasRating)}">
                ${source.biasRating}
              </span>
            </td>
            <td class="credibility-score">${source.credibility}/100</td>
            <td class="time-spent">${formatTime(source.timeSpent)}</td>
          `;
          sourcesTableBody.appendChild(row);
        });
      }
    });
  }

  // Event listeners
  periodSelector.addEventListener('change', (e) => {
    loadData(e.target.value);
  });

  // Initialize
  initCharts();
  loadData('today');
});

