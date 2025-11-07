/**
 * @typedef {Object} AliasSettings
 * @property {string} email Base email address (must include @)
 * @property {string} alias Alias prefix without plus (sanitized)
 * @property {string|number} counter Numeric counter as string or number
 */

/** Sanitize alias prefix: remove leading pluses and invalid chars */
export function sanitizeAlias(raw = '') {
  return raw.replace(/^\++/, '').replace(/[^a-zA-Z0-9._-]/g, '').trim();
}

/** Build plus-alias email or empty string if invalid */
export function buildAliasEmail(baseEmail = '', aliasPrefix = '', counter) {
  if (!baseEmail || !aliasPrefix) return '';
  const atIdx = baseEmail.indexOf('@');
  if (atIdx === -1) return '';
  const local = baseEmail.slice(0, atIdx);
  const domain = baseEmail.slice(atIdx + 1);
  const cleanPrefix = sanitizeAlias(aliasPrefix);
  const num = parseInt(counter, 10);
  const safeCounter = Number.isFinite(num) && num > 0 ? num : 1;
  return `${local}+${cleanPrefix}${safeCounter}@${domain}`;
}

/** Compute next (incremented) alias email */
export function buildNextAliasEmail(settings) {
  if (!settings) return '';
  const nextCounter = parseInt(settings.counter, 10) + 1;
  return buildAliasEmail(settings.email, settings.alias, nextCounter);
}
