# Zero-Trust Hierarchy

No success claim promotes itself. A distributed verification system for agent work.

<section class="sixty-second" aria-labelledby="sixty-second-title">
  <div class="sixty-second__grid">
    <div class="sixty-second__item">
      <h3>What problem does it solve?</h3>
      <p>Agent workflows often let the same context build, review, repair, and declare success—carrying the same blind spots through every pass. Here, <strong>zero-trust</strong> is a method metaphor, not a cybersecurity threat model: an unsupported success claim should never gain authority merely because an agent says <code>PASS</code>.</p>
    </div>
    <div class="sixty-second__item">
      <h3>What changes?</h3>
      <p>Authority flows down; artifact-bound evidence comes back up. The Owner ratifies purpose, the Orchestrator authorizes one bounded unit, the Lead directs execution, and fresh Critic contexts judge the exact artifact against the ratified bar. Their separation is procedural, not security isolation; technical <code>PASS</code> is a return, not closure.</p>
    </div>
    <div class="sixty-second__item">
      <h3>Who is it for?</h3>
      <p>People supervising consequential agent work—software, research, policy, or publication—who need explicit authority boundaries, reproducible evidence, current verdicts, and human control of <strong>LAND</strong>, <strong>DISCARD</strong>, and continuation.</p>
    </div>
  </div>
  <div class="sixty-second__cta">
    <div class="sixty-second__cta-copy">
      <strong>Ready to put the method to work?</strong>
      <span>The local-first Builder turns it into thirteen staged prompts. No account, API key, or project-data upload required.</span>
    </div>
    <a class="sixty-second__button" href="builder/index.html">Open the Builder <span aria-hidden="true">→</span></a>
  </div>
</section>

## 1. Watch a success claim climb

Here, **zero-trust** is a method metaphor for refusing unsupported success claims, not a cybersecurity threat model.

Picture a generic autonomous run. An agent reports an artifact complete, then inspects it from the same context and confirms its own grade. A repair fixes the visible problem but regresses behavior that was already correct. The next review concentrates on the repaired case, reuses the same reasoning, and misses the regression. Later rounds inherit that history, narrowing around the original explanation instead of generating a discriminating test.

The run may stall: no meaningful gap closes, the budget expires, or the conversation goes quiet. Silence proves nothing about correctness, state, or completion. No one had to be deceptive. Construction, criticism, repair, and success remained inside one self-reinforcing context; no external authority tested the claim before it acquired consequences.

Zero-Trust Hierarchy breaks that chain. It assigns each decision to a distinct authority, requires a purpose-built artifact at every seam, and limits each receiver to the claims it is qualified to verify. The question is not “Do we trust this agent?” It is “What must be true before this claim is allowed to change anything above it?”

## 2. Authority goes down; evidence comes back up

The hierarchy is asymmetric. The Architect / Owner ratifies purpose and governing documents. The Orchestrator authorizes one bounded unit. The Engineering Lead chooses how to execute it. A replaceable inner method returns reviewed work. Evidence then travels back through orchestration to human judgment.

![Zero-Trust Hierarchy authority and evidence flow](assets/zero-trust-hierarchy.svg)

