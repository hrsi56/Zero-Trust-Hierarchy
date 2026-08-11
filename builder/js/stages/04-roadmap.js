import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const GRANULARITY_HELP = 'Fewer, larger checkpoints mean less planning and review overhead, but each one is harder to judge as a single coherent unit — a problem anywhere inside it can block the whole thing until it\'s resolved. Many small checkpoints give you frequent, easy-to-judge review points, but the ceremony of writing, authorizing, and reviewing each one adds up fast and can end up costing more than the work itself. There is no universally correct answer — it depends on how much review bandwidth you actually have and how costly an unreviewed mistake would be, which you already weighed in on back in Orientation.';
const PARALLEL_HELP = 'Parallel tracks are never required by this method — a strictly sequential roadmap is a completely legitimate choice, especially early on or when you\'re the only person doing the work. Say yes here only if you actually expect two or more genuinely independent pieces of work — built by different people, or touching completely separate parts of the project. The agent will still have to prove independence for any track it proposes; your answer only decides whether it should bother looking.';
const DEPENDENCIES_HELP = 'This is for hard constraints you already know for certain — not guesses about how the code is structured internally, which the agent should discover by actually inspecting the project. A good example is a real-world constraint no amount of code-reading would reveal, like needing a partner\'s credentials before any checkpoint that calls their system can be tested, or a fixed external deadline that forces one piece of work ahead of another.';

const GRANULARITY_LABELS = {
  coarse: 'Coarse — a few large checkpoints',
  balanced: 'Balanced — checkpoints sized to what one reviewer can judge in a single sitting',
  fine: 'Fine — many small checkpoints',
};

const PARALLEL_LABELS = {
  sequential: 'Strictly sequential for now',
  open: 'Open to parallel tracks where genuinely independent',
  unsure: 'Not sure',
};

/**
 * "Operating mode" text is shared verbatim (mode-dependent) across the primary prompt and every
 * recovery prompt in this stage, so a human running any of them gets the same grounding rules.
 */
function operatingModeText(ctx) {
  if (ctx.mode === 'same') {
    return [
      'You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn.',
      'Do not start a fresh session for this — the continuity is exactly what lets you build on what was already inspected. That said, continuity is not an exemption from verification: check current project state below rather than trusting anything this conversation concluded earlier, including your own prior read of the ratified Capstone. Actual state overrides an expected-state narrative, even one from earlier in this same conversation.',
    ].join(' ');
  }
  return [
    'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.',
    'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone. Rebuild your understanding of the current state entirely from what you can read now, rather than relying on anything decided, drafted, or assumed before this session began.',
  ].join(' ');
}

/** Fixed precedence order, reproduced inline so the agent never needs any file from outside the human's own project. */
function precedenceText() {
  return [
    'When sources conflict, use this order of authority, highest first:',
    '1. The project\'s Owner-ratified root governance and its ratified Capstone / acceptance-bar document.',
    '2. Any durable program-state record that names exactly which version of a plan or anchor is current.',
    '3. The specific section of the ratified plan that actually states the scope or bar you are decomposing.',
    '4. Any documented role, contract, or process describing how this kind of planning work should proceed.',
    '5. Less formal planning notes, prior drafts, or informal forms.',
    '6. Whatever you can verify directly by inspecting the actual current workspace, repository, or environment.',
    'A file is not authoritative just because it looks newer, longer, or more detailed than another — only something the human (the project\'s Owner) has actually ratified carries that weight. If two sources conflict and you cannot tell which is authoritative, stop and ask rather than picking one.',
  ].join('\n');
}

function granularityTaskGuidance(answers) {
  if (answers.granularity === DELEGATE_VALUE) {
    return 'The human is not sure how finely to break this project up. Before proposing a final roadmap, investigate the ratified Capstone\'s actual scope and propose at least two concrete granularity options for that same scope — for example a coarser breakdown and a finer one — with an honest tradeoff for each: review overhead vs. review difficulty, time to a first reviewable checkpoint vs. total checkpoint count. Pause and present these options instead of silently picking one.';
  }
  if (answers.granularity === 'coarse') {
    return 'The human asked for a coarse breakdown: prefer fewer, larger checkpoints, and accept the extra review burden that comes with that. A large checkpoint is only acceptable if a reviewer could still plausibly judge it as one coherent result in a single sitting — if a natural boundary would make a checkpoint genuinely unreviewable as one piece, split it anyway and say so rather than honoring this preference past the point it holds up.';
  }
  if (answers.granularity === 'fine') {
    return 'The human asked for a fine breakdown: prefer many smaller checkpoints with frequent review points, and accept the added ceremony that comes with that. Do not fragment a single coherent unit of work into pieces that only make sense together — if a proposed split cannot each stand on its own as an independently reviewable result, merge it back and say so.';
  }
  return 'The human asked for a balanced breakdown: size each checkpoint to what one reviewer could meaningfully judge in a single sitting — neither one sprawling checkpoint covering the whole project, nor so many checkpoints that most of the effort goes into review ceremony rather than the work itself.';
}

