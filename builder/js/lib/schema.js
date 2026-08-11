// Shared contract for stage modules and the prompt compiler.
//
// This file defines no behavior beyond validation — it exists so every stage
// module (builder/js/stages/NN-*.js) and the compiler agree on one shape.
// Keep it dependency-free and DOM-free so it can run under Node (see
// builder/tests/validate.mjs) and in the browser unchanged.

/**
 * @typedef {'radio'|'select'|'checkbox'|'text'|'textarea'|'priorityOrder'} QuestionType
 *
 * @typedef {Object} QuestionOption
 * @property {string} value
 * @property {string} label
 * @property {string} [description]
 *
 * @typedef {Object} QuestionDef
 * @property {string} id                 Unique within the stage.
 * @property {QuestionType} type
 * @property {string} label
 * @property {string} [help]             "Why are we asking this?" explanation.
 * @property {boolean} required
 * @property {QuestionOption[]} [options]        For radio/select/checkbox/priorityOrder.
 * @property {{questionId: string, equals: (string|string[])}} [dependsOn]
 * @property {boolean} [allowDelegate]   Adds "I'm not sure — ask the agent to investigate
 *                                        and recommend options before acting."
 * @property {string} [placeholder]      For text/textarea.
 * @property {string} affectsPrompt      One sentence: how this answer changes the generated
 *                                        prompt. Shown in the advanced layer, never to a casual
 *                                        user — keep it precise, it is a design record.
 */

/**
 * The fourteen prompt layers, in fixed order. A stage's buildLayers() returns a subset of
 * these keys; the compiler renders only non-empty layers, always in this order.
 */
export const PROMPT_LAYERS = [
  'roleAndAuthority',
  'stageObjective',
  'humanIntent',
  'operatingMode',
  'investigation',
  'precedence',
  'task',
  'constraints',
  'deliverables',
  'qualityGates',
  'prohibitedAssumptions',
  'stopConditions',
  'approvalBoundary',
  'terminalReturn',
];

export const PROMPT_LAYER_TITLES = {
  roleAndAuthority: 'Role and authority',
  stageObjective: 'Stage objective',
  humanIntent: 'Human intent and decisions',
  operatingMode: 'Operating mode',
  investigation: 'Required repository investigation',
  precedence: 'Source of truth and precedence',
  task: 'Exact task',
  constraints: 'Constraints and non-goals',
  deliverables: 'Required deliverables',
  qualityGates: 'Quality and evidence gates',
  prohibitedAssumptions: 'Prohibited assumptions or actions',
  stopConditions: 'Stop-and-escalate conditions',
  approvalBoundary: 'Human approval boundary',
  terminalReturn: 'Terminal return format',
};

/**
 * @typedef {'same'|'fresh'} AgentMode
 *
 * @typedef {Object} PromptCtx
 * @property {AgentMode} mode
 * @property {Object.<string, Object>} allAnswers   answers keyed by stageId, for cross-stage recall.
 * @property {Object.<string, Object>} allGates     completion gate records keyed by stageId.
 * @property {string} projectName
 */

/**
 * @typedef {Object} RecoveryPromptDef
 * @property {string} id
 * @property {string} label
 * @property {string} description         One line: when to use this instead of the primary prompt.
 * @property {(answers: Object, freeText: string, ctx: PromptCtx) => Object.<string,string>} buildLayers
 *
 * @typedef {Object} CompletionGateItem
 * @property {string} id
 * @property {string} label
 * @property {'confirm'|'text'} kind      'confirm' = checkbox the human ticks; 'text' = optional
 *                                        free field (e.g. artifact path).
 * @property {boolean} [required]
 *
 * @typedef {Object} AdvancedContent
 * @property {string} purpose
 * @property {string} problemPrevented
 * @property {string} judgmentVsInvestigation   Which questions need human judgment vs. what the
 *                                              agent should investigate.
 * @property {string} promptAnatomy
 * @property {string} authorityBoundary
 * @property {string} inputsAndSources
 * @property {string} outputsAndEvidence
 * @property {string[]} failureModes
 * @property {string[]} weakResultSigns
 * @property {string} customization
 * @property {string} whenToStop
 * @property {string} auditWithoutPasting
 * @property {{weak: string, strong: string}} weakVsStrongExample
 *
 * @typedef {Object} MethodProvenance
 * @property {string[]} verified        Directly supported by article.md / RULEBOOK.md / forms.
 * @property {string[]} adapted         Originated in or adapted from the Gauntlet Loop.
 * @property {string[]} productDesign   Proposed by this guide, not literally in the source method.
 *
 * @typedef {Object} StageModule
 * @property {string} id                 Stable kebab-case slug, used in URLs and storage keys.
 * @property {number} number             1-based display order.
 * @property {string} title
 * @property {string} purpose            One sentence.
 * @property {string} agentProduces      What the external agent will produce this stage.
 * @property {string[]} prerequisites    Stage ids that should be complete first.
 * @property {boolean} requiresWorkspaceAgent  True if this stage's prompt needs a file-reading
 *                                        agent (gates on the "no capable agent yet" branch).
 * @property {MethodProvenance} methodProvenance
 * @property {QuestionDef[]} questions
 * @property {string} freeTextLabel      Label for the open "what didn't the structured questions
 *                                        capture" field.
 * @property {CompletionGateItem[]} completionGate
 * @property {(answers: Object, freeText: string, ctx: PromptCtx) => Object.<string,string>} buildLayers
 * @property {RecoveryPromptDef[]} recoveryPrompts
 * @property {AdvancedContent} advanced
 */

