import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const TRACK_AMBITION_HELP = 'Parallel tracks are optional — a project can legitimately run zero, one, or many at once, and running more tracks is not inherently better. Opening a second track only makes sense when the work is genuinely independent enough to authorize, staff, and review separately; otherwise it just adds coordination overhead for no real benefit.';
const CONFLICT_POLICY_HELP = 'Once more than one track can touch the project at the same time, an already-reviewed piece of work can be invalidated by a change made somewhere else. This decides how much you trust an automated check that flags exactly what changed versus wanting a human-level re-look at anything a concurrent change touched, even when the check reports it is still fine.';
const AMENDMENT_CADENCE_HELP = 'Rules and plans age. This only sets how often you deliberately look for a reason to revisit them — it does not change who is allowed to actually approve a change, which is always you, the human Owner, and never an agent acting on its own.';

const TRACK_LABELS = {
  single: 'Stay single-track for now',
  'second-track': 'Open a second parallel track',
};
const CONFLICT_LABELS = {
  standard: 'Standard — re-review only what a dependency-change check flags as stale',
  stricter: 'Stricter — manually re-review anything touched by a concurrent change even if the check says it is still current',
};
const AMENDMENT_LABELS = {
  reactive: 'Revisit the rulebook or plan only when something breaks',
  scheduled: 'Scheduled periodic review',
};

/** Reproduced inline, generically, so the generated prompt is self-contained for the receiving agent. */
const CROSS_TRACK_INVARIANTS = [
  '1. Every track traces back to a human-stated purpose — no track exists just because it would be efficient or convenient to run one.',
  '2. Each track proceeds under one bounded authorization at a time — no track skips ahead into a next unit of work without a fresh, explicit go-ahead.',
  '3. The role that builds a track\'s work is never the same role that judges whether that work is acceptable.',
  '4. Every track\'s expected state is treated as a hypothesis until verified against the actual current state of the project — a stale assumption carried over from one track is never trusted inside another.',
  '5. Where a track produces a concrete candidate (a specific version of a file, branch, or artifact), that candidate has an exact, unambiguous identity — never "whatever is currently checked out."',
  '6. A track\'s own claim that its work is acceptable is never sufficient on its own — an independent review is required before acceptance is claimed.',
  '7. Each track\'s current status is recorded honestly in one durable, shared place — not scattered across private notes or held only in one track\'s memory.',
  '8. Each track ends with one bounded return and one completeness check on that return — not an open-ended stream of partial updates.',
  '9. Only the human decides what happens to a track\'s finished work, through a controlled process that preserves evidence and reclaims resources — no track finalizes or discards itself.',
].join('\n');

const OPTIONAL_TRACKS_LINE = 'Parallel tracks are entirely optional. A project can correctly run zero tracks (nothing currently authorized), one track, or many at once — and running more tracks is never itself a sign of progress or maturity. Only open a track where the work is genuinely independent enough to justify a separate bounded authorization; otherwise stay single-track and treat that as a complete, correct answer.';

const UNOWNED_RESOURCE_LINE = 'Any branch, workspace, worktree, or other resource whose owning track cannot be identified must be inspected and reported to the human Owner in your return — never auto-deleted, archived, merged, or reclaimed on your own initiative, no matter how obviously abandoned it looks.';

const SLOW_TRACK_LINE = 'One track running slowly, blocked, or waiting on the human must never be used as a reason to freeze unrelated work in a different track that is otherwise eligible to proceed. Track independence includes independence of pace; do not introduce an artificial synchronization point that the method itself does not require.';

const NO_SELF_AMEND_LINE = 'No agent, in any role, may amend the rulebook, a ratified plan, or any other governance-locked document on its own initiative merely because a future checkpoint would be easier under looser rules. A genuinely needed governance change is a stop condition: propose the change and your reasoning, then stop and return to the human Owner, who alone may ratify it. This is a narrow, one-time, non-generalizing exception process — not a standing power any agent gets to invoke whenever it judges a change worthwhile.';

const NO_NEW_AUTHORITY_LINE = 'Do not invent a governance board, change committee, or any coordinating authority tier beyond Architect/Owner (the human), Orchestrator, Engineering Lead, Builder, Component Critic, and Integration Critic to approve amendments. Ratification is the human Owner\'s alone, exercised directly — it is never delegated to a new role, however convenient that would be for a project running several tracks at once.';

const STALENESS_EXPLAINER = 'A concurrent change is any change landed by a different track after this track\'s work — or a specific reviewed component inside it — was verified. Maintain a durable, explicit record of exactly which files, dependencies, or resources each existing verdict actually relied on. A dependency-change check is simply: for each verdict, has anything it explicitly depended on changed since it was recorded? Only a change to something a verdict actually depended on makes that verdict stale — an unrelated change elsewhere in the project does not, no matter how large it looks.';

const PRECEDENCE_TEXT = [
  'When sources conflict, this order governs: (1) the project\'s ratified root rulebook, (2) durable program state naming the exact ratified plan or checkpoint(s) currently authorized, (3) the specific plan section containing the current acceptance bar for whichever track is in question, (4) the role contract relevant to the work, (5) other planning documents or maps, (6) the verified actual state of the repository, environment, or data.',
  'A file that looks newer or longer is not automatically authoritative — only the human Owner\'s explicit ratification confers authority. If the rulebook conflicts with anything else you find, the rulebook wins unless the human tells you otherwise in this conversation.',
].join('\n');

