import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const FORMS_SOURCE_HELP = 'Most projects should just adopt the ten handoffs below — they already cover the moments where one role\'s claim has to become another role\'s independently verified fact. Pick "adapt lightly" only if this project\'s own vocabulary genuinely needs different field names; pick the non-software option only if there is no versioned codebase for a Git-shaped identity mechanism to attach to.';
const FORMS_LOCATION_HELP = 'A form nobody can find gets skipped the first time someone is in a hurry, which quietly turns a checked handoff back into an unchecked one. Naming a real location now — even a rough one — gives the agent something concrete to place files at instead of guessing or scattering them.';
const CEREMONY_LEVEL_HELP = 'Ceremony should track the cost of being wrong here, not the number of people on the project. A solo, low-stakes project can combine several of these ten documents; a project where a mistake is expensive should keep more of them as literally separate artifacts, even if the same person ends up reading and writing most of them.';

const ROLE_LABELS = {
  orchestrator: 'Orchestrator',
  engineeringLead: 'Engineering Lead',
  builder: 'Builder(s)',
  componentCritic: 'Component Critic',
  integrationCritic: 'Integration Critic',
};

const FORMS_SOURCE_LABELS = {
  'adopt-directly': 'Adopt this method\'s ten forms directly',
  'adapt-lightly': 'Adapt the ten forms lightly for this project',
  'from-scratch-non-software': 'Needs a from-scratch equivalent — this project\'s deliverable is not a versioned codebase',
};

const CEREMONY_LABELS = {
  'keep-distinct': 'Keep all ten forms distinct',
  streamline: 'Streamline into fewer combined documents while keeping every authority boundary intact',
};

/** Reproduced inline, generically, so the generated prompt is self-contained for the receiving agent. */
const FORM_DEFINITIONS = [
  '1. Checkpoint Brief — written by the Orchestrator, read by the Engineering Lead. States exactly one authorized bounded unit of work: which workspace it targets, the exact ratified plan reference it comes from, the current expected state labeled plainly as a hypothesis rather than confirmed fact, an inspectable observable goal, the complete acceptance checklist quoted in full rather than a paraphrased summary, the relevant constraints and how candidate identity and evidence will be tracked, a numeric time or effort ceiling that only prioritizes work and never excuses a lower bar, any human-only actions already pre-authorized (or an explicit "none"), the preconditions required before starting, and exactly one instruction for where to stop and return. A brief that is missing or contradictory on any of these fields must be rejected before any work begins — see the Invalid Brief Return below.',
  '2. Active Workbench — the Engineering Lead\'s own private, non-versioned scratch state while doing the work: notes, half-finished experiments, discarded approaches. Never shown to a Critic, the Orchestrator, or the human as evidence of anything. Always cleared before the Lead returns its report; anything actually worth keeping is extracted into one of the other, authorized forms first.',
  '3. Builder Assignment — written by the Engineering Lead, read by one Builder. Names exactly one piece of work, an exact list of what the Builder may touch and nothing beyond it, and what evidence the Builder must produce. The Builder is never handed the acceptance bar its own work will be judged against — it builds toward a goal, it does not pre-answer the test.',
  '4. Component Critic Assignment — written by the Engineering Lead, read by a fresh Component Critic, issued only after the candidate work has been frozen into one identifiable, unchanging version. The Critic receives the artifact itself, the acceptance bar, and enough provenance to check it — never the Builder\'s private notes, its own account of what it did, or the Lead\'s workbench.',
  '5. Critic Verdict — written by the Component Critic, read by the Engineering Lead. States pass, fail, or blocked; the exact identity of what was reviewed and what it depended on; the evidence trail and any checks actually run; a direct side-by-side comparison against the acceptance bar; and exactly one largest remaining gap, or an explicit statement that the bar is fully met. The Critic works out independently whether the bar is met; it may treat Builder-written tests as extra evidence, never as the whole check.',
  '6. Fresh Integration Critic (assignment and verdict) — written by the Engineering Lead for a different fresh reviewer — not the Component Critic who reviewed the pieces, not the Lead who assembled them. Reviews the complete, assembled result, plus whether every component verdict it still relies on remains current rather than stale.',
  '7. Consolidated Return Packet — the Engineering Lead\'s single upward report at the end of the bounded unit of work. Echoes the original brief back in full, states the actual start time and effort actually spent, gives a complete evidence trail and every verdict collected, maps each acceptance-checklist item to how it was satisfied, discloses real engineering decisions made along the way, reports the live state of anything touched, and declares exactly one terminal outcome. This is the Lead\'s only sanctioned handoff upward — nothing it says outside this packet counts as a report.',
  '8. Orchestrator Receipt — the Orchestrator\'s check of the returned packet\'s envelope: was it actually authorized, is the checklist mapping complete and honest, does the evidence trail match live reality, can every claimed identity actually be resolved. Recorded as SUPPORTED or REJECTED. This is explicitly not a second technical review of the work itself — the Orchestrator checks the packet, not the artifact.',
  '9. Landing, Disposition, Evidence & Reclamation — a two-phase form. Phase A is read-only inspection that never pre-fills a decision. Only then does the human Owner alone decide to land or discard the result. Only after that explicit decision does Phase B run: preserving evidence, repointing any references, and reclaiming resources the bounded unit of work used. Any unexplained or unrelated artifact found along the way is surfaced to the human, never silently deleted.',
  '10. Invalid Brief Return — the Engineering Lead\'s minimal, pre-execution response when a Checkpoint Brief is missing, ambiguous, or self-contradictory on any required field: lists every defect found, confirms plainly that nothing was created, edited, or started, and asks for exactly one corrected brief before anything begins. This is a correct, honest refusal — not a failure to route around.',
].join('\n\n');