function parallelTaskGuidance(answers) {
  if (answers.parallelTracksDesired === 'open') {
    return 'The human is open to parallel tracks where checkpoints are genuinely independent: identify any checkpoints with no dependency relationship to each other, propose them as a parallel track, and state plainly why each is independent — what specifically makes it safe for them to proceed without waiting on one another. Do not force parallelism onto checkpoints that share a hidden dependency just to look efficient.';
  }
  if (answers.parallelTracksDesired === 'unsure') {
    return 'The human is not sure whether parallel tracks make sense here: investigate the actual dependency structure between your proposed checkpoints and report which ones are provably independent versus which ones you are not confident about, rather than silently deciding for them. Default anything uncertain to the sequential track and explain why you were not confident.';
  }
  return 'The human wants a strictly sequential roadmap for now: order every checkpoint into a single sequence with no parallel tracks, even if you notice checkpoints that look independent. Note any such observation for the human\'s future reference, but do not build a parallel-track structure without their explicit request — parallel tracks are optional and zero-to-many, never assumed as a requirement.';
}

function dependenciesTaskGuidance(answers) {
  const known = (answers.knownDependencies || '').trim();
  if (known === DELEGATE_VALUE) {
    return 'The human is not sure of any hard sequencing constraints up front and has asked you to investigate instead: infer plausible dependencies from the ratified Capstone and the actual current state of the project, propose the dependency list yourself, and clearly flag anything you are inferring rather than confirming.';
  }
  if (known) {
    return [
      quoteHumanInput('Known hard sequencing constraint(s) from the human', known),
      'Treat this as a floor, not a ceiling: verify each stated constraint is still accurate against the actual current project before relying on it, and add any further dependencies you discover that the human did not mention.',
    ].join('\n');
  }
  return 'The human did not name any specific known dependencies up front. That is not evidence that none exist — dependencies between checkpoints are something you must investigate and derive from the ratified Capstone and the actual project, not something to leave undecided.';
}

