import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const WHICH_CHECKPOINT_HELP = 'A checkpoint brief authorizes exactly one bounded unit of work — never a whole phase, and never "whatever comes next." If a prior bootstrap/fit-check step already proposed a first eligible checkpoint, most projects should simply confirm that one rather than jumping ahead to something else.';
const CEILING_HELP = 'This sets the numeric ceiling in the brief — a prioritization constraint on how long the executor works before it must stop and report, never permission to lower the acceptance bar if time runs out. Bigger is not automatically better: a tight leash catches problems earlier; a longer ceiling suits a checkpoint that only makes sense as one continuous push.';
const OWNER_PREAUTH_HELP = 'Leaving this blank is the common, correct default: most checkpoints carry no advance owner authorization, and the brief will record that honestly as "none" rather than leave it ambiguous. Only fill this in if you are deliberately pre-clearing something specific — for example a particular destructive or public action — before work starts.';

const CEILING_BAND_LABELS = {
  short: 'Short — under about an hour',
  standard: 'Standard — a working session, a few hours',
  long: 'Long or exploratory — a full day or more',
};

/** Reproduced inline, generically, so the generated prompt is self-contained for the receiving agent. */
const BRIEF_FIELDS = [
  '1. Target workspace or repository — one, unambiguous location for this checkpoint\'s work, never "wherever seems right."',
  '2. The authorized checkpoint itself — exactly one bounded unit of work, not a whole phase and not a vague direction.',
  '3. The ratified plan anchor — the exact file, section, and version this checkpoint comes from, named precisely (never "the newest plan file" or "whatever looks current").',
  '4. Expected state — a best-effort description of the current version, topology, predecessor artifacts, and environment, explicitly labeled as a hypothesis the executor must verify, never asserted as settled fact.',
  '5. An observable goal — an outcome someone could actually inspect and check, not an activity or an intention.',
  '6. A complete checklist citation plus the verbatim supporting extract — the full acceptance-bar text this checkpoint must meet, quoted, not paraphrased or summarized for convenience.',
  '7. Constraints and an execution/evidence profile, naming: (a) the target workspace, (b) how a candidate\'s identity will be made immutable and unique, (c) how evidence will be independently resolvable and linked to that exact candidate, (d) how a change in any reviewed dependency will be detected, (e) how the work will be isolated to a single writer, and (f) how resources get preserved or reclaimed when the checkpoint ends. If the project\'s own version-control mechanism does not already cover all six, document an explicit, equivalent mechanism for each one instead of skipping it.',
  '8. A numeric active-elapsed ceiling — one concrete number with units (for example a count of hours), stated as a prioritization constraint the executor must respect, never as permission to weaken the acceptance bar once time runs short.',
  '9. Owner-preauthorized actions, or explicitly "None" — this field is never left silently blank.',
  '10. Executor and session preconditions — for example a fresh-session requirement, and the boundary of what the executor may read versus what it may change.',
  '11. The stop-and-return instruction — exactly one terminal report is expected back, covering only this checkpoint; the executor must not look ahead to, or start, a later checkpoint.',
].join('\n');

/** Compact self-audit form of the same eleven fields, used in the quality-gate layers. */
const BRIEF_FIELD_GATES = [
  '1. Target workspace/repository is named once, specifically, and unambiguously.',
  '2. Exactly one bounded checkpoint is authorized — not a phase, not "the next few things."',
  '3. The ratified plan anchor is an exact, named file/section/version — never "the newest one."',
  '4. Expected state is present and explicitly labeled as a hypothesis, never asserted as verified fact.',
  '5. The goal is observable — someone could actually inspect and check it.',
  '6. The checklist citation includes the full verbatim bar text, not a paraphrase.',
  '7. The constraints/evidence profile names all six required primitives: workspace, candidate identity, evidence identity, dependency change-detection, single-writer isolation, and preservation/reclamation.',
  '8. The ceiling is one concrete number with units, framed as a prioritization constraint, never as license to weaken the bar.',
  '9. Owner-preauthorized actions are either named or explicitly recorded as "None" — never left ambiguous or omitted.',
  '10. Executor/session preconditions are stated explicitly.',
  '11. The stop-and-return instruction names exactly one terminal report, for this checkpoint only.',
].join('\n');

const PRECEDENCE_TEXT = [
  'When sources conflict, this order governs: (1) the project\'s ratified root governance/rulebook, (2) durable project state naming the exact ratified plan anchor currently in force, (3) the specific plan section containing this checkpoint\'s acceptance bar, (4) the execution-role contract for whichever role is acting, (5) other planning documents, maps, or forms, (6) the verified actual state of the repository, workspace, environment, or data.',
  'A file that looks newer or longer is not automatically the ratified anchor — only the project\'s own explicit ratification process, reflected in durable state, confers that status. If durable state and a plan file disagree about which anchor is current, durable state wins; if you cannot resolve which is current at all, that is itself a reason to return BRIEF_INVALID rather than guess.',
].join('\n');

function operatingModeText(fresh, continuityNote) {
  return fresh
    ? 'You are a fresh agent with no memory of any earlier conversation about this project, and you are expected to be running with direct read access to it from its root. Everything you need is in the repository, not in this prompt: the human\'s project documents were deliberately not pasted in here, so read them yourself rather than asking for them. If you cannot read the project\'s files, stop and say so rather than working from a description alone.'
    : `You are continuing in the same conversation that completed the previous step, so you may already hold relevant context. Treat that context as a starting point, not as evidence — anything you rely on here must be re-confirmed against the project\'s current files rather than recalled from an earlier turn. That continuity does not excuse skipping verification here: ${continuityNote}`;
}

