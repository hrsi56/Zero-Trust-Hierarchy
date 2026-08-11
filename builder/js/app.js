import { stages } from './stages/index.js';
import { store } from './state.js';
import { renderStage } from './ui/render.js';
import { renderJourneyMap } from './ui/journeyMap.js';
import { el, text, clear, toast } from './ui/dom.js';
import { parseImportedExport } from './storage.js';

const stageRoot = document.getElementById('stage-root');
const journeyNav = document.getElementById('journey-nav');
const storageBanner = document.getElementById('storage-banner');
const dialogRoot = document.getElementById('dialog-root');

function currentStageIdFromHash() {
  const m = window.location.hash.match(/^#\/stage\/([a-z0-9-]+)/);
  if (m && stages.some((s) => s.id === m[1])) return m[1];
  return stages[0].id;
}

const nav = {
  goTo(stageId) {
    window.location.hash = `#/stage/${stageId}`;
  },
  onAnswersChanged() {
    renderJourneyMap(journeyNav, stages, currentStageIdFromHash(), nav.goTo);
  },
  onStageCompleted() {
    render();
  },
};

function render() {
  const stageId = currentStageIdFromHash();
  const stage = stages.find((s) => s.id === stageId) || stages[0];
  store.setCurrentStage(stage.id);
  renderJourneyMap(journeyNav, stages, stage.id, nav.goTo);
  try {
    renderStage(stageRoot, stage, stages, nav);
  } catch (err) {
    // A stage never gets to render a blank crashed screen — this is the backstop for a
    // malformed imported journey or a future content bug, not something expected to fire.
    console.error('Stage render failed:', err);
    clear(stageRoot);
    stageRoot.appendChild(el('div', { class: 'card' }, [
      text('h2', 'This stage hit an unexpected error', { class: 'section-title' }),
      text('p', 'Your saved answers are unaffected. This is usually caused by a corrupted or unrecognized imported journey file.'),
      el('div', { class: 'btn-row' }, [
        text('button', 'Reset just this stage', {
          type: 'button', class: 'btn btn--danger',
          onClick: () => { store.resetStage(stage.id); render(); },
        }),
      ]),
    ]));
  }
  document.getElementById('main').focus({ preventScroll: false });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

window.addEventListener('hashchange', render);

// ---------- theme toggle ----------

const THEME_KEY = 'gauntlet-builder-theme';
const themeBtn = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-toggle-label');

function applyTheme(pref) {
  const root = document.documentElement;
  if (pref === 'system') {
    root.removeAttribute('data-theme');
    themeLabel.textContent = 'Match system theme';
    themeBtn.setAttribute('aria-pressed', 'false');
  } else {
    root.setAttribute('data-theme', pref);
    themeLabel.textContent = pref === 'dark' ? 'Dark theme' : 'Light theme';
    themeBtn.setAttribute('aria-pressed', 'true');
  }
}

function loadThemePref() {
  try { return window.localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}
function saveThemePref(pref) {
  try { window.localStorage.setItem(THEME_KEY, pref); } catch { /* ignore */ }
}

let themePref = loadThemePref();
applyTheme(themePref);
themeBtn.addEventListener('click', () => {
  themePref = themePref === 'system' ? 'light' : themePref === 'light' ? 'dark' : 'system';
  saveThemePref(themePref);
  applyTheme(themePref);
});

// ---------- storage availability banner ----------

// Re-checked on every state change rather than once at boot: some embedded/sandboxed
// contexts deny storage access for a brief moment during initial page load and then allow
// it — a one-time check at boot would leave this banner permanently stuck on stale.
function refreshStorageBanner() {
  storageBanner.hidden = store.storageOk;
}
refreshStorageBanner();
store.subscribe(refreshStorageBanner);

// ---------- export / import / reset ----------

document.getElementById('export-btn').addEventListener('click', () => {
  const envelope = store.exportEnvelope();
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: 'gauntlet-builder-journey.json' });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Journey exported.');
});

const importInput = document.getElementById('import-file-input');
document.getElementById('import-btn').addEventListener('click', () => importInput.click());
importInput.addEventListener('change', async () => {
  const file = importInput.files[0];
  importInput.value = '';
  if (!file) return;
  const text = await file.text();
  const { ok, journey, error } = parseImportedExport(text);
  if (!ok) {
    toast(`Import failed: ${error}`);
    return;
  }
  showConfirmDialog({
    title: 'Import journey?',
    body: 'This replaces every answer currently in this browser with the contents of the imported file. This cannot be undone.',
    confirmLabel: 'Replace and import',
    onConfirm: () => {
      store.importJourney(journey);
      render();
      toast('Journey imported.');
    },
  });
});

document.getElementById('reset-all-btn').addEventListener('click', () => {
  showConfirmDialog({
    title: 'Reset everything?',
    body: 'This permanently clears every answer, prompt edit, and completion record in this browser. Export your journey first if you want to keep a copy.',
    confirmLabel: 'Reset everything',
    danger: true,
    onConfirm: () => {
      store.resetAll();
      window.location.hash = `#/stage/${stages[0].id}`;
      render();
      toast('Journey reset.');
    },
  });
});

document.getElementById('footer-privacy-link').addEventListener('click', (e) => {
  e.preventDefault();
  showConfirmDialog({
    title: 'How this works',
    body: 'This page runs entirely in your browser. Your answers are saved only to this browser\'s local storage — nothing is uploaded, no account exists, and this page never calls an AI model or any server. Each stage compiles your answers into a prompt you copy to an AI agent you run yourself; that agent inspects your project directly. This site never asks for your project\'s files or the agent\'s output.',
    confirmLabel: 'Got it',
    hideCancel: true,
    onConfirm: () => {},
  });
});

function showConfirmDialog({ title, body, confirmLabel, onConfirm, danger, hideCancel }) {
  clear(dialogRoot);
  const backdrop = el('div', { class: 'dialog-backdrop', role: 'presentation' });
  const dialog = el('div', { class: 'dialog', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'dialog-title' });
  dialog.appendChild(text('h2', title, { id: 'dialog-title' }));
  dialog.appendChild(text('p', body));
  const btnRow = el('div', { class: 'btn-row' });
  const confirmBtn = text('button', confirmLabel, { type: 'button', class: `btn ${danger ? 'btn--danger' : 'btn--primary'}` });
  confirmBtn.addEventListener('click', () => { onConfirm(); close(); });
  btnRow.appendChild(confirmBtn);
  if (!hideCancel) {
    const cancelBtn = text('button', 'Cancel', { type: 'button', class: 'btn btn--ghost' });
    cancelBtn.addEventListener('click', close);
    btnRow.appendChild(cancelBtn);
  }
  dialog.appendChild(btnRow);
  backdrop.appendChild(dialog);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  const previouslyFocused = document.activeElement;

  function focusable() {
    return Array.from(dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((n) => !n.disabled && n.offsetParent !== null);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', onKeydown);
  function close() {
    document.removeEventListener('keydown', onKeydown);
    clear(dialogRoot);
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
  }
  dialogRoot.appendChild(backdrop);
  confirmBtn.focus();
}

// ---------- boot ----------

if (!window.location.hash) window.location.hash = `#/stage/${stages[0].id}`;
render();
