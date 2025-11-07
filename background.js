// Refactored for MV3 module usage
import { buildAliasEmail, sanitizeAlias } from './utils/alias.js';
import { getSettings, saveSettings, incrementCounter, STORAGE_KEY } from './utils/storage.js';

(function() {
  /** Check restricted URLs */
  function isRestrictedUrl(url = '') {
    return /^(chrome|edge|about|chrome-extension|moz-extension):/i.test(url) ||
           /chromewebstore/.test(url) ||
           url === '' ||
           url.startsWith('https://chrome.google.com/webstore');
  }

  async function pingContent(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'PING_ALIAS' });
      return true;
    } catch (e) {
      return false;
    }
  }

  async function ensureContentScript(tabId) {
    if (await pingContent(tabId)) return true; // already present
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['contentScript.js'] });
      return true;
    } catch (e) {
      console.warn('Content script injection failed:', e);
      return false;
    }
  }

  function notify(message) {
    console.log('[Email Alias Hotkeys]', message);
  }

  async function copyTextViaPage(tabId, text) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (t) => navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {}),
        args: [text]
      });
      notify('Alias copied to clipboard.');
    } catch (e) {
      console.warn('Clipboard page-context write failed:', e);
    }
  }

  async function performPaste(incrementFirst) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) { notify('No active tab.'); return; }
      if (isRestrictedUrl(tab.url)) {
        notify('Restricted page; using clipboard fallback.');
        await clipboardFlow(incrementFirst, tab.id);
        return;
      }

      let settings = await getSettings();

      if (!settings.email || !settings.alias) { notify('Configure alias settings in popup first.'); return; }

      let counter = parseInt(settings.counter, 10);
      if (!counter || counter < 1) counter = 1;
      if (incrementFirst) {
        // atomic re-read increment
        settings = await incrementCounter();
        counter = parseInt(settings.counter, 10);
      }

      const aliasEmail = buildAliasEmail(settings.email.trim(), settings.alias.trim(), counter);
      if (!aliasEmail) { notify('Alias build failed.'); return; }

      // Ensure script then send
      const injected = await ensureContentScript(tab.id);
      if (!injected) {
        notify('Injection failed, copying to clipboard instead.');
        await copyTextViaPage(tab.id, aliasEmail);
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'PASTE_ALIAS', value: aliasEmail }, async () => {
        if (chrome.runtime.lastError) {
          console.warn('sendMessage failed after injection:', chrome.runtime.lastError.message);
          notify('Paste failed; copied alias instead.');
          await copyTextViaPage(tab.id, aliasEmail);
        }
      });
    } catch (err) {
      console.error('performPaste error:', err);
      notify('Unexpected error; see console.');
    }
  }

  async function clipboardFlow(incrementFirst, tabId) {
    let settings = await getSettings();
    if (!settings.email || !settings.alias) { notify('Configure alias settings in popup.'); return; }
    if (incrementFirst) settings = await incrementCounter();
    const counter = parseInt(settings.counter, 10) || 1;
    const aliasEmail = buildAliasEmail(settings.email.trim(), settings.alias.trim(), counter);
    await copyTextViaPage(tabId, aliasEmail);
  }

  chrome.commands.onCommand.addListener(command => {
    switch (command) {
      case 'paste_alias_current':
        performPaste(false);
        break;
      case 'paste_alias_next':
        performPaste(true);
        break;
    }
  });
  // Messages from popup buttons
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg) return;
    if (msg.type === 'CMD_PASTE_CURRENT') {
      performPaste(false);
    } else if (msg.type === 'CMD_PASTE_NEXT') {
      performPaste(true);
    }
  });
})();