import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const FORMS_SOURCE_HELP = 'Most projects should adopt the ten canonical forms below. Pick "adapt lightly" only if this project\'s vocabulary genuinely needs different field names; pick the non-software option only if there is no versioned codebase for a Git-shaped identity mechanism to attach to.';
const FORMS_LOCATION_HELP = 'A form nobody can find gets skipped the first time someone is in a hurry, which quietly turns a checked handoff back into an unchecked one. Naming a real location now — even a rough one — gives the agent something concrete to place files at instead of guessing or scattering them.';
const CEREMONY_LEVEL_HELP = 'Ceremony should track the cost of being wrong here, not the number of people on the project. A solo, low-stakes project can combine several of these ten documents; a project where a mistake is expensive should keep more of them as literally separate artifacts, even if the same person ends up reading and writing most of them.';

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
  '1. Checkpoint Brief — Orchestrator → Engineering Lead. Contains all eleven fields: target workspace; exactly one authorized checkpoint; exact ratified plan/version/section anchor; expected state labeled as the Orchestrator\'s hypothesis plus the Lead\'s required first observable-state report; observable goal; complete named checklist citation, complete authoritative bar, and verbatim supporting extract; constraints plus a declared GIT_REFERENCE or DECLARED_EQUIVALENT profile covering identity, evidence linkage, dependency-change detection, single-writer isolation, preservation, and reclamation; numeric active-elapsed ceiling; Owner-only actions pre-authorized or explicit NONE; executor/session preconditions; and exactly one stop-and-return instruction. Missing, ambiguous, or contradictory on any field means BRIEF_INVALID before work starts.',
  '2. Active Workbench — private Engineering Lead scratch state, not an inter-role handoff and never evidence. Records authorization and clock, first observable state, eligible pauses, complete goal/bar, decomposition and repair routing, Builder contexts and seeds, decision-bearing provenance, integration ledger, mandatory surfaces and independent oracles, component-verdict currency, terminal identities, post-verdict/post-stop reads, current topology, and any non-PASS terminal reason. It is never shown to Critics, the Orchestrator, or Owner and is cleared before return after durable facts are extracted into authorized artifacts.',
  '3. Builder Assignment — Engineering Lead → one Builder. Names brief/checkpoint identity, one piece, observable goal, concrete piece criteria with citations, relevant ratified rules, exact ownership allowlist, required evidence, and return format. It forbids scope expansion, shared-candidate writes, self-grading, and defining/copying/pre-answering the independent Critic oracle. It includes the Lead\'s import check for allowed paths and attributable Builder context/seed.',
  '4. Component Critic Assignment — Engineering Lead → one fresh Component Critic after the candidate is frozen. Names profile, exact immutable candidate and dependency identities, reviewed paths/surfaces, exact bar and citations, relevant rules, permitted evidence, and prohibited Builder narrative/workbench material. It includes the Critic\'s procedural identity/freshness declaration and instructs independent oracle derivation, read-only review, and a durable verdict.',
  '5. Critic Verdict — Component or Integration Critic → Engineering Lead. Records result PASS/FAIL/BLOCKED; exact plan/version/bar; reviewer identity and timestamps; exact candidate and reviewed dependencies; what was inspected; exhaustive decision-bearing provenance; commands actually run; expected results and tolerances; independent oracle derivation; criterion-by-criterion bar comparison; exactly one largest remaining gap or explicit BAR_MET; exact next acceptance test; and clearly separated non-blocking observations. It is invalid if it grades an unfrozen candidate, adopts the Builder\'s expected result as its oracle, hides provenance, writes the candidate, or cannot bind the result to exact identities.',
  '6. Fresh Integration Critic — Engineering Lead → a different fresh Integration Critic, with assignment and verdict. Names exact final candidate, complete bar, reviewer identity/freshness, every relied-on component verdict, decision-bearing provenance, mandatory-surface applicability, and required whole-candidate checks. It independently recomputes staleness for every relied-on verdict against the final candidate and records PASS/FAIL/BLOCKED without becoming the Lead or choosing disposition.',
  '7. Consolidated Return Packet — Engineering Lead → Orchestrator, and the Lead\'s only sanctioned upward report. Names exactly one terminal result; final candidate and evidence identities; full eleven-field brief echo; actual start state, administrative/active timing and pauses; exhaustive decision-bearing provenance; role/context boundaries and every post-verdict read; Builder contexts and seeds; all component and Integration verdicts with exact identities and computed currency; mandatory surfaces/oracles; complete checklist-to-evidence mapping; engineering decisions; reproduction instructions; open risk or exact Owner action; live topology/resource inventory including branches, worktrees, preservation reachability, unrelated resources, and NOT_CREATED reasons; optional proposed Owner-authored commit message; defense questions; and an explicit stop declaration. It distinguishes final_candidate identity from evidence_tip identity and any evidence-only terminal delta.',
  '8. Orchestrator Receipt — Orchestrator → existing durable program-state log. It reads only the Return Packet and cited durable evidence, never source/content as a second technical reviewer. It records target/checkpoint/anchor/profile/candidate/evidence identities; universal gates A1–A7; PASS-only gates P1–P6; conditional non-PASS gates N1–N6; exact bounded profile queries with status/output (for Git including git status --porcelain, worktree/branch/tag inspection, identity resolution, lineage, dependency changes, and candidate/evidence delta); and one SUPPORTED or REJECTED result with every failed gate, exact correction required, requested Owner decision, program-state location, and authority declaration. A REJECTED packet returns defects and then stops for case-by-case human direction; it does not prescribe an automatic repair route.',
  '9. Landing, Disposition, Evidence & Reclamation — lifecycle record with enforced fill order. Phase A records the supported-receipt or abandonment trigger, actual resource inventory, Git/profile topology, identity/preservation/citation inspection, unknown resources, and exact reclamation candidates, then STOPs without mutation. The Owner alone records LAND or DISCARD, exact covered resource, LAND eligibility, retry/change/continuation decisions. Phase B records Owner-only LAND mechanics or evidence-preserving DISCARD, verifies preservation before reclamation, repoints every live citation, reclaims only checkpoint-owned resources, leaves unknown/unrelated resources intact, verifies final identities and inventory, and records CLOSED/NOT_CLOSED in durable state. Continuation always needs a separate Owner decision and new brief.',
  '10. Invalid Brief Return — Engineering Lead → Orchestrator before execution. Names the brief identity and read-only facts checked, evaluates all eleven brief fields individually, lists every invalidating defect, requests exactly one corrected replacement brief, and confirms no clock, workbench, branch/workspace, candidate, edit, or execution artifact was created. BRIEF_INVALID is a correct refusal, not a technical result and not a receipt-gate packet.',
].join('\n\n');

