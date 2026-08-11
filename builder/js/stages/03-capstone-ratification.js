import { quoteHumanInput } from '../compiler.js';
import { DELEGATE_VALUE } from '../ui/questions.js';

const CHALLENGE_INTENSITY_OPTIONS = [
  { value: 'light', label: 'Light gut-check', description: 'A quick sanity pass — flag anything obviously broken, not an exhaustive audit.' },
  { value: 'standard', label: 'Standard challenge', description: 'A solid, even-handed pass through all six lenses below.' },
  { value: 'adversarial', label: 'Adversarial and thorough', description: 'Actively try to break the draft — assume each claim is wrong until it can be defended.' },
];

const FOCUS_AREA_OPTIONS = [
  { value: 'scopeCreep', label: 'Scope creep', description: 'The Capstone has quietly grown bigger than the original idea.' },
  { value: 'technicalFeasibility', label: 'Technical feasibility', description: 'Something in it may not actually be buildable as described.' },
  { value: 'missingConstraints', label: 'Missing constraints', description: 'Real limits — time, budget, compliance, platform — aren\'t reflected anywhere.' },
  { value: 'ceremonyFit', label: 'Ceremony-vs-project-size fit', description: 'The plan\'s weight doesn\'t match how small or informal this project actually is.' },
  { value: 'userValueMismatch', label: 'User-value mismatch', description: 'The acceptance bar doesn\'t actually match what the intended users need.' },
  { value: 'timelineRealism', label: 'Timeline realism', description: 'The milestones assume more time or resources than are really available.' },
];

const CHALLENGE_INTENSITY_INSTRUCTION = {
  light: 'Apply a light gut-check: flag anything obviously broken or clearly missing, but do not manufacture concerns out of stylistic disagreement. If the draft looks basically sound, say so plainly rather than padding the critique to look thorough.',
  standard: 'Apply a standard, even-handed challenge: work through all six lenses with real effort, extending reasonable benefit of the doubt where the draft is merely ambiguous rather than assuming the worst.',
  adversarial: 'Apply an adversarial, thorough challenge: actively try to break the draft. Assume each claim in it is wrong until you can find or construct a reason it holds. Chase feasibility concerns and hidden assumptions harder than you would by default, and do not stop at the first plausible-sounding answer.',
};

function optionLabel(options, value) {
  const opt = options.find((o) => o.value === value);
  return opt ? opt.label : '';
}

function focusAreaParts(answers) {
  const raw = Array.isArray(answers.focusAreas) ? answers.focusAreas : [];
  const delegateFocus = raw.includes(DELEGATE_VALUE);
  const namedFocusLabels = raw.filter((v) => v !== DELEGATE_VALUE).map((v) => optionLabel(FOCUS_AREA_OPTIONS, v)).filter(Boolean);
  return { delegateFocus, namedFocusLabels };
}

function focusAreaGuidance(delegateFocus, namedFocusLabels) {
  if (delegateFocus) {
    return 'The human was not sure which of the six lenses below to prioritize and asked you to work that out yourself from the actual draft, rather than pre-selecting for you. State which lenses you prioritized and why before you dive in, then still address all six.';
  }
  if (namedFocusLabels.length) {
    return `The human already suspects trouble in: ${namedFocusLabels.join('; ')}. Give those extra scrutiny, but still address all six lenses below — do not skip the ones the human didn't name.`;
  }
  return 'The human did not flag any particular lens as more worrying than another — apply all six lenses below with even attention.';
}

function capstonePathHint(ctx) {
  const gate = (ctx.allGates && ctx.allGates.capstone) || null;
  if (gate && gate.artifactPath) {
    return `The human previously recorded the draft Capstone's location as: ${gate.artifactPath}. Treat that as a starting hint, not as ground truth — confirm the file still exists there and still reads as a Capstone before relying on it.`;
  }
  return 'No location was recorded for the draft Capstone in this tool. Locate it yourself inside the project: look for the document that defines the project\'s observable outcome, milestones, and acceptance bar. If you find more than one plausible candidate, or none at all, say so explicitly rather than guessing which one is authoritative.';
}

const SIX_LENSES = [
  '1. Contradictions — places where the draft asserts two things that cannot both be true (about scope, priorities, constraints, or the acceptance bar itself).',
  '2. Hidden assumptions — things the draft quietly depends on without saying so (a particular technology, a level of user sophistication, a resource or dependency being available).',
  '3. Premature architecture decisions — implementation or technical choices baked into what should be an outcome-level document, foreclosing legitimate alternatives before anyone actually decided they were necessary.',
  '4. Missing constraints — real limits that exist (time, budget, compliance, platform, team size, existing commitments) but are not reflected anywhere in the draft.',
  '5. Feasibility — anything claimed that is unlikely to actually be achievable as written, given what you found investigating the real project and its constraints.',
  '6. Scope — whether the draft\'s boundary is honest: too much for what was actually asked for, too little to be a real acceptance bar, or mismatched against the stated users and risk tolerance.',
].join('\n');

