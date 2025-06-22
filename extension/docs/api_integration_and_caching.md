## API Integration Points and Caching Strategy

### 1. Media Bias/Fact Check API
- **API Name:** MediaBiasFactCheck API (MBFC API)
- **Purpose:** To retrieve bias ratings and credibility scores for news and media domains.
- **Integration Point:** Background Script.
- **Data Flow:**
  1. Content script sends a `GET_BIAS` message with a domain to the background script.
  2. Background script first checks `bias_cache` in IndexedDB for the domain.
  3. If found and `lastFetched` is within the caching period (e.g., 24 hours), return cached data.
  4. If not found or expired, make an API call to the MBFC API.
  5. Store the API response (domain, biasRating, credibility, current timestamp) in `bias_cache` IndexedDB.
  6. Send the bias data back to the content script.
- **Caching Strategy:**
  - **Local Cache:** `bias_cache` IndexedDB object store.
  - **Expiration:** Cache entries expire after 24 hours. When an entry is requested, if it's older than 24 hours, a new API call is made to refresh the data.
  - **Debouncing:** Implement a debouncing mechanism for API calls to prevent excessive requests, especially when multiple tabs are opened or content scripts are active simultaneously. Group multiple domain requests into a single API call if the API supports batch lookups.

### 2. Sentiment/Topics API (Pro Feature)
- **API Name:** AYLIEN Text Analysis API or OpenAI API (specific endpoint to be determined).
- **Purpose:** To analyze the sentiment and extract topics from article content (for advanced users/pro features).
- **Integration Point:** Background Script (triggered by user action or scheduled digest generation).
- **Data Flow:**
  1. User initiates sentiment analysis on an article, or it's part of a scheduled digest generation.
  2. Content script extracts article text and sends it to the background script.
  3. Background script sends the text to the chosen Sentiment/Topics API.
  4. API response (sentiment score, key topics) is processed.
  5. Results are stored in IndexedDB (e.g., as part of `TimeLog` metadata or a separate `article_analysis` store) or used for digest generation.
- **Caching Strategy:**
  - **Local Cache:** Consider caching sentiment/topic analysis results per URL or article hash in IndexedDB (`article_analysis` object store).
  - **Expiration:** Cache entries could have a longer expiration (e.g., 7 days) as article content is less likely to change frequently.
  - **Rate Limiting:** Implement client-side rate limiting to adhere to API usage policies.

### General Caching Principles
- **IndexedDB as Primary Cache:** Leverage IndexedDB for persistent local caching of API responses to minimize network requests and improve performance.
- **Memory Cache (in Background Script):** For frequently accessed data within a short period (e.g., during a single browsing session), a simple in-memory cache in the background script can reduce IndexedDB reads.
- **Error Handling:** Implement robust error handling for API calls (e.g., network issues, API rate limits, invalid responses) with retries and fallback mechanisms.
- **User Settings for API Usage:** Allow users to enable/disable certain API integrations, especially for pro features, to give them control over data usage and privacy.


