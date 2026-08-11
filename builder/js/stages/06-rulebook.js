import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const DESTRUCTIVE_OPTIONS = [
  { value: 'no-main-push', label: 'Never push or merge to the main or production branch without my explicit review.' },
  { value: 'no-delete', label: 'Never delete branches or data without my sign-off.' },
  { value: 'no-credentials', label: 'Never touch production credentials or secrets.' },
  { value: 'no-publish', label: 'Never publish or deploy without my explicit approval.' },
];
const OTHER_VALUE = 'other';

const DESTRUCTIVE_HELP = 'These are firm limits you set as the human Owner, not requests — no agent may treat any of them as negotiable, no matter how confident it is that an exception is justified in the moment. The method already refuses to let any agent modify its own governing rules or grant itself authority merely because a task would benefit from it; these boundaries extend that same protection to the real destructive actions this project can take, which a generic method template cannot know about in advance.';
const ESCALATION_HELP = 'Under this method, an agent stopping to ask a question — or reporting that it is blocked — is a correct, honest outcome, never a failure to route around. This answer only tunes how small a doubt has to be before the agent brings it to you; it does not remove the agent\'s ability to ask about something genuinely large no matter which option you pick.';
const GOVERNANCE_HELP = 'Only you, as this project\'s human Owner, may ratify a change to a governing rule. Either option below keeps that true — an agent proposing exact replacement wording is still only a proposal, never a self-executing change. This answer only decides who drafts the first version of new wording; you decide who signs it, either way.';

function selectedDestructiveBoundaries(answers) {
  const selected = Array.isArray(answers.destructivePolicy) ? answers.destructivePolicy : [];
  return {
    checked: DESTRUCTIVE_OPTIONS.filter((o) => selected.includes(o.value)).map((o) => o.label),
    hasOther: selected.includes(OTHER_VALUE),
  };
}

function destructiveSection(answers, freeText) {
  const { checked, hasOther } = selectedDestructiveBoundaries(answers);
  const list = checked.length
    ? checked.map((l) => `- ${l}`).join('\n')
    : '- (No boundary above was checked — treat this as unusual. Stop and confirm with the human before assuming no destructive-action limits apply to this project.)';
  let otherNote = '';
  if (hasOther) {
    otherNote = (freeText || '').trim()
      ? `The human also marked "Other" and described an additional boundary in their own words. Treat it as a firm boundary carrying the same weight as the ones above, not as background color:\n\n${quoteHumanInput('Additional destructive-action boundary (human free text)', freeText)}`
      : 'The human marked "Other" but left the description empty. Stop and ask what that additional boundary is before assuming none exists — do not silently drop it.';
  }
  const plainSummary = checked.length ? checked.join('\n') : 'None of the listed boundaries were checked.';
  return { list, otherNote, plainSummary };
}

function escalationLabel(value) {
  return {
    any: 'Escalate on any ambiguity, however small.',
    material: 'Escalate only on destructive, scope-changing, or bar-changing ambiguity.',
  }[value] || 'Not yet specified.';
}

function governanceLabel(value) {
  if (value === DELEGATE_VALUE) return 'Not sure yet — asked the agent to investigate how this project has actually handled rule disputes so far and propose a routing process with tradeoffs.';
  return {
    'human-routes': 'Always route a needed rule change back to me explicitly.',
    'agent-proposes': 'Let the agent propose exact replacement language for my sign-off.',
  }[value] || 'Not yet specified.';
}

function governanceInstruction(value) {
  if (value === DELEGATE_VALUE) {
    return 'The human has not yet decided how a needed governance-rule change should be routed. Investigate how this project has actually handled disagreements or rule changes so far — a contributing guide, a decision log, prior discussion visible in the project\'s own history, or the plain absence of any precedent — and propose two or three concrete routing options with real tradeoffs (for example: always flag the problem and wait, versus draft exact replacement language and wait). Recommend one if you have a reasoned preference, but present it as a recommendation for the human to choose, not a decision you have already made for them. Regardless of which the human eventually picks, state plainly in the drafted Rulebook that only the human ratifies a change to it — no proposal, however well drafted, is self-executing.';
  }
  if (value === 'agent-proposes') {
    return 'When you, or a future agent working under this Rulebook, believe a governance rule needs to change, draft the exact replacement language and present it to the human for sign-off — do not stop at only describing the problem. Label any such proposal clearly as PROPOSED — NOT YET RATIFIED, and do not act as though it is already in force, even if you are confident it is correct.';
  }
  return 'When you, or a future agent working under this Rulebook, believe a governance rule needs to change, stop and route the problem back to the human explicitly, in plain language, without drafting replacement wording yourself unless they later ask you to. Describe what is wrong with the current rule and why, then wait.';
}

