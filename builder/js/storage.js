// Local-only persistence. Nothing in this file ever performs a network request.
// The journey lives in localStorage under STORAGE_KEY; export/import round-trips the same
// shape through a JSON file the human controls entirely.

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'gauntlet-builder-journey-v1';
const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2 MB — generous for text-only answers, cheap to guard.

/** @returns {boolean} */
export function storageAvailable() {
  try {
    const probe = '__gauntlet_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function emptyJourney() {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: null,
    updatedAt: null,
    currentStageId: null,
    answers: {},
    freeText: {},
    mode: {},
    gates: {},
    // Edited prompt text lives in its own bucket, keyed "<stageId>::<mode>", so editing the
    // preview never mutates the answers a prompt was compiled from (section 13 requirement).
    promptEdits: {},
  };
}

/** Loads the saved journey, or a fresh empty one if none exists or storage is unavailable. */
export function loadJourney() {
  if (!storageAvailable()) return emptyJourney();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyJourney();
    const parsed = JSON.parse(raw);
    const { ok, journey } = normalizeJourney(parsed);
    return ok ? journey : emptyJourney();
  } catch {
    return emptyJourney();
  }
}

/** Saves the journey. No-ops silently if storage is unavailable (caller shows a banner). */
export function saveJourney(journey) {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
    return true;
  } catch {
    return false;
  }
}

export function clearJourney() {
  if (!storageAvailable()) return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/**
 * Validates and coerces an arbitrary parsed object into a safe journey shape.
 * Never throws; always returns {ok, journey|null, error}.
 */
export function normalizeJourney(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, journey: null, error: 'Not a JSON object.' };
  }
  if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion < 1 || parsed.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, journey: null, error: `Unsupported schema version: ${parsed.schemaVersion}` };
  }
  const j = emptyJourney();
  j.schemaVersion = parsed.schemaVersion;
  j.createdAt = typeof parsed.createdAt === 'string' ? parsed.createdAt : null;
  j.updatedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null;
  j.currentStageId = typeof parsed.currentStageId === 'string' ? parsed.currentStageId : null;
  j.answers = coerceMap(parsed.answers, coerceAnswerSet);
  j.freeText = coerceMap(parsed.freeText, (v) => (typeof v === 'string' ? v : undefined));
  j.mode = coerceMap(parsed.mode, (v) => (v === 'same' || v === 'fresh' ? v : undefined));
  j.gates = coerceMap(parsed.gates, coerceGate);
  j.promptEdits = coerceMap(parsed.promptEdits, (v) => (typeof v === 'string' ? v : undefined));
  return { ok: true, journey: j, error: null };
}

// An imported file is untrusted input. Rather than reject a whole journey over one bad entry,
// each entry is coerced to the shape the app actually reads and anything unrecognised is
// dropped — so a hand-edited or truncated export degrades to "some answers missing" instead of
// crashing a stage render on, say, a gate that arrived as a number.
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function coerceMap(raw, coerceValue) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const key of Object.keys(raw)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const value = coerceValue(raw[key]);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** One stage's answers: questionId -> string | string[]. */
function coerceAnswerSet(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out = {};
  for (const key of Object.keys(raw)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const v = raw[key];
    if (typeof v === 'string') out[key] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[key] = v;
  }
  return out;
}

function coerceGate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  if (!['accepted', 'revise', 'stopped'].includes(raw.disposition)) return undefined;
  return {
    checkedItems: Array.isArray(raw.checkedItems) ? raw.checkedItems.filter((x) => typeof x === 'string') : [],
    artifactPath: typeof raw.artifactPath === 'string' ? raw.artifactPath : '',
    disposition: raw.disposition,
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
    // A snapshot of the wrong type would silently read as "unchanged"; forcing it to a string
    // that cannot match makes the stage show "needs review" instead, which is the safe default.
    prereqSnapshot: typeof raw.prereqSnapshot === 'string' ? raw.prereqSnapshot : 'invalid-snapshot',
  };
}

/**
 * Parses and validates an imported export file's text content.
 * @param {string} text
 * @returns {{ok: boolean, journey: (object|null), error: (string|null)}}
 */
export function parseImportedExport(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return { ok: false, journey: null, error: 'File is empty.' };
  }
  if (text.length > MAX_IMPORT_BYTES) {
    return { ok: false, journey: null, error: 'File is larger than the 2 MB import limit.' };
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, journey: null, error: 'File is not valid JSON.' };
  }
  const envelope = parsed && parsed.journey ? parsed.journey : parsed;
  const { ok, journey, error } = normalizeJourney(envelope);
  if (!ok) return { ok: false, journey: null, error: error || 'Invalid export file.' };
  return { ok: true, journey, error: null };
}

/** Wraps a journey in the exportable envelope (adds a top-level marker + timestamp). */
export function buildExportEnvelope(journey, exportedAtIso) {
  return {
    format: 'gauntlet-builder-export',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: exportedAtIso,
    journey,
  };
}
