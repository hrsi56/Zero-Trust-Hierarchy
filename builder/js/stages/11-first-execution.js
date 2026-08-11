import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const DECOMPOSITION_HELP = 'A checkpoint that gets carved into pieces by whoever has an incentive to see it pass tends to get carved in ways that make review easy rather than ways that make engineering sense. Deciding now whether you want to see the split before building starts is a cheap, early check on that.';
const REVIEW_RIGOR_HELP = 'Independent review is what actually enforces the discipline this whole method is built around — more of it costs more time and buys more confidence, which is only worth paying for in proportion to how expensive a wrong PASS would be on this particular checkpoint.';

const DECOMPOSITION_LABELS = {
  'lead-decides': 'Let the Engineering Lead decide how to split the work into pieces',
  'see-split-first': 'I want to see the proposed split before building starts',
};

const REVIEW_RIGOR_LABELS = {
  standard: 'Standard — one Component Critic per piece plus one Integration Critic',
  extra: 'Extra scrutiny — multiple independent Critics per piece',
};

/** Reproduced inline, generically, so the generated prompt is self-contained for the receiving agent. */
const BUILD_CRITIQUE_DISCIPLINE = [
  'A few rules govern every round of this loop, and they are the easiest part of this method to quietly erode under time pressure:',
  '- A Builder never grades its own work and never writes the verdict on whether its own output passes. If you, or any Builder, find yourselves asserting "this is done and correct" as the final word, that assertion is not evidence — it is a claim waiting on independent review.',
  '- A Component Critic reviews the frozen artifact itself, in a fresh context — never the Builder\'s checkout, diff, commit history, reasoning, or narrative account of what it did or why. It works out on its own whether the bar is met; it may run a Builder-written test as one additional piece of evidence, but it must never simply adopt a Builder-supplied "expected result" as the standard it is judging against.',
  '- The Integration Critic is a separate fresh context from every Component Critic and from you as Lead — never a relabeling of one of them. It reviews the complete assembled candidate as a whole, plus whether every component verdict it is relying on is still current, before a checkpoint-level PASS is possible.',
  '- "Fresh" means a genuinely new conversation or context reset with no memory of the Builder\'s or the Lead\'s reasoning — a cooperative procedural control everyone involved agrees to respect, not a cryptographic or operating-system-level sandbox. State it that way plainly rather than implying stronger technical isolation than actually exists.',
].join('\n');

const PRECEDENCE_TEXT = [
  'When sources conflict, this order governs: (1) the project\'s ratified root rulebook, (2) durable project state naming the exact ratified checkpoint brief in force, (3) the specific plan section containing this checkpoint\'s acceptance bar, (4) this Engineering Lead role\'s own contract, (5) other planning documents or maps, (6) the verified actual state of the workspace, repository, environment, or data.',
  'A document or verdict that looks newer, longer, or more confident is not automatically authoritative — only the human Owner\'s ratification, and current verified reality, carry that weight. If the checkpoint brief conflicts with anything else you find, the brief wins for this checkpoint\'s scope unless the human tells you otherwise in this conversation.',
].join('\n');

function operatingModeText(fresh, continuityNote) {
  return fresh
    ? 'Launch the agent from the root of your project and make sure it can read the project files. Do not copy your project documents into this website — this generated prompt is meant to be handed to an agent that already has real file access to your repository.'
    : `Continue in the same agent conversation that completed the previous step. That continuity does not excuse skipping verification here: ${continuityNote}`;
}

function decompositionTask(value) {
  if (value === DELEGATE_VALUE) {
    return 'The human is unsure how much they want to see before building starts. Investigate this checkpoint\'s actual size and risk, propose two or three plausible decomposition approaches — for example fewer, larger pieces built with less interruption, versus many small pieces reviewed more often — with the tradeoffs of each, and pause for the human\'s decision on both the decomposition itself and how much visibility they want into it before you assign any Builder work.';
  }
  if (value === 'see-split-first') {
    return 'The human wants to see your proposed decomposition before any building starts. Propose the pieces, the exact ownership boundary for each, and your intended build order, and pause for the human\'s explicit go-ahead before assigning any Builder work.';
  }
  return 'The human is trusting your engineering judgment on how to split this checkpoint. Decompose it into pieces small enough that each can be judged independently against the bar, and proceed straight to Builder assignments without pausing for a decomposition review — but explain your decomposition rationale in your terminal report so it can be checked after the fact.';
}

