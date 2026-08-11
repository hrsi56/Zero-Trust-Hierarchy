import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const VERSIONING_HELP = 'Git-based projects can use this method\'s default execution/evidence profile out of the box; anything else needs a documented equivalent that reproduces the same guarantees another way. You are only stating what you already believe is true — the generated prompt tells the agent to confirm it and propose the concrete profile either way.';
const EVIDENCE_LOCATION_HELP = 'This is optional. The agent will investigate your project and propose a concrete location on its own either way — answer only if you already have a strong preference (a specific folder, wiki, or tool) that it should honor rather than invent.';
const STATE_FORMAT_HELP = 'The durable-state record is what tracks exactly which anchor was last ratified and which checkpoint is currently eligible to run. Its format matters less than whether it will actually get kept up to date — if you are not sure yet, let the agent inspect your project and propose one.';

const VERSIONING_LABELS = {
  git: 'Git',
  'other-vcs': 'Another version control system (not Git)',
  'none-yet': 'No version control yet',
};

const STATE_FORMAT_LABELS = {
  'single-file': 'A single durable-state file',
  'issue-tracker': 'An issue tracker or project board',
};

/** Shared operating-mode text — identical wording used by the primary prompt and every recovery prompt. */
function operatingModeText(ctx) {
  return ctx.mode === 'same'
    ? 'You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn. Do not treat what that conversation concluded about this project as still true by default: the rulebook rule that actual state overrides expected-state narrative applies to your own earlier turns just as much as to a stale document, so re-verify the current versioning and documentation state before building anything on it.'
    : 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.';
}

/** Shared precedence rule, restated generically for any project — never this repository's own files. */
function precedenceRuleText() {
  return [
    'Before this step, treat as authoritative, highest first: any document the human has explicitly ratified as this project\'s root governance; then a durable-state record naming the exact version or anchor currently ratified; then the exact section of a plan that actually contains the current acceptance bar; then a written role or agent contract; then generic forms, templates, or planning maps; then the verified, currently-observed state of the project itself. A document is not more authoritative merely because it looks newer, longer, or more polished than another — only explicit human ratification, or verified reality, outranks another document.',
    'The output of this step becomes part of that same chain once the human confirms it, but not before. Until confirmed, treat everything you produce here as a proposal, not a settled artifact.',
  ].join('\n');
}