const ROLE_NAMES_NOTE = 'These ten forms carry handoffs between six roles: the human Architect/Owner, and five execution roles — Orchestrator, Engineering Lead, Builder, Component Critic, and Integration Critic. If this project already has ratified role contracts from an earlier step, read them directly for the exact boundaries each role holds here rather than assuming a generic description; if none exist yet, use the writer/reader roles named above as the working definition. Do not invent a role or authority tier beyond these six anywhere in the forms you draft.';

const FRESH_REVIEWER_NOTE = '"Fresh" wherever it appears above means a new conversation or context reset carrying no memory of any prior conversation\'s claims about this work — a cooperative procedural control every participant agrees to follow, not a cryptographic or operating-system-level sandbox. State that plainly in any form template that references it, rather than implying stronger technical isolation than actually exists.';

const NO_NEW_AUTHORITY_LINE = 'These ten canonical forms are the complete required operating set: one is private scratch state and one is an alternate pre-execution return, so do not describe them as ten linear handoffs. Project-specific supplemental worksheets are allowed only when they are authority-neutral and do not replace, merge away, weaken, or rename a canonical boundary. Never create a new authority tier or let one role exercise another role\'s decision: a Builder cannot supply its own verdict, a Lead cannot author a Critic\'s finding, and an Orchestrator cannot become a technical reviewer.';

const DECLARED_EQUIVALENT_NOTE = 'When this project\'s deliverable is not a versioned codebase, do not silently assume a Git-based mechanism. Instead define an explicit, documented equivalent naming six things: the target workspace; how a specific candidate version gets an immutable and unique identity; how evidence tied to that identity can be independently found; how a change to anything the candidate depends on gets detected; how only one writer works on a candidate at a time; and how a finished or abandoned candidate\'s resources get preserved or cleaned up. Name that equivalent explicitly inside the Checkpoint Brief form and anywhere else candidate identity or evidence is referenced.';

