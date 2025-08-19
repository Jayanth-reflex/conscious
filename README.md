# ConsciousTab Chrome Extension

A Chrome extension that tracks your active time on whitelisted websites with conscious awareness, helping you understand your browsing patterns and maintain productivity.

## Features

- **Real-time Time Tracking**: Monitor active and idle time on whitelisted domains
- **Session Management**: Automatic session detection and recording
- **User Activity Detection**: Distinguishes between active and idle time
- **Analytics Dashboard**: Visual charts showing usage patterns over time
- **Data Export/Import**: Export your data as JSON or CSV files
- **Dark Theme UI**: Easy on the eyes with a modern dark interface
- **Configurable Whitelist**: Add/remove domains you want to track

## Installation

### From Source (Development)

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `conscious-tab` folder

### For Production Use

1. Download the latest release from the releases page
2. Extract the ZIP file
3. Follow steps 4-6 from the development installation

## Usage

### Initial Setup

1. After installation, click the ConsciousTab icon in your browser toolbar
2. Go to Settings to configure your whitelisted domains
3. Add domains you want to track (e.g., `github.com`, `stackoverflow.com`)
4. Set your daily time limits

### Daily Use

- The extension automatically tracks time when you visit whitelisted sites
- Click the extension icon to view:
  - Current session timer
  - Active/Idle status
  - Today's total and active time
- Access the dashboard for detailed analytics and session history

### Features

#### Real-time Tracking
- Automatic session start when visiting whitelisted domains
- Live timer updates every second
- Idle detection after 10 seconds of inactivity

#### Analytics Dashboard
- Last 7 days activity chart (total vs active time)
- Last 30 days trend line
- Detailed session table with sorting and filtering
- Pagination for large datasets

#### Data Management
- Export data as JSON or CSV
- Import existing data from backup files
- Automatic daily summaries

## Development

### Building

```bash
# Development build with watch mode
npm run watch

# Production build
npm run build
```

### Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e
```

### Project Structure

```
conscious-tab/
├── manifest.json          # Extension manifest
├── src/
│   ├── background.ts      # Background service worker
│   ├── content.ts         # Content script for activity detection
│   ├── popup/             # Extension popup
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts
│   ├── options/           # Settings and dashboard page
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.ts
│   └── lib/               # Shared utilities
│       ├── db.ts          # Database layer (Dexie/IndexedDB)
│       └── utils.ts       # Utility functions
├── webpack.config.js      # Build configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

### Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Dexie.js**: IndexedDB wrapper for data persistence
- **Chart.js**: Analytics visualizations
- **Webpack**: Module bundling and build process
- **Jest**: Unit testing framework
- **Chrome Extension APIs**: Tabs, storage, notifications

## Privacy

ConsciousTab respects your privacy:
- All data is stored locally in your browser
- No data is sent to external servers
- You control which domains are tracked
- Data export/import for backup purposes only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues for solutions

## Changelog

### v1.0.0
- Initial release
- Basic time tracking functionality
- Whitelist management
- Analytics dashboard
- Data export/import
- Dark theme UI
