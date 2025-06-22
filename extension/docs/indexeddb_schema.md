## IndexedDB Schema and Interactions

### Database Name
- `consciousMediaDB`

### Version
- `1` (initial version)

### Object Stores

#### `time_logs`
- **Purpose:** Stores individual time log entries for user activity on different domains.
- **Key Path:** `id` (UUID)
- **Indexes:**
  - `domain`: For querying logs by domain.
  - `category`: For querying logs by content category.
  - `startTs`: For efficient date-range queries and aggregation.
- **Data Model (TimeLog):**
  ```typescript
  interface TimeLog {
    id: string;          // uuid
    domain: string;
    category: string;    // enum (social, news, entertainment, utility, etc.)
    startTs: number;     // ms since epoch
    endTs: number;       // ms since epoch
  }
  ```

#### `settings`
- **Purpose:** Stores user-configurable settings for the extension.
- **Key Path:** `key` (e.g., 'nudgesEnabled', 'dailyLimits', 'excludedDomains')
- **Data Model (Settings):**
  ```typescript
  interface Settings {
    nudgesEnabled: boolean;
    dailyLimits: Record<string, number>;   // category → ms
    excludedDomains: string[];
  }
  ```

#### `bias_cache`
- **Purpose:** Caches media bias and credibility data fetched from external APIs to reduce API calls and improve performance.
- **Key Path:** `domain` (hostname)
- **Indexes:**
  - `lastFetched`: For managing cache expiration and refreshing data.
- **Data Model (BiasEntry):**
  ```typescript
  interface BiasEntry {
    domain: string;      // hostname
    biasRating: string;  // e.g. 'left', 'center', 'right'
    credibility: number; // 0–100
    lastFetched: number; // timestamp (ms since epoch)
  }
  ```

### Common Operations

#### `time_logs`
- **Add:** `addTimeLog(timeLog: TimeLog)`
- **Update:** `updateTimeLog(id: string, updates: Partial<TimeLog>)`
- **Get by ID:** `getTimeLog(id: string)`
- **Get by Domain/Category/Date Range:** `queryTimeLogs(index: string, range: IDBKeyRange)`
- **Delete:** `deleteTimeLog(id: string)`
- **Aggregate:** Custom functions to aggregate `time_logs` by domain, category, and date range for daily/weekly summaries.

#### `settings`
- **Set:** `setSetting(key: string, value: any)`
- **Get:** `getSetting(key: string)`
- **GetAll:** `getAllSettings()`

#### `bias_cache`
- **Add/Update:** `putBiasEntry(biasEntry: BiasEntry)`
- **Get:** `getBiasEntry(domain: string)`
- **Delete Old Entries:** `deleteOldBiasEntries(threshold: number)` (e.g., older than 24 hours)

### Interaction Library
- Use `idb-keyval` for simplified IndexedDB interactions, abstracting away much of the boilerplate.

### Performance Considerations
- Ensure proper indexing for frequently queried fields (`domain`, `category`, `startTs`, `lastFetched`).
- Batch writes where possible.
- Implement caching mechanisms (e.g., for `bias_cache`) to minimize database reads and external API calls.


