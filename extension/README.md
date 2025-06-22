# Conscious Media Consumption Chrome Extension

A sleek, minimalist, dark-themed Chrome extension that drives conscious media consumption through time tracking, bias analysis, and focus management.

## Features

### 🕒 Time Tracking
- Automatic tracking of time spent on different websites
- Real-time categorization of domains (social, news, entertainment, utility, etc.)
- Daily and weekly usage statistics
- Session-based analytics

### 📊 Analytics Dashboard
- Comprehensive dashboard with interactive charts
- Category-based time breakdown
- Weekly activity trends
- Focus score calculation

### 🎯 Focus Management
- Smart nudges when usage limits are exceeded
- Focus mode to block distracting websites
- Customizable daily limits per category
- Notification system for conscious consumption

### 📰 Source Bias Analysis
- Real-time bias indicators on external links
- Credibility scoring for news sources
- Visual bias overlay system
- Cached bias data for performance

### 📈 Insights & Reporting
- Daily and weekly digest generation
- Usage trend analysis
- Personalized recommendations
- Habit tracking and improvement suggestions

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   - Download the `conscious-media-extension.zip` file
   - Extract the contents to a folder on your computer

2. **Enable Developer Mode**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the extracted extension folder (containing `manifest.json`)
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Conscious Media Consumption" and click the pin icon
   - The extension icon will now appear in your toolbar

### Method 2: Chrome Web Store (Future)
*This extension will be available on the Chrome Web Store after review and approval.*

## Usage

### Getting Started

1. **First Launch**
   - Click the extension icon in your toolbar
   - The popup will show your current day's usage (initially 0)
   - Start browsing normally - the extension will automatically track your activity

2. **Viewing Statistics**
   - Click the extension icon to see today's summary
   - Click "See Weekly →" to open the full dashboard
   - The dashboard provides detailed analytics and charts

3. **Setting Up Limits**
   - Open the dashboard
   - Navigate to settings (gear icon in popup)
   - Set daily limits for different categories
   - Enable nudges for conscious consumption reminders

### Key Features

#### Time Tracking
- Automatically starts when you visit websites
- Categorizes domains into: Social, Entertainment, News, Utility, Shopping, Education, Other
- Tracks session duration and total daily time

#### Focus Mode
- Click the extension icon and select "Focus Mode" for distracting sites
- Temporarily blocks access with an overlay
- Can be disabled when needed

#### Bias Analysis
- Colored dots appear next to external links
- Hover over dots to see bias rating and credibility score
- Helps identify source reliability

#### Dashboard Analytics
- **Summary Cards**: Total time, sessions, average session length, focus score
- **Category Chart**: Pie chart showing time distribution across categories
- **Weekly Trends**: Bar chart showing daily usage patterns
- **Source Analysis**: Table of visited sites with bias ratings

## Technical Architecture

### Core Components

1. **Background Script** (`src/background/background.js`)
   - Handles tab events and time tracking
   - Manages IndexedDB storage
   - Processes API calls for bias data
   - Implements nudge system

2. **Content Script** (`src/content/content.js`)
   - Injects bias indicators on web pages
   - Applies focus mode overlays
   - Communicates with background script

3. **Popup Interface** (`src/popup/`)
   - Quick daily summary view
   - Access to settings and dashboard
   - Nudge notifications

4. **Dashboard** (`src/dashboard/`)
   - Comprehensive analytics interface
   - Interactive charts and visualizations
   - Detailed source analysis

### Data Storage

The extension uses IndexedDB for local data storage:

- **time_logs**: Individual session records
- **settings**: User preferences and limits
- **bias_cache**: Cached bias/credibility data

### Privacy & Security

- **Local Storage**: All data is stored locally on your device
- **No Data Collection**: The extension doesn't send personal data to external servers
- **API Usage**: Only domain names are sent to bias analysis APIs (no personal browsing data)
- **Permissions**: Minimal required permissions for functionality

## Development

### Project Structure

```
conscious-media-extension/
├── manifest.json              # Extension manifest
├── icons/                     # Extension icons
├── src/
│   ├── background/           # Background scripts
│   │   ├── background.js     # Main background script
│   │   ├── focusMode.js      # Focus mode functionality
│   │   └── digestGeneration.js # Analytics and reporting
│   ├── content/              # Content scripts
│   │   └── content.js        # Page injection script
│   ├── popup/                # Popup interface
│   │   ├── popup.html        # Popup HTML
│   │   ├── popup.js          # Popup JavaScript
│   │   └── popup.css         # Popup styles
│   ├── dashboard/            # Dashboard interface
│   │   ├── dashboard.html    # Dashboard HTML
│   │   ├── dashboard.js      # Dashboard JavaScript
│   │   └── dashboard.css     # Dashboard styles
│   └── utils/                # Utility functions
│       └── domainCategorization.js # Domain classification
├── docs/                     # Documentation
└── dist/                     # Built extension files
```

### Building from Source

1. **Prerequisites**
   - Node.js 18+ and npm
   - Git (for cloning repository)

2. **Setup**
   ```bash
   git clone <repository-url>
   cd conscious-media-extension
   npm install
   ```

3. **Build**
   ```bash
   npm run build    # Build extension
   npm run package  # Create distribution zip
   ```

4. **Development**
   ```bash
   npm run dev      # Development build with watching
   ```

### Testing

The extension includes comprehensive test suites:

```bash
npm test         # Run unit tests
npm run test:e2e # Run end-to-end tests
```

## Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Version 88+ (Chromium-based)
- **Other Chromium browsers**: Should work with Manifest V3 support

## Permissions Explained

The extension requires the following permissions:

- **tabs**: To track active tabs and time spent
- **storage**: To save settings and usage data locally
- **alarms**: For periodic checks and nudge notifications
- **notifications**: To display usage alerts
- **<all_urls>**: To inject content scripts for bias analysis

## Troubleshooting

### Common Issues

1. **Extension not tracking time**
   - Ensure the extension is enabled
   - Check that you've granted necessary permissions
   - Refresh the page and try again

2. **Dashboard not loading**
   - Disable other extensions temporarily
   - Clear browser cache and reload
   - Check browser console for errors

3. **Bias indicators not showing**
   - Content script may be blocked by other extensions
   - Some sites may prevent script injection
   - Check if the site allows third-party scripts

### Support

For issues and feature requests:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure you're using a supported browser version

## Contributing

This extension was developed by Manus AI as a production-ready solution for conscious media consumption. The codebase follows modern web development practices and Chrome extension standards.

### Code Style
- ES2021+ JavaScript
- Modular architecture
- Comprehensive error handling
- Performance-optimized

### Future Enhancements
- Machine learning-based content analysis
- Social sharing of focus achievements
- Integration with productivity tools
- Advanced bias detection algorithms

## License

MIT License - see LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release
- Core time tracking functionality
- Dashboard with analytics
- Focus mode implementation
- Source bias analysis
- Nudge notification system
- Comprehensive testing suite

---

**Conscious Media Consumption** - Empowering mindful digital habits through intelligent tracking and analysis.

