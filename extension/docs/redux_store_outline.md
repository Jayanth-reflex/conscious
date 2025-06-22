## Redux Store Structure and Slices

### Store Configuration
- Uses Redux Toolkit's `configureStore`.
- Combines multiple slices for different features.

### Slices

#### `timeSlice`
- **State:**
  ```javascript
  {
    currentTimeLogs: [], // Array of TimeLog objects for the current session/day
    dailyAggregates: {}, // Aggregated time per category/domain for daily view
    weeklyAggregates: {} // Aggregated time per category/domain for weekly view
  }
  ```
- **Reducers:**
  - `addTimeLog(state, action)`: Adds a new `TimeLog` entry.
  - `updateTimeLog(state, action)`: Updates an existing `TimeLog` entry (e.g., `endTs`).
  - `updateDailyAggregates(state, action)`: Updates daily aggregated data.
  - `updateWeeklyAggregates(state, action)`: Updates weekly aggregated data.
- **Async Thunks (for background script interaction):**
  - `fetchTimeLogs(dateRange)`: Fetches time logs from IndexedDB.
  - `saveTimeLog(timeLog)`: Saves a time log to IndexedDB.

#### `settingsSlice`
- **State:**
  ```javascript
  {
    nudgesEnabled: true,
    dailyLimits: { social: 3600000, news: 1800000 }, // category -> ms
    excludedDomains: [],
    focusModeActive: false,
    blockedDomains: [] // Session-only for focus mode
  }
  ```
- **Reducers:**
  - `toggleNudges(state)`: Toggles `nudgesEnabled`.
  - `setDailyLimit(state, action)`: Sets a daily limit for a category.
  - `addExcludedDomain(state, action)`: Adds a domain to `excludedDomains`.
  - `removeExcludedDomain(state, action)`: Removes a domain from `excludedDomains`.
  - `toggleFocusMode(state)`: Toggles `focusModeActive`.
  - `addBlockedDomain(state, action)`: Adds a domain to `blockedDomains`.
  - `removeBlockedDomain(state, action)`: Removes a domain from `blockedDomains`.
- **Async Thunks:**
  - `loadSettings()`: Loads settings from IndexedDB/Chrome storage.
  - `saveSettings(settings)`: Saves settings to IndexedDB/Chrome storage.

#### `uiSlice`
- **State:**
  ```javascript
  {
    popupOpen: false,
    dashboardVisible: false,
    nudgeBannerVisible: false,
    currentDomainBias: null // BiasEntry object for the currently active tab
  }
  ```
- **Reducers:**
  - `setPopupOpen(state, action)`: Sets `popupOpen` status.
  - `setDashboardVisible(state, action)`: Sets `dashboardVisible` status.
  - `showNudgeBanner(state)`: Sets `nudgeBannerVisible` to true.
  - `hideNudgeBanner(state)`: Sets `nudgeBannerVisible` to false.
  - `setCurrentDomainBias(state, action)`: Sets `currentDomainBias`.

### Data Flow
- **Background Script:** Dispatches actions to `timeSlice` and `settingsSlice` based on tab events, alarms, and API responses. Interacts directly with IndexedDB.
- **Popup/Dashboard UI:** Dispatches actions to `settingsSlice` and `uiSlice` based on user interactions. Selects data from all slices for display.
- **Content Script:** Communicates with Background Script via `chrome.runtime.sendMessage` to request bias data or apply focus mode CSS. Background script then updates Redux store and/or sends messages back to content script.


