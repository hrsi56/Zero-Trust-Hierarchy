// Tiny safe-DOM helpers. No innerHTML with interpolated strings anywhere in this app —
// every dynamic value (including human-entered free text) goes through textContent or these
// builders, so there is no HTML-injection path from stored answers.

/**
 * @param {string} tag
 * @param {Object} [attrs]
 * @param {(Node|string)[]} [children]
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.entries(value).forEach(([k, v]) => { node.dataset[k] = v; });
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'html') continue; // intentionally unsupported — see file header
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function text(tag, str, attrs = {}) {
  return el(tag, attrs, [str]);
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Renders a block of paragraphs/lists from plain data, never from raw HTML. */
export function richText(container, blocks) {
  const items = Array.isArray(blocks) ? blocks : [blocks];
  for (const block of items) {
    if (typeof block === 'string') {
      container.appendChild(text('p', block));
    } else if (block && block.type === 'list') {
      container.appendChild(el('ul', {}, block.items.map((i) => text('li', i))));
    } else if (block && block.type === 'heading') {
      container.appendChild(text('h3', block.text));
    }
  }
}

let toastRoot = null;
export function toast(message) {
  if (!toastRoot) toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return;
  const node = text('div', message, { class: 'toast', role: 'status' });
  toastRoot.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}
