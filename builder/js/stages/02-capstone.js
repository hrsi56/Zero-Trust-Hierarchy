import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const NON_NEGOTIABLES_HELP = 'These are hard limits, not preferences — think legal or safety limits, data-integrity guarantees, compatibility promises, or anything where crossing the line is a real problem, not just an inconvenience.';
const EXCLUSIONS_HELP = 'Naming non-goals is as important as naming goals. It stops an agent from quietly expanding scope ("while I was in there...") and gives you something concrete to point back to later if scope starts creeping.';
const TRADEOFFS_HELP = 'Every real project eventually has to choose between finishing fast and finishing polished. Naming your own tradeoff order now means the agent isn\'t guessing under pressure later — and if you\'re genuinely unsure, delegating this is a legitimate answer.';
const RISKS_HELP = 'You usually know more than you think — a fragile dependency, an unclear requirement, a part of the idea you\'re honestly not sure will work. Naming it now turns it into a tracked risk instead of a surprise later.';
const REFERENCE_HELP = 'A concrete reference point makes an abstract quality bar far easier to check against than adjectives like "polished" or "professional."';
const PRIORITIES_HELP = 'When two priorities conflict — for example shipping fast versus polishing the interface — this ranking tells the agent, and any later reviewer, which one should win by default.';
const ARTIFACT_LOCATION_HELP = 'If your project already has a documentation or planning folder, name it here. Leave it blank and the agent will pick a conventional location and tell you exactly where it put the file.';

const OPERATING_MODE_SAME = 'You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn.';
const OPERATING_MODE_FRESH = 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.';

const QUALITY_PRIORITY_OPTIONS = [
  { value: 'correctness', label: 'Correctness', description: 'It does exactly what it claims, with no silent wrong answers.' },
  { value: 'maintainability', label: 'Maintainability', description: 'Someone else — or a future you — can safely change it later.' },
  { value: 'performance', label: 'Performance', description: 'It is fast and efficient enough for how it will actually be used.' },
  { value: 'speed-to-first-version', label: 'Speed to first version', description: 'Getting something real in front of users, or yourself, quickly.' },
  { value: 'cost-efficiency', label: 'Cost efficiency', description: 'Running it — compute, API calls, infrastructure — stays cheap.' },
  { value: 'user-experience-polish', label: 'User-experience polish', description: 'How refined and pleasant it feels to actually use.' },
];
const QUALITY_PRIORITY_LABELS = Object.fromEntries(QUALITY_PRIORITY_OPTIONS.map((o) => [o.value, o.label]));
const QUALITY_PRIORITY_DEFAULT_ORDER = QUALITY_PRIORITY_OPTIONS.map((o) => o.value);

/** Pulls forward the human's Orientation-stage answers so this stage's prompts stay self-contained. */
function orientationAnswers(ctx) {
  return (ctx && ctx.allAnswers && ctx.allAnswers.orientation) || {};
}

/** Quotes a normal answer, or — if the human delegated this question — states that plainly instead. */
function delegateOrQuote(label, value) {
  if (value === DELEGATE_VALUE) {
    return `${label}: not yet decided — the human was unsure and delegated this to you. See "Required repository investigation" for what to propose and "Stop-and-escalate conditions" for how to hand the decision back.`;
  }
  return quoteHumanInput(label, value);
}

/** Renders the ranked quality-priorities answer as a numbered list, falling back to the default order. */
function rankedPriorityText(answers) {
  const order = Array.isArray(answers.qualityPriorities) && answers.qualityPriorities.length
    ? answers.qualityPriorities
    : QUALITY_PRIORITY_DEFAULT_ORDER;
  return order.map((id, i) => `${i + 1}. ${QUALITY_PRIORITY_LABELS[id] || id}`).join('\n');
}

/** Which delegate-eligible topics the human handed to the agent, in plain language. */
function delegatedTopicsFor(answers) {
  const topics = [];
  if (answers.acceptableTradeoffs === DELEGATE_VALUE) topics.push('acceptable tradeoffs under pressure');
  if (answers.knownRisks === DELEGATE_VALUE) topics.push('known risks and unknowns');
  if (answers.referenceExamples === DELEGATE_VALUE) topics.push('a reference example of what "good" looks like for this outcome');
  return topics;
}

/** Shared instruction appended to the investigation layer whenever anything was delegated. */
function delegatedInstruction(delegatedTopics) {
  if (!delegatedTopics.length) return '';
  return `The human was unsure about the following and delegated them to you: ${delegatedTopics.join('; ')}. For each one, investigate the actual project rather than leaning on generic best practice alone, then propose two or three concrete options with honest tradeoffs for each. Do not silently pick one on the human's behalf — present the options and stop for a decision (see Stop-and-escalate conditions).`;
}

/** The human-intent layer is identical in spirit for the primary prompt and both recovery prompts:
 *  it restates the human's judgment calls so whichever task the agent is doing, it is doing it
 *  against the same stated intent. */