/**
 * The value stored when the human picks "I'm not sure — ask the agent to investigate".
 * Lives here rather than in the UI layer so state, the compiler, and the Node tests can all
 * recognise a delegated answer without importing anything DOM-aware.
 */
export const DELEGATE_VALUE = '__delegate_to_agent__';

/** True if a question's dependsOn condition is satisfied by the current answer set. */
export function questionVisible(question, answers) {
  if (!question.dependsOn) return true;
  const current = answers[question.dependsOn.questionId];
  const target = question.dependsOn.equals;
  if (Array.isArray(target)) return target.includes(current);
  return current === target;
}

/** True when an answer value counts as actually given (not blank, not an empty selection). */
export function answerIsPresent(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Every required, currently-visible question the human has not answered.
 *
 * This is the guard that keeps a stage's buildLayers() from asserting a decision the human
 * never made: several stages fall through to a sensible default branch when an answer is
 * missing, and that default is then quoted to the agent as the human's intent. Blocking the
 * prompt until the required answers exist is what makes the quoted intent true.
 * @returns {QuestionDef[]}
 */
export function missingRequiredAnswers(stage, answers) {
  return (stage.questions || []).filter(
    (q) => q.required && questionVisible(q, answers) && !answerIsPresent(answers[q.id]),
  );
}

/**
 * Runtime shape check for a stage module. Returns a list of defect strings (empty = valid).
 * Deliberately conservative: checks presence/type, not editorial quality.
 * @param {StageModule} stage
 * @returns {string[]}
 */
export function validateStageShape(stage) {
  const defects = [];
  const req = (cond, msg) => { if (!cond) defects.push(msg); };

  req(stage && typeof stage.id === 'string' && /^[a-z0-9-]+$/.test(stage.id), 'id must be kebab-case string');
  req(typeof stage.number === 'number', 'number must be a number');
  req(typeof stage.title === 'string' && stage.title.length > 0, 'title required');
  req(typeof stage.purpose === 'string' && stage.purpose.length > 0, 'purpose required');
  req(typeof stage.agentProduces === 'string' && stage.agentProduces.length > 0, 'agentProduces required');
  req(Array.isArray(stage.prerequisites), 'prerequisites must be an array');
  req(typeof stage.requiresWorkspaceAgent === 'boolean', 'requiresWorkspaceAgent must be boolean');
  req(stage.methodProvenance && Array.isArray(stage.methodProvenance.verified), 'methodProvenance.verified required');
  req(Array.isArray(stage.questions), 'questions must be an array');
  req(typeof stage.freeTextLabel === 'string' && stage.freeTextLabel.length > 0, 'freeTextLabel required');
  req(Array.isArray(stage.completionGate) && stage.completionGate.length > 0, 'completionGate must be non-empty');
  req(typeof stage.buildLayers === 'function', 'buildLayers must be a function');
  req(Array.isArray(stage.recoveryPrompts), 'recoveryPrompts must be an array');
  req(stage.advanced && typeof stage.advanced === 'object', 'advanced required');

  if (stage.advanced) {
    const a = stage.advanced;
    ['purpose', 'problemPrevented', 'judgmentVsInvestigation', 'promptAnatomy', 'authorityBoundary',
      'inputsAndSources', 'outputsAndEvidence', 'customization', 'whenToStop', 'auditWithoutPasting']
      .forEach((k) => req(typeof a[k] === 'string' && a[k].length > 0, `advanced.${k} required`));
    req(Array.isArray(a.failureModes) && a.failureModes.length > 0, 'advanced.failureModes required');
    req(Array.isArray(a.weakResultSigns) && a.weakResultSigns.length > 0, 'advanced.weakResultSigns required');
    req(a.weakVsStrongExample && a.weakVsStrongExample.weak && a.weakVsStrongExample.strong, 'advanced.weakVsStrongExample required');
  }

  (stage.questions || []).forEach((q, i) => {
    req(typeof q.id === 'string' && q.id.length > 0, `questions[${i}].id required`);
    req(['radio', 'select', 'checkbox', 'text', 'textarea', 'priorityOrder'].includes(q.type), `questions[${i}].type invalid`);
    req(typeof q.label === 'string' && q.label.length > 0, `questions[${i}].label required`);
    req(typeof q.affectsPrompt === 'string' && q.affectsPrompt.length > 0, `questions[${i}].affectsPrompt required`);
    if (['radio', 'select', 'checkbox', 'priorityOrder'].includes(q.type)) {
      req(Array.isArray(q.options) && q.options.length > 0, `questions[${i}].options required for ${q.type}`);
    }
  });

  return defects;
}

/** Checks generated text for leftover template tokens like {{x}} or [placeholder]. */
export function findUnresolvedTokens(text) {
  const found = [];
  const curly = text.match(/\{\{[^}]*\}\}/g);
  if (curly) found.push(...curly);
  // Bracketed placeholders such as "[exact anchor]" are the *template* vocabulary of the
  // source forms; a compiled prompt must never leave one of those brackets un-filled.
  const bracket = text.match(/\[(TODO|FIXME|PLACEHOLDER|fill[- ]in|exact [a-z ]+\])/gi);
  if (bracket) found.push(...bracket);
  return found;
}