function humanIntentBlock(answers, freeText) {
  const granularityLabel = answers.granularity === DELEGATE_VALUE ? null : GRANULARITY_LABELS[answers.granularity];
  const parallelLabel = PARALLEL_LABELS[answers.parallelTracksDesired] || '';
  const knownDeps = (answers.knownDependencies || '').trim();

  const granularityLine = granularityLabel
    ? quoteHumanInput('Preferred checkpoint granularity', granularityLabel)
    : 'Preferred checkpoint granularity: not decided by the human — they asked you to investigate the ratified Capstone and propose granularity options with tradeoffs instead (see Exact task below).';

  const dependenciesLine = knownDeps === DELEGATE_VALUE
    ? 'Known dependencies: the human is not sure and asked you to investigate and propose the dependency list yourself (see Exact task below).'
    : (knownDeps ? quoteHumanInput('Known hard sequencing constraint(s)', knownDeps) : 'Known dependencies: none volunteered by the human up front — investigate and derive the real dependency list yourself.');

  return [
    granularityLine,
    quoteHumanInput('Parallel-track preference', parallelLabel),
    dependenciesLine,
    quoteHumanInput('Anything else the human wants understood about this roadmap', freeText),
  ].filter(Boolean).join('\n\n');
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'roadmap',
  number: 4,
  title: 'Program Decomposition & Roadmap',
  purpose: 'Convert the ratified Capstone into an ordered set of bounded checkpoints, with dependencies and evidence requirements, avoiding both one unreviewable checkpoint and meaningless fragmentation.',
  agentProduces: 'A checkpoint decomposition / roadmap document naming each bounded checkpoint, its dependencies, its rough evidence requirements, and whether any checkpoints could safely run in parallel.',
  prerequisites: ['capstone-ratification'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The requirement that a ratified plan be decomposed into an ordered set of bounded checkpoints — each one a single authorized unit of work — comes directly from the bootstrap\'s Phase A drafting (article.md §14), which lists a "checkpoint decomposition" among the governance artifacts a setup agent drafts, and from the checkpoint brief\'s own field 2, "Authorized checkpoint (exactly one bounded unit)".',
      'Zero-to-arbitrarily-many optional parallel tracks — never assumed, never required — and the requirement that cross-track dependencies be tracked by durable program state rather than any one role\'s private assumption, come from article.md §13 and RULEBOOK.md §17, "Parallel tracks and external changes."',
    ],
    adapted: [],
    productDesign: [
      'The three-point granularity spectrum (coarse-few-large / balanced / fine-many-small) as an explicit multiple-choice question, together with its delegate-to-agent option, is this guide\'s product design — the source method requires checkpoints to be bounded and independently reviewable, but it does not prescribe how a human should be asked to state a granularity preference.',
      'Sequencing checkpoint decomposition as its own dedicated stage — after Capstone ratification but before the Rulebook, Roles, and Forms stages — is this guide\'s own pacing choice. The source bootstrap drafts all nine governance artifacts, including the checkpoint decomposition, together in one agent turn during Phase A; unbundling them into a guided, one-artifact-at-a-time sequence is not itself part of the source method.',
    ],
  },
  questions: [
    {
      id: 'granularity',
      type: 'radio',
      label: 'How finely should the roadmap be broken up?',
      help: GRANULARITY_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Sets the sizing heuristic given to the agent in the Exact task layer — how aggressively it should prefer merging vs. splitting checkpoints — and, if delegated, replaces that heuristic with an instruction to propose granularity options with tradeoffs instead of deciding alone.',
      options: [
        { value: 'coarse', label: 'Coarse — a few large checkpoints', description: 'Less planning and review overhead; each checkpoint is bigger and harder to judge as one unit.' },
        { value: 'balanced', label: 'Balanced', description: 'Checkpoints sized to what one reviewer could meaningfully judge in a single sitting.' },
        { value: 'fine', label: 'Fine — many small checkpoints', description: 'Frequent, easy review points; more ceremony per unit of actual work.' },
      ],
    },
    {
      id: 'parallelTracksDesired',
      type: 'radio',
      label: 'Do you want the roadmap to identify any checkpoints that could run in parallel?',
      help: PARALLEL_HELP,
      required: true,
      affectsPrompt: 'Determines whether the Exact task layer instructs the agent to build a single strictly sequential list, to actively look for and propose independent parallel tracks, or to investigate and report on independence without deciding for the human.',
      options: [
        { value: 'sequential', label: 'Strictly sequential for now', description: 'Order everything into one sequence, even if some pieces look independent.' },
        { value: 'open', label: 'Open to parallel tracks where genuinely independent', description: 'Let the agent propose parallel tracks it can justify.' },
        { value: 'unsure', label: 'Not sure', description: 'Ask the agent to investigate the dependency structure and report what it finds.' },
      ],
    },
    {
      id: 'knownDependencies',
      type: 'textarea',
      label: 'Are there any hard sequencing constraints you already know about?',
      help: DEPENDENCIES_HELP,
      required: false,
      allowDelegate: true,
      placeholder: 'e.g. "We can\'t build the export feature until the new data format is finalized with our data provider."',
      affectsPrompt: 'Quoted verbatim into the Exact task layer as a hard constraint the agent must verify and build the roadmap around; if delegated or left blank, replaced with an instruction for the agent to investigate and derive the dependency list itself.',
    },
  ],
  freeTextLabel: 'What should the agent understand about how you want this roadmap shaped that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'investigated', label: 'The agent read the actual ratified Capstone and inspected the current project before proposing checkpoints, rather than relying on my summary of either.', kind: 'confirm', required: true },
    { id: 'artifactCreated', label: 'A roadmap / checkpoint-decomposition document was actually written to the project, not just described in chat.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported its investigation trail, its assumptions, and any unresolved conflicts — not just a clean-looking final list.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I reviewed the proposed checkpoints, dependencies, and any parallel-track suggestions myself before treating this roadmap as something I\'m ready to act on.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the roadmap document in your project (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const roleAndAuthority = [
      `You are helping the human decompose the already-ratified Capstone for "${ctx.projectName}" into a roadmap of bounded checkpoints.`,
      'You hold no unilateral authority here: you may propose checkpoint boundaries, dependencies, and evidence expectations, but only the human (the project\'s Architect/Owner) decides the final breakdown. Nothing you produce in this stage authorizes any builder or reviewer to begin actual implementation work — that requires a separate, later, explicit authorization for one specific checkpoint at a time.',
    ].join('\n');

    const stageObjective = 'Convert the ratified Capstone\'s scope into an ordered set of bounded checkpoints — each one a single unit of work that could be authorized, executed, and independently reviewed on its own — without collapsing the whole project into one unreviewable checkpoint, and without fragmenting it into so many trivial slices that review becomes pure ceremony.';

    const humanIntent = humanIntentBlock(answers, freeText);

    const operatingMode = operatingModeText(ctx);

    const investigationCore = [
      'Locate the project\'s ratified Capstone or equivalent acceptance-bar document. Confirm it is actually ratified/final, not still a draft — if you cannot find one, or you find more than one candidate and cannot tell which is authoritative, stop and say so rather than guessing.',
      'Read the document in full, not a summary, changelog entry, or reference to it.',
      'Inventory what already exists in the project — code, prior partial work, existing plans or checkpoint lists — because a roadmap that ignores work already done will misdecompose the remaining scope.',
      'Check whether the project already has an existing roadmap or checkpoint-decomposition artifact. If one exists, treat any conflict between it and your proposal as something to surface to the human, never something to silently overwrite.',
    ];
    const investigation = ctx.mode === 'same'
      ? [
        'You may treat what you already established about the Capstone\'s content and the project\'s structure earlier in this conversation as a starting hypothesis, but you must still verify it against current reality before finalizing anything — files can change between messages, and this method\'s own precedence rule holds that verified actual state always overrides an expected-state narrative, including one you yourself produced earlier in this same conversation.',
        'At minimum, before proposing the roadmap:',
        ...investigationCore.map((line) => `- ${line}`),
      ].join('\n')
      : [
        'This is a fresh session with no memory of any earlier work on this project. Do not assume any fact about the Capstone\'s content, the project\'s structure, or prior planning that you have not personally verified in this session. Before proposing anything:',
        ...investigationCore.map((line) => `- ${line}`),
        '- Do not treat a commit message, a README summary, or a changelog line as equivalent to reading the actual ratified document — read the document itself.',
        '- Do not assume any fact about tooling, team size, or timeline that was not either stated by the human above or something you personally verified by reading the project.',
      ].join('\n');

    const precedence = precedenceText();

    const task = [
      '1. Read the project\'s ratified Capstone (or equivalent governing acceptance-bar document) as your sole source of truth for what the roadmap must ultimately deliver. Do not invent scope beyond it, and do not narrow it to make the decomposition tidier.',
      '2. Break the full scope into an ordered list of checkpoints. Each checkpoint must be a single bounded unit of authorized work: something one accountable technical lead could pick up, execute, and hand back as one complete, independently reviewable result. Never propose a checkpoint whose "done" can only be judged by re-litigating unrelated work, and never one so thin that reviewing it costs more than the work it covers was worth.',
      '3. For every checkpoint, state: (a) a short, unambiguous name; (b) the observable artifact or state change it is expected to produce; (c) any other checkpoints it depends on, and the concrete reason for each dependency (a data, interface, decision, or resource dependency — not a bare ordering guess); (d) a rough sketch of what evidence a reviewer would need to see to confirm it actually happened, appropriate to this specific project rather than a fixed template.',
      '4. Identify whether any checkpoints have no dependency relationship to each other and could therefore run in parallel; say so explicitly for each one you flag, with the reason. Never assume parallelism is required — it is optional, and defaulting an uncertain case to sequential is always safer than guessing it independent.',
      '5. Write the ordered roadmap to the project as a single artifact, not scattered across chat replies.',
      '',
      granularityTaskGuidance(answers),
      '',
      parallelTaskGuidance(answers),
      '',
      dependenciesTaskGuidance(answers),
    ].join('\n');

    const constraints = [
      'Do not begin, assign, or authorize any actual implementation work — this stage produces a plan, not code, and produces no permission for any checkpoint to start.',
      'Do not weaken, narrow, or silently reinterpret the ratified Capstone\'s scope to make the decomposition tidier; if the full scope genuinely does not decompose cleanly, say so rather than dropping part of it.',
      'Do not invent an authority role, title, or approval step beyond: the human (Owner), an orchestration function, an engineering-planning function, individual builders, and independent reviewers. Do not add extra management tiers.',
      'Do not assume parallel tracks are required; they are optional and appropriate only where checkpoints are genuinely independent.',
    ].join('\n');

    const deliverables = 'A single, ordered roadmap / checkpoint-decomposition document written into the project, listing every checkpoint with: a name, its expected observable output, its dependencies (or explicitly "none"), a rough sketch of the evidence a reviewer would need, and whether it belongs to the main sequence or a proposed parallel track. Explicitly flag any part of the ratified Capstone\'s scope you were not confident how to decompose, rather than silently forcing it into a checkpoint that doesn\'t really fit.';

    const qualityGates = [
      'Before returning, check your own roadmap against these:',
      '- Every checkpoint is something one reviewer could plausibly judge as a single coherent unit.',
      '- No two checkpoints silently overlap in what they claim to produce.',
      '- Every stated dependency names a concrete reason, not just an ordering guess.',
      '- Nothing in the ratified Capstone\'s scope is missing from the roadmap without an explicit note explaining why.',
      '- Every proposed parallel track has a stated, checkable reason the checkpoints involved don\'t depend on each other.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume the human has already reviewed or agrees with your proposed checkpoint boundaries — this document is a proposal for their review, not a ratified plan.',
      'Do not assume a checkpoint is safe to run in parallel just because you didn\'t notice a dependency — absence of a dependency you happened to spot is not proof none exists. Say so honestly when you are inferring independence rather than confirming it.',
      'Do not assume the human\'s granularity preference licenses padding out trivial checkpoints or collapsing genuinely separate units of work just to hit a target count.',
    ].join('\n');

    const stopConditions = [
      'Stop and return to the human rather than finalizing a roadmap if:',
      '- You cannot locate a ratified Capstone or equivalent governing acceptance bar for this project — there is nothing yet to decompose.',
      '- The scope described by the Capstone is internally contradictory or clearly cannot be completed as stated.',
      '- An existing roadmap or checkpoint list is already in the project and conflicts with what you\'re about to propose, and it is unclear which is authoritative.',
      '- The human\'s stated known dependencies, once checked against the actual project, turn out to be wrong in a way that would materially change checkpoint ordering.',
    ].join('\n');

    const approvalBoundary = 'You may propose the full roadmap, including checkpoint boundaries, dependencies, and any suggested parallel tracks — but you may not treat this proposal as final or begin work against it. Only the human decides which checkpoints, boundaries, and parallel-track suggestions to keep, adjust, or reject. Surface your reasoning clearly enough for them to decide efficiently, but the decision stays theirs.';

    const terminalReturn = [
      'End with:',
      '- The full roadmap as a concrete artifact (not a chat-only description), and the exact file path(s) you wrote it to.',
      '- A short list of every assumption you made that the human should verify.',
      '- Any unresolved conflicts you found: competing existing roadmaps, ambiguous dependencies, or scope you weren\'t sure how to decompose.',
      '- An explicit statement of what you did NOT do: no implementation, no authorization of any checkpoint\'s execution.',
      'If at any point you could not establish which document or state was actually authoritative, say so plainly instead of picking one and moving on.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'audit-dependencies',
      label: 'Audit the roadmap for circular or unowned dependencies',
      description: 'Use this instead of the primary prompt when a roadmap already exists and you want it checked for dependency cycles or dangling references before you trust it.',
      buildLayers(answers, freeText, ctx) {
        const roleAndAuthority = [
          `You are auditing an existing checkpoint roadmap for "${ctx.projectName}" — not creating one from scratch.`,
          'You hold no authority to change governance unilaterally. You may find and report defects and propose fixes, but only the human (the Architect/Owner) decides what actually changes in the roadmap document.',
        ].join('\n');

        const stageObjective = 'Find and report any circular dependency (a checkpoint that transitively depends on itself through a chain) or any unowned/dangling dependency (a dependency that names something no checkpoint in the roadmap actually produces, or that points outside the roadmap\'s scope with no clear owner) in this project\'s existing roadmap.';

        const humanIntent = [
          humanIntentBlock(answers, freeText),
          '\nThis context describes how the roadmap was originally intended to be shaped — use it to understand intent, not as evidence that the existing document actually matches it. Your job in this audit is to check the roadmap as it actually is, not as it was meant to be.',
        ].join('\n');

        const operatingMode = operatingModeText(ctx);

        const investigation = ctx.mode === 'same'
          ? [
            'Re-open the actual roadmap document as it exists on disk right now rather than relying on your memory of it from earlier in this conversation — it may have been edited since you last looked.',
            'Independently re-derive the dependency graph from the document\'s actual checkpoint entries; do not reuse a mental model of the graph you built earlier without re-checking it against the current text.',
          ].join('\n')
          : [
            'This is a fresh session with no memory of any earlier work on this roadmap. You must rebuild the dependency graph entirely from the document itself:',
            '- Locate the existing roadmap / checkpoint-decomposition document in the project. If you cannot find one, or find more than one candidate, stop and say so.',
            '- Read every checkpoint entry and every dependency it declares — do not trust any existing summary of the graph (including one embedded in the document itself) without checking it against the actual checkpoint entries.',
            '- Confirm you understand what each checkpoint is actually supposed to produce before judging whether a dependency on it makes sense.',
          ].join('\n');

        const precedence = precedenceText();

        const task = [
          '1. Load the existing roadmap / checkpoint-decomposition document from the project.',
          '2. Extract every checkpoint and every dependency edge it declares, exactly as written.',
          '3. Build the dependency graph and check it for cycles — a chain where a checkpoint transitively depends on itself. Report the exact cycle path (checkpoint names in order) for every cycle found.',
          '4. Check for unowned dependencies: any dependency that names something no checkpoint in the roadmap actually produces, or that points outside the roadmap\'s scope with no clear accountable owner.',
          '5. Report every defect found, naming the exact checkpoints and dependency statements involved. Do not silently fix anything before reporting it.',
        ].join('\n');

        const constraints = 'Do not rewrite the roadmap document to fix what you find — report the defects and propose a fix, but wait for the human\'s explicit go-ahead before editing anything. Do not treat the absence of an explicitly stated dependency as proof of independence; if you are not confident two checkpoints are actually independent, say so as "unclear" rather than asserting it either way.';

        const deliverables = 'A short defect report: every circular dependency chain found (or "none found"), every unowned/dangling dependency found (or "none found"), and — only if the human then asks for it — a proposed corrected dependency list.';

        const qualityGates = [
          'Every reported cycle names the exact checkpoints involved, in order.',
          'Every reported unowned dependency names exactly what it points to and why it doesn\'t resolve to a real checkpoint or owner.',
          'You rebuilt the dependency graph from the actual checkpoint entries — you did not just re-read the document\'s own summary of itself, if it has one.',
        ].join('\n');

        const prohibitedAssumptions = 'Do not assume the roadmap\'s stated ordering is correct just because it is already written down — the entire point of this audit is that a written claim can be wrong. Do not assume a dependency that was accurate when the roadmap was first drafted is still accurate now; project state changes.';

        const stopConditions = 'Stop and ask if the roadmap document cannot be found, if multiple conflicting versions of it exist, or if fixing a cycle would require rewriting checkpoint boundaries significantly — that is a bigger decision than this audit is meant to authorize on its own.';

        const approvalBoundary = 'You may report defects and propose fixes. You may not edit the roadmap document without the human\'s explicit go-ahead on this specific audit\'s findings.';

        const terminalReturn = 'End with a clear summary: either "No circular or unowned dependencies found" or an itemized list of exactly what is wrong and where, plus your proposed fix for each. Stop there and wait for the human\'s decision rather than applying any fix unasked.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'repair-granularity',
      label: 'Repair a roadmap that is too coarse or too fragmented',
      description: 'Use this instead of the primary prompt when a roadmap already exists but its checkpoints turned out to be badly sized — either unreviewably large or so fragmented that review has become pure ceremony.',
      buildLayers(answers, freeText, ctx) {
        const roleAndAuthority = [
          `You are repairing the sizing of an existing checkpoint roadmap for "${ctx.projectName}" — merging checkpoints that were split too finely, or splitting ones too large to review as a single unit.`,
          'You hold no authority to change the underlying scope of the project while doing this, only how that scope is chunked into checkpoints. Only the human decides whether to adopt your resized roadmap.',
        ].join('\n');

        const stageObjective = 'Re-size this project\'s existing roadmap so every checkpoint is a single unit of work a reviewer could plausibly judge in one sitting — neither one unreviewable checkpoint covering everything, nor so many trivial slices that review costs more than the work itself.';

        const humanIntent = [
          humanIntentBlock(answers, freeText),
          '\nThis context describes the granularity and sequencing preferences the roadmap was originally supposed to follow. Treat it as useful background for how far to lean when resizing, not as proof the existing document actually reflects it — that mismatch is presumably why this repair is happening.',
        ].join('\n');

        const operatingMode = operatingModeText(ctx);

        const investigation = ctx.mode === 'same'
          ? [
            'Re-open the actual roadmap and the ratified Capstone as they exist right now rather than relying on your memory of them from earlier in this conversation.',
            'Check the current state of the project for work already completed since the roadmap was drafted — a checkpoint that looked oversized on paper may have already been partly done in a way that suggests a natural split point, and vice versa.',
          ].join('\n')
          : [
            'This is a fresh session with no memory of any earlier work on this roadmap. Rebuild your understanding from scratch:',
            '- Locate and read the existing roadmap / checkpoint-decomposition document in full.',
            '- Locate and read the ratified Capstone / acceptance-bar document it is supposed to decompose.',
            '- Inventory the actual current state of the project so your resizing judgment reflects real work done, not just the roadmap\'s original assumptions.',
            '- Do not trust any prior sizing judgment recorded in the roadmap itself without re-evaluating it independently.',
          ].join('\n');

        const precedence = precedenceText();

        const task = [
          '1. Load the existing roadmap and the ratified Capstone it is supposed to decompose.',
          '2. For each checkpoint, assess size: could one reviewer plausibly judge this as a single coherent result in one sitting? If a checkpoint is so large that judging it means re-reviewing multiple unrelated pieces of work, mark it for splitting and propose exact split points along natural seams in the work itself — not an arbitrary line count or file count.',
          '3. If checkpoints are so numerous or thin that most individually contribute little on their own and reviewing each costs more than the work it saves, mark candidates for merging and propose which ones combine into one coherent unit.',
          '4. Re-derive dependencies for any checkpoint you split or merged — a split checkpoint\'s two halves may now depend on each other; a merged checkpoint\'s combined dependencies must be reconciled, not just concatenated blindly.',
          '5. Produce a revised roadmap alongside a short explanation of every merge and split and the reason for each.',
          '',
          granularityTaskGuidance(answers),
        ].join('\n');

        const constraints = 'Do not change the overall scope of the ratified Capstone while resizing — repair the chunking, not the scope. Do not merge checkpoints just to hit a smaller total count if they don\'t actually share one coherent, single-sitting-reviewable result. Do not split a checkpoint that is already a genuinely single coherent unit just because it looks large on paper.';

        const deliverables = 'A revised roadmap with every merge and split applied, written into the project, plus a short changelog: what was merged or split, and the one-sentence reason for each change.';

        const qualityGates = [
          'Every checkpoint in the revised roadmap can be described as one coherent, independently reviewable result.',
          'No merge combined two checkpoints that don\'t actually share one owner and one reviewable output.',
          'No split created a fragment that cannot stand as a reviewable result on its own.',
        ].join('\n');

        const prohibitedAssumptions = 'Do not assume the granularity preference the human gave when the roadmap was first drafted still describes what they want now — this repair is happening precisely because the sizing didn\'t work; ask if you are not sure whether the fix should lean coarser or finer overall. Do not assume every oversized checkpoint has an obvious clean split — say so plainly if one doesn\'t.';

        const stopConditions = 'Stop and ask if fixing the sizing would require changing the roadmap\'s dependency structure so much that it amounts to a new roadmap rather than a repair, or if you cannot find a coherent split or merge boundary for a checkpoint you\'ve flagged as wrong-sized.';

        const approvalBoundary = 'Propose the resized roadmap and its changelog; do not treat it as adopted until the human reviews and accepts it.';

        const terminalReturn = 'End with the revised roadmap as a concrete artifact and its file path, the changelog of merges and splits with reasons, and any checkpoint you flagged as wrong-sized but couldn\'t cleanly resolve — plus the same assumptions-and-conflicts reporting required of the primary prompt.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'The roadmap stage exists because a ratified Capstone only states what "done" looks like for the whole project — it says nothing about the order or size of the work needed to get there. Without a deliberate decomposition step, a human either hands an agent the entire Capstone as one enormous, unreviewable unit of work, or lets an agent invent an ad hoc breakdown mid-execution with no chance to catch a bad boundary before real work starts against it. This stage forces that decomposition into its own reviewable moment, with the human\'s granularity and sequencing preferences captured explicitly rather than left to whichever agent happens to run first.',
    problemPrevented: 'Two failure patterns show up constantly without a dedicated decomposition step: a single "checkpoint" that actually bundles unrelated work, so a reviewer can only accept or reject the whole bundle and a real problem in one corner blocks everything else; and the opposite — dozens of trivially small slices where the overhead of writing, authorizing, and reviewing each one dwarfs the work it covers. Both waste the exact ceremony this method is trying to make worth its cost. Naming granularity as an explicit human decision, up front, prevents an agent from defaulting to whichever pattern is easiest for it to generate.',
    judgmentVsInvestigation: 'Granularity preference, willingness to run parallel tracks, and any dependency the human personally already knows about (a business or resourcing constraint no code could reveal) are judgment calls only the human can make — no amount of repository inspection surfaces a preference for review cadence. Everything else is investigation: what the ratified Capstone\'s scope actually contains, what already exists in the project that changes the decomposition, whether two checkpoints\' dependencies are real or just look plausible on paper, and whether an existing roadmap document already conflicts with a new proposal. The agent should never ask the human to manually enumerate dependencies it could verify by reading the project.',
    promptAnatomy: 'The task layer carries most of this prompt\'s weight: it defines what a checkpoint actually is (one bounded, independently reviewable unit), requires a concrete reason behind every dependency rather than a bare ordering claim, and requires an explicit parallel-track judgment rather than an assumed one. The granularity and parallel-track answers modify the task layer\'s sizing heuristic directly rather than living only in Human intent, because a preference that only ever gets quoted back at the agent as background context is easy for a long task list to bury — folding it directly into the instruction keeps it load-bearing.',
    authorityBoundary: 'This stage\'s agent proposes a roadmap; it does not authorize any checkpoint\'s execution. That distinction matters because the roadmap produced here later becomes an input to a real checkpoint brief — conflating "I decomposed the work" with "this checkpoint is now authorized to start" would let a planning exercise silently become a work order. Only a later, explicit, separately-authorized brief lets any checkpoint actually begin.',
    inputsAndSources: 'The primary source is the project\'s already-ratified Capstone or equivalent acceptance-bar document — this stage cannot run honestly without it, which is why it is gated on capstone ratification as a prerequisite. Secondary sources are whatever already exists in the actual project (code, prior partial work, any existing roadmap) and the human\'s three structured answers plus free text. The agent must weight the ratified document and the real project over the human\'s or its own prior assumptions about either.',
    outputsAndEvidence: 'The expected artifact is a written roadmap document naming every checkpoint, its dependencies, its rough evidence expectations, and any proposed parallel tracks — not a chat description that disappears once the conversation ends. Evidence that the stage was done honestly is the agent\'s own investigation trail: what it actually read, what it found already existing in the project, and which parts of the Capstone\'s scope it wasn\'t confident how to decompose.',
    failureModes: [
      'Accepting the ratified Capstone\'s scope from a summary or the human\'s memory of it, instead of re-reading the actual ratified document, and decomposing a scope that has since drifted.',
      'Producing a roadmap with dependencies stated as bare ordering ("do checkpoint 2 after checkpoint 1") with no reason given, so a later audit can\'t tell a real dependency from an arbitrary sequencing guess.',
      'Defaulting every checkpoint to sequential because parallel tracks require more careful reasoning to justify, even when the human explicitly asked to be told about genuine independence.',
      'Treating "balanced" granularity as a fixed target checkpoint count instead of an actual per-checkpoint reviewability judgment, producing a roadmap that looks evenly sized but isn\'t evenly reviewable.',
      'Silently dropping part of the Capstone\'s scope because it didn\'t decompose cleanly, instead of flagging it honestly as an unresolved decomposition problem.',
    ],
    weakResultSigns: [
      'Checkpoint descriptions are activities ("implement the backend") rather than an observable output someone could actually check against.',
      'Every dependency in the roadmap reads like a guessed reading order rather than a concrete reason two pieces of work actually depend on each other.',
      'The roadmap has roughly as many checkpoints as there are files or modules in the project, suggesting it was decomposed by file structure rather than by reviewable unit of work.',
      'No checkpoint was ever flagged as uncertain, ambiguous, or hard to size — a roadmap covering a nontrivial project that reads as completely confident throughout is more likely incomplete than genuinely that clean.',
    ],
    customization: 'If the project is small enough that the entire Capstone realistically is one checkpoint, say so honestly rather than forcing an artificial split to produce a "real-looking" roadmap — a one-checkpoint roadmap is a legitimate output of this stage, not a failure of it. If you already know your project will need heavy parallel work (for example, a genuinely separable frontend and backend built by different people), say that explicitly in the free-text field so the agent actually investigates independence rather than defaulting to a cautious sequential guess.',
    whenToStop: 'Stop and reconsider before accepting a proposed roadmap if you notice yourself approving checkpoint boundaries you don\'t actually understand well enough to know when one is really finished — a checkpoint you can\'t personally describe the "done" state of is a checkpoint you won\'t be able to judge honestly when its evidence comes back.',
    auditWithoutPasting: 'You do not need to paste the roadmap document into this website to sanity-check it. Read it yourself, or ask any assistant — with or without file access — to read it from your project and answer three questions out loud: does every checkpoint have a concrete, checkable "done"; does every stated dependency have an actual reason attached rather than just an ordering guess; and does the full list still cover everything the ratified Capstone promised, with nothing quietly dropped.',
    weakVsStrongExample: {
      weak: '"Checkpoint 3: Backend work" — depends on Checkpoint 2. No observable output stated, no reason given for the dependency, and "backend work" could mean anything from one function to the entire server.',
      strong: '"Checkpoint 3: The order-status API returns a real status for any existing order ID, backed by the data model built in Checkpoint 2. Depends on Checkpoint 2 because the API cannot be implemented against a schema that doesn\'t exist yet. Evidence: an integration test hitting the live endpoint for at least one known order ID."',
    },
  },
};