const ROLE_NAMES_NOTE = 'These ten forms carry handoffs between six roles: the human Architect/Owner, and five execution roles — Orchestrator, Engineering Lead, Builder, Component Critic, and Integration Critic. If this project already has ratified role contracts from an earlier step, read them directly for the exact boundaries each role holds here rather than assuming a generic description; if none exist yet, use the writer/reader roles named above as the working definition. Do not invent a role or authority tier beyond these six anywhere in the forms you draft.';

const FRESH_REVIEWER_NOTE = '"Fresh" wherever it appears above means a new conversation or context reset carrying no memory of any prior conversation\'s claims about this work — a cooperative procedural control every participant agrees to follow, not a cryptographic or operating-system-level sandbox. State that plainly in any form template that references it, rather than implying stronger technical isolation than actually exists.';

const NO_NEW_AUTHORITY_LINE = 'These ten handoffs are the complete set. Do not invent an eleventh form, and do not let any form — combined or not — hand one role a decision that belongs to a different role: for example, a combined document must never let a Builder also supply its own acceptance verdict, or let an Orchestrator author findings that only a Critic may independently produce. If streamlining seems to require that, the correct fix is to keep those two handoffs separate, not to blur them.';

const DECLARED_EQUIVALENT_NOTE = 'When this project\'s deliverable is not a versioned codebase, do not silently assume a Git-based mechanism. Instead define an explicit, documented equivalent naming six things: the target workspace; how a specific candidate version gets an immutable and unique identity; how evidence tied to that identity can be independently found; how a change to anything the candidate depends on gets detected; how only one writer works on a candidate at a time; and how a finished or abandoned candidate\'s resources get preserved or cleaned up. Name that equivalent explicitly inside the Checkpoint Brief form and anywhere else candidate identity or evidence is referenced.';

const PRECEDENCE_TEXT = [
  'When sources conflict, this order governs: (1) this project\'s ratified root rulebook, (2) durable project state naming the exact ratified checkpoint or plan anchor in force, (3) the specific plan section containing the current acceptance bar, (4) the role contract of whichever role is using a given form, (5) the form itself and any other supporting template or static planning map, (6) the verified actual state of the repository, environment, or data.',
  'Forms are operational scaffolding, not governance — a form template may never override what the rulebook or a role contract says a role may or may not do. If drafting or streamlining a form surfaces a conflict with either, report the conflict; do not resolve it by quietly reshaping the form to fit convenience.',
].join('\n');

function operatingModeText(fresh, continuityNote) {
  return fresh
    ? 'Launch the agent from the root of your project and make sure it can read the project files. Do not copy your project documents into this website — this generated prompt is meant to be handed to an agent that already has real file access to your repository.'
    : `Continue in the same agent conversation that completed the previous step. That continuity does not excuse skipping verification here: ${continuityNote}`;
}

function formsSourceLabel(value) {
  if (value === DELEGATE_VALUE) return 'Not sure yet — asked the agent to investigate what kind of deliverable this project actually produces and recommend an approach with tradeoffs.';
  return FORMS_SOURCE_LABELS[value] || 'Not yet specified.';
}

function ceremonyLevelLabel(value) {
  if (value === DELEGATE_VALUE) return 'Not sure yet — asked the agent to weigh this project\'s actual size and risk and propose a ceremony level with tradeoffs.';
  return CEREMONY_LABELS[value] || 'Not yet specified.';
}

function formsSourceInstruction(value) {
  if (value === DELEGATE_VALUE) {
    return 'The human is not sure whether to adopt these forms directly, adapt them, or needs a non-software equivalent. Investigate what this project actually produces — a versioned codebase, or some other kind of artifact such as a document, a design, a physical output, or a dataset — and propose which of the three approaches fits, with the tradeoffs of each, before drafting anything. Default to direct adoption for an ordinary software repository unless you find a concrete reason it needs adaptation.';
  }
  if (value === 'adapt-lightly') {
    return 'Draft all ten forms below, adapted in wording and specific fields to fit this project\'s own terminology and actual workflow — every handoff, its writer, its reader, and its required content must still be present; only the surface language and a small number of project-specific fields should change.';
  }
  if (value === 'from-scratch-non-software') {
    return `This project's deliverable is not a versioned codebase, so a Git-based identity mechanism does not apply as-is. Draft all ten forms below, but replace every place that assumes Git — candidate identity, dependency-change detection, single-writer isolation, reclamation — with an explicit declared equivalent. ${DECLARED_EQUIVALENT_NOTE}`;
  }
  return 'Draft all ten forms below close to their definitions, adapting only the surface wording needed to name this project\'s own roles, workspace, and artifacts — do not drop or soften any required field.';
}

