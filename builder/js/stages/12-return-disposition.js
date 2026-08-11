import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../lib/schema.js';

const REVIEW_DEPTH_HELP = 'A full technical re-review is the Critics\' job, already done before this stage. Your choice here is how much of the resulting paperwork you personally read before deciding LAND or DISCARD — not how carefully the work itself was checked.';
const DISPOSITION_LEAN_HELP = 'This is not the actual decision — that happens after you see what comes back. It only tells the agent how much to spell out the tradeoffs versus assume you already know what you want.';

const DONE_MEANINGS = [
  '1. Technical PASS — the final artifact meets the ratified acceptance bar, confirmed by a fresh Integration review.',
  '2. Terminal return — the execution side stopped and handed back exactly one complete report covering the whole checkpoint.',
  '3. Supported receipt — an Orchestrator-style check confirmed that report is honest, complete, and traceable to real evidence. This is not a second technical review.',
  '4. Disposition — you, the human, chose LAND or DISCARD. Only you make this call, and only after a supported receipt exists.',
  '5. Lifecycle closure — evidence is preserved, anything that needs to point at it is repointed, and only resources created for this checkpoint are cleaned up.',
].join('\n');

// Each of these maps the *three* real states of the answer — chosen, chosen, or explicitly
// delegated — rather than collapsing "not summary" into "read it all closely". A binary
// ternary here would state a preference the human never expressed as if they had.
function reviewDepthText(reviewDepth) {
  if (reviewDepth === DELEGATE_VALUE) {
    return 'The human has not decided how they want to read this report and asked you to recommend rather than assume. Produce the complete report, and open it with a short note on which parts you think most deserve their attention for this particular checkpoint and why — presented as your recommendation, not as their instruction.';
  }
  return reviewDepth === 'summary'
    ? 'The human wants you to lead with the checklist mapping and the largest remaining gaps rather than making them read the full report unguided — summarize what matters most first, but still make the complete report available.'
    : 'The human intends to read the full report closely themselves — do not compress or omit sections on the assumption they only want a summary.';
}

function reviewDepthQuoted(reviewDepth) {
  if (reviewDepth === DELEGATE_VALUE) return 'Not decided — the human asked you to recommend what deserves their attention';
  return reviewDepth === 'summary'
    ? 'Focus on the checklist mapping and the largest remaining gaps first'
    : 'Read the full report closely';
}