function operatingModeText(fresh, continuityNote) {
  return fresh
    ? 'Launch the agent from the root of your project and make sure it can read the project files. Do not copy your project documents into this website — this generated prompt is meant to be handed to an agent that already has real file access to your repository.'
    : `Continue in the same agent conversation that completed the previous step. That continuity does not excuse skipping verification here: ${continuityNote}`;
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'scaling',
  number: 13,
  title: 'Scaling & Maintenance',
  purpose: 'Decide whether to open more parallel tracks, and set the ongoing rules for handling concurrent changes, stale reviews, and future governance amendments.',
  agentProduces: 'An updated durable program-state map reflecting how many tracks are actually active (zero, one, or many), a staleness/conflict-handling procedure for concurrent work, and a documented process for amending the rulebook or plan later without any agent self-ratifying its own change.',
  prerequisites: ['return-disposition'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'Zero to arbitrarily many heterogeneous tracks may run at once, and every track must preserve the same underlying invariants regardless of how many others are currently running — this is drawn directly from the method brief\'s parallel-tracks section, reproduced generically in this stage\'s Exact task layer as the nine cross-track invariants.',
      'Staleness is something computed from an explicit, durable record of what each verdict actually depended on, not something judged by feel after the fact — this is drawn directly from the method brief\'s checkpoint-brief evidence fields and its description of the Engineering Lead\'s staleness-computation duty.',
      'The governance-locked set (the root rulebook, ratified anchors, and related governing material) may not be modified by any agent merely because a checkpoint would benefit from it; a genuinely needed change stops work and returns to the human Owner for a narrow, one-use, non-generalizing decision — this is stated directly in the method brief\'s governance-and-precedence section and is the basis for this stage\'s no-self-amendment rule.',
      'An unexplained or unowned branch or resource must be inspected and presented to the human Owner, never auto-deleted, and one slow track must never freeze unrelated eligible work in another track — both are stated directly in the method brief\'s parallel-tracks section.',
    ],
    adapted: [],
    productDesign: [
      'The amendmentCadence question — choosing between a reactive, only-when-something-breaks trigger and a scheduled periodic review — is this guide\'s own addition. The source method establishes that any actual amendment requires the human Owner\'s ratification and is never self-authorized, but it does not prescribe how often a human should proactively look for a reason to amend anything; that cadence choice is this guide\'s product design.',
      'Framing conflictPolicy as a binary between trusting the computed staleness check on its own versus always adding a manual re-review on top of it is this guide\'s own translation of the method\'s staleness-computation duty into a human-facing choice. The source method specifies that staleness must be computed from an explicit dependency record; it does not itself name a "stricter" manual-override mode — that option and its label are this guide\'s editorial addition for a human who wants more ceremony than the computed check alone provides.',
    ],
  },
  questions: [
    {
      id: 'trackAmbition',
      type: 'radio',
      label: 'How many parallel tracks of work do you want running right now?',
      help: TRACK_AMBITION_HELP,
      required: true,
      affectsPrompt: 'Sets whether the generated prompt keeps single-track discipline and records a track count of one, requires the agent to verify a second track is genuinely independent before treating it as authorized, or asks the agent to investigate the project for anything worth splitting out before recommending anything.',
      options: [
        { value: 'single', label: 'Stay single-track for now', description: 'Keep authorizing one checkpoint at a time; no second track is opened.' },
        { value: 'second-track', label: 'Open a second parallel track', description: 'Two genuinely independent lines of work will run at the same time, each under its own checkpoint authorization.' },
      ],
      allowDelegate: true,
    },
    {
      id: 'conflictPolicy',
      type: 'radio',
      label: 'How should concurrent changes be handled once more than one track can touch the project?',
      help: CONFLICT_POLICY_HELP,
      required: true,
      affectsPrompt: 'Determines whether the generated staleness procedure treats a clean dependency-change check as sufficient clearance on its own, or additionally requires a manual re-review of anything a concurrent change touched regardless of what that check reports.',
      options: [
        { value: 'standard', label: 'Standard — re-review only what a dependency-change check flags as stale', description: 'Trust a computed check of exactly what each verdict depended on; only re-review what it flags.' },
        { value: 'stricter', label: 'Stricter — manually re-review anything touched by a concurrent change even if the check says it is still current', description: 'Add a human-level second look on top of the automated check, at the cost of more review overhead.' },
      ],
      allowDelegate: true,
    },
    {
      id: 'amendmentCadence',
      type: 'radio',
      label: 'How often should the rulebook or plan be deliberately revisited for possible amendment?',
      help: AMENDMENT_CADENCE_HELP,
      required: true,
      affectsPrompt: 'Sets whether the documented amendment process schedules a recurring review or only triggers a look reactively when something actually breaks; either way, the process itself always routes the actual change back to the human Owner for ratification.',
      options: [
        { value: 'reactive', label: 'Revisit only when something breaks', description: 'No standing review; a real problem or contradiction is what triggers a look at the rulebook or plan.' },
        { value: 'scheduled', label: 'Scheduled periodic review', description: 'Set a recurring point to deliberately check whether anything needs to change, even if nothing has visibly broken.' },
      ],
      allowDelegate: true,
    },
  ],
  freeTextLabel: 'What should the agent understand about your project\'s scaling or governance situation that the structured questions above didn\'t capture?',
  completionGate: [
    { id: 'investigated', label: 'The agent inspected the project\'s actual current tracks, resources, and rulebook directly, rather than relying on my summary or on what an earlier conversation assumed.', kind: 'confirm', required: true },
    { id: 'stateUpdated', label: 'The durable program-state map was created or revised to reflect exactly which tracks are active right now, and a written staleness/conflict-handling procedure exists.', kind: 'confirm', required: true },
    { id: 'amendmentProcessDocumented', label: 'A governance-amendment process was documented that always routes any actual rulebook or plan change back to me for ratification — never to an agent\'s own approval.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported what it verified, any unowned branches or resources it found (without deleting them), and any unresolved conflicts — not just a claim of success.', kind: 'confirm', required: true },
    { id: 'reviewed', label: 'I\'ve reviewed the updated program-state map and procedures myself before treating any of it as ratified.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the program-state map / conflict-handling procedure / amendment-process document(s) (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';

    const trackAmbition = answers.trackAmbition;
    const trackDelegated = trackAmbition === DELEGATE_VALUE;
    const conflictPolicy = answers.conflictPolicy;
    const conflictDelegated = conflictPolicy === DELEGATE_VALUE;
    const amendmentCadence = answers.amendmentCadence;
    const amendmentDelegated = amendmentCadence === DELEGATE_VALUE;

    const roleAndAuthority = [
      'You are helping the human Architect/Owner update this project\'s durable program-state map and its written rules for concurrent work and future governance changes. You hold no authority to open a new track, adopt a conflict policy, or amend governance yourself — you investigate, propose, document, and stop for the human\'s explicit decision.',
      'The program-state map, the staleness/conflict-handling procedure, and the amendment process are all part of this project\'s protected governance material once ratified. No agent executing later work, in any role, may quietly loosen them because a future checkpoint would be easier that way.',
    ].join('\n');

    const stageObjective = 'Produce or update one durable program-state map reflecting how many tracks are actually active right now (explicitly zero, one, or a named set of many), a written staleness/conflict-handling procedure for concurrent work across tracks, and a documented governance-amendment process that always ends with the human Owner\'s ratification and never an agent\'s self-approval.';

    const humanIntent = [
      quoteHumanInput('Track ambition', TRACK_LABELS[trackAmbition] || ''),
      trackDelegated
        ? 'The human is unsure whether anything in this project is genuinely independent enough to run as a second parallel track, and asked you to investigate and assess that before recommending anything (see Exact task below).'
        : '',
      quoteHumanInput('Conflict policy for concurrent changes', CONFLICT_LABELS[conflictPolicy] || ''),
      conflictDelegated
        ? 'The human is unsure whether the standard computed staleness check is enough on its own or whether they want a stricter manual re-review layered on top, and asked you to weigh the tradeoff for this project and recommend one (see Exact task below).'
        : '',
      quoteHumanInput('Amendment review cadence', AMENDMENT_LABELS[amendmentCadence] || ''),
      amendmentDelegated
        ? 'The human is unsure how often to schedule a deliberate rulebook/plan review, and asked you to propose a cadence based on this project\'s actual size and rate of change (see Exact task below).'
        : '',
      quoteHumanInput('Anything else the human wants understood about scaling or governance', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = operatingModeText(
      fresh,
      're-verify the actual current track count, resource ownership, and rulebook wording directly from the project rather than trusting whatever this conversation last said about them — a same-agent conversation is not exempt from checking reality.',
    );

    const investigation = fresh
      ? [
          'This is a fresh conversation with no memory of any earlier discussion about this project, so verify everything from scratch rather than trusting anything asserted below as already true:',
          '- Read the project\'s current durable program-state map (or whatever document tracks checkpoints and their status) directly and in full, if one exists; do not assume it matches what any earlier conversation might have claimed.',
          '- Inventory what is actually present in the repository right now — branches, worktrees, in-progress checkpoints, or any other track-shaped resource — regardless of what any document says should exist.',
          '- For every such resource, determine which track (if any) actually owns it; do not infer ownership from a name or branch pattern alone, and do not delete or archive anything you cannot positively attribute.',
          '- If more than one track appears to be active, determine concretely what, if anything, they actually share — a file, a dependency, an environment, a data store — since only genuine sharing creates a conflict worth a written policy.',
          '- Read the current rulebook or governing document in full to confirm how, if at all, it has been amended in the past, and whether any prior amendment was ever applied without the human Owner\'s explicit ratification; treat any such finding as serious and report it.',
          'If the program-state map, the rulebook, or the actual track resources are missing, contradictory, or ambiguous, stop and report that rather than drafting anything on top of an unclear foundation.',
        ].join('\n')
      : [
          'Even though this continues the same conversation, re-verify rather than assume:',
          '- Open and re-read the current program-state map and the rulebook directly — do not rely on what this conversation said about their contents earlier, since either could have changed.',
          '- Re-confirm what tracks are actually present in the repository right now (branches, worktrees, in-progress checkpoints) rather than trusting a count stated earlier in this conversation.',
          '- Re-confirm which resources are owned by which track, and do not delete or archive anything whose ownership you cannot positively confirm.',
          'If anything you find contradicts what this conversation assumed earlier, the actual current state wins — say so and reconcile it before proceeding.',
        ].join('\n');

    const precedence = PRECEDENCE_TEXT;

    const trackTaskBlock = trackDelegated
      ? [
          'The human is unsure whether anything in this project is genuinely independent enough to parallelize. Investigate the project\'s actual current work: identify any candidate for a second track, and test it against the cross-track invariants below — specifically whether it would share files, dependencies, or an environment with the existing track in a way that could invalidate either one\'s verdicts. Present what you find, with the tradeoffs of opening it now versus staying single-track, and pause for the human\'s decision. Default to recommending staying single-track unless you find a specific, concrete reason a second track is genuinely independent.',
        ].join('\n')
      : trackAmbition === 'second-track'
        ? [
            'The human wants to open a second parallel track. Before treating it as authorized, verify it is genuinely independent: confirm it does not share a file, dependency, environment, or other resource with the existing track in any way that could invalidate either track\'s verdicts without an explicit, written mapping of that sharing. If you cannot confirm genuine independence, say so and stop rather than authorizing the second track anyway.',
            'If independence is confirmed, record both tracks in the durable program-state map: a one-line description of each, its current status, and any dependency it has on the other track or on a shared resource.',
          ].join('\n')
        : [
            'The human wants to stay single-track for now. Record exactly one active track (or zero, if nothing is currently authorized) in the durable program-state map. Do not draft a staleness/conflict-handling procedure as if multiple tracks were already running — a single-track project still needs the map to be accurate, but the concurrent-change procedure below can stay minimal until a second track is actually opened.',
          ].join('\n');

    const conflictTaskBlock = conflictDelegated
      ? [
          'The human is unsure whether the standard computed staleness check is enough on its own, or whether they want a stricter manual re-review layered on top. Assess this project\'s actual track count and complexity, explain the coordination-overhead tradeoff of each option, and propose one — then pause for the human\'s decision before finalizing the procedure.',
          STALENESS_EXPLAINER,
        ].join('\n\n')
      : [
          STALENESS_EXPLAINER,
          conflictPolicy === 'stricter'
            ? 'The human chose the stricter policy: in addition to the computed check, require a manual human-level re-review of anything a concurrent change actually touched, even when the computed check reports the existing verdict is still current. Document this explicitly as an added step, not a replacement for the computed check, and note that it costs more review time in exchange for a second layer of confidence.'
            : 'The human chose the standard policy: a verdict whose recorded dependencies were not touched by a concurrent change is treated as still current without a separate manual re-review. Document the computed check itself precisely enough that a stranger could run it and get the same stale/current answer.',
        ].join('\n\n');

    const amendmentTaskBlock = amendmentDelegated
      ? 'The human is unsure how often to schedule a deliberate rulebook/plan review. Propose a cadence based on this project\'s actual size, rate of change, and risk profile (as recorded in earlier stages, if available), explain the tradeoff between a reactive-only trigger and a scheduled periodic review, and pause for the human\'s decision.'
      : amendmentCadence === 'scheduled'
        ? 'The human wants a scheduled periodic review. Document a recurring point at which the rulebook and plan are deliberately re-examined for a needed change, even if nothing has visibly broken — propose a specific, reasonable interval given this project\'s scope, and let the human adjust it.'
        : 'The human wants amendments to be reactive only. Document that no standing review is scheduled; a real problem, contradiction, or blocked checkpoint is what triggers a look at the rulebook or plan. Make clear this affects only when someone deliberately looks, not what happens once they do.';

    const task = [
      OPTIONAL_TRACKS_LINE,
      'This project preserves the following nine invariants across every track it runs, regardless of how many tracks that is:',
      CROSS_TRACK_INVARIANTS,
      trackTaskBlock,
      conflictTaskBlock,
      amendmentTaskBlock,
      'Regardless of the cadence chosen above, the amendment process itself never changes: an agent may propose a change to the rulebook or plan and explain its reasoning, but the change is not in force until the human Owner explicitly ratifies it. Document this process in writing, including where a proposed amendment is recorded pending the human\'s decision.',
      NO_SELF_AMEND_LINE,
      UNOWNED_RESOURCE_LINE,
      SLOW_TRACK_LINE,
    ].filter(Boolean).join('\n\n');

    const constraints = [
      'Never frame a higher track count as an achievement or a sign of a more mature project — a correctly single-track or even zero-track project is a complete, legitimate steady state, not a lesser one.',
      NO_NEW_AUTHORITY_LINE,
      'Do not let the amendment-cadence choice be confused with amendment authority: scheduling a periodic review only sets when someone deliberately looks for a reason to change something; it never grants any agent standing permission to make the change itself.',
      'Do not draft or imply a conflict-handling procedure that skips recording what a verdict actually depended on — a staleness check that has nothing explicit to check against is not a real procedure, whichever policy the human chose.',
    ].join('\n');

    const deliverables = [
      'An updated durable program-state map reflecting exactly which tracks are active right now — explicitly zero, one, or a named set of many — each with a one-line description, its current status, and any dependency it has on another track or a shared resource.',
      'A written staleness/conflict-handling procedure stating what counts as a concurrent change, what dependency record each verdict must carry, exactly how the computed check works, and — per the human\'s stated policy — whether a clean check is sufficient clearance on its own or a manual re-review is also required.',
      'A written governance-amendment process describing how a change to the rulebook or plan is proposed, that work on the affected track pauses pending review, the chosen review cadence, and that only the human Owner may ratify the change — never any agent, regardless of role.',
    ].join('\n');

    const qualityGates = [
      'The program-state map must be directly checkable against the project\'s actual current state — a stranger could verify the stated track count against the real repository and get the same answer.',
      'The staleness procedure must define "changed" in terms of an explicit, recorded dependency list per verdict, not vague language like "anything nearby" or "recent changes."',
      'The amendment process must have no path by which an agent\'s own proposal or approval counts as ratification — every path ends at the human Owner.',
      'Any second track must be justified by a verified, stated independence check — never opened on the assumption that two pieces of work are probably unrelated.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume two tracks share nothing just because they touch different-looking parts of the project — check for a shared dependency, environment, or resource explicitly before declaring them independent.',
      'Do not assume an unlabeled or unfamiliar-looking branch, worktree, or resource is abandoned and safe to remove — its owning track may simply not be obvious to you.',
      'Do not assume a track count or resource inventory stated earlier in this conversation (or in this stage\'s human answers) is still accurate without checking the actual current repository state.',
      'Do not assume a scheduled review cadence changes who may ratify an amendment — it never does; only the human Owner ratifies, on any cadence.',
    ].join('\n');

    const stopConditions = [
      'Stop and return to the human if a proposed second track\'s independence cannot be verified — do not authorize it "provisionally" while continuing to draft as if it were confirmed independent.',
      'Stop and report, without deleting or archiving anything, if you find a branch, worktree, or other resource whose owning track cannot be determined.',
      'Stop if documenting any of this stage\'s decisions would itself require amending the rulebook or a ratified plan — propose the specific amendment and return to the human rather than treating your own proposal as already adopted.',
      'Stop if you notice a track\'s slow progress being used, or about to be used, as a reason to hold up unrelated work in another track — flag that explicitly instead of encoding it as a rule.',
    ].join('\n');

    const approvalBoundary = 'Everything you produce in this stage is a proposal until the human Owner reviews and explicitly ratifies it. Opening a second track is itself a new bounded authorization, which is the human\'s decision, not something you grant yourself by drafting a track profile for it. Do not treat the conflict-handling procedure or the amendment process as already in force until the human confirms it.';

    const terminalReturn = [
      '"Done" for this stage means: the durable program-state map exists and its stated track count matches the project\'s actual current state; a written staleness/conflict-handling procedure exists and specifies exactly what a verdict\'s dependency record must contain and how the check works; and a written amendment process exists that routes every real change back to the human Owner for ratification, on the chosen cadence.',
      'Report exactly what you created or changed (paths), what you verified about the project\'s actual current tracks and resources and how — not just a claim — any unowned resources you found and left untouched, any assumptions you made, and any point where authority or the actual source of truth could not be established. Stop there for the human\'s review rather than proceeding to open a track, apply a policy, or make a change on your own.',
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'audit-stale-verdicts',
      label: 'Audit for stale verdicts after a concurrent change',
      description: 'Use instead of the primary prompt when a concurrent change has just landed in one track and you need to know exactly which existing verdicts elsewhere are now stale before treating any of them as still valid.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const conflictPolicy = answers.conflictPolicy;

        const roleAndAuthority = [
          'You are acting in an Engineering-Lead-like capacity, auditing which already-reviewed verdicts in this project are now stale after a concurrent change landed somewhere in it. You hold no authority to declare a verdict stale or current by impression — only by checking its recorded dependencies — and no authority to re-approve your own audit; the human Owner still decides what happens next.',
          'The verdict record and the durable program-state map are part of this project\'s protected governance material. This audit updates them honestly; it does not get to quietly weaken the staleness rule the project already adopted.',
        ].join('\n');

        const stageObjective = 'Identify the exact concurrent change that just landed, determine precisely which dependency each existing verdict relied on, and produce an honest list of which verdicts are now stale and require re-review versus which remain genuinely current — using the staleness rule this project already adopted, never a looser one invented for convenience.';

        const humanIntent = [
          quoteHumanInput('Conflict policy adopted for this project', CONFLICT_LABELS[conflictPolicy] || ''),
          quoteHumanInput('What changed, or where the concern started, in the human\'s own words', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = operatingModeText(
          fresh,
          're-verify which change actually landed and exactly what it touched directly from the project\'s history and files — do not audit from memory of what this conversation assumed earlier.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Identify the exact concurrent change: which track produced it, which file(s), dependency, or resource it actually touched, and when it landed — from the project\'s real history (commits, branches, logs), not from a description alone.',
              '- Locate every existing verdict in the project\'s durable record, along with the explicit list of dependencies each verdict was recorded against.',
              '- For each verdict, check directly whether any of its recorded dependencies match what the concurrent change actually touched — this is the computed check; do not rely on a general sense that "things nearby changed."',
              '- Confirm the project\'s adopted conflict policy; if it is the stricter policy, treat every verdict the concurrent change actually touched as requiring manual re-review regardless of what the computed check reports.',
              '- Confirm which track(s) actually depend on the changed dependency going forward — only dependents need attention; unrelated tracks proceed untouched.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-open the actual change history and the durable verdict record directly — do not audit from a description of the change given earlier in this conversation.',
              '- Re-confirm exactly what the concurrent change touched and which verdicts recorded that as a dependency.',
              '- If the adopted policy is stricter, re-confirm you are treating "touched by the change" as the trigger, not just "flagged by the check."',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          STALENESS_EXPLAINER,
          'Produce a verdict-by-verdict table: which verdict, what dependency it was recorded against, whether the concurrent change touched that dependency, the resulting stale/still-current determination, and the action needed (none, or a named re-review).',
          conflictPolicy === 'stricter'
            ? 'Because this project uses the stricter policy, also list every verdict the concurrent change touched at all, even where the computed check alone would report it as still current, and mark each for manual re-review.'
            : 'Because this project uses the standard policy, a verdict whose recorded dependencies the concurrent change did not touch stays current without a separate manual re-review — do not add re-review work the adopted policy does not call for.',
          'Update the durable program-state map or verdict record to reflect this audit\'s findings rather than leaving the result only in this conversation.',
          'Remember invariant 6 from this project\'s cross-track invariants: a track\'s own claim that its work is acceptable is never sufficient on its own — this audit exists precisely so a stale verdict is not mistaken for a still-valid independent review.',
        ].filter(Boolean).join('\n\n');

        const constraints = [
          'Do not invent a looser definition of staleness than the one this project already adopted, even if applying the real one is more work.',
          'Do not silently re-mark a stale verdict as current without an actual fresh review taking place — the audit identifies what needs re-review, it does not perform the re-review itself unless the human separately asks for that.',
          NO_SELF_AMEND_LINE,
        ].join('\n');

        const deliverables = 'A written, verdict-by-verdict audit result (dependency checked, touched or not, stale or current, action needed), an updated durable record reflecting each determination, and an explicit list of every verdict now requiring re-review with the track it belongs to named.';

        const qualityGates = [
          'Every stale/current determination must cite exactly which recorded dependency was checked and whether the concurrent change actually touched it — no determination by impression.',
          'No verdict may be marked "still current" without its recorded dependency list actually being checked against what changed.',
          'If the stricter policy is in force, no verdict the concurrent change touched may be left off the re-review list just because the computed check alone reported it as current.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume a verdict with no recorded dependency list is safe to treat as current — flag it as indeterminate and route it for re-review instead.',
          'Do not assume the concurrent change you were told about is the only one that has landed since the verdicts were recorded — check for others.',
          'Do not assume a track not named in the human\'s account is unaffected without checking its own verdicts\' dependency lists.',
        ].join('\n');

        const stopConditions = 'Stop and report, rather than guessing, if a verdict\'s dependency list was never recorded, if two concurrent changes conflict with each other in a way that makes the actual current state ambiguous, or if determining staleness for any verdict would require assuming instead of checking.';

        const approvalBoundary = 'This audit is a report, not a disposition. Only the human Owner decides whether an affected track pauses, proceeds, or gets a newly commissioned review; you do not re-approve any verdict yourself, however confident the check looks.';

        const terminalReturn = [
          '"Done" for this recovery means: every existing verdict potentially affected by the concurrent change has been classified stale or current with cited evidence, the durable record has been updated to match, and nothing was re-approved without an actual review.',
          'Report the full verdict-by-verdict table, any verdict where staleness could not be determined and why, and stop there for the human\'s review before any affected track resumes.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'resolve-shared-dependency',
      label: 'Resolve two tracks that turn out to share a dependency',
      description: 'Use instead of the primary prompt when two tracks assumed independent turn out to rely on the same file, resource, or environment, and that overlap needs to be identified and resolved before either track continues.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';

        const roleAndAuthority = [
          'You are acting as an independent auditor of this project\'s tracks, on behalf of the human Architect/Owner. You hold no authority to pause, merge, or resequence a track yourself — you locate the exact overlap, propose the minimal resolution, and stop for the human\'s decision.',
          'The program-state map recording each track and its dependencies is part of this project\'s protected governance material. Your output is a proposed resolution, not an applied change, until the human ratifies it.',
        ].join('\n');

        const stageObjective = 'Find the exact file, resource, dependency, or environment that two supposedly independent tracks both rely on, assess the real conflict risk it creates, and propose the minimal resolution that preserves both tracks\' progress without letting one track\'s pace freeze the other\'s unrelated eligible work.';

        const humanIntent = quoteHumanInput('What prompted the concern, or which tracks the human believes overlap, in their own words', freeText);

        const operatingMode = operatingModeText(
          fresh,
          're-verify exactly what each track actually touches directly from the project\'s files and history — do not resolve this from a description of the overlap given earlier in this conversation.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Read the durable program-state map to confirm which tracks are currently authorized and what each was recorded as depending on.',
              '- Independently trace what each of the two tracks in question actually reads, writes, or otherwise relies on — do not trust the original independence assessment; verify it directly against the current repository.',
              '- Identify the exact shared file, dependency, resource, or environment, and determine which track\'s change (if either has already made one) could invalidate the other\'s verdicts.',
              '- Check whether any other track, beyond the two named, also touches the same shared dependency — an overlap involving a third track is easy to miss if you only compare the named pair.',
              '- Confirm the current status of both tracks (in progress, blocked, awaiting review) so a proposed resolution accounts for where each actually stands, not where it was expected to stand.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              '- Re-open the program-state map and re-trace what each track actually touches directly, rather than relying on the independence assessment made when the tracks were opened.',
              '- Re-confirm the current status of both tracks, since either could have moved since this conversation last checked.',
              '- Check for a third track touching the same shared dependency, if any other track exists.',
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Identify precisely what is shared: name the exact file, dependency, resource, or environment, and state, with evidence, why it was originally assessed as independent when it is not.',
          'This project preserves the following nine invariants across every track — use them to reason about the resolution, not just the immediate overlap:',
          CROSS_TRACK_INVARIANTS,
          'Propose the minimal resolution that removes the conflict risk without discarding either track\'s progress — options typically include: sequencing one track\'s change ahead of the other with an explicit dependency note, splitting ownership of the shared resource so each track owns a distinct part of it, or, if the tracks are not actually independent at all, merging them back into one track under one checkpoint authorization. Explain the tradeoffs of each option you consider.',
          SLOW_TRACK_LINE,
          UNOWNED_RESOURCE_LINE,
          'Update the durable program-state map to record the newly discovered dependency between the two tracks, whichever resolution the human eventually chooses, so the next audit does not have to rediscover it.',
        ].join('\n\n');

        const constraints = [
          'Do not resolve the overlap by unilaterally pausing or discarding either track\'s work — propose the options and their tradeoffs, and let the human decide.',
          'Do not propose a resolution that makes one track permanently gate the other by default; if sequencing is the right call, scope it to the specific shared dependency, not to the tracks\' unrelated work.',
          NO_SELF_AMEND_LINE,
        ].join('\n');

        const deliverables = 'A precise description of the shared dependency and evidence that the original independence assessment missed it, a set of proposed resolutions with tradeoffs (sequencing, ownership split, or merging the tracks), and an updated program-state map entry recording the dependency regardless of which resolution is chosen.';

        const qualityGates = [
          'The overlap must be demonstrated with direct evidence from the current repository, not inferred from track names or descriptions.',
          'Every proposed resolution must leave both tracks\' unrelated work able to proceed independently — no resolution may silently freeze work the shared dependency does not actually touch.',
          'The audit must check for a third track sharing the same dependency, not just the two named by the human.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume the human\'s named pair is the only overlap — check whether a third track shares the same dependency.',
          'Do not assume the track that was opened first automatically has priority over the shared dependency; resolve based on the actual conflict risk and the tradeoffs, not on which track is older.',
          'Do not assume merging the two tracks back into one is always the safest answer — it discards the benefit of separate authorization and separate review where the overlap is narrow enough to sequence or split instead.',
        ].join('\n');

        const stopConditions = 'Stop and return to the human if two resolutions both look defensible and the choice is a genuine judgment call, if resolving the overlap would require a rulebook or plan amendment rather than a program-state update, or if you cannot determine with evidence which track\'s change (if either) actually came first.';

        const approvalBoundary = 'This resolution is a proposal until the human Owner reviews and chooses one option. Do not apply a sequencing rule, ownership split, or track merge as if it were already in force, and do not let either track proceed past the shared dependency on the assumption that your proposed resolution will be accepted.';

        const terminalReturn = [
          '"Done" for this recovery means: the shared dependency is precisely identified with evidence, every plausible resolution is presented with its tradeoffs, any third-track overlap is reported, and the program-state map records the dependency regardless of which resolution the human eventually picks.',
          'Report exactly what you found, what you verified and how, which resolution you recommend and why, and stop there for the human\'s decision rather than applying any resolution yourself.',
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'This stage exists because a project that only ever plans for one checkpoint at a time will eventually face a moment where two pieces of work genuinely could run at once, or where the rulebook written on day one no longer fits reality. Without a deliberate procedure, both moments tend to get resolved ad hoc — a second track gets opened because it seemed obviously fine, or a rule gets bent "just this once" — and each ad hoc resolution quietly erodes the same zero-trust guarantees the earlier stages spent effort establishing. Scaling & Maintenance turns those two moments into a written, checkable procedure instead of a judgment call made under time pressure.',
    problemPrevented: 'Without this stage, growth tends to arrive as improvisation: a second line of work starts inside the same checkpoint because splitting it out felt like overhead, a "quick fix" to the rulebook gets applied by whichever agent happened to notice the problem, or an old branch nobody remembers opening sits untouched until someone deletes it without checking. Each of these feels efficient in the moment and is exactly how authority boundaries and durable evidence quietly stop meaning anything. Naming the procedure in advance — for both concurrency and governance change — means the first real instance of either is handled by a rule everyone already agreed to, not a decision made under pressure by whoever is in the room.',
    judgmentVsInvestigation: 'Whether to open a second track, how much ceremony a conflict policy should carry, and how often to proactively revisit the rulebook are genuine judgment calls only the human can make — they trade real coordination overhead against real risk, and that tradeoff depends on stakes only the human knows. Whether a proposed second track is actually independent, which resources are currently unowned, what a given verdict\'s dependencies actually were, and whether a prior rulebook amendment was ever applied without ratification are all facts about the project\'s real state — the agent must investigate these directly, never accept a human\'s or an earlier conversation\'s account of them as sufficient.',
    promptAnatomy: 'The Exact task layer carries the heaviest content in this stage because the receiving agent needs the full cross-track invariant list, the staleness explainer, and the no-self-amendment rule spelled out generically — nothing about the method can be assumed already known. The three question branches (track ambition, conflict policy, amendment cadence) each get their own task block so the generated prompt stays proportionate to what the human actually chose, rather than dumping every possible policy on every project. Operating mode and Required repository investigation diverge sharply by mode because a same-conversation continuation carries real risk of trusting a stale track count or an outdated rulebook read earlier in the same conversation — this stage treats that risk as seriously as a genuinely fresh conversation\'s blank slate.',
    authorityBoundary: 'The agent drafting or updating the program-state map, conflict procedure, and amendment process holds no authority to actually open a track, adopt a policy, or approve a governance change — every one of those remains the human Owner\'s decision, made here in this conversation or in a follow-up review, never inferred from the agent having drafted supporting text. The amendment process this stage documents is itself a hard boundary: no combination of roles, however senior-sounding, may substitute for the human Owner\'s explicit ratification, and this stage\'s output must make that unambiguous rather than implying that a sufficiently thorough agent proposal is close enough.',
    inputsAndSources: 'Inputs are the three structured answers (track ambition, conflict policy, amendment cadence), the free-text field, and — critically — the project\'s actual current state: its durable program-state map if one exists, its real branches, worktrees, and in-progress checkpoints, its existing verdict records and what each depended on, and its current rulebook. No file, path, or document from outside the human\'s own project is ever a valid source for any part of this stage\'s output.',
    outputsAndEvidence: 'The expected outputs are three durable artifacts: an updated program-state map whose stated track count matches the repository\'s actual current state, a staleness/conflict-handling procedure precise enough that a stranger could run its computed check and get the same answer, and an amendment process document whose every path ends at the human Owner\'s ratification. Evidence of success is that all three remain checkable against reality after the conversation ends, not just plausible-sounding while the agent is drafting them.',
    failureModes: [
      'Treating a higher track count as a sign of progress or seriousness, and opening a second track on a vague sense that the work is "probably" independent rather than a verified check.',
      'Auto-deleting or archiving a branch or resource that looks abandoned, instead of surfacing it to the human as an unowned resource.',
      'Letting an agent apply a rulebook or plan change on the reasoning that it was "obviously" needed, instead of stopping and returning to the human for ratification.',
      'Writing a staleness procedure that never actually records what each verdict depended on, so the "computed check" has nothing concrete to check and quietly becomes a judgment call again.',
      'Letting one slow or blocked track become an informal reason to hold up unrelated work in another track, without ever writing that dependency down or challenging it.',
    ],
    weakResultSigns: [
      'The program-state map states a track count that does not match what is actually present in the repository when checked directly.',
      'The conflict-handling procedure describes staleness in vague terms ("re-review anything that seems affected") rather than a concrete, repeatable dependency check.',
      'The amendment process document has no explicit step where the human Owner ratifies — it just describes the agent proposing a change and moving on.',
      'A second track was opened with no written record of what independence check was actually performed.',
    ],
    customization: 'A small solo project may never need more than the single-track branch of this stage at all, and that is a completely correct, permanent answer — resist the temptation to draft a full multi-track procedure "just in case." A project running several genuinely independent tracks should treat the program-state map as a living document updated at every checkpoint transition, not something drafted once here and left stale; consider whether the stricter conflict policy is worth its overhead once the number of concurrently touched shared resources grows past what one person can mentally track.',
    whenToStop: 'Pause before ratifying anything here if you notice the track-independence claim rests on "they touch different files" without anyone having actually checked for a shared dependency further down — surface-level separation is not the same as verified independence. Also pause if the amendment process reads as a suggestion rather than a hard boundary; if you cannot point to the exact sentence that would stop an agent from applying its own rulebook edit, the process is not done yet.',
    auditWithoutPasting: 'You do not need to paste the full program-state map or procedure text back into this website to sanity-check it. Instead, ask your agent, in its own conversation, a concrete hypothetical: "if a concurrent change touched file X, which verdicts would this procedure flag as stale, and why exactly those and not others?" A precise, evidence-based answer means the procedure is real; a vague or hand-wavy one means it needs another pass.',
    weakVsStrongExample: {
      weak: '"We might add more tracks later if it makes sense, and we\'ll just re-review things if something seems off." This names no independence check, no dependency record, and no actual rule for when a review is required — it is a mood, not a procedure.',
      strong: '"Staying single-track for now; the program-state map lists exactly one active checkpoint and zero others. If a second track is opened later, it must be shown not to share any file, dependency, or environment with the first before being recorded as authorized. Every verdict must record the exact dependencies it relied on; a concurrent change only invalidates a verdict whose recorded dependencies it actually touched. Any rulebook change is proposed in writing and takes effect only once I explicitly ratify it — never automatically, and never by an agent\'s own decision."',
    },
  },
};
