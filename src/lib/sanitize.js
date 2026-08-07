import DOMPurify from "dompurify";

/**
 * Sanitize untrusted HTML (e.g. inbound email bodies, external ad snippets)
 * before rendering with dangerouslySetInnerHTML.
 *
 * Allows safe inline styles, images, links, and basic formatting.
 * Strips: <script>, event handlers (onclick, onerror, etc.), javascript: URLs,
 * data: URLs (except images), iframes, objects, embeds.
 *
 * For admin-pasted external ad code (AdSense etc.), use sanitizeAdCode() which
 * is more permissive — it allows <script> tags since admin intentionally pasted
 * them, but still strips inline event handlers.
 */

const EMAIL_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "div", "span", "table", "thead", "tbody", "tr", "td", "th",
    "strong", "b", "em", "i", "u", "s", "a", "img", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "hr", "pre", "code",
    "font", "center", "sub", "sup", "dl", "dt", "dd",
  ],
  ALLOWED_ATTR: [
    "href", "src", "alt", "title", "width", "height", "style", "class",
    "target", "rel", "color", "size", "face", "align", "valign",
    "bgcolor", "colspan", "rowspan", "cellpadding", "cellspacing", "border",
  ],
  ALLOWED_ATTR_PROTOCOLS: { a: ["http", "https", "mailto", "tel"], img: ["http", "https", "blob", "data", "cid"] },
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style", "link", "meta"],
  FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover", "onfocus", "onblur", "onsubmit", "onchange", "oninput"],
};

/**
 * Sanitize inbound email HTML for safe display in the admin email manager.
 * Strips scripts, event handlers, and dangerous URLs. Keeps formatting.
 */
export function sanitizeEmailHtml(html) {
  if (!html || typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: EMAIL_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: EMAIL_CONFIG.ALLOWED_ATTR,
    FORBID_TAGS: EMAIL_CONFIG.FORBID_TAGS,
    FORBID_ATTR: EMAIL_CONFIG.FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize admin-pasted external ad code (e.g. Google AdSense).
 * More permissive: allows <script> tags (admin intentionally pasted them for
 * ad networks) but still strips inline event handlers (onerror, onclick, etc.)
 * and javascript: URLs to prevent XSS through compromised ad networks.
 */
export function sanitizeAdCode(code) {
  if (!code || typeof window === "undefined") return code;
  return DOMPurify.sanitize(code, {
    ALLOWED_TAGS: ["script", "div", "span", "ins", "iframe", "a", "img", "noscript"],
    ALLOWED_ATTR: [
      "src", "href", "style", "class", "id", "width", "height", "alt",
      "data-ad-client", "data-ad-slot", "data-ad-format", "data-full-width-responsive",
      "data-lazy", "loading", "frameborder", "marginwidth", "marginheight",
      "scrolling", "allow", "allowfullscreen", "sandbox",
    ],
    FORBID_ATTR: EMAIL_CONFIG.FORBID_ATTR,
    ALLOW_DATA_ATTR: true,
  });
}
