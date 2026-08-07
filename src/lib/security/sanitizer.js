// Real parser-based HTML sanitization (sanitize-html / htmlparser2).
// Naive regex-based stripping (the old approach) is inherently unsound:
// it can be bypassed with malformed/nested tags and only removes a single
// occurrence per pass. sanitize-html builds an actual DOM-like parse tree
// and works in plain Node.js (no jsdom), so it's safe to use on Vercel
// serverless functions as well as in the browser.
import sanitizeHtmlLib from 'sanitize-html';

const HTML_OPTIONS = {
  allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3'],
  allowedAttributes: {
    a: ['href', 'title'],
    img: ['src', 'alt'],
    '*': ['class'],
  },
  // Explicit allow-list of URL schemes for href/src — anything else
  // (javascript:, data:, vbscript:, etc.) is stripped.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
};

export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';
  return sanitizeHtmlLib(dirty, HTML_OPTIONS);
}

export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  // No tags allowed at all — strips everything via the real parser.
  return sanitizeHtmlLib(text, { allowedTags: [], allowedAttributes: {} });
}

const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (!SAFE_URL_SCHEMES.has(parsed.protocol)) {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
}
