import { quoteHumanInput } from '../compiler.js';

const PROJECT_STATE_HELP = 'A greenfield idea and a live codebase need different first moves — an existing project already has real constraints, prior decisions, and working code an agent must read before proposing anything.';
const AGENT_CAPABILITY_HELP = 'Every stage after this one asks an external agent to inspect and change real project files. A chat-only assistant with no file access cannot do that safely, so this answer decides whether later stages unlock yet.';

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'orientation',
  number: 1,
  title: 'Orientation & Operating Mode',
  purpose: 'Establish where your project actually stands and what kind of AI agent you have, before anything gets drafted.',
  agentProduces: 'Nothing durable yet. This stage only records your own decisions. Optionally, hand the generated prompt to any chat assistant — even one without file access — as a thinking partner to pressure-test your idea before you commit anything to the project.',
  prerequisites: [],
  requiresWorkspaceAgent: false,
  methodProvenance: {
    verified: [
      'The ten intake items below are adapted from the bootstrap payload in article.md §14 ("Bootstrap the hierarchy without self-ratification"), which instructs a setup agent to collect exactly this information — labeling every inference — before drafting anything.',
      'The distinction between the human\'s two hats (Owner ratifying purpose beforehand, courier/development-manager judging disposition afterward) comes directly from article.md §7 and RULEBOOK.md §2.',
    ],
    adapted: [],
    productDesign: [
      'Splitting orientation into its own stage, before any governance drafting begins, is this guide\'s product design — the source bootstrap collects all ten intake items in one agent turn. Unbundling it lets a beginner answer a few grounded questions at a time.',
      'The "no workspace agent yet" gate and the optional thinking-partner prompt are both this guide\'s addition, to satisfy the requirement that idea exploration stay possible before any file-based stage unlocks.',
    ],
  },
  questions: [
    {
      id: 'projectState',
      type: 'radio',
      label: 'Where does this project stand right now?',
      help: PROJECT_STATE_HELP,
      required: true,
      affectsPrompt: 'Carried into the Human intent layer of every later prompt as a project-state line: greenfield tells the agent to assume nothing exists but to report any mismatch it finds, existing tells it to treat the repository as ground truth to investigate before proposing.',
      options: [
        { value: 'greenfield', label: 'Greenfield — no code exists yet', description: 'You are starting from an idea, not an existing repository.' },
        { value: 'existing', label: 'Existing project', description: 'There is already a real codebase, even if it is small, messy, or partly finished.' },
      ],
    },
    {
      id: 'agentCapability',
      type: 'radio',
      label: 'What kind of AI agent do you have access to?',
      help: AGENT_CAPABILITY_HELP,
      required: true,
      affectsPrompt: 'Directly gates which stages unlock. Only "workspace-capable" opens the file-based stages; both "chat-only" and "none" leave this Orientation stage open for idea work but hold every later stage behind a gate, because those stages ask an agent to inspect the repository itself.',
      options: [
        { value: 'workspace', label: 'Workspace-capable', description: 'It can read and edit files directly in your project (for example a coding agent or CLI assistant running inside your repository).' },
        { value: 'chat', label: 'Chat-only, for now', description: 'You can talk to an AI assistant, but it cannot yet read or edit your project\'s files.' },
        { value: 'none', label: 'No AI agent yet', description: 'You have not connected an agent to your work.' },
      ],
    },
    {
      id: 'rawIdea',
      type: 'textarea',
      label: 'Describe the project in your own words.',
      help: 'An agent can infer a lot about code, but it cannot infer why you\'re building this or what you actually want — that has to come from you, in your own language, however rough.',
      required: true,
      placeholder: 'What are you building, or what does this existing project do?',
      affectsPrompt: 'Quoted verbatim into the Human intent layer of every generated prompt in this journey as the anchor description of the project.',
    },
    {
      id: 'primaryOutcome',
      type: 'textarea',
      label: 'What does success actually look like — the observable outcome, not the activity?',
      help: 'A goal like "make it good" cannot be checked by anyone. "A user can complete a purchase in under 3 clicks" can. This answer seeds the acceptance bar you\'ll sharpen in the Capstone stage.',
      required: true,
      placeholder: 'What would you (or a stranger) be able to see, use, or measure when this is genuinely done?',
      affectsPrompt: 'Feeds the observable-outcome framing used when the Capstone stage asks the agent to propose a falsifiable acceptance bar.',
    },
    {
      id: 'intendedUsers',
      type: 'text',
      label: 'Who is this for?',
      help: 'Even "just me" is a real answer and changes how much ceremony is worth it.',
      required: true,
      placeholder: 'e.g. just me, a small internal team, paying customers, the public',
      affectsPrompt: 'Used to frame the audience-appropriate quality bar in later stages.',
    },
    {
      id: 'riskTolerance',
      type: 'radio',
      label: 'How costly would a real mistake be here?',
      help: 'This method adds real overhead: independent review, durable evidence, explicit sign-offs. It earns its cost on work where an unsupported success claim is expensive. For a small reversible task, it may be overkill — later stages will ask you to confirm that honestly.',
      required: true,
      affectsPrompt: 'Calibrates how much governance ceremony every later stage proposes, and directly informs the FIT / FIT_WITH_REDUCED_PROFILE / NOT_FIT judgment in the Bootstrap stage.',
      options: [
        { value: 'low', label: 'Low stakes', description: 'Reversible, low-cost mistakes; speed matters more than ceremony.' },
        { value: 'medium', label: 'Medium stakes', description: 'Mistakes are annoying and cost real time, but recoverable.' },
        { value: 'high', label: 'High stakes', description: 'Mistakes are expensive, hard to reverse, or affect other people.' },
      ],
    },
    {
      id: 'autonomyPreference',
      type: 'radio',
      label: 'How much independent latitude do you want to give the agent doing the work?',
      help: 'This shapes the ceiling and the constraints in every checkpoint brief later — a tight leash means smaller checkpoints and more check-ins; high autonomy means larger bounded units with less frequent interruption.',
      required: true,
      affectsPrompt: 'Carried into the Human intent layer of every later prompt as a requested-latitude line, which widens or narrows the unit of work the agent proposes — explicitly without widening its authority or waiving any stop condition.',
      options: [
        { value: 'tight', label: 'Tight leash', description: 'Small steps, frequent check-ins.' },
        { value: 'balanced', label: 'Balanced', description: 'Meaningful bounded units, checking in at natural boundaries.' },
        { value: 'high', label: 'High autonomy', description: 'Large bounded units, minimal interruption until there is something real to review.' },
      ],
    },
  ],
  freeTextLabel: 'What should the agent understand about your intentions that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'reviewed', label: 'I\'ve reviewed my answers above and they reflect where this project actually stands.', kind: 'confirm', required: true },
  ],
  buildLayers(answers, freeText, ctx) {
    const hasAgent = answers.agentCapability && answers.agentCapability !== 'none';
    const roleAndAuthority = [
      'You are a thinking partner for a human who is about to design an operating system for an AI-assisted project, using a method called Zero-Trust Hierarchy.',
      'You hold no authority here: you do not own purpose, you do not ratify anything, and nothing you say in this conversation is binding. The human alone decides direction.',
    ].join('\n');

    const stageObjective = 'Help the human stress-test their raw idea — outcome, users, risk, scope — before they commit anything to a project. This is exploratory. Nothing you produce here is a deliverable or an artifact.';

    const humanIntent = [
      quoteHumanInput('Project state', answers.projectState === 'existing' ? 'Existing project' : 'Greenfield — no code yet'),
      quoteHumanInput('Raw idea', answers.rawIdea),
      quoteHumanInput('Desired observable outcome', answers.primaryOutcome),
      quoteHumanInput('Intended users', answers.intendedUsers),
      quoteHumanInput('Risk tolerance', { low: 'Low stakes', medium: 'Medium stakes', high: 'High stakes' }[answers.riskTolerance] || ''),
      quoteHumanInput('Desired agent autonomy', { tight: 'Tight leash', balanced: 'Balanced', high: 'High autonomy' }[answers.autonomyPreference] || ''),
      quoteHumanInput('Anything else the human wants understood', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = [
      ctx.mode === 'fresh'
        ? 'You are a fresh agent with no memory of any earlier conversation about this project. Unusually for this method, file access is optional here: this stage touches no file, so a chat-only assistant is a perfectly adequate partner for it. The human\'s project documents were deliberately not pasted into this prompt, and you should not ask for them.'
        : 'You may be continuing in a conversation that discussed this project earlier. This stage does not depend on that continuity — it touches no file and reads nothing — so treat any earlier context as background only.',
      hasAgent
        ? 'You are not being asked to inspect or change any file in this stage no matter which agent is being used.'
        : 'The human has no AI agent connected to their project yet. This conversation is pure discussion: do not propose file edits, and do not claim to have inspected any code.',
    ].join('\n');

    const investigation = 'None required. Do not ask the human to paste project files, and do not assume you have seen any part of the project — you have not.';

    const precedence = 'None yet — no governing documents exist for this project. Nothing you say here is authoritative; it only helps the human think.';

    const task = [
      'Discuss the idea with the human. Where useful, ask sharpening questions such as:',
      '- What would make this project clearly NOT worth building?',
      '- What is the smallest version of the observable outcome that would still be real?',
      '- Who is most likely to be disappointed by a mediocre result, and why?',
      'Offer an honest read on whether the stated outcome is actually observable/checkable, and suggest a sharper version if it is not.',
    ].join('\n');

    const constraints = 'Do not draft a project plan, checkpoint list, or any governance document — that happens in later, dedicated stages with the human\'s explicit involvement. Do not tell the human this conversation has "completed" any stage.';

    const deliverables = 'A clearer, human-reviewed version of the idea, outcome, and risk picture — held only in this conversation. Nothing is written to any file.';

    const qualityGates = 'None — this stage has no acceptance bar. Its only measure of success is whether the human leaves with a clearer picture.';

    const prohibitedAssumptions = 'Do not assume this project already has a name, repository, tech stack, or team beyond what the human told you. Do not invent constraints they did not state.';

    const stopConditions = 'Stop and ask if the human\'s stated outcome and stated risk tolerance seem to contradict each other (e.g. "high stakes" paired with "no real acceptance bar in sight") — surface that tension rather than smoothing over it.';

    const approvalBoundary = 'Everything here is the human\'s call. You are not asking for approval of anything because nothing you produce is binding.';

    const terminalReturn = 'End with a short plain-language summary of the idea, outcome, and any tension you noticed — nothing more formal than that.';

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [],
  advanced: {
    purpose: 'Orientation exists to separate two very different kinds of question before any document gets drafted: what does the human actually want (judgment, only the human can answer it), and what does the project actually contain (fact, only an investigating agent can answer it). Conflating these two is the single most common way early AI-assisted projects go sideways — an agent infers an agenda from a vague prompt and runs confidently in the wrong direction.',
    problemPrevented: 'Without this stage, the first real prompt a human writes tends to bury judgment calls (risk tolerance, who this is for, how much autonomy to grant) inside a wall of technical instructions, or skip them entirely and let the agent guess. Guessed judgment calls are invisible until they cause a costly wrong turn several stages later.',
    judgmentVsInvestigation: 'Everything in this stage is judgment: project state, agent capability, the raw idea, the desired outcome, who it is for, risk tolerance, and desired autonomy are all things only the human can state. There is nothing here for an agent to investigate, because no governing artifact exists yet for it to investigate against.',
    promptAnatomy: 'This stage\'s prompt is deliberately the thinnest in the whole journey: a role that explicitly holds no authority, an objective that is exploratory rather than deliverable-producing, and a terminal return that asks for a plain-language summary instead of a formal packet. That thinness is itself a design signal — later stages get much more structured once real governing documents exist to be precise about.',
    authorityBoundary: 'No authority tier is active yet. The human is not yet wearing the Architect/Owner hat in a formal sense — ratification only becomes meaningful once there is a document to ratify. This stage exists below and before the hierarchy, not inside it.',
    inputsAndSources: 'The only input is what the human types into the questions and free-text field. There is no project state to read yet, and the prompt explicitly tells the agent not to assume otherwise.',
    outputsAndEvidence: 'None. This is the one stage in the journey with no artifact and no evidence expectation — its output is a clearer human mental model, which is inherently not machine-checkable.',
    failureModes: [
      'Skipping straight to a technical prompt without settling risk tolerance or autonomy first, so later checkpoints get sized wrong (too small and tedious, or too large and unreviewable).',
      'Treating "greenfield" and "existing project" as interchangeable — an existing project has real constraints an agent must discover, and skipping that discovery produces a Capstone that contradicts the actual code on day one.',
      'Letting an agent draft governance off a single vague sentence instead of using this stage to sharpen the outcome into something checkable first.',
    ],
    weakResultSigns: [
      'The stated "observable outcome" is actually an activity ("build a dashboard") rather than a checkable state ("a manager can see last week\'s revenue in under 5 seconds").',
      'Risk tolerance and autonomy preference were picked without thinking, and get silently revised two stages later once real stakes become clear — better to catch that tension now.',
    ],
    customization: 'If your project genuinely has no meaningful error cost and no versioned artifact worth defending (a one-off script, a throwaway prototype), say so honestly in the free-text field — the Bootstrap stage later will most likely return NOT_FIT, and that is a correct, useful outcome, not a failure of this method.',
    whenToStop: 'Stop and reconsider before continuing if you notice you\'re answering these questions the way you think an impressive project should look, rather than how your actual project is. The rest of the journey compounds whatever you establish here.',
    auditWithoutPasting: 'There is nothing to audit yet — no artifact exists. The only check available to you is whether your own answers still feel true after you\'ve written them down. If they don\'t, revise them before moving on; nothing downstream is locked in until you complete a stage\'s disposition.',
    weakVsStrongExample: {
      weak: '"Build me a task app." — no observable outcome, no named user, no sense of what would make it done or good.',
      strong: '"A single user can capture a task from voice input in under 5 seconds and see it appear in their daily list — built for myself first, low stakes, I want to move fast and I\'m comfortable giving the agent a lot of latitude."',
    },
  },
};