function reviewRigorTask(value) {
  if (value === DELEGATE_VALUE) {
    return 'The human is unsure how much independent review rigor this checkpoint needs. Investigate each piece\'s actual risk and reversibility, propose whether standard single-Critic review or extra multi-Critic scrutiny is warranted — per piece, not necessarily uniformly across the whole checkpoint — with tradeoffs, and pause for the human\'s decision before dispatching any Component Critic.';
  }
  if (value === 'extra') {
    return 'This checkpoint calls for extra scrutiny: assign more than one independent Component Critic to each piece, each working in its own separate fresh context with no visibility into any other Critic\'s verdict until all of that piece\'s Critics have reported. Reconcile any disagreement between them yourself, using the bar itself as the tiebreaker, before treating the piece as sound — do not average disagreeing verdicts into a soft pass.';
  }
  return 'Use one Component Critic per piece. That single fresh verdict is sufficient to treat a piece as sound once it reports the bar is met — do not seek a second opinion just to feel safer, and do not skip a piece\'s review because the piece looked simple to build.';
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'first-execution',
  number: 11,
  title: 'First Gauntlet Execution',
  purpose: 'Actually build the checkpoint: bounded Builder work, independent Critic review per piece, and a fresh Integration Critic pass over the whole candidate, looping until the bar is met or an honest non-PASS state is reached.',
  agentProduces: 'The checkpoint\'s real artifact, built through one or more bounded Builder assignments, independently reviewed by fresh Component Critic(s) against the ratified bar, and finally reviewed as a whole by a fresh Integration Critic, repaired and re-reviewed as many times as it genuinely takes, with no fixed round count.',
  prerequisites: ['orchestrator-init'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The Builder Assignment form — one Lead-defined piece, an exact ownership allowlist, required evidence, and the rule that a Builder never pre-answers or receives the acceptance oracle that will judge it — is drawn directly from the method brief\'s form set.',
      'That a Builder never grades its own work, and that a Component Critic reviews only the frozen candidate artifact — never the Builder\'s checkout, diff, reasoning, or narrative — while deriving its acceptance oracle independently rather than adopting a Builder-supplied expected result, is stated directly in the method brief\'s Component Critic Assignment and Critic Verdict forms.',
      'That the Integration Critic is a separate fresh context from every Component Critic and from the Lead, and reviews both the complete candidate and whether every relied-on component verdict is still current, is drawn directly from the method brief\'s Fresh Integration Critic form.',
      'The five terminal states (PASS, BLOCKED, PLATEAU, BUDGET_EXHAUSTED, BRIEF_INVALID), that only the Engineering Lead returns exactly one of them, and that there is no fixed round count for repair and re-review, are stated directly in the method brief.',
      'The framing of "fresh context" as a cooperative procedural control rather than OS-level or cryptographic isolation is stated directly in the method brief and preserved verbatim in spirit in this stage\'s generated prompt.',
    ],
    adapted: [
      'The inner loop this stage actually runs — give a capable lead a concrete, inspectable bar; let the lead decompose work into pieces small enough to judge independently; keep the builder and the critic as genuinely separate agents so the critic judges the real artifact rather than the builder\'s account of it; send back the single largest meaningful gap rather than vague feedback; loop without a fixed round count; and use blind, independent comparison where it helps — is Matt Shumer\'s Gauntlet Loop (https://somethingbig.ai/gauntlet-loop), credited here by name as the replaceable inner execution pattern this stage runs. Zero-Trust Hierarchy is the surrounding system this guide adds around that inner loop — the checkpoint brief, durable verdicts and staleness checks, the consolidated return, the Orchestrator receipt, and the human\'s disposition step — and none of that surrounding system is attributed to Shumer\'s article.',
    ],
    productDesign: [
      'The two structured questions in this stage — how much visibility the human wants into decomposition before building starts, and how much independent review rigor this checkpoint warrants — are this guide\'s own editorial framing. The source method has the Engineering Lead decide decomposition and review rigor as engineering judgment calls; it does not ask the human Owner these as structured upfront questions, though nothing in the source forbids the human from wanting more visibility on either.',
      'The two recovery prompts — routing a single failed piece\'s gap back for repair, and auditing a run that seems stuck in a repair loop for an honest plateau determination — are this guide\'s own scaffolding for two situations a human running this loop for the first time is likely to hit. The underlying concepts they use (routing back the single largest gap; an honest PLATEAU call instead of endless looping) are verified method content; packaging them as separate, targeted recovery prompts is this guide\'s own design choice.',
    ],
  },
  questions: [
    {
      id: 'decompositionControl',
      type: 'radio',
      label: 'How much visibility do you want into how this checkpoint gets split into pieces before building starts?',
      help: DECOMPOSITION_HELP,
      required: true,
      affectsPrompt: 'Branches the Exact task layer: letting the Lead decide means it proceeds straight to Builder assignments once it has a sound decomposition and explains its reasoning afterward; wanting to see the split first inserts an explicit pause for your go-ahead before any Builder work begins; the delegate option asks the agent to investigate the checkpoint\'s size and risk and propose the decomposition approach itself, with tradeoffs, before proceeding.',
      options: [
        { value: 'lead-decides', label: 'Let the Engineering Lead decide how to split the work into pieces', description: 'You trust the Lead\'s engineering judgment on decomposition; it explains its reasoning afterward rather than proposing it upfront.' },
        { value: 'see-split-first', label: 'I want to see the proposed split before building starts', description: 'The Lead proposes pieces, boundaries, and build order, and waits for your explicit go-ahead before any Builder starts work.' },
      ],
      allowDelegate: true,
    },
    {
      id: 'reviewRigor',
      type: 'radio',
      label: 'How much independent scrutiny should each piece get before it is trusted?',
      help: REVIEW_RIGOR_HELP,
      required: true,
      affectsPrompt: 'Sets whether each piece gets exactly one Component Critic (plus the later Integration Critic) or multiple independent, mutually blind Critics per piece whose verdicts must be reconciled before the piece is treated as sound; the delegate option asks the agent to investigate the checkpoint\'s actual risk and propose a rigor level, per piece, with tradeoffs.',
      options: [
        { value: 'standard', label: 'Standard — one Component Critic per piece plus one Integration Critic', description: 'The default: each piece gets one independent fresh review, then the whole candidate gets one integration review.' },
        { value: 'extra', label: 'Extra scrutiny — multiple independent Critics per piece', description: 'Each piece gets more than one fresh, mutually blind Critic before being treated as sound — worth the extra cost on genuinely high-stakes pieces.' },
      ],
      allowDelegate: true,
    },
  ],
  freeTextLabel: 'What should the agent understand about how you want this checkpoint actually run that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'investigated', label: 'The agent (as Engineering Lead) actually read the checkpoint brief and the current workspace state directly, rather than relying on a prior conversation\'s summary of them.', kind: 'confirm', required: true },
    { id: 'freshReview', label: 'Every Component Critic verdict and the Integration Critic verdict came from a genuinely fresh, separate context — never the Builder\'s own context, and never each other\'s.', kind: 'confirm', required: true },
    { id: 'loopedToTerminal', label: 'Repair and re-review continued for as long as it genuinely took, with no fixed round count, until a real terminal state was reached.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported the exact terminal state reached (PASS, BLOCKED, PLATEAU, or BUDGET_EXHAUSTED), its supporting evidence, and any assumptions or unresolved conflicts — not just a claim of success.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I\'ve reviewed the result and the Critic verdicts myself before treating this checkpoint\'s execution as done.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the built artifact and any consolidated verdict or report records (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';

    const decompositionValue = answers.decompositionControl;
    const reviewRigorValue = answers.reviewRigor;
    const decompositionDelegated = decompositionValue === DELEGATE_VALUE;
    const reviewRigorDelegated = reviewRigorValue === DELEGATE_VALUE;
    const decompositionLabel = DECOMPOSITION_LABELS[decompositionValue] || '';
    const reviewRigorLabel = REVIEW_RIGOR_LABELS[reviewRigorValue] || '';

    const roleAndAuthority = [
      'You are acting as the Engineering Lead for exactly one checkpoint of this project, working from the checkpoint brief the human\'s Orchestrator role already issued in the Orchestrator Initialization step. You own how this checkpoint gets built: architecture, decomposition into pieces, Builder assignments, and being the sole writer of the integrated candidate.',
      'You may not weaken the acceptance bar named in the brief, give yourself a larger time or effort ceiling than the brief states, publish or land the result, decide to keep or discard it, or start a new checkpoint on your own — those stay with the human Owner and, where the brief says so, the Orchestrator. Nothing you personally believe or assert counts as acceptance; only an independent, fresh-context review against the bar does.',
    ].join('\n');

    const stageObjective = 'Actually build this checkpoint\'s artifact: decompose it into pieces sized for independent judgment, get each piece built, get each piece reviewed by a genuinely fresh Component Critic against the ratified bar, repair whatever gap that review finds, and — once every relied-on piece holds up — get the complete assembled candidate reviewed by a separate fresh Integration Critic. Repeat repair and re-review as many times as it genuinely takes, with no fixed round count, until the bar is met or you can honestly report BLOCKED, PLATEAU, or BUDGET_EXHAUSTED.';

    const humanIntent = [
      decompositionDelegated
        ? 'The human is unsure how much visibility they want into the decomposition before building starts, and asked you to investigate and propose an approach with tradeoffs instead of assuming one (see Exact task below).'
        : quoteHumanInput('How much visibility the human wants into decomposition before building starts', decompositionLabel),
      reviewRigorDelegated
        ? 'The human is unsure how much independent review rigor this checkpoint needs, and asked you to investigate the actual risk and propose a rigor level with tradeoffs instead of assuming one (see Exact task below).'
        : quoteHumanInput('Review rigor the human wants for this checkpoint', reviewRigorLabel),
      quoteHumanInput('Anything else the human wants understood about running this checkpoint', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = operatingModeText(
      fresh,
      'this conversation\'s own continuity only covers your work as Engineering Lead coordinating the checkpoint — it is not evidence that the checkpoint brief, the target workspace, or any in-progress candidate are still what you last believed; re-open and re-read them directly before acting. Continuity also never substitutes for the fresh, separate contexts each Component Critic and the Integration Critic still need below — do not review any piece inside this same conversation just because this conversation is continuing.',
    );

    const investigation = fresh
      ? [
          'This is a fresh conversation with no memory of any earlier discussion about this checkpoint, so verify everything from scratch rather than trusting anything asserted below as already true:',
          '- Read the checkpoint brief in full, directly from wherever the project records durable state — the exact ratified plan anchor it names, the observable goal, the complete bar citation with its verbatim supporting extract, the numeric time or effort ceiling, and any Owner-only actions it lists as already authorized (or confirms as none).',
          '- Verify the target workspace\'s actual current state yourself, directly, rather than from the brief\'s own "expected state" description — that description is a hypothesis its author formed, not a guarantee. If what you find contradicts the expected state, the actual state wins; report the discrepancy rather than silently building on the mismatch.',
          '- Search for any partial or abandoned prior attempt at this checkpoint — an existing branch, workspace, or draft artifact — and inspect it directly rather than assuming a clean start; surface anything unexplained to the human rather than deleting or silently absorbing it.',
          '- Confirm which acceptance bar is actually in force by reading the cited checklist section directly, not a paraphrase of it — catching yourself reasoning about "making it good" rather than a specific checkable condition is a sign you have drifted from the real bar.',
          'If the brief is missing any of the above, is ambiguous, or contradicts itself, stop and report that before making any edit, starting a clock, or opening a candidate — do not attempt to patch a defective authorization by guessing what it must have meant.',
        ].join('\n')
      : [
          'Even though this continues the conversation that produced the checkpoint brief, re-verify rather than assume — the rule that actual state overrides any expected-state narrative applies here too, continuity or not:',
          '- Re-open and re-read the checkpoint brief\'s current, saved content directly, including the exact ratified plan anchor, the bar citation, and the numeric ceiling — do not proceed from what you recall deciding a few turns ago.',
          '- Re-verify the target workspace\'s actual current state against the brief\'s expected-state fields; nothing about this being the same conversation guarantees nothing on disk has changed since the brief was issued.',
          '- Confirm no other process has already started, partially built, or altered a candidate for this checkpoint since this conversation began.',
          'If anything here contradicts what you find, the actual state wins — say so and reconcile it before proceeding.',
        ].join('\n');

    const precedence = PRECEDENCE_TEXT;

    const task = [
      'Work from the checkpoint brief already in force for this checkpoint. First, decompose it into pieces:',
      decompositionTask(decompositionValue),
      'For each piece, write a Builder assignment naming exactly what it covers, the exact files or scope it is allowed to touch, and what evidence the Builder must produce — but never give the Builder the acceptance oracle that will judge it, and never let the Builder pre-answer what "passing" looks like. Have the piece actually built.',
      BUILD_CRITIQUE_DISCIPLINE,
      reviewRigorTask(reviewRigorValue),
      'When a Component Critic reports FAIL or BLOCKED, or reports PASS but names anything less than "None — bar met," route exactly that single largest remaining gap back to a Builder for repair. Do not bundle in unrelated polish, and do not silently reopen a piece that already reported a clean PASS just because a different piece needs work. Re-review the repaired piece with another genuinely fresh Component Critic context before treating it as sound — never let the same Builder who made the fix also confirm the fix worked.',
      'Once every piece this checkpoint actually needs has an independent, current PASS, assemble the complete candidate and freeze an exact, identifiable version of it. Then hand the whole candidate — plus a list of every component verdict you are relying on — to a separate fresh Integration Critic context: not the Lead (you), not any Component Critic who reviewed a piece. That Integration Critic reviews the complete candidate as a whole and checks whether each relied-on component verdict is still current (has anything the verdict depended on changed since it was issued?) before it can report PASS.',
      'If the Integration Critic reports anything other than a clean PASS, treat its finding the same way as a Component Critic finding: route the single largest gap back for repair, and re-review — at the piece level if the gap is local to one piece, or with a fresh Integration Critic pass again if the gap is about how pieces fit together. There is no fixed number of rounds; keep repairing and re-reviewing for as long as each round produces genuine progress toward the bar.',
      'Stop the loop only when you reach one honest terminal state for this checkpoint: PASS (the complete bar is met and you hold a current Integration Critic verdict saying so), BLOCKED (something requires an Owner action, credential, new authority, or resolution of a plan-versus-reality contradiction only the human can settle), PLATEAU (further effort under the current approach has stopped producing meaningful progress), or BUDGET_EXHAUSTED (the brief\'s numeric ceiling was consumed without weakening the bar to fit it).',
    ].filter(Boolean).join('\n\n');

    const constraints = [
      'Do not weaken, narrow, or reinterpret the acceptance bar named in the checkpoint brief to make it easier to pass — if the bar itself seems wrong, that is a BLOCKED condition to report, not something to quietly adjust.',
      'The brief\'s numeric ceiling is a prioritization constraint on how you spend effort, never permission to lower the bar once time or budget is running short; running out of ceiling without weakening the bar is BUDGET_EXHAUSTED, a legitimate honest outcome, not a failure to hide.',
      'Do not edit the project\'s protected governance material (its ratified root rulebook, the ratified plan anchor, or the checkpoint brief itself) to make this checkpoint easier — if a genuine change to any of that is needed, that is a BLOCKED condition; stop and return to the human rather than self-authorizing the change.',
      'Do not treat any Component Critic PASS as still valid once something it depended on has changed — recompute currency explicitly rather than assuming an earlier verdict still holds.',
    ].join('\n');

    const deliverables = [
      'The checkpoint\'s actual artifact, built or revised through one or more completed Builder assignments, each with a corresponding independent Component Critic verdict recorded.',
      'A complete, current Integration Critic verdict covering the assembled candidate as a whole and the currency of every component verdict it relies on.',
      'One consolidated report of the whole run: the brief you worked from, when you actually started, every Builder assignment and Critic verdict along the way (including any superseded by a repair), the engineering decisions you made, and the exact terminal state you reached with its supporting evidence.',
    ].join('\n');

    const qualityGates = [
      'Every "PASS" claim anywhere in this run — component or integration — must be traceable to a specific fresh-context Critic verdict, never to a Builder\'s or your own self-report.',
      'The bar you check against must be the complete, verbatim checklist cited in the brief — a convenience summary of it is not sufficient grounds for a verdict either way.',
      'A checkpoint-level PASS requires a currently valid Integration Critic verdict, obtained after every component verdict it relies on was confirmed still current — a stale Integration Critic verdict from before the last repair does not count.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume a piece is sound because its Builder reported success, because it compiles or runs, or because it resembles a piece that already passed — only a fresh Component Critic verdict against the bar establishes that.',
      'Do not assume the Integration Critic pass can be skipped because every Component Critic already passed — it exists specifically to catch problems that only appear once pieces are combined, and to catch a component verdict that has gone stale.',
      'Do not assume the checkpoint brief\'s "expected state" description is still accurate; treat it as a hypothesis and verify the workspace\'s actual current state directly, every time you act on it.',
      'Do not assume silence, a shrug, or a vague "looks fine" from any party is equivalent to a PASS verdict — an explicit, evidenced verdict is required at every step.',
    ].join('\n');

    const stopConditions = [
      'Stop and report BLOCKED, rather than guessing, if: something requires an Owner action, credential, or new authority you were not given; you discover the checkpoint brief is missing, ambiguous, or contradicts the actual workspace state in a way you cannot resolve; or a genuinely needed change would touch the project\'s protected governance material.',
      'Stop and report PLATEAU if a full round of repair and re-review produces no meaningful progress toward the bar — do not keep looping on the hope that one more attempt will suddenly work without a changed approach.',
      'Stop and report BUDGET_EXHAUSTED if the brief\'s numeric ceiling is consumed before the bar is met, rather than quietly extending it or shipping a weaker result to fit the time that is left.',
      'Stop entirely, before any further edit, if you cannot establish which document or state is actually authoritative for a decision you need to make — an unresolved precedence question is never something to resolve by guessing.',
    ].join('\n');

    const approvalBoundary = 'This stage stops at an honest terminal report, not at a landing decision — deciding whether to keep or discard this checkpoint\'s result happens in a separate step after the human has reviewed your report. Do not treat a PASS you report as equivalent to the human\'s approval to land, publish, merge to a shared mainline, or start a new checkpoint; none of those follow automatically from a technical PASS.';

    const terminalReturn = [
      '"Done" for this stage means you have reached, and can defend with observable evidence, exactly one terminal state: PASS (the complete bar is met and you hold a current, fresh Integration Critic verdict saying so); BLOCKED (a specific Owner action, credential, or plan-versus-reality contradiction is named, blocking further progress); PLATEAU (a specific account of what you tried and why it stopped producing progress); or BUDGET_EXHAUSTED (the ceiling is consumed, and the bar was never weakened to compensate).',
      'Report: the terminal state reached and the evidence for it; every Builder assignment and Critic verdict you relied on, including which pieces were repaired and re-reviewed and how many times; every assumption you made and why; any conflict between the brief, the rulebook, and the actual workspace state that you could not resolve yourself; and an explicit statement that you have stopped here rather than continuing toward landing, publishing, or a new checkpoint. If at any point you could not establish which source was actually authoritative, say so plainly instead of picking one silently.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'repair-component-gap',
      label: 'Repair a component that failed its Critic review — route the gap back',
      description: 'Use instead of the primary prompt when one specific piece already has a Component Critic verdict naming FAIL, BLOCKED, or a single remaining gap, and you need that one gap routed back to a Builder and re-reviewed — without reopening pieces that already passed or restarting the whole checkpoint.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const reviewRigorLabel = REVIEW_RIGOR_LABELS[answers.reviewRigor] || '';

        const roleAndAuthority = [
          'You are acting as the Engineering Lead repairing one specific piece of an in-progress checkpoint — not restarting the checkpoint, and not touching any piece that already holds a current, unchallenged PASS. You still may not weaken the bar, grant yourself extra time or effort ceiling, or declare this piece sound yourself.',
          'Only a fresh, independent Critic verdict can turn a repair into a PASS. Your job here is to route the fix correctly and get it reviewed, not to certify it.',
        ].join('\n');

        const stageObjective = 'Take the single largest remaining gap already named by an existing Component Critic verdict, route it to a Builder for a bounded repair scoped to that gap only, and get the repaired piece re-reviewed by a genuinely fresh Critic context before treating it as sound again — leaving every other already-sound piece untouched.';

        const humanIntent = [
          quoteHumanInput('Review rigor the human wants for this checkpoint', reviewRigorLabel),
          quoteHumanInput('Which piece or gap the human believes needs repair, in their own words (if provided)', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-open and re-read the specific Component Critic verdict you are repairing against, directly, before touching anything — do not repair from memory of what an earlier turn in this conversation said the gap was. Continuity also never substitutes for the fresh, separate Critic context the repaired piece still needs below.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion about this checkpoint, so verify everything from scratch:',
              '- Read the checkpoint brief in full, directly, including the exact bar citation this piece is judged against.',
              '- Locate and read the actual Component Critic verdict that named the gap you are repairing — its stated single largest remaining gap, its provenance, and what it checked — do not repair from a paraphrase of it.',
              '- Read the piece\'s current, actual state directly, and confirm nothing about it or its dependencies has changed since that verdict was issued in a way that would make the verdict itself stale rather than reliable.',
              '- Confirm which other pieces of this checkpoint already hold a current, unchallenged PASS, so you can be certain not to touch them.',
              'If you cannot locate a specific, quotable gap statement from an actual Critic verdict, stop and ask which piece and which gap the human means rather than guessing.',
            ].join('\n')
          : [
              'Even though this continues an in-progress conversation, re-verify rather than assume:',
              '- Re-read the actual Component Critic verdict\'s current, saved wording directly, including its exact stated gap — do not repair from memory of it.',
              '- Re-confirm the piece\'s current state and that nothing about its dependencies has changed since that verdict, which would make the verdict stale.',
              '- Re-confirm which other pieces already hold a current PASS, so the repair stays scoped to the one gap.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Quote the exact "single largest remaining gap" language from the Component Critic verdict you are acting on before doing anything else — this repair must map to that quoted gap and nothing broader.',
          'Write a Builder assignment scoped only to closing that one gap: no unrelated cleanup, no touching a different piece, no expanding the ownership allowlist beyond what closing this specific gap requires. Have the repair actually built.',
          BUILD_CRITIQUE_DISCIPLINE,
          'Once the repair is built, dispatch the repaired piece to another genuinely fresh Component Critic context — not the Critic instance that found the original gap, and never the Builder who made the fix — for a full independent review against the same bar, not a spot-check of just the changed lines.',
          answers.reviewRigor === 'extra'
            ? 'This checkpoint uses extra scrutiny: the repaired piece needs more than one independent, mutually blind fresh Critic again, reconciled the same way any other piece under extra scrutiny would be, before it counts as sound.'
            : '',
          'Explicitly flag, in your report, whether this checkpoint already had an Integration Critic verdict before this repair — if it did, that verdict is now stale with respect to this piece and must be refreshed with a new fresh Integration Critic pass before the checkpoint as a whole can be reported PASS.',
        ].filter(Boolean).join('\n\n');

        const constraints = [
          'Do not expand this repair\'s scope beyond the single gap you quoted — a second, unrelated issue you notice along the way gets reported, not silently fixed in the same pass.',
          'Do not touch, re-review, or re-open any other piece that already holds a current, unchallenged PASS.',
          'Do not let the repairing Builder, or yourself as Lead, declare the gap closed — only the new fresh Critic verdict can do that.',
        ].join('\n');

        const deliverables = 'The repaired piece; a new, independent, fresh Component Critic verdict covering it in full; and an explicit note on whether the checkpoint\'s Integration Critic verdict (if one existed) is now stale and needs to be refreshed before a checkpoint-level PASS.';

        const qualityGates = [
          'The new Critic verdict must review the repaired piece as a whole against the bar, not merely confirm that the quoted gap specifically is gone.',
          'The repair\'s scope must map one-to-one to the gap quoted at the start of this task — any broader change is reported separately, not folded in.',
          'If an Integration Critic verdict already existed for this checkpoint, your report must state plainly whether it is now stale.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the original gap description is still accurate without re-confirming it against the piece\'s current state — time may have passed, or something else may have already changed it.',
          'Do not assume fixing this one piece leaves the whole candidate integration-clean — that determination belongs to a fresh Integration Critic pass, not to this repair.',
          'Do not assume a quick visual check by the repairing Builder is an acceptable substitute for a full fresh Critic verdict.',
        ].join('\n');

        const stopConditions = 'Stop and report BLOCKED if repairing this one gap turns out to require a change to the acceptance bar, the checkpoint brief, or the rulebook itself, or if you cannot find a specific, quotable gap statement from an actual prior Critic verdict to work from.';

        const approvalBoundary = 'A fresh PASS on this repaired piece is not, by itself, a checkpoint-level PASS — the Integration Critic still needs a current pass across the whole candidate before this checkpoint can be reported done. Do not present this repair\'s success as equivalent to the checkpoint being finished.';

        const terminalReturn = [
          '"Done" for this recovery means: the quoted gap has been closed by a bounded repair; a new, fresh, independent Critic verdict on the repaired piece exists; and the checkpoint\'s Integration Critic currency status has been explicitly stated.',
          'Report the exact change (what was touched and how), the new Critic verdict and its evidence, whether the Integration Critic verdict now needs refreshing, any assumptions made, and stop there for the human\'s or the Lead\'s review rather than proceeding to a checkpoint-level PASS on your own.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'plateau-audit',
      label: 'Audit a run that seems stuck in a repair loop (plateau check)',
      description: 'Use instead of the primary prompt when repair and re-review have cycled more than once without clear progress, and you need an honest determination of whether this run has genuinely reached PLATEAU (or actually BLOCKED or BUDGET_EXHAUSTED) rather than continuing to loop on hope.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const reviewRigorLabel = REVIEW_RIGOR_LABELS[answers.reviewRigor] || '';

        const roleAndAuthority = [
          'You are acting as an independent auditor of this checkpoint\'s repair history, on behalf of the human Architect/Owner and the Engineering Lead role that has been running it. Your job is to render one honest terminal-state determination — or to say explicitly that genuine progress is still occurring and the loop should continue — not to attempt another repair yourself.',
          'You hold no authority to change the acceptance bar, extend the ceiling, or declare a PASS; you are only qualified to say what the evidence so far actually shows.',
        ].join('\n');

        const stageObjective = 'Review the full sequence of Builder assignments and Critic verdicts produced so far for this checkpoint, determine round by round whether genuine progress toward the bar occurred, and report the specific honest determination this run has actually earned — continue, PLATEAU, BLOCKED, or BUDGET_EXHAUSTED — instead of letting it keep looping without anyone making that call.';

        const humanIntent = [
          quoteHumanInput('Review rigor the human wants for this checkpoint', reviewRigorLabel),
          quoteHumanInput('What makes the human suspect this run is stuck, in their own words (if provided)', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-open and re-read the actual saved history of Builder assignments and Critic verdicts for this checkpoint directly, in order — do not audit from a summary or from what an earlier turn in this conversation said happened.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion about this checkpoint, so verify everything from scratch:',
              '- Read the checkpoint brief in full, directly, including its numeric time or effort ceiling and the exact bar it names.',
              '- Read every Builder assignment and every Critic verdict produced so far for this checkpoint, in chronological order, not just the most recent one.',
              '- For each round, compare what actually changed against what the immediately preceding Critic verdict named as its single largest gap, and determine directly whether that round closed the gap, partially closed it, or left it effectively unchanged.',
              '- Check the elapsed time or effort actually spent against the brief\'s numeric ceiling.',
              '- Check whether any round\'s attempted fix depends on something only the Owner can grant — a credential, a decision, a plan amendment — that has not actually been requested yet.',
              'Do not accept a prior conversation\'s framing of "we\'re stuck" at face value; establish it yourself from the actual round-by-round record.',
            ].join('\n')
          : [
              'Even though this continues an in-progress conversation, re-verify rather than assume:',
              '- Re-read the full, actual verdict and assignment history saved so far, not just your recollection of the last few rounds.',
              '- Re-check elapsed effort against the brief\'s numeric ceiling.',
              '- Confirm nothing about the bar or the checkpoint brief has changed since the loop started.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Build an explicit round-by-round account, in your response, of: what gap each round\'s Critic verdict named, what the following Builder repair actually changed, and whether the next verdict shows that gap closed, partially closed, or effectively unchanged.',
          'Determine whether the most recent round(s) show genuine progress, or whether the same gap — or a materially equivalent one — has now recurred across two or more rounds with essentially the same repair approach tried each time.',
          'Check whether remaining ceiling under the brief is sufficient for another meaningfully different attempt, and whether any round\'s blocker actually requires an Owner action that has not been requested.',
          'Render exactly one of these determinations, with your reasoning tied to specific rounds and verdicts, not to a general impression: "continue — genuine progress is still occurring" (state what changed most recently as evidence); PLATEAU (name the recurring, unchanged gap and the rounds that show it); BLOCKED (name the specific Owner-only action still outstanding); or BUDGET_EXHAUSTED (show the ceiling accounting).',
        ].join('\n\n');

        const constraints = [
          'Do not force a PLATEAU, BLOCKED, or BUDGET_EXHAUSTED determination if the evidence actually shows genuine round-over-round progress — cutting off a productive loop early is its own failure mode, not a safe default.',
          'Do not attempt a repair yourself in this audit — your output is a determination and its evidence, not a fix.',
          'Do not base a PLATEAU call on a single round looking difficult; it requires evidence that the same or an equivalent gap survived across multiple rounds despite genuinely different attempts.',
        ].join('\n');

        const deliverables = 'The round-by-round evidence table; exactly one determination (continue, PLATEAU, BLOCKED, or BUDGET_EXHAUSTED) with the reasoning tied to specific rounds; and, if the determination is anything other than "continue," a clear statement of what the human or Lead needs to do next given that determination.';

        const qualityGates = [
          'The determination must be traceable to concrete evidence spanning at least two rounds where a plateau or block is being claimed — a single round\'s outcome is never sufficient grounds for PLATEAU.',
          'A "continue" determination must name the specific, concrete progress the most recent round produced, not just an absence of evidence for stopping.',
          'A BLOCKED determination must name one specific, concrete Owner-only action — a vague "needs more clarity" does not qualify.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume more rounds will eventually succeed just because ceiling remains — evaluate actual round-over-round evidence, not remaining budget alone.',
          'Do not assume a gap is a genuine PLATEAU because it sounds hard, without evidence that multiple genuinely different attempts have failed to close it.',
          'Do not assume a blocker is BLOCKED-worthy without confirming it truly requires an action only the Owner can take, rather than an action the Lead could still attempt.',
        ].join('\n');

        const stopConditions = 'If the evidence genuinely does not support any of continue, PLATEAU, BLOCKED, or BUDGET_EXHAUSTED with confidence — for example the round history is incomplete or contradictory — stop and report that the record itself is insufficient to make an honest determination, rather than forcing one.';

        const approvalBoundary = 'This audit\'s determination is a recommendation to the human and the Lead, not a decision to land, discard, or continue on its own authority — whatever it finds still routes through the appropriate next step (continuing the primary execution prompt, or the human\'s own review) rather than being acted on automatically.';

        const terminalReturn = [
          '"Done" for this recovery means: a complete round-by-round evidence account exists; exactly one determination has been rendered with reasoning traceable to that evidence; and, if the determination is not "continue," a specific next step is named.',
          'Report the full round-by-round account, the determination and its evidence, any assumptions made, and any part of the record that was ambiguous or incomplete — stop there for review rather than acting on the determination yourself.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'This stage is where the whole method either earns its keep or reveals itself as pure ceremony: everything before it was drafting, decomposing, and ratifying; here, real work actually gets built, and the zero-trust discipline gets tested against the everyday temptation to let a Builder confirm its own fix, or to skip a fresh Integration pass because every piece already looked fine on its own. The inner loop this stage runs — a concrete, inspectable bar; a lead who decomposes work into independently judgeable pieces; a builder and a critic kept as genuinely separate agents so the critic judges the artifact rather than the builder\'s account of it; sending back the single largest meaningful gap instead of vague feedback; and looping without a fixed round count — is Matt Shumer\'s Gauntlet Loop (https://somethingbig.ai/gauntlet-loop). This guide credits that pattern by name rather than presenting it as original: Zero-Trust Hierarchy is the surrounding system — the checkpoint brief, the durable verdicts and staleness checks, the consolidated return, and the human\'s disposition step — that this stage wraps around Shumer\'s inner pattern, not a replacement for it.',
    problemPrevented: 'Without an enforced fresh-context boundary between building and judging, the most natural failure mode is quiet self-certification: a single long conversation builds something, likes what it built, and reports success — with no independent check that ever had a real chance of disagreeing. This stage exists to make that failure structurally harder: by the time a checkpoint is reported PASS, at least two genuinely separate reviewing contexts (a Component Critic per piece, plus a separate Integration Critic) have had to independently reach that conclusion from the artifact itself, not from anyone\'s account of it.',
    judgmentVsInvestigation: 'How much oversight the human wants over decomposition, and how much independent scrutiny each piece deserves, are judgment calls only the human can make — they depend on how much the human trusts this particular Lead\'s engineering judgment and how costly a wrong turn on this particular checkpoint would be, and the delegate option on both questions lets the human hand that judgment to agent investigation when they are genuinely unsure rather than guessing at questions they cannot yet answer. Everything about the checkpoint brief\'s actual current content, the workspace\'s real state, whether a given piece meets the bar, and whether an earlier verdict is still current is investigation — no structured question in this stage asks the human to report any of that, because only direct inspection of the real artifact can answer it honestly.',
    promptAnatomy: 'This stage\'s generated prompt inlines the full Builder/Critic/Integration-Critic discipline directly in the Exact task layer every time, rather than stating it once and trusting it to be remembered — getting this one boundary wrong quietly defeats the entire method, so a brief mention once is not enough insurance against a busy agent skimming past it mid-loop. The Required repository investigation layer diverges sharply by mode for a reason specific to this stage: a "same conversation" continuation is exactly the condition most likely to tempt a Lead into reviewing its own recent work inside familiar context, so the same-mode text explicitly calls that risk out rather than treating continuity as automatically safe.',
    authorityBoundary: 'The Lead role this prompt addresses owns how the checkpoint gets built but never owns whether it passes — that judgment belongs entirely to fresh Critic contexts working from the artifact itself. Even a Lead completely certain its own work is correct has no authority to declare that; only an independent verdict does. Likewise, reaching a PASS terminal state in this stage is not the same as receiving the human\'s permission to land, publish, or continue — that disposition decision belongs to a separate, later step, and this stage\'s approval boundary says so explicitly.',
    inputsAndSources: 'Inputs are the two structured answers (decomposition visibility, review rigor), the free-text field, and — the material sources that actually matter — the checkpoint brief already in force, the current actual state of the target workspace, and the running history of Builder assignments and Critic verdicts this specific checkpoint has produced so far. No file, path, or document from outside the human\'s own project is ever a valid source for any judgment made in this stage.',
    outputsAndEvidence: 'The expected output is the checkpoint\'s actual built or revised artifact, a complete and current Integration Critic verdict, and a consolidated report tracing every Builder assignment and Critic verdict that led there. The evidence is the verdicts themselves — each one traceable to a fresh, independent context that reviewed the real artifact — never a summary, a narrative, or a confident tone substituting for one.',
    failureModes: [
      'Letting the same conversation that built a piece also "review" it under a different persona while sharing the same context and memory — this is self-certification wearing a fresh-context costume, not the real thing.',
      'Giving a Component Critic the Builder\'s diff, commit message, or explanation "for context" — once a Critic has seen the Builder\'s reasoning, it is reviewing the story, not the artifact.',
      'Treating "every Component Critic passed" as sufficient and skipping the Integration Critic pass, missing exactly the class of problem — pieces that individually work but conflict once combined, or a verdict that went stale after a later repair — that the Integration pass exists to catch.',
      'Continuing to loop repair after repair on a genuinely stuck approach because stopping to declare PLATEAU feels like admitting failure, when an honest PLATEAU report is a correct outcome, not a failed one.',
      'Quietly narrowing or reinterpreting the acceptance bar partway through, once it becomes clear the original bar is expensive to meet, instead of reporting BLOCKED or PLATEAU honestly.',
    ],
    weakResultSigns: [
      'A Critic verdict\'s stated reasoning reads like it is quoting the Builder\'s own explanation rather than describing what the Critic itself found by inspecting the artifact.',
      'The Integration Critic verdict is dated before the most recent component repair, and nobody flagged that it needs to be refreshed before a checkpoint-level PASS is claimed.',
      'A reported "PASS" cannot point to a specific verdict for every piece it depends on — some piece\'s soundness is simply asserted rather than evidenced.',
      'The same gap, described in slightly different words, keeps reappearing across rounds without ever actually closing, and the run keeps going anyway instead of stopping to call PLATEAU.',
    ],
    customization: 'For a checkpoint the human marked low-stakes and reversible earlier in this project, standard single-Critic-per-piece review is almost always proportionate — resist the pull toward extra scrutiny "just in case," which mainly adds latency without changing the outcome on genuinely low-cost work. For a checkpoint touching something hard to reverse — data migrations, anything public-facing, anything with real safety or security consequences — extra scrutiny with multiple independent Critics per piece, and a lower tolerance for treating a marginal PASS as sufficient, earns its cost.',
    whenToStop: 'Stop and reconsider before accepting any reported PASS if you cannot find, for every piece it depends on, a specific fresh-context verdict that actually reviewed the artifact — a PASS resting on even one unverified piece is not a real PASS. Also pause if a PLATEAU or BUDGET_EXHAUSTED report arrives suspiciously fast, before more than one or two genuine repair attempts — that pattern more often means the Lead gave up early than that the approach was truly exhausted.',
    auditWithoutPasting: 'You do not need to hand over the built artifact or any Critic verdict content to sanity-check this stage\'s output. In your agent\'s own conversation, ask it to name, for every piece a reported PASS depends on, which specific fresh context reviewed it and what that context\'s stated evidence was — if it cannot answer with specifics for every piece, the PASS is not yet earned. You can also ask it to quote the exact "single largest remaining gap" language from the most recent Critic verdict it acted on; a vague or missing answer there is a strong sign the fresh-review discipline slipped somewhere in the loop.',
    weakVsStrongExample: {
      weak: '"I built the feature, tested it myself, and it works — marking this checkpoint PASS." No independent Critic ever reviewed it; the Builder graded its own work, and no Integration pass happened at all.',
      strong: '"Piece A: Builder implemented X; Component Critic (fresh context, no visibility into the Builder\'s reasoning) independently verified against the bar and returned PASS with cited evidence. Piece B: same pattern, PASS with its own cited evidence. Integration Critic (a third, separate fresh context — not A\'s or B\'s reviewer, not the Lead) reviewed the assembled candidate as a whole, confirmed both component verdicts are still current, and returned PASS. Terminal state: PASS, with every verdict traceable."',
    },
  },
};