function buildHumanIntent(answers, freeText, ctx) {
  const orientation = orientationAnswers(ctx);
  return [
    quoteHumanInput('Raw project idea (carried over from an earlier step)', orientation.rawIdea),
    quoteHumanInput('Desired observable outcome (carried over from an earlier step)', orientation.primaryOutcome),
    quoteHumanInput('Intended users (carried over from an earlier step)', orientation.intendedUsers),
    quoteHumanInput('Non-negotiable constraints', answers.nonNegotiables),
    quoteHumanInput('Explicitly out of scope', answers.exclusions),
    delegateOrQuote('Acceptable tradeoffs under pressure', answers.acceptableTradeoffs),
    delegateOrQuote('Known risks and unknowns', answers.knownRisks),
    delegateOrQuote('Reference example of what good looks like', answers.referenceExamples),
    quoteHumanInput('Quality priorities, ranked highest to lowest by the human', rankedPriorityText(answers)),
    quoteHumanInput('Anything else the human wants understood', freeText),
  ].filter(Boolean).join('\n\n');
}

/** operatingMode branches on ctx.mode; both branches keep the app's near-verbatim mode copy and
 *  add the reminder that "same agent" is not exempt from verifying current state. */
function buildOperatingMode(ctx) {
  return ctx.mode === 'same'
    ? `${OPERATING_MODE_SAME} Even so, do not treat anything decided earlier in this conversation as settled fact about the project's current files — verify current state before acting, because actual state always overrides an expected-state narrative carried over from earlier in a conversation.`
    : `${OPERATING_MODE_FRESH} This is a new conversation with no memory of any earlier step in this process, so you must establish the project's current state yourself, from scratch, before acting on anything below.`;
}

/** The baseline project-state investigation, common to the primary prompt and both recovery
 *  prompts. 'fresh' is deliberately far more thorough than 'same' — a fresh agent has no prior
 *  turn's claims to lean on and must verify everything itself; 'same' still has to verify, just
 *  starting from a narrower set of open questions. */
