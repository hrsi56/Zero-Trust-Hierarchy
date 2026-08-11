import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const AGENT_PLATFORM_HELP = 'Role contracts eventually have to become real configuration — persistent instructions, project rules, a custom command or subagent definition — inside whatever you actually use. Name it now so the agent proposes configuration that is real for your setup, not generic advice.';
const SINGLE_AGENT_HELP = 'This decides whether the contracts need built-in role-switch discipline (an explicit "which role is this conversation acting as right now" statement, plus a rule for starting a genuinely new conversation when the role changes) or can instead assume the tool boundary already keeps roles apart.';
const ROLES_NEEDED_HELP = 'Even a tiny solo project usually keeps all five as separate conversations or context resets with one human and one AI tool — the separation is about fresh context and role discipline, not headcount. Only thin this out for a specific, considered reason; when in doubt, keep all five and let the agent tell you honestly if that is more ceremony than this project needs.';

const ROLE_LABELS = {
  orchestrator: 'Orchestrator',
  engineeringLead: 'Engineering Lead',
  builder: 'Builder(s)',
  componentCritic: 'Component Critic',
  integrationCritic: 'Integration Critic',
};

const TOOL_MAPPING_LABELS = {
  'rotating-single-tool': 'One AI tool, rotating through all five roles across separate conversations',
  'multiple-tools': 'Different AI tools used for different roles',
  unsure: 'Not sure yet — wants the agent to propose a mapping',
};

/** Reproduced inline, generically, so the generated prompt is self-contained for the receiving agent. */
const ROLE_DEFINITIONS = [
  '- Architect/Owner (the human): owns purpose, ratifies every governing document, decides acceptable tradeoffs, and is the only one who can decide to keep or discard a finished piece of work. After a bounded unit of work comes back, this same person also acts as the courier and judge who reviews it and decides what happens next — one person, two hats, never two authority tiers.',
  '- Orchestrator: owns what gets worked on, when, and against which exact ratified reference. It issues one bounded unit of work at a time with a numeric time or effort ceiling, tracks durable state across the project, and checks that a returned result is complete and honestly reported. It does not decide how the work gets built, does not inspect source code line by line, does not rerun tests, and does not read anyone else\'s private scratch work.',
  '- Engineering Lead: owns how the work gets built — architecture, tool choices, breaking work into pieces, assigning pieces to Builders, and is the sole writer of the shared, integrated version of the work. It computes whether an earlier review result is still valid or has gone stale, and returns exactly one final report per bounded unit of work. It may not weaken the acceptance bar, may not give itself a larger time or effort ceiling, may not publish or finalize the work, may not decide to keep or discard it, and may not start the next unit of work on its own.',
  '- Builder(s): implements one Lead-assigned piece inside an exact, named boundary of what it is allowed to touch. It never grades its own work and never writes the verdict on whether its own output is acceptable.',
  '- Component Critic: reviews one piece against the acceptance bar, in a fresh conversation that has not seen the Builder\'s reasoning, private notes, or unfiltered account of what it did. It works out whether the bar is met independently rather than trusting the Builder\'s claim, and may use Builder-written tests only as extra evidence, never as the whole check. It reports pass, fail, or blocked, with evidence and exactly one largest remaining gap — or an explicit statement that the bar is met.',
  '- Integration Critic: a different fresh conversation — not the Component Critic, not the Engineering Lead — that reviews the complete assembled result, plus whether every component verdict it depends on is still current, before the whole unit of work can be considered acceptable.',
].join('\n');

const FRESH_CONTEXT_NOTE = '"Fresh" in these role definitions means a new conversation or context reset with no memory of a prior conversation\'s claims — a cooperative procedural control the team agrees to follow, not a cryptographic or operating-system-level sandbox. An ordinary project workspace or a new chat window enforces this only because everyone respects the boundary; say so plainly in every contract rather than implying stronger technical isolation than actually exists.';

const PRECEDENCE_TEXT = [
  'When sources conflict, this order governs: (1) the project\'s ratified root rulebook, (2) durable project state naming the exact ratified plan or checkpoint in force, (3) the specific plan section containing the current acceptance bar, (4) the role contract you are drafting or repairing here, (5) other planning documents or maps, (6) the verified actual state of the repository, environment, or data.',
  'A file that looks newer or longer is not automatically authoritative — only the human Owner\'s explicit ratification confers authority. If the rulebook conflicts with anything else you find, the rulebook wins unless the human tells you otherwise in this conversation.',
].join('\n');

// The rule is about *tiers*, not about a forbidden word. The method itself calls the human's
// second hat the "human courier / development-management function" (RULEBOOK.md §2, Tier 0), so
// banning that phrase outright would contradict the vocabulary a user meets in the source. What
// must never appear is a new autonomous authority tier — an agent role that holds authority of
// its own between the ones already defined.
const NO_NEW_TIER_LINE = 'Do not invent an authority tier beyond the ones named above. Specifically: no new agent role that holds authority of its own, under any title — "Development Manager," "Coordinator," "Reviewer-in-Chief," or anything similar. Note that this is a rule about tiers, not about wording: the method does describe the human\'s own second hat, after a return, as a development-management function, and that is the same person as the Owner wearing a second hat, not a seventh role. If you feel a gap that seems to need another role, that is a sign the gap belongs inside one of the existing contracts, or needs to go back to the human — never a new tier.';

