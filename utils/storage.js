/** Storage helpers wrapping chrome.storage.sync with Promises */
export const STORAGE_KEY = 'aliasSettings';

/**
 * @returns {Promise<import('./alias.js').AliasSettings>}
 */
export function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(STORAGE_KEY, data => {
      resolve(data[STORAGE_KEY] || {});
    });
  });
}

/**
 * @param {import('./alias.js').AliasSettings} settings
 * @returns {Promise<void>}
 */
export function saveSettings(settings) {
  return new Promise(resolve => {
    chrome.storage.sync.set({ [STORAGE_KEY]: settings }, () => resolve());
  });
}

/** Atomic increment of counter: re-read then update */
export async function incrementCounter() {
  const s = await getSettings();
  let c = parseInt(s.counter, 10);
  if (!c || c < 1) c = 1;
  c += 1;
  s.counter = String(c);
  await saveSettings(s);
  return s; // return updated settings
}