function checkpointAnswers(answers) {
  const whichCheckpoint = answers.whichCheckpoint;
  const differentName = (answers.differentCheckpointName || '').trim();
  const ceilingPref = answers.ceilingPreference;
  const ceilingDelegated = ceilingPref === DELEGATE_VALUE;
  const ownerPreauth = (answers.ownerPreauthorizations || '').trim();
  return { whichCheckpoint, differentName, ceilingPref, ceilingDelegated, ownerPreauth };
}

function humanIntentBlock({ whichCheckpoint, differentName, ceilingPref, ceilingDelegated, ownerPreauth }, freeText) {
  return [
    quoteHumanInput(
      'Which checkpoint to authorize',
      whichCheckpoint === 'different'
        ? 'A different checkpoint than the one already proposed during bootstrap, named below'
        : 'The checkpoint already proposed during the bootstrap/fit-check phase',
    ),
    whichCheckpoint === 'different'
      ? quoteHumanInput('Checkpoint name given by the human (verify this against the ratified plan — do not trust it at face value)', differentName)
      : '',
    ceilingDelegated
      ? 'The human is unsure how much active effort this checkpoint should be bounded to, and asked you to investigate its actual scope and propose a concrete numeric ceiling yourself (see Exact task below).'
      : quoteHumanInput('Preferred ceiling band for this checkpoint', CEILING_BAND_LABELS[ceilingPref] || ''),
    ownerPreauth
      ? quoteHumanInput('Owner-preauthorized actions for this checkpoint', ownerPreauth)
      : 'The human left owner pre-authorizations blank — the common, correct default. Record field 9 of the brief as explicitly "None," not as an omitted field.',
    quoteHumanInput('Anything else the human wants understood before the brief is drafted', freeText),
  ].filter(Boolean).join('\n\n');
}

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'orchestrator-init',
  number: 10,
  title: 'Orchestrator Initialization',
  purpose: 'Issue one complete Checkpoint Brief, all eleven required fields, authorizing the first or next bounded unit of work.',
  agentProduces: 'One Checkpoint Brief containing all eleven required fields: target workspace/repository, the one authorized checkpoint, the exact ratified plan anchor, expected state, an observable goal, the complete checklist citation plus verbatim supporting extract, constraints and execution/evidence profile, a numeric active-elapsed ceiling, owner-preauthorized actions or explicitly none, executor/session preconditions, and the stop-and-return instruction.',
  prerequisites: ['bootstrap'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The eleven required fields of the Checkpoint Brief — target workspace, the one authorized checkpoint, the ratified plan anchor, expected state framed as a hypothesis, the observable goal, the complete checklist citation with a verbatim extract, the constraints/execution-evidence profile naming its six required primitives, the numeric active-elapsed ceiling, owner-preauthorized actions or an explicit "none," executor/session preconditions, and the single stop-and-return instruction — are the eleven required fields listed in RULEBOOK.md §5, "The checkpoint brief," and echoed in templates/1-checkpoint-brief.md.',
      'The BRIEF_INVALID rule — that a brief missing, ambiguous, contradictory, multi-workspace, or multi-checkpoint must be returned before any file edit, clock start, workbench, branch, candidate, bounded workspace, or Critic assignment exists, and that this is a correct, honest refusal rather than a soft warning or a failure — is RULEBOOK.md §5 together with templates/10-brief-invalid-return.md, which states that the return "is not a Return Packet."',
      'The instruction that expected state (field 4) is a hypothesis the executor must verify, and that verified actual state overrides it, is RULEBOOK.md §6, "Start, actual state, and the clock," and it applies equally whether the conversation drafting the brief is fresh or continued.',
    ],
    adapted: [],
    productDesign: [
      'The three specific ceiling bands offered in the ceilingPreference question — under about an hour, a working session of a few hours, and a full day or more — are this guide\'s own editorial choice to make an abstract "numeric ceiling" field concrete for a first-time user. The source method requires a numeric ceiling with units but does not prescribe these particular bands.',
      'Splitting "which checkpoint" into a binary choice between the bootstrap-proposed checkpoint and a human-named alternative, with a conditional follow-up text field, is this guide\'s own question design — the source method assumes the Orchestrator simply knows or investigates which checkpoint is next, rather than asking a structured question with this exact shape.',
      'Framing "none" as the common, correct default in the owner-preauthorizations question\'s help text is this guide\'s own editorial emphasis, meant to head off a beginner inventing a pre-authorization that was never actually intended — the underlying requirement that field 9 be explicit rather than blank is itself verified.',
    ],
  },
  questions: [
    {
      id: 'whichCheckpoint',
      type: 'radio',
      label: 'Which checkpoint are you authorizing right now?',
      help: WHICH_CHECKPOINT_HELP,
      required: true,
      affectsPrompt: 'Determines whether the generated prompt tells the agent to locate and verify the checkpoint already proposed during bootstrap, or to verify a different, human-named checkpoint against the ratified plan before treating it as eligible.',
      options: [
        { value: 'proposed', label: 'The checkpoint the Bootstrap stage already proposed', description: 'Use the first eligible checkpoint identified during the bootstrap intake and fit check.' },
        { value: 'different', label: "A different eligible checkpoint I'll name now", description: 'Something else in the ratified plan is actually next — name it below.' },
      ],
    },
    {
      id: 'differentCheckpointName',
      type: 'text',
      label: 'Name the checkpoint you want authorized',
      help: 'Name it the way it actually appears in your ratified plan or checklist — the agent will verify this against the real plan rather than take the name at face value.',
      required: true,
      dependsOn: { questionId: 'whichCheckpoint', equals: 'different' },
      placeholder: 'e.g. the exact checkpoint name, number, or section heading as it appears in your ratified plan',
      affectsPrompt: 'Quoted verbatim into the Human intent layer as the checkpoint the agent must locate and verify in the ratified plan before drafting a brief around it.',
    },
    {
      id: 'ceilingPreference',
      type: 'radio',
      label: 'Roughly how much active work should this one checkpoint be bounded to?',
      help: CEILING_HELP,
      required: true,
      allowDelegate: true,
      affectsPrompt: 'Sets the band the generated prompt asks the agent to convert into one concrete numeric ceiling with units; selecting the delegate option instead tells the agent to investigate the checkpoint\'s actual scope and propose a ceiling itself.',
      options: [
        { value: 'short', label: 'Short — under about an hour', description: 'A small, tightly-bounded step; check in soon.' },
        { value: 'standard', label: 'Standard — a working session, a few hours', description: 'A meaningful unit of work that still fits in one sitting.' },
        { value: 'long', label: 'Long or exploratory — a full day or more', description: 'A larger push, or work whose scope is genuinely hard to bound tightly.' },
      ],
    },
    {
      id: 'ownerPreauthorizations',
      type: 'textarea',
      label: 'Are you pre-authorizing any specific actions for this checkpoint right now — or explicitly none?',
      help: OWNER_PREAUTH_HELP,
      required: false,
      placeholder: 'e.g. "none" (the default), or a specific action you are pre-authorizing and why',
      affectsPrompt: 'Populates field 9 of the checkpoint brief verbatim if provided; if left blank, the generated prompt instructs the agent to record field 9 as explicitly "None" rather than omit it.',
    },
  ],
  freeTextLabel: 'What else should the agent understand about this checkpoint before it drafts the brief?',
  completionGate: [
    { id: 'investigated', label: 'The agent verified the ratified plan anchor, the checklist text, and the project\'s actual current state directly, rather than relying on my summary or an earlier conversation\'s claims.', kind: 'confirm', required: true },
    { id: 'briefComplete', label: 'A single Checkpoint Brief exists covering all eleven required fields, or the agent explicitly returned BRIEF_INVALID with every missing or defective field listed.', kind: 'confirm', required: true },
    { id: 'evidenceReported', label: 'The agent reported what it verified, what it assumed, and any unresolved conflicts with the ratified plan — not just a claim that the brief is ready.', kind: 'confirm', required: true },
    { id: 'reviewed', label: "I've reviewed the brief myself before treating it as issued.", kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the checkpoint brief (optional)', kind: 'text', required: false },
  ],
  buildLayers(answers, freeText, ctx) {
    const fresh = ctx.mode === 'fresh';
    const ck = checkpointAnswers(answers);
    const { whichCheckpoint, ceilingPref, ceilingDelegated } = ck;

    const roleAndAuthority = [
      "You are acting in an Orchestrator capacity for this project: your one job in this stage is to issue exactly one complete Checkpoint Brief that authorizes a single bounded unit of work. You do not do the technical work yourself, you do not decide architecture or implementation approach, and issuing this brief is not itself technical progress.",
      'A Checkpoint Brief is an authorization instrument, not a suggestion. Everything the executing team does afterward must trace back to what this brief actually authorized — nothing outside it is authorized, and nothing inside it may be silently reinterpreted once work starts.',
    ].join('\n');

    const stageObjective = "Produce one Checkpoint Brief, with all eleven required fields present, unambiguous, and consistent with each other and with the project's current ratified plan and actual state — so that whoever receives it can either begin work with a clear, bounded authorization, or correctly refuse to start because the brief itself is defective.";

    const humanIntent = humanIntentBlock(ck, freeText);

    const operatingMode = operatingModeText(
      fresh,
      "re-open and re-read the durable project state, the ratified plan anchor, and the actual current repository state directly before drafting anything — a prior turn's claim about which checkpoint is next, or what the repository looks like, is not evidence of what is true right now.",
    );

    const investigation = fresh
      ? [
          'This is a fresh conversation with no memory of any earlier discussion about this project, so verify everything from scratch rather than trusting anything asserted below as already true:',
          "- Read the project's ratified root governance/rulebook in full, directly from the repository.",
          '- Locate the durable project/program state record and identify the exact ratified plan anchor it names — the specific file, section, and version, never just "the newest plan file you can find."',
          "- Read the full plan section containing the checklist for the checkpoint in question, and copy its acceptance-bar text verbatim; do not paraphrase or summarize it.",
          whichCheckpoint === 'different'
            ? '- Confirm the checkpoint the human named actually exists in the ratified plan under that name, and that it is genuinely eligible right now: not already completed, not blocked by an unmet dependency, and not superseded by a more recent ratified plan revision.'
            : "- Confirm the checkpoint proposed during the project's bootstrap/fit-check phase is still the correct next one: not already completed, not blocked by an unmet dependency, and not superseded by a more recent ratified plan revision.",
          "- Determine the project's actual current state directly — current version markers, repository topology, any predecessor artifacts this checkpoint depends on, and the working environment — as verified fact, not as inherited from any earlier conversation, prior brief, or human description.",
          '- Search for any prior unfinished or abandoned checkpoint work (open branches, leftover scratch state, partial candidates) that could conflict with starting this checkpoint cleanly, and report anything unexplained rather than silently ignoring or deleting it.',
          '- Confirm no other checkpoint is already open and unresolved; if one is, that is very likely a reason to stop rather than issue a second brief.',
        ].join('\n')
      : [
          'Even though this continues the same conversation, re-verify rather than assume — actual state always overrides any expected-state narrative carried over from earlier in this conversation:',
          '- Re-open and re-read the durable project state and the ratified plan anchor it names directly — confirm it still names what you believe it names.',
          "- Re-read the checklist/acceptance-bar text for this checkpoint directly and re-copy it verbatim; do not rely on a version you quoted earlier in this conversation, in case the plan changed since.",
          '- Re-confirm the checkpoint is still genuinely eligible: not completed, not blocked, not superseded, and not already open under a different brief.',
          "- Re-confirm the project's actual current state (version, topology, predecessor artifacts, environment) directly rather than reusing anything asserted earlier in this conversation.",
        ].join('\n');

    const precedence = PRECEDENCE_TEXT;

    const ceilingTask = ceilingDelegated
      ? "The human did not pick a ceiling band and asked you to propose one yourself. Investigate the actual scope of this checkpoint (what it touches, how much verification its acceptance bar requires) and propose one concrete numeric ceiling with units, briefly explaining why that number fits the scope you found — then use that number for field 8."
      : `Convert the human's preferred band — ${CEILING_BAND_LABELS[ceilingPref] || 'the band recorded in Human intent above'} — into one concrete numeric ceiling with units (for example a count of hours) sized to this checkpoint's actual scope as you investigate it. The band is a starting point, not an exact figure to restate blindly; if your investigation shows the checkpoint's real scope clashes badly with the chosen band, say so and propose the number you actually recommend, flagging the mismatch for the human rather than silently overriding their preference.`;

    const task = [
      'This project requires exactly one issued Checkpoint Brief before any bounded unit of work may start. Produce one such brief — or an explicit BRIEF_INVALID refusal — covering all eleven fields listed below in Required deliverables.',
      whichCheckpoint === 'different'
        ? 'The checkpoint to authorize is the one the human named in Human intent above, not the one proposed during bootstrap. Verify it in the ratified plan before drafting anything around it — do not take the name at face value.'
        : "The checkpoint to authorize is the one already proposed during this project's bootstrap/fit-check phase. Verify directly that it is still the correct, eligible next checkpoint before drafting anything around it — do not assume a proposal from earlier is still current just because nothing has explicitly changed it.",
      ceilingTask,
      'Record field 9 (owner-preauthorized actions) exactly as captured in Human intent above — verbatim if the human named something specific, or explicitly "None" if they left it blank. Never leave this field empty or implied.',
      "For field 4 (expected state), state your best current understanding as a hypothesis inside the brief, but remember: the actual state you verify by inspecting the project always overrides any expected-state narrative, including anything asserted earlier in this very conversation.",
      "For field 6, quote the full checklist/acceptance-bar text verbatim from the ratified plan section you verified — a paraphrase or convenience summary does not satisfy this field.",
      "For field 7, verify rather than assume what mechanism the project actually has for the six required primitives listed below; if it lacks one, document an explicit equivalent instead of skipping the primitives that are inconvenient to name.",
    ].filter(Boolean).join('\n\n');

    const constraints = [
      'Issuing this brief is administrative authorization, not technical work: do not start implementing, do not create a branch, workbench, or candidate, and do not start any clock until the brief is complete and passes your own gate check below.',
      'Do not invent a value for any of the eleven fields that is not grounded either in something the human told you here or in something you actually verified in the project — an unverified guess dressed up as a field value is worse than an honest gap.',
      'Do not let the numeric ceiling (field 8) function as permission to weaken, shorten, or reinterpret the acceptance bar (field 6) if time looks tight — the ceiling bounds effort, never the bar.',
      'Do not draft or imply a second brief, a follow-on checkpoint, or "what comes after this" — this stage authorizes exactly one bounded unit of work and nothing beyond it.',
    ].join('\n');

    const deliverables = [
      'Exactly one Checkpoint Brief, containing all eleven fields below, each explicitly labeled and populated — or, if any field cannot honestly be completed, an explicit BRIEF_INVALID return instead (see Stop-and-escalate conditions):',
      BRIEF_FIELDS,
    ].join('\n\n');

    const qualityGates = [
      'Before treating the brief as ready, check every one of these, field by field — this is a self-audit, not a formality:',
      BRIEF_FIELD_GATES,
      'If any single check above fails, the correct outcome is BRIEF_INVALID, not a brief with a weak or guessed field.',
    ].join('\n\n');

    const prohibitedAssumptions = [
      'Do not assume the checkpoint the human named (or the one bootstrap proposed) is still eligible just because someone said so earlier — verify it against the ratified plan and current project state yourself.',
      "Do not assume the most recently modified or longest planning file is the ratified anchor; only the project's own explicit ratification process, reflected in durable state, decides that.",
      'Do not assume a blank owner-preauthorization answer means anything other than an explicit "None" — never infer an unstated pre-authorization, and never leave the field silently empty either.',
      'Do not assume the expected state you describe in field 4 is still accurate merely because it matches what was true earlier in this conversation or in an earlier stage — actual state overrides expected-state narrative every time, in a fresh conversation or a continued one.',
    ].join('\n');

    const stopConditions = [
      'A brief that is missing, ambiguous, or contradictory on any one of the eleven fields must be returned as BRIEF_INVALID before any file edit, before any clock starts, and before any workspace, branch, workbench, or candidate is created. This is not a soft warning to note in passing and continue past — it is the correct, honest outcome, and you must stop there and list every defective field by number rather than proceeding on a best guess.',
      'Also stop and return to the human rather than guessing if: the ratified plan anchor cannot be identified unambiguously; the checkpoint in question turns out to already be complete, already open under another brief, or blocked by an unmet dependency; the checklist text you find conflicts with itself or with the durable project state; or you cannot determine, from the project itself, whether some detail is settled fact or someone\'s unratified assumption.',
    ].join('\n\n');

    const approvalBoundary = 'This brief is a proposed authorization until the human reviews it. Do not treat the brief as issued, do not begin any technical work under it, and do not act in an Engineering-Lead or Builder capacity in this same stage — drafting the brief and executing against it are different bounded units of work, kept separate on purpose.';

    const terminalReturn = [
      '"Done" for this stage means exactly one of two things: a complete Checkpoint Brief exists with all eleven fields present, verified, and consistent with each other and with the project\'s current ratified plan and actual state — or an explicit BRIEF_INVALID return listing every defective field, with nothing else created in the meantime.',
      "Report what you verified directly and how (not just a claim), the exact field values you are proposing for the brief, any assumption you made and why, any unresolved conflict between the plan and actual project state, and any field you could not honestly complete. If authority over some detail — which plan is ratified, whether a checkpoint is genuinely eligible — cannot be established from the project itself, stop and say so rather than proceeding on a best guess.",
    ].join('\n\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'repair-brief-invalid',
      label: 'Repair an invalid brief (BRIEF_INVALID) — list every missing field',
      description: 'Use instead of the primary prompt when a checkpoint brief already exists but is missing, ambiguous, or contradictory on one or more of the eleven required fields — whether it was already returned as BRIEF_INVALID or you suspect it should have been — and nothing may start until it is fixed.',
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const ck = checkpointAnswers(answers);

        const roleAndAuthority = [
          'You are acting in an Orchestrator capacity to repair one existing Checkpoint Brief for this project — not to draft a brand-new one from scratch and not to touch anything beyond the brief itself. Repairing the brief is still authorization work, not technical work: nothing about this repair authorizes starting the checkpoint until the repaired brief passes its own gate check.',
          'Until the repair is complete and reviewed, treat the existing brief as not-yet-valid: do not let any part of it be used to justify starting or continuing technical work in the meantime.',
        ].join('\n');

        const stageObjective = 'Find every field of the existing Checkpoint Brief that is missing, ambiguous, or contradictory, list each one explicitly by number, and produce a corrected brief that passes the same eleven-field gate the primary prompt uses — without inventing a value for any field that cannot honestly be verified.';

        const humanIntent = humanIntentBlock(ck, freeText);

        const operatingMode = operatingModeText(
          fresh,
          're-read the actual current brief you are repairing, the durable project state, and the ratified plan anchor directly from the project files — do not repair from memory of what the brief said earlier in this conversation.',
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Locate and read the existing Checkpoint Brief in full, directly from wherever the project keeps it.',
              "- Read the project's ratified root governance/rulebook and the durable project state naming the current ratified plan anchor.",
              "- Read the full plan section containing this checkpoint's acceptance bar and copy it verbatim, to compare against whatever the existing brief currently states.",
              "- Check the project's actual current state (version, topology, predecessor artifacts, environment) directly, since the brief's expected-state field is only a hypothesis and actual state overrides it.",
              "- If the human's free text names a specific defect, verify it against the brief's actual current text rather than taking the description at face value — and still check the other ten fields, since a brief invalid on one field is a strong signal to re-check all eleven.",
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              "- Re-read the existing brief's current, saved text directly — do not repair from what you recall drafting earlier.",
              "- Re-confirm the ratified plan anchor and the checklist's verbatim text directly, in case the plan changed since the brief was drafted.",
              "- Re-confirm the project's actual current state directly rather than reusing anything asserted earlier in this conversation.",
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Compare the existing brief, field by field, against the eleven required fields listed below in Required deliverables. For every field that is missing, ambiguous, self-contradictory, or unverifiable against the actual project state, list it explicitly by number and explain concretely what is wrong with it — quote the brief\'s actual current wording for that field so the defect is visible, not just asserted.',
          'Where you can honestly verify a corrected value for a defective field, propose it. Where you cannot — because the ratified anchor is genuinely ambiguous, or the checkpoint\'s eligibility cannot be established — leave that field flagged as unresolved rather than filling it with a guess.',
          'If, after this review, every field can be honestly completed, produce one corrected brief. If any field still cannot be honestly completed, return BRIEF_INVALID again, with the remaining defects listed — a partially-fixed brief is not a valid one.',
        ].join('\n\n');

        const constraints = [
          'Do not treat a brief with even one remaining defective field as usable — this repair produces either a fully corrected brief or another explicit BRIEF_INVALID, never something in between presented as "good enough."',
          'Do not start any technical work, create any branch/workbench/candidate, or start any clock as part of this repair.',
          "Do not silently fix a field by inventing a value not grounded in the project's actual state or in something the human told you.",
        ].join('\n');

        const deliverables = [
          "An explicit, numbered list of every defect found in the existing brief, each quoting the brief's actual current wording for that field.",
          'Either a fully corrected brief covering all eleven fields below, or, if any field still cannot be honestly completed, an explicit BRIEF_INVALID return naming exactly what remains unresolved.',
          BRIEF_FIELDS,
        ].join('\n\n');

        const qualityGates = [
          'Every field of the corrected brief must pass the same self-audit as a brand-new brief, field by field:',
          BRIEF_FIELD_GATES,
          'A brief is only "repaired" once every check above passes — a partial fix that leaves one field weak or guessed is still BRIEF_INVALID.',
        ].join('\n\n');

        const prohibitedAssumptions = [
          'Do not assume the rest of the brief is fine just because the human only flagged one field — check all eleven; a brief invalid on one field is a signal to re-check every field, not license to skip the rest.',
          "Do not assume the original brief's author verified what it claims to have verified — re-verify every field against the actual project state yourself.",
          'Do not assume a blank or vague field 9 in the original brief was an intentional "none" — confirm that explicitly rather than inheriting the ambiguity into your repair.',
        ].join('\n');

        const stopConditions = [
          "A repaired brief still missing, ambiguous, or contradictory on any field must be returned as BRIEF_INVALID before any file edit, clock start, or workspace/branch/workbench/candidate is created — exactly the same rule as the primary prompt, with no exception for \"it's mostly fixed.\"",
          'Stop and return to the human, rather than guessing, if fixing one field genuinely requires a decision only the human can make — for example choosing between two plausible ratified anchors, or deciding whether a partially-stale expected state still counts as this checkpoint or a different one now.',
        ].join('\n\n');

        const approvalBoundary = 'The repaired brief is a proposal until the human reviews it. Do not treat the repair as already issued, do not begin any technical work under it, and do not act in an Engineering-Lead or Builder capacity in this same stage.';

        const terminalReturn = [
          '"Done" for this repair means either a fully corrected brief exists with all eleven fields verified and consistent, or an explicit BRIEF_INVALID stands with every remaining defect named — never a brief presented as ready while a defect remains unaddressed.',
          'Report the original defects found (quoted), what you verified to correct each one and how, any field you could not honestly resolve, and stop there for the human\'s review rather than proceeding to use the brief.',
        ].join('\n\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'audit-brief-drift',
      label: 'Audit the brief against the ratified plan anchor for drift',
      description: "Use instead of the primary prompt when an already-issued checkpoint brief might no longer match the project's current ratified plan — for example the plan was amended, the checklist text changed, or the real repository state has diverged from what the brief describes — and you need it checked for drift before any more work continues under it.",
      buildLayers(answers, freeText, ctx) {
        const fresh = ctx.mode === 'fresh';
        const ck = checkpointAnswers(answers);

        const roleAndAuthority = [
          'You are acting as an independent auditor of one already-issued Checkpoint Brief, on behalf of the human. You hold no authority to keep the checkpoint running or to stop it unilaterally — you compare the brief against the current ratified plan and current actual state, report exactly what has drifted, and stop for the human\'s decision.',
          "This audit checks the brief's authorization envelope against current reality — it is not a technical review of any work produced under the brief, and it does not replace one.",
        ].join('\n');

        const stageObjective = "Compare the currently-issued Checkpoint Brief, field by field, against the project's current ratified plan anchor and current actual state, and report exactly which fields have drifted out of sync since the brief was issued — so the human can decide whether the checkpoint may continue as authorized, needs a corrected brief, or must stop.";

        const humanIntent = humanIntentBlock(ck, freeText);

        const operatingMode = operatingModeText(
          fresh,
          "re-read the brief, the durable project state, and the ratified plan anchor directly, and compare them against the project's actual current state — do not audit from memory of what was true earlier in this conversation.",
        );

        const investigation = fresh
          ? [
              'This is a fresh conversation with no memory of any earlier discussion, so verify everything from scratch:',
              '- Read the currently-issued brief in full, directly from wherever the project keeps it.',
              '- Read the durable project state and confirm which plan anchor it currently names as ratified — compare this against the anchor named in the brief; they may no longer be the same file, section, or version.',
              "- Read the current checklist/acceptance-bar text at that anchor and compare it, sentence by sentence if needed, against the verbatim extract quoted in the brief.",
              "- Determine the project's actual current state (version, topology, predecessor artifacts, environment) directly, and compare it against the brief's expected-state field — remember expected state was always a hypothesis, so a mismatch here is expected drift to report, not evidence anything is broken.",
              '- Check whether the checkpoint the brief authorizes is still open, already completed, or has been superseded by later ratified planning.',
            ].join('\n')
          : [
              'Even in a continued conversation, re-verify rather than assume:',
              "- Re-read the brief's current text and the durable project state's currently-named anchor directly.",
              "- Re-compare the checklist text at that anchor against the brief's quoted extract, in case the plan was amended since the brief was issued.",
              "- Re-confirm the project's actual current state directly rather than reusing anything asserted earlier in this conversation.",
            ].join('\n');

        const precedence = PRECEDENCE_TEXT;

        const task = [
          'Compare the issued brief against current reality, field by field, using the eleven fields listed below in Required deliverables as your checklist. For each field, report one of: unchanged and still accurate; drifted, with the old and new values both stated; or cannot be confirmed either way, with what is blocking confirmation.',
          "Pay particular attention to field 3 (does the brief still name the currently-ratified anchor, or has a newer plan superseded it), field 6 (does the checklist text still say what the brief quotes), and field 4 (has actual state diverged from the brief's expected-state hypothesis enough to matter).",
          'Do not silently correct the brief yourself. Report the drift you find and let the human decide whether the checkpoint may continue as originally authorized, needs a formally corrected brief, or should stop.',
        ].join('\n\n');

        const constraints = [
          'This is an audit, not a repair and not a technical review — do not rewrite the brief, do not judge whether any work produced under it meets its acceptance bar, and do not start, pause, or resume any technical work yourself.',
          'Do not treat a drifted field as automatically disqualifying or automatically fine — report what changed and let the human weigh it; some drift is trivial, some is not, and that judgment belongs to the human.',
        ].join('\n');

        const deliverables = [
          'A field-by-field drift report covering all eleven fields, each marked unchanged, drifted (with both old and new values), or unconfirmable (with what is blocking confirmation).',
          BRIEF_FIELDS,
        ].join('\n\n');

        const qualityGates = [
          "The audit must cover every one of the eleven fields, not only the ones the human's free text mentioned — drift in an unnamed field is exactly the kind of thing this audit exists to catch:",
          BRIEF_FIELD_GATES,
          'Every claim of "unchanged" must be backed by something you actually compared, not inferred from the field looking plausible.',
        ].join('\n\n');

        const prohibitedAssumptions = [
          'Do not assume a field is unchanged because nothing in this conversation mentioned it changing — compare it directly against current project state regardless.',
          "Do not assume the brief's original author verified everything it claims — re-verify independently.",
          'Do not assume drift automatically means the checkpoint must stop, or automatically means it is fine to continue — that judgment belongs to the human, not to you.',
        ].join('\n');

        const stopConditions = [
          'If the audit finds that the ratified plan anchor itself has changed, or the checklist text the checkpoint is being held to no longer matches what the brief quotes, stop and flag this clearly as a likely BRIEF_INVALID situation for the current brief — the human must decide whether to re-issue rather than let work continue against an anchor that is no longer current.',
          'Stop and return to the human, rather than guessing, if you cannot determine which of two plan versions is actually the ratified one, or if resolving the drift you found requires a judgment call only the human can make.',
        ].join('\n\n');

        const approvalBoundary = "This audit is informational until the human reviews it. Do not pause, resume, or alter the checkpoint's status yourself, and do not treat any proposed correction as applied — the human decides whether the checkpoint continues, needs a corrected brief, or stops.";

        const terminalReturn = [
          '"Done" for this audit means all eleven fields have been directly compared against current reality and reported as unchanged, drifted, or unconfirmable — with evidence for each, not impression.',
          'Report the full field-by-field comparison, flag clearly whether the ratified anchor or checklist text itself has changed, and stop there for the human\'s decision rather than proceeding to correct the brief or resume work yourself.',
        ].join('\n\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'The Checkpoint Brief is the one instrument that turns "start working on X" from a vague request into a bounded, checkable authorization. Every one of its eleven fields exists to close a specific way authorization silently leaks or gets assumed — an unnamed workspace, a plan anchor picked by "which file looks newest," a goal nobody could actually check, a bar quoted from memory instead of verbatim, a ceiling nobody wrote a number for. This stage exists to force all eleven into the open, together, before a single file changes.',
    problemPrevented: 'Without a complete brief, work tends to start on the strength of a conversation rather than a document — someone remembers roughly what the last plan said, roughly which checkpoint is next, roughly how big it should be. Each "roughly" compounds: by the time work is done, nobody can say for certain whether it matches what was actually ratified, because nothing pinned that down at the start. The eleven-field brief, and the BRIEF_INVALID refusal when any field cannot be honestly completed, exist specifically to catch this before the first line changes rather than at review time, when it is far more expensive to unwind.',
    judgmentVsInvestigation: "Only three things in this stage are genuinely the human's judgment call: which checkpoint to authorize right now (or trusting the one already proposed), roughly how much active effort it should be bounded to, and whether anything is being pre-authorized in advance. Everything else that ends up in the brief — the exact ratified plan anchor, the verbatim checklist text, the project's actual current state, whether the named checkpoint is genuinely eligible, what mechanism the project has for candidate identity and evidence linkage — is fact the agent must go verify directly in the project, never something asked back to the human as a structured question. The delegate option on the ceiling question is the escape hatch for the one judgment call that sometimes really does need investigation first: how big a checkpoint of unclear shape should be bounded to.",
    promptAnatomy: "This stage's Human intent layer stays short on purpose — three or four short facts — because the brief itself is mostly a verification exercise, not a drafting exercise: the agent's job is to go confirm eleven specific facts about the project and assemble them, not to invent governance content. The Required deliverables and Quality and evidence gates layers both spell out all eleven fields explicitly and in the same order, which is deliberate redundancy: a field skipped while drafting has a second chance to be caught in the self-audit before the brief is ever shown to the human. The Stop-and-escalate conditions layer is unusually blunt for this journey — BRIEF_INVALID is stated as a correct, mandatory outcome rather than a fallback, because a defective brief that quietly gets used anyway is far more expensive than a brief that honestly refuses to be issued.",
    authorityBoundary: 'The agent drafting this brief is acting in an Orchestrator capacity: it may decide what checkpoint, what ceiling, and what constraints get named, but it may not weaken or reinterpret the acceptance bar it copies from the ratified plan, may not start technical work itself, and may not treat its own drafted brief as already issued. Issuing the brief is authorization, not execution — the moment any technical work would start, a different role and a different stage take over, deliberately kept separate so the same conversation cannot both authorize a checkpoint and immediately begin loosening it.',
    inputsAndSources: "Inputs are the three structured answers (which checkpoint, the ceiling preference, any owner pre-authorizations), the free-text field, and — for every fact-shaped field in the brief — the project's own ratified governance, durable project state, and current actual repository state, all of which the agent must read directly rather than accept as asserted by this prompt or by an earlier conversation. No file, path, or document from outside the human's own project is ever a valid source for any field of this brief.",
    outputsAndEvidence: "The expected output is either one complete Checkpoint Brief with all eleven fields verified and mutually consistent, or an explicit BRIEF_INVALID return naming every defective field. Evidence is the brief's own traceability: field 3 should name an anchor a stranger could go open, field 6 should be a quote a stranger could go compare against the real checklist, and the agent's report should distinguish plainly between what it verified directly and what it is still treating as unresolved.",
    failureModes: [
      'Copying whatever checkpoint name or plan file "sounds current" instead of tracing it through durable project state to the actual ratified anchor.',
      'Summarizing the checklist text into a tidier sentence instead of quoting it verbatim, so field 6 quietly becomes someone\'s paraphrase of the bar rather than the bar itself.',
      'Treating a missing owner-preauthorization answer as "nothing to report" and leaving field 9 out entirely, rather than recording the explicit "None" the method requires.',
      'Writing a numeric ceiling and then treating it, later, as if it also lowered the acceptance bar — "we ran out of time so this is good enough" is a bar violation, not a ceiling event.',
      "Issuing a brief anyway when one field is genuinely shaky, on the theory that the human can sort it out later — this is exactly the soft-warning failure the BRIEF_INVALID rule exists to prevent.",
    ],
    weakResultSigns: [
      'Field 3 names "the latest plan" or "the current roadmap file" instead of an exact, specific anchor.',
      'Field 6 reads like a summary sentence rather than a quotation — nothing in it looks copied from anywhere specific.',
      'Field 8 is a vague phrase ("a reasonable amount of time") instead of one concrete number with units.',
      'Field 9 is simply absent from the brief rather than stating "None" explicitly.',
      "The brief was issued even though the agent's own report admits it could not confirm the checkpoint is currently eligible.",
    ],
    customization: "A very small or very informal project can still use all eleven fields — the ceremony scales in how much text each field needs, not in whether the field exists. For a project running several tracks in parallel, add a short cross-track note to field 1 or field 9 naming which other checkpoints are currently open, so the human can see at a glance whether this brief might collide with one of them; the method itself expects a durable cross-track map for exactly this reason.",
    whenToStop: "Stop before accepting a brief if you cannot point to where field 3's anchor or field 6's verbatim extract actually came from — if the agent cannot show you the specific place it read them, treat the brief as unverified regardless of how complete it looks. Also stop if the brief was issued in the same breath as the agent starting to describe how it would do the work — authorization and execution are supposed to be different moments, and a brief that blurs into a work plan has already started drifting toward self-authorization.",
    auditWithoutPasting: "You do not need to paste the full brief back into this website to sanity-check it. Ask the agent, in its own conversation, to point to the exact source it read for field 3 (which file, which durable-state record) and to re-paste field 6's extract next to the actual checklist text so you can eyeball whether they match. If it cannot do either on request, the brief has not actually been verified yet, whatever it claims.",
    weakVsStrongExample: {
      weak: '"Checkpoint: keep building the app. Time: a while. Bar: make it good." — no named workspace, no exact anchor, no verbatim bar, no number, and nothing here could ever be checked against reality after the fact.',
      strong: 'Workspace: the project\'s primary repository. Checkpoint: implement the CSV export feature named in the plan\'s Milestone 3 section, version dated the day it was ratified. Expected state: main branch at its last-known commit, no export code present yet — to be verified before starting. Goal: a user can export the current view to a valid CSV file from the UI. Checklist (verbatim): "Given a filtered view, selecting Export produces a UTF-8 CSV containing exactly the visible rows and columns, downloadable without a server round trip." Ceiling: 4 hours of active work. Owner pre-authorization: None. Preconditions: fresh session, read access to the full repository, write access limited to the export feature\'s own files. Stop-and-return: one report back to the human when this checkpoint is done, blocked, or the ceiling is reached — no work on any later milestone begins under this brief.',
    },
  },
};