function escalationInstruction(value) {
  if (value === 'material') {
    return 'Stop and return to the human only when an ambiguity you encounter is destructive (touches one of the boundaries above, or any other irreversible action), scope-changing (would expand or shrink what a role may do), or bar-changing (would alter what counts as done or acceptable). For smaller wording, formatting, or organizational choices, use your own judgment, write down the choice you made and why in your return, and let the human correct it on review rather than pausing on every small decision.';
  }
  return 'Stop and ask the human about any ambiguity you notice, however small — an unclear boundary, an undefined term, a role whose scope you are guessing at. The human would rather be asked too often here than have an agent silently guess at the limits of its own authority.';
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'rulebook',
  number: 6,
  title: 'Governance & Rulebook',
  purpose: 'Adapt the generic Zero-Trust Hierarchy rulebook into a project-specific one: authority boundaries, what agents may and may not do, destructive-action rules, and how conflicts resolve.',
  agentProduces: 'A project-specific Rulebook adapting the method\'s authority boundaries, precedence rules, and terminal-state vocabulary — naming exactly what each role may inspect, modify, validate, commit, publish, stop, or escalate for this project.',
  prerequisites: ['source-of-truth'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The precedence order reproduced below — Owner-ratified governance first, then the durable record of what has actually been decided, then the specific plan section, then the acting role\'s own contract, then supporting forms, then verified actual state — is the precedence chain required by RULEBOOK.md §3, "Authority precedence and ratification"; "a newer-looking or longer file is not automatically authoritative — only ratification confers authority" is reproduced near-verbatim from that section.',
      'The governance-locked set (root rulebook, ratified scope, governance record, role or agent configuration) not being modifiable by any agent merely because a piece of work would benefit — with a genuinely needed change instead returning to the Owner for a narrow, one-use decision — is RULEBOOK.md §3, which names the governance-locked set explicitly.',
      'That no agent may weaken the bar it is being judged against, enlarge its own scope or ceiling, or grant itself authority it was not given — and that a bar changes only through a fresh Owner ratification, never through an agent\'s own confidence — is RULEBOOK.md §2 — the Tier 2 prohibitions state outright that the Lead "MUST NOT weaken the bar, enlarge its own ceiling, accept informal scope expansion, self-certify technical closure" — read together with §4 on how a document becomes an acceptance bar.',
      'The five terminal outcomes an agent may report (met the bar; blocked and needs a human action; no further progress under the current approach; time or budget ran out without weakening the bar; the assignment itself was invalid) and the rule that none of them, alone, authorizes starting the next piece of work — that always takes a new explicit human decision — are RULEBOOK.md §12, "Terminal outcomes, silence, and abandonment," with the pre-execution invalid case in §5 and templates/10-brief-invalid-return.md, and article.md §11 for the rule that "Neither PASS nor landing starts the next unit."',
      'The proportionality guardrail follows the NOT_FIT / FIT_WITH_REDUCED_PROFILE choices in article.md §14: ceremony and document weight may shrink when the controlled risk is small, but the authority functions do not silently disappear. Builder and Critic remain separate contexts, the Integration Critic remains fresh, and the Orchestrator never becomes the technical reviewer.',
    ],
    adapted: [],
    productDesign: [
      'Splitting "destructive-action boundaries," "escalation threshold," and "governance-change process" into three separate structured questions is this guide\'s own decomposition — the source method expresses these as properties baked into a checkpoint brief and the governance-locked set, not as a standalone intake form a human fills out on its own.',
      'The two-position escalation-threshold dial (any ambiguity versus only material ambiguity) is this guide\'s own calibration control. The source method always allows a stop-and-return, but does not offer a tunable strictness setting for how eagerly to use it — that dial, and its explicit invitation to let smaller decisions go through on the agent\'s own judgment, is this guide\'s addition.',
    ],
  },
  questions: [
    {
      id: 'destructivePolicy',
      type: 'checkbox',
      label: 'Which destructive-action boundaries are non-negotiable for this project?',
      help: DESTRUCTIVE_HELP,
      required: true,
      affectsPrompt: 'Each boundary you check is reproduced as a named, non-negotiable prohibition directly in the drafted Rulebook\'s task, constraints, and quality-gate layers — nothing here is left as a paraphrase an agent under pressure could later read as optional. Checking "Other" pulls the free-text field in as an additional boundary carrying the same weight.',
      options: [
        ...DESTRUCTIVE_OPTIONS,
        { value: OTHER_VALUE, label: 'Other', description: 'Describe the boundary in your own words in the free-text field below.' },
      ],
    },
    {
      id: 'escalationThreshold',
      type: 'radio',
      label: 'How eagerly should an agent working under this Rulebook come back to you with a question?',
      help: ESCALATION_HELP,
      required: true,
      affectsPrompt: 'Directly rewrites the stopConditions layer of the generated prompt — "any ambiguity" produces a low-tolerance stop instruction; "material only" narrows stops to destructive, scope-changing, or bar-changing ambiguity and tells the agent to use its own judgment on the rest, noting its reasoning for later review.',
      options: [
        { value: 'any', label: 'Escalate on any ambiguity, however small', description: 'You would rather be asked too often than have an agent quietly guess at the limits of its own authority.' },
        { value: 'material', label: 'Escalate only on destructive, scope-changing, or bar-changing ambiguity', description: 'Smaller wording or organizational choices are fine for the agent to decide and flag for your review later.' },
      ],
    },
    {
      id: 'governanceChangeProcess',
      type: 'radio',
      label: 'When an agent believes a governance rule itself needs to change, how should it proceed?',
      help: GOVERNANCE_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Sets whether the task layer instructs the agent to only flag a needed rule change and wait, or to also draft exact replacement language for your sign-off. Delegating instead asks the agent to investigate how this project has actually handled rule disputes so far and propose a routing process with tradeoffs, rather than assuming one on your behalf.',
      options: [
        { value: 'human-routes', label: 'Always route a needed rule change back to me explicitly', description: 'The agent flags the problem and stops there — you decide how to word the fix.' },
        { value: 'agent-proposes', label: 'Let the agent propose exact replacement language for my sign-off', description: 'The agent drafts the specific new wording and waits for you to approve, edit, or reject it.' },
      ],
    },
  ],
  freeTextLabel: 'Anything else the agent should understand — including the specifics of any "Other" destructive-action boundary you checked above, or anything the structured questions here didn\'t capture.',
  completionGate: [
    { id: 'inspected', label: 'The agent inspected this project\'s actual branches, deployment setup, and any existing governance documents, rather than relying on my summary of them.', kind: 'confirm', required: true },
    { id: 'artifact-created', label: 'An initial/unratified Rulebook draft was created or revised. If a ratified Rulebook already existed, it stayed untouched until I reviewed the exact amendment, narrowly authorized that edit, and verified the authorized text was applied.', kind: 'confirm', required: true },
    { id: 'evidence-reported', label: 'The agent reported its evidence — what it found by investigation versus what came from my answers — plus any unresolved conflicts or boundary cases it could not resolve on its own.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I reviewed the resulting Rulebook or exact amendment myself and explicitly ratify that specific text.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the Rulebook document (optional)', kind: 'text' },
  ],
  buildLayers(answers, freeText, ctx) {
    const orientationAnswers = (ctx.allAnswers && ctx.allAnswers.orientation) || {};
    const riskLabel = { low: 'low stakes', medium: 'medium stakes', high: 'high stakes' }[orientationAnswers.riskTolerance] || '';
    const { checked: checkedBoundaries } = selectedDestructiveBoundaries(answers);
    const { list: boundaryList, otherNote } = destructiveSection(answers, freeText);
    const escLabel = escalationLabel(answers.escalationThreshold);
    const govLabel = governanceLabel(answers.governanceChangeProcess);

    const roleAndAuthority = [
      `You are drafting the initial Rulebook, or proposing a narrowly bounded amendment to an existing one, for ${ctx.projectName} — the governing document that fixes authority boundaries, the conflict-resolution order, and the terminal-outcome vocabulary for every agent that works on this project from here on, including future instances of you.`,
      'You do not ratify this document. Only the human, acting as this project\'s Architect/Owner, can ratify a Rulebook or any amendment to it — including changes you yourself draft. Until they explicitly ratify it, everything you produce in this stage is a labeled draft, not a binding rule.',
      'Before touching any existing governance file, establish whether it is an unratified draft or an Owner-ratified locked document. You may create an initial draft or revise an unratified draft. You may not edit a ratified Rulebook unless the human has explicitly and narrowly authorized the exact amendment in this conversation; otherwise stop and return a proposed amendment with the exact file and replacement text.',
      'This document, once ratified, becomes authoritative over your own future actions too. Treat drafting it as an act of self-restraint, not self-permission: do not write anything into it that quietly expands what you, or any agent, may do without the human\'s sign-off.',
    ].join('\n');

    const stageObjective = `Produce a single project-specific Rulebook DRAFT for ${ctx.projectName}, or — when a Rulebook is already ratified — audit it and return a narrowly scoped amendment proposal without changing the locked file unless the human explicitly authorizes that exact edit.`;

    const humanIntent = [
      quoteHumanInput('Non-negotiable destructive-action boundaries', checkedBoundaries.length ? checkedBoundaries.join('\n') : 'None of the listed boundaries were checked.'),
      quoteHumanInput('Escalation threshold', escLabel),
      quoteHumanInput('Governance-change process', govLabel),
      riskLabel ? quoteHumanInput('Risk tolerance recorded earlier in this process', riskLabel) : '',
      quoteHumanInput('Anything else the human wants understood', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = ctx.mode === 'fresh'
      ? [
        'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.',
        'You have no memory of this project from any earlier stage of this process. Treat everything about its current state, including whether a Rulebook already exists, as unverified until you investigate it yourself.',
      ].join('\n')
      : [
        'You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn.',
        'Continuity of conversation is not continuity of authority to skip verification. Re-confirm the branch structure, deployment setup, and any existing governance document are still what you believe them to be before drafting or revising the Rulebook — per this project\'s own precedence rules below, verified actual state always overrides a prior turn\'s narrative, including your own.',
      ].join('\n');

    const investigation = ctx.mode === 'fresh'
      ? [
        'You are starting from zero on this project. Before drafting anything, investigate directly rather than inferring from the project\'s stated purpose:',
        '- Locate and fully read any existing governance, contributing, or rulebook-style document already in the project; do not assume none exists just because none was mentioned to you.',
        '- Identify the actual main or production branch name(s), deployment targets, and any release automation already configured — read the actual configuration files, do not guess from convention.',
        '- Identify what, if anything, currently enforces the destructive-action boundaries below in the project\'s own tooling (branch protection, required review, restricted environment secrets) versus what is currently unenforced and would rely purely on this document and on agents choosing to follow it.',
        '- Identify how the six method functions are mapped onto people, tools, and fresh contexts, and any prior plans, decisions, or source-of-truth documents already established that this Rulebook must stay consistent with rather than silently override.',
        '- Find explicit evidence of whether every existing governance document is still a draft or has been ratified by the Owner. Absence of evidence is not permission to edit it; report the ambiguity and stop.',
        'Report plainly what you found and what you could not find before proposing any Rulebook language.',
      ].join('\n')
      : [
        'Even with context from this conversation, re-verify before drafting or revising the Rulebook — actual current state always overrides what an earlier turn, even your own, claimed was true. At minimum, re-confirm:',
        '- The current branch and environment structure, and what actually counts as the main or production branch here.',
        '- Whether any deployment, credential, or publish mechanism has changed since you last looked at it.',
        '- Whether a Rulebook or equivalent governance document already exists, exactly what it currently says, and whether there is explicit evidence it is ratified or still a draft.',
        'Do not re-derive anything you already correctly established earlier in this conversation — only re-verify and update what might have changed, and say which is which in your return.',
      ].join('\n');

    const precedence = [
      'This stage assumes the project\'s source of truth for its own documents was already established in an earlier step of this process — do not relitigate which document format or location is authoritative here. This layer adds the method\'s own conflict-resolution order on top of that, for when documents or claims about this project disagree. Resolve conflicts in this fixed order, highest first:',
      '1. This project\'s Owner-ratified governance documents — the Rulebook you are drafting, once ratified, and any ratified amendment to it. An unratified draft never outranks a ratified document, no matter how recent.',
      '2. The current, durable record of what has actually been decided so far (a decision log, roadmap, or project-state document naming the current approved scope) — a newer-looking or longer file is not automatically more authoritative than this record; only ratification confers authority.',
      '3. The exact section of the current plan or roadmap defining the specific piece of work in front of an agent.',
      '4. The written responsibilities of whichever role is acting (Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic) for the task at hand.',
      '5. Any supporting forms, checklists, or static planning documents.',
      '6. Verified actual state of the project itself — the real code, branches, data, and environment as they exist right now. Verified actual state always overrides any prior narrative, expectation, or claim about what state the project "should" be in, including claims made earlier in this same conversation.',
      'No document or claim is authoritative merely because it is newer, longer, or asserted with confidence. Only Owner ratification, and verified reality, carry real weight.',
    ].join('\n');

    const task = [
      'Draft, or revise, this project\'s Rulebook as a single artifact inside the project (for example a top-level governance document). Cover at minimum:',
      '',
      '1. Authority functions and context mapping. The method defines six roles/functions arranged across four authority tiers, and no autonomous tier beyond them: Architect/Owner (Tier 0); Orchestrator (Tier 1); Engineering Lead (Tier 2); Builder, Component Critic, and Integration Critic (Tier 3). Name how each function is supplied here — by which human, tool, or rotating agent context — without deleting a function. One person or AI product may rotate through several hats, but incompatible functions still require separate contexts: a Builder never becomes its own Critic, the Integration Critic is fresh from the Component Critics and Lead, and the Orchestrator never becomes a second technical reviewer.'
        + (riskLabel ? ` The human previously described this project\'s overall risk tolerance as ${riskLabel}. Use that to calibrate checkpoint size, document weight, review multiplicity, and whether the method is FIT, FIT_WITH_REDUCED_PROFILE, or NOT_FIT — never to erase those core authority seams.` : ''),
      '2. For each role that does exist here, state plainly what it may inspect, modify, validate, commit, publish, stop, or escalate — and, just as important, what it explicitly may not do. At minimum, every draft must state: no agent may weaken the acceptance bar it is being judged against; no agent may enlarge its own scope or ceiling; no agent may publish or land its own work; and no agent may modify this Rulebook itself or grant itself authority beyond what is written here — any of that requires the human Owner\'s explicit ratification, every time, with no exceptions carved out for urgency or confidence.',
      '3. The destructive-action boundaries the human has already set. Reproduce them as explicit, named prohibitions in the drafted document — not paraphrased into something softer, and not merged into a single vaguer sentence:',
      boundaryList,
      otherNote,
      '4. The conflict-resolution and precedence order given to you above, adapted to name this project\'s actual documents and paths (for example the specific roadmap file this project uses), not a generic placeholder standing in for one.',
      `5. The escalation instruction: ${escalationInstruction(answers.escalationThreshold)}`,
      `6. The governance-change process: ${governanceInstruction(answers.governanceChangeProcess)}`,
      '7. A short section naming the terminal outcomes an agent may report on a piece of work, and what each means: the work meets the bar it was judged against; the work is blocked and needs a human action (a decision, a credential, a rule change, or a genuine conflict between the plan and reality); no further progress is being made under the current approach; the time or budget allotted ran out without weakening the bar; or the assignment itself was invalid or contradictory and nothing should be attempted until it is corrected. State plainly that reaching any one of these is a valid, honest report — never a failure to hide — and that none of them, by itself, authorizes starting the next piece of work; that always requires a new, explicit decision from the human.',
      '',
      'Where the source structure does not fit this project cleanly, adapt ceremony rather than authority: a one-person project may use one tool rotating through explicitly separate contexts and lighter documents, but it may not let the same context build and judge its own work. If even that separation costs more than the risk justifies, return NOT_FIT instead of publishing a weakened imitation of the method.',
    ].filter(Boolean).join('\n');

    const constraints = [
      'Do not weaken, remove, or reinterpret any destructive-action boundary listed above. If one seems to conflict with how the project already operates (for example, a branch that is meant to be protected currently accepts direct pushes), report the conflict plainly — do not resolve it by quietly loosening the boundary in the document.',
      'Do not invent a role beyond the six named above, and do not rename one of them into something that sounds more elaborate.',
      'Do not describe any isolation mechanism this Rulebook references — a fresh conversation, a separate worktree, a sandboxed environment — as a cryptographic or operating-system-level security boundary. Call it what it is: a cooperative procedural control that depends on every agent actually following it, not an absolute technical guarantee.',
      'Also obey every boundary listed above yourself, right now, while performing this drafting task: do not push, merge, delete, touch credentials, publish, or deploy while drafting or revising the Rulebook, regardless of what you conclude belongs in the document\'s content.',
      'Do not assume this project already has a name, precedent, or governance history beyond what you find by direct investigation or what the human told you above.',
      'Do not edit an existing ratified Rulebook or role/configuration file without explicit, narrow Owner authorization naming the exact file and exact change. A request to "create the Rulebook" is not blanket permission to rewrite locked governance.',
    ].join('\n');

    const deliverables = 'If no ratified Rulebook exists: one project-specific Rulebook DRAFT inside the project, covering every item above. If an unratified draft exists: a deliberate revision of that draft, with the changes listed. If a ratified Rulebook exists and the human did not narrowly authorize an exact amendment: leave it byte-for-byte untouched and return a proposed amendment naming the exact file, exact replacement text, reason, and the Owner authorization required before application.';

    const qualityGates = [
      'Before returning, verify: all six functions across four tiers are represented; every incompatible pair remains context-separated even where one tool rotates through roles; every destructive-action boundary appears as an explicit prohibition; the precedence order names real project documents; and any ratified governance file remained untouched absent exact Owner authorization.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume a destructive-action boundary the human did not check is implicitly fine to skip — an unchecked boundary simply was not asked about here, it was not declared safe.',
      'Do not assume prior conversations, commit messages, or code comments constitute ratification of anything — only the human\'s explicit sign-off, given through their own review process, ratifies a rule or a change to one.',
      'Do not assume the absence of an existing governance document means none is wanted, or that this is the first time the project has thought about these questions — investigate before concluding either way.',
    ].join('\n');

    const stopConditions = [
      escalationInstruction(answers.escalationThreshold),
      'Regardless of that threshold, stop immediately, in all cases, if you cannot determine who currently has authority over an existing document or decision (for example, a governance file already in the project with no clear author or ratification history). Do not guess an owner for it; report the ambiguity and wait.',
    ].join('\n');

    const approvalBoundary = 'You may create or revise an unratified Rulebook draft. A ratified Rulebook is locked: without explicit Owner authorization naming the exact file and exact amendment, you may only return proposed replacement text and must not apply it. No draft or proposal becomes binding until the human ratifies it, and no destructive action is authorized in this stage.';

    const terminalReturn = [
      'Report back with: the path to the Rulebook document you created or revised; a plain list of what changed if a document already existed; every boundary, precedence rule, and escalation or governance-change instruction you included, each marked as coming from direct investigation versus from the human\'s answers above; any assumption you had to make and flagged rather than silently resolved; and any unresolved conflict, including any point where you could not establish who has authority over an existing document or decision.',
      '"Done" here means: the document exists at a named path; every section in the task above is present with concrete, non-templated language naming this project\'s own roles, branches, and documents; and you have listed every place your draft still needs the human\'s explicit ratification before it is binding. If you could not complete a section because authority or source of truth could not be established, say so plainly and stop rather than guessing.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'audit-governance-gap',
      label: 'Audit for a governance gap the rulebook does not cover',
      description: 'Use this after a Rulebook already exists for this project, when you suspect a real situation is not clearly covered — have the agent hunt systematically for the gap instead of you guessing where it might be.',
      buildLayers(answers, freeText, ctx) {
        const { list: boundaryList, otherNote, plainSummary } = destructiveSection(answers, freeText);
        const escLabel = escalationLabel(answers.escalationThreshold);
        const govLabel = governanceLabel(answers.governanceChangeProcess);

        const roleAndAuthority = `You are acting as a fresh, independent reviewer of ${ctx.projectName}'s existing Rulebook — not the agent that drafted it, and not bound by any assumption it made. You hold no authority to change the Rulebook yourself; you may only find and report gaps in it.`;

        const stageObjective = 'Systematically find every real situation this project could plausibly face that the current Rulebook does not clearly answer — not a hypothetical edge case pulled from nowhere, but something plausible given how this specific project actually operates. If you genuinely find none after a real search, say so honestly rather than manufacturing a gap to appear thorough.';

        const humanIntent = [
          quoteHumanInput('Non-negotiable destructive-action boundaries the Rulebook is supposed to encode', plainSummary),
          quoteHumanInput('Escalation threshold the Rulebook is supposed to encode', escLabel),
          quoteHumanInput('Governance-change process the Rulebook is supposed to encode', govLabel),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = ctx.mode === 'fresh'
          ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
          : 'You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn. Continuity of conversation does not exempt you from re-reading the actual current Rulebook document and actual current project state before auditing it — do not audit from memory of what you think it says.';

        const investigation = [
          'Read the current Rulebook document in full, start to finish. Separately, investigate the project\'s actual current branch structure, deployment mechanism, credential handling, and role assignments.',
          'Compare what you read against what you investigated, and against the human\'s stated boundaries and preferences above. For each of the six method roles (Architect/Owner, Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic), ask whether the document actually says what that role may and may not do here, or is silent on it.',
        ].join('\n');

        const precedence = 'Use the Rulebook\'s own stated precedence order as the frame for this audit: Owner-ratified governance, then the durable record of actual decisions, then the specific plan section, then the acting role\'s contract, then supporting forms, then verified actual state. If the precedence order itself does not resolve a scenario you construct, that is itself a gap worth reporting, not something to quietly resolve in the document\'s favor.';

        const task = [
          'For each of the following, ask: is there a plausible situation this project could face that the current Rulebook does not clearly resolve?',
          '1. The destructive-action boundaries and escalation and governance-change preferences quoted above — does the document actually encode all of them, unambiguously, or did something get softened or dropped in translation?',
          '2. Each of the six method roles — does the document say, for this project specifically, what that role may inspect, modify, validate, commit, publish, stop, or escalate, or does it stay generic enough that two different agents could read it two different ways?',
          '3. A conflict between two of the document\'s own sections, or between the document and the project\'s actual current state as you found it.',
          'List every gap you find as a concrete scenario ("if X happens, the current Rulebook does not say who decides Y") rather than an abstract critique. Do not silently patch a gap yourself by editing the Rulebook. You may propose exact replacement language for a gap only if the human\'s governance-change preference above says the agent may propose language — and even then, label it clearly as a proposal, not an amendment already in force.',
        ].join('\n');

        const constraints = 'Do not invent a new role to fill a gap. Do not rewrite sections of the Rulebook that already work correctly just because you are already editing the file. Do not report an ambiguity as a "gap" unless you can state a concrete scenario where two reasonable agents could genuinely act differently under the current wording.';

        const deliverables = 'A gap report: a list of concrete, plausible scenarios the current Rulebook does not clearly resolve, each naming which section is silent or ambiguous on it, and, only where the human\'s stated preference allows it, an optional proposed fix for each — clearly labeled PROPOSED, NOT RATIFIED. If no real gap exists, a short, honest statement to that effect instead.';

        const qualityGates = 'Every listed gap must be a specific, plausible scenario grounded in this project\'s actual setup, not a generic risk copied from a checklist. Every gap must cite the exact section of the Rulebook that is silent or ambiguous on it.';

        const prohibitedAssumptions = 'Do not assume the drafting agent\'s original choices were careless just because you found something to question. Do not assume every ambiguity is a real gap — only report ones where a genuine disagreement about authority or action would be possible between two reasonable agents.';

        const stopConditions = 'Stop and ask the human directly, rather than proposing your own fix, for any gap that touches one of the destructive-action boundaries themselves — those are the human\'s firm calls, not something an agent should draft an alternative for even as a labeled proposal.';

        const approvalBoundary = 'This report is informational. Producing it does not amend the Rulebook. The human decides whether, and how, to close each gap you find.';

        const terminalReturn = 'Report the full list of gaps found (or an honest "none found" if a genuine search turned up nothing), each with the scenario, the silent or ambiguous section, and any proposed language only where authorized above. State plainly if you could not determine authority over some part of the existing document, and stop rather than guessing at who owns it.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'boundary-case-return',
      label: 'Return to the human for a boundary case with no clear rule',
      description: 'Use this when an agent already working under this Rulebook hits a real situation that does not fit any written boundary — stop it there and produce a clean escalation packet for you instead of letting it guess.',
      buildLayers(answers, freeText, ctx) {
        const { list: boundaryList, otherNote, plainSummary } = destructiveSection(answers, freeText);
        const escLabel = escalationLabel(answers.escalationThreshold);
        const govLabel = governanceLabel(answers.governanceChangeProcess);

        const roleAndAuthority = `You are an agent currently doing work on ${ctx.projectName} under its ratified Rulebook. You have hit a situation the Rulebook does not clearly cover. You do not have authority to decide how to proceed on your own — only to describe the situation clearly and stop.`;

        const stageObjective = 'Produce one complete, honest escalation report for the specific boundary case you hit, and take no further action on it until the human responds.';

        const humanIntent = [
          quoteHumanInput('Non-negotiable destructive-action boundaries already in force', plainSummary),
          quoteHumanInput('Escalation threshold already in force', escLabel),
          quoteHumanInput('Governance-change process already in force', govLabel),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = ctx.mode === 'fresh'
          ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
          : 'Continue in the same agent conversation that hit this case. Continuing the conversation does not let you skip re-checking the actual current state relevant to the case below — verify it fresh rather than trusting an earlier assumption in this same conversation.';

        const investigation = 'Before writing the report, re-verify the actual current state relevant to this specific case — what would actually happen under each option you are considering, and which of those outcomes are reversible versus not. Do not escalate based on a stale guess about consequences; a wrong description of the stakes makes the human\'s decision worse, not easier.';

        const precedence = 'Check the case against the Rulebook\'s own precedence order first: Owner-ratified governance, then the durable record of actual decisions, then the specific plan section, then the acting role\'s contract, then supporting forms, then verified actual state. If applying that order still does not resolve the case, that fact itself is the boundary case — say so explicitly in your report rather than picking whichever reading is more convenient and presenting it as settled.';

        const task = [
          'Write the escalation report covering:',
          '1. Exactly what triggered this — the specific action or decision in front of you, described concretely, not abstractly.',
          '2. Which written boundary or rule looked like it might apply, and precisely why it does not clearly resolve this case.',
          '3. Two or more concrete options with real, differing tradeoffs — not one real option dressed up next to a straw option.',
          '4. Which option, if any, is safest to hold as a no-op while waiting for the human, and why.',
          '5. An explicit statement that no destructive or irreversible step has been, or will be, taken on this case until the human responds.',
          boundaryList ? `The destructive-action boundaries already in force are:\n${boundaryList}` : '',
          otherNote,
        ].filter(Boolean).join('\n\n');

        const constraints = 'Do not take the ambiguous action "to make progress" while waiting. Do not silently pick the option you guess the human would prefer and act on it, mentioning the choice only in passing afterward — the whole point of this recovery prompt is that the decision belongs to the human, made before any action, not reported after one.';

        const deliverables = 'The escalation report itself, plus an explicit confirmation that no irreversible action was taken on this specific case.';

        const qualityGates = 'The options presented are genuinely distinct with real tradeoffs stated for each. The report does not presuppose which option the human should pick, and does not bury the ask inside a longer status update.';

        const prohibitedAssumptions = 'Do not assume silence, an unrelated past approval, or "this is probably fine" covers this new case. Do not assume the most common existing pattern in the project is automatically what the human wants here — that is exactly the kind of guess this report exists to avoid.';

        const stopConditions = 'Stop completely on this specific piece of work the moment you recognize the case as ambiguous. Take no further action on it, destructive or otherwise, until the human responds with a decision.';

        const approvalBoundary = 'The human alone decides how to resolve this case. Your role ends at delivering a clear, honest report — you do not act on your own preference, and you do not treat a lack of immediate response as permission to proceed.';

        const terminalReturn = '"Done" here means: the report was delivered in full, covering all five items in the task above, and no irreversible action was taken on this case. If a reversible, exploratory step had already been taken before you recognized the ambiguity, disclose it plainly in the report rather than omitting it.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'A Rulebook is what keeps every later stage\'s prompts from silently drifting into "the agent decided this was fine." It is the one artifact in this journey whose entire job is to pre-commit authority boundaries before real work starts, so a fast-moving agent mid-task has a clear written answer instead of an incentive to resolve ambiguity in its own favor.',
    problemPrevented: 'Without a project-specific Rulebook, every later prompt has to re-litigate the same questions from scratch — can this agent push to the main branch, can it delete a branch, does a blocked report mean stop or does it mean keep trying a different way. A confident-sounding agent will answer those questions for itself, quietly, in whichever direction lets it keep making progress. A written, human-ratified Rulebook removes that incentive by fixing the answer in advance, independent of how any single conversation happens to be going.',
    judgmentVsInvestigation: 'Judgment belongs entirely to the human here: which actions are irreversible enough to be non-negotiable, how eagerly the agent should interrupt with questions, and who drafts the wording of a future rule change are preference and risk-tolerance calls no investigation can answer. Investigation belongs to the agent: what branches, deploy targets, and credentials exist; whether governance already exists; whether it is ratified and therefore locked; and how the six functions are mapped onto people, tools, and fresh contexts.',
    promptAnatomy: 'This stage\'s prompt puts unusual weight on precedence, lock status, and constraints because the Rulebook is what later prompts use when something conflicts. The task separates fixed authority seams from proportional ceremony: branch names and document weight should fit the project, but Builder/Critic separation, fresh Integration review, and bounded Orchestrator receipt do not disappear.',
    authorityBoundary: 'The agent drafting the Rulebook behaves like an Engineering Lead here: it may propose structure — which roles apply, how precedence should read — but it may not ratify its own proposal, may not treat a draft as binding, and, critically, may not write itself or any role more authority than the human explicitly granted. A Rulebook that lets its own drafter loosen its own constraints later is a contradiction in terms; audit specifically for that failure before treating this stage as complete.',
    inputsAndSources: 'Structured inputs are the three questions on this page plus the shared free-text field, which doubles as the description of any "Other" destructive boundary. Investigated inputs are the project\'s current branch, deployment, and credential setup, plus any pre-existing governance document and its ratification status. Orientation risk calibrates ceremony and fit, not whether core authority seams exist.',
    outputsAndEvidence: 'The evidence that this stage succeeded is a single named document, or a clearly marked revision to an existing one, at a path you can point to, containing concrete, non-templated language for every boundary, role, and precedence rule discussed — not a restatement of this generated prompt\'s own instructions back to you. Weak evidence reads like generic advice; strong evidence names this project\'s actual branch names, actual deploy mechanism, and actual role assignments.',
    failureModes: [
      'The agent paraphrases a checked destructive boundary into something softer — "be careful with production credentials" instead of "never touch production credentials or secrets" — a paraphrase a later, pressured agent can read as negotiable.',
      'The agent invents a role beyond the six the method defines, diluting who actually holds each piece of authority.',
      'The agent uses a low-risk profile as permission to merge Builder and Critic authority, instead of shrinking ceremony or returning NOT_FIT.',
      'The agent treats its own draft as already ratified — for example writing as though a new permission is already in force — instead of clearly labeling the document a draft pending the human\'s sign-off.',
      'The precedence order gets copied with generic placeholders instead of naming this project\'s actual document paths, so a future agent cannot actually apply it when a real conflict shows up.',
    ],
    weakResultSigns: [
      'The Rulebook reads as generic advice that could apply to any project verbatim, with no reference to this project\'s actual branches, deploy process, or existing documents.',
      'A destructive-action boundary the human checked does not appear anywhere in the drafted document, or appears only implicitly.',
      'The escalation and governance-change instructions are vague enough that two different future agents could reasonably follow them into opposite behavior.',
      'The document never states who is expected to ratify it or how, leaving its own authority as ambiguous as the gaps it is supposed to resolve.',
    ],
    customization: 'If this project is small and low-stakes, reduce document weight, checkpoint size, and reviewer multiplicity, or return NOT_FIT. One human or AI product may rotate through several roles, but each role is declared explicitly and incompatible functions use fresh contexts. Higher-stakes projects may add stricter boundaries in free text; the listed boundaries are not a ceiling.',
    whenToStop: 'Stop and reconsider before accepting this stage if the drafted Rulebook contradicts how the project actually operates today — for example, it forbids direct pushes to a branch that current tooling already allows anyone to push to directly. That gap needs a real decision, either fix the tooling or honestly narrow the rule, rather than a document that is already aspirational on day one.',
    auditWithoutPasting: 'Rather than pasting the drafted Rulebook back into this site, test it the way a future agent would use it: pick one of the destructive-action boundaries and ask a fresh agent instance, given only the Rulebook document and no other context, whether it may take that action. If it cannot answer confidently and correctly from the document alone, the document has a gap, independent of anything this website tracks.',
    weakVsStrongExample: {
      weak: '"Be careful about production and don\'t break anything without checking first." No named boundary, no named role, nothing a future agent could actually be held to.',
      strong: '"No agent may push directly to the main branch or trigger the deploy workflow without the human Owner\'s explicit sign-off in that specific instance; a Builder or Engineering Lead that believes a change is urgent enough to justify bypassing this must stop and report blocked, not act first and explain afterward."',
    },
  },
};
