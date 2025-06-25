import { getSessionsByDateRange, addSession, getSettings, setSettings } from '../lib/db';
import { formatTime, downloadJSON, downloadCSV } from '../lib/utils';

// DOM Elements
const domainInput = document.getElementById('domain-input') as HTMLInputElement | null;
const addDomainBtn = document.getElementById('add-domain-btn') as HTMLButtonElement | null;
const domainList = document.getElementById('domain-list') as HTMLUListElement | null;
const dailyLimitInput = document.getElementById('daily-limit') as HTMLInputElement | null;
const saveSettingsBtn = document.getElementById('save-settings-btn') as HTMLButtonElement | null;
const exportJSONBtn = document.getElementById('export-json-btn') as HTMLButtonElement | null;
const exportCSVBtn = document.getElementById('export-csv-btn') as HTMLButtonElement | null;
const selectFileBtn = document.getElementById('select-file-btn') as HTMLButtonElement | null;
const importFileInput = document.getElementById('import-file') as HTMLInputElement | null;
const importBtn = document.getElementById('import-btn') as HTMLButtonElement | null;
const importStatus = document.getElementById('import-status') as HTMLElement | null;

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSettings();
    setupEventListeners();
    setupTabSwitching();
  } catch (err) {
    console.error('Options initialization error:', err);
    showError('Failed to initialize options page.');
  }
});

async function loadSettings() {
  try {
    const whitelist = await getSettings('whitelist');
    const limits = await getSettings('limits');
    if (domainList) {
      domainList.innerHTML = '';
      whitelist.forEach((domain: string) => {
        const li = document.createElement('li');
        li.textContent = domain;
        domainList.appendChild(li);
      });
    }
    if (dailyLimitInput) dailyLimitInput.value = limits?.dailyLimit || '480';
  } catch (err) {
    console.error('Error loading settings:', err);
    showError('Failed to load settings.');
  }
}

function setupEventListeners() {
  if (addDomainBtn) {
    addDomainBtn.addEventListener('click', async () => {
      try {
        if (!domainInput) return;
        const domain = domainInput.value.trim();
        if (domain) {
          const whitelist = await getSettings('whitelist');
          if (!whitelist.includes(domain)) {
            whitelist.push(domain);
            await setSettings('whitelist', whitelist);
            await loadSettings();
          }
        }
      } catch (err) {
        console.error('Add domain error:', err);
        showError('Failed to add domain.');
      }
    });
  }
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      try {
        if (!dailyLimitInput) return;
        const dailyLimit = parseInt(dailyLimitInput.value, 10);
        let limits = await getSettings('limits');
        if (!limits) limits = {};
        limits.dailyLimit = dailyLimit;
        await setSettings('limits', limits);
        alert('Settings saved!');
      } catch (err) {
        console.error('Save settings error:', err);
        showError('Failed to save settings.');
      }
    });
  }
  if (exportJSONBtn) {
    exportJSONBtn.addEventListener('click', async () => {
      try {
        const sessions = await getSessionsByDateRange(30); // Last 30 days
        downloadJSON(sessions, 'sessions.json');
      } catch (err) {
        console.error('Export JSON error:', err);
        showError('Failed to export JSON.');
      }
    });
  }
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', async () => {
      try {
        const sessions = await getSessionsByDateRange(30); // Last 30 days
        downloadCSV(sessions, 'sessions.csv');
      } catch (err) {
        console.error('Export CSV error:', err);
        showError('Failed to export CSV.');
      }
    });
  }
  if (selectFileBtn && importFileInput) {
    selectFileBtn.addEventListener('click', () => {
      try {
        importFileInput.click();
      } catch (err) {
        console.error('Select file error:', err);
        showError('Failed to select file.');
      }
    });
    importFileInput.addEventListener('change', handleFileSelect);
  }
  if (importBtn) {
    importBtn.addEventListener('click', handleFileImport);
  }
}

function handleFileSelect() {
  if (importFileInput && importFileInput.files && importFileInput.files.length > 0) {
    if (importBtn) importBtn.disabled = false;
    if (importStatus) {
      importStatus.textContent = `Selected file: ${importFileInput.files[0].name}`;
      importStatus.classList.remove('success', 'error');
    }
  }
}

async function handleFileImport() {
  if (!importFileInput) return;
  const file = importFileInput.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        const sessions = await getSessionsByDateRange(0);
        const updatedSessions = [...sessions, ...data];
        await Promise.all(updatedSessions.map(addSession));
        if (importStatus) {
          importStatus.textContent = 'Import successful!';
          importStatus.classList.add('success');
        }
        await loadSettings();
      } catch (error) {
        console.error('Import error:', error);
        if (importStatus) {
          importStatus.textContent = 'Import failed. Invalid file format.';
          importStatus.classList.add('error');
        }
        showError('Failed to import file.');
      }
    };
    reader.readAsText(file);
  }
}

function showError(msg: string) {
  alert(msg);
}

function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        document.getElementById(tab)?.classList.add('active');
      }
    });
  });
}
