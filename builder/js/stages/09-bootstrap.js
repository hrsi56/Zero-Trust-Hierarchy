import { quoteHumanInput } from '../compiler.js';

const CONFIDENCE_HELP = 'This does not change whether the audit happens — every governing artifact gets checked either way. It changes how hard the agent should push and how much weight it should give to the possibility that this project is genuinely too small for the ceremony it has just spent eight stages assembling.';
const SECOND_THOUGHTS_HELP = 'Naming a doubt here is not a confession that something is wrong — it is a pointer telling the agent exactly where to look hardest. An unnamed doubt is invisible to the audit; a named one becomes the first thing it checks.';

const CONFIDENCE_LABELS = {
  confident: 'Fairly confident — just double-check',
  hunt: 'Actively hunt for gaps and contradictions',
  unsure: 'Honestly not sure this project needs all this ceremony',
};

/** The six governing artifacts a fit check must actually read, named the way stages 2–8 produced them. */
const GOVERNING_ARTIFACTS = [
  '1. The ratified Capstone (the governing project plan — observable outcome, scope boundary, non-goals, constraints, risks, and acceptance bar).',
  '2. The checkpoint roadmap (the ordered set of bounded checkpoints, their dependencies, and their rough evidence requirements).',
  '3. The source-of-truth and management map (which documents govern, in what precedence order, and where durable state and evidence actually live).',
  '4. The project Rulebook (authority boundaries, destructive-action rules, escalation thresholds, and the terminal-outcome vocabulary).',
  '5. The role contracts and any platform configuration (what each of the five execution roles owns and is forbidden from doing, and how that becomes real instructions in the AI tool(s) actually in use).',
  '6. The set of operational forms or templates this project adopted (the checkpoint brief, builder assignment, critic assignment and verdict, return packet, receipt, and disposition forms it will actually use once real work starts).',
].join('\n');

const ANTI_SELF_RATIFICATION_LINE = 'Ratified is not the same thing as drafted, complete-looking, or something an agent feels good about. Do not infer ratification from existence, polish, a removed DRAFT label, silence, or a prior agent\'s claim. Accept only an explicit Owner record or direct Owner statement. This prompt\'s OWNER-REPORTED DECISION LEDGER is such a direct statement because the human intentionally handed you the prompt after recording each decision; it is not proof that the artifact matches the decision. Reconcile each entry with the exact file, cite it as Owner-reported, and materialize it in the project\'s designated durable decision record. If the ledger is missing, ambiguous, broader than the named artifact, or conflicts with the repository, stop and ask instead of inferring ratification.';

const FIT_DEFINITIONS = [
  '- FIT: this project has a real, versioned artifact worth defending, an acceptance condition specific enough that a reasonable person could disagree about whether it was met, and a genuine cost to getting it wrong. The governance this project has assembled is proportionate to what it protects.',
  '- FIT_WITH_REDUCED_PROFILE: the same three properties hold, but the versioned-artifact mechanism this project assumed (for example a Git-shaped candidate identity and change-detection query) does not fit how this project actually stores or versions its work, and needs a documented, equivalent substitute before the first checkpoint can run.',
  '- NOT_FIT: the work is genuinely trivial or fully reversible, or the ceremony this project has built costs more effort than the risk it would control. This is a correct, honest, and complete outcome — it means stop here and do not adopt this operating system for this project, not that anything was done wrong in stages 2 through 8.',
].join('\n');

function operatingModeText(fresh) {
  return fresh
    ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
    : 'You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn. That continuity does not exempt this stage from verification — this project\'s own precedence rules hold that actual state always overrides an expected-state narrative, including a narrative from earlier in this very conversation. A document you drafted yourself two turns ago is not evidence that it was ratified, and your own earlier read of it is not evidence that it still says the same thing now.';
}

