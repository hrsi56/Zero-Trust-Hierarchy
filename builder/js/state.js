import { loadJourney, saveJourney, clearJourney, emptyJourney, SCHEMA_VERSION, buildExportEnvelope, storageAvailable } from './storage.js';
import { stages as allStagesDefault } from './stages/index.js';

/**
 * Central app state store: plain object + pub/sub + localStorage persistence.
 * Stage completion status is *derived*, not stored redundantly — see computeStageStatus —
 * so resetting an earlier stage automatically puts every dependent later stage back into
 * "needs review" without any manual propagation code.
 */
class Store {
  constructor() {
    this.journey = loadJourney();
    if (!this.journey.createdAt) this.journey.createdAt = new Date().toISOString();
    this.listeners = new Set();
    this._saveHandle = null;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _emit() {
    for (const fn of this.listeners) fn(this.journey);
  }

  _persist() {
    this.journey.updatedAt = new Date().toISOString();
    if (this._saveHandle) clearTimeout(this._saveHandle);
    this._saveHandle = setTimeout(() => saveJourney(this.journey), 150);
  }

  get storageOk() {
    return storageAvailable();
  }

  getAnswers(stageId) {
    return this.journey.answers[stageId] || {};
  }

  setAnswer(stageId, questionId, value) {
    if (!this.journey.answers[stageId]) this.journey.answers[stageId] = {};
    this.journey.answers[stageId][questionId] = value;
    this._persist();
    this._emit();
  }

  getFreeText(stageId) {
    return this.journey.freeText[stageId] || '';
  }

  setFreeText(stageId, text) {
    this.journey.freeText[stageId] = text;
    this._persist();
    this._emit();
  }

  getMode(stageId) {
    return this.journey.mode[stageId] || 'same';
  }

  setMode(stageId, mode) {
    this.journey.mode[stageId] = mode;
    this._persist();
    this._emit();
  }

  /** Returns the human-edited prompt text for a stage+mode, or null if never edited. */
  getPromptEdit(stageId, mode) {
    const key = `${stageId}::${mode}`;
    return Object.prototype.hasOwnProperty.call(this.journey.promptEdits, key) ? this.journey.promptEdits[key] : null;
  }

  setPromptEdit(stageId, mode, text) {
    const key = `${stageId}::${mode}`;
    this.journey.promptEdits[key] = text;
    this._persist();
    this._emit();
  }

  /** Clears an edit so the preview reverts to the freshly compiled prompt. */
  clearPromptEdit(stageId, mode) {
    const key = `${stageId}::${mode}`;
    delete this.journey.promptEdits[key];
    this._persist();
    this._emit();
  }

  getGate(stageId) {
    return this.journey.gates[stageId] || null;
  }

  /**
   * Records a human disposition for a stage: which gate checklist items were confirmed,
   * any artifact path, the disposition verdict, and a snapshot of every prerequisite
   * stage's current answers (used later to detect staleness if an earlier answer changes).
   */
  completeStage(stageId, { checkedItems, artifactPath, disposition, prereqSnapshot }) {
    this.journey.gates[stageId] = {
      checkedItems,
      artifactPath: artifactPath || '',
      disposition, // 'accepted' | 'revise' | 'stopped'
      completedAt: new Date().toISOString(),
      prereqSnapshot,
    };
    this._persist();
    this._emit();
  }

  resetStage(stageId) {
    delete this.journey.answers[stageId];
    delete this.journey.freeText[stageId];
    delete this.journey.mode[stageId];
    delete this.journey.gates[stageId];
    for (const key of Object.keys(this.journey.promptEdits)) {
      if (key.startsWith(`${stageId}::`)) delete this.journey.promptEdits[key];
    }
    this._persist();
    this._emit();
  }

  resetAll() {
    this.journey = emptyJourney();
    this.journey.createdAt = new Date().toISOString();
    clearJourney();
    this._persist();
    this._emit();
  }

  setCurrentStage(stageId) {
    this.journey.currentStageId = stageId;
    this._persist();
    this._emit();
  }

  exportEnvelope() {
    return buildExportEnvelope(this.journey, new Date().toISOString());
  }

  importJourney(journey) {
    this.journey = journey;
    this._persist();
    this._emit();
  }
}

export const store = new Store();

/** Stable JSON for an answers object: key order must not affect the staleness comparison. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

/** Builds the stable snapshot of every prerequisite stage's current answers + free text. */
export function snapshotPrereqs(stage) {
  const snap = {};
  for (const preId of stage.prerequisites) {
    snap[preId] = {
      answers: store.getAnswers(preId),
      freeText: store.getFreeText(preId),
    };
  }
  return canonical(snap);
}

export const STATUS_LABEL = {
  not_started: 'Not started',
  in_progress: 'In progress',
  needs_review: 'Needs review',
  revising: 'Revising',
  paused: 'Paused by you',
  complete: 'Complete',
};

/**
 * Derives one stage's status purely from current state:
 * 'not_started' | 'in_progress' | 'needs_review' | 'revising' | 'paused' | 'complete'.
 *
 * Only an *accepted* disposition can make a stage complete — choosing "needs revision" or
 * "stop here for now" is a deliberate human decision not to proceed, so it must not unlock
 * anything downstream.
 *
 * Invalidation cascades: a completed stage drops back to 'needs_review' when a prerequisite's
 * answers changed *or* when a prerequisite stopped being complete for any other reason. That
 * second clause is what carries an edit in stage 1 all the way down the chain — stage 3 never
 * sees stage 1's answers directly, but it does see that stage 2 is no longer complete.
 */
export function computeStageStatus(stage, allStages = allStagesDefault, seen = new Set()) {
  const gate = store.getGate(stage.id);
  if (!gate) {
    const hasAnswers = Object.keys(store.getAnswers(stage.id)).length > 0 || store.getFreeText(stage.id).length > 0;
    return hasAnswers ? 'in_progress' : 'not_started';
  }
  if (gate.disposition === 'revise') return 'revising';
  if (gate.disposition === 'stopped') return 'paused';
  if (snapshotPrereqs(stage) !== gate.prereqSnapshot) return 'needs_review';

  // Guard against a malformed prerequisite cycle in imported or future stage data rather than
  // recursing forever — an unresolvable chain is exactly the case that deserves a review flag.
  if (seen.has(stage.id)) return 'needs_review';
  seen.add(stage.id);
  for (const preId of stage.prerequisites) {
    const pre = allStages.find((s) => s.id === preId);
    if (!pre || computeStageStatus(pre, allStages, seen) !== 'complete') return 'needs_review';
  }
  return 'complete';
}

/** True when every listed prerequisite stage is itself 'complete' (not merely started). */
export function prerequisitesMet(stage, allStages = allStagesDefault) {
  return stage.prerequisites.every((preId) => {
    const pre = allStages.find((s) => s.id === preId);
    return pre && computeStageStatus(pre, allStages) === 'complete';
  });
}

export { SCHEMA_VERSION };