function dispositionLeaningText(dispositionLeaning) {
  if (dispositionLeaning === DELEGATE_VALUE || !dispositionLeaning) {
    return 'The human did not say in advance how they expect to decide, so do not assume either way: lay out concretely what LAND would mean (accepting this exact result into the project\'s authoritative destination) and what DISCARD would mean (rejecting it while still preserving the evidence of what was tried), and leave the choice entirely open.';
  }
  return dispositionLeaning === 'undecided'
    ? 'The human is not sure how they will decide yet — lay out, concretely, what LAND would mean (accepting this exact result into the project\'s authoritative destination) versus what DISCARD would mean (rejecting it while still preserving the evidence of what was tried), so they can weigh the actual tradeoff rather than a generic description of the two options.'
    : 'The human already expects to decide LAND or DISCARD themselves — you do not need to sell either option, only make sure the evidence needed to decide is clearly in front of them.';
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'return-disposition',
  number: 12,
  title: 'Return, Receipt & Disposition',
  purpose: "Receive the terminal report on the checkpoint, have it checked for honesty and completeness, and then make your own LAND or DISCARD call — the one decision only you can make.",
  prerequisites: ['first-execution'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The five distinct meanings of "done" — technical PASS, terminal return, supported receipt, disposition, and lifecycle closure — and the rule that none of them implies the next, are enumerated in article.md §11, "Returning is not closing," which adds that "Neither PASS nor landing starts the next unit."',
      'That the Return Packet is the Engineering Lead\'s sole upward artifact (RULEBOOK.md §13) and that the receipt on it is performed by the Orchestrator (§14) are two different tiers doing two different jobs. §14 states the receipt is bounded to the packet and the evidence records it cites, and that the Orchestrator "MUST NOT open or review source/content as a second reviewer, rerun tests, rederive metrics, inspect generated technical outputs, inspect Builder workspaces, or read the Lead\'s workbench," because that "would collapse the authority split." This stage\'s two operating modes carry that split.',
      'The four terminal states (PASS, BLOCKED, PLATEAU, BUDGET_EXHAUSTED) are RULEBOOK.md §12; the supported/rejected receipt result and its PASS-specific gates are §14; and that LAND is Owner-only, that disposition precedes mechanical reclamation, and that preservation precedes deletion are §15 and §16, with article.md §11 on how LAND and DISCARD preserve different facts.',
      'Reporting an explicit "not created — [reason]" rather than fabricating a resource to fill a field, and accepting such a claim only where the resource genuinely never existed, are the honest non-PASS rules in RULEBOOK.md §11 and the conditional integrity checks in §14.',
    ],
    adapted: [],
    productDesign: [
      'Presenting the terminal return, the receipt check, and the human\'s disposition as one stage of this journey — while keeping the return and the receipt in two separate agent contexts, carried by the stage\'s two operating modes — is this guide\'s own packaging. The authority split itself is not negotiable and is not this guide\'s invention; what this guide chose is to surface it as one screen with two prompts rather than two stages ending in two human dispositions over the same event.',
      'The reviewDepth and dispositionLeaning questions, and their specific wording, are this guide\'s own addition — the source method does not ask the human to pre-declare how they want to read a report.',
    ],
  },
  questions: [
    {
      id: 'reviewDepth',
      type: 'radio',
      label: 'How do you want to review what comes back?',
      help: REVIEW_DEPTH_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Sets whether the generated prompt asks the agent to lead the report with a checklist-and-gaps summary, or to expect the human to read the full report unguided.',
      options: [
        { value: 'full', label: 'Read the full report closely myself', description: 'Give me everything, in full.' },
        { value: 'summary', label: 'Focus on the checklist mapping and the largest gaps', description: 'Point me to what matters most first.' },
      ],
    },
    {
      id: 'dispositionLeaning',
      type: 'radio',
      label: 'Do you already know how you\'ll decide once this comes back?',
      help: DISPOSITION_LEAN_HELP,
      required: false,
      allowDelegate: true,
      affectsPrompt: 'Determines whether the generated prompt assumes the human already knows they will decide LAND/DISCARD themselves, or asks the agent to lay out the tradeoffs of each option explicitly.',
      options: [
        { value: 'decided', label: "I'll decide LAND or DISCARD myself once I see it", description: 'No need to walk me through the options.' },
        { value: 'undecided', label: 'Not sure yet', description: 'Lay out the tradeoffs when it returns.' },
      ],
    },
  ],
  agentProduces: 'Two things, from two different agents: the side that executed the checkpoint assembles one consolidated return report naming its terminal result (PASS, BLOCKED, PLATEAU, or BUDGET_EXHAUSTED) and stops; a separate agent that did not run the work then checks that report against real evidence and returns one supported-or-rejected finding, plus the evidence and live-resource picture you need to decide LAND or DISCARD yourself.',
  // This stage's two modes are not "same conversation or a new one" — they are the two sides of
  // the authority split (RULEBOOK.md §13 writes the packet, §14 checks it). Both are needed, in
  // that order, and the labels say so rather than leaving the human to pick one and stop.
  modeLabels: { same: '1. Assemble the report', fresh: '2. Check it independently' },
  modeHelp: {
    same: 'Step 1 of 2 — run this in the conversation that executed the checkpoint. It assembles the return report and stops there.',
    fresh: 'Step 2 of 2 — run this in a NEW conversation, with a different agent that did not do the work. Checking your own report is the one thing this step cannot be.',
  },
  freeTextLabel: 'Anything else the agent should understand before assembling the return report?',
  completionGate: [
    { id: 'terminalStated', label: 'The report states one explicit terminal result — PASS, BLOCKED, PLATEAU, or BUDGET_EXHAUSTED — not a vague "mostly done."', kind: 'confirm', required: true },
    { id: 'receiptChecked', label: 'The report was checked against real evidence by an agent that did not run the checkpoint — I ran the receipt prompt in a separate conversation, rather than letting the executing agent vouch for its own report.', kind: 'confirm', required: true },
    { id: 'receiptSupported', label: 'The bounded receipt result is SUPPORTED, not REJECTED. If it was REJECTED, I stopped here and handled it case by case with the Orchestrator instead of accepting this stage.', kind: 'confirm', required: true },
    { id: 'receiptBounded', label: 'The checking agent stayed inside the receipt envelope and did not quietly become a second technical reviewer.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'I can see what still exists (branches, evidence, open items) well enough to decide LAND or DISCARD, or to understand why the checkpoint did not reach PASS.', kind: 'confirm', required: true },
    { id: 'ownerDisposition', label: 'After the supported receipt, I made one explicit Owner decision: LAND (only for a supported PASS) or DISCARD. I did not treat PASS, SUPPORTED, or silence as that decision.', kind: 'confirm', required: true },
    { id: 'lifecycleClosed', label: 'The lifecycle record is CLOSED: evidence was preserved where it existed, live citations were repointed, only checkpoint-owned resources were reclaimed, and unknown resources were left for human judgment.', kind: 'confirm', required: true },
    { id: 'ownPublish', label: 'I understand that LAND, or any publish, deploy, or merge-to-main action, is mine to perform by hand — the agent did not do it for me.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the return report (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';
    const reviewDepth = answers.reviewDepth;
    const dispositionLeaning = answers.dispositionLeaning;

    // The method splits this stage across two authority tiers: the Engineering Lead assembles
    // the Return Packet (RULEBOOK.md §13) and the Orchestrator performs the bounded receipt gate
    // on it (§14), which explicitly forbids the receipt from becoming a second technical review.
    // Those two jobs must not be done by the same context — a report that checks itself is the
    // exact self-certification this method exists to prevent. So the two operating modes carry
    // the split: "same agent" is the execution side and stops at the packet; "fresh agent" is
    // the receipt side and never re-reviews the work.
    const roleAndAuthority = fresh
      ? [
        'You are performing the receipt check on a checkpoint that someone else executed. You did not do this work, and you must not now re-do its technical review: your job is to check the envelope — that the return report is authorized, complete, internally honest, and traceable to evidence that actually resolves — not to re-judge whether the code or artifact is any good. That judgment already happened, in the Critic verdicts, and repeating it here would just create a second reviewer with less context than the first.',
        'You hold no authority to decide LAND, DISCARD, or whether the project continues. Those are the human\'s alone. Your output is a finding: supported, or rejected with every failed check named.',
      ].join('\n')
      : [
        'You are the execution side closing out one checkpoint: your job is to assemble one honest, complete terminal report of what actually happened, and then stop.',
        'You must not perform the receipt check on your own report. A report that certifies itself is exactly the self-certification this method exists to prevent, and the check is not yours to do regardless of how confident you are in your own account. Assemble the report, hand it back, and stop there — a separate context that did not run this work performs the check, and the human decides what happens next.',
      ].join('\n');

    const stageObjective = fresh
      ? 'Check an existing return report against real evidence — authorization, completeness, honesty, and identity resolution — and return one finding of supported or rejected, then lay out (without deciding) what the human needs in order to choose LAND or DISCARD, or to understand a non-PASS result.'
      : 'Produce one consolidated return report naming exactly one terminal result and mapping every acceptance-bar item to real evidence, then stop and hand it off for an independent check.';

    const humanIntent = [
      quoteHumanInput('How the human wants to review this', reviewDepthQuoted(reviewDepth)),
      dispositionLeaning === 'decided' || dispositionLeaning === 'undecided'
        ? quoteHumanInput('Disposition leaning', dispositionLeaning === 'decided' ? "The human already knows they'll decide LAND or DISCARD themselves once they see the report" : 'The human is not sure yet and wants the tradeoffs laid out')
        : '',
      quoteHumanInput('Anything else the human wants understood', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = fresh
      ? 'You are a fresh context with no memory of this checkpoint being executed, and that is the point: the report you are checking was written by the side that did the work, and this check only means something because you are not that side. You are expected to have direct read access to the project. Verify everything from the repository and the cited evidence records rather than from anything the report asserts about itself. If you turn out to be the same context that executed this checkpoint, stop and say so rather than checking your own work.'
      : 'You are continuing in the conversation that ran the checkpoint. That continuity does not excuse reporting from memory: re-confirm the actual current state of every branch, evidence record, and verdict directly rather than trusting your own summary from earlier in this conversation. It also does not extend to the receipt check — that belongs to a separate context and is not part of this prompt.';

    const investigation = fresh
      ? [
          'This is a fresh conversation with no memory of any earlier work on this checkpoint, so verify everything from scratch:',
          '- Locate the checkpoint brief that authorized this work and the acceptance bar it named.',
          '- Locate every Critic verdict the packet cites and confirm each record resolves, names an exact reviewed artifact version, and carries a recorded currency determination. Do not open source/content or rerun its technical checks.',
          '- Determine whether the packet\'s stated terminal result is supported by the cited durable records. Do not independently rederive technical PASS, the blocker, the plateau, or the metric; this is an envelope check, not another Critic pass.',
          '- Inventory what actually exists right now: branches, worktrees, evidence records, and anything left over from this checkpoint — including anything unexplained. Report it rather than silently cleaning it up.',
          '- Confirm no work on a later, unauthorized checkpoint happened under this one.',
        ].join('\n')
      : [
          'Even though this continues the same conversation, re-verify rather than assume — do not report the checkpoint\'s outcome from memory of how the work felt while it was happening:',
          '- Re-confirm the actual current state of every Critic verdict and the final review result directly, in case anything changed since you last checked.',
          '- Re-inventory what currently exists (branches, worktrees, evidence records) rather than reusing an earlier count from this same conversation.',
          '- Re-confirm no unauthorized later-checkpoint work crept in during execution.',
        ].join('\n');

    const precedence = 'The checkpoint brief and its cited acceptance bar remain controlling for what "PASS" means here. A verdict is only current evidence if it reviewed the actual final version of the work and nothing it depended on changed afterward — an older verdict on a superseded version does not count, however confident its wording sounds.';

    const task = fresh
      ? [
        'Locate the return report produced for this checkpoint by the side that executed it. If no such report exists, stop and say so — do not reconstruct one yourself from the repository, because a report you wrote is not a report you can check.',
        'Check the report against real evidence, reading only the report and the evidence records it actually cites. Confirm: the authorized target and exactly one checkpoint; the exact ratified anchor and a complete echo of the brief; a declared execution/evidence profile; the actual start state, clock accounting, and one stated terminal result; a checklist mapping that is honest for the result claimed (fully closed for PASS, open items visible for a non-PASS); complete provenance including any reads made after the final verdict; a live-resource picture that matches what you can observe; and every claimed candidate, verdict, or evidence identity actually resolving.',
        'For a claimed PASS only, additionally confirm: every checklist criterion has direct evidence; the component verdicts relied on are durable, version-exact, and still current; a fresh integration review binds the exact final artifact; the final artifact and its evidence record are distinct, resolvable, and correctly linked; and the terminal delta is evidence-only. For a non-PASS, do not demand a verdict, candidate, or evidence record the run never produced — accept an explicit "not created — [reason]" where the resource genuinely never existed, and never let a non-PASS imply technical closure.',
        reviewDepthText(reviewDepth),
        'Compile the live-resource picture: what branches, worktrees, and evidence records exist right now, their current state, and — for anything unexplained — flag it for the human rather than assuming it is fine to ignore or clean up.',
        dispositionLeaningText(dispositionLeaning),
      ].join('\n\n')
      : [
        'Assemble one consolidated return report for this checkpoint. It must state exactly one terminal result — PASS, BLOCKED, PLATEAU, or BUDGET_EXHAUSTED — never an in-between or a vague characterization.',
        'Map every item in the checkpoint\'s acceptance bar to direct evidence: for PASS, every item must be closed with a name-able verdict or artifact behind it; for a non-PASS result, state plainly which items remain open and why. Where a resource genuinely never existed, say "not created — [reason]" explicitly rather than leaving the field blank or inventing one to fill the form.',
        'Include everything the checker will need and cannot get from you later: the authorized target and checkpoint, the exact ratified anchor and a full echo of the brief you were given, the declared execution/evidence profile, actual start state and clock accounting, every component and integration verdict with exact reviewed identities and results, the complete checklist mapping, and exhaustive provenance — including every read you made after the final verdict, and why it did not influence any decision.',
        reviewDepthText(reviewDepth),
        'Compile the live-resource picture: what branches, worktrees, and evidence records exist right now, their current state, and — for anything unexplained — flag it for the human rather than assuming it is fine to ignore or clean up.',
        'Then stop. Do not check your own report, do not declare it supported, and do not begin any later checkpoint. State explicitly that work stopped and that the report awaits an independent check.',
        dispositionLeaningText(dispositionLeaning),
      ].join('\n\n');

    const constraints = [
      fresh
        ? 'Do not become a second technical reviewer. Do not open or read source or generated content to judge its quality, do not rerun tests, do not rederive metrics, do not inspect Builder workspaces, and do not read the execution side\'s private working notes. Read the report and the evidence records it cites — nothing wider. Judging the work again, with less context than the Critics had, would collapse the authority split this check exists to protect.'
        : 'Do not perform the receipt check on your own report, under any name — not as a "sanity check," a "self-review," or a confidence statement that it is complete and honest. Your account of your own work is the thing being checked; it cannot also be the check.',
      'Do not perform, stage, or simulate LAND yourself: no merge to a main or production branch, no publish, no deploy, no tag or release — those actions belong to the human alone, and only after they explicitly choose LAND.',
      'Do not perform DISCARD\'s cleanup steps (deleting branches, reclaiming worktrees) before the human has actually decided — preserving what exists comes first, and only the human\'s explicit decision unlocks any cleanup.',
      'Do not treat a technically supported PASS as automatically meaning the checkpoint should be accepted — that is a judgment about whether the result still serves the human\'s actual goals, and it is the human\'s call, not yours.',
      'Do not collapse the five meanings of "done" into one another: a fresh, current PASS verdict is not the same as a complete report; a complete report is not the same as a checked one; a checked report is not the same as a human decision; and no combination of these opens the next checkpoint on its own.',
    ].join('\n');

    const deliverables = [
      'One terminal result: PASS, BLOCKED, PLATEAU, or BUDGET_EXHAUSTED, stated plainly and once.',
      'A checklist-to-evidence mapping covering every item in the acceptance bar, closed for PASS or explicitly open for a non-PASS result.',
      fresh
        ? 'One receipt finding — supported or rejected — with every failed check named individually. A supported finding permits the human to consider disposition; it does not itself land anything, close the lifecycle, or authorize the next checkpoint.'
        : 'An explicit statement that this report has not been checked by anyone else yet, that no LAND or reclamation has occurred, and that work stopped rather than continuing into a later checkpoint.',
      'A live-resource inventory: branches, worktrees, and evidence records that currently exist, their state, and anything unexplained.',
      'For a supported PASS: what LAND and DISCARD would each concretely mean for this exact result.',
      'For a non-PASS: the smallest exact thing that would need to change for the checkpoint to reach PASS, or the smallest exact human decision needed to unblock it.',
      'Explanation of the five meanings of "done" this stage distinguishes, so the human does not read any one of them as settling the others:',
      DONE_MEANINGS,
    ].join('\n\n');

    const qualityGates = [
      fresh
        ? 'These are the checks your finding must cover, one by one, naming each that fails:'
        : 'These are the questions the independent checker will ask of your report. Make sure it can answer each of them from what you wrote plus the evidence you cited — but do not answer them on the checker\'s behalf or record your own verdict on them:',
      '- Is the target checkpoint and its exact authorized scope named correctly, matching the brief that authorized it?',
      '- Does every claimed verdict actually exist, name the real final version of the work, and remain current — not stale because something it depended on changed afterward?',
      '- For a claimed PASS: does a fresh, independent final review verdict exist and actually cover the complete bar, not just most of it?',
      '- Is the checklist mapping honest for the stated result — complete for PASS, with every open item visible for a non-PASS?',
      '- Does the live-resource inventory match what you can actually observe, including anything unexplained?',
      fresh
        ? 'If any check above fails, the finding is rejected, and it names exactly which checks failed. A rejected finding is a real, useful result — it is not a failure of the run and must not be softened into a supported one with caveats.'
        : 'If you cannot supply what one of those questions needs, say so plainly in the report rather than omitting it — a gap you declare is honest, a gap you leave for the checker to discover is not.',
    ].join('\n\n');

    const prohibitedAssumptions = [
      'Do not assume a result is PASS because the work "seems done" or because earlier steps in this checkpoint reported success — only a fresh, current, complete verdict trail supports PASS.',
      'Do not assume an older verdict still applies if anything it depended on changed afterward — check currency directly rather than trusting the verdict\'s original date or confidence.',
      'Do not assume silence about a branch or leftover resource means it is safe to ignore — report anything unexplained rather than omitting it.',
      'Do not assume the human wants LAND just because the result is PASS — a technically correct result can still be one the human no longer wants; that judgment is theirs.',
    ].join('\n');

    const stopConditions = [
      'Stop and report BLOCKED-style uncertainty rather than guessing if you cannot determine, from real evidence, whether the checklist is actually fully closed, whether a cited verdict is genuinely current, or what currently exists among branches and evidence records.',
      'Stop and flag it explicitly if the report you assembled contains a claim you could not independently verify — do not quietly drop the claim or quietly present it as confirmed.',
    ].join('\n\n');

    const approvalBoundary = "Everything in this stage is preparation for the human's decision, not the decision itself. LAND requires the human's explicit choice, is available only after a supported PASS, and is performed by the human's own hand — not simulated, staged, or performed by you. DISCARD likewise requires the human's explicit choice before any resource is reclaimed.";

    const terminalReturn = fresh
      ? [
        '"Done" for this stage means an independently checked report is in front of the human, with one clear terminal result and one clear receipt finding — not that a decision has been made.',
        'Report the terminal result, the checklist mapping, your finding (supported or rejected) with every failed check named, the live-resource inventory, and — explicitly — that no LAND, publish, deploy, or resource reclamation has happened yet and awaits the human\'s decision. If the finding is REJECTED, return only the gate defects and stop for case-by-case human direction; do not prescribe or begin a repair route.',
      ].join('\n\n')
      : [
        '"Done" for this prompt means one complete, honest report exists and you have stopped — not that the checkpoint is closed, and not that the result has been accepted by anyone.',
        'Report the terminal result, the checklist mapping, the evidence identities you are relying on, the live-resource inventory, and — explicitly — that this report has not yet been independently checked, that no LAND, publish, deploy, or reclamation has happened, and that no later checkpoint was begun.',
        'End by telling the human, in one line, what happens next: an agent that did not run this checkpoint performs the receipt check on this report before any disposition decision is made.',
      ].join('\n\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'resolve-rejected-receipt',
      label: 'Prepare a REJECTED receipt for human decision',
      description: 'Use when a receipt is REJECTED and you need a precise decision packet for the human. This does not repair the report, rerun the receipt, or choose a route; every rejected case returns to the human and Orchestrator on its own facts.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';

        const roleAndAuthority = 'You are the Orchestrator presenting one REJECTED receipt to the human Owner. You may explain the failed gates and the choices they create. You may not repair the Return Packet, modify engineering artifacts, rerun the receipt, choose a route, reclaim resources, or continue the checkpoint without a new explicit human decision.';
        const stageObjective = 'Turn the REJECTED receipt into a concise, evidence-linked decision packet so the human can discuss this specific case with you and decide what, if anything, to authorize next.';
        const humanIntent = [
          quoteHumanInput('How the human wants to review this', answers.reviewDepth === 'summary' ? 'Focus on the checklist mapping and the largest remaining gaps first' : 'Read the full report closely'),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');
        const operatingMode = fresh
          ? 'You are a fresh Orchestrator context with direct read access to the project. Read only the rejected receipt entry, the Return Packet, and the durable evidence records the receipt cites. Do not expand into source/content review.'
          : 'Continue in the Orchestrator conversation that recorded the rejection. Re-read the saved receipt and cited records; do not rely on memory, and do not expand your authority because the human is now present.';
        const investigation = fresh
          ? [
              'Fresh conversation — verify from scratch:',
              '- Read the rejected report and, separately, the specific list of defects that caused rejection.',
              '- For each failed gate, confirm the cited record and exact mismatch within the receipt\'s bounded evidence scope. Do not inspect source/content or rerun a technical test.',
            ].join('\n')
          : [
              'Re-verify rather than assume, even in a continued conversation:',
              '- Re-read the current, saved text of the report and the exact defects cited.',
              '- Re-check each failed gate against only the packet and cited durable evidence.',
            ].join('\n');
        const precedence = 'The ratified checkpoint brief and the bounded receipt rules remain controlling. Rejection changes no bar and grants no repair authority; it only says the packet cannot yet support disposition.';
        const task = [
          'List every failed receipt gate separately. For each: quote the exact packet claim, name the cited evidence or missing evidence, state the precise mismatch, and classify it as documentary, evidentiary, identity/provenance, authorization, live-resource, or unresolved.',
          'State the real decision now in front of the human. Offer only options genuinely supported by this case — for example request a corrected packet, authorize a bounded investigation, discard the attempt, change direction, or leave the checkpoint stopped — with the authority and risk tradeoff of each. Do not select or execute an option.',
          'End with one answerable question to the human. The human may discuss, reject, refine, or authorize a next action case by case; no generic route follows from REJECTED.',
        ].join('\n\n');
        const constraints = 'Do not edit the packet or any artifact. Do not rerun the receipt. Do not convert REJECTED into SUPPORTED with caveats. Do not perform LAND, DISCARD, cleanup, retry, or continuation. Do not present a recommended option as though it were already authorized.';
        const deliverables = 'A read-only REJECTED decision packet: failed-gate table, evidence links, classification, bounded options with tradeoffs, current resource hold state, and one explicit question for the human.';
        const qualityGates = 'Every failed gate remains visible; every option names the new authority it would require; no option is preselected; and resources remain untouched while the human decides.';
        const prohibitedAssumptions = 'Do not assume the packet should be repaired, the checkpoint should be retried, or the attempt should be discarded. Do not assume the rejection itself authorizes a new task.';
        const stopConditions = 'Stop after delivering the decision packet. Wait for the human\'s case-specific direction; if their answer is ambiguous about scope or authority, ask again rather than acting.';
        const approvalBoundary = 'Only the human may choose what follows this REJECTED receipt. Their next message must explicitly authorize any new bounded action; discussion alone is not authorization.';
        const terminalReturn = 'Return the failed-gate decision packet and end with the exact human decision requested. State plainly: REJECTED remains in force, no repair route has been selected, and no state was mutated.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'repair-blocked-return',
      label: 'Repair a BLOCKED or PLATEAU return before deciding disposition',
      description: 'Use instead of the primary prompt when the checkpoint returned BLOCKED or PLATEAU rather than PASS, and you need a clear, minimal picture of exactly what would unblock it before you decide whether to authorize a fix, change direction, or stop.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';

        const roleAndAuthority = 'You are clarifying one non-PASS terminal result (BLOCKED or PLATEAU) so the human can make an informed decision — not attempting to force the checkpoint to PASS, and not deciding what happens next yourself.';
        const stageObjective = 'State plainly and specifically what is blocking this checkpoint, or why further effort under the current approach has stopped producing meaningful progress, and name the smallest exact decision, resource, or change that would move it forward.';
        const humanIntent = quoteHumanInput('Anything the human wants understood about this blocker', freeText);
        const operatingMode = fresh
          ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
          : 'Continue in the same conversation, but re-confirm the current blocking condition directly rather than restating an earlier description of it.';
        const investigation = fresh
          ? 'Fresh conversation — read the actual non-PASS report directly, and independently confirm the blocker or plateau condition still holds right now rather than accepting the report\'s account unchecked.'
          : 'Re-confirm directly that the blocker or plateau condition still holds right now — do not assume it is unchanged from earlier in this conversation.';
        const precedence = 'The checkpoint\'s ratified acceptance bar remains unchanged by a BLOCKED or PLATEAU result — neither status lowers the bar or chooses what happens next. Retry, a corrected brief, changed direction, DISCARD, or leaving the checkpoint stopped are case-specific human decisions.';
        const task = 'Restate the blocker or plateau condition in the smallest, most concrete terms possible: exactly what is missing, contradictory, or no longer improving, and exactly what would need to change — a decision, a credential, a corrected brief, a different approach — for the checkpoint to have a real path to PASS again.';
        const constraints = 'Do not propose weakening the acceptance bar as a way to resolve the blocker. Do not silently continue technical work while producing this clarification.';
        const deliverables = 'A precise statement of the blocking or plateau condition, the smallest exact next decision or resource needed, and what — if anything — remains preserved and usable from work already done.';
        const qualityGates = 'The clarification must name something concrete and actionable, not a restatement like "more time is needed" — if that is genuinely all that can be said, say so explicitly rather than dressing it up as more specific than it is.';
        const prohibitedAssumptions = 'Do not assume the blocker requires starting over — check what, if anything, from the work already done remains valid and reusable once the blocker clears.';
        const stopConditions = 'Stop and say so plainly if the true next step is a decision only the human can make (a priority change, a scope change, an explicit authorization) rather than something you can resolve by investigating further.';
        const approvalBoundary = 'This clarification is informational. Deciding whether to authorize a fix, change direction, or stop the checkpoint entirely is the human\'s call.';
        const terminalReturn = 'Report the precise blocking or plateau condition, the smallest next decision needed, and what remains usable from work already done — nothing more, nothing dressed up as more resolved than it is.';

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'This stage exists because "the work is done" is five different claims wearing one sentence: that the artifact meets the bar, that the execution side actually stopped and reported, that the report itself was checked rather than just written, that a human accepted it, and that cleanup happened. Collapsing them is how a technically-passing checkpoint quietly gets treated as shipped before anyone who could say no actually looked at it.',
    problemPrevented: 'Without separating these five meanings, a common failure looks like this: an agent reports success, the human reads "PASS" and assumes that also means accepted, published, and closed — and only much later discovers the report\'s claims did not hold up, or that publishing was never actually authorized. This stage forces the report to be checked before it is trusted, and forces LAND/DISCARD to be a distinct, explicit human act that nothing else substitutes for.',
    judgmentVsInvestigation: "Only two things here are the human's judgment: how much of the report to read personally, and whether they already know how they'll decide. Everything else — whether the claimed result actually holds up, what evidence exists, what currently exists among branches and records, and what LAND versus DISCARD would concretely mean for this specific result — must be investigated and reported by the agent, never asked of the human as a question they'd have to answer from memory.",
    promptAnatomy: 'This prompt deliberately asks for two things in sequence: first an honest report of what happened, then a separate check of that report against real evidence — mirroring the source method\'s split between a terminal report and an independent receipt check on it. The Required deliverables layer spells out all five meanings of "done" explicitly so the agent\'s report cannot quietly conflate them, and the Human approval boundary layer is unusually blunt: LAND is never simulated, staged, or performed by the agent under any framing.',
    authorityBoundary: 'The agent assembling and checking this report acts in an execution-and-receipt capacity: it may investigate, verify, and lay out tradeoffs, but it holds no LAND, DISCARD, publish, deploy, or continuation authority whatsoever. Those remain the human\'s alone, and this stage is designed so nothing the agent produces can be mistaken for having exercised them.',
    inputsAndSources: 'Inputs are the two structured preferences (review depth, disposition leaning), the free-text field, and — for every substantive claim in the report — the project\'s own checkpoint brief, Critic verdicts, and current live state, all read directly by the agent. No content from outside the human\'s own project is ever a valid source here.',
    outputsAndEvidence: 'The expected output is one report naming a single terminal result, a checklist-to-evidence mapping, a statement of what was checked and how, and a live-resource inventory — never a bare assertion of success. For PASS, evidence should let a stranger independently confirm the bar was met; for a non-PASS, it should let a stranger see exactly what remains open.',
    failureModes: [
      'Reading "PASS" in the report and treating that as equivalent to "accepted, published, and closed" without a separate, explicit LAND decision.',
      'Trusting a verdict that reviewed an earlier version of the work without checking whether it is still current against what actually shipped.',
      'Letting the agent perform LAND\'s mechanics (a merge, a publish) under the theory that it is "just finishing up" once a PASS is reported.',
      'Quietly cleaning up branches or evidence before the human has actually made a disposition decision.',
      'Presenting a non-PASS result with false confidence about exactly what is wrong, when the honest answer is closer to "unclear."',
    ],
    weakResultSigns: [
      'The report states a result without a checklist-to-evidence mapping backing it up.',
      'A cited verdict cannot be tied to a specific, current version of the actual work.',
      'The live-resource inventory is missing entirely, or glosses over something clearly unexplained.',
      'The report subtly implies a decision has already been made ("landed," "shipped") when no explicit human LAND has occurred.',
    ],
    customization: 'For a very small solo project, this stage can be quick — a short report and a five-minute read is entirely appropriate. What should not shrink, regardless of project size, is the separation itself: even a one-person project benefits from a distinct moment where "does this pass" and "do I want this" are answered separately, since they are genuinely different questions.',
    whenToStop: 'Stop before accepting a PASS result if you cannot see a specific, current verdict behind it — a confident-sounding report is not evidence. Stop before choosing LAND if you have not yet been shown what currently exists (branches, evidence) well enough to know what you are actually accepting.',
    auditWithoutPasting: 'Ask the agent, in its own conversation, to point to the exact verdict record and its current-version check for any checklist item you are unsure about, rather than pasting the report into this site for a second opinion. If it cannot show you the specific evidence behind a claim on request, treat that claim as unconfirmed.',
    weakVsStrongExample: {
      weak: '"Everything passed, ready to ship!" — no terminal-state vocabulary, no checklist mapping, no mention of what still exists, and no distinction between a technical result and a decision to publish.',
      strong: 'Terminal result: PASS. Checklist: 4 of 4 items closed, each citing a current, dated verdict tied to the final reviewed version. Live resources: one checkpoint branch, clean, with its evidence record committed alongside it; nothing unexplained. LAND would mean: accepting this exact version into the main branch and tagging its evidence; DISCARD would mean: keeping the evidence trail but not merging it. Awaiting your decision — nothing has been merged or published.',
    },
  },
};