/** Shared, generic restatement of the checkpoint brief's six execution/evidence-profile primitives. */
function sixPrimitivesBlock() {
  return [
    '1. The target workspace or repository this profile applies to, named unambiguously.',
    '2. How a specific candidate (one piece of work under review) gets an immutable, unique identity that cannot silently change out from under a reviewer — for example a version-control commit identifier, or another mechanism that behaves the same way.',
    '3. How evidence (test results, review verdicts, records of what was checked) gets an identity that is independently resolvable and clearly linked to that exact candidate — never just "the latest run," which can point at a different thing tomorrow.',
    '4. A change-detection query: a concrete way to check whether anything the review actually relied on has changed since it was reviewed, so a stale verdict can be caught before anyone trusts it.',
    '5. An isolation or single-writer mechanism, so concurrent work cannot silently overwrite or contaminate a candidate while it is under review.',
    '6. A preservation and reclamation procedure: how evidence and landed artifacts get kept once a decision is made, and how disposable working state gets cleaned up afterward.',
  ].join('\n');
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'source-of-truth',
  number: 5,
  title: 'Source-of-Truth & Management Map',
  purpose: 'Name the governing documents, the precedence order between them, and where durable state, checkpoint status, and evidence will actually live.',
  agentProduces: 'A management map naming every governing document for this project and the precedence order between them, a durable-state record design tracking the exact ratified anchor and current checkpoint eligibility, and a declared execution/evidence profile (Git-based, or a fully documented equivalent).',
  prerequisites: ['roadmap'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The precedence order used throughout this stage\'s prompt — ratified root governance, then durable state naming the exact ratified anchor, then the exact plan section containing the current bar, then the execution-role contract, then forms and planning maps, then verified actual state — is the precedence chain required by RULEBOOK.md §3, "Authority precedence and ratification"; that section is explicit that a newer-looking or longer file is never automatically authoritative, only ratification (or verified reality) is.',
      'The rule that the governance-locked set — root rulebook, ratified anchors, the governance record, role/agent configuration — may not be modified by any agent merely because a checkpoint would benefit is stated in RULEBOOK.md §3, which names that set explicitly, and it shapes this stage\'s constraints and stop conditions.',
      'The six execution/evidence-profile primitives named in this stage\'s prompt (target workspace; immutable/unique candidate identity; independently resolvable evidence identity linked to the candidate; a reviewed-dependency change-detection query; an isolation/single-writer mechanism; a preservation/reclamation procedure) come from field 7 of the checkpoint brief in RULEBOOK.md §5 and the profile rules in §1 ("Universal invariants and execution profiles"), generalized here to any versioning substrate.',
    ],
    adapted: [],
    productDesign: [
      'Asking the human two narrow preference questions (versioning substrate, durable-state format) plus one optional free-text evidence-location preference, each with an explicit "ask the agent to investigate" escape hatch, is this guide\'s own design — the source bootstrap collects "artifact-versioning and evidence substrate" as a single open intake item for an agent to gather in one turn, not as a structured, human-facing multiple-choice pair.',
      'Giving source-of-truth and management-map design its own dedicated stage, separate from the checkpoint-decomposition stage before it, is this guide\'s product choice — the source bootstrap drafts the management map alongside several other governance artifacts in one pass.',
    ],
  },
  questions: [
    {
      id: 'versioningSubstrate',
      type: 'radio',
      label: 'What does this project use for version control today?',
      help: VERSIONING_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Determines whether every generated prompt can point the agent at this method\'s default GIT_REFERENCE profile to confirm, or must instead ask the agent to investigate and propose a documented DECLARED_EQUIVALENT naming the same six primitives another way.',
      options: [
        { value: 'git', label: 'Git', description: 'The project already uses Git (or a Git-compatible system) for version control.' },
        { value: 'other-vcs', label: 'Another version control system', description: 'A non-Git system — for example Mercurial, Perforce, or a proprietary tool.' },
        { value: 'none-yet', label: 'No version control yet', description: 'Nothing is versioned yet, or the project lives outside any version-control system.' },
      ],
    },
    {
      id: 'evidenceLocationPreference',
      type: 'text',
      label: 'Where would you prefer durable evidence (verdicts, receipts, checkpoint records) to live, if you have a preference?',
      help: EVIDENCE_LOCATION_HELP,
      required: false,
      placeholder: 'e.g. a docs/evidence folder, a wiki space, an existing project-management tool — or leave blank',
      affectsPrompt: 'When present, quoted into the human intent layer as a preference the agent must honor or explicitly justify overriding; when blank, the agent is told to investigate and propose a concrete location itself.',
    },
    {
      id: 'stateFormatPreference',
      type: 'radio',
      label: 'How would you prefer to track durable state — the exact ratified anchor and current checkpoint eligibility?',
      help: STATE_FORMAT_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Sets whether the generated prompt asks the agent to design a single durable-state file, wire the durable-state record into an existing issue tracker or project board, or investigate the project and propose the format itself.',
      options: [
        { value: 'single-file', label: 'A single state file', description: 'One version-controlled file the agent updates at each checkpoint boundary.' },
        { value: 'issue-tracker', label: 'An issue tracker or project board', description: 'State lives as labels, fields, or a pinned item in a tool you already use.' },
      ],
    },
  ],
  freeTextLabel: 'What else should the agent know about how you version, track, or store durable state for this project?',
  completionGate: [
    { id: 'investigated', label: 'The agent inspected the actual repository/versioning state itself rather than relying on my stated preference alone.', kind: 'confirm', required: true },
    { id: 'mapProduced', label: 'A management map naming the governing documents and the precedence order between them was created or revised.', kind: 'confirm', required: true },
    { id: 'profileDeclared', label: 'The execution/evidence profile (GIT_REFERENCE, or a documented equivalent naming all six primitives) was declared concretely, not left generic or as a placeholder.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported its evidence, its assumptions, and any unresolved precedence conflicts.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I reviewed the management map, durable-state policy, and execution/evidence profile myself and explicitly ratify them.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the management map or durable-state record (optional).', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const versioningDelegated = answers.versioningSubstrate === DELEGATE_VALUE;
    const stateFormatDelegated = answers.stateFormatPreference === DELEGATE_VALUE;
    const evidencePreference = (answers.evidenceLocationPreference || '').trim();

    const roleAndAuthority = [
      'You are acting as a governance-drafting agent for this project, not as any of the method\'s six formal execution roles (Architect/Owner, Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic) — those activate only once the human ratifies what you help draft here.',
      'You hold no ratification authority. The human alone is the Architect/Owner: they decide what actually governs this project. Everything you produce in this step is a proposal for the human to review, not a settled artifact, until they confirm it.',
    ].join('\n');

    const stageObjective = 'Name every document that will govern this project, put them in an explicit precedence order, and declare where durable state (the exact ratified anchor and current checkpoint eligibility) and evidence will actually live — including a concrete execution/evidence profile the rest of this method depends on.';

    const humanIntent = [
      versioningDelegated
        ? 'Version-control substrate: the human was not sure and asked you to investigate the project and decide — see the investigation and task instructions below.'
        : quoteHumanInput('Stated version-control substrate', VERSIONING_LABELS[answers.versioningSubstrate] || ''),
      quoteHumanInput('Preferred evidence location', evidencePreference),
      stateFormatDelegated
        ? 'Durable-state format: the human was not sure and asked you to investigate the project and propose an approach — see the investigation and task instructions below.'
        : quoteHumanInput('Preferred durable-state format', STATE_FORMAT_LABELS[answers.stateFormatPreference] || ''),
      quoteHumanInput('Anything else the human wants understood', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = operatingModeText(ctx);

    const investigationIntro = 'Before naming or proposing anything, investigate this project\'s actual state directly — treat every answer the human gave above as a starting hypothesis to confirm, never as a fact to build on unverified.';
    const investigationFresh = [
      '- Confirm whether Git (or a Git-compatible system) is actually initialized and in active use in this project — look for real version-control metadata and an actual history, not just a folder name or a mention in documentation.',
      '- If a non-Git version-control system is present, confirm what it actually is and how it behaves by direct inspection rather than assuming it works like Git.',
      '- If no version control appears to be present, confirm that directly rather than assuming — check the project root and any subdirectories that might hold their own history.',
      '- Search the project for any governance documents that may already exist (a plan, a checkpoint decomposition, a rulebook, prior state records) so the management map you produce reflects what is really there, not an assumed empty slate.',
      '- Search for any existing durable-state artifact (a state file, a project-board field already in use, labels already applied to issues) so you do not propose a second, competing mechanism next to one already in use.',
      '- Confirm what location, if any, is already in real use for storing evidence (a docs folder, CI output, an existing wiki or tracker) before proposing a new one.',
    ].join('\n');
    const investigationSame = [
      '- Re-confirm the project\'s current version-control state directly, even if you believe you already established it earlier in this conversation — files and setups change, and the same reality-over-narrative rule applies to your own earlier conclusions.',
      '- Re-confirm whether any governance documents or durable-state artifacts were created, moved, or changed since you last looked, rather than reusing an earlier read of the project as if it were still current.',
      '- Re-confirm that any evidence-storage location you plan to reuse or propose still exists and is still where anyone would actually look.',
    ].join('\n');
    const investigationClose = 'Whichever mode you are in, you must directly investigate and then PROPOSE the concrete execution/evidence profile mapping yourself — GIT_REFERENCE if Git is genuinely in active use, or a fully-specified DECLARED_EQUIVALENT if not — naming real values for all six primitives listed in the Exact task section below. Do not ask the human to supply a commit identifier, branch name, or any other technical fact; establishing those is your job, not theirs.';
    const investigation = [
      investigationIntro,
      ctx.mode === 'fresh' ? investigationFresh : investigationSame,
      investigationClose,
    ].join('\n\n');

    const precedence = precedenceRuleText();

    const versioningTaskBlock = versioningDelegated
      ? 'The human was not sure what this project actually uses for version control and asked you to investigate and decide. Determine by inspection whether Git, another version-control system, or nothing at all is genuinely in use, and state that finding plainly before proposing the execution/evidence profile below.'
      : answers.versioningSubstrate === 'git'
        ? 'The human believes this project already uses Git. Confirm that by inspection before relying on it — verify Git is genuinely initialized and in active use, not merely present as an empty or vestigial directory — and only then default to this method\'s standard GIT_REFERENCE profile.'
        : answers.versioningSubstrate === 'other-vcs'
          ? 'The human reports this project uses a version-control system other than Git. Confirm by inspection exactly what it is and how it actually behaves, then design a DECLARED_EQUIVALENT profile that reproduces the same guarantees Git would provide using that system\'s real mechanisms — do not assume Git-shaped features exist where they do not.'
          : 'The human reports no version control is in place yet. Confirm this by inspection, then propose a DECLARED_EQUIVALENT profile the project can adopt starting now — do not assume Git will be adopted later, and do not propose a mechanism that depends on tooling the project does not actually have.';

    const stateFormatTaskBlock = stateFormatDelegated
      ? 'The human was not sure how they want durable state tracked and asked you to investigate and propose an approach. Look at what the project already uses (an issue tracker, a project board, a docs folder, nothing) and propose whichever durable-state design would actually get kept up to date given that reality — explain the tradeoff you weighed, and let the human make the final call.'
      : answers.stateFormatPreference === 'single-file'
        ? 'Design the durable-state record as a single version-controlled file the agent updates at each checkpoint boundary. Name its concrete location, and specify exactly what fields it must record — at minimum, the exact ratified anchor currently in force, and which checkpoint is currently eligible to run — so a future agent can read it and trust it without re-deriving history.'
        : 'Design the durable-state record to live inside an issue tracker or project board the project already uses (or, if none exists, propose the smallest one that would actually work). Name the concrete fields, labels, or pinned item that will hold the exact ratified anchor and current checkpoint eligibility, so the record stays where the human actually looks rather than in a file nobody opens.';

    const evidenceLocationTaskBlock = evidencePreference
      ? 'The human has a stated preference for where durable evidence should live (see Human intent above). Honor it unless it is genuinely unworkable, in which case explain exactly why before proposing an alternative.'
      : 'The human has no stated preference for where durable evidence should live. Investigate the project and propose a concrete location yourself — do not leave it undecided.';

    const task = [
      'Produce a management map for this project: a short document listing every document that will govern how work gets planned, executed, reviewed, and released here — for example a ratified project plan, a checkpoint or milestone decomposition, a rulebook describing role authority, individual role or agent contracts, a durable-state record, and any standard forms or templates in use — and state the precedence order between them.',
      'Order the documents in the management map using the precedence rule given above in Source of truth and precedence — do not invent a different order, and do not leave any two documents in the map without a stated relationship to each other.',
      versioningTaskBlock,
      'Whatever the substrate, propose the concrete execution/evidence profile mapping by naming real, project-specific answers to all six of the following primitives — do not leave any of them generic or hypothetical:',
      sixPrimitivesBlock(),
      stateFormatTaskBlock,
      evidenceLocationTaskBlock,
      'Present the full result — management map, precedence order, execution/evidence profile, and durable-state design — as a clearly labeled proposal for the human to review, not as something already in effect.',
    ].join('\n\n');

    const constraints = [
      'Do not modify, or claim authority to modify, any already-ratified root governance document, ratified anchor, or role contract merely because this step would be more convenient with a different one — the governance-locked set is not yours to change. If a change genuinely seems needed, name it as an open question for the human rather than making it.',
      'Do not silently pick between two documents that both look authoritative — surface the conflict and how you resolved it (or could not) using the precedence rule above, instead of guessing.',
      'Do not propose a Git-based execution/evidence profile for a project that does not actually have Git in active use, and do not propose a non-Git equivalent for a project that already has a working Git setup — match the profile to verified reality, not to the human\'s stated belief about it.',
    ].join('\n');

    const deliverables = [
      'A written management map naming every governing document for this project and the precedence order between them.',
      'A concrete durable-state record design — or an actual first version of it, if project reality and the human\'s answer make that appropriate — naming the exact ratified anchor and current checkpoint eligibility fields.',
      'A declared execution/evidence profile — GIT_REFERENCE, or a fully-specified DECLARED_EQUIVALENT — with all six primitives answered concretely for this project, not left generic.',
      'A named location for durable evidence: either the human\'s stated preference honored, or a concrete alternative proposed with reasoning.',
    ].join('\n');

    const qualityGates = [
      'Every one of the six execution/evidence-profile primitives is answered with a real, project-specific mechanism — none are left as an unfilled placeholder or a generic description.',
      'The precedence order has no gaps and no cycles: for any two governing documents named in the map, it is unambiguous which one wins if they disagree.',
      'The durable-state record design names a concrete, checkable location — a real file path, or a real tool and field — not an aspirational description of where it will eventually live.',
      'Every claim about the project\'s current versioning or documentation state is backed by something actually inspected, not inferred from the human\'s stated preference alone.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume Git is installed, initialized, or in active use without checking directly.',
      'Do not assume the human\'s stated preference for versioning or state format describes current reality — it is a preference, and may be aspirational or simply uncertain.',
      'Do not assume no governance documents exist for this project just because none were mentioned — investigate before drafting a map that would silently orphan something already in use.',
      'Do not invent a document, tool, or location the human did not confirm and you did not verify by inspection.',
    ].join('\n');

    const stopConditions = [
      'Stop and return to the human, rather than guessing, if you find two documents that both appear to claim root authority and you cannot resolve which one was actually ratified — name both, explain the conflict, and ask.',
      'Stop if the project has no version control in place and no realistic way to specify a working DECLARED_EQUIVALENT (for example, no reliable way to give a candidate a unique, immutable identity) — report this as a genuine limitation rather than inventing a profile that would not really work.',
      'Stop if establishing precedence between two documents would require modifying an already-ratified governance document — that is an Owner action, not yours to take.',
    ].join('\n');

    const approvalBoundary = 'Everything in this step is a proposal. The human alone decides whether the management map, precedence order, durable-state design, and execution/evidence profile actually take effect — nothing here is ratified by your drafting it, no matter how confident or complete it looks.';

    const terminalReturn = [
      'Report exactly what you produced and where: the management map\'s location (or its full text if no file was written), the durable-state record\'s concrete location and fields, and the execution/evidence profile with all six primitives named.',
      '"Done" means the map, durable-state design, and profile all exist as concrete, inspectable artifacts — a real file, a real tool configuration, or explicit text in your response — not a promise to do this later.',
      'Explicitly report every assumption you made and every conflict you found and how you resolved it, or did not. If authority or source-of-truth for any document could not be established, say so plainly and stop rather than guessing which one wins.',
    ].join('\n\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'resolve-conflicting-authorities',
      label: 'Resolve two documents that both claim to be authoritative',
      description: 'Use this when you\'ve found two (or more) governing documents for this project that each look like they could be the real source of truth, and you need the agent to determine which one actually governs using evidence and the precedence rule, not recency.',
      buildLayers(answers, freeText, ctx) {
        const versioningDelegated = answers.versioningSubstrate === DELEGATE_VALUE;
        const stateFormatDelegated = answers.stateFormatPreference === DELEGATE_VALUE;
        const evidencePreference = (answers.evidenceLocationPreference || '').trim();

        const roleAndAuthority = [
          'You are acting as a governance-drafting agent for this project, not as any of the method\'s six formal execution roles — those activate only once the human has ratified what governs here. Your job in this recovery step is arbitration: determine, using evidence and a fixed precedence rule, which of two conflicting documents is actually authoritative, or establish that neither can be confirmed and this must go to the human.',
          'You cannot ratify a document as authoritative by declaring it so. You can only apply the precedence rule to verifiable evidence, or report that the evidence does not exist.',
        ].join('\n');

        const stageObjective = 'Resolve a conflict between two or more documents that each appear to claim they govern this project, using the method\'s precedence rule and directly verifiable evidence — never recency, length, formatting, or which one you happened to see first.';

        const humanIntent = [
          versioningDelegated
            ? 'Version-control substrate: the human was not sure and asked the agent to investigate and decide — relevant here because version-control history can itself be evidence of what was actually ratified.'
            : quoteHumanInput('Stated version-control substrate', VERSIONING_LABELS[answers.versioningSubstrate] || ''),
          quoteHumanInput('Preferred evidence location', evidencePreference),
          stateFormatDelegated
            ? 'Durable-state format: the human was not sure and asked the agent to investigate and propose an approach.'
            : quoteHumanInput('Preferred durable-state format', STATE_FORMAT_LABELS[answers.stateFormatPreference] || ''),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(ctx);

        const investigation = [
          'Identify every document in the project that explicitly or implicitly claims to be the current governing plan, root rulebook, or ratified anchor.',
          'For each candidate, look for direct evidence that a human actually ratified it — an explicit sign-off note, an approval record, a revision explicitly marked as adopted — never just its presence, its filename, or how recently it was touched.',
          'Check whether a durable-state record already exists and already names which anchor is currently ratified; if it does, that record is likely the real tiebreaker under the precedence rule, not the documents themselves.',
          ctx.mode === 'fresh'
            ? 'Do this from a clean read of the whole project — you have no prior context on this project to lean on, so verify everything directly.'
            : 'Re-verify rather than reusing an earlier impression from this conversation about which document "seemed" authoritative — actual evidence overrides remembered narrative here too.',
        ].join('\n\n');

        const precedence = precedenceRuleText();

        const task = [
          'Apply the precedence rule above to the candidates using only the evidence you found: explicit ratification evidence outranks everything; a durable-state record naming the exact current anchor outranks a document without such confirmation; and so on down the chain.',
          'If the evidence clearly supports one document as authoritative, say so explicitly, and propose or correct a durable-state record entry naming it as the current ratified anchor — explicitly marking the other document as superseded and historical, preserved rather than deleted or silently overwritten.',
          'If the evidence does not clearly support either document — for example neither has confirmable ratification, or both do — do not pick one. Report the conflict exactly as found and stop for the human.',
        ].join('\n\n');

        const constraints = [
          'Never treat "which file has a later modification date" or "which one is longer or more detailed" as ratification evidence.',
          'Never delete, rename, or overwrite the losing document as part of resolving this conflict — preserve it and mark it superseded so its history remains available.',
          'Do not proceed with any dependent work (drafting further governance, starting a checkpoint) until this conflict is actually resolved or explicitly escalated to the human.',
        ].join('\n');

        const deliverables = 'A short arbitration report naming both candidate documents, the evidence considered for each, the resolution reached (or an explicit statement that resolution requires the human), and — if resolved — an updated or newly created durable-state record entry naming the winning document as the current ratified anchor.';

        const qualityGates = 'The report cites concrete evidence for its conclusion, or concretely explains why no conclusion could be reached, rather than asserting a winner by feel. The losing document is explicitly named as superseded, never silently dropped. If escalated, the exact question the human needs to answer is stated precisely, not left open-ended.';

        const prohibitedAssumptions = 'Do not assume the more recently modified or more polished-looking document is the real one. Do not assume the document with the more "official" name is the real one. Do not assume that because you were shown one document first, it is the intended one.';

        const stopConditions = 'Stop and hand this to the human if neither document has verifiable ratification evidence, or if both do (contradictory ratification records) — that is a human decision, not something you can resolve by inspection alone.';

        const approvalBoundary = 'Even a resolution you consider well-evidenced is provisional until the human confirms it — resolving this conflict may change what the durable-state record says is currently ratified, and that is exactly the kind of change the human should see before it sticks.';

        const terminalReturn = 'Report which document, if any, you determined to be authoritative and why; exactly what evidence you found for each candidate; what you wrote or propose to write into the durable-state record; and, if unresolved, the precise question the human must answer. "Done" means the conflict is either resolved with cited evidence and a durable-state update, or clearly escalated with nothing silently decided.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'audit-precedence-chain',
      label: 'Audit the management map for a broken precedence chain',
      description: 'Use this once a management map already exists for this project and you want the agent to check it for gaps, cycles, or orphaned documents before you rely on it, rather than assuming it is still correct.',
      buildLayers(answers, freeText, ctx) {
        const versioningDelegated = answers.versioningSubstrate === DELEGATE_VALUE;
        const stateFormatDelegated = answers.stateFormatPreference === DELEGATE_VALUE;
        const evidencePreference = (answers.evidenceLocationPreference || '').trim();
        const priorGate = (ctx.allGates && ctx.allGates['source-of-truth']) || null;
        const priorArtifactPath = priorGate && priorGate.artifactPath ? String(priorGate.artifactPath).trim() : '';

        const roleAndAuthority = [
          'You are acting as a governance-drafting agent auditing prior work for this project, not as any of the method\'s six formal execution roles. Your job is to check an existing management map for defects, not to draft a new one from scratch unless the audit shows the existing one cannot be repaired.',
          'You hold no ratification authority. Corrections you propose are exactly that — proposals — until the human reviews and confirms them.',
        ].join('\n');

        const stageObjective = 'Audit an existing management map for this project: confirm every governing document it names still exists and is reachable, confirm the precedence order it states has no gaps or cycles, and confirm no document currently in real use is missing from the map.';

        const humanIntent = [
          versioningDelegated
            ? 'Version-control substrate: the human was not sure and asked the agent to investigate and decide.'
            : quoteHumanInput('Stated version-control substrate', VERSIONING_LABELS[answers.versioningSubstrate] || ''),
          quoteHumanInput('Preferred evidence location', evidencePreference),
          stateFormatDelegated
            ? 'Durable-state format: the human was not sure and asked the agent to investigate and propose an approach.'
            : quoteHumanInput('Preferred durable-state format', STATE_FORMAT_LABELS[answers.stateFormatPreference] || ''),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(ctx);

        const investigation = [
          priorArtifactPath
            ? [
              quoteHumanInput('Path recorded for the management map when this stage was last completed', priorArtifactPath),
              'Treat this as a starting pointer only — open it and confirm it still contains a management map before auditing its contents. Do not assume the path is still correct, or that nothing has moved since it was recorded.',
            ].join('\n')
            : 'No prior artifact path was recorded for this stage. Search the project directly for whatever document currently serves as its management map before auditing it — do not assume its location.',
          'For every document the map lists, confirm it still exists at the location the map claims and is still reachable. Flag any that have moved, been renamed, or been deleted.',
          'For every document currently in real use in the project — check this directly, do not rely on the map\'s own list as complete — confirm it is actually named in the map. Flag anything missing.',
          'Trace the stated precedence order for cycles (document A said to outrank B, B said to outrank A) and for gaps (two documents named in the map with no stated relationship to each other at all).',
          'Re-derive the correct precedence order using the rule below and compare it against what the map currently states.',
        ].join('\n\n');

        const precedence = precedenceRuleText();

        const task = [
          'Compare the map\'s stated precedence order against the correct order derived from the rule above. Report every place they diverge.',
          'Check that the durable-state record the map points to actually exists, is at the location the map claims, and actually records the fields it should — at minimum the exact ratified anchor currently in force, and current checkpoint eligibility. Flag it if it is missing, empty, or clearly stale.',
          'Check that the execution/evidence profile is still fully specified — all six primitives named concretely — and still matches the project\'s actual current versioning state, since tooling can change after a map is first drafted.',
          'If the audit finds the existing map broadly sound with isolated defects, propose targeted corrections. If it finds the map fundamentally unreliable — for example drafted against a since-abandoned versioning approach — say so plainly rather than patching around a structurally broken result.',
        ].join('\n\n');

        const constraints = [
          'Do not silently rewrite the map without flagging what changed and why.',
          'Do not delete a document from the map without confirming, by inspection, that it is genuinely gone or superseded, not merely unfamiliar to you.',
          'Do not modify any document in the governance-locked set as part of this audit — a needed change there is an Owner decision, not something to fix quietly.',
        ].join('\n');

        const deliverables = 'A written audit report: every defect found (broken links, cycles, gaps, orphaned or missing documents, a stale or missing durable-state record, an incompletely specified execution/evidence profile), and either corrected map text or a precise list of what the human needs to decide to fix it.';

        const qualityGates = 'Every defect claim is backed by something actually checked — a path that does not resolve, a cycle you can name concretely, a primitive that is genuinely unspecified — not a vague sense that something seems incomplete. Any corrected precedence order is derived from the rule above, not from convenience.';

        const prohibitedAssumptions = 'Do not assume the map is correct merely because it exists and looks complete. Do not assume a document not currently listed is unimportant — confirm whether it is genuinely obsolete or simply missing. Do not assume the durable-state record is current just because it is present.';

        const stopConditions = 'Stop and escalate to the human if the audit reveals the map\'s stated top-level authoritative document was never actually ratified — no evidence of ratification anywhere. That is not a formatting defect; it is a foundational one, and continuing to build on it would only compound the problem.';

        const approvalBoundary = 'Corrections proposed by this audit are proposals. The human must review and confirm any change to the management map before it is treated as governing, exactly as if it were being drafted for the first time.';

        const terminalReturn = 'Report every defect found, whether it was corrected or only flagged, the current state of the durable-state record and execution/evidence profile after the audit, and any defect that requires an Owner decision rather than an agent fix. "Done" means the map is either confirmed sound as-is, or every defect found has a concrete, reported disposition — never a mix of silently-fixed and silently-ignored issues.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'This stage exists to make one thing explicit before any execution role starts working: when two documents disagree about this project, which one wins — and where does the record of "what was actually ratified, and what is eligible to run next" actually live. Every later stage — the rulebook, role contracts, forms, the bootstrap itself — silently depends on both of these being settled and locatable, not re-derived from scratch each time an agent needs them.',
    problemPrevented: 'Without an explicit management map and precedence order, an agent facing two plausible-looking planning documents will default to whichever is newest, longest, or most recently opened — exactly the failure the method\'s precedence rule exists to prevent. Without a concrete execution/evidence profile, instructions like "check the exact ratified anchor" or "detect whether a reviewed dependency changed" have no real mechanism behind them, so later checkpoint briefs and Critic verdicts end up resting on vibes instead of something inspectable.',
    judgmentVsInvestigation: 'The human supplies only preference and honest uncertainty: what version-control system, if any, the project uses today; whether they have a strong opinion on where evidence should live; and how they would prefer durable state tracked — or explicit uncertainty on either radio question. Everything else — whether Git is actually initialized and in active use, what documents already exist in the project, what concrete mechanism satisfies each of the six execution/evidence primitives — is fact the agent must establish by inspection, never something the structured questions ask the human to recall or guess.',
    promptAnatomy: 'The precedence layer restates the RULEBOOK\'s six-rank chain generically so the agent has a rule to apply rather than an impression to follow; the investigation layer is deliberately the most different between operating modes in this stage\'s prompt, because a fresh agent has no prior read of the project to lean on while a same-conversation agent must actively resist trusting its own earlier conclusions; the task layer is where the six execution/evidence primitives get named explicitly so "GIT_REFERENCE vs. a documented equivalent" never stays abstract.',
    authorityBoundary: 'The agent here is not yet operating as any of the method\'s six execution roles — the Orchestrator, Engineering Lead, Builder, and the two Critics do not exist until later stages ratify their contracts. It is closer to the bootstrap\'s read-only setup phase: free to investigate and draft, never free to ratify. The management map, precedence order, and execution/evidence profile it produces are proposals until the human, wearing the Architect/Owner hat, confirms them at the completion gate.',
    inputsAndSources: 'Inputs are the human\'s three answers — a versioning-substrate choice or delegation, an optional evidence-location preference, a durable-state format choice or delegation — plus whatever the agent finds by directly inspecting the project\'s actual repository/versioning state and any already-existing governance documents or state artifacts. Never a description of those things relayed secondhand by the human.',
    outputsAndEvidence: 'The concrete outputs are a management map (governing documents plus precedence order), a durable-state record design or first version (naming the exact ratified anchor and current checkpoint eligibility), and a fully-named execution/evidence profile. Evidence that this actually happened is the presence of real, inspectable artifacts at named locations — not a narrative claim that they exist.',
    failureModes: [
      'The agent declares GIT_REFERENCE without checking whether Git is actually initialized and in active use, producing a profile that quietly fails the first time someone relies on it.',
      'Two documents both look authoritative and the agent silently picks the newer one instead of applying the precedence rule or escalating — the exact failure the first recovery prompt exists to catch.',
      'A durable-state record gets designed but never actually created, so every later stage keeps re-deriving "what was last ratified" from memory or by re-reading the whole project.',
      'The management map lists documents but never states which wins in a conflict, so it looks complete while being useless the first time two of them actually disagree.',
      'A non-Git project gets handed a DECLARED_EQUIVALENT that quietly skips one of the six primitives — commonly the change-detection query or the isolation/single-writer mechanism — leaving a real gap that only surfaces later as a stale or corrupted verdict.',
    ],
    weakResultSigns: [
      'The execution/evidence profile names "GIT_REFERENCE" or "a documented equivalent" as a label without actually specifying what each of the six primitives concretely maps to for this project.',
      'The management map is a bare list of document names with no stated precedence order — or an order that contradicts the rulebook chain, for example treating a plan section as outranking durable state.',
      'The durable-state record\'s "location" is described aspirationally ("we\'ll keep this updated somewhere") rather than as one concrete, checkable path or tool.',
    ],
    customization: 'If your project already has a mature issue tracker or project-management tool the team uses daily, prefer wiring durable state into that over inventing a new file nobody will remember to open — the method cares that the record stays truthful and current, not which medium carries it. If you are working solo on a small Git repository, a single state file checked into version control alongside the code is usually the lowest-friction honest choice.',
    whenToStop: 'Stop and treat the result as provisional, not settled, if the agent could not find verifiable evidence of ratification for any document it is proposing to rank as authoritative, or if your project genuinely has no reliable way to give a candidate an immutable, unique identity — some non-versioned setups cannot satisfy that primitive without adopting new tooling first. That is a real limitation to solve before continuing, not a detail to paper over.',
    auditWithoutPasting: 'You can sanity-check the result without ever pasting its contents back into this website: open the management map yourself and try to answer, for any two documents named in it, "which one wins if they disagree" — if you cannot answer that from the map alone, its precedence order is incomplete. Separately, check that the durable-state record\'s stated location is a real, currently-existing path or tool you can navigate to right now, not a description of where it will eventually live.',
    weakVsStrongExample: {
      weak: '"Execution/evidence profile: GIT_REFERENCE. Durable state: a state file." — no primitives named, no location given, nothing here is checkable or actionable.',
      strong: '"Execution/evidence profile: GIT_REFERENCE — target workspace is the single repository at the project root; candidate identity is a Git commit identifier; evidence identity is a review record cross-referenced to that commit in the durable-state file; the change-detection query is a diff of the reviewed dependency paths between the recorded commit and the current one; isolation is one branch per checkpoint with a single designated writer; preservation is tagging the landed commit and deleting the checkpoint branch once evidence is archived. Durable state: docs/project-state.md, updated at every checkpoint boundary, recording the currently ratified anchor and the next eligible checkpoint."',
    },
  },
};