function ceremonyLevelInstruction(value, riskLabel, rolesKeptDistinctLabel) {
  if (value === DELEGATE_VALUE) {
    const extra = [
      riskLabel ? `The human previously described this project's overall risk tolerance as ${riskLabel}.` : '',
      rolesKeptDistinctLabel ? `An earlier step recorded that the human wants to keep these roles as genuinely distinct conversations: ${rolesKeptDistinctLabel}.` : '',
    ].filter(Boolean).join(' ');
    return [
      'The human is not sure how much ceremony this project\'s size actually justifies. Investigate the project\'s actual scope, team size, and risk, and propose a ceremony level — all ten forms distinct, or a specific streamlined set — with the tradeoffs of each, before finalizing anything. Default to recommending all ten distinct unless you find a specific, stated reason this project is small enough to justify combining any.',
      extra,
    ].filter(Boolean).join(' ');
  }
  if (value === 'streamline') {
    return [
      'Streamline the ten forms into fewer combined documents sized to this project, but only where a merge does not blur who writes, who reads, or what a handoff must contain. Safer merges pair a form with its own immediate counterpart — for example the Component Critic Assignment and the Critic Verdict can live in one template if the assignment section is filled in and frozen before the verdict section is ever touched, and the Fresh Integration Critic\'s assignment and verdict can likewise share one document for the same reason. Dangerous merges are the ones this project must not make: never combine the Builder Assignment with the Component Critic Assignment or Verdict, because a Builder must never see the bar it is being judged against; never combine anything the Engineering Lead writes with anything a Critic independently verifies, because that erases independent review; and never combine the Orchestrator Receipt with the human\'s Landing/Disposition decision, because a supported receipt is not the same thing as a human choosing to land or discard. For every merge you make, state explicitly, next to the combined document, which authority boundary from the original ten still holds and how the merged format keeps it checkable.',
      'A useful proportionality check: the amount of ceremony should roughly track the cost of being wrong here, not the number of people involved — a solo, low-stakes project can combine documents while still keeping every real handoff distinct in substance; a higher-stakes project should keep more of the ten forms as literally separate artifacts even if the same person will read and write most of them.',
    ].join('\n\n');
  }
  return 'Draft all ten forms below as ten separate documents or templates, even if the same person will act as more than one role in practice — a merged conversation still benefits from separate artifacts, because a separate document is what makes a boundary checkable after the fact rather than assumed.';
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'forms',
  number: 8,
  title: 'Operational Forms & Protocols',
  purpose: 'Wire the ten boundary forms, or a deliberately streamlined equivalent, into the project so every handoff between roles has a concrete artifact.',
  agentProduces: 'The ten boundary forms (checkpoint brief, active workbench, builder assignment, component critic assignment, critic verdict, fresh integration critic, consolidated return packet, orchestrator receipt, landing/disposition/evidence/reclamation, invalid brief return) adopted, adapted, or streamlined for this project, placed somewhere the project can actually find and reuse them.',
  prerequisites: ['roles'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The ten forms themselves — their names, their writer and reader, and what each must contain — are drawn directly from the method brief\'s "Ten operational forms" section, reproduced here in generic language so the generated prompt is self-contained for whatever agent receives it.',
      'The Landing, Disposition, Evidence & Reclamation form\'s two-phase structure — a read-only inspection phase that never pre-fills a decision, followed only after the human\'s explicit choice by a preservation-and-reclamation phase — comes directly from the method brief, including that an unexplained artifact is surfaced to the human rather than auto-deleted.',
      'The Orchestrator Receipt being an envelope check (authorization, checklist completeness, honest provenance, live-resource match, identity resolution) rather than a second technical review of the work itself is stated directly in the method brief and preserved in this stage\'s generated prompt.',
      'The Invalid Brief Return being a correct, honest, pre-execution refusal — not a failure to route around — and the requirement that a Checkpoint Brief missing or contradictory on any of its fields is rejected before any edit, clock start, workbench, or Critic context, is taken directly from the method brief.',
      'The six primitives a non-Git "declared equivalent" must name — target workspace, immutable/unique candidate identity, independently resolvable evidence identity, a dependency change-detection query, a single-writer isolation mechanism, and a preservation/reclamation procedure — are reproduced directly from the checkpoint brief\'s constraints-and-evidence-profile field in the method brief.',
    ],
    adapted: [],
    productDesign: [
      'The formsSource question (adopt directly, adapt lightly, or draft a from-scratch non-software equivalent) and the formsLocation field are this guide\'s own decomposition of a single drafting task into an explicit human decision — the source method has a setup agent draft the boundary forms directly as part of a larger bootstrap payload, without asking a human these specific structured questions first.',
      'The ceremonyLevel question, its explicit "safe merge versus dangerous merge" guidance, and its ratio-of-ceremony-to-project-size framing are this guide\'s own addition. The source method treats the ten forms as a fixed structural set and does not offer a tunable streamlining dial with worked examples of which merges are safe — that calibration control, including the specific list of dangerous merges, is this guide\'s editorial judgment about how the method\'s own proportionality principle (ceremony should not cost more than the risk it controls) applies specifically to the form set.',
    ],
  },
  questions: [
    {
      id: 'formsSource',
      type: 'radio',
      label: 'How should this project adopt the ten operational forms?',
      help: FORMS_SOURCE_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Branches the Exact task layer: direct adoption asks the agent to draft all ten forms close to their definitions; light adaptation asks it to reshape wording and fields to this project\'s own terminology while keeping every handoff intact; a non-software artifact tells the agent to define an explicit declared equivalent for identity, evidence, and reclamation instead of assuming Git. Selecting the delegate option tells the agent to investigate what kind of deliverable this project actually produces and recommend an approach with tradeoffs.',
      options: [
        { value: 'adopt-directly', label: 'Adopt this method\'s ten forms directly', description: 'Use all ten forms essentially as defined, adapted only in wording to fit this project\'s own names for things.' },
        { value: 'adapt-lightly', label: 'Adapt them lightly for this project', description: 'Keep all ten handoffs and their authority boundaries, but reshape specific fields to fit how this project actually works.' },
        { value: 'from-scratch-non-software', label: 'Need a from-scratch equivalent for a non-software artifact', description: 'This project\'s deliverable is not a versioned codebase, so the forms need an explicitly declared equivalent of identity, evidence, and reclamation instead of assuming Git.' },
      ],
    },
    {
      id: 'formsLocation',
      type: 'text',
      label: 'Where should these forms/templates live in the project?',
      help: FORMS_LOCATION_HELP,
      required: false,
      placeholder: 'e.g. a docs/ or process/ folder, a wiki page, a pinned template in your project management tool — a rough answer is fine',
      affectsPrompt: 'Quoted into the Human intent and Exact task layers as the target location for the drafted forms; if left blank, the agent is told to propose a location and confirm it with the human rather than guessing silently.',
    },
    {
      id: 'ceremonyLevel',
      type: 'radio',
      label: 'How much ceremony does this project\'s size actually justify?',
      help: CEREMONY_LEVEL_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Branches the Exact task and Constraints layers: keeping all ten distinct produces ten separate documents; streamlining tells the agent which specific merges are safe (pairing an assignment with its own verdict) versus dangerous (letting a Builder see its own acceptance bar, or a Lead author its own verdict) and requires every authority boundary to survive the merge explicitly. Selecting the delegate option tells the agent to weigh this project\'s actual size and risk and propose a ceremony level with tradeoffs.',
      options: [
        { value: 'keep-distinct', label: 'Keep all ten forms distinct', description: 'Ten separate handoffs, ten separate documents or templates.' },
        { value: 'streamline', label: 'Streamline into fewer combined documents for a small project while keeping every authority boundary intact', description: 'Merge forms where doing so does not blur who writes, who reads, or what each handoff must contain.' },
      ],
    },
  ],
  freeTextLabel: 'What should the agent understand about your forms or process setup that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'investigated', label: 'The agent read the project\'s actual current rulebook, role contracts, and any existing forms/templates directly, rather than relying on my summary of them.', kind: 'confirm', required: true },
    { id: 'formsCreated', label: 'All ten handoffs are represented by an actual document or template in the project — either as ten separate artifacts or as the specific streamlined set I chose — with every authority boundary preserved.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported what it verified, what it assumed, and any authority boundary it could not confirm was preserved by a merge — not just a claim of success.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I\'ve reviewed the resulting form set myself before treating any of it as ratified.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the forms/templates (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';
    const location = (answers.formsLocation || '').trim();

    const orientationAnswers = (ctx.allAnswers && ctx.allAnswers.orientation) || {};
    const riskLabel = { low: 'low stakes', medium: 'medium stakes', high: 'high stakes' }[orientationAnswers.riskTolerance] || '';

    const rolesAnswers = (ctx.allAnswers && ctx.allAnswers.roles) || {};
    const rolesSelected = Array.isArray(rolesAnswers.rolesNeeded) ? rolesAnswers.rolesNeeded.filter((v) => v !== DELEGATE_VALUE) : [];
    const rolesKeptDistinctLabel = rolesSelected.length ? rolesSelected.map((v) => ROLE_LABELS[v]).filter(Boolean).join(', ') : '';

    const sourceLabel = formsSourceLabel(answers.formsSource);
    const ceremonyLabel = ceremonyLevelLabel(answers.ceremonyLevel);

    const roleAndAuthority = [
      'You are acting in an Engineering-Lead-like drafting capacity to help the human Architect/Owner adopt or adapt the operational forms that carry handoffs between roles on their own project. Drafting is all you are authorized to do here: you propose form templates and their placement; only the human Owner reviews and ratifies them as governing.',
      'These forms, once ratified, become part of this project\'s protected process material. No later executing agent, in any role, may quietly skip using them, hollow out a required field, or merge two of them in a way that erases an authority boundary just because it would be faster in the moment.',
    ].join('\n');

    const stageObjective = 'Produce, for this project, a concrete document or template for each of the ten operational handoffs below — either as ten separate artifacts or as the specific streamlined set the human chose — so that every point where one role\'s claim must become another role\'s independently verified fact has a real, findable artifact behind it, without inventing an eleventh form or a new authority tier.';

    const humanIntent = [
      quoteHumanInput('How this project should adopt the ten forms', sourceLabel),
      location ? quoteHumanInput('Where the forms/templates should live', location) : '',
      quoteHumanInput('Ceremony level for this project\'s size', ceremonyLabel),
      riskLabel ? quoteHumanInput('Risk tolerance recorded earlier in this process', riskLabel) : '',
      rolesKeptDistinctLabel ? quoteHumanInput('Roles already decided, in an earlier stage, to be kept as genuinely distinct conversations', rolesKeptDistinctLabel) : '',
      quoteHumanInput('Anything else the human wants understood about their forms or process setup', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = operatingModeText(
      fresh,
      'verify the rulebook\'s and role contracts\' actual current, saved content directly from the project files before drafting or revising any form — a prior conversation\'s summary of what they say is not evidence of what is on disk now.',
    );

    const investigation = fresh
      ? [
          'This is a fresh conversation with no memory of any earlier discussion about this project, so verify everything from scratch rather than trusting anything asserted below as already true:',
          '- Read the project\'s ratified rulebook and role contracts (or equivalent governing documents) in full, directly from the repository — do not proceed from a summary or from what this prompt claims about them.',
          '- Search the repository for any pre-existing form, template, checklist, or process document that already covers one or more of the ten handoffs below, and read each one completely before proposing anything, so you revise deliberately instead of silently duplicating or overwriting prior work.',
          '- Confirm what kind of deliverable this project actually produces — a versioned codebase you can inspect directly, or something else — rather than assuming from the human\'s answer alone; if the human said "adopt directly" or "adapt lightly" but the project turns out not to be a versioned codebase, say so and flag the mismatch rather than drafting a Git-shaped mechanism that does not apply.',
          '- Confirm there is no unratified or ambiguous draft of the rulebook, role contracts, or an existing form set being treated as if it were already governing.',
          'If the rulebook or role contracts cannot be found, are ambiguous, or contradict each other on who fills which role, stop and report that rather than guessing a resolution.',
        ].join('\n')
      : [
          'Even though this continues the same conversation, re-verify rather than assume:',
          '- Open and read the rulebook\'s and role contracts\' current, saved content directly — confirm they still say what you believe they say.',
          '- Check whether any form, template, or process document already exists in the project so you revise it deliberately rather than overwrite it silently.',
          '- Re-confirm what kind of deliverable this project actually produces; do not carry forward an earlier turn\'s assumption if the project could have changed since.',
          'If anything here contradicts what you find on disk, the disk wins — say so and reconcile it before drafting.',
        ].join('\n');

    const precedence = PRECEDENCE_TEXT;

    const task = [
      'This project is adopting a method where a bounded unit of work moves through exactly ten handoffs, each with its own written form so that a claim by one role can be independently checked by whichever role reads it next. Use exactly these ten forms — do not add, rename, or merge in a new one beyond what streamlining below explicitly allows:',
      FORM_DEFINITIONS,
      ROLE_NAMES_NOTE,
      FRESH_REVIEWER_NOTE,
      formsSourceInstruction(answers.formsSource),
      ceremonyLevelInstruction(answers.ceremonyLevel, riskLabel, rolesKeptDistinctLabel),
      `Place the drafted forms/templates at ${location ? `"${location}"` : 'a location you propose and confirm with the human — do not guess silently and scatter them'}, somewhere this project's own agents can actually find and reuse them on every future handoff, and include a short index note describing which form maps to which of the ten handoffs above.`,
      NO_NEW_AUTHORITY_LINE,
    ].filter(Boolean).join('\n\n');

    const constraints = [
      NO_NEW_AUTHORITY_LINE,
      'Do not rewrite the rulebook or any role contract in this stage. If drafting or streamlining a form surfaces a real conflict with either, report the conflict — do not silently resolve it by editing governance material you were not asked to touch.',
      'Do not silently overwrite any form or template that already exists in this project; read it first and state explicitly what you are revising and why.',
    ].join('\n');

    const deliverables = [
      'All ten handoffs represented as actual documents or templates inside the project — either as ten separate artifacts, or as the specific streamlined set the ceremony-level instruction above calls for — each naming its writer, its reader, and its required content in checkable language.',
      `Placed at ${location ? `"${location}"` : 'a location proposed and confirmed with the human'}, with a short index describing which form maps to which handoff, so a future agent or human can find the right one without re-deriving this mapping.`,
      'An explicit note, wherever any form was merged or adapted from its base definition, stating which specific authority boundary was preserved and how a reader could still check it.',
    ].join('\n');

    const qualityGates = [
      'Every form states, explicitly, who writes it and who reads it — a stranger should be able to tell, from the form alone, which role produced it and which role is bound by it.',
      'No form or combined document lets one role\'s claim about its own work count as another role\'s independent verdict — in particular, a Builder never supplies its own acceptance verdict, and an Engineering Lead never supplies a Critic\'s independent check.',
      'The Landing/Disposition form, or its streamlined equivalent, still separates read-only inspection from the human\'s actual decision, and still separates that decision from what happens afterward to evidence and resources.',
      'If this project\'s deliverable is not a versioned codebase, every place a form would otherwise assume Git names an explicit declared equivalent instead, covering all six primitives named above.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume this project already has these ten handoffs represented anywhere, even informally, without checking directly — investigate before assuming either a gap or a duplicate.',
      'Do not assume a merge is safe just because it saves paperwork; check it against the dangerous-merge list above before combining any two forms.',
      'Do not assume a software-shaped Git mechanism applies just because the project has a repository — a repository that only stores planning notes about a physical or offline artifact still needs a declared equivalent, not an assumed one.',
      NO_NEW_AUTHORITY_LINE,
    ].join('\n');

    const stopConditions = 'Stop and return to the human, rather than guessing, if: the rulebook or role contracts this stage depends on are missing, ambiguous, or contradictory about who fills which role; you cannot tell, for a specific merge, whether it would blur an authority boundary; this project\'s actual deliverable type is genuinely unclear (neither obviously a versioned codebase nor obviously something else); or you find yourself about to let one role\'s report stand in for another role\'s independent check.';

    const approvalBoundary = 'Everything you draft in this stage is a proposal until the human Owner reviews and explicitly ratifies it. Do not treat any form as already in force, do not use a drafted form to justify skipping a real handoff on live work, and do not delete or overwrite an existing form template without the human\'s explicit confirmation in this conversation.';

    const terminalReturn = [
      '"Done" for this stage means: every one of the ten handoffs above is represented by an actual document or template inside the project — whether as ten separate artifacts or the agreed streamlined set — each stating its writer, reader, and required content in checkable language; the forms exist at a named, findable location with an index; and any merge or adaptation states explicitly which authority boundary survived it and how.',
      'Report exactly what you created or changed (paths), what you verified about the current rulebook, role contracts, and any pre-existing forms and how — not just a claim — any assumptions you made and why, any unresolved conflict with existing governance material, and any authority boundary you could not confirm was preserved. Stop there for the human\'s review rather than treating any form as ready for real use.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'audit-missing-field',
      label: 'Audit the form set for a missing required field',
      description: 'Use instead of the primary prompt when a form set already exists for this project and you need to check systematically whether every required field on every form is actually present, rather than assuming the original draft was complete.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const location = (answers.formsLocation || '').trim();
        const sourceLabel = formsSourceLabel(answers.formsSource);
        const ceremonyLabel = ceremonyLevelLabel(answers.ceremonyLevel);

        const roleAndAuthority = [
          'You are acting as an independent auditor of this project\'s existing operational forms, on behalf of the human Architect/Owner. You hold no authority to change anything unilaterally — you locate and report missing or vague required fields, propose the minimal fix, and stop for the human\'s decision.',
          'The forms under audit are part of this project\'s protected process material. Your output is a proposed fix, not an applied change, until the human ratifies it.',
        ].join('\n');

        const stageObjective = 'Check every existing form in this project against the canonical required-content list for its handoff below, and report exactly which fields are missing, vague, or were silently dropped — not a general impression of quality, a field-by-field check.';

        const humanIntent = [
          quoteHumanInput('How this project adopted the ten forms', sourceLabel),
          location ? quoteHumanInput('Where the forms/templates live', location) : '',
          quoteHumanInput('Ceremony level chosen for this project', ceremonyLabel),
          quoteHumanInput('Which form the human suspects is incomplete, or what prompted the concern, in their own words (if provided)', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-read every existing form and the rulebook and role contracts directly from the project files before auditing anything — do not audit from memory of what was drafted earlier in this conversation.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Locate and read every existing form or template in the project in full, at whatever location they currently live.',
              '- Read the ratified rulebook and role contracts, so you know which roles actually exist here and can check each form\'s writer/reader claim against them.',
              '- For each of the ten handoffs named below, confirm whether a corresponding document exists at all before checking its fields — a missing form is itself the largest possible finding, separate from a form with a missing field.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-read every existing form\'s current, saved content directly, not from memory of drafting it earlier in this conversation.',
              '- Re-read the rulebook and role contracts to confirm the roles and boundaries you are checking against have not changed.',
              '- Confirm the specific form the human suspects, if any, still reflects its current saved wording rather than an earlier draft.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'For each of the ten handoffs below, locate the corresponding document in this project (or note plainly that none exists), then check whether every required field named in its definition is actually present, specific, and complete rather than vague or silently omitted:',
          FORM_DEFINITIONS,
          ROLE_NAMES_NOTE,
          FRESH_REVIEWER_NOTE,
          'For every missing or vague field you find, quote the relevant part of the existing form (or state that the field is absent entirely), name which specific authority boundary depends on that field being present and checkable, and propose the minimal fix. Do not silently patch the form yourself — report the gap and the proposed fix, clearly labeled PROPOSED, NOT YET RATIFIED.',
        ].join('\n\n');

        const constraints = [
          NO_NEW_AUTHORITY_LINE,
          'This is an audit, not a rewrite. Do not revise sections of any form that are already complete just because you are already reading the file.',
          'Do not report a stylistic or wording preference as a "missing field" — only report a field that the canonical definition above actually requires and that is genuinely absent or too vague to check.',
        ].join('\n');

        const deliverables = 'A field-by-field gap report: for each of the ten handoffs, whether a form exists, and for each existing form, every required field that is missing or too vague to check, each tied to the specific authority boundary it protects, with a minimal proposed fix labeled PROPOSED, NOT YET RATIFIED. If a genuine check turns up no gaps, an honest statement to that effect instead of a manufactured one.';

        const qualityGates = [
          'The audit covers all ten handoffs, not only the one the human suspects, since a missing field in an unrelated form is easy to miss if only the named one is checked.',
          'Every reported gap cites the exact required field from the canonical definition above and the specific authority boundary it protects — not a vague sense that a form "could be clearer."',
          'Every proposed fix is minimal and does not restructure a form beyond what is needed to close the specific gap found.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume a field is fine because the rest of the form looks complete — check each required field independently.',
          'Do not assume a missing field is intentional streamlining without checking it against the project\'s actual chosen ceremony level and the dangerous-merge guidance above.',
          'Do not assume the drafting agent\'s original choices were careless just because you found something to flag.',
        ].join('\n');

        const stopConditions = 'Stop and report immediately, rather than continuing a full sweep silently, if a gap you find touches a field that protects a critical boundary — for example a Builder Assignment that turns out to already expose the acceptance bar, or a Critic Verdict missing its independent-identity check. Flag that specific finding on its own before finishing the rest of the audit.';

        const approvalBoundary = 'This audit and its proposed fixes are recommendations until the human Owner reviews and explicitly ratifies any change. Do not apply a fix as if it were already in force, and do not treat an incomplete form as usable in the meantime.';

        const terminalReturn = [
          '"Done" for this recovery means: every one of the ten handoffs was checked for existence and for every required field named in its canonical definition; every gap found is reported with the missing field, the authority boundary it protects, and a minimal proposed fix; and any urgent finding was flagged on its own rather than buried in a longer list.',
          'Report the full gap list (or an honest "none found" if a genuine check turned up nothing), and stop there for the human\'s review rather than editing any form yourself without confirmation.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'repair-streamlined-boundary',
      label: 'Repair a form set that lost an authority boundary during streamlining',
      description: 'Use instead of the primary prompt when this project already streamlined its form set and you suspect, or have evidence, that a merge blurred who writes, who reads, or who independently verifies something — repair just the affected document, not the whole set.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const location = (answers.formsLocation || '').trim();
        const ceremonyLabel = ceremonyLevelLabel(answers.ceremonyLevel);

        const roleAndAuthority = [
          'You are acting in an Engineering-Lead-like capacity to repair one merged form document for the human Architect/Owner\'s project — not to redraft the whole form set from scratch and not to undo streamlining that is actually working. You hold no authority to ratify the repair; the human Owner alone does that.',
          'The form you are repairing is part of this project\'s protected process material. Do not let this repair spill into rewriting the rulebook, a role contract, or an unrelated form without explicitly flagging that as a separate, unresolved item.',
        ].join('\n');

        const stageObjective = 'Find the specific merged document where streamlining blurred an authority boundary between two of the ten handoffs, and re-separate only the part that needs to be separate — leaving the rest of the project\'s streamlining decisions intact unless the same problem shows up elsewhere too.';

        const humanIntent = [
          quoteHumanInput('Ceremony level chosen for this project', ceremonyLabel),
          location ? quoteHumanInput('Where the forms/templates live', location) : '',
          quoteHumanInput('Where the human believes the boundary was lost, in their own words (if provided)', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-read the actual merged document you are repairing, plus the rulebook and role contracts, directly from the project files before touching anything — do not rely on what an earlier turn in this conversation claimed the document says.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Read every existing form or template in this project\'s current streamlined set, not just the one you suspect — an entanglement can involve a second document nobody flagged.',
              '- Read the ratified rulebook and role contracts so you know which roles actually exist here and what each may and may not do.',
              '- Look for concrete evidence that the blurred boundary has already caused, or could plausibly cause, a specific role to act outside its authority — for example a document where a Builder\'s assignment and the acceptance bar it will be judged against appear in the same section a Builder would read. If the human\'s free text names a specific instance, verify it against the actual current document rather than taking the account at face value.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-read the specific merged document\'s current, saved content directly — do not repair from memory of drafting it.',
              '- Re-read the rulebook, role contracts, and the rest of the current streamlined form set to confirm your fix will not create a new overlap while closing the old one.',
              '- Confirm any evidence of the blur the human mentions still reflects the document\'s current wording, not an earlier draft.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Locate the exact merged document the human means — from their free text, or by finding the document whose combined fields let one role\'s claim substitute for a different role\'s independent check. Quote the entangled section back in your report; do not silently rewrite without showing what was wrong.',
          'Identify which two (or more) of the ten handoffs below got entangled in that document, and explain concretely, against the dangerous-merge guidance, why this specific combination is unsafe rather than merely unusual:',
          FORM_DEFINITIONS,
          ROLE_NAMES_NOTE,
          FRESH_REVIEWER_NOTE,
          NO_NEW_AUTHORITY_LINE,
          'Re-split only the entangled handoffs into a properly separated document or section, so the authority boundary between them is checkable again. Leave every other merge in the current streamlined set untouched unless you find the same kind of entanglement there too, which you must call out explicitly rather than silently expand this repair to cover.',
        ].join('\n\n');

        const constraints = [
          NO_NEW_AUTHORITY_LINE,
          'This is a targeted repair, not a wholesale return to all ten forms being separate. Do not undo a merge that is not actually unsafe just because it is unusual.',
          'If you find the same kind of entanglement in more than one merged document, say so explicitly and recommend the human run a full form-set audit next, rather than silently expanding the scope of this repair.',
        ].join('\n');

        const deliverables = 'The repaired document(s): the newly separated form(s) with the authority boundary restored, plus a short note quoting the original entangled wording or structure, explaining what was unsafe about it, and confirming the rest of the current streamlined set is unaffected.';

        const qualityGates = [
          'The repair re-establishes an unambiguous writer, reader, and required-content boundary for the specific handoff that was blurred — a stranger should be able to tell, from the repaired document alone, which role produced which part and which role independently checks it.',
          'The repair does not accidentally re-merge or blur a different boundary while fixing this one.',
          'The repair does not depend on inventing a role, title, or coordinating function that does not already exist in the six-role set.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the whole streamlined set is unsafe because one merge was bad — repair only what evidence supports.',
          'Do not assume the unsafe merge was intentional; it is more often an oversight made while trying to reduce paperwork than a deliberate attempt to weaken a boundary.',
          NO_NEW_AUTHORITY_LINE,
        ].join('\n');

        const stopConditions = 'Stop and return to the human if fixing this one document turns out to require changing the rulebook or a role contract, if the same kind of entanglement appears in more than one merged document (a systemic issue, not a local one), or if it is genuinely unclear whether a given merge is unsafe or just uses unfamiliar wording.';

        const approvalBoundary = 'The repaired document is a proposal until the human Owner reviews and explicitly ratifies it. Do not treat the repair as already in force, and do not let any role act on the previously blurred authority in the meantime.';

        const terminalReturn = [
          '"Done" for this recovery means: the one entangled document has been re-split so its authority boundary is checkable again; the original entangled wording and the fix are both quoted in your report; and no new role or authority tier was introduced anywhere in the proposal.',
          'Report the exact change (path and what changed), the evidence of the entanglement you found or the human\'s account you relied on, any cross-document impact you identified and left for the human to decide, and stop there for review.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'Forms are what make a role boundary something an agent can actually be held to, rather than a sentence in a contract everyone means to follow. A role contract says a Builder never grades its own work; a form is the concrete artifact that makes that true in practice, by making sure the acceptance bar physically never appears in the document a Builder reads. This stage exists to turn the six role contracts from the previous stage into ten real handoff points, each with its own artifact, so "zero trust" is enforced by what documents exist and who can see them, not only by good intentions.',
    problemPrevented: 'Without concrete forms, role separation degrades into a shared conversation where everyone can see everything — a Builder happens to see the acceptance checklist because it was in the same chat, an Engineering Lead\'s private scratch notes get treated as evidence because nobody drew a line around them, a "verdict" turns out to have been written by the same context that built the thing it is judging. None of these look like a violation in the moment; each is just convenient. A named, separate document for each handoff is what makes a later reviewer able to ask "where is the Critic Verdict, and did the Critic that wrote it actually see the Builder\'s private reasoning" and get a checkable answer.',
    judgmentVsInvestigation: 'Which of the three adoption paths fits this project, where the forms should live, and how much ceremony this project\'s size actually justifies are all judgment calls only the human can make — no amount of repository investigation reveals whether a human wants ten separate documents or a leaner combined set, though the delegate option lets the human hand the sizing judgment to the agent\'s investigation when they are genuinely unsure. Everything about whether this project is actually a versioned codebase, whether forms or equivalents already exist, and what the current rulebook and role contracts actually say is investigation the agent must do directly — this stage never asks the human to describe their own repository\'s structure from memory.',
    promptAnatomy: 'This stage\'s generated prompt inlines the full ten-form definition directly in the Exact task layer, for the same reason the roles stage inlines the six-role definition: the receiving agent may have no access to this method\'s source material, so the prompt has to be self-sufficient. The task layer\'s heaviest lift is the streamlining branch, because "merge for less paperwork" and "merge in a way that erases independent review" look identical on the page and only differ in which specific pair of handoffs got combined — the prompt spells out the safe and dangerous merges explicitly rather than trusting the receiving agent to derive them from general principles under time pressure.',
    authorityBoundary: 'The agent producing these forms holds no authority over the roles that will use them — it is drafting artifacts for the human Owner to ratify, the same way the roles stage\'s agent drafts contracts rather than appointing itself to a role. Once ratified, the forms themselves become part of the project\'s protected process material: no later executing agent, in any role, may skip a required field, merge two handoffs unsafely, or treat its own private workbench as evidence just because a future checkpoint would move faster that way. A genuinely needed change to the form set is a stop condition that returns to the Owner, never a silent self-edit made mid-task.',
    inputsAndSources: 'Inputs are the three structured answers (adoption path, forms location, ceremony level), the free-text field, and — critically — the project\'s own ratified rulebook and role contracts, which the agent must read directly from the repository rather than accept as summarized in this prompt. Cross-stage recall pulls in the risk tolerance recorded during Orientation and the role set recorded during Roles & Agent Configuration, so the ceremony-level judgment is informed by decisions the human already made rather than asked cold. No file, path, or document from outside the human\'s own project is ever a valid source for this stage.',
    outputsAndEvidence: 'The expected output is one document or template per surviving handoff (ten if kept distinct, fewer if streamlined), placed at a findable location with an index mapping each one to its handoff, with evidence being the forms\' own text: a fresh reader should be able to check a specific past action against a specific form\'s writer/reader/required-content and get an unambiguous answer about whether it was in bounds.',
    failureModes: [
      'Treating the ten forms as ten sections of one long document nobody actually consults per-handoff, which recreates the "everyone sees everything" problem this stage exists to prevent even though ten headings technically exist.',
      'Streamlining by combining the Builder Assignment with the Critic Assignment or Verdict, so the Builder ends up able to see the exact bar it will be judged against before finishing its work.',
      'Letting the Engineering Lead\'s Consolidated Return Packet absorb the Critic Verdict\'s independent judgment instead of citing it, so the "verdict" quietly becomes the Lead\'s own characterization of the Critic\'s work rather than the Critic\'s own words.',
      'Collapsing the Landing/Disposition form\'s two phases into one step that pre-fills a recommended disposition before the human has actually decided, which nudges the read-only inspection into looking like a foregone conclusion.',
      'Assuming a Git-based candidate-identity mechanism applies to a non-software deliverable without checking, leaving the Checkpoint Brief\'s evidence-and-identity field referring to a mechanism that does not actually exist for this project.',
    ],
    weakResultSigns: [
      'A form describes what a role usually does, but has no explicit list of what content is required before the handoff counts as complete.',
      'Two forms both seem to let the same role supply the "verdict" on the same piece of work.',
      'The location the forms live at was never confirmed with the human, or is scattered across several different, undocumented places.',
      'A merged document exists, but nothing in it says which of the original ten handoffs got combined or why the combination is safe.',
    ],
    customization: 'For a genuinely tiny solo project, resist collapsing all ten forms into a single freeform notes file just because it feels like overkill — thin the language and formatting inside each form instead (a short paragraph instead of a formal template) while keeping the handoffs themselves distinct, especially the ones the dangerous-merge guidance calls out. For a project with several people or several concurrent workstreams, consider whether the Builder Assignment needs to become several differently-scoped assignment templates rather than one generic template everyone fills in loosely.',
    whenToStop: 'Pause before ratifying if you cannot point to which specific document a future agent should read to find the acceptance bar for a piece of work, and which different document it should read to find the verdict on whether that bar was met — if those two things live in the same place a Builder would ever see, the set is not done yet, however complete it looks. Also pause if a merged document exists with no explanation of which original handoffs it combines; that omission makes the merge unauditable even if it happens to be safe.',
    auditWithoutPasting: 'You do not need to paste the form templates back into this website to sanity-check them. Instead, ask your agent, in its own conversation, a concrete hypothetical for each handoff you are unsure about — for example, "if the Builder working on this piece opened the document meant for the Critic, what would it see?" — and have it answer from the actual files, not from memory. If the answer is "the acceptance bar," that specific form needs another pass regardless of how tidy the rest of the set looks.',
    weakVsStrongExample: {
      weak: 'One shared "handoff notes" document where the Builder writes what it did, and further down the same page, the Critic writes whether it passed. Nothing stops the Builder from reading the Critic\'s section before finishing, and nothing marks which parts are which role\'s words.',
      strong: 'A Builder Assignment naming exactly one piece of work and its ownership boundary, handed to the Builder with no acceptance bar attached; a separate Critic Verdict, written after the fact by a fresh reviewer who never saw the Builder\'s private notes, stating pass, fail, or blocked with evidence and exactly one largest remaining gap — two documents, two authors, two audiences, each independently checkable.',
    },
  },
};