const PRECEDENCE_TEXT = [
  'When sources conflict, this order governs: (1) this project\'s ratified root rulebook, (2) durable project state naming the exact ratified checkpoint or plan anchor in force, (3) the specific plan section containing the current acceptance bar, (4) the role contract of whichever role is using a given form, (5) the form itself and any other supporting template or static planning map, (6) the verified actual state of the repository, environment, or data.',
  'Forms are operational scaffolding, not governance — a form template may never override what the rulebook or a role contract says a role may or may not do. If drafting or streamlining a form surfaces a conflict with either, report the conflict; do not resolve it by quietly reshaping the form to fit convenience.',
].join('\n');

function operatingModeText(fresh, continuityNote) {
  return fresh
    ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
    : `You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn. That continuity does not excuse skipping verification here: ${continuityNote}`;
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

function ceremonyLevelInstruction(value, riskLabel) {
  if (value === DELEGATE_VALUE) {
    const extra = [
      riskLabel ? `The human previously described this project's overall risk tolerance as ${riskLabel}.` : '',
    ].filter(Boolean).join(' ');
    return [
      'The human is not sure how much ceremony this project\'s size actually justifies. Investigate the project\'s actual scope, team size, and risk, and propose a ceremony level — all ten forms distinct, or a specific streamlined set — with the tradeoffs of each, before finalizing anything. Default to recommending all ten distinct unless you find a specific, stated reason this project is small enough to justify combining any.',
      extra,
    ].filter(Boolean).join(' ');
  }
  if (value === 'streamline') {
    return [
      'Streamline the ten forms into fewer combined documents sized to this project, but only where a merge does not blur who writes, who reads, or what a handoff must contain. Safer merges pair a form with its own immediate counterpart — for example the Component Critic Assignment and the Critic Verdict can live in one template if the assignment section is filled in and frozen before the verdict section is ever touched, and the Fresh Integration Critic\'s assignment and verdict can likewise share one document for the same reason. Dangerous merges are the ones this project must not make: never combine the Builder Assignment with the Component Critic Assignment or Verdict, because that would put the independent acceptance oracle in front of the Builder, and the whole point is that the Critic derives that oracle separately rather than inheriting the Builder\'s own expected result; never combine anything the Engineering Lead writes with anything a Critic independently verifies, because that erases independent review; and never combine the Orchestrator Receipt with the human\'s Landing/Disposition decision, because a supported receipt is not the same thing as a human choosing to land or discard. For every merge you make, state explicitly, next to the combined document, which authority boundary from the original ten still holds and how the merged format keeps it checkable.',
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
      'The ten forms themselves — their names, their writer and reader, and what each must contain — are the ten boundary forms in templates/1-checkpoint-brief.md through templates/10-brief-invalid-return.md, reproduced here in generic language so the generated prompt is self-contained for whatever agent receives it.',
      'That the Builder Assignment carries an observable piece-level goal, concrete acceptance criteria with citations, and an exact ownership allowlist — while the Builder must never define, copy in, or pre-answer the independent acceptance oracle, which the Critic derives for itself from the ratified bar — is stated in templates/3-builder-assignment.md.',
      'The Landing, Disposition, Evidence & Reclamation form\'s two-phase structure — a read-only inspection phase that never pre-fills a decision, followed only after the human\'s explicit choice by a preservation-and-reclamation phase — is templates/9 together with RULEBOOK.md §16, "Evidence preservation and reclamation," including that an unexplained artifact is surfaced to the human rather than auto-deleted.',
      'The Orchestrator Receipt being an envelope check (authorization, checklist completeness, honest provenance, live-resource match, identity resolution) rather than a second technical review of the work itself is RULEBOOK.md §14, "Bounded Orchestrator receipt gate," which states outright that opening source as a second reviewer "would collapse the authority split."',
      'The Invalid Brief Return being a correct, honest, pre-execution refusal — not a failure to route around — and the requirement that a Checkpoint Brief missing, ambiguous, or contradictory on any field is rejected before any file edit, clock start, workbench, branch, or candidate exists, is RULEBOOK.md §5 and templates/10-brief-invalid-return.md.',
      'The six primitives a non-Git "declared equivalent" must name — target workspace, immutable/unique candidate identity, independently resolvable evidence identity, a dependency change-detection query, a single-writer isolation mechanism, and a preservation/reclamation procedure — come from field 7 of the checkpoint brief in RULEBOOK.md §5, read with the profile rules in §1.',
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
      label: 'How should this project adopt the ten canonical operational forms?',
      help: FORMS_SOURCE_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Branches the Exact task layer: direct adoption asks the agent to draft all ten forms close to their definitions; light adaptation asks it to reshape wording and fields to this project\'s own terminology while keeping every handoff intact; a non-software artifact tells the agent to define an explicit declared equivalent for identity, evidence, and reclamation instead of assuming Git. Selecting the delegate option tells the agent to investigate what kind of deliverable this project actually produces and recommend an approach with tradeoffs.',
      options: [
        { value: 'adopt-directly', label: 'Adopt this method\'s ten forms directly', description: 'Use all ten forms essentially as defined, adapted only in wording to fit this project\'s own names for things.' },
        { value: 'adapt-lightly', label: 'Adapt them lightly for this project', description: 'Keep all ten forms, required fields, and authority boundaries, but reshape surface terms to fit the project.' },
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
      affectsPrompt: 'Branches the Exact task and Constraints layers: keeping all ten distinct produces ten separate documents; streamlining tells the agent which specific merges are safe (pairing an assignment with its own verdict) versus dangerous (letting a Builder see the independent acceptance oracle that will judge its piece, or a Lead author its own verdict) and requires every authority boundary to survive the merge explicitly. Selecting the delegate option tells the agent to weigh this project\'s actual size and risk and propose a ceremony level with tradeoffs.',
      options: [
        { value: 'keep-distinct', label: 'Keep all ten forms distinct', description: 'Ten separate operational artifacts or templates.' },
        { value: 'streamline', label: 'Streamline into fewer combined documents for a small project while keeping every authority boundary intact', description: 'Merge forms where doing so does not blur who writes, who reads, or what each handoff must contain.' },
      ],
    },
  ],
  freeTextLabel: 'What should the agent understand about your forms or process setup that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'investigated', label: 'The agent read the project\'s actual current rulebook, role contracts, and any existing forms/templates directly, rather than relying on my summary of them.', kind: 'confirm', required: true },
    { id: 'formsCreated', label: 'All ten canonical forms are represented by an actual artifact or template — either separately or in the streamlined document set I chose — with every required field and authority boundary preserved.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported what it verified, what it assumed, and any authority boundary it could not confirm was preserved by a merge — not just a claim of success.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I reviewed the complete operational form set myself and explicitly ratify it.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the forms/templates (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';
    const location = (answers.formsLocation || '').trim();

    const orientationAnswers = (ctx.allAnswers && ctx.allAnswers.orientation) || {};
    const riskLabel = { low: 'low stakes', medium: 'medium stakes', high: 'high stakes' }[orientationAnswers.riskTolerance] || '';

    const sourceLabel = formsSourceLabel(answers.formsSource);
    const ceremonyLabel = ceremonyLevelLabel(answers.ceremonyLevel);

    const roleAndAuthority = [
      'You are acting in an Engineering-Lead-like drafting capacity to help the human Architect/Owner adopt or adapt the operational forms that carry handoffs between roles on their own project. Drafting is all you are authorized to do here: you propose form templates and their placement; only the human Owner reviews and ratifies them as governing.',
      'These forms, once ratified, become part of this project\'s protected process material. No later executing agent, in any role, may quietly skip using them, hollow out a required field, or merge two of them in a way that erases an authority boundary just because it would be faster in the moment.',
    ].join('\n');

    const stageObjective = 'Produce the ten canonical operational forms below — including the Lead\'s private Workbench and the alternate Invalid Brief Return — either as ten separate artifacts or as a deliberately streamlined document set, while preserving every required field and authority boundary. Supplemental authority-neutral worksheets may be added when useful; no new authority tier may be added.';

    const humanIntent = [
      quoteHumanInput('How this project should adopt the ten forms', sourceLabel),
      location ? quoteHumanInput('Where the forms/templates should live', location) : '',
      quoteHumanInput('Ceremony level for this project\'s size', ceremonyLabel),
      riskLabel ? quoteHumanInput('Risk tolerance recorded earlier in this process', riskLabel) : '',
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
          '- Search the repository for any pre-existing form, template, checklist, or process document that already covers one or more of the ten canonical forms below, and read each one completely before proposing anything.',
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
      'This project is adopting ten canonical operational forms. They are not ten linear handoffs: the Active Workbench is private scratch state and the Invalid Brief Return is an alternate pre-execution exit. Preserve the purpose, writer/reader boundary, required fields, and conditional rules of every form:',
      FORM_DEFINITIONS,
      ROLE_NAMES_NOTE,
      FRESH_REVIEWER_NOTE,
      formsSourceInstruction(answers.formsSource),
      ceremonyLevelInstruction(answers.ceremonyLevel, riskLabel),
      `Place the drafted forms/templates at ${location ? `"${location}"` : 'a location you propose and confirm with the human — do not guess silently and scatter them'}, somewhere this project's agents can find and reuse them, and include a short index mapping all ten canonical forms to the document or section that implements each one.`,
      NO_NEW_AUTHORITY_LINE,
    ].filter(Boolean).join('\n\n');

    const constraints = [
      NO_NEW_AUTHORITY_LINE,
      'Do not rewrite the rulebook or any role contract in this stage. If drafting or streamlining a form surfaces a real conflict with either, report the conflict — do not silently resolve it by editing governance material you were not asked to touch.',
      'Do not silently overwrite any form or template that already exists in this project; read it first and state explicitly what you are revising and why.',
    ].join('\n');

    const deliverables = [
      'All ten canonical forms represented as actual documents or templates inside the project — either as ten separate artifacts, or as the specific streamlined document set above — each preserving its writer/reader or private-state boundary, required fields, conditional gates, and fill order.',
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
      'Do not assume this project already represents these ten forms anywhere, even informally, without checking directly.',
      'Do not assume a merge is safe just because it saves paperwork; check it against the dangerous-merge list above before combining any two forms.',
      'Do not assume a software-shaped Git mechanism applies just because the project has a repository — a repository that only stores planning notes about a physical or offline artifact still needs a declared equivalent, not an assumed one.',
      NO_NEW_AUTHORITY_LINE,
    ].join('\n');

    const stopConditions = 'Stop and return to the human, rather than guessing, if: the rulebook or role contracts this stage depends on are missing, ambiguous, or contradictory about who fills which role; you cannot tell, for a specific merge, whether it would blur an authority boundary; this project\'s actual deliverable type is genuinely unclear (neither obviously a versioned codebase nor obviously something else); or you find yourself about to let one role\'s report stand in for another role\'s independent check.';

    const approvalBoundary = 'Everything you draft in this stage is a proposal until the human Owner reviews and explicitly ratifies it. Do not treat any form as already in force, do not use a drafted form to justify skipping a real handoff on live work, and do not delete or overwrite an existing form template without the human\'s explicit confirmation in this conversation.';

    const terminalReturn = [
      '"Done" for this stage means: every canonical form above is represented by an actual artifact or template — separately or in the agreed streamlined document set — with all required fields and boundary rules; the set has a named location and index; and every merge or adaptation states which authority boundary survived and how.',
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

        const stageObjective = 'Check every existing form in this project against the exhaustive canonical required-content list below, and report exactly which fields, conditional gates, or fill-order rules are missing, vague, or were silently dropped — not a general impression of quality, a field-by-field check.';

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
              '- For each of the ten canonical forms named below, confirm whether a corresponding document or mapped section exists before checking its fields.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-read every existing form\'s current, saved content directly, not from memory of drafting it earlier in this conversation.',
              '- Re-read the rulebook and role contracts to confirm the roles and boundaries you are checking against have not changed.',
              '- Confirm the specific form the human suspects, if any, still reflects its current saved wording rather than an earlier draft.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'For each of the ten canonical forms below, locate the corresponding document in this project (or note plainly that none exists), then check whether every required field and conditional rule named in its definition is actually present, specific, and complete rather than vague or silently omitted:',
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

        const deliverables = 'A field-by-field gap report: for each of the ten canonical forms, whether it exists, and every required field, conditional gate, or fill-order rule that is missing or too vague to check, each tied to the authority boundary it protects, with a minimal proposed fix labeled PROPOSED, NOT YET RATIFIED. If a genuine check turns up no gaps, say so honestly.';

        const qualityGates = [
          'The audit covers all ten canonical forms, not only the one the human suspects.',
          'Every reported gap cites the exact required field from the canonical definition above and the specific authority boundary it protects — not a vague sense that a form "could be clearer."',
          'Every proposed fix is minimal and does not restructure a form beyond what is needed to close the specific gap found.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume a field is fine because the rest of the form looks complete — check each required field independently.',
          'Do not assume a missing field is intentional streamlining without checking it against the project\'s actual chosen ceremony level and the dangerous-merge guidance above.',
          'Do not assume the drafting agent\'s original choices were careless just because you found something to flag.',
        ].join('\n');

        const stopConditions = 'Stop and report immediately, rather than continuing a full sweep silently, if a gap you find touches a field that protects a critical boundary — for example a Builder Assignment that turns out to pre-answer the independent acceptance oracle rather than only naming the piece\'s own criteria, or a Critic Verdict missing its independent-identity check. Flag that specific finding on its own before finishing the rest of the audit.';

        const approvalBoundary = 'This audit and its proposed fixes are recommendations until the human Owner reviews and explicitly ratifies any change. Do not apply a fix as if it were already in force, and do not treat an incomplete form as usable in the meantime.';

        const terminalReturn = [
          '"Done" for this recovery means: every canonical form was checked for existence and for every required field, conditional gate, and fill-order rule named in its definition; every gap is tied to the authority boundary it protects and a minimal proposed fix; and any urgent finding was flagged on its own.',
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

        const stageObjective = 'Find the specific merged document where streamlining blurred an authority boundary between canonical forms, and re-separate only the affected material.';

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
              '- Look for concrete evidence that the blurred boundary has already caused, or could plausibly cause, a specific role to act outside its authority — for example a document where a Builder\'s assignment and the independent acceptance oracle a Critic is supposed to derive appear in the same section a Builder would read. If the human\'s free text names a specific instance, verify it against the actual current document rather than taking the account at face value.',
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
          'Identify which canonical forms got entangled in that document, and explain concretely why the combination is unsafe rather than merely unusual:',
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
    purpose: 'Forms are what make a role boundary something an agent can actually be held to, rather than a sentence in a contract everyone means to follow. A role contract says a Builder never grades its own work; a form is the concrete artifact that makes that true in practice, by keeping the independent acceptance oracle out of the document the Builder reads — the Builder gets its piece\'s own criteria, and a separate fresh Critic derives the judging oracle from the ratified bar. This stage exists to turn the six role contracts from the previous stage into ten real handoff points, each with its own artifact, so "zero trust" is enforced by what documents exist and who can see them, not only by good intentions.',
    problemPrevented: 'Without concrete forms, role separation degrades into a shared conversation where everyone can see everything — a Builder happens to see the acceptance checklist because it was in the same chat, an Engineering Lead\'s private scratch notes get treated as evidence because nobody drew a line around them, a "verdict" turns out to have been written by the same context that built the thing it is judging. None of these look like a violation in the moment; each is just convenient. A named, separate document for each handoff is what makes a later reviewer able to ask "where is the Critic Verdict, and did the Critic that wrote it actually see the Builder\'s private reasoning" and get a checkable answer.',
    judgmentVsInvestigation: 'Which of the three adoption paths fits this project, where the forms should live, and how much ceremony this project\'s size actually justifies are all judgment calls only the human can make — no amount of repository investigation reveals whether a human wants ten separate documents or a leaner combined set, though the delegate option lets the human hand the sizing judgment to the agent\'s investigation when they are genuinely unsure. Everything about whether this project is actually a versioned codebase, whether forms or equivalents already exist, and what the current rulebook and role contracts actually say is investigation the agent must do directly — this stage never asks the human to describe their own repository\'s structure from memory.',
    promptAnatomy: 'This stage\'s generated prompt inlines an exhaustive required-field and conditional-rule checklist for all ten forms because the receiving agent may have no access to this repository. It distinguishes canonical forms from linear handoffs, and distinguishes safe document colocation from a merge that erases independent review.',
    authorityBoundary: 'The agent producing these forms holds no authority over the roles that will use them — it is drafting artifacts for the human Owner to ratify, the same way the roles stage\'s agent drafts contracts rather than appointing itself to a role. Once ratified, the forms themselves become part of the project\'s protected process material: no later executing agent, in any role, may skip a required field, merge two handoffs unsafely, or treat its own private workbench as evidence just because a future checkpoint would move faster that way. A genuinely needed change to the form set is a stop condition that returns to the Owner, never a silent self-edit made mid-task.',
    inputsAndSources: 'Inputs are the three structured answers (adoption path, forms location, ceremony level), the free-text field, and — critically — the project\'s own ratified rulebook and role contracts, which the agent must read directly from the repository rather than accept as summarized in this prompt. Cross-stage recall pulls in the risk tolerance recorded during Orientation and the role set recorded during Roles & Agent Configuration, so the ceremony-level judgment is informed by decisions the human already made rather than asked cold. No file, path, or document from outside the human\'s own project is ever a valid source for this stage.',
    outputsAndEvidence: 'The expected output is one document or template per surviving handoff (ten if kept distinct, fewer if streamlined), placed at a findable location with an index mapping each one to its handoff, with evidence being the forms\' own text: a fresh reader should be able to check a specific past action against a specific form\'s writer/reader/required-content and get an unambiguous answer about whether it was in bounds.',
    failureModes: [
      'Treating the ten forms as ten sections of one long document nobody actually consults per-handoff, which recreates the "everyone sees everything" problem this stage exists to prevent even though ten headings technically exist.',
      'Streamlining by combining the Builder Assignment with the Critic Assignment or Verdict, so the Builder ends up able to read the independent acceptance oracle — and can shape its work to pass that exact test instead of building the piece the criteria describe.',
      'Letting the Engineering Lead\'s Consolidated Return Packet absorb the Critic Verdict\'s independent judgment instead of citing it, so the "verdict" quietly becomes the Lead\'s own characterization of the Critic\'s work rather than the Critic\'s own words.',
      'Collapsing the Landing/Disposition form\'s two phases into one step that pre-fills a recommended disposition before the human has actually decided, which nudges the read-only inspection into looking like a foregone conclusion.',
      'Assuming a Git-based candidate-identity mechanism applies to a non-software deliverable without checking, leaving the Checkpoint Brief\'s evidence-and-identity field referring to a mechanism that does not actually exist for this project.',
    ],
    weakResultSigns: [
      'A form describes what a role usually does, but has no explicit list of what content is required before the handoff counts as complete.',
      'Two forms both seem to let the same role supply the "verdict" on the same piece of work.',
      'The location the forms live at was never confirmed with the human, or is scattered across several different, undocumented places.',
      'A merged document exists, but nothing in it says which canonical forms it implements or why the combination preserves their boundaries.',
    ],
    customization: 'For a genuinely tiny solo project, resist collapsing all ten forms into a single freeform notes file just because it feels like overkill — thin the language and formatting inside each form instead (a short paragraph instead of a formal template) while keeping the handoffs themselves distinct, especially the ones the dangerous-merge guidance calls out. For a project with several people or several concurrent workstreams, consider whether the Builder Assignment needs to become several differently-scoped assignment templates rather than one generic template everyone fills in loosely.',
    whenToStop: 'Pause before ratifying if you cannot point to which specific document a future Critic should read to derive the acceptance oracle for a piece of work, and which different document holds the verdict on whether it was met — if the oracle lives anywhere a Builder would read while still working, the set is not done yet, however complete it looks. Also pause if a merged document exists with no explanation of which original handoffs it combines; that omission makes the merge unauditable even if it happens to be safe.',
    auditWithoutPasting: 'You do not need to paste the form templates back into this website to sanity-check them. Instead, ask your agent, in its own conversation, a concrete hypothetical for each handoff you are unsure about — for example, "if the Builder working on this piece opened the document meant for the Critic, what would it see?" — and have it answer from the actual files, not from memory. If the answer is the independent acceptance oracle, or a pre-answered expected result the Critic was supposed to derive for itself, that specific form needs another pass regardless of how tidy the rest of the set looks.',
    weakVsStrongExample: {
      weak: 'One shared "handoff notes" document where the Builder writes what it did, and further down the same page, the Critic writes whether it passed. Nothing stops the Builder from reading the Critic\'s section before finishing, and nothing marks which parts are which role\'s words.',
      strong: 'A Builder Assignment naming exactly one piece of work, its observable goal, its concrete criteria with citations, and its exact ownership boundary — and explicitly not pre-answering the oracle that will judge it; a separate Critic Verdict, written after the fact by a fresh reviewer who never saw the Builder\'s private notes and who derived that oracle independently from the ratified bar, stating pass, fail, or blocked with evidence and exactly one largest remaining gap — two documents, two authors, two audiences, each independently checkable.',
    },
  },
};