[Matt Shumer’s Gauntlet Loop](https://somethingbig.ai/gauntlet-loop) supplies the replaceable inner execution pattern: give a capable lead a goal and concrete bar; let that lead decompose the work; separate construction from a fresh critical pass; show the reviewer the artifact rather than the Builder’s explanation; return the largest meaningful gap; and continue without an arbitrary round count. Shumer also describes blind comparison when circumstances make it useful, not as a universal property of every review. This article does not restate that loop. Its subject is the authority system around it: who may launch work, how written criteria become binding, which evidence crosses each boundary, how verdicts remain current, who may close or land a result, and why a human retains purpose and disposition authority.

Each receiver tests a different claim. The Lead verifies authorization and actual state. Technical Critics verify artifacts against the real bar. The Orchestrator verifies the returned evidence envelope without becoming another technical reviewer. The Owner decides whether a technically supported result still serves the project. Procedural controls are identified honestly wherever independent verification would violate another role boundary.

## 3. A bounded proof from reality

This method has been exercised on a real, complex project. During the broader exercise, a live external service was reachable, and the artifact had to preserve evidence under adverse conditions. Expected repository and environment state did not fully match reality; the mismatch was surfaced rather than normalized away. Bar-driven execution and the Builder’s own critical pass exposed genuine failure paths in error handling and evidence recording. Fresh review contexts then created independent fixtures and exercised adverse cases against the committed artifact. Exact-revision review, reviewed-path declarations, computed staleness, distinct artifact and evidence revisions, evidence preservation, receipt verification, and human disposition were all exercised.

The method was also turned on its own operating contract. Separate independent reviews found ambiguous ownership, incomplete handoffs, and closure rules that could not support their intended claims. Those contract findings were distinct from the product failures discovered during construction. The contract was revised and the run repeated; remaining gaps were recorded instead of folded into a success story.

The proof is bounded. This was not a production deployment. The complete live-payload success case was not established during the run; a positive case relied on controlled data. Fresh contexts and ordinary worktrees provided procedural separation, not operating-system or cryptographic isolation. Some terminal outcomes and a formal review-failure-to-repair path remain unexercised. The supported claim is narrower and more useful: the hierarchy met real artifacts, mutable state, independent adverse testing, and defects in its own rules—and kept the limits of its evidence visible.

## 4. Tier 0: purpose and ratification

Tier 0 combines the Architect / Owner with the documents that person has ratified. The Owner decides what the project is trying to achieve, which outcomes matter, which risks and tradeoffs are acceptable, whether priorities still point in the intended direction, and when a plan or governing rule must change. Agents may optimize execution. They do not own purpose.

Governing documents turn that judgment into durable constraints. They identify the controlling plan, define role authority, state the acceptance bar, and record eligible work. Their authority comes from ratification, not from being newer, longer, or easier to find. Durable state must distinguish the current anchor from drafts, references, and superseded versions.

The rules must also be protected from the actors they constrain. No Builder, Critic, Lead, or Orchestrator may rewrite its own authority, reduce its own bar, or grant itself more scope. A necessary governance change stops the affected work and returns to the Owner for a narrow decision. The documents are not another autonomous tier; they are the durable expression of human authority.

An agent may identify a conflict and propose exact replacement language; it cannot ratify its proposal by acting on it. Until the Owner accepts the change and durable state points to the replacement, existing authority controls. Draft quality is not authority.

## 5. Turn prose into an acceptance bar

A useful plan is not automatically a bar. It can be cited vaguely, quoted selectively, or displaced by an unratified file that merely looks newer. A real bar has an unbroken authority chain.

A valid brief names one repository, one bounded unit, and the exact ratified plan. It carries the complete controlling checklist rather than a convenience summary. A review assignment identifies that source and includes the relevant language. The Critic confirms the criterion at the candidate revision, then evaluates the actual artifact through observable outcomes and declared tolerances.

A goal and a bar differ. “Publish a useful guide” gives direction but not independent acceptance conditions. The bar makes usefulness, completeness, accessibility, and reproducibility inspectable without dictating implementation. If an outcome cannot fail under the stated evidence, it is encouragement, not acceptance.

This makes the bar **authorized**, **stable**, and **falsifiable**. The Owner ratified it; the Orchestrator named it; the exact candidate is judged against the same text; and direct evidence could disprove success. Line numbers may aid navigation, but the controlling language and complete checklist carry authority.

The bar can fit any domain: primary sources and reproducible derivation for research; semantic structure and accessibility for publication; bounded assumptions and tolerances for operations. Another capable context must be able to inspect the same object, apply the same criterion, and disagree.

If the bar is missing from the authorization, return `BRIEF_INVALID` before work. If a valid brief later exposes a contradiction or an untestable criterion, return `BLOCKED`. Neither case permits a private reinterpretation merely to obtain PASS.

## 6. Tier 1: orchestration without technical re-review

The Orchestrator owns **WHAT, WHEN, and WHERE**, not **HOW**. It maintains durable state across tracks, chooses one eligible unit, names the repository and exact anchor, supplies the expected state and complete bar, sets a numeric active-elapsed ceiling, and issues a bounded brief. It does not prescribe architecture, decomposition, agent count, internal sequencing, or a fixed number of review rounds.

When work returns, the Orchestrator tests the envelope rather than the implementation. Was this exact unit authorized? Does the packet echo the full brief? Is every criterion mapped to evidence? Do the cited verdicts exist and still apply? Are the reviewed artifact and later evidence record correctly distinguished? Does returned topology agree with repository facts?

Those are strong checks, but they are not another technical review. The Orchestrator does not inspect source, rerun tests, reproduce metrics, read the Lead’s private workbench, or decide whether the implementation is elegant. The exhaustive evidence checks belong in the [rulebook](RULEBOOK.md); the key boundary is conceptual: verify provenance, currency, reachability, and completeness, then stop.

The Orchestrator can read a verdict without inheriting the Critic’s job: it checks that the right review exists, names the right artifact and bar, remains current, and supports the packet. It does not rejudge the technical reasoning.

A supported receipt makes a result eligible for human disposition. It does not land the work, complete lifecycle cleanup, or open the next unit.

## 7. One human, two indispensable control points

The Architect / Owner at the top and the human at the checkpoint seam are the **same person wearing two operational hats**, not unrelated authority tiers.

Before execution, the Owner controls purpose. The human chooses the ultimate aim, valuable outcomes, acceptable tradeoffs, ratified plan, priorities, and governing rules. This is not administrative prompt writing. It is the judgment that gives optimization a direction.

After a bounded return, the same human controls checkpoint direction. The Owner judges whether a technically supported result still serves the agenda and may accept or reject the direction, stop the project, pause a track, change priorities, request an amendment, choose LAND or DISCARD, decline to continue after PASS, or authorize the next unit. The Return Packet and Orchestrator receipt provide the evidentiary basis; the human does not repeat the Critics’ technical work.

**The human’s transport role is intentionally minimal. The human’s control role is indispensable.** Today the human carries a brief downward and one terminal packet upward without editorial improvisation. Automating that transport would not remove either control point: ratify direction before execution; judge direction, disposition, and continuation afterward.

Technical correctness is not strategic correctness. An artifact can meet every written criterion while pursuing an outcome the Owner no longer wants. No autonomous tier can infer changed human goals, priorities, risk tolerance, or judgment.

## 8. Tier 2: the Engineering Lead owns HOW

The Engineering Lead converts one authorization envelope into execution. Before edits or clocked work, the Lead validates that the brief names one repository, one bounded unit, one exact anchor, expected state, a complete cited bar, an observable goal, relevant constraints, a numeric ceiling, already-authorized Owner actions, executor preconditions, and a stop instruction. A missing or contradictory field returns `BRIEF_INVALID` before implementation.

For a valid run, the first observable output is the start time and verified actual state: revision, working tree, environment, inputs, tests, and relevant topology. Expected state is a hypothesis; actual state wins. A material mismatch is surfaced rather than silently repaired. The method requires the timestamp but does not prescribe a ratified acquisition mechanism; selecting and validating one remains an implementation responsibility.

The Lead then owns architecture, tools, decomposition, internal sequencing, and time allocation. It may create bounded Builder contexts, assign disjoint ownership, commission fresh Critic contexts, and route failures back to repair. These are cooperative controls, not a claim of operating-system isolation. The Lead integrates serially and remains responsible for the complete candidate.

The Lead may not weaken the bar, enlarge its ceiling, publish, land on mainline, choose the next objective, or start another unit. Its authority ends with one terminal Return Packet and a stop.

A private workbench may track decomposition, clocks, revisions, review coverage, and risk. Detail does not make it program state or evidence. Only authorized artifacts cross the boundary: committed Critic verdicts and the terminal packet.

## 9. Universal invariants and the current Git profile

The method is broader than a particular toolchain, but an adoption is only real when each invariant has a concrete mechanism. The current profile uses ordinary Git primitives:

| Universal invariant | Current Git execution profile |
|---|---|
| Bounded authorization | One brief names one repository, one unit, and one exact anchor; when candidate work exists, one accountable branch contains it |
| Exact controlling bar | The versioned plan and cited criterion are verified at the candidate commit |
| Immutable or uniquely identifiable artifact version | Full commit SHA opened in a clean detached worktree |
| Review view separated from Builder narrative | Fresh cooperative Critic context receives that worktree and bar, not the Builder’s explanation |
| Durable verdict / evidence record | Plain Markdown verdict committed after review, naming candidate SHA and reviewed paths |
| Currency or staleness rule | Candidate ancestry and path-scoped change detection determine which verdicts must rerun |
| Bounded return | One terminal Return Packet names only revisions that exist; PASS distinguishes final candidate from evidence tip |
| Durable program state | A versioned state record names exact anchors, track eligibility, and receipt results |
| Human direction and disposition | Owner decision is explicit; mainline landing is human-authored; branch/tag reachability preserves reviewed evidence |

The left column is the architecture; the right is a replaceable profile. A non-Git project may use immutable object identifiers, signed records, database snapshots, or another revision system, but it must preserve equivalent inspectability and change-sensitive currency.

For each invariant, name who creates and verifies evidence, what failure looks like, and how evidence survives cleanup. Then choose tools. In the Git profile, one Lead writes candidate history serially while branch and tag reachability preserve cited evidence. Mechanisms support the invariants; they are not the invariants.

## 10. Verdicts, staleness, and terminal revisions

A technical verdict must survive the conversation that produced it. It is a durable record tied to the exact candidate it reviewed and states the controlling criterion, inspected artifact, covered paths, procedure, observed result, tolerance, finding, and largest remaining gap. PASS, FAIL, and BLOCKED describe that artifact under that bar—not the effort invested in it.

Repairs create the staleness problem. An earlier PASS remains usable only when its reviewed candidate still lies in the final candidate’s history and later changes did not touch any path on which the verdict depended. If a covered path changed, rerun that Critic. If unrelated paths changed, retain the still-current evidence. This avoids both trusting a stale label and rerunning every review after every edit.

Terminal revision language must remain exact. On PASS, the **final candidate** is the exact revision the Integration Critic reviewed. After that completed verdict is recorded—but not the Return Packet—a distinct **evidence tip** preserves the terminal evidence chain, and the change between them may contain only authorized evidence. If product content changed, the old final verdict is stale and final review must run again.

Non-PASS returns describe only what actually exists. `BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED` may name an existing candidate or evidence revision when one was legitimately created during work; otherwise the corresponding field is `NOT_CREATED` or `NOT_APPLICABLE`. No role creates a commit, verdict, branch, tag, or other artifact merely to fill a terminal form. The form records reality; it does not manufacture provenance.

Reachability completes the claim. Before a bounded branch is reclaimed, a verified preservation reference must keep every cited revision inspectable, and live citations must follow that durable reference.

## 11. Returning is not closing

The Engineering Lead sends one upward seam artifact: the terminal Return Packet. It echoes the authorization, maps criteria to evidence, names technical verdicts and terminal revisions, reports verified topology and procedural declarations, identifies remaining risks, and then stops.

The packet is a bounded handoff. The current method does not claim it is committed or durably preserved. Its referenced Critic verdicts are committed evidence records. The Orchestrator receipt is a separate finding about the envelope. The Owner’s disposition is a later human decision. Keeping those artifacts distinct prevents any one of them from borrowing authority from the others.

“Done” therefore has five different meanings:

1. **Technical PASS:** the final artifact meets the ratified technical bar.
2. **Terminal return:** the Lead has stopped and supplied one complete packet.
3. **Supported receipt:** the Orchestrator has verified authorization, evidence currency, reachability, and completeness.
4. **Disposition:** the Owner has chosen LAND or DISCARD; only the Owner authors a mainline landing.
5. **Lifecycle closure:** evidence is preserved, live citations are repointed, and the bounded branch and worktrees are reclaimed.

LAND and DISCARD preserve different facts. LAND records where Owner-reviewed work entered mainline and separately preserves the reviewed candidate chain. DISCARD preserves that chain without implying adoption. In both cases, disposition precedes mechanical reclamation and preservation precedes deletion. Neither PASS nor landing starts the next unit.

This separation costs a moment and saves reconstruction later. You can see what was judged, which evidence supported it, what the Owner chose, and why a branch disappeared without relying on memory.

## 12. Time, terminal states, and silence

Every valid run has a numeric active-elapsed ceiling. Parallel contexts overlap rather than adding their durations together, and only declared eligible pauses stop the clock. The ceiling is a prioritization constraint, never permission to lower the bar.

The Lead returns exactly one terminal state:

- `PASS`: the complete bar is met and the evidence chain is current.
- `BLOCKED`: a valid run needs authority, information, or external change the Lead cannot supply.
- `PLATEAU`: further effort under the current approach is no longer producing meaningful progress.
- `BUDGET_EXHAUSTED`: the ceiling was consumed without weakening the bar.
- `BRIEF_INVALID`: authorization was incomplete or contradictory, detected before edits and clock start.

Every state carries evidence and an explicit stop. None amends the plan, increases the ceiling, publishes, or authorizes another unit.

Silence is not a sixth state. Under the liveness rule, the Orchestrator detects a material real-time overrun, declares and records abandonment, and reports the attempt’s known state. It does not infer a technical result or choose what happens next. The Owner decides disposition, retry, direction, and continuation. Only after that human decision may an authorized lifecycle agent preserve cited evidence and reclaim the resources the attempt owned. Abandonment is not relabeled `BUDGET_EXHAUSTED`; no evidentiary terminal return established that status.

## 13. Zero to arbitrarily many tracks

There may be no active unit, one focused track, or many heterogeneous tracks using different artifacts and inner methods. The Orchestrator’s durable map records eligibility, ownership, prerequisites, and returned state without absorbing the Leads’ technical decisions.

Parallelism is bounded and accountable, not automatically safe. Each branch and worktree has a declared owner, purpose, starting point, and proposed disposition. Builders receive disjoint ownership where possible, and each Lead serializes integration for its unit. If another session changes a path covered by a verdict, that review becomes stale; the change is attributed and selectively re-reviewed rather than silently reconciled.

An unexplained branch is inspected and presented to the Owner, never auto-deleted or allowed to block unrelated work. Cleanup reaches only resources with known ownership, evidence, and disposition.

Different tracks may produce software, research, policy, or publication artifacts. Their internal procedures can differ. What remains constant is the outer contract: one authorized unit, a ratified bar, artifact-bound evidence, a bounded return, an independent receipt gate, human disposition, and explicit continuation.

Cross-track prerequisites stay in the durable map, not a Lead’s assumptions. The Orchestrator may withhold work until dependencies are satisfied or while the Owner revises direction. Capacity does not create authorization; one slow track does not freeze unrelated eligible work.

## 14. Bootstrap the hierarchy without self-ratification

The [rulebook](RULEBOOK.md) and [boundary forms](templates/1-checkpoint-brief.md) provide the full contract. This standalone payload prevents a setup agent from treating its own draft as ratified:

```text
Establish a Zero-Trust Hierarchy for this project in two phases.

Definition: “zero-trust” is a method metaphor. No success claim promotes itself. It is not a cybersecurity threat model.

NON-NEGOTIABLE AUTHORITIES
- The human Architect / Owner owns purpose, ratification, acceptable tradeoffs, governing changes, LAND or DISCARD, mainline, publication, and continuation.
- The Orchestrator owns WHAT, WHEN, WHERE, one bounded unit, its exact ratified bar, its ceiling, durable cross-track state, and the receipt gate. It does not prescribe HOW or repeat technical review.
- The Engineering Lead owns HOW, validates the brief and actual state, chooses decomposition, coordinates independent review, integrates serially, returns one terminal packet, and stops.
- Builders construct bounded pieces. Critics judge exact artifacts against the real bar. Their fresh-context and read-only limits are cooperative unless stronger enforcement is separately demonstrated.

PHASE A — READ-ONLY INTAKE, FIT CHECK, AND DRAFTING
1. Do not edit project files, create branches or worktrees, start execution, or claim that any draft is authoritative.
2. Collect from the Owner, or infer only where evidence permits, all ten intake items. Label every inference and ask rather than inventing an Owner judgment:
   1. raw project idea;
   2. intended user or beneficiary;
   3. observable final outcome;
   4. acceptable tradeoffs;
   5. non-negotiable constraints;
   6. known risks and unknowns;
   7. possible acceptance bars or reference examples;
   8. likely milestones or checkpoints;
   9. candidate tracks and dependencies; and
   10. artifact-versioning and evidence substrate.
3. Inspect available state read-only. Separate verified facts, Owner assertions, labeled inferences, unknowns, and contradictions.
4. Return one fit result:
   - FIT — multi-step work with meaningful error cost, a versioned inspectable artifact, and an acceptance condition against which a capable reviewer can disagree;
   - FIT_WITH_REDUCED_PROFILE — those properties exist, but a Git-profile mechanism needs a documented equivalent; or
   - NOT_FIT — there is no versioned inspectable artifact or disagreeable acceptance condition, the task is trivial and reversible, or the ceremony costs more than the controlled risk.
5. If FIT or FIT_WITH_REDUCED_PROFILE, draft all nine governance artifacts in the response only:
   1. Capstone / project plan;
   2. milestone / checkpoint decomposition;
   3. management map;
   4. generic Rulebook adoption;
   5. role contracts;
   6. durable-state structure;
   7. track profiles;
   8. boundary forms; and
   9. proposed first eligible checkpoint.
   Include every unresolved Owner decision. Keep every artifact visibly DRAFT.
6. Label controls as independently verified, cooperative procedural, or human judgment. Never describe ordinary worktrees or fresh contexts as security sandboxes.
7. End the response with this exact standalone line and stop:

AWAITING_OWNER_RATIFICATION

Do not continue because the draft looks complete. Do not infer ratification from silence, prior enthusiasm, or permission to inspect.

PHASE B — ONLY AFTER EXPLICIT OWNER RATIFICATION
Proceed only when the Owner explicitly identifies and ratifies the exact project plan, governing rules, role contracts, management map, and durable-state pointers, and confirms the accepted fit result, authorized repository, and first bounded unit. If the Owner requests changes, return to Phase A and stop again at AWAITING_OWNER_RATIFICATION.

After ratification:
1. Materialize only the ratified governance and forms.
2. Have the Orchestrator issue one complete brief for the first authorized unit. An invalid brief returns BRIEF_INVALID before edits or clock start.
3. Start the Engineering Lead in a context satisfying the ratified read-scope rules. Its first observable output is start time plus verified actual state; the timestamp mechanism is an implementation choice unless separately ratified.
4. Require artifact-bound Critic verdicts, honest reviewed paths, and computed staleness. On PASS require distinct final-candidate and evidence-tip revisions with an evidence-only delta. On BLOCKED, PLATEAU, or BUDGET_EXHAUSTED name only revisions that already exist or use NOT_CREATED / NOT_APPLICABLE; never create an artifact to complete a form.
5. Return one packet, apply the bounded Orchestrator receipt gate, and stop for the Owner’s LAND or DISCARD decision.
6. Preserve evidence before reclamation. No PASS, receipt, landing, or cleanup authorizes the next unit; continuation requires a new explicit Owner decision and brief.
```

Use the full rulebook when implementing the draft. The bootstrap creates a controlled decision point; it does not substitute for ratification.

---

*Gauntlet Loop execution pattern credited to [Matt Shumer](https://somethingbig.ai/gauntlet-loop). Zero-Trust Hierarchy and its surrounding authority system by Yarden Viktor Dejorno.*