function investigationText(fresh, confidenceLevel) {
  const huntNote = confidenceLevel === 'hunt'
    ? ' The human explicitly asked you to actively hunt for gaps and contradictions rather than perform a light pass — read every governing artifact adversarially: assume each one contains at least one real inconsistency until you have looked hard enough to be confident it does not.'
    : '';
  const unsureNote = confidenceLevel === 'unsure'
    ? ' The human is honestly unsure this project needs all this ceremony. Do not let eight stages of completed work create pressure toward a favorable result — weigh NOT_FIT as seriously as FIT, and let your investigation, not the volume of documents already produced, decide which one is true.'
    : '';

  if (fresh) {
    return [
      'This is a fresh conversation with no memory of any earlier stage. Verify every artifact from scratch. The OWNER-REPORTED DECISION LEDGER is a direct statement of what the human says they decided, but not proof of what any file contains; reconcile it with the exact artifacts rather than trusting either side blindly.' + huntNote + unsureNote,
      'Locate and read, in full, directly from the project\'s own files, each of the six governing artifacts listed below in the Exact task layer. Do not proceed from a summary, a table of contents, or a partial read of any of them.',
      'For each artifact, determine whether it was actually ratified by the human Owner, using the anti-self-ratification standard given below — not whether it looks finished.',
      'Cross-read every pair of artifacts for contradiction: does the Rulebook\'s precedence order match the source-of-truth document\'s declared order? Does the roadmap\'s proposed first checkpoint respect the Capstone\'s stated non-goals and acceptance bar? Do the role contracts introduce a role beyond the six the method defines? Does the adopted forms set actually cover what the roadmap\'s first checkpoint will need (a checkpoint brief, a builder assignment, a critic verdict, a return packet, at minimum)?',
      'Inspect the actual current state of the repository, branches, and versioning setup yourself — do not accept the source-of-truth document\'s description of that state as still accurate; verify it lives up to what it claims right now.',
      'If any of the six artifacts cannot be found, is still visibly marked DRAFT, or its ratification cannot be evidenced, treat that as a fit-check-blocking finding, not a minor note.',
    ].join('\n');
  }
  return [
    'Even though this continues the conversation that helped produce some of these artifacts, that familiarity is not evidence of ratification or of internal consistency — this stage exists specifically to check both, and a favorable impression formed while drafting does not survive as evidence here.' + huntNote + unsureNote,
    'Re-open and re-read the actual current, saved content of each of the six governing artifacts listed below in the Exact task layer, directly from the project\'s files — not from your memory of drafting them.',
    'Confirm ratification the same way a fresh reviewer would: reconcile the prompt\'s Owner-reported ledger and any durable Owner approval record with the exact artifact, never your recollection of the human seeming satisfied.',
    'Still cross-read every pair of artifacts for contradiction, and still verify the project\'s actual current repository and versioning state directly rather than assuming nothing has changed since you last looked.',
  ].join('\n');
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'bootstrap',
  number: 9,
  title: 'Bootstrap & Fit Check',
  purpose: 'Confirm this operating system actually fits the project, and that every governing artifact from stages 2 through 8 is genuinely ratified and internally consistent, before the first real checkpoint begins.',
  agentProduces: 'One explicit fit result — FIT, FIT_WITH_REDUCED_PROFILE, or NOT_FIT — plus a self-audit confirming every governing artifact from stages 2 through 8 is actually ratified (not merely drafted) and internally consistent with each other, and, only if the result is FIT or FIT_WITH_REDUCED_PROFILE, a proposed first eligible checkpoint drawn from the ratified roadmap.',
  prerequisites: ['forms'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The FIT / FIT_WITH_REDUCED_PROFILE / NOT_FIT fit result, its three defining properties (a versioned inspectable artifact, an acceptance condition a capable reviewer can disagree with, and meaningful error cost), and the instruction that NOT_FIT means the ceremony costs more than the controlled risk, are step 4 of Phase A in the bootstrap payload in article.md §14, "Bootstrap the hierarchy without self-ratification."',
      'The anti-self-ratification discipline — that a setup agent must not edit project files, start execution, or claim any draft is authoritative, and must label every inference and ask rather than inventing an Owner judgment — is Phase A steps 1 and 2 of the same bootstrap payload, and it rests on RULEBOOK.md §3, under which only ratification confers authority. It is preserved here without softening.',
      'The requirement that the bootstrap check every governing artifact for actual ratification and internal consistency before any real checkpoint begins, and that it propose (but not itself issue) the first eligible checkpoint once fit is established, follows the two-phase structure of article.md §14, whose closing line is explicit that the bootstrap "creates a controlled decision point; it does not substitute for ratification."',
    ],
    adapted: [],
    productDesign: [
      'The source method\'s bootstrap (article.md §14) is a single agent turn: a setup agent collects ten intake items and drafts all nine governance artifacts together, stopping on one line — AWAITING_OWNER_RATIFICATION. This guide splits that single turn across stages 2 through 8, so a beginner reviews and ratifies one governing decision at a time (the Capstone, then its ratification, then the roadmap, then source-of-truth, then the rulebook, then roles, then forms) instead of receiving nine documents at once with no natural place to push back on any single one. This stage — Bootstrap & Fit Check — is where this guide reassembles the other half of the source bootstrap: the fit-check-and-coherence-audit across everything drafted so far, plus proposing the first eligible checkpoint. Nothing about the fit-check mechanic itself, or the anti-self-ratification standard it applies, was changed by spreading the drafting out — only the pacing of when a human reviews each piece changed.',
      'The confidence-level question (fairly confident / actively hunt for gaps / honestly unsure this project needs the ceremony) is this guide\'s own addition. The source method does not ask the human to calibrate how skeptically the audit should run — it assumes the setup agent always investigates thoroughly. This guide adds the question because a real project can be at meaningfully different points of doubt by this stage, and naming that doubt explicitly gives the audit somewhere useful to focus, rather than leaving genuine uncertainty unspoken until it surfaces as a costly surprise after the first checkpoint has already started.',
    ],
  },
  questions: [
    {
      id: 'confidenceLevel',
      type: 'radio',
      label: 'How confident are you that everything drafted so far actually holds together?',
      help: CONFIDENCE_HELP,
      required: true,
      affectsPrompt: 'Calibrates how adversarially the self-audit reads the six governing artifacts and how seriously it weighs a NOT_FIT outcome — it never skips or shortens the audit itself, only how hard it pushes.',
      options: [
        { value: 'confident', label: 'Fairly confident — just double-check', description: 'Run the full audit, but you do not expect it to surface much.' },
        { value: 'hunt', label: 'Actively hunt for gaps and contradictions', description: 'You suspect something in the last eight stages does not actually hold together, and want the agent to look hard rather than confirm what you already believe.' },
        { value: 'unsure', label: 'Honestly not sure this project needs all this ceremony', description: 'You are starting to wonder whether this project is small enough that a NOT_FIT result would actually be the right answer.' },
      ],
    },
    {
      id: 'secondThoughts',
      type: 'textarea',
      label: 'Anything you are now reconsidering, now that the governing documents actually exist?',
      help: SECOND_THOUGHTS_HELP,
      required: false,
      placeholder: 'e.g. the acceptance bar in the Capstone now feels looser than I meant it, or I\'m not sure the first checkpoint in the roadmap is really independent of the second one',
      affectsPrompt: 'Quoted verbatim into the Human intent layer and treated as a directed hint for where the self-audit should look hardest, rather than a general-purpose comment.',
    },
  ],
  freeTextLabel: 'What should the agent understand about this fit check that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'fitResultReturned', label: 'The agent returned an explicit FIT, FIT_WITH_REDUCED_PROFILE, or NOT_FIT result — not a vague "looks good" or a partial answer.', kind: 'confirm', required: true },
    { id: 'artifactsInspected', label: 'The agent actually read all six governing artifacts (Capstone, roadmap, source-of-truth map, rulebook, role contracts, forms) directly from the project, rather than relying on my summary of what they say.', kind: 'confirm', required: true },
    { id: 'ratificationChecked', label: 'The agent reported, for each governing artifact, concrete evidence of ratification (or its absence) rather than assuming a document was ratified because it exists or looks finished.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported the contradictions or gaps it found (or an honest statement that it found none), any unresolved issues, and — if the result was FIT or FIT_WITH_REDUCED_PROFILE — its proposed first eligible checkpoint.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I\'ve reviewed the fit result and the self-audit myself, and I understand what it found before treating this project as ready for its first checkpoint.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the bootstrap / fit-check report (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';
    const confidenceLevel = answers.confidenceLevel;
    const confidenceLabel = CONFIDENCE_LABELS[confidenceLevel] || '';
    const orientationAnswers = (ctx.allAnswers && ctx.allAnswers.orientation) || {};
    const riskLabel = { low: 'low stakes', medium: 'medium stakes', high: 'high stakes' }[orientationAnswers.riskTolerance] || '';

    const roleAndAuthority = [
      `You are acting as an independent fit-check-and-self-audit agent for ${ctx.projectName}, examining the governance material this project has drafted across its earlier stages before it is treated as binding. This is not a drafting role: you are not adding to the Capstone, the roadmap, the rulebook, the role contracts, or the forms — you are reading them with fresh, skeptical eyes and reporting what you actually find.`,
      'You hold no authority to ratify anything, including your own audit. If you drafted or helped draft any of these documents earlier in this project\'s history, that fact does not exempt them from this check, and your own prior satisfaction with them is not evidence they are ratified or consistent — only the human Owner\'s explicit approval, and your own fresh verification, count here.',
      'Your one required output is a single explicit fit result. A confident-sounding narrative summary is not a substitute for stating FIT, FIT_WITH_REDUCED_PROFILE, or NOT_FIT in exactly those terms.',
    ].join('\n');

    const stageObjective = 'Determine, through direct investigation rather than assumption, whether this project\'s assembled operating system actually fits the work it is meant to govern, and whether every governing artifact behind it is genuinely ratified and mutually consistent — then report one explicit fit result and, if warranted, propose exactly one first eligible checkpoint for the human to consider next.';

    const humanIntent = [
      quoteHumanInput('How confident the human is that everything drafted so far holds together', confidenceLabel),
      riskLabel ? quoteHumanInput('Risk tolerance recorded earlier in this process', riskLabel) : '',
      quoteHumanInput('What the human is now reconsidering, now that the governing documents actually exist', answers.secondThoughts),
      quoteHumanInput('Anything else the human wants understood about this fit check', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = operatingModeText(fresh);

    const investigation = investigationText(fresh, confidenceLevel);

    const precedence = [
      'When sources conflict, resolve in this order, highest first:',
      '1. Explicit evidence of the human Owner\'s ratification of a specific document — never the document\'s own claim about itself.',
      '2. The durable record of what has actually been decided so far (a decision log, roadmap, or project-state document naming current approved scope), where one exists.',
      '3. The exact section of the ratified Capstone or roadmap bearing on the question at hand.',
      '4. The rulebook\'s and role contracts\' stated authority boundaries.',
      '5. The adopted forms or templates.',
      '6. Verified actual repository, environment, and versioning state — which always overrides any document\'s description of what that state is expected to be.',
      'A document is not authoritative because it is newer, longer, or more polished than another — only ratification, and verified reality, carry weight here. This applies to your own prior output in this conversation exactly as much as to anything drafted by a different agent or a different session.',
    ].join('\n');

    const task = [
      'Perform a fit-check-and-coherence audit of this project\'s six governing artifacts, then return exactly one fit result. Cover, at minimum, all of the following.',
      '',
      '1. Locate and fully read each of these six governing artifacts, directly from the project:',
      GOVERNING_ARTIFACTS,
      '',
      `2. For each artifact, determine and report whether it is actually ratified. ${ANTI_SELF_RATIFICATION_LINE}`,
      'After reconciling the Owner-reported decision ledger with the exact artifacts, append only those explicit decisions — stage, artifact identity/path, decision meaning, Owner-reported source, and recorded time — to the existing durable decision/ratification log named by the source-of-truth map. This is an administrative record of what the Owner already decided, not authority to edit the artifact or invent a missing approval. If no designated durable log exists, report that as blocking instead of creating a new source of truth by guesswork.',
      '',
      '3. Cross-check the six artifacts against each other for contradiction. At minimum: confirm the precedence order stated in the rulebook matches the one named in the source-of-truth map; confirm the roadmap\'s checkpoints do not contradict the Capstone\'s stated scope, non-goals, or acceptance bar; confirm the role contracts name only the six roles this method defines (Architect/Owner, Orchestrator, Engineering Lead, Builder, Component Critic, Integration Critic) and introduce no coordinating role beyond them; confirm the adopted forms actually cover what the roadmap\'s first checkpoint will need to run (at minimum something serving as a checkpoint brief, a builder assignment, a critic verdict, and a return packet). List every contradiction you find, quoting the conflicting language from each side — do not silently resolve a contradiction yourself; report it.',
      '',
      `4. Determine the fit result using these three defining properties: does this project have a real, versioned artifact worth defending; an acceptance condition specific and falsifiable enough that a reasonable reviewer could disagree about whether it was met; and a genuine cost to getting it wrong? Weigh this honestly against the risk tolerance the human stated earlier in this process${riskLabel ? ` (recorded as "${riskLabel}")` : ''} — a stated high stakes answer does not by itself guarantee FIT if the actual artifacts you found do not back it up, and a stated low stakes answer does not by itself force NOT_FIT if the artifacts show real, disagreeable stakes. Return exactly one of:`,
      FIT_DEFINITIONS,
      '',
      confidenceLevel === 'hunt'
        ? '5. The human explicitly asked you to actively hunt rather than confirm — before settling on a fit result, actively try to break the coherence of what you found: look for the contradiction that would be easiest to miss on a quick pass, not just the ones that jump out immediately.'
        : confidenceLevel === 'unsure'
          ? '5. The human is honestly unsure this project needs all this ceremony. Treat that as a real hypothesis to test, not a mood to reassure away — if your investigation genuinely supports NOT_FIT, report it plainly as the correct outcome rather than searching for a way to justify continuing.'
          : '5. The human expects this audit to mostly confirm what is already in place. Run the full audit anyway — do not shorten it because a clean result seems likely; a confirming result must still rest on the same direct evidence a skeptical result would need.',
      '',
      '6. Only if your fit result is FIT or FIT_WITH_REDUCED_PROFILE, propose exactly one first eligible checkpoint drawn from the ratified roadmap — name which checkpoint, why it has no unresolved dependency blocking it, and what would make it a reasonable place to start. This is a proposal for the human to consider, not a checkpoint brief — do not attempt to write the full checkpoint brief itself here; that is a separate, later step with its own required fields once the human decides to proceed.',
    ].join('\n');

    const constraints = [
      'Do not draft, edit, or "clean up" any of the six governing artifacts in this stage. The sole permitted administrative write is appending reconciled, explicit Owner decisions to the already-designated durable decision/ratification log; it may not alter artifact content or expand an approval.',
      'Do not treat a FIT_WITH_REDUCED_PROFILE finding as license to quietly invent the non-Git equivalent yourself — name specifically what the Git-shaped mechanism assumed that this project cannot provide, and describe what a documented equivalent would need to cover, but leave adopting it as a decision for the human and a later stage.',
      'Do not soften a NOT_FIT result into something that sounds more encouraging. If the honest finding is that this project\'s risk does not justify this operating system, say that plainly — that is a correct and useful outcome of this stage, not a failure to be managed.',
      'Do not propose more than one first eligible checkpoint, and do not begin any actual checkpoint work, regardless of how confident the fit result is.',
    ].join('\n');

    const deliverables = [
      'A written fit-check-and-self-audit report, saved inside the project, covering: the ratification status of each of the six governing artifacts with the evidence behind each determination; every contradiction found between artifacts (or an honest statement that a genuine search found none); and one explicit fit result stated as exactly FIT, FIT_WITH_REDUCED_PROFILE, or NOT_FIT.',
      'The existing durable decision/ratification log updated with the reconciled Owner-reported decisions, or an explicit blocking finding that no designated log exists or a ledger entry conflicts with the named artifact.',
      'If the result is FIT or FIT_WITH_REDUCED_PROFILE, the report also names exactly one proposed first eligible checkpoint and the reasoning behind proposing it.',
      'If the result is FIT_WITH_REDUCED_PROFILE, the report names precisely what non-Git equivalent this project still needs to document before that first checkpoint can run.',
    ].join('\n');

    const qualityGates = [
      'The fit result must appear as one of the three exact terms — FIT, FIT_WITH_REDUCED_PROFILE, or NOT_FIT — not a paraphrase or a hedge; a report that only says something like "this looks mostly ready" has not met this stage\'s bar.',
      'Every ratification determination must cite specific evidence (or its concrete absence) rather than an inference from a document\'s polish or completeness.',
      'Every contradiction reported must quote the conflicting language from both sides, not just describe the disagreement in the abstract.',
      'A NOT_FIT or FIT_WITH_REDUCED_PROFILE result is not, by itself, a defect in this stage\'s output — a report that reaches either honestly, with evidence, has met the bar exactly as well as one that reaches FIT.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume any of the six artifacts is ratified because it exists, because a DRAFT label was removed, because it looks complete, or because an earlier turn in this conversation treated it as settled.',
      'Do not assume the volume of work already completed across stages 2 through 8 is itself evidence that this project is a fit for the operating system it has been assembling — effort spent and correctness of fit are unrelated questions.',
      'Do not assume the human\'s stated confidence level changes what counts as ratified or consistent — it only calibrates how hard you look, never what standard of evidence you accept.',
      'Do not assume a contradiction you cannot immediately resolve should be quietly smoothed over in whichever direction makes the audit conclude faster.',
    ].join('\n');

    const stopConditions = [
      'Stop and return to the human, rather than guessing, if any of the six governing artifacts cannot be located at all, if you cannot determine who — if anyone — actually holds ratification authority over a specific document, or if two governing artifacts contradict each other in a way that changes which fit result applies depending on which one you trust.',
      'Stop if you find yourself about to propose a first eligible checkpoint despite an unresolved contradiction in the artifacts it would depend on — resolving the contradiction, or reporting it as blocking, comes first.',
    ].join('\n');

    const approvalBoundary = 'Your fit result and self-audit are a report for the human Owner to review, not a decision that is already in force. Reaching FIT does not authorize starting the proposed first checkpoint, issuing a checkpoint brief, or touching any project file beyond producing this report — that requires the human\'s own separate, explicit decision to proceed, made after reading what you found.';

    const terminalReturn = [
      '"Done" for this stage means: each of the six governing artifacts was read directly and its ratification status reported with concrete evidence; every contradiction found between artifacts was reported with the conflicting language quoted from each side (or an honest statement that a genuine search found none); exactly one fit result was returned in exactly one of the three defined terms; and, only if that result was FIT or FIT_WITH_REDUCED_PROFILE, exactly one first eligible checkpoint was proposed with its reasoning.',
      'Report every assumption you had to make and why, every unresolved conflict you found and could not resolve yourself, and stop there for the human\'s review. If authority over any document, or which document is actually the current source of truth, could not be established, say so plainly rather than picking one and proceeding as though the question were settled.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'repair-contradiction',
      label: 'Repair a contradiction the fit check exposed',
      description: 'Use instead of the primary prompt when a completed fit check already reported a specific contradiction between two governing artifacts, and you need it resolved before treating this project as ready for its first checkpoint.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';

        const roleAndAuthority = [
          `You are repairing one specific, already-identified contradiction between two of ${ctx.projectName}'s governing artifacts — not re-running the whole fit check from scratch, and not drafting new governance material beyond what the repair requires.`,
          'You hold no authority to ratify the repair. You may propose the minimal correction that resolves the contradiction; the human Owner alone decides whether to accept it.',
        ].join('\n');

        const stageObjective = 'Resolve one specific contradiction between two governing artifacts, previously surfaced by a fit check, with the smallest change that makes both artifacts consistent again — without introducing a new role, a new precedence rule, or scope beyond the contradiction itself.';

        const humanIntent = [
          quoteHumanInput('The contradiction the human wants resolved, in their own words', freeText || answers.secondThoughts),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(fresh);

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of the fit check that found this contradiction. Verify it from scratch rather than trusting the human\'s description alone:',
              '- Read both governing artifacts named or implied by the human\'s description, in full, directly from the project.',
              '- Confirm the contradiction actually exists as described — quote the conflicting language from each side yourself before proposing anything.',
              '- Read the rulebook\'s and source-of-truth map\'s stated precedence order, since which artifact should yield is usually decided by that order, not by which one is easier to change.',
              '- Check whether either artifact shows evidence of ratification; a repair to an unratified draft is a normal edit, while a repair to something already ratified needs to be flagged as an amendment requiring the human\'s fresh sign-off.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than repair from memory:',
              '- Re-read both governing artifacts\' current, saved content directly, and re-confirm the contradiction in the specific language actually on disk right now.',
              '- Re-read the rulebook\'s and source-of-truth map\'s precedence order to confirm which artifact should yield.',
              '- Re-check whether either artifact has since been ratified since the fit check ran; that changes whether this is a normal edit or an amendment needing fresh sign-off.',
            ].join('\n');

        const precedence = [
          'Resolve the contradiction using this project\'s own precedence order, highest first: (1) explicit evidence of Owner ratification of one side over the other, (2) the durable record of actual decisions, (3) the exact ratified Capstone or roadmap section bearing on the question, (4) the rulebook\'s and role contracts\' stated boundaries, (5) the adopted forms, (6) verified actual project state.',
          'If the precedence order genuinely does not resolve which side should yield — for example both artifacts are equally ratified and equally specific — that is itself a stop condition, not something to decide by guessing.',
        ].join('\n');

        const task = [
          'Confirm the exact contradiction: quote the conflicting sentence or section from each of the two artifacts.',
          'Using the precedence order above, determine which artifact should yield, or whether the correct fix touches both because neither is simply wrong — sometimes a contradiction reveals that both were drafted from a shared, now-outdated assumption, and the honest fix updates both consistently.',
          'Propose the minimal edit that resolves the contradiction, changing as little else as possible, and clearly mark it PROPOSED — NOT YET RATIFIED if the artifact being changed was already ratified.',
        ].join('\n\n');

        const constraints = 'Do not use this repair as an opportunity to also revise unrelated parts of either artifact. Do not resolve the contradiction by inventing a new role, a new precedence tier, or a new artifact — the fix must stay inside the six governing artifacts and the precedence order already established.';

        const deliverables = 'A short repair note quoting the original contradiction from both sides, stating which precedence rule resolved it (or why it could not be resolved by precedence alone), and the proposed minimal edit to the artifact(s) involved, clearly labeled as a proposal pending the human\'s review.';

        const qualityGates = 'The proposed edit must eliminate the specific contradiction quoted, must not introduce a new one elsewhere in either artifact, and must not silently expand any role\'s authority as a side effect of the fix.';

        const prohibitedAssumptions = 'Do not assume the more recently drafted of the two artifacts is automatically correct — resolve by precedence and ratification evidence, not recency. Do not assume the human wants the contradiction resolved in whichever direction requires less rewriting.';

        const stopConditions = 'Stop and return to the human if the precedence order does not clearly resolve which artifact should yield, if fixing this contradiction would require reopening an already-ratified document\'s core scope rather than a narrow correction, or if you discover the contradiction is actually one instance of a broader pattern across more than these two artifacts — that is a signal to recommend a full fit-check re-run, not to patch piece by piece.';

        const approvalBoundary = 'This repair is a proposal until the human Owner reviews it. Do not treat the contradiction as resolved, and do not treat either artifact as re-ratified, until the human says so explicitly.';

        const terminalReturn = [
          '"Done" for this recovery means: the original contradiction is quoted from both sides; the precedence reasoning that resolved it (or the reason it could not be resolved) is stated; and a minimal proposed edit exists, clearly marked as unratified until the human reviews it.',
          'Report exactly what you changed or propose to change, what you verified directly versus took from the human\'s description, and stop there for review rather than treating this project as ready for its first checkpoint on the strength of this repair alone.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'return-for-decision',
      label: 'Return to the human for a decision the self-audit surfaced',
      description: 'Use instead of the primary prompt when a fit check already ran and surfaced something only the human can decide — for example an artifact that was never actually ratified, or a genuine open question about whether this project is really a fit — and you need that framed clearly for a decision, not investigated further.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';

        const roleAndAuthority = [
          `You are preparing a decision request for the human Architect/Owner of ${ctx.projectName}, based on something a prior fit check already surfaced that only they can resolve. You are not re-running the audit and not making the decision yourself — you are making sure the human has everything they need to decide, clearly and completely, in one place.`,
        ].join('\n');

        const stageObjective = 'Take an unresolved item a fit check already surfaced and turn it into a clear, complete decision request the human can actually act on — the exact question, why it cannot be resolved without them, and the real options with honest tradeoffs for each.';

        const humanIntent = [
          quoteHumanInput('What the human believes the self-audit surfaced that needs a decision, in their own words', freeText || answers.secondThoughts),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(fresh);

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of the fit check that surfaced this item. Before framing the decision, verify it directly:',
              '- Read whichever governing artifact(s) the open item concerns, in full, directly from the project.',
              '- Confirm the item genuinely cannot be resolved by investigation alone — that it is a real judgment call (for example, whether this project\'s risk actually justifies the ceremony assembled so far, or which of two equally plausible readings of a document the human actually intended) rather than something you could have checked yourself.',
              '- If the open item concerns whether an artifact was ratified, look for any evidence of ratification yourself before concluding none exists.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify before framing the decision:',
              '- Re-read the specific artifact(s) the open item concerns, directly and current, rather than from memory of the fit check that surfaced it.',
              '- Confirm the item still cannot be resolved by investigation — check whether anything has changed since the fit check ran that might have already resolved it.',
            ].join('\n');

        const precedence = 'Use this project\'s own precedence order to confirm the item genuinely requires the human\'s judgment rather than resolving by rule: Owner-ratified governance, then the durable decision record, then the ratified Capstone or roadmap section, then the rulebook and role contracts, then the adopted forms, then verified actual state. If the precedence order alone would settle the question, resolve it that way and say so instead of escalating it needlessly.';

        const task = [
          'State the exact open item precisely — quote the specific line, artifact, or finding from the fit check that raised it, not a paraphrase.',
          'Explain concretely why this cannot be resolved by further investigation and genuinely requires the human\'s own judgment — for example because it depends on risk tolerance, acceptable tradeoffs, or intent that only the human can state.',
          'Lay out the real options available, with an honest account of what each one costs and what it protects — including, where relevant, the option of accepting a NOT_FIT result and not proceeding with this operating system at all. Do not present a single recommended path dressed up as several options.',
        ].join('\n\n');

        const constraints = 'Do not make the decision on the human\'s behalf, even if one option seems obviously better. Do not soften a genuinely uncomfortable option (including NOT_FIT, or "the artifact you thought was ratified was not") to make the decision feel easier — present it plainly.';

        const deliverables = 'A decision request: the exact open item quoted from its source, why it requires the human\'s judgment, and the real options with honest tradeoffs for each, ending in a direct question the human can answer in one response.';

        const qualityGates = 'The decision request must be answerable by the human in a single response, without needing to go re-read source material themselves first. Every option presented must be genuinely available and honestly described, including its downsides.';

        const prohibitedAssumptions = 'Do not assume the human already remembers the details of the original fit check that surfaced this item — restate what is needed, quoted from source, so the request stands on its own. Do not assume there are only two options when a third genuinely exists.';

        const stopConditions = 'Stop before sending the request if, while re-verifying, you discover the item has already been resolved by something that happened since the fit check ran — report that instead of asking a now-moot question.';

        const approvalBoundary = 'This is a request for the human\'s decision, not a proposal awaiting rubber-stamp approval. Do not proceed with any option, including the one you judge most likely, until the human explicitly chooses it.';

        const terminalReturn = [
          '"Done" for this recovery means: the open item is stated precisely with its source quoted; why it requires the human\'s judgment is explained; the real options are laid out with honest tradeoffs; and the request ends in one direct, answerable question.',
          'Do not proceed with any next step — including treating this project as ready for its first checkpoint — until the human responds with an explicit decision.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'The bootstrap is where this method stops being a set of documents and starts being an operating system that governs real work. Everything before this stage produced a draft; this stage is the one place that asks, with genuine skepticism, whether those drafts are actually ratified, whether they actually agree with each other, and whether the project they describe actually needs any of this in the first place. Skipping or rushing it means the first real checkpoint inherits whatever was silently wrong in stages 2 through 8, at exactly the moment the stakes stop being hypothetical.',
    problemPrevented: 'Without a genuine fit-and-coherence check, a project can accumulate eight stages of plausible-looking governance documents that were never actually reviewed against each other — a rulebook whose precedence order quietly differs from the source-of-truth map, a roadmap whose first checkpoint contradicts a non-goal stated in the Capstone, role contracts that assume tooling the human never confirmed. None of these individually looks alarming while drafting; together, they mean the first checkpoint starts on a foundation nobody actually verified holds. This stage exists to catch exactly that class of problem before real work — and real cost — depends on it.',
    judgmentVsInvestigation: 'Whether everything drafted so far actually holds together, and how hard the audit should look, starts from the human\'s own honest sense of confidence — only the human can say whether they are worried, and naming that worry (or its absence) is a judgment call, not a fact to investigate. Everything the audit then does — reading each artifact, confirming ratification evidence, cross-checking for contradiction, verifying actual repository state, weighing the three FIT-defining properties against what was actually found — is investigation the agent must perform directly. The one exception is the fit result itself where a contradiction remains genuinely irresolvable by precedence: that goes back to the human as a real decision, never a coin flip the agent makes to keep moving.',
    promptAnatomy: 'This stage\'s prompt reproduces the six governing artifacts by name and the full anti-self-ratification standard directly in the task layer, because the receiving agent must be able to run this audit against a project that has never heard of this guide or its source method — nothing here may depend on the agent fetching anything from outside the human\'s own project. The investigation layer is written to diverge sharply between fresh and same-conversation modes: a fresh agent has to rebuild ratification evidence and cross-artifact consistency entirely from what it reads on disk, while a same-conversation agent is explicitly warned that its own memory of drafting these documents is not evidence they were ratified or that they still say what it remembers. The confidence-level answer flows into both the investigation and task layers as a dial on thoroughness and skepticism, never as a shortcut that skips any part of the audit.',
    authorityBoundary: 'The agent running this stage holds no ratification authority of any kind — not over the six artifacts it is auditing, and not over its own fit result. A FIT result is a report the human reviews, not an event that itself authorizes the first checkpoint to begin; issuing an actual checkpoint brief and starting real execution are separate, later actions that require the human\'s own further decision. This mirrors the method\'s core discipline that no role\'s claim about itself, or about the state it inspected, promotes itself into a decision only the human Owner can make.',
    inputsAndSources: 'Inputs are the human\'s stated confidence level, anything they are reconsidering, the free-text field, and — the actual substance of this stage — the six governing artifacts produced in stages 2 through 8, read directly from the project\'s own files, plus the project\'s actual current repository and versioning state. No file, path, or document from outside the human\'s own project is ever a valid source here; earlier stages\' recorded answers (risk tolerance, in particular) inform the fit judgment but never substitute for reading the artifacts themselves.',
    outputsAndEvidence: 'The required output is a single written report containing one explicit fit result in one of exactly three terms, a ratification determination with concrete evidence for each of the six artifacts, every contradiction found (quoted from both sides) or an honest statement that none were found, and — only on FIT or FIT_WITH_REDUCED_PROFILE — exactly one proposed first eligible checkpoint. Evidence is the report\'s own specificity: a stranger reading it should be able to see exactly what was checked, what was found, and why the fit result follows from those findings, rather than a confident conclusion with nothing underneath it.',
    failureModes: [
      'Treating "the documents exist and look complete" as equivalent to "the documents are ratified," and reporting FIT without ever locating actual ratification evidence for any of the six artifacts.',
      'Auditing each artifact in isolation and never actually cross-checking them against each other, so a real contradiction between the rulebook and the source-of-truth map, or between the roadmap and the Capstone, goes unnoticed.',
      'Treating NOT_FIT as an unacceptable answer to reach, and quietly reframing marginal findings toward FIT because eight stages of work already happened and stopping now would feel wasteful.',
      'Drafting or fixing problems discovered during the audit instead of reporting them — turning a fit check into an uninvited round of revision that the human never asked for or reviewed.',
      'Writing a checkpoint brief with its full eleven fields as part of the "proposed first checkpoint," rather than naming and justifying which checkpoint should go first and leaving the actual brief to its own later step.',
    ],
    weakResultSigns: [
      'The report states a fit result but the surrounding text never quotes a single piece of evidence — no ratification note, no contradiction, no artifact excerpt — that a skeptical reader could check.',
      'Every one of the six artifacts is described as "ratified" with the exact same one-line justification, suggesting a template was filled in rather than six independent checks actually performed.',
      'The report finds zero contradictions on a first pass across six independently drafted documents — possible, but worth treating as a signal to double-check the audit was genuinely adversarial rather than a quick skim.',
      'A FIT_WITH_REDUCED_PROFILE result never actually names what the Git-shaped mechanism assumed or what a documented equivalent would need to cover — leaving the "reduced profile" as vague as the gap it is supposed to describe.',
    ],
    customization: 'Two things here are safe to adapt and one is not. Safe to adapt: the shape of the profile. If your work is not in Git — a research corpus, a design system, a set of regulatory documents — you are not failing the fit check, you are heading for FIT_WITH_REDUCED_PROFILE, and your job is to name the documented equivalent for each mechanism the Git-shaped default assumes: what serves as an immutable candidate identity, what serves as an independently resolvable evidence identity linked to it, how you would detect that a reviewed dependency changed, how you keep a single writer, and how you preserve evidence before anything is reclaimed. Write those down as concretely as a commit hash, or the reduced profile is just a word. Also safe to adapt: the depth of the audit. A two-week solo project genuinely can be audited in one pass; a program with several tracks and outside stakeholders deserves an artifact-by-artifact sweep with quoted evidence for each determination. What is not safe to adapt is the standard the audit applies. Ratification is an affirmative human act — never inferred from a document existing, from a DRAFT label being removed, from an agent\'s own claim of readiness, or from your silence. Loosening that is not a customization; it is the failure the bootstrap exists to prevent. And if the honest answer is NOT_FIT, take it: the method says outright that it should not be adopted where the ceremony costs more than the risk it controls.',
    whenToStop: 'Pause before treating any fit result as final if the report reads more like reassurance than an audit — if you cannot point to the specific evidence behind each ratification determination, or the specific quoted language behind each reported contradiction (or the specific absence of one), the audit is not actually done, regardless of which of the three fit terms it landed on. A NOT_FIT result deserves exactly as much scrutiny and respect as a FIT result — resist the urge to re-run the audit repeatedly hoping for a different answer once a genuinely honest one has already been reached.',
    auditWithoutPasting: 'You do not need to paste the six governing artifacts, or the audit report itself, back into this website to sanity-check the result. Instead, in your agent\'s own conversation, ask it to name the single piece of evidence it is relying on for the ratification status of any one artifact you pick at random, and to quote the exact conflicting language for any one contradiction it reported (or explain concretely what it checked to conclude none exist). If it cannot answer either question with something specific, the audit needs another, more rigorous pass before you rely on its fit result.',
    weakVsStrongExample: {
      weak: '"I reviewed everything and it all looks good — FIT." No artifact-by-artifact ratification evidence, no cross-artifact contradiction check, no acknowledgment that NOT_FIT was ever a live possibility.',
      strong: '"The Capstone shows an explicit human ratification note dated after the DRAFT label was removed; the roadmap and rulebook precedence orders match verbatim; the role contracts name only the six defined roles; the forms set covers a checkpoint brief, builder assignment, critic verdict, and return packet. One contradiction found: the source-of-truth map names the roadmap document as authoritative for checkpoint order, while the rulebook\'s escalation section still references an earlier, superseded ordering — quoted both below — and needs the human\'s decision on which stands. Fit result: FIT, contingent on resolving that one contradiction. Proposed first checkpoint: checkpoint 1 from the roadmap, which has no upstream dependency and matches the Capstone\'s stated acceptance bar."',
    },
  },
};