function baseInvestigation(ctx) {
  if (ctx.mode === 'same') {
    return [
      'You already have conversational context from the previous step, but that is not a substitute for looking at the project as it actually stands right now. Before drafting, auditing, or reconciling anything:',
      '- Confirm the project\'s current file and directory structure still matches what was discussed earlier in this conversation; note anything that has changed.',
      '- Check whether a planning document, README, or requirements file already exists anywhere in the project; if one does, read it in full.',
      '- Check whether the project already has a version-control system, or a documented equivalent, in place, and note plainly what you find.',
      'Actual state overrides an expected-state narrative: if anything you find contradicts what was said earlier in this conversation, treat what you find in the files as true, and surface the contradiction explicitly rather than trusting the earlier narrative.',
    ];
  }
  return [
    'This is a fresh conversation with no memory of any earlier step, so investigate the project from scratch before drafting, auditing, or reconciling anything:',
    '- Read the project\'s root-level documentation (README and any other top-level docs) in full.',
    '- Inventory the actual directory and file structure to understand what currently exists versus what is only proposed or discussed.',
    '- Check whether the project already has a version-control system, or a documented equivalent evidence substrate, in place, and note exactly what you find.',
    '- Search for any existing planning document, roadmap, requirements file, or design note anywhere in the project that might already assert an outcome, scope, or constraint; read every one you find in full.',
    '- Check for a dependency manifest, build or test configuration, or similar, since the project\'s real technical shape constrains what outcomes and constraints are realistic.',
    'Do not assume the human\'s structured answers below fully describe the project. Reconcile them against what you actually find; where they conflict, do not silently pick one — record the conflict as an open decision for the human instead.',
  ];
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'capstone',
  number: 2,
  title: 'Capstone — From Idea to Governing Plan',
  purpose: 'Turn the raw idea from Orientation into a governing project plan: an outcome, a scope boundary, non-goals, risks, a quality bar, and the open decisions still unresolved.',
  agentProduces: 'A draft Capstone / project-plan document, visibly marked DRAFT, naming the observable outcome, in-scope and out-of-scope work, non-negotiable constraints, known risks, a falsifiable acceptance bar, and every open decision still needing the human.',
  prerequisites: ['orientation'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The Capstone / project-plan artifact, and its required contents (an observable outcome, a scope boundary, constraints, risks, and an acceptance bar), come from the bootstrap payload in article.md §14, Phase A step 5, where the Capstone / project plan is the first of the nine governance artifacts a setup agent drafts — in its response only, never as something authoritative — before any ratification is asked for.',
      'The "bar vs. goal" distinction this stage\'s acceptance-bar section must satisfy — an authorized, stable, falsifiable condition rather than a vague aspiration like "make it excellent" — is set out in RULEBOOK.md §4, "How a document becomes an acceptance bar" (and narratively in article.md §5, "Turn prose into an acceptance bar"), and is reproduced here as the standard the generated prompt holds the draft to.',
      'Requiring the draft to list every open decision still needing the human, and forbidding the agent from inferring approval from silence or enthusiasm, follows Phase A step 2 of the bootstrap payload in article.md §14 — "Label every inference and ask rather than inventing an Owner judgment" — together with RULEBOOK.md §3, under which only ratification confers authority.',
    ],
    adapted: [],
    productDesign: [
      'Splitting Capstone drafting into its own stage, separate from ratification, is this guide\'s product design — the source method\'s bootstrap drafts all nine governance artifacts together in a single agent turn and stops once, for the whole batch, awaiting ratification. Splitting it lets a beginner read and absorb one document before deciding whether to accept it, instead of reviewing nine at once.',
      'The ranked quality-priorities question, and asking for an optional reference example of what "good" looks like, are this guide\'s additions. The source bootstrap\'s intake asks about possible acceptance bars but does not require the human to rank competing quality dimensions against each other.',
      'Offering allowDelegate on acceptable tradeoffs, known risks, and reference examples — but not on non-negotiable constraints or exclusions — is an editorial choice: this guide treats hard limits and scope boundaries as things only the human can respond to honestly, while treating tradeoffs, risk enumeration, and reference points as places a capable investigating agent can responsibly propose a starting point.',
    ],
  },
  questions: [
    {
      id: 'nonNegotiables',
      type: 'textarea',
      label: 'What must this project never violate, no matter how much pressure there is to ship?',
      help: NON_NEGOTIABLES_HELP,
      required: true,
      placeholder: 'e.g. never store secrets in plain text, never break the existing public interface, must stay deployable as a single process',
      affectsPrompt: 'Quoted verbatim into the Human intent and Constraints layers of every generated prompt in this stage as hard limits the agent may not trade away, even under time or scope pressure.',
    },
    {
      id: 'exclusions',
      type: 'textarea',
      label: 'What is explicitly out of scope for this round of work?',
      help: EXCLUSIONS_HELP,
      required: true,
      placeholder: 'e.g. no mobile app yet, no billing, no multi-user support, nothing beyond the first release',
      affectsPrompt: 'Quoted verbatim into the Human intent and Constraints layers as an explicit non-goals list the agent must respect and not silently expand beyond.',
    },
    {
      id: 'acceptableTradeoffs',
      type: 'textarea',
      label: 'If time, budget, or effort run short, what would you trade off first — and what would you never trade away?',
      help: TRADEOFFS_HELP,
      required: false,
      allowDelegate: true,
      placeholder: 'e.g. I would rather ship a rough interface on time than delay for polish, but I would never trade away data integrity',
      affectsPrompt: 'Feeds the draft\'s stated tradeoff order in the Task layer; if delegated, the agent is told to investigate the project and propose a tradeoff ranking with reasoning instead of assuming one, then stop for a decision.',
    },
    {
      id: 'knownRisks',
      type: 'textarea',
      label: 'What risks or unknowns do you already know about?',
      help: RISKS_HELP,
      required: false,
      allowDelegate: true,
      placeholder: 'e.g. unsure whether the existing data model can support this without a rewrite; depends on an external service I have not tested yet',
      affectsPrompt: 'Quoted into the Human intent layer and required to appear in the draft\'s risk section; if delegated, the agent is told to investigate the project and propose a risk list instead of assuming none exist.',
    },
    {
      id: 'referenceExamples',
      type: 'textarea',
      label: 'Is there an existing product, feature, or project that already shows what "good" looks like here?',
      help: REFERENCE_HELP,
      required: false,
      allowDelegate: true,
      placeholder: 'optional — e.g. it should feel as fast and simple as your favorite note-taking app; leave blank if nothing comes to mind',
      affectsPrompt: 'If given, quoted into the Human intent layer as a concrete reference for the acceptance bar; if delegated, the agent is told to propose candidate reference points itself instead of inventing a bar from nothing.',
    },
    {
      id: 'qualityPriorities',
      type: 'priorityOrder',
      label: 'Rank these quality priorities from most to least important for this project.',
      help: PRIORITIES_HELP,
      required: true,
      options: QUALITY_PRIORITY_OPTIONS,
      affectsPrompt: 'Reproduced as an explicit ranked list in the Human intent and Task layers, so the agent — and any later reviewer — knows which priority should win by default when two of them conflict.',
    },
    {
      id: 'artifactLocation',
      type: 'text',
      label: 'Where should the Capstone document live in your project? (optional)',
      help: ARTIFACT_LOCATION_HELP,
      required: false,
      placeholder: 'e.g. docs/capstone.md',
      affectsPrompt: 'If given, quoted into the Deliverables layer as the exact target location; if left blank, the agent is told to choose a conventional location itself and report the exact path it used.',
    },
  ],
  freeTextLabel: 'What should the agent understand about this project\'s plan that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'inspected', label: 'The agent actually inspected the project — files, and any existing planning documents — rather than relying only on my answers.', kind: 'confirm', required: true },
    { id: 'artifactDrafted', label: 'A Capstone / project-plan document was created or updated, and is clearly marked DRAFT.', kind: 'confirm', required: true },
    { id: 'openDecisionsListed', label: 'The draft lists every open decision the agent could not responsibly make on its own, specific enough for me to actually decide.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported what it actually investigated, plus any assumptions and unresolved conflicts it found.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I have read the full draft myself — not just the agent\'s summary of it.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Where did the Capstone document end up? (path, optional)', kind: 'text' },
  ],
  buildLayers(answers, freeText, ctx) {
    const delegatedTopics = delegatedTopicsFor(answers);

    const roleAndAuthority = [
      'You are acting as a drafting agent for a human who is designing an operating system for their own AI-assisted project, using a method called Zero-Trust Hierarchy.',
      'In this method, the human alone holds final authority: only the human ratifies a plan, decides acceptable tradeoffs, and authorizes what happens next. You may draft and propose; you may not ratify your own draft, and nothing you produce here becomes binding on your own say-so.',
      'You have permission to read the project\'s files to investigate current state, and to create or revise exactly one planning document as described below. You do not have permission to start implementation work.',
    ].join('\n');

    const stageObjective = 'Turn the raw idea and desired outcome captured earlier into a governing Capstone / project-plan draft: an observable outcome, a scope boundary, explicit non-goals, non-negotiable constraints, known risks, a falsifiable acceptance bar, and a complete list of the decisions still open for the human. The result is a draft for human review, not a finished, authoritative plan.';

    const humanIntent = buildHumanIntent(answers, freeText, ctx);

    const operatingMode = buildOperatingMode(ctx);

    const investigation = [
      baseInvestigation(ctx).join('\n'),
      delegatedInstruction(delegatedTopics),
    ].filter(Boolean).join('\n\n');

    const precedence = [
      'No governing document has been ratified for this project yet — this stage produces a draft, not an authority.',
      'Until ratification happens, treat sources in this order: (1) the human\'s structured answers quoted above, as the primary statement of intent; (2) what you actually verify in the project\'s current files, as the source of truth for any factual claim about what exists; (3) the carried-over Orientation answers quoted above, for continuity only — superseded immediately by (2) if they conflict with what you find.',
      'A newer-looking or longer file is not automatically more authoritative than an older one. Only the human\'s eventual, explicit ratification of a document confers that authority, and that has not happened yet.',
    ].join('\n');

    const task = [
      'Draft one Capstone / project-plan document for this project, visibly marked DRAFT at the very top, containing all of the following:',
      '1. The observable outcome — phrased as a checkable state a stranger could verify ("a user can do X in under Y"), not an activity ("build a dashboard") — grounded in the human\'s stated outcome above and sharpened if it is not yet checkable.',
      '2. An explicit in-scope boundary: what this round of work actually covers.',
      '3. An explicit out-of-scope / non-goals list, using the human\'s stated exclusions above plus any further boundary you judge necessary to name.',
      '4. The non-negotiable constraints stated above, reproduced clearly as hard limits.',
      '5. An acceptable-tradeoffs section: the human\'s stated tradeoffs, or — if delegated — your proposed tradeoff options with reasoning, clearly marked as proposals awaiting a human decision.',
      '6. A known-risks-and-unknowns section: the human\'s stated risks, or — if delegated — your investigated and proposed risk list, plus anything material you found during investigation that the human did not mention.',
      '7. A falsifiable acceptance bar: a condition specific and evidence-bound enough that it could fail under stated evidence. "Publish something good" is a goal, not a bar; the bar names exactly what "good" is checked against.',
      '8. The human\'s ranked quality priorities, stated explicitly, so a later reader knows what to optimize first when two priorities conflict.',
      '9. A complete, explicit list of every open decision this draft still needs the human to make before it could be treated as authoritative — anything you could not responsibly decide alone belongs here, not silently resolved in the document\'s body.',
      'Reconcile this draft against anything you found in existing planning documents during investigation rather than ignoring or overwriting it silently; if you find a genuine contradiction you cannot resolve yourself, add it to the open-decisions list instead of picking a side.',
    ].join('\n');

    const constraints = [
      quoteHumanInput('Non-negotiable constraints', answers.nonNegotiables),
      quoteHumanInput('Explicitly out of scope', answers.exclusions),
      'Do not begin implementation work of any kind at this stage — this stage produces one planning document only.',
      'Do not create, edit, or delete any other file in the project while doing this; your only file-system change this stage is creating or revising the one Capstone document described in Required deliverables.',
      'Do not silently expand scope beyond what is discussed above, even if you notice adjacent work that seems worth doing — name it in the open-decisions list instead.',
    ].filter(Boolean).join('\n');

    const artifactLine = answers.artifactLocation
      ? quoteHumanInput('Where the human wants this document to live', answers.artifactLocation)
      : 'The human did not specify a location. Choose a conventional, discoverable location for this kind of document within the project, and report the exact path you used in your terminal return.';

    const deliverables = [
      'One versioned planning document — a Capstone or project plan — visibly marked DRAFT at the top, containing every section listed in Exact task above.',
      artifactLine,
      'If a planning document, README section, or roadmap already exists that overlaps with this one, reconcile with it explicitly — reference it, do not duplicate it blindly — rather than creating a second, competing source of truth.',
    ].join('\n');

    const qualityGates = [
      'The observable outcome reads as a checkable state, not an activity.',
      'The acceptance bar is falsifiable — you can state a concrete condition under which it would NOT be met.',
      'In-scope and out-of-scope are both explicit and do not silently contradict each other.',
      'Every risk the human named appears, plus anything material you found during investigation.',
      'Every open decision is specific enough that the human could resolve it in one sentence — not a vague prompt like "confirm scope."',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not treat the human\'s silence on a topic as "no constraint" — if something matters and was not addressed, add it to the open-decisions list instead of guessing.',
      'Do not invent an acceptance bar stricter or looser than what the stated outcome and quality priorities actually support.',
      'Do not assume any existing planning document you find is stale or wrong merely because it is older — reconcile it, and if it conflicts, escalate rather than silently overriding it.',
      'Do not claim this draft is ratified, final, or ready for implementation — it is not, until the human explicitly says so in a later step of their own.',
      'Do not claim the project has version control, tests, or any other infrastructure you have not personally verified exists.',
    ].join('\n');

    const stopConditions = [
      'Stop and add to the open-decisions list — do not guess — if the stated observable outcome cannot be made falsifiable no matter how you rephrase it.',
      'Stop and add to the open-decisions list if an existing planning document contradicts the human\'s structured answers above in a way you cannot responsibly resolve yourself.',
      'Stop and flag it plainly if the project has no version-control system or documented equivalent yet — pretending otherwise would be dishonest, and later steps of this process assume one exists.',
      delegatedTopics.length ? `Stop and present options rather than deciding for the human on: ${delegatedTopics.join('; ')}.` : '',
    ].filter(Boolean).join('\n');

    const approvalBoundary = [
      'You may draft; only the human may ratify. Nothing you produce this stage is authoritative or binding, no matter how confident it reads.',
      'Keep the document labeled DRAFT throughout. Do not describe it as final, approved, or ready to build against.',
      'Present the open-decisions list plainly rather than pre-answering it — the human needs to see the actual decision, not a summary that already resolved it on their behalf.',
    ].join('\n');

    const terminalReturn = [
      'Done means: the Capstone / project-plan document exists at a reported path, is clearly marked DRAFT, and contains every section listed in Exact task above.',
      'Report exactly what you investigated — the files and directories you actually looked at — as evidence for the claims in the document, not just the conclusions.',
      'Report every assumption you made, every unresolved conflict you found (including any between this draft and an existing planning document), and the full open-decisions list, even if it feels repetitive with the document itself.',
      'If at any point you cannot establish which source has authority over a fact — for example two contradicting planning documents with no way to tell which is current — stop and report that instead of picking one and moving on.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'audit-current-draft',
      label: 'Audit the current draft for gaps',
      description: 'Use this instead of the primary prompt when a Capstone draft already exists and you want it critiqued against a real acceptance-bar standard, rather than redrafted from scratch.',
      buildLayers(answers, freeText, ctx) {
        const delegatedTopics = delegatedTopicsFor(answers);

        const roleAndAuthority = [
          'You are acting as an independent auditor of an existing draft Capstone / project-plan document for a human\'s own project, using a method called Zero-Trust Hierarchy.',
          'Your job is to find gaps and report them plainly — not to defend the draft, not to make it read as more finished than it is, and not to ratify it. Only the human ratifies a plan.',
          'You have permission to read the project\'s files and the existing draft. You do not have permission to start implementation work, and you should only edit the draft itself to fix something you can point to concrete evidence for.',
        ].join('\n');

        const stageObjective = 'Audit an existing Capstone / project-plan draft against the standard for a real acceptance bar — authorized, stable, and falsifiable, not a vague aspiration — and report every gap you find, each tied to a specific section of the draft.';

        const humanIntent = buildHumanIntent(answers, freeText, ctx);

        const operatingMode = buildOperatingMode(ctx);

        const investigation = [
          [
            'First, locate the existing Capstone / project-plan draft in the project — check the reported location in the completion-gate artifact path if one was given, and search conventional planning locations otherwise — and read it in full before auditing anything else.',
            ...baseInvestigation(ctx),
          ].join('\n'),
          delegatedInstruction(delegatedTopics),
        ].filter(Boolean).join('\n\n');

        const precedence = [
          'The existing draft is not authoritative merely because it exists — it is itself still unratified. Audit it against, in order: (1) the human\'s current structured answers quoted above; (2) what you verify directly in the project\'s files; (3) the draft\'s own prior wording, which may simply be out of date.',
          'A draft that reads confidently is not automatically a draft that is correct. Ground every finding in a specific mismatch you can point to, not a general impression.',
        ].join('\n');

        const task = [
          'Read the existing Capstone / project-plan draft in full, then check it section by section:',
          '1. Is the observable outcome genuinely a checkable state, or is it an activity dressed up as an outcome?',
          '2. Is the acceptance bar falsifiable — can you state a concrete condition under which it would NOT be met? If not, say so plainly.',
          '3. Are in-scope and out-of-scope both present, and do they avoid silently contradicting each other or the human\'s current exclusions above?',
          '4. Does every risk the human named above actually appear in the draft? Does your own investigation surface a material risk the draft is missing entirely?',
          '5. Is the open-decisions list complete and specific, or does it silently pre-answer something that is actually still open?',
          '6. Does the draft\'s tradeoff and priority framing match the human\'s current answers above, including anything delegated and since decided?',
          'For every gap you find, state exactly what is missing or wrong and what a stronger version would say instead — never just "needs more detail."',
        ].join('\n');

        const constraints = [
          quoteHumanInput('Non-negotiable constraints', answers.nonNegotiables),
          quoteHumanInput('Explicitly out of scope', answers.exclusions),
          'Do not rewrite the draft wholesale. Only edit a specific passage when you can point to the concrete evidence that makes the existing wording wrong; otherwise, propose the edit for the human to accept rather than making it silently.',
          'Do not begin implementation work of any kind — this is an audit, not a build.',
        ].filter(Boolean).join('\n');

        const deliverables = [
          'An audit report listing every gap found, each one tied to a specific section of the existing draft and to the evidence behind it.',
          'For each gap, a proposed fix or a proposed addition — clearly marked as a proposal, not applied silently unless it corrects a plain factual mismatch you can cite.',
          'If you find no gaps at all, say so explicitly and state what you checked to reach that conclusion, rather than leaving an empty report.',
        ].join('\n');

        const qualityGates = [
          'Every finding cites the exact section of the draft and the exact evidence — a human answer above, or something found in the project — that it rests on.',
          'The falsifiability check on the acceptance bar was actually performed, not assumed.',
          'Nothing in the draft was silently rewritten without a cited reason.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the draft is adequate just because it reads fluently — fluent and falsifiable are different properties.',
          'Do not assume a gap is acceptable because it is common in other projects\' plans — judge this draft against this project\'s stated intent.',
          'Do not claim to have audited a section you did not actually read in full.',
        ].join('\n');

        const stopConditions = [
          'Stop and report back — do not guess — if you cannot locate any existing Capstone / project-plan draft in the project at all.',
          'Stop and flag it clearly if auditing surfaces a conflict with a non-negotiable constraint — that is not a minor gap, it needs the human\'s attention first.',
          delegatedTopics.length ? `Stop and present options rather than deciding for the human on: ${delegatedTopics.join('; ')}.` : '',
        ].filter(Boolean).join('\n');

        const approvalBoundary = 'Your findings are proposals. Only the human decides which gaps to fix, how, and whether the revised draft is ready for their own ratification step.';

        const terminalReturn = [
          'Done means: a complete audit report exists, listing every gap (or explicitly stating none were found), each tied to cited evidence.',
          'Report exactly what you read and checked, every assumption you made, and every unresolved conflict — including any you could not settle yourself.',
          'If authority over a fact cannot be established — for example the draft and the project\'s actual files disagree and neither is clearly current — stop and report that rather than silently trusting one.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'resolve-conflicting-planning-docs',
      label: 'Resolve conflicting existing planning documents',
      description: 'Use this instead of the primary prompt when the project already has a README or existing plan that might assert answers the new draft would otherwise silently contradict.',
      buildLayers(answers, freeText, ctx) {
        const delegatedTopics = delegatedTopicsFor(answers);

        const roleAndAuthority = [
          'You are acting as a reconciliation agent for a human\'s own project, using a method called Zero-Trust Hierarchy.',
          'Your job is to surface and reconcile every contradiction between existing planning material and the human\'s current structured answers below — never to silently pick a winner on the human\'s behalf.',
          'You have permission to read the project\'s files. You do not have permission to delete, silently merge, or overwrite any existing document, and you do not have permission to start implementation work.',
        ].join('\n');

        const stageObjective = 'Find every existing document in the project that already asserts an outcome, scope boundary, constraint, or risk for this project, compare each one against the human\'s current structured answers below, and produce an explicit reconciliation — not a fresh draft that quietly ignores what already exists.';

        const humanIntent = buildHumanIntent(answers, freeText, ctx);

        const operatingMode = buildOperatingMode(ctx);

        const investigation = [
          [
            ...baseInvestigation(ctx),
            'Beyond the baseline checks above, be exhaustive about planning-shaped material specifically: search every documentation folder, every top-level file, and any comments or headers inside code that describe goals, scope, or requirements. Read each one you find in full before comparing anything.',
          ].join('\n'),
          delegatedInstruction(delegatedTopics),
        ].filter(Boolean).join('\n\n');

        const precedence = [
          'Precedence is never decided by recency or length alone. Treat sources in this order: (1) the human\'s current structured answers quoted above, as the freshest statement of intent; (2) what you verify directly in the project\'s files; (3) any existing planning document you find, as useful context that is not automatically authoritative merely by existing.',
          'Nothing here is ratified yet. Your job is to make every disagreement visible to the human, not to decide which source wins.',
        ].join('\n');

        const task = [
          '1. Search the project comprehensively for anything planning-shaped: README files, documentation or planning folders, and any other document that asserts an outcome, scope, constraint, or risk.',
          '2. Read each one you find in full.',
          '3. For each document, extract exactly what it asserts about outcome, scope, constraints, and risk.',
          '4. Compare each assertion against the human\'s current structured answers quoted above.',
          '5. Where they agree, note the agreement briefly — that is useful confirmation, not a finding that needs escalation.',
          '6. Where they conflict, do not silently prefer the newer-looking or longer document — record the conflict precisely: what the document says, what the human said, and where each came from.',
          '7. Where an existing document covers ground the human\'s current answers do not address at all, treat that as a genuine gap and add it to the open-decisions list too, rather than silently importing the old document\'s assumption as settled.',
          '8. Produce a reconciliation summary alongside — not replacing — the existing documents, referencing each one by path, so the human can see the full picture without anything having been deleted or overwritten.',
        ].join('\n');

        const constraints = [
          quoteHumanInput('Non-negotiable constraints', answers.nonNegotiables),
          quoteHumanInput('Explicitly out of scope', answers.exclusions),
          'Do not delete or silently overwrite any existing document. Do not merge multiple documents into one file unless the human has explicitly asked for that separately.',
          'Your job here is comparison and reporting, not consolidation, and not implementation.',
        ].filter(Boolean).join('\n');

        const deliverables = [
          'A reconciliation report covering every existing planning-shaped document found, referenced by path, stating what each one asserts.',
          'An explicit list of agreements, an explicit list of conflicts (each naming the document and the specific human answer it contradicts), and an explicit list of gaps neither source addresses.',
          'No existing document modified, merged, or deleted as part of producing this report.',
        ].join('\n');

        const qualityGates = [
          'Every conflict cites the exact document and the exact human answer it contradicts — not a vague "there might be a conflict."',
          'Every document found during investigation is accounted for in the report; none are silently skipped.',
          'No document was modified, merged, or deleted while producing this report.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the newest-looking document is correct — precedence is never decided by recency alone.',
          'Do not assume an older planning document is irrelevant just because a more recent conversation or draft exists.',
          'Do not assume the human has already seen or accounted for every existing document — that is exactly what this report is for.',
        ].join('\n');

        const stopConditions = [
          'Stop and surface everything together — do not resolve the easy conflicts and bury a serious one in the middle of a long report — if you find more than a small number of conflicts, or any conflict that touches a non-negotiable constraint.',
          'Stop and ask rather than guess if two existing documents contradict each other directly, independent of anything the human said.',
          delegatedTopics.length ? `Stop and present options rather than deciding for the human on: ${delegatedTopics.join('; ')}.` : '',
        ].filter(Boolean).join('\n');

        const approvalBoundary = 'Only the human decides which document — or which parts of each — should govern going forward. You are reporting the disagreement, not resolving it.';

        const terminalReturn = [
          'Done means: a complete reconciliation report exists, citing every planning-shaped document found by path, every conflict named precisely, and every gap listed.',
          'Report every assumption you made and anything you could not verify or resolve on your own.',
          'If authority over a fact cannot be established — for example two documents disagree with no way to tell which is current — stop and report that rather than picking one.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'The Capstone stage exists to turn a raw idea into the first artifact this whole method actually governs against: a plan with a real acceptance bar, not just a description of what someone hopes to build. Everything downstream — checkpoint decomposition, role contracts, the first execution — points back at this one document, so it earns the extra care of being drafted and reviewed as its own step rather than folded silently into a larger batch.',
    problemPrevented: 'Without a dedicated Capstone step, projects tend to skip straight from a vague idea to code, and the acceptance criteria stay implicit — living only in the original author\'s head. Implicit criteria cannot be checked by an agent, cannot be audited by a reviewer, and quietly drift every time someone remembers the goal slightly differently. This stage forces the outcome, scope, and bar into a form that can actually be checked and disagreed with.',
    judgmentVsInvestigation: 'Non-negotiable constraints and exclusions are pure human judgment — no amount of investigation tells an agent what you personally will not accept, so those two questions are never delegable here. Acceptable tradeoffs, known risks, and a reference example of "good" sit in a middle zone: a capable agent that actually investigates the project can propose a reasonable starting point for each, which is why those three carry the delegate option. Whether the project already has a competing plan, what its current file structure looks like, and whether version control exists are pure investigation — the prompt tells the agent to check, never asks the human to report them.',
    promptAnatomy: 'This prompt is heavier than Orientation\'s in three specific places: the Task layer enumerates nine required sections instead of leaving "draft a plan" open-ended, because a plan missing even one of those sections cannot support the stages built on top of it; the Precedence layer has to state explicitly that nothing is ratified yet, since this is the first stage where an agent could plausibly mistake its own draft for authoritative; and the investigation layer is where the same/fresh split matters most, because a fresh agent walking into an existing project with no memory of Orientation has to rediscover everything a same-conversation agent might otherwise (wrongly) assume still holds.',
    authorityBoundary: 'The agent operates entirely below the ratification line: it may read, propose, and write exactly one document, but it may not decide anything binding. The human is not yet formally wearing an Architect/Owner hat in the method\'s full sense — that becomes meaningful once there is a document to actually ratify or send back, which is the very next step after this one. Until then, this stage\'s output is advisory no matter how well-evidenced it is.',
    inputsAndSources: 'Primary input is the human\'s structured answers on this page, carried forward alongside the raw idea, desired outcome, and intended users recorded during Orientation. Secondary input is whatever the agent verifies directly in the project\'s files during investigation. No other source is authoritative at this stage — there is nothing else that could be, since no governance has been ratified yet.',
    outputsAndEvidence: 'One artifact: a Capstone / project-plan document, visibly marked DRAFT, at a path the agent reports back to you. The evidence you should look for in its terminal return is concrete: which files it actually opened, what it found (or didn\'t find) already governing the project, and a complete, specific open-decisions list — not just a confident-sounding document.',
    failureModes: [
      'Treating "draft" as a formality and writing the document as if it were already final, which makes it easy for a human to accept it without noticing what is still genuinely undecided.',
      'Writing an acceptance bar that restates the outcome in different words ("a great task app") instead of a condition that could concretely fail — this is the single most common way a plan looks complete while being unfalsifiable.',
      'Letting a fresh agent draft as if the project were empty when it actually contains a partial implementation or an existing README that already asserts a different scope.',
      'Quietly resolving a delegated question (tradeoffs, risks, or a reference example) by picking one option instead of presenting options and stopping for the human\'s decision.',
      'Burying the open-decisions list inside prose instead of making it a distinct, scannable section — a human skimming the draft should not have to hunt for what still needs them.',
    ],
    weakResultSigns: [
      'The "acceptance bar" section reads like marketing copy — "a delightful, robust experience" — rather than a specific, checkable condition.',
      'In-scope and out-of-scope overlap or contradict each other, or the exclusions list is missing entirely.',
      'The risk section only repeats what you already typed, with nothing added from actually looking at the project.',
      'The open-decisions list is empty or generic ("confirm this looks right") even though real judgment calls were clearly left unresolved.',
    ],
    customization: 'If your project is small enough that a full nine-item plan feels like overkill, say so honestly in the free-text field rather than forcing padded answers into every question — a thin, honest Capstone for a small project is more useful than an inflated one, and the Bootstrap stage later is exactly where "this might not need this much ceremony" gets a proper, non-judgmental answer.',
    whenToStop: 'Stop and revise your own answers, not just the agent\'s draft, if you notice the "observable outcome" you wrote still describes an activity rather than a checkable state, or if your non-negotiables and your quality-priority ranking quietly contradict each other (for example ranking speed-to-first-version highest while also listing an extremely strict non-negotiable that will slow everything down) — that tension is worth resolving before it ships to the agent, not after.',
    auditWithoutPasting: 'Open the reported artifact path yourself in your own editor or file browser and read it end to end — do not paste its contents back into this site. Check specifically: does every one of the nine required sections actually exist, does the acceptance bar name a condition that could fail, and does the open-decisions list contain real, specific, still-open questions rather than rhetorical ones.',
    weakVsStrongExample: {
      weak: '"Build a well-designed, high-quality note-taking app that people will love." — no observable outcome, no scope boundary, no falsifiable bar; "well-designed" and "people will love it" cannot be checked by anyone, including the person who wrote it.',
      strong: '"A single user can capture a note from a keyboard shortcut in under 2 seconds and find it again by full-text search within 5 seconds, for personal use only — no sync, no sharing, no mobile app in this round. I would rather ship this fast and rough than delay for a polished interface, but I will not accept losing a saved note under any circumstance."',
    },
  },
};