const FALSIFIABILITY_CHECK = 'For each thing the draft claims will count as "done", check whether it is actually observable and falsifiable — something that could be checked and could fail — or whether it is a vague aspiration like "make it great" that nobody could ever fail. Treat every aspiration-only criterion you find as a missing-constraints finding in its own right.';

const RATIFICATION_LINE = 'AWAITING_OWNER_RATIFICATION — nothing above is ratified until the human says so.';

/** @type {import('../lib/schema.js').StageModule} */
export default {
  id: 'capstone-ratification',
  number: 3,
  title: 'Capstone Challenge & Ratification',
  purpose: 'Stress-test the draft Capstone for contradictions, hidden assumptions, and missing constraints, then have the human explicitly ratify it or send it back for revision.',
  agentProduces: 'A written critique of the draft Capstone against six lenses — contradictions, hidden assumptions, premature architecture decisions, missing constraints, feasibility, and scope — plus either a revised Capstone or a specific list of open questions for the human.',
  prerequisites: ['capstone'],
  requiresWorkspaceAgent: true,
  methodProvenance: {
    verified: [
      'The rule that ratification is the human\'s own affirmative act — never inferred from silence, enthusiasm, or permission to merely inspect — comes directly from the bootstrap\'s AWAITING_OWNER_RATIFICATION mechanic, which this stage\'s approval boundary and terminal return layers apply specifically to the Capstone.',
      'The rule that an agent may propose exact replacement language but can never ratify its own proposal is drawn directly from the source method\'s precedence doctrine: only ratification confers authority, and no role\'s own claim promotes itself across that boundary.',
      'The definition of a real acceptance bar as authorized, stable, and falsifiable — as opposed to a mere goal like "make it excellent" — is drawn directly from the method brief, and underlies this stage\'s feasibility and missing-constraints lenses and the falsifiability check in the Exact task layer.',
    ],
    adapted: [
      'The repair recovery prompt\'s instruction to loop a self-directed critique-and-repair pass against your own revision until a fresh pass finds nothing new adapts the Gauntlet Loop\'s inner build/critique/iterate pattern — judge against a concrete bar, send back the single largest gap, and loop without a fixed round count — applied here to one document instead of a whole build.',
    ],
    productDesign: [
      'The specific six-lens challenge checklist — contradictions, hidden assumptions, premature architecture decisions, missing constraints, feasibility, and scope — is this guide\'s own operationalization of what a Capstone review should cover. The source method establishes the ratification boundary and the anti-self-ratification rule, not a specific critique taxonomy like this one.',
      'The three-level challengeIntensity question (light gut-check / standard / adversarial-thorough) and the six checkbox focus areas are this guide\'s own UI framing to let a beginner calibrate effort without already having to know what\'s wrong with their draft — nothing in the source method ties intensity levels to named categories like these.',
    ],
  },
  questions: [
    {
      id: 'challengeIntensity',
      type: 'radio',
      label: 'How hard should the agent push on this draft?',
      help: 'A brand-new idea usually only needs a light pass; a draft you are about to build real work on top of deserves the adversarial pass. This tunes effort, not honesty — a genuine contradiction gets flagged at any intensity.',
      required: true,
      affectsPrompt: 'Sets how much benefit of the doubt the agent extends to ambiguous passages, and how hard it is instructed to hunt for feasibility and hidden-assumption problems in the Exact task layer.',
      options: CHALLENGE_INTENSITY_OPTIONS,
    },
    {
      id: 'focusAreas',
      type: 'checkbox',
      label: 'Which of these already worry you about the draft, if any?',
      help: 'The agent applies all six lenses regardless of what you pick here — this only tells it where to spend extra scrutiny first. Leave everything unchecked if nothing stands out to you yet.',
      required: false,
      allowDelegate: true,
      affectsPrompt: 'Named areas are surfaced as priority emphasis in the Exact task layer. Choosing the delegate option instead asks the agent to identify, from reading the actual draft, which lenses look riskiest for this specific Capstone rather than you guessing blind.',
      options: FOCUS_AREA_OPTIONS,
    },
    {
      id: 'specificConcerns',
      type: 'textarea',
      label: 'Do you already suspect something specific is wrong with the draft?',
      help: 'If you have a nagging feeling — even one you cannot fully justify — say it here. The agent will investigate it directly instead of you needing to already know you\'re right.',
      required: false,
      placeholder: 'e.g. I think the milestone list assumes a database migration nobody has actually agreed to yet.',
      affectsPrompt: 'Quoted verbatim into the Human intent layer so the agent investigates this specific suspicion first and explicitly confirms or refutes it in the critique, rather than only running a generic pass.',
    },
  ],
  freeTextLabel: 'What else should the agent understand before challenging this draft — anything about how it was written, or context the questions above didn\'t capture?',
  completionGate: [
    { id: 'agentReadDraft', label: 'The agent\'s critique came from actually reading the current draft Capstone in the project, not from my summary of it.', kind: 'confirm', required: true },
    { id: 'allLensesCovered', label: 'The agent addressed all six challenge lenses in writing, including an explicit "none found" for any lens with no issue.', kind: 'confirm', required: true },
    { id: 'findingsResolved', label: 'Every contradiction, hidden assumption, or missing constraint the agent found is now either fixed in a revised Capstone or a decision I\'ve explicitly made and recorded myself.', kind: 'confirm', required: true },
    { id: 'iAmRatifying', label: 'I have personally reviewed the (possibly revised) Capstone end-to-end myself — this is my own act of ratification, not something I\'m inferring from the agent\'s confidence.', kind: 'confirm', required: true },
    { id: 'artifactPath', label: 'Path to the ratified Capstone artifact in your project (optional)', kind: 'text' },
  ],
  buildLayers(answers, freeText, ctx) {
    const intensityLabel = optionLabel(CHALLENGE_INTENSITY_OPTIONS, answers.challengeIntensity);
    const { delegateFocus, namedFocusLabels } = focusAreaParts(answers);
    const pathHint = capstonePathHint(ctx);

    const roleAndAuthority = [
      `You are acting as a fresh, skeptical reviewer of the draft Capstone for ${ctx.projectName} — the document meant to define what "done" actually means for this project.`,
      'You hold review authority only. You may challenge the draft, ask questions, and propose exact replacement language for anything you flag as broken. You do not hold ratification authority: only the human, acting as this project\'s Architect/Owner, can ratify a Capstone or any revision of it. A confident, well-written critique from you is not itself an approval of anything.',
    ].join('\n');

    const stageObjective = [
      'Stress-test the current draft Capstone against six lenses — contradictions, hidden assumptions, premature architecture decisions, missing constraints, feasibility, and scope — and produce a written critique.',
      'Depending on what you find, either produce a revised Capstone that resolves everything you can resolve yourself, or a specific, answerable list of open questions for anything that requires the human\'s own judgment. This stage never ends with you ratifying anything.',
    ].join('\n');

    const humanIntent = [
      quoteHumanInput('Requested challenge intensity', intensityLabel),
      namedFocusLabels.length ? quoteHumanInput('Areas the human already flagged as worrying', namedFocusLabels.join('; ')) : '',
      delegateFocus ? 'The human was not sure which areas to prioritize and asked you to work that out yourself from the actual draft (see Exact task below) rather than pre-selecting for you.' : '',
      quoteHumanInput('A specific concern the human already suspects', answers.specificConcerns),
      quoteHumanInput('Anything else the human wants understood', freeText),
    ].filter(Boolean).join('\n\n');

    const operatingMode = ctx.mode === 'same'
      ? [
        'Continue in the same agent conversation that completed the previous step.',
        'That continuity does not exempt you from checking reality: re-read the current draft Capstone as it exists on disk right now, rather than relying on what an earlier turn in this conversation said about it. Actual current state always overrides an earlier expected-state narrative, including your own.',
      ].join('\n')
      : [
        'Launch the agent from the root of your project and make sure it can read the project files. Give it the prompt below. Do not copy your project documents into this website.',
        'You have no memory of how this draft was produced. Treat every claim about what was "already decided" or "already agreed" as something to verify against an actual artifact in the project, not as settled fact.',
      ].join('\n');

    const investigation = ctx.mode === 'same'
      ? [
        'Before writing anything, open and read the complete current draft Capstone yourself, in full. Do not proceed from a summary of it, including one from earlier in this conversation.',
        pathHint,
        'Check whether anything in the project has changed since the draft was written — code, dependencies, other decisions — in a way that would make part of it stale, even though you were involved in producing it.',
        'Check whether any other document in the project also claims to define scope, milestones, or an acceptance bar, and flag a conflict if one exists.',
      ].join('\n')
      : [
        'Before writing anything, open and read the complete current draft Capstone yourself, in full. You have no prior context on this project, so nothing about it may be assumed.',
        pathHint,
        'Independently inventory what the project actually contains right now — its real structure, dependencies, and any other planning notes or documents that describe intent, outcome, or constraints — and compare that against every claim the draft Capstone makes about the project. Note any mismatch explicitly in your critique.',
        'Check whether any other document in the project also claims to define scope, milestones, or an acceptance bar, and flag a conflict if one exists.',
        'Do not trust commit messages, code comments, or file names as proof that something was "already agreed" — treat every such claim as unverified until you find the actual artifact it should trace to, or report it as unverifiable.',
      ].join('\n');

    const precedence = [
      'The actual current text of the draft Capstone file in the project is what you are reviewing — not any paraphrase of it, and not what you or anyone else previously said it contained.',
      'The human\'s answers above (challenge intensity, flagged focus areas, specific concern) shape where you spend effort; they do not themselves make anything in the draft correct or incorrect.',
      'No document you produce in this stage — critique or revision — is authoritative on its own. It becomes authoritative only if and when the human explicitly ratifies it, outside of this conversation.',
    ].join('\n');

    const task = [
      'Read the complete draft Capstone, then evaluate it against all six of the following lenses. For each lens, write an explicit finding — including "None found" if genuinely nothing surfaced, rather than skipping it:',
      SIX_LENSES,
      CHALLENGE_INTENSITY_INSTRUCTION[answers.challengeIntensity] || CHALLENGE_INTENSITY_INSTRUCTION.standard,
      focusAreaGuidance(delegateFocus, namedFocusLabels),
      FALSIFIABILITY_CHECK,
      'For anything you can fix yourself without a judgment call only the human can make, propose exact replacement language as part of a revised Capstone. For anything that genuinely requires the human\'s own values, priorities, or risk tolerance, do not guess — list it as a specific open question instead.',
    ].join('\n');

    const constraints = [
      'Do not silently rewrite the Capstone. If you produce a revision, show exactly what changed and why, mapped back to a specific finding.',
      'Do not treat this stage as the moment the Capstone becomes final. Ratification happens only when the human says so, outside of this conversation — never as a side effect of you finishing a critique or a revision.',
      'Do not introduce new scope, features, or ambitions while critiquing. Your job is to test what is already there and fix what is broken, not to expand the project.',
      'Do not weaken the acceptance bar to make it easier to pass a future challenge. If something looks unfeasible, say so and propose a genuinely smaller or later-phased version, rather than vaguer wording that would let anything count as success.',
    ].join('\n');

    const deliverables = [
      'A written critique organized under the six lenses above, with an explicit finding (or "none found") for each one.',
      'Exactly one of the following, depending on what you found: a complete revised Capstone with every fixable issue resolved and each change traced to a specific finding, OR a numbered list of open questions naming exactly what decision is needed, why it requires the human\'s own judgment, and what you would need to know to proceed.',
      'A plain list of every assumption you made while investigating, and every place you could not establish a single unambiguous source of truth — for example conflicting documents, or no draft Capstone found at all.',
    ].join('\n');

    const qualityGates = [
      'Every finding you report must point to an exact passage or section of the draft Capstone — a quote or a precise location — not a vague summary like "the scope feels off."',
      'If you produce a revised Capstone, re-check the revised text against all six lenses again before returning it — a fix in one place can quietly introduce a new contradiction elsewhere.',
      'If you list open questions instead of a revision, each question must be specific enough that the human could answer it in one sentence — not a restatement of "is this right?"',
      'Report your single largest remaining concern first, even if you also report smaller ones — do not bury the most important finding in the middle of a long list.',
    ].join('\n');

    const prohibitedAssumptions = [
      'Do not assume anything in the draft is correct merely because it is written confidently or in detail.',
      'Do not assume the human\'s silence on a focus area means that area is fine — it still gets a real look under the standard six-lens pass.',
      'Do not assume a claim of prior agreement ("we already decided this") is true without finding the artifact it should trace to.',
      'Do not assume your own revised Capstone has been adopted just because you produced it — it is a proposal until the human says otherwise.',
    ].join('\n');

    const stopConditions = [
      'Stop and return specific open questions instead of guessing if you find a contradiction that cannot be resolved without a judgment call only the human can make.',
      'Stop and return specific open questions if you find a missing constraint whose actual value would change the whole feasibility picture — for example a real deadline or budget nobody has stated anywhere.',
      'Stop and tell the human directly, rather than picking one, if you cannot find a single unambiguous draft Capstone to review — either none exists yet, or more than one conflicting candidate does.',
    ].join('\n');

    const approvalBoundary = [
      'Ratification of the Capstone is the human\'s own affirmative act, made outside of this conversation. Nothing you do here — a thorough critique, a clean revision, or continuing to investigate at the human\'s request — ratifies anything by itself.',
      'You may propose exact replacement language for anything you flag as broken, but you may never treat your own proposal as adopted, and you may never infer ratification from the human\'s silence, from enthusiasm about your critique, or from permission to keep looking. If the human has not explicitly said the Capstone is ratified, treat it as still a draft.',
    ].join('\n');

    const terminalReturn = [
      'End with one written report containing: your critique under all six lenses; either the complete revised Capstone or your numbered open questions; and the plain list of assumptions and unresolved source-of-truth conflicts described above.',
      '"Done" for this stage means every lens has an explicit finding, every finding is traced to an exact passage, and either a full revision or a specific open-question list exists — not that the draft merely "looks fine" to you.',
      `Finish with this exact line, then stop and take no further action: "${RATIFICATION_LINE}" Do not begin implementation, do not start work belonging to a later stage, and do not describe the Capstone as final, approved, or locked in under any circumstance.`,
    ].join('\n');

    return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
  },
  recoveryPrompts: [
    {
      id: 'repair-failed-capstone',
      label: 'Repair a Capstone that failed its own challenge',
      description: 'Use this when a challenge pass already surfaced real problems in the Capstone and you want the agent to produce a fully corrected version in one pass, instead of only listing findings.',
      buildLayers(answers, freeText, ctx) {
        const intensityLabel = optionLabel(CHALLENGE_INTENSITY_OPTIONS, answers.challengeIntensity);
        const { delegateFocus, namedFocusLabels } = focusAreaParts(answers);
        const pathHint = capstonePathHint(ctx);

        const roleAndAuthority = [
          `You are acting as a repair reviewer for the draft Capstone for ${ctx.projectName}, which already failed a six-lens challenge pass — something in it is known to be broken.`,
          'You hold repair authority only, not ratification authority. You may rewrite the Capstone to resolve known and newly-found problems, but only the human, acting as this project\'s Architect/Owner, can ratify the result. Producing a clean repair is not itself an approval.',
        ].join('\n');

        const stageObjective = 'Produce a fully repaired Capstone that resolves every known problem, then re-run the same six-lens challenge against your own repaired text before returning it — do not extend to your own repair the trust you would refuse a stranger\'s draft.';

        const humanIntent = [
          quoteHumanInput('Requested challenge intensity for the re-check', intensityLabel),
          namedFocusLabels.length ? quoteHumanInput('Areas the human already flagged as worrying', namedFocusLabels.join('; ')) : '',
          delegateFocus ? 'The human was not sure which areas to prioritize and asked you to work that out yourself from the actual draft rather than pre-selecting for you.' : '',
          quoteHumanInput('A specific concern the human already suspects', answers.specificConcerns),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = ctx.mode === 'same'
          ? [
            'Continue in the same agent conversation that completed the previous step.',
            'If this conversation already produced a challenge critique of the draft Capstone, you may use it as a starting point — but re-read the current file on disk before repairing anything; a human may have hand-edited it since, and actual current state always overrides an earlier turn\'s account of it.',
          ].join('\n')
          : [
            'Launch the agent from the root of your project and make sure it can read the project files. Give it the prompt below. Do not copy your project documents into this website.',
            'You have no memory of any prior challenge pass. Do not assume a specific problem exists just because you were asked to repair one — verify everything from scratch.',
          ].join('\n');

        const investigation = ctx.mode === 'same'
          ? [
            'Re-read the current draft Capstone file in full, and re-read this conversation\'s prior critique findings if they exist here. Confirm each prior finding still applies to the file as it currently exists, since the file may have changed since the critique was written.',
            pathHint,
            'If no prior critique is actually present in this conversation, run the full six-lens challenge from scratch before attempting any repair.',
          ].join('\n')
          : [
            'You have no prior challenge pass to work from. Before repairing anything, read the complete current draft Capstone yourself and run the full six-lens challenge from scratch. If your own fresh pass finds nothing wrong, say so plainly rather than inventing a repair to justify the exercise.',
            pathHint,
            'Independently inventory the real project — its structure, dependencies, and any other documents describing intent, outcome, or constraints — and compare that against every claim the draft makes.',
          ].join('\n');

        const precedence = [
          'The actual current text of the draft Capstone file is what you are repairing — not a memory of what it said when it first failed its challenge.',
          'A prior critique, if one exists in this conversation, is a useful lead, not ground truth — re-verify each of its findings against the current file before acting on it.',
          'No repaired text you produce is authoritative on its own. It becomes authoritative only if and when the human explicitly ratifies it, outside of this conversation.',
        ].join('\n');

        const task = [
          'For every finding that still holds after your investigation, write exact replacement language into a fully repaired Capstone — do not leave any known finding partially addressed.',
          SIX_LENSES,
          CHALLENGE_INTENSITY_INSTRUCTION[answers.challengeIntensity] || CHALLENGE_INTENSITY_INSTRUCTION.standard,
          focusAreaGuidance(delegateFocus, namedFocusLabels),
          FALSIFIABILITY_CHECK,
          'After producing the repair, run the same six-lens challenge again against your new text, in full, before returning anything. Loop this critique-and-repair cycle against your own output — not a fixed number of times, but until a fresh pass genuinely finds nothing new, or until you hit something that requires the human\'s own judgment, at which point stop looping and list it as an open question instead of forcing a fix.',
        ].join('\n');

        const constraints = [
          'Do not soften a finding just because repairing it honestly is harder than repairing it vaguely.',
          'Do not introduce new scope, features, or ambitions while repairing. Your job is to fix what is broken, not to expand the project.',
          'Do not change the project\'s actual scope or risk profile to make a finding easier to resolve — if a real fix requires that kind of change, stop and list it as an open question instead of making it quietly.',
        ].join('\n');

        const deliverables = [
          'The complete repaired Capstone text, with every previously known problem resolved and each change traced to a specific finding.',
          'A short confirmation that your second, self-directed six-lens pass over the repaired text found nothing new, or a plain statement of what it found if it did not come back clean.',
          'A numbered list of any remaining open questions for anything that could not be resolved without the human\'s own judgment.',
        ].join('\n');

        const qualityGates = [
          'Every change must trace to a specific finding — no unexplained edits to the Capstone.',
          'The self-directed re-challenge pass must be real: apply the same standard you would apply to someone else\'s draft, not a lighter pass because you wrote it.',
          'If the re-challenge pass finds a new issue, repair it and check again before returning — do not report a known-incomplete repair as finished.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume your first repair attempt is correct without re-challenging it.',
          'Do not assume a finding is resolved just because the wording around it changed — the underlying contradiction, assumption, or gap must actually be gone.',
          'Do not assume the human has already agreed to a repair strategy you are choosing on your own for a judgment-level tradeoff.',
        ].join('\n');

        const stopConditions = [
          'Stop the repair-and-recheck loop and return an open question if you cannot find a fix that does not require a judgment call only the human can make.',
          'Stop if repairing one finding would require silently changing the project\'s actual scope or risk profile.',
          'Stop and tell the human directly if you cannot find a single unambiguous draft Capstone to repair.',
        ].join('\n');

        const approvalBoundary = [
          'A repaired Capstone is still just a proposal. Producing it — even after your own re-challenge found nothing new — does not ratify it.',
          'Only the human, acting as this project\'s Architect/Owner, ratifies the repaired Capstone, explicitly, outside of this conversation. Never infer ratification from your own confidence in the repair.',
        ].join('\n');

        const terminalReturn = [
          'End with one written report containing: the complete repaired Capstone text; confirmation of what your self-directed re-challenge pass found (including "nothing new" if that is genuinely the result); and any remaining open questions.',
          '"Done" for this stage means every previously known finding is resolved and traced, the repaired text has itself survived a fresh six-lens pass, and any remaining judgment calls are listed as specific open questions — not that the repair merely reads better than the original.',
          `Finish with this exact line, then stop and take no further action: "${RATIFICATION_LINE}" Do not describe the repaired Capstone as final, approved, or locked in under any circumstance.`,
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
    {
      id: 'return-for-missing-decision',
      label: 'Return to the human for a missing decision the challenge exposed',
      description: 'Use this when the challenge surfaced a real judgment call only the human can make, and continuing to iterate on your own would just be guessing.',
      buildLayers(answers, freeText, ctx) {
        const intensityLabel = optionLabel(CHALLENGE_INTENSITY_OPTIONS, answers.challengeIntensity);
        const { delegateFocus, namedFocusLabels } = focusAreaParts(answers);
        const pathHint = capstonePathHint(ctx);

        const roleAndAuthority = [
          `You are acting as a reviewer of the draft Capstone for ${ctx.projectName}. A challenge pass already surfaced at least one thing that genuinely requires the human's own judgment.`,
          'Your authority here is narrow and specific: write one clear, answerable decision request. You do not have the authority to guess the answer on the human\'s behalf and proceed, and you do not have ratification authority over anything.',
        ].join('\n');

        const stageObjective = 'Stop iterating on the Capstone yourself and instead write one tightly scoped decision request the human can answer quickly — a values call, a priority tradeoff, or a fact only the human knows, not something an agent should resolve alone.';

        const humanIntent = [
          quoteHumanInput('Requested challenge intensity', intensityLabel),
          namedFocusLabels.length ? quoteHumanInput('Areas the human already flagged as worrying', namedFocusLabels.join('; ')) : '',
          delegateFocus ? 'The human was not sure which areas to prioritize and asked you to work that out yourself from the actual draft rather than pre-selecting for you.' : '',
          quoteHumanInput('A specific concern the human already suspects', answers.specificConcerns),
          quoteHumanInput('Anything else the human wants understood', freeText),
        ].filter(Boolean).join('\n\n');

        const operatingMode = ctx.mode === 'same'
          ? [
            'Continue in the same agent conversation that completed the previous step.',
            'Do not rely on this conversation\'s earlier account of why the item is undecidable — re-check the current draft Capstone and the real project state one more time before concluding it truly requires the human\'s judgment rather than further reading.',
          ].join('\n')
          : [
            'Launch the agent from the root of your project and make sure it can read the project files. Give it the prompt below. Do not copy your project documents into this website.',
            'You have no memory of the earlier challenge pass. Independently verify that this really is a judgment call and not something a fuller read of the project would answer, before writing the decision request.',
          ].join('\n');

        const investigation = [
          'Before writing the decision request, confirm the open item genuinely cannot be resolved by reading further: re-check the actual current draft Capstone and the real project state one more time, in case the answer is discoverable rather than a judgment call.',
          pathHint,
          ctx.mode === 'fresh'
            ? 'Independently inventory the real project — its structure, dependencies, and any other documents describing intent, outcome, or constraints — before concluding no answer exists there.'
            : 'Even though this may be a continuation of the challenge conversation, re-verify against the current file rather than trusting an earlier turn\'s conclusion that this item was undecidable.',
        ].join('\n');

        const precedence = [
          'The actual current draft Capstone and the real project state are the first things to check — a decision request is only appropriate once you\'ve confirmed the project itself does not already answer the question.',
          'Nothing about how you frame the options below decides anything. The human\'s eventual answer is the only thing that resolves this — your job is to make that answer easy and well-informed, not to steer it.',
        ].join('\n');

        const task = [
          'Write a decision request for the human containing:',
          '- The exact question, framed so it can be answered in one sentence.',
          '- Why it requires the human\'s own judgment and cannot be inferred from the project or from precedent.',
          '- The smallest set of concrete, real options you can identify, each with its actual tradeoffs, stated neutrally rather than steering toward one.',
          '- Exactly what changes in the Capstone once the human answers, for each possible option.',
          'If you have a genuine recommendation, you may include it, but mark it clearly as your own opinion, kept separate from the neutral option list — never phrase a recommendation so it reads as already decided.',
        ].join('\n');

        const constraints = [
          'Do not keep revising the Capstone around the missing decision — a vague workaround just hides the same open question one layer deeper.',
          'Do not manufacture urgency. State the tradeoffs plainly and let the human decide at their own pace.',
          'Do not bundle more than one real decision into a single request — if you find the "open" item is actually several entangled questions, separate them into distinct requests.',
        ].join('\n');

        const deliverables = 'One decision request document: the question, why it is the human\'s to answer, the option set with real tradeoffs, and what changes in the Capstone for each possible answer. Nothing else about the Capstone changes until the human responds.';

        const qualityGates = [
          'The question must be answerable in one sentence by someone who has never read your investigation.',
          'Each option must name a real, specific tradeoff — not a vague pro or con.',
          'If you can only construct one real option, say so plainly and explain why no genuine alternative exists, rather than padding the list with a straw option no reasonable person would choose.',
        ].join('\n');

        const prohibitedAssumptions = [
          'Do not assume you know which option the human will pick.',
          'Do not assume the missing decision is trivial just because you can imagine a plausible default for it.',
          'Do not assume silence from an earlier stage\'s answers already settles this question — if it did, this would not be an open item.',
        ].join('\n');

        const stopConditions = 'If, while writing the decision request, you discover the "open" item is not one question but several entangled ones, stop and separate them into distinct requests rather than bundling them into one.';

        const approvalBoundary = [
          'Writing this decision request is not itself a decision, and the human answering it in conversation is not itself ratification of any resulting Capstone change — that still requires the human\'s own explicit ratification step, separately, once a revised Capstone exists.',
          'Do not treat your own recommendation, if you offered one, as adopted merely because the human engaged with your request.',
        ].join('\n');

        const terminalReturn = [
          'End with the decision request only — the question, why it is the human\'s to answer, the option set, and what changes for each answer.',
          'Do not follow it with a proposed Capstone revision in the same turn. Wait for the human\'s answer first; a later pass can incorporate it once given.',
          `Finish with this exact line, then stop and take no further action: "${RATIFICATION_LINE}"`,
        ].join('\n');

        return { roleAndAuthority, stageObjective, humanIntent, operatingMode, investigation, precedence, task, constraints, deliverables, qualityGates, prohibitedAssumptions, stopConditions, approvalBoundary, terminalReturn };
      },
    },
  ],
  advanced: {
    purpose: 'This stage exists because a first draft of a Capstone is usually written by whoever was still exploring the idea — optimized for feeling right, not for surviving contact with a critical reader. A structured challenge pass, done before ratification, catches problems while they are still cheap to fix: a wrong acceptance bar found here costs a rewrite of one document; the same wrong bar found several checkpoints deep costs a rewrite of everything built against it.',
    problemPrevented: 'Without an explicit challenge stage, most drafts get ratified by default — the human reads it once, it sounds reasonable, and it quietly becomes "the plan" without anyone actively trying to break it. The failure this stage prevents is not a badly written Capstone; it is a plausible-sounding one that contains a contradiction, an unstated assumption, or an infeasible claim nobody stress-tested because nobody was assigned to.',
    judgmentVsInvestigation: 'How hard to push (challenge intensity) and where to look first (focus areas) is the human\'s judgment — only the human knows how much they already trust this draft and where their gut tells them to look. Whether the draft actually contains a contradiction, an infeasible claim, or a missing constraint is a fact about the document and the real project, which only an agent that has actually read the current file and investigated real project state can establish. The human should never be asked to pre-diagnose the draft\'s problems for the agent to merely confirm.',
    promptAnatomy: 'The six-lens list lives in the Exact task layer, stated fully and generically, so the prompt is self-contained even though the human never sees or edits the lens definitions directly. The Role and authority layer and the Human approval boundary layer both independently forbid the agent from ratifying its own output, because a single mention is easy for a long agent turn to lose track of — repeating the constraint at two separate points in the prompt is deliberate redundancy, not an accident.',
    authorityBoundary: 'The agent may propose — including exact replacement text for the Capstone itself — but it may never ratify. Ratification belongs solely to the human, acting as this project\'s Architect/Owner, and it happens outside the agent\'s conversation entirely, in this tool\'s completion gate. An agent that declares "this Capstone is now ready" has made an observation, not a decision; only the human\'s own explicit act converts a draft into something the rest of the project can be built against.',
    inputsAndSources: 'The single source of truth for this stage is the actual current draft Capstone file in the project — never a description of it, and never what an earlier conversation turn said it contained. If a location was recorded in the prior stage\'s completion gate, that path is a hint the agent should verify, not trust outright, since a human can rename, move, or hand-edit the file between stages.',
    outputsAndEvidence: 'Evidence of a real challenge pass is a critique that names an exact passage for every finding, not a paragraph of general impressions. Evidence of a real repair is a revised Capstone whose changes trace back to specific findings, plus a second self-directed challenge pass over the revision itself. Evidence of a genuine "nothing to fix" outcome is an explicit "none found" for each of the six lenses, not silence on the ones that were inconvenient to check.',
    failureModes: [
      'The agent produces a critique that reads as thorough but never quotes or points to a specific passage — every finding is generic enough to apply to any Capstone, meaning nothing was actually checked against this one.',
      'The agent revises the Capstone and, in the same turn, describes it as "approved" or "finalized" — quietly performing the ratification it is not authorized to perform.',
      'The human accepts the agent\'s revision without reading it themselves because the critique sounded rigorous — outsourcing the one step, ratification, that cannot be outsourced.',
      'A "same agent" continuation trusts its own earlier draft without re-reading the current file, and misses an edit the human made by hand in between.',
      'The six lenses get applied unevenly — heavy scrutiny on the one lens the human happened to flag, and a token pass on the other five, so a real problem in an unflagged area slips through.',
    ],
    weakResultSigns: [
      'The critique\'s findings could be pasted onto a completely different project\'s Capstone without changing a word — a sign nothing was actually read.',
      'A "revised Capstone" changed the wording but not the substance of a flagged issue — the contradiction is gone from the sentence but still true of the plan.',
      'An acceptance bar that still isn\'t falsifiable after the "fix" — one vague phrase replaced with an equally vague one.',
      'No open questions at all on a draft the human rated "adversarial-thorough" — either the draft was genuinely flawless, which is rare, or the pass wasn\'t actually adversarial.',
    ],
    customization: 'If your project\'s Capstone is genuinely small and low-stakes — a personal script, a weekend prototype — a light gut-check is a legitimate, honest choice, not a shortcut to feel guilty about. Forcing an adversarial pass onto trivial work just wastes reading time without buying real safety. Scale the intensity to the actual cost of being wrong, the same cost you already named back in Orientation\'s risk-tolerance question.',
    whenToStop: 'Stop before accepting a revision if you notice yourself skimming rather than reading — a Capstone challenge exists specifically to counteract the pull toward treating a plausible-sounding document as good enough. If the agent\'s critique feels suspiciously easy to agree with, that is itself worth a second, slower read rather than a signal to move on quickly.',
    auditWithoutPasting: 'You don\'t need to paste the Capstone or the critique into this website to sanity-check the process: re-open the actual draft file yourself and pick two or three claims from it at random. For each, ask whether it is actually checkable, and whether the agent\'s critique said anything about it. If a claim you picked at random wasn\'t addressed by the critique at all, the pass was less complete than it looked.',
    weakVsStrongExample: {
      weak: '"The Capstone looks solid overall, though the timeline might be a bit optimistic." — no cited passage, no named lens, and a hedge instead of a finding.',
      strong: '"Missing constraints: milestone 2 assumes production database write access (see the rollout section), but no such access is listed anywhere as a constraint or dependency — if it does not exist yet, milestone 2\'s date is not achievable as written."',
    },
  },
};
