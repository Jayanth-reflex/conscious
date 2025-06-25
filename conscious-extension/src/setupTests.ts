// Jest setup file for testing

// Mock Chrome APIs
global.chrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
    getURL: jest.fn(),
    openOptionsPage: jest.fn(),
  },
  tabs: {
    onActivated: {
      addListener: jest.fn(),
    },
    onUpdated: {
      addListener: jest.fn(),
    },
    onRemoved: {
      addListener: jest.fn(),
    },
    query: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    sendMessage: jest.fn(),
  },
  windows: {
    onFocusChanged: {
      addListener: jest.fn(),
    },
    WINDOW_ID_NONE: -1,
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  scripting: {
    executeScript: jest.fn(),
  },
} as any;

// Mock IndexedDB
global.indexedDB = {} as any;
