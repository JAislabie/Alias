(() => {
  // Prevent duplicate registration if script injected more than once
  if (window.__aliasHotkeysRegistered) return;
  window.__aliasHotkeysRegistered = true;

  const OVERWRITE_MODE = false; // set true to replace entire field value instead of inserting

  function insertIntoActiveElement(text) {
    if (!text) return;
    const el = document.activeElement;
    if (!el) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (OVERWRITE_MODE) {
        el.value = text;
        el.selectionStart = el.selectionEnd = el.value.length;
      } else {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const original = el.value;
        el.value = original.slice(0, start) + text + original.slice(end);
        const caret = start + text.length;
        el.selectionStart = el.selectionEnd = caret;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    if (el.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        el.appendChild(document.createTextNode(text));
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === 'PASTE_ALIAS') {
      insertIntoActiveElement(msg.value);
    } else if (msg.type === 'PING_ALIAS') {
      sendResponse({ ok: true });
    }
  });
})();