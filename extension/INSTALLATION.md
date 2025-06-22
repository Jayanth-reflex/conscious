# Installation Guide - Conscious Media Consumption Extension

## Quick Start

### Step 1: Download the Extension
1. Download the `conscious-media-extension.zip` file
2. Extract it to a folder on your computer (e.g., `Downloads/conscious-media-extension/`)

### Step 2: Enable Developer Mode in Chrome
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. In the top-right corner, toggle the "Developer mode" switch to ON
4. You should now see additional buttons appear

### Step 3: Load the Extension
1. Click the "Load unpacked" button
2. Navigate to and select the folder where you extracted the extension
3. Make sure you select the folder containing the `manifest.json` file
4. Click "Select Folder" or "Open"

### Step 4: Verify Installation
1. The extension should now appear in your extensions list
2. Look for "Conscious Media Consumption" with version 1.0
3. Ensure the toggle switch is ON (blue)

### Step 5: Pin the Extension (Recommended)
1. Click the puzzle piece icon (🧩) in Chrome's toolbar
2. Find "Conscious Media Consumption" in the dropdown
3. Click the pin icon (📌) next to it
4. The extension icon should now appear directly in your toolbar

## First Use

### Initial Setup
1. **Click the Extension Icon**: You'll see a popup showing "0h 0m" for today's usage
2. **Start Browsing**: The extension automatically begins tracking your activity
3. **View Dashboard**: Click "See Weekly →" to open the full analytics dashboard

### Setting Up Preferences
1. **Open Dashboard**: Click the extension icon, then "See Weekly →"
2. **Access Settings**: Click the gear icon in the popup
3. **Set Daily Limits**: Configure time limits for different categories (optional)
4. **Enable Nudges**: Turn on notifications for conscious consumption reminders

## Features Overview

### Popup Interface
- **Today's Time**: Shows total time spent browsing today
- **Top Sites**: Displays your most-visited sites with time spent
- **Nudge Alerts**: Warnings when you exceed set limits
- **Quick Access**: Links to dashboard and settings

### Dashboard Analytics
- **Summary Cards**: Total time, sessions, average session length, focus score
- **Category Breakdown**: Pie chart showing time across different content types
- **Weekly Trends**: Bar chart of daily usage patterns
- **Source Analysis**: Table of visited sites with bias ratings and credibility scores

### Focus Mode
- **Activate**: Click extension icon and select "Focus Mode" for distracting sites
- **Block Sites**: Temporarily prevents access with a semi-transparent overlay
- **Override**: Can be disabled when needed for legitimate access

### Bias Analysis
- **Link Indicators**: Colored dots appear next to external links on web pages
- **Bias Ratings**: Hover over dots to see political bias (left, center, right)
- **Credibility Scores**: Shows reliability rating (0-100)
- **Visual Cues**: Different colors indicate different bias levels

## Troubleshooting

### Extension Not Working
**Problem**: Extension icon appears but doesn't track time
**Solution**: 
1. Refresh the current webpage
2. Check that the extension is enabled in `chrome://extensions/`
3. Ensure you've granted all requested permissions

### Dashboard Won't Load
**Problem**: Clicking "See Weekly →" doesn't open dashboard
**Solution**:
1. Check if popup blockers are enabled
2. Try right-clicking the extension icon and selecting "Options"
3. Manually navigate to `chrome-extension://[extension-id]/dashboard/dashboard.html`

### Bias Indicators Missing
**Problem**: No colored dots appear on external links
**Solution**:
1. Some websites block content script injection
2. Try disabling other extensions temporarily
3. Refresh the page after ensuring the extension is active

### Data Not Saving
**Problem**: Usage statistics reset or don't persist
**Solution**:
1. Check Chrome's storage permissions
2. Ensure you're not in Incognito mode (extension disabled by default)
3. Verify the extension has storage permissions in `chrome://extensions/`

## Privacy & Data

### What Data is Collected
- **Domain Names**: Only the website domains you visit (e.g., "facebook.com")
- **Time Stamps**: When you start and stop visiting sites
- **Usage Patterns**: Aggregated statistics for analytics
- **Settings**: Your preferences and limit configurations

### What Data is NOT Collected
- **Full URLs**: Specific pages or search queries are not recorded
- **Personal Information**: No names, emails, or personal data
- **Browsing Content**: The actual content you read is not analyzed
- **External Sharing**: No data is sent to external servers (except domain names for bias analysis)

### Data Storage
- **Local Only**: All personal data stays on your device
- **IndexedDB**: Uses browser's built-in database for storage
- **No Cloud Sync**: Data is not synchronized across devices
- **User Control**: You can clear all data by removing the extension

## Advanced Configuration

### Custom Domain Categories
The extension automatically categorizes websites, but you can modify the categorization by editing the source code:

1. Navigate to `src/utils/domainCategorization.js`
2. Add your domains to the appropriate category in the `domainCategories` object
3. Rebuild the extension using `npm run build`

### Adjusting Nudge Thresholds
Default nudge thresholds can be modified in `src/background/background.js`:

```javascript
const categoryLimits = {
  social: 7200000,      // 2 hours in milliseconds
  entertainment: 10800000, // 3 hours
  news: 3600000,        // 1 hour
};
```

### Custom Bias API
To use a different bias analysis API, modify the `handleGetBias` function in the background script.

## Uninstalling

### Complete Removal
1. Go to `chrome://extensions/`
2. Find "Conscious Media Consumption"
3. Click "Remove"
4. Confirm removal in the popup

### Data Cleanup
Removing the extension automatically clears all stored data. No manual cleanup is required.

## Support

### Getting Help
1. **Check this guide**: Most issues are covered in the troubleshooting section
2. **Browser Console**: Press F12 and check for error messages
3. **Extension Console**: Go to `chrome://extensions/`, find the extension, and click "Inspect views: background page"

### Reporting Issues
When reporting problems, please include:
- Chrome version (`chrome://version/`)
- Extension version (visible in `chrome://extensions/`)
- Steps to reproduce the issue
- Any error messages from the browser console

---

**Need more help?** The extension includes comprehensive documentation in the README.md file and inline code comments for developers.