const CONTRACT_IS_BEHAVIOR_LINE = 'A role contract is a set of behavioral obligations imposed on whichever agent or conversation picks up that role for this project — it is not a separate login, account, or piece of software. Do not write contracts as if "the Orchestrator" is a different product from "the Engineering Lead"; they may be the very same AI tool wearing a different hat in a different conversation.';

function operatingModeText(fresh, continuityNote) {
  return fresh
    ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
    : `You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn. That continuity does not excuse skipping verification here: ${continuityNote}`;
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'roles',
  number: 7,
  title: 'Roles & Agent Configuration',
  purpose: 'Define the role contracts — Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic — and any platform-specific agent configuration files this project needs, without inventing new authority tiers.',
  agentProduces: 'Role contracts for each of the five execution roles, scoped to this project, plus any platform-specific configuration files (for example persistent instructions for whichever coding agent tool the human uses) that encode those boundaries.',
  prerequisites: ['rulebook'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The five execution roles (Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic) and their ownership and prohibition boundaries — including that the Orchestrator never inspects source or reruns tests, the Engineering Lead never publishes or lands work, Builders never grade their own output, and both Critics work from fresh, previously uninvolved contexts — are the tier definitions in RULEBOOK.md §2, "Authority and roles" (Tier 0 through Tier 3).',
      'The framing of fresh-context review, read-only behavior, and withheld Builder narrative as cooperative procedural controls, rather than OS-level or cryptographic sandboxing, is stated in article.md §9 ("These are cooperative controls, not a claim of operating-system isolation") and again in the bootstrap payload in §14, and is preserved in this stage\'s generated prompt.',
      'That the governing documents "do not form another autonomous agent tier," and that the human\'s own second hat below the Orchestrator is two hats worn by one person rather than a separate authority tier, is stated in RULEBOOK.md §2 under Tier 0 — which is the basis for this stage\'s rule that a gap must be resolved inside an existing contract or returned to the human rather than by adding a tier.',
    ],
    adapted: [
      'The requirement that a Builder\'s implementation and a Critic\'s verdict come from genuinely separate agents or contexts, so the Critic judges the actual artifact rather than the Builder\'s account of it, is adapted from the Gauntlet Loop\'s inner build/critique pattern; the NOTICE file in this repository credits Matt Shumer\'s Gauntlet Loop as the inner execution pattern that Zero-Trust Hierarchy\'s surrounding authority system wraps around.',
    ],
    productDesign: [
      'The three structured questions in this stage — which AI tool(s) will run these roles, whether one tool will rotate through roles across separate conversations, and which roles are worth keeping distinct for this project\'s size — are this guide\'s own editorial framing. The source method does not ask a human these specific structured questions; it assumes role separation and has a setup agent draft contracts directly.',
      'Folding a "which roles are worth keeping distinct" question into this stage, with a strong help-text reminder that even a tiny solo project usually keeps all five as separate conversations, is this guide\'s own design choice meant to head off a common misreading — that role count should scale down with team headcount. The source method treats the five roles as structural, not proportional to team size, but does not phrase it as a question with this exact escape hatch.',
      'Naming "Development Manager" and "Coordinator" as example titles to avoid, and repeating the no-new-tier rule in several separate layers of each generated prompt — Exact task, Constraints, Prohibited assumptions, and again in Stop-and-escalate conditions — is this guide\'s own editorial redundancy against one common failure mode. The underlying rule (RULEBOOK.md §2: governing documents "do not form another autonomous agent tier") is verified method content; the example titles are not the source method\'s wording, and the source in fact uses "development-management function" for the human\'s own second hat, which is why this stage says so explicitly rather than banning the phrase.',
    ],
  },
  questions: [
    {
      id: 'agentPlatform',
      type: 'text',
      label: 'Which AI tool(s) will actually run these roles?',
      help: AGENT_PLATFORM_HELP,
      required: true,
      placeholder: 'e.g. a single coding-agent CLI, a chat assistant plus a separate coding tool, two different agent products',
      affectsPrompt: 'Quoted into the Human intent layer and used to scope which platform-specific configuration files the agent proposes; if the named tool cannot support persistent instructions, the agent is told to surface that limitation rather than fake it.',
    },
    {
      id: 'singleAgentReality',
      type: 'radio',
      label: 'Will one AI tool play multiple roles, will different tools be used per role, or are you not sure yet?',
      help: SINGLE_AGENT_HELP,
      required: true,
      affectsPrompt: 'Branches the Exact task layer: a single rotating tool gets explicit role-declaration and fresh-context rules baked into every contract; separate tools per role get a tool-to-role mapping instead; "not sure" tells the agent to propose a mapping and pause for a decision.',
      options: [
        { value: 'rotating-single-tool', label: 'One AI tool, rotating through roles across separate conversations', description: 'The same product acts as Orchestrator in one conversation, Engineering Lead in another, and so on.' },
        { value: 'multiple-tools', label: 'Different AI tools for different roles', description: 'For example one tool for planning and orchestration, a separate one for implementation and review.' },
        { value: 'unsure', label: 'Not sure yet', description: 'Ask the agent to propose a reasonable mapping and pause for your decision.' },
      ],
    },
    {
      id: 'rolesNeeded',
      type: 'checkbox',
      label: 'Given this project\'s size, which roles are worth keeping as genuinely distinct conversations?',
      help: ROLES_NEEDED_HELP,
      required: true,
      affectsPrompt: 'Sets which of the five role contracts the agent frames as genuinely separate conversation-discipline versus which (if any) the human deliberately chose to combine; selecting the delegate option tells the agent to investigate project size and complexity and propose a role set with tradeoffs instead of assuming one.',
      options: [
        { value: 'orchestrator', label: 'Orchestrator' },
        { value: 'engineeringLead', label: 'Engineering Lead' },
        { value: 'builder', label: 'Builder(s)' },
        { value: 'componentCritic', label: 'Component Critic' },
        { value: 'integrationCritic', label: 'Integration Critic' },
      ],
      allowDelegate: true,
    },
  ],
  freeTextLabel: 'What should the agent understand about your roles or tooling setup that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'investigated', label: 'The agent read the actual current rulebook and repository (or existing configuration files) directly, rather than relying on my summary of what they say.', kind: 'confirm', required: true },
    { id: 'contractsCreated', label: 'A written contract exists for each of the five execution roles, and any needed platform configuration file(s) were created or revised.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported what it verified, what it assumed, and any unresolved conflicts with the existing rulebook — not just a claim of success.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I\'ve reviewed the drafted contracts and configuration myself before treating any of it as ratified.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the role contracts / configuration files (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';
    const platform = (answers.agentPlatform || '').trim();
    const toolMappingLabel = TOOL_MAPPING_LABELS[answers.singleAgentReality] || '';

    const rolesSelected = Array.isArray(answers.rolesNeeded) ? answers.rolesNeeded : [];
    const delegatedRoles = rolesSelected.includes(DELEGATE_VALUE);
    const chosenRoleLabels = rolesSelected.filter((v) => v !== DELEGATE_VALUE).map((v) => ROLE_LABELS[v]).filter(Boolean);

    const roleAndAuthority = [
      'You are acting in an Engineering-Lead-like drafting capacity to help the human Architect/Owner author role contracts and, where useful, platform configuration for their own project. Drafting is all you are authorized to do here: you propose contract language and configuration; only the human Owner reviews and ratifies it as governing.',
      'Role contracts and agent/platform configuration are part of this project\'s protected governance material. Once the human ratifies them, no agent executing later work — in any role — may quietly rewrite them just because a future checkpoint would be easier with looser boundaries. A genuinely needed change stops work and returns to the human instead of being self-authorized.',
    ].join('\n');

    const stageObjective = 'Produce one role contract for each execution role this project will keep distinct, plus any platform configuration file(s) needed to make those boundaries real in the AI tool(s) the human actually uses — without inventing any role or authority tier beyond the six defined below.';

    const humanIntent = [
      quoteHumanInput('AI tool(s) that will run these roles', platform),
      quoteHumanInput('How roles map onto tools', toolMappingLabel),
      chosenRoleLabels.length
        ? quoteHumanInput('Roles the human wants kept as genuinely distinct conversations', chosenRoleLabels.join(', '))
        : '',
      delegatedRoles
        ? 'The human is unsure which roles are worth keeping distinct for a project this size, and asked you to investigate and propose a role set with tradeoffs instead of assuming one (see Exact task below).'
        : '',
      quoteHumanInput('Anything else the human wants understood about their roles or tooling setup', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = operatingModeText(
      fresh,
      'verify the rulebook\'s actual current, saved content directly from the project files before drafting anything — a prior conversation\'s summary of what it decided is not evidence of what is on disk now.',
    );

    const investigation = fresh
      ? [
          'This is a fresh conversation with no memory of any earlier discussion about this project, so verify everything from scratch rather than trusting anything asserted below as already true:',
          '- Read the project\'s ratified rulebook (or equivalent governing document) in full, directly from the repository — do not proceed from a summary or from what this prompt claims about it.',
          '- Inventory the actual project: languages, frameworks, repository layout, existing tests or CI, and rough size and complexity, since role contracts should be scoped to a project this size, not a generic template.',
          '- Search the repository for any pre-existing role-contract or agent/platform-configuration files (for example a persistent-instructions file for a coding agent) and read them completely before proposing anything, so you revise deliberately instead of silently overwriting prior decisions.',
          '- Confirm there is no unratified or ambiguous draft of the rulebook or role contracts being treated as if it were already governing.',
          'If the rulebook cannot be found, is ambiguous, or contradicts itself on any role boundary, stop and report that rather than guessing a resolution.',
        ].join('\n')
      : [
          'Even though this continues the same conversation, re-verify rather than assume:',
          '- Open and read the rulebook\'s current, saved content directly — confirm it still says what you believe it says.',
          '- Confirm the project\'s actual current stack and structure; do not rely on an earlier turn\'s description if the repository could have changed since.',
          '- Check whether any role-contract or platform-configuration files already exist so you revise them deliberately rather than overwrite them silently.',
          'If anything here contradicts what you find on disk, the disk wins — say so and reconcile it before drafting.',
        ].join('\n');

    const precedence = PRECEDENCE_TEXT;

    const task = [
      'This project is adopting a method that assigns work to six roles and never lets one role\'s claim about itself count as another role\'s decision. Use exactly these six roles — do not add, rename, or merge in a new coordinating role:',
      ROLE_DEFINITIONS,
      FRESH_CONTEXT_NOTE,
      'For each of the five execution roles (Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic), write a contract stating: what it owns, an explicit list of what it may never do, what counts as "done" for the thing it hands upward, and what it must never treat as true just because another role claimed it.',
      delegatedRoles
        ? 'The human was unsure which roles are worth keeping genuinely distinct for a project this size. Investigate the project\'s actual scope and complexity, then propose which of the five roles to keep as fully separate conversations versus which, if any, could reasonably share a conversation with strict role-switch discipline, with the tradeoffs of each option, and pause for the human\'s decision before finalizing contracts. Default to recommending all five distinct unless you find a specific, stated reason this project is small enough to justify combining any.'
        : chosenRoleLabels.length
          ? `The human decided to keep these roles as genuinely distinct conversations: ${chosenRoleLabels.join(', ')}. Still draft a full contract for every one of the five roles listed above — a role that is not being kept as a separate conversation right now still needs a written contract, because the human may split it out later, and because even a combined conversation needs to know what each hat is and is not allowed to do while wearing it.`
          : '',
      answers.singleAgentReality === 'rotating-single-tool'
        ? 'Because one AI tool will rotate through multiple roles across separate conversations, build role-switch discipline into every contract: require the conversation to state, at its start, which single role it is acting as right now; forbid it from silently acting as a different role mid-conversation; and require starting a genuinely new conversation (not just a new message) whenever the role changes, especially before either Critic role begins its review.'
        : answers.singleAgentReality === 'multiple-tools'
          ? 'Because different AI tools will be used per role, include a short mapping table in your output naming which of the AI tool(s) named above in Human intent is responsible for which of the five roles, and flag plainly any role you cannot map to a stated tool.'
          : 'The human is not sure yet how roles will map onto tools. Propose a reasonable mapping based on the tool(s) named above in Human intent, explain the tradeoffs of a single rotating tool versus multiple tools, and pause for the human\'s decision before finalizing platform configuration.',
      'Draft any platform-specific configuration file(s) needed to make these boundaries operative in the AI tool(s) named above in Human intent — for example a persistent-instructions file, a project-level rules file, or a custom command or subagent definition, whichever mechanism that tool actually supports. If the named tool has no mechanism for persistent instructions or role-scoped configuration, say so explicitly instead of fabricating one.',
    ].filter(Boolean).join('\n\n');

    const constraints = [
      NO_NEW_TIER_LINE,
      CONTRACT_IS_BEHAVIOR_LINE,
      'Do not rewrite the rulebook itself in this stage. If drafting a role contract surfaces a real conflict with the rulebook, report the conflict — do not silently resolve it by editing governing material you were not asked to touch.',
    ].join('\n');

    const deliverables = [
      'One written contract per execution role, covering all five roles listed above, each stating what it owns, what it may never do, what "done" means for its handoff, and what evidence or artifact it must produce.',
      'Platform configuration file(s) matched to the AI tool(s) named above in Human intent, making the relevant boundaries operative where that is mechanically possible, plus an explicit note wherever it is not.',
      'A short mapping note describing how the human\'s actual AI-tool setup maps onto the five roles: a single rotating tool with role-switch discipline, multiple tools with a named mapping, or a proposed mapping pending the human\'s decision.',
    ].join('\n');

    const qualityGates = [
      'Each contract must be checkable: a stranger reading only the contract text should be able to tell whether a specific past action — for example "the Builder decided its own work passed" — violated it.',
      'No contract may grant one role a power reserved to a different role (for example the Engineering Lead publishing or finalizing work) or reserved to the human Owner (ratifying documents, deciding to keep or discard finished work).',
      'Every contract must state its role\'s fresh-context or evidence obligations, where applicable, using the cooperative-procedural framing above rather than implying a technical sandbox that does not exist.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume the human has separate paid tools or accounts for each role just because there are five roles — role separation is about separate conversations and context resets, not separate subscriptions, unless the human\'s own answer says otherwise.',
      'Do not assume any configuration file you find already in the repository is already ratified just because it exists — treat it as a prior draft to read and reconcile, not as settled fact, unless the rulebook or the human confirms it.',
      'Do not assume a role the human did not explicitly list as "kept distinct" has been eliminated from the method — it still needs a written contract; only its conversation-separation is in question, never its existence.',
      NO_NEW_TIER_LINE,
    ].join('\n');

    const stopConditions = [
      'Stop and return to the human, rather than guessing, if: the rulebook is missing, ambiguous, or internally contradictory about any of these role boundaries; you find yourself wanting to grant one role a capability that belongs to another; the named platform cannot actually support a boundary you were about to configure; or authority over some specific decision genuinely cannot be resolved from the rulebook plus this conversation.',
      'If you catch yourself about to write a new agent role that holds authority of its own — a "Development Manager," a "Coordinator," or any additional tier of any name — stop; that is out of scope regardless of how convenient it would be. Describing the human\'s own post-return hat as a development-management function is not that, and is fine.',
    ].join('\n');

    const approvalBoundary = 'Everything you draft in this stage is a proposal until the human Owner reviews and explicitly ratifies it. Do not treat any contract as already in force, do not act under a role\'s authority as if it were already granted, and do not connect, install, or configure any live tool integration (accounts, hooks, credentials) without the human\'s explicit go-ahead stated in this conversation.';

    const terminalReturn = [
      '"Done" for this stage means: a written contract exists for each of the five execution roles; any platform configuration file(s) needed for the named tool(s) exist in draft form, or their impossibility is explicitly documented; and each contract is self-contained enough that someone unfamiliar with this conversation could apply it without further explanation.',
      'Report exactly what you created or changed (paths), what you verified about the current rulebook and repository state and how — not just a claim — any assumptions you made and why, any unresolved conflicts between this output and the existing rulebook, and any role or platform boundary you could not resolve. Stop there for the human\'s review rather than proceeding to use any of these contracts on real work.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'repair-unclear-authority',
      label: 'Repair a role contract with unclear authority',
      description: 'Use instead of the primary prompt when one existing role contract is vague about what it owns versus what it is forbidden from doing, and that vagueness has already let a role drift outside its boundary in practice.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const platform = (answers.agentPlatform || '').trim();
        const toolMappingLabel = TOOL_MAPPING_LABELS[answers.singleAgentReality] || '';

        const roleAndAuthority = [
          'You are acting in an Engineering-Lead-like capacity to repair one existing role contract for the human Architect/Owner\'s project — not to draft new contracts from scratch and not to rewrite every contract in the set. You hold no authority to ratify the repair; the human Owner alone does that.',
          'The contract you are repairing is part of this project\'s protected governance material. Do not let this repair spill into rewriting the rulebook or any other role\'s contract without explicitly flagging that as a separate, unresolved item.',
        ].join('\n');

        const stageObjective = 'Find the specific ambiguity in one existing role contract that has let its boundary blur in practice, and rewrite only that contract so its ownership and its prohibitions are both unambiguous — without inventing a new role or authority tier to paper over the gap.';

        const humanIntent = [
          quoteHumanInput('AI tool(s) in use', platform),
          quoteHumanInput('How roles map onto tools', toolMappingLabel),
          quoteHumanInput('Where the human believes the ambiguity or drift happened, in their own words (if provided)', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-read the actual contract you are repairing, and the rulebook, directly from the project files before touching anything — do not rely on what an earlier turn in this conversation claimed the contract says.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Read the ratified rulebook in full, directly from the repository.',
              '- Read every existing role contract, not just the one you are repairing, so your fix does not accidentally duplicate or contradict authority already assigned elsewhere.',
              '- Look for concrete evidence that the ambiguity has already caused drift — for example a prior report, log, or note where a role did something the contract\'s vague wording made possible but should not have allowed. If the human\'s free text names a specific instance, verify it against the actual project state rather than taking the account at face value.',
              '- Confirm which single contract is actually in question; if it is unclear which of the five, stop and ask rather than guessing.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-read the specific contract\'s current, saved wording directly — do not repair from memory of drafting it.',
              '- Re-read the rulebook and the other four role contracts to confirm your fix will not create a new overlap while closing the old ambiguity.',
              '- Confirm any evidence of drift the human mentions is still accurate against the current state of the project, not just true of an earlier moment in this conversation.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Locate the exact role contract the human means — from their free text, or by finding the contract whose wording is genuinely ambiguous about ownership versus prohibition. Quote the ambiguous sentence or section back in your report; do not silently rewrite without showing what was wrong.',
          'Explain concretely how the ambiguity let, or could let, the role act outside its intended boundary — tie the explanation to exactly one of the six role definitions below, never to a role you are inventing:',
          ROLE_DEFINITIONS,
          FRESH_CONTEXT_NOTE,
          'Rewrite only the ambiguous contract so that what it owns and what it is explicitly forbidden from doing are both stated as checkable sentences — a fresh reader should be able to test a specific hypothetical action against the rewritten text and get an unambiguous answer. Leave every other role\'s contract untouched unless the repair genuinely requires a one-line cross-reference update, which you must call out explicitly rather than bundle in silently.',
        ].join('\n\n');

        const constraints = [
          NO_NEW_TIER_LINE,
          CONTRACT_IS_BEHAVIOR_LINE,
          'This is a targeted repair, not a rewrite of the whole role set. If you find the same kind of ambiguity in more than one contract, say so explicitly and recommend the human run a role/authority-overlap audit next, rather than silently expanding the scope of this repair.',
        ].join('\n');

        const deliverables = 'A repaired version of the one contract in question, plus a short note quoting the original ambiguous wording, explaining what was unclear, how the fix resolves it, and why the fix does not create a new overlap with any of the other four contracts.';

        const qualityGates = [
          'The repaired contract must be checkable: a stranger should be able to test a specific hypothetical action against it and get an unambiguous answer about whether it was in bounds.',
          'The repair must not grant the repaired role any power reserved to another role or to the human Owner, even implicitly, as a side effect of closing the original ambiguity.',
          'The repair must not depend on a new role, title, or coordinating function that does not already exist in the six-role set.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the whole contract set is broken because one contract was ambiguous — repair only what evidence supports.',
          'Do not assume the ambiguity was intentional or that it reflects some unstated rule the human has in mind; ask if the intended boundary is genuinely unclear from the rulebook and this conversation.',
          NO_NEW_TIER_LINE,
        ].join('\n');

        const stopConditions = 'Stop and return to the human if fixing this one contract turns out to require changing another role\'s contract or the rulebook itself, if the same kind of ambiguity appears in more than one contract (a systemic issue, not a local one), or if you cannot determine the intended boundary from the rulebook plus this conversation without guessing. If the fix you are drafting would only work by adding a new authority tier — a "Development Manager," a "Coordinator," or any agent role beyond the ones defined above — stop; the ambiguity needs a narrower fix inside an existing contract, not a new tier.';

        const approvalBoundary = 'The repaired contract is a proposal until the human Owner reviews and explicitly ratifies it. Do not treat the repair as already in force, and do not use it to justify any role acting with expanded authority in the meantime.';

        const terminalReturn = [
          '"Done" for this recovery means: the one ambiguous contract has been rewritten so its ownership and prohibitions are both checkable; the original ambiguous wording and the fix are both quoted in your report; and no new role or authority tier was introduced.',
          'Report the exact change (path and what changed), the evidence of prior drift you found or the human\'s account you relied on, any cross-contract impact you identified and left for the human to decide, and stop there for review.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'audit-role-overlap',
      label: 'Audit for role/authority overlap between two contracts',
      description: 'Use instead of the primary prompt when two role contracts seem to grant the same power to two different roles — for example both the Orchestrator and the Engineering Lead appear able to decide when a checkpoint is finished — and you need the overlap located and resolved.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const platform = (answers.agentPlatform || '').trim();
        const toolMappingLabel = TOOL_MAPPING_LABELS[answers.singleAgentReality] || '';

        const roleAndAuthority = [
          'You are acting as an independent auditor of this project\'s existing role contracts, on behalf of the human Architect/Owner. You hold no authority to change anything unilaterally — you locate and explain overlaps, propose the minimal resolution, and stop for the human\'s decision.',
          'The contracts under audit are part of this project\'s protected governance material. Your output is a proposed resolution, not an applied change, until the human ratifies it.',
        ].join('\n');

        const stageObjective = 'Compare the project\'s existing role contracts against each other and against the six-role definition below, find every place two contracts appear to grant the same power to two different roles or contradict the precedence order, and propose the minimal rewrite that resolves each overlap without adding a new role.';

        const humanIntent = [
          quoteHumanInput('AI tool(s) in use', platform),
          quoteHumanInput('How roles map onto tools', toolMappingLabel),
          quoteHumanInput('Which contracts the human suspects overlap, or what prompted the concern, in their own words (if provided)', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-read every existing role contract and the rulebook directly from the project files before comparing anything — do not audit from memory of what was drafted earlier in this conversation.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Read the ratified rulebook in full, directly from the repository, and note its precedence rules and any authority statements it makes about specific roles.',
              '- Read every existing role contract in full — not just the two the human suspects, since an overlap involving a third contract is easy to miss if you only compare a named pair.',
              '- For each pairing of contracts, list the specific powers or decisions each one claims, so overlaps are found by direct comparison rather than impression.',
              '- Check whether any contract quietly claims a power reserved to the human Owner (ratification, or deciding to keep or discard finished work) — this is a distinct and more serious category of overlap than two execution roles overlapping with each other.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-read every existing contract\'s current, saved wording directly, including any not named by the human, since an overlap can involve a contract nobody flagged.',
              '- Re-read the rulebook to confirm its precedence rules have not changed since you last referenced them in this conversation.',
              '- Confirm the specific example the human describes, if any, still reflects the contracts\' current wording rather than an earlier draft.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Compare the project\'s role contracts against this generic six-role definition — every power any contract claims should map onto exactly one of these six, never onto an invented seventh:',
          ROLE_DEFINITIONS,
          FRESH_CONTEXT_NOTE,
          'Produce a table or list of every specific power or decision named in more than one contract, or contradicted between two contracts, quoting the relevant sentence from each. Include overlaps with the human Owner\'s reserved powers (ratification; deciding to keep or discard finished work) as their own category, since those are never available to any of the five execution roles.',
          'For each overlap found, propose the minimal rewrite that resolves it — usually narrowing one contract\'s wording rather than rewriting both — and explain which role should keep the power and why, based on the six-role definitions above and the rulebook\'s precedence order.',
          answers.singleAgentReality === 'rotating-single-tool'
            ? 'Because one AI tool rotates through these roles across separate conversations, also check whether any overlap is actually a missing role-switch statement (the contract does not make clear which hat is speaking) rather than a true authority conflict, and say which it is.'
            : '',
        ].filter(Boolean).join('\n\n');

        const constraints = [
          NO_NEW_TIER_LINE,
          CONTRACT_IS_BEHAVIOR_LINE,
          'Do not resolve an overlap by inventing a rule not grounded in the six-role definitions or the rulebook\'s precedence order — if the correct resolution is genuinely unclear, present the options and their tradeoffs and let the human decide.',
        ].join('\n');

        const deliverables = 'A complete list of every overlap or contradiction found between the project\'s role contracts (including any involving the human Owner\'s reserved powers), each with the conflicting sentences quoted, a proposed minimal resolution, and the reasoning tying that resolution back to the six-role definitions and the rulebook\'s precedence order.';

        const qualityGates = [
          'The audit must be exhaustive across all existing contracts, not just the pair the human named, since a real overlap can involve a third contract nobody suspected.',
          'Every proposed resolution must leave exactly one role holding each power — no proposal may leave two roles still able to claim the same decision.',
          'No proposed resolution may grant an execution role a power reserved to the human Owner.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the human\'s suspected pair is the only overlap — audit the full set.',
          'Do not assume the more detailed or more recently written contract is automatically correct where two conflict; resolve using the six-role definitions and the rulebook\'s precedence order, not recency or length.',
          NO_NEW_TIER_LINE,
        ].join('\n');

        const stopConditions = 'Stop and return to the human if resolving an overlap genuinely requires a rulebook change rather than a contract change, if you find a contract claiming a power reserved to the human Owner and it is unclear whether that was intentional, or if two plausible resolutions both seem defensible and the choice is a judgment call only the human can make. If the only resolution you can find is inventing a new authority tier to arbitrate the overlap — a "Development Manager," a "Coordinator," or any agent role beyond the ones defined above — stop; that is out of scope for this method, so narrow one of the existing contracts instead.';

        const approvalBoundary = 'This audit and its proposed resolutions are recommendations until the human Owner reviews and explicitly ratifies any contract changes. Do not apply a resolution as if it were already in force, and do not let any role act on the disputed power while the audit is pending.';

        const terminalReturn = [
          '"Done" for this recovery means: every existing role contract has been read and compared; every overlap or contradiction found is listed with quoted evidence; each has a proposed resolution tied to the six-role definitions and the rulebook\'s precedence order; and no new role or authority tier was introduced anywhere in the proposal.',
          'Report the full overlap list, your proposed resolutions, any case where two resolutions seemed equally defensible and you left the choice to the human, and stop there for review rather than editing any contract file yourself without confirmation.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'Role contracts are the mechanism that turns "zero trust" from a slogan into something enforceable: without a written boundary, an agent playing Engineering Lead will eventually also grade its own work, or an Orchestrator will start reading source code because it is convenient, and no one notices until an unverified claim has already been acted on. This stage exists to write those boundaries down, in language specific enough to catch a real violation, before any role starts doing real work. It also has to survive contact with reality — most humans do not have five separate AI subscriptions, so the contracts must work whether one tool rotates through every hat or five different tools each own one.',
    problemPrevented: 'Without explicit contracts, role separation collapses quietly under time pressure — a Builder gets asked to also confirm its own fix worked, or an Engineering Lead publishes a change because the human was not around to ratify it and "someone had to." Each individual collapse looks reasonable in the moment; the pattern is what erodes the whole zero-trust guarantee. Writing the boundary down in advance, and stating explicitly what each role must never do, converts a fuzzy norm into something a fresh reader can check a contract against after the fact.',
    judgmentVsInvestigation: 'Which AI tool(s) the human actually has, and whether that tool will rotate through roles or be paired with other tools, is something only the human can state — no amount of repository investigation reveals what product a person is subscribed to. Which roles are worth keeping as genuinely distinct conversations for a project this size is closer to a judgment call, but one the human can defer through the delegate option when they are uncertain; in that case, investigating the project\'s actual size and complexity becomes the agent\'s job, not a question asked back to the human. Everything about the current rulebook\'s actual content, the repository\'s real structure, and whether configuration files already exist is investigation the agent must do directly — this stage never asks the human to describe their own codebase from memory.',
    promptAnatomy: 'This stage\'s generated prompt inlines a full, generic definition of all six roles directly in the Exact task layer, because the receiving agent may have no access to this method\'s source material — the prompt has to be self-sufficient on its own. The Human intent layer stays deliberately thin (a tool name, a rough tool-to-role mapping, and which roles the human wants kept distinct) because the heavier judgment call — how much ceremony a project this size actually needs — is explicitly routable to agent investigation through the delegate option, rather than forced onto the human. Operating mode and Required repository investigation diverge sharply by mode, because a same-conversation continuation and a brand-new one carry very different risks of stale assumptions about what the rulebook or existing contracts actually say.',
    authorityBoundary: 'The agent producing these contracts holds no authority over the roles it is describing — it is drafting text for the human Owner to ratify, not appointing itself to any of the five roles. Once ratified, the contracts themselves become part of the project\'s protected governance material: no later executing agent, in any role, may edit its own or another role\'s contract just because a future checkpoint would be easier with a looser boundary. A genuinely needed change is a stop condition that returns to the Owner, never a silent self-edit.',
    inputsAndSources: 'Inputs are the three structured answers (the named AI tool(s), the tool-to-role mapping, and which roles the human wants kept distinct), the free-text field, and — critically — the project\'s own ratified rulebook and any pre-existing configuration files, which the agent must read directly from the repository rather than accept as summarized in this prompt. No file, path, or document from outside the human\'s own project is ever a valid source for this stage.',
    outputsAndEvidence: 'The expected output is one contract per execution role plus whatever platform configuration file(s) the named tool actually supports, with evidence being the contracts\' own text: a fresh reader should be able to check a specific past action against a specific contract clause and get an unambiguous yes-or-no answer about whether it was in bounds.',
    failureModes: [
      'Writing five documents that all describe activities ("reviews the code," "builds the feature") instead of ownership and explicit prohibitions, so nothing in them is actually checkable after the fact.',
      'Quietly inventing a coordinating agent tier — a "Development Manager," "Coordinator," or similar role holding authority of its own — to smooth over a gap that actually belongs inside one of the existing contracts or should go back to the human as a question.',
      'Collapsing all five roles into a single tone-of-voice document because the human only has one AI tool, instead of building explicit role-switch and fresh-context discipline into the contracts.',
      'Letting the Engineering Lead\'s contract quietly acquire publish or land authority "for convenience," which erases the human Owner\'s exclusive disposition power.',
      'Treating an existing configuration file found in the repository as already ratified without checking it against the rulebook or asking the human.',
    ],
    weakResultSigns: [
      'A contract has no explicit "must never" list — only a description of what the role usually does.',
      'Two contracts both seem to claim the power to decide when a checkpoint is finished.',
      'A platform configuration file only sets tone or persona and never encodes an actual behavioral boundary.',
      'Nothing in either Critic\'s contract mentions starting from a fresh conversation, or it implies that fresh context is a technical guarantee rather than a followed convention.',
    ],
    customization: 'For a genuinely tiny solo project, resist thinning the role count below all five just because it feels like overkill — thin the ceremony inside each role instead (a lighter checkpoint brief, a shorter return report) while keeping the five conversations. For a project with several people or several concurrent workstreams, consider whether Builder needs to become several named Builder contracts scoped to different ownership allowlists, rather than one generic Builder contract everyone reads loosely.',
    whenToStop: 'Pause before ratifying if a contract reads more like encouragement than a boundary — if you cannot point to a sentence that would let a stranger say "no, that violated the contract" about some specific hypothetical action, it is not done yet. Also pause if you notice the agent invented any role-like title beyond the six; that is not a style quibble, it undermines the entire authority structure this stage exists to protect.',
    auditWithoutPasting: 'You do not need to paste full contract text back into this website to sanity-check it. Instead, ask your agent, in its own conversation, to quote back the exact sentence in each contract that would be violated by a specific hypothetical action you invent on the spot — for example, "which sentence would this violate if the Builder had also written the pass/fail verdict on its own work?" If it cannot point to one, the contract needs another pass.',
    weakVsStrongExample: {
      weak: '"The Engineering Lead manages the technical work and makes sure things get built well." This describes an activity, not a boundary; nothing here tells anyone what the Lead is forbidden from doing.',
      strong: '"The Engineering Lead decomposes the checkpoint into pieces, assigns each to a Builder with an exact ownership boundary, and is the sole writer of the integrated version. It may not weaken the acceptance bar, extend its own time ceiling, publish or land the result, or begin the next checkpoint without a new brief from the Orchestrator."',
    },
  },
};
