# Zero-Trust Hierarchy rulebook

**Zero-trust is a method metaphor for refusing unsupported success claims. It is not a
cybersecurity threat model.** In this method, no role promotes its own claim across an authority
boundary. A Builder cannot turn implementation into acceptance, an Engineering Lead cannot turn a
technical result into program closure, and an Orchestrator cannot turn receipt completeness into a
human decision to continue.

This document is the complete generic operating contract for Zero-Trust Hierarchy. A project may
adopt stricter controls, but it must identify them in its ratified governing documents. Ordinary Git
worktrees and fresh agent contexts provide useful procedural separation; they are not operating-
system sandboxes, access-control boundaries, or cryptographic proof.

Normative words such as **MUST**, **MUST NOT**, **MAY**, and **SHOULD** describe the contract.
Statements marked **verified** are independently checkable from artifacts. Statements marked
**procedural** depend on role compliance and honest declaration. Statements marked **human
judgment** are deliberately not reducible to an automated gate.

## 1. Scope and terms

Zero-Trust Hierarchy separates five kinds of work:

1. human purpose and ratification;
2. orchestration of what runs, when, where, against which exact bar, and within which ceiling;
3. engineering decisions about how to satisfy that bar;
4. bounded construction and independent technical criticism; and
5. human disposition, landing, publication, and continuation.

A **checkpoint** is one bounded unit of authorized work. A **bar** is the complete, exact,
observable acceptance contract for that checkpoint. A **claim** is any assertion that work is
correct, complete, current, authorized, landed, closed, or ready to continue. An **artifact** is the
actual inspectable output. A **candidate identity** names one immutable or uniquely versioned
artifact state. A **verdict** is a durable evidence record tied to that exact state. Under the Git
reference profile, verdicts are plain Markdown committed after review. A **Return Packet** is the
sole upward handoff from the execution authority to the Orchestrator. A **receipt** is an
Orchestrator-authored entry in the existing durable program-state record saying whether that packet
satisfies the orchestration gate; it is not a new tier or a second technical verdict. A
**disposition** is the Architect / Owner's LAND or DISCARD decision.

### Universal invariants and execution profiles

The authority boundaries are universal; Git is not. Every checkpoint brief MUST name an
**execution and evidence profile** that supplies six equivalent primitives:

1. a target workspace or repository;
2. an immutable or uniquely versioned candidate identity;
3. an independently resolvable evidence identity that links to the candidate it judges;
4. a way to prove which reviewed dependencies changed between two candidate identities;
5. a declared isolation and write-ownership mechanism; and
6. a preservation and reclamation procedure.

The **Git reference profile** implements those primitives with a repository, commit SHAs, ordinary
worktrees, `reviewed_paths`, ancestry plus path diff, one Git writer, branches, tags, and worktree
reclamation. In that profile, the terminal identities are named `final_candidate_sha` and
`evidence_tip_sha`.

A non-Git profile MAY use immutable document revisions, content hashes, object versions, dataset
snapshots, publication build IDs, or another unique and independently resolvable scheme. It MUST
state the exact equivalence for identity, change detection, evidence linkage, preservation, and
cleanup. Renaming a mutable file or relying on a chat summary is not equivalent.

The forms use **candidate identity** and **evidence identity** as universal terms and show the Git
field names where useful. `NOT_CREATED — [reason]` means the artifact or identity genuinely does
not exist. `NOT_APPLICABLE — [reason]` means a check has no operands or does not belong to the
declared profile. Neither value may conceal missing evidence required for `PASS`.

The method distinguishes these events:

- technical `PASS`;
- a supported Orchestrator receipt;
- a durable program-state update;
- the Owner's disposition decision;
- an Owner-authored authoritative landing or publication, when LAND is chosen;
- evidence preservation and checkpoint-resource reclamation; and
- explicit authorization of the next checkpoint.

None implies the next.

## 2. Authority and roles

### Tier 0 — Architect / Owner and governing documents

The **Architect / Owner** is the human source of purpose. The Owner decides what the project is
trying to achieve, which outcomes matter, which tradeoffs and risks are acceptable, what is
ratified, whether direction has drifted, and when a plan, priority, checkpoint, or governing rule
must change. Agents may optimize execution; they do not own purpose.

The **governing documents** are durable control artifacts ratified by the Owner. They name the
current plan, checkpoints, role contracts, configuration, durable state, and any management map.
They do not form another autonomous agent tier.

The same human may appear again below the Orchestrator as the **human courier /
development-management function**. These are two operational hats worn by one person, not two
unrelated authority tiers:

- before execution, the Architect / Owner ratifies purpose and direction;
- after a bounded return, the human judges direction, veto, disposition, and continuation.

The human carries the brief downward unchanged and the Return Packet upward unchanged. That
transport role is intentionally minimal. The human control role is indispensable. Automating
transport would not remove either control point.

### Tier 1 — Orchestrator

The **Orchestrator** owns WHAT, WHEN, WHERE, exactly one checkpoint, its exact ratified anchor, its
numeric active-elapsed ceiling, durable cross-track state, packet receipt, and closure eligibility.
It may route zero to arbitrarily many heterogeneous tracks.

The Orchestrator MUST NOT prescribe architecture, libraries, module boundaries, decomposition,
agent count, internal round count, or implementation steps. It MUST NOT inspect Builder workspaces,
read the Engineering Lead's workbench, review source, rerun tests, reproduce metrics, or become a
second technical reviewer.

### Tier 2 — Engineering Lead

The **Engineering Lead** owns HOW: architecture, tools, decomposition, Builder assignments,
bounded workspaces, internal ordering, repair routing, single-writer integration, candidate
versioning, review coordination, staleness calculation, and one terminal Return Packet. Under the
Git reference profile, this includes worktrees and local candidate commits.

The Lead MUST NOT weaken the bar, enlarge its own ceiling, accept informal scope expansion,
self-certify technical closure, write or merge to mainline, publish, choose LAND or DISCARD, or begin
another checkpoint. Before the final Integration verdict exists, program-state and unrelated-track
material MUST NOT influence engineering decisions. Any later read performed solely to prepare the
Return Packet MUST be declared in its provenance block.

### Tier 3 — bounded execution

A **Builder** implements one Lead-defined piece inside an exact ownership allowlist. A **component
Critic** independently checks one immutable or uniquely versioned candidate or mandatory surface.
An **Integration Critic** independently checks the complete final candidate and the currency of
relied-on component verdicts.

Builders and Critics do not acquire Lead, Orchestrator, or Owner authority. A component Critic may
return `PASS`, `FAIL`, or `BLOCKED` for its review. It cannot edit or redesign. The Integration
Critic uses the same verdict vocabulary and cannot close the checkpoint or choose disposition.

## 3. Authority precedence and ratification

Each adopted project MUST declare a precedence chain equivalent to:

1. Owner-ratified root governance for authority, prohibitions, and lifecycle;
2. durable program state selecting the exact ratified anchor;
3. the exact plan section containing the checkpoint bar;
4. the execution-role contract;
5. forms and static planning maps; and
6. verified workspace/repository, environment, data, and test state for facts about reality.

A higher-numbered or newer-looking file is not automatically authoritative. Static maps guide
planning but do not replace durable state. Actual state overrides an expected-state narrative, but
it does not silently change authority or weaken the bar.

The project MUST identify a **governance-locked set** containing its root rulebook, ratified anchors,
governance record, and agent configuration. No agent may modify, stage, or prepare a change to that
set merely because a checkpoint would benefit. If a change is necessary, work stops and the agent
names the exact file, exact change, and reason. Only the Owner may grant a narrow, one-use
suspension for that edit. A suspension does not generalize to related files or later changes.

A bar changes only through an Owner-ratified amendment or replacement anchor followed by a new
brief. A convenience extract, review finding, technical PASS, time pressure, or implementation
difficulty cannot reduce it.

## 4. How a document becomes an acceptance bar

A document becomes a real bar only when all of the following hold:

1. durable state identifies its exact version as ratified;
2. the brief names that exact anchor and exactly one checkpoint;
3. the complete checkpoint checklist remains controlling;
4. the Critic receives the plan identity, version, citation, and verbatim bar excerpt;
5. the Critic verifies that excerpt in the independently resolvable cited plan version and binds the
   review record to both that plan version and the exact candidate identity; and
6. commands, expected results, tolerances, and observable outcomes make each criterion testable.

Under the Git reference profile, the plan version is the file present at the candidate SHA. Another
profile may use a separately immutable plan identity, but the candidate, plan, and verdict links
must remain unambiguous.

Line numbers MAY help navigation but are not binding. The verbatim excerpt and exact version are
load-bearing. An objective such as "make it excellent" is not a bar. A supporting extract may
clarify a criterion but MUST NOT omit, replace, strengthen, or weaken the complete named checklist.

When a required criterion is missing or untestable, the Lead returns `BLOCKED` if the brief itself
was valid but execution exposed the defect. If the brief arrived without a valid bar, the correct
pre-work result is `BRIEF_INVALID`.

## 5. The checkpoint brief

The Orchestrator issues one brief containing exactly these eleven required fields:

1. **Target workspace or repository** — one unambiguous execution boundary.
2. **Authorized checkpoint** — exactly one bounded unit.
3. **Ratified plan anchor** — exact file and version selected by durable state.
4. **Expected state** — expected version, workspace topology, predecessor artifacts, environment,
   and data where relevant.
5. **Observable goal** — the outcome whose existence can be checked.
6. **Complete checklist citation and supporting extract** — the full named bar, its exact citation,
   and faithful verbatim supporting text.
7. **Relevant constraints and execution/evidence profile** — ratified architecture, data, method,
   resource, and scope constraints plus the Git reference profile or a declared equivalent mapping.
8. **Numeric active-elapsed ceiling** — covering orientation through terminal return.
9. **Owner-only actions already authorized** — or the explicit word `none`.
10. **Executor and session preconditions** — required executor tier, reasoning level when governed,
    and fresh-session/read-scope conditions.
11. **Stop and return** — one terminal Return Packet; no inspection, planning, or execution of a
    later checkpoint.

The human courier carries the brief unchanged. The Lead validates all eleven fields before editing
files, creating the active workbench, creating a checkpoint branch, candidate version, bounded
workspace, Critic assignment, or starting the active-elapsed execution clock. Missing, ambiguous,
contradictory, multi-workspace, or multi-checkpoint authorization returns form 10 as
`BRIEF_INVALID`. The return lists every defect, records administrative receipt and validation
timestamps, states that no execution clock or execution artifact began, and asks for an exact
replacement. It is not a Return Packet.

## 6. Start, actual state, and the clock

For a valid brief, the first observable execution output MUST contain:

- `started_at_utc`; and
- verified actual state: workspace/repository identity, exact starting version, modification state,
  relevant environment/data state, and profile-specific topology.

The contract does not mandate a timestamp-acquisition command. The chosen acquisition mechanism is
an implementation choice and remains an edge to validate in each adopting environment. It MUST NOT
be represented as a ratified mechanism merely because an executor selected it.

Actual state overrides expected-state narrative. A material mismatch is surfaced immediately. The
Lead may continue only when the existing brief already authorizes the real state. If resolving the
mismatch requires new authority, a changed bar, destructive work, or Owner judgment, the Lead
returns `BLOCKED`. Under the Git reference profile, an unknown branch is inspected and declared to
the Owner; it is neither silently deleted nor automatically grounds for refusing unrelated work.

Active elapsed begins at `started_at_utc` and runs through the terminal return. Record raw seconds;
decimal hours are a convenience. A pause is eligible only while every Lead, Builder, Critic,
Integration, test, and tool context is stopped for an already-authorized external dependency or a
platform suspension. A newly required credential, authority, source, destructive action, or public
action is `BLOCKED`, not an indefinite pause.

## 7. Engineering decomposition and one-writer integration

After validation and state verification, the Lead chooses the implementation method. It MAY use
one Builder or several, but parallel write ownership MUST be disjoint. If two Builders may write
the same dependency, they are one workstream for integration purposes.

For every Builder context, the Lead records whether it is fresh or intentionally seeded, the seed
source, its purpose, the bounded workspace, and the ownership allowlist. Builders MAY write
implementation code, documents, fixtures, and tests inside that allowlist. Builder-authored tests
are useful construction evidence, but they are not an independent acceptance oracle. The Critic
MUST derive mandatory oracle inputs and expected results independently of the Builder.

Every decision-bearing source or input used by the Lead, Builder, or Critic MUST be recorded with
its stable identity or version, access time, role, purpose, and effect on the decision. This
includes local files, external references, data, prompts, tool outputs, supplied expected values,
and intentionally seeded context. Secrets may be redacted, but their source and version cannot be
silently omitted.

Under the Git reference profile, the Lead creates all Builder and Critic worktrees. Builders MUST
NOT stage, commit, switch branches, update refs, merge, or manage worktrees. The Lead is the sole Git
writer, imports only allowlisted paths, checks the resulting path set, and serially commits
candidate work on the local checkpoint branch. These are procedural role restrictions; normal
worktrees do not enforce them as security boundaries.

Under another profile, the brief MUST name the equivalent single-writer/version-publisher and the
mechanism that prevents or detects overlapping writes. A Builder returns changed dependencies,
commands, results, artifacts, tests, and known gaps but never a verdict on its own work.

In the Git reference profile, all branches and worktrees require accountable ownership, purpose,
and terminal disposition. Other legitimate work may coexist. Unknown branches are inspected for
tip, age, divergence, attached worktree, and unique cited SHAs, then presented to the Owner for
`merge`, `delete`, or `leave open`. No agent decides their value or deletes them on its own.

## 8. Component Critic protocol

The Lead freezes an immutable or uniquely versioned candidate before review. The component Critic
receives:

- checkpoint and piece or surface;
- exact candidate identity and isolated review workspace;
- actual artifact path and decision-bearing inputs;
- controlling plan identity, exact version, bar citation, and verbatim excerpt;
- exact reproduction commands; and
- expected results and tolerances.

The assignment and verdict contain an exhaustive decision-bearing provenance table. Supplied
expected results are bar inputs, not proof. Where independent acceptance is required, the Critic
records how it independently derived the fixture, oracle, or expected value. It MAY run
Builder-authored tests as additional evidence, but MUST NOT treat their embedded expectations as
the independent oracle.

The Critic receives the artifact, not the Builder's account of it. The Lead does not supply the
Builder checkout, diff, reasoning, summary, workbench, or conversation history. The Critic may not
inspect a Builder workspace, edit the candidate, repair it, or redesign the project. Fresh context,
read-only behavior, and withheld narrative are **cooperative procedural controls**. They MUST be
described that way. A normal detached worktree is not an OS sandbox.

The Critic confirms the exact candidate identity before and after review, verifies the excerpt in
the controlling plan version, runs the real commands, and writes form 5. A verdict MUST state
`PASS`, `FAIL`, or `BLOCKED`, the exact candidate identity, reviewed dependencies, exact bar,
decision-bearing provenance, commands, observed results, criterion comparison, and a single largest
remaining gap. On PASS the gap is explicitly `None — bar met`; it is never omitted.

In the Git reference profile, the Lead commits the candidate first and creates a clean detached
worktree at its full SHA. The Critic confirms clean HEAD before and after review and records
`reviewed_paths`. A non-Git profile MUST provide equivalent immutability, identity, change
detection, and review-workspace declarations.

On `FAIL`, the Lead routes the gap to a Builder and later launches a fresh Critic. There is no fixed
round count. On Critic `BLOCKED`, the Lead either resolves the review dependency within existing
authority or returns terminal `BLOCKED`. The human does not shuttle repair messages between agents.

A comparison is called blind only when the relevant identity mapping was actually withheld until
the verdict was written. Such a run is labeled `COOPERATIVE_PROCEDURAL`, never cryptographically
enforced.

## 9. Durable verdicts and computed staleness

A completed verdict is durably recorded under the declared evidence profile **after** the review.
Recording the verdict therefore does not alter the candidate identity it judged. Under the Git
reference profile, the verdict is plain Markdown committed beside the checkpoint evidence.
Verdicts remain durable evidence only while the candidate and evidence identities they cite remain
independently resolvable through the declared preservation profile.

The set of **reviewed dependencies** is a soundness boundary, not bookkeeping. It MUST include every
artifact, path, dataset, configuration item, or other versioned input whose content the conclusion
depends on. Understatement can make reuse unsound. The Git reference profile records this set as
`reviewed_paths` when those dependencies are repository paths and separately records external
versioned inputs.

For every component verdict relied on by the final candidate, the Lead and Integration Critic
compute currency using the declared profile. The universal test is: the reviewed candidate must be
in the final candidate's valid version lineage, and none of the declared reviewed dependencies may
have changed.

Under the Git reference profile:

1. the verdict's candidate SHA MUST be an ancestor of `final_candidate_sha`; and
2. `git diff --name-only <component_sha>..<final_candidate_sha> -- <reviewed_paths>` MUST be empty.

If either condition fails, that verdict is stale. A repair reruns exactly the Critics whose reviewed
dependencies changed. Unaffected, computed-current verdicts remain valid. A later external write
to a reviewed dependency triggers the same rule; it is reported and attributed, not silently
reconciled. A non-Git profile MUST record the equivalent lineage and dependency-change query.

## 10. Fresh Integration review

When product changes stop, the Lead designates the exact final candidate identity. A fresh
Integration Critic uses a different declared review context at that exact version and receives the
complete checkpoint bar, all component verdicts, reproduction commands, and relevant fixed inputs.
Under the Git reference profile, this identity is `final_candidate_sha` and the review context is a
clean detached worktree at that SHA.

Integration verifies:

1. every item in the complete checklist against direct evidence;
2. existence, PASS status, valid lineage, and dependency currency of every relied-on component
   verdict under the declared profile;
3. every declared reviewed dependency exists and resolves at the final candidate;
4. cross-component contracts and hard invariants;
5. recomputed metrics or outputs where applicable;
6. clean-environment reproducibility and documentation consistency; and
7. absence of unauthorized later-checkpoint work.

Integration uses form 5 and does not redesign. `FAIL` re-enters the repair loop and triggers
selective component re-review. Technical `PASS` requires the complete bar, every applicable
mandatory independent surface, and a current fresh Integration PASS. Neither the Builder nor Lead
may self-certify it.

## 11. Final candidate, evidence tip, and terminalization

Terminal revision requirements depend on the claimed status. The method never creates a fake
candidate, empty evidence revision, branch, or verdict merely to fill a form.

### PASS requirements

`PASS` requires all of the following:

1. **final candidate identity** — the exact immutable or uniquely versioned artifact state reviewed
   by the fresh Integration Critic;
2. **evidence tip identity** — a distinct, later, independently resolvable evidence state containing
   the completed Integration verdict;
3. **linkage and reachability** — each identity resolves and the evidence tip links unambiguously to
   the final candidate and all relied-on verdicts;
4. **evidence-only terminal delta** — nothing about the reviewed product, configuration, data, or
   decision-bearing inputs changed when terminal evidence was recorded; and
5. **post-verdict read declaration** — every read after the Integration verdict is listed. A read
   that changes a technical claim or engineering decision reopens the candidate and requires fresh
   review; packet-only administrative reads are declared but do not alter the verdict.

Under the Git reference profile, these identities are distinct reachable
`final_candidate_sha` and `evidence_tip_sha`; the former MUST be an ancestor of the latter, and
`git diff --name-only <final_candidate_sha>..<evidence_tip_sha>` MUST contain only authorized
evidence paths. If any PASS condition fails, the result is not PASS.

### Honest non-PASS requirements

For `BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED`, report only what exists:

- if a candidate version exists, record its exact resolvable identity; otherwise record
  `NOT_CREATED — [specific reason]`;
- if a durable evidence version exists, record its exact resolvable identity; otherwise record
  `NOT_CREATED — [specific reason]`;
- run lineage, reachability, and terminal-delta checks only when their required operands exist;
  otherwise record `NOT_APPLICABLE — [specific missing operand/profile reason]`; and
- never create an artificial candidate, verdict, evidence commit, branch, or version solely to make
  the non-PASS packet resemble PASS.

If both identities exist, their relationship and delta MUST be reported honestly under the declared
profile. Existing Critic verdicts remain durable evidence and must be preserved; a non-PASS does not
gain an Integration verdict it never received.

`BRIEF_INVALID` is different. Form 10 exists before execution: no start time, execution clock,
workbench, branch or equivalent workspace, candidate identity, Builder/Critic context, verdict,
evidence identity, or Return Packet is created.

## 12. Terminal outcomes, silence, and abandonment

The Lead returns exactly one of five terminal outcomes:

| Status | Meaning |
|---|---|
| `PASS` | Every checklist item and mandatory independent surface passes, and a current fresh Integration verdict is PASS. |
| `BLOCKED` | A previously valid run exposed a need for an Owner action, credential, new authority, plan amendment, destructive/public action, an untestable criterion, or resolution of a material plan-versus-reality contradiction. |
| `PLATEAU` | The next improvement is not worth its cost under the existing goal and ceiling, or repeated material repair attempts produced no meaningful improvement. It is never relabeled PASS. |
| `BUDGET_EXHAUSTED` | The numeric active-elapsed ceiling was reached before PASS. The bar remains unchanged. |
| `BRIEF_INVALID` | Any required brief field was missing, ambiguous, contradictory, or inconsistent with one target workspace/repository, one checkpoint, or higher-order governance. It is returned before execution clock or execution artifacts and uses form 10, not a Return Packet. |

Silence is not a terminal status. Under the ratified liveness and ceiling rule, the Orchestrator
detects, declares, and durably records **abandonment** in the cross-track program state it owns when
a run materially exceeds its allowed real time without a return. Abandonment is an
orchestration/liveness outcome, not `BUDGET_EXHAUSTED`, because no Engineering Lead return
established consumed active time or terminal state.

The Owner then decides disposition, retry, changed direction, and any continuation. A lifecycle
agent may inspect before that human decision, but may preserve, repoint, or reclaim only after it.
No Return Packet or form-8 receipt is invented for a silent run.

No terminal outcome reduces the bar or opens another checkpoint.

## 13. Workbench and Return Packet

After a valid start, the Lead MAY maintain a private, non-versioned workbench. Under the Git
reference profile it is Git-ignored. It is temporary operational state, not program state, not a
bar, not a verdict, and not an upward artifact. Critics, Orchestrator, and the human courier /
development-management function do not receive it. Before return, any unique evidence is extracted
into a deliberately named authorized evidence artifact. The workbench itself is then always
removed; it never survives under its operational name.

For `PASS`, `BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED`, form 7 is the **sole upward artifact** from
the execution authority to the Orchestrator. The Return Packet includes:

- status, target workspace/repository, checkpoint, exact anchor, declared profile, and a full echo
  of the eleven-field brief;
- exact final-candidate and evidence-tip identities when they exist, or explicit
  `NOT_CREATED — [reason]`, with relationship/delta checks or justified `NOT_APPLICABLE` values;
- clock, pauses, raw active seconds, and ceiling;
- Builder context seeds and owned dependencies;
- all component and Integration verdicts, reviewed dependencies, exact identities, results, and
  largest gaps;
- the complete checklist mapping, mandatory surfaces, acceptance oracles, commands, artifacts, and
  results;
- exhaustive decision-bearing provenance, including stable identities/versions, access times,
  roles, purposes, effects, and `ASSERTED_ROLE_BOUNDARY` declarations;
- every read after the Integration verdict—or after the executor chose a non-PASS return when no
  verdict exists—stating the source, time or unambiguous stage, sole reason the read was needed,
  what it did not or could not influence, any context-boundary deviation, and the resulting
  rereview consequence;
- engineering decisions, remaining risks or exact Owner request, and defense questions;
- a live Landing Report covering the declared profile's resources, including branches, worktrees,
  tags, and reachability under Git, or an explicit no-artifact/no-branch report where applicable;
- an optional **proposed** Owner-authored commit message, clearly marked advisory and never treated
  as staging, commit, LAND, or publication authority; and
- an explicit statement that work stopped and no later checkpoint began.

The packet is a bounded handoff artifact. **This method does not claim that the Return Packet is
committed or durably preserved.** Do not confuse it with durably versioned Critic verdicts, the
program-state receipt entry, or the later Owner disposition.

## 14. Bounded Orchestrator receipt gate

The Orchestrator reads the packet and only the evidence records it cites. It records the receipt
using form 8 as an entry in the project's **existing durable program-state document or log**. That
entry is not a new authority tier, a technical verdict, or a requirement to commit the Return
Packet.

Every valid-run packet is checked for:

1. the authorized target, exactly one checkpoint, exact ratified anchor, and complete brief echo;
2. a declared execution/evidence profile with all six universal primitives;
3. actual start state, clock and pause accounting, terminal status, and an exact non-PASS reason
   where applicable;
4. checklist mapping honest for the claimed status—complete closure for PASS, open items visible for
   non-PASS;
5. exhaustive decision-bearing provenance, Builder seeds, cooperative-control declarations, and all
   post-verdict reads;
6. live resources/topology matching the packet, including `NOT_CREATED` and `NOT_APPLICABLE` claims;
   and
7. every candidate, verdict, or evidence identity that is claimed to exist resolving under the
   declared profile.

The following gates are **PASS-specific** and cannot be marked not applicable:

1. every complete-checklist criterion and mandatory surface has direct evidence;
2. required component verdicts are durable, exact-version, and computed-current;
3. a fresh Integration PASS binds the exact final candidate;
4. final candidate and evidence tip are distinct, resolvable, correctly linked, and preserve every
   relied-on verdict; and
5. the terminal delta is evidence-only and all post-verdict reads are non-decision-bearing.

For `BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED`, those PASS-only gates are replaced by conditional
integrity checks. The Orchestrator verifies every identity and verdict that exists, accepts
`NOT_CREATED — [reason]` only when the resource genuinely never existed, and accepts
`NOT_APPLICABLE — [reason]` only when a check lacks an operand or does not belong to the declared
profile. It does not require an Integration verdict, candidate branch, or evidence tip that the run
never produced, and it does not allow a non-PASS to imply technical closure.

Under the Git reference profile, the exhaustive repository-query class is limited to the following
commands, and each command is run only when its operands exist:

```text
git log --oneline main..<evidence_tip_sha>
git diff --stat main...<evidence_tip_sha>
git diff --name-only <final_candidate_sha>..<evidence_tip_sha>
git merge-base --is-ancestor <component_sha> <final_candidate_sha>
git diff --name-only <component_sha>..<final_candidate_sha> -- <reviewed_paths>
git worktree list
git branch -vv
git tag --list
git cat-file -e <every_cited_sha>
```

Missing operands are recorded as `NOT_APPLICABLE — [specific reason]`, not passed. Under a non-Git
profile, form 1 MUST have named the equivalent finite read-only queries for identity resolution,
lineage, dependency change, evidence linkage, preservation, and live-resource inspection. The
Orchestrator uses that declared query set; the evidence class does not expand because a tool is
available.

The Orchestrator MUST NOT open or review source/content as a second reviewer, rerun tests, rederive
metrics, inspect generated technical outputs, inspect Builder workspaces, or read the Lead's
workbench. Those actions would collapse the authority split by creating a second technical reviewer
with less context.

The receipt result is **supported** or **rejected**, with every failed gate item named. A supported
technical PASS permits Owner disposition consideration. It does not itself land, close lifecycle,
or authorize continuation. A non-PASS packet may be accepted as an honest return while still
requiring the exact Owner decision or replacement brief it names.

`BRIEF_INVALID` bypasses this gate. Form 10 returns to the Orchestrator before execution; no Return
Packet or receipt of execution evidence is fabricated.

## 15. Human judgment, disposition, and continuation

When a bounded unit returns, the human in the development-management hat decides whether a
technically verified result still serves the larger agenda. The Owner may accept or reject the
direction, stop the project, pause a track, change priorities, request a ratified amendment, choose
LAND or DISCARD, decline to continue after technical PASS, or authorize the next unit.

The human does not repeat the Critics' technical review. The Return Packet and receipt provide its
technical and evidentiary basis. Technical correctness is not strategic correctness: an artifact
may meet every written criterion while moving toward an outcome the Owner no longer wants. No
autonomous tier can infer an unstated change in the Owner's goals, values, priorities, risk
tolerance, or judgment.

Disposition is exactly one of:

- **LAND** — available only after a supported PASS. The Owner accepts the exact final candidate into
  the profile's authoritative destination and preserves the separate evidence identity. Under the
  Git reference profile, the Owner performs a squash merge into mainline, reviews the staged tree,
  authors the mainline commit by hand, records `land/<checkpoint>` at that commit, and records
  `evidence/<checkpoint>` at `evidence_tip_sha`.
- **DISCARD** — the Owner rejects the attempt. Existing candidate and evidence identities are
  preserved according to the declared profile before resource reclamation. Under the Git reference
  profile, an existing evidence tip is preserved at `archive/<checkpoint>-attempt-<k>`. If no
  evidence tip exists but an existing candidate/attempt ref must retire, that archive tag preserves
  the exact inspected candidate or attempt tip and explicitly states that it is not an evidence tip.
  If an honest non-PASS created no branch, candidate, verdict, or evidence tip, the record states
  `NOT_APPLICABLE — no execution artifact existed`; no empty tag or commit is fabricated.

No agent may perform a merge, squash, fast-forward, rebase, cherry-pick, or commit that writes
mainline. Publication, remote pushes, pull requests, releases, and other public mutations are
Owner-only.

Even after disposition and lifecycle closure, continuation requires an explicit Owner decision and
a new valid Orchestrator brief. There is no automatic next checkpoint.

## 16. Evidence preservation and reclamation

Lifecycle preparation begins with read-only inspection after either a supported receipt or an
Orchestrator abandonment declaration recorded in durable program state. Form 9 is filled in that
order: receipt/abandonment reference first, read-only inspection second, Owner decision third, and
only then mutations. A prefilled disposition is invalid.

The universal lifecycle order is:

1. inventory every created workspace, version, evidence record, citation, and preservation target;
2. record explicit `NOT_CREATED` values for resources that never existed;
3. stop and obtain the Owner's LAND or DISCARD decision;
4. preserve every existing cited candidate/evidence identity under the declared profile;
5. verify preservation and repoint every live citation away from a resource that will retire;
6. reclaim only resources created for this checkpoint; and
7. record final resource state and lifecycle closure in durable program state.

For an honest no-branch/no-artifact non-PASS, preservation, repointing, and deletion steps are
`NOT_APPLICABLE` with reasons. Lifecycle can close after Owner DISCARD once inspection verifies that
nothing exists to preserve or reclaim. The method never creates an artifact in order to delete it.

Under the Git reference profile, no ref may be deleted unless its cited SHAs are reachable from a
verified tag and the Owner has dispositioned that exact branch. Preserving a SHA while leaving
prose pointed at a deleted branch is insufficient; citations follow the ref. Unknown or unrelated
branches are declared to the Owner and left intact pending a decision. They do not block closure of
the checkpoint's own branch. Non-Git profiles apply the same preservation-before-reclamation
invariant to their declared resources.

## 17. Parallel tracks and external changes

Zero-Trust Hierarchy permits zero to arbitrarily many heterogeneous tracks. Every active track
preserves exactly these nine universal invariants:

1. **Human purpose** — the Architect / Owner ratifies direction and retains disposition and
   continuation authority.
2. **One bounded authorization** — one target, one checkpoint, one exact anchor and bar, one numeric
   ceiling, and one declared execution/evidence profile.
3. **Separated execution authority** — one accountable executor owns HOW without acquiring
   Orchestrator or Owner authority.
4. **Verified actual state** — the first valid-run output records start time and actual state;
   reality overrides expected-state narrative without silently changing authorization.
5. **Exact candidate identity when candidate work exists** — the artifact is immutable or uniquely
   versioned before review; an early non-PASS fabricates no candidate identity.
6. **Independent artifact review when acceptance is claimed** — a separate Critic binds the real
   artifact to the exact bar, exhaustive provenance, reviewed dependencies, commands, results, and
   an explicit gap; a pre-artifact non-PASS declares review `NOT_RUN` rather than fabricating it.
7. **Honest, durable, current evidence** — each verdict that exists resolves independently, and the
   declared lineage/dependency-change mechanism selectively invalidates stale review; absent
   evidence is reported `NOT_CREATED`.
8. **Bounded return and receipt** — one honest terminal handoff returns upward, and the Orchestrator
   records a profile-bounded supported/rejected receipt in existing durable program state; invalid
   briefs and silent abandonment use their separate routes.
9. **Human disposition and controlled lifecycle** — the Owner decides LAND/DISCARD and continuation;
   existing evidence is preserved before only checkpoint-owned resources are reclaimed.

**Engineering Lead** is the Git reference profile's name for the accountable execution authority;
another track may use a researcher, editor, analyst, or other profile-appropriate executor.
`workbench.md` is an optional private mechanism, not a universal track artifact. A Git candidate
branch exists only when candidate work is actually created; early non-PASS and non-Git tracks do
not invent one.

Tracks may use different inner execution methods as long as they produce the same interface:

```text
goal plus ratified bar
    -> internally iterative independent execution
    -> reviewed artifact plus durable verdicts
```

Parallelism is bounded, not automatically safe. Use disjoint write ownership inside a track
(Builder assignments in the Git reference profile) and explicit resource accountability across
tracks. If another session changes a reviewed dependency, compute staleness and rerun exactly the
affected Critic. Record the external change and resulting topology; do not label concurrency itself
as sabotage or silently reconcile it.

Only the Orchestrator owns durable cross-track state. A track's execution authority does not inspect
another track to optimize its own work or start work merely because resources appear idle.

## 18. Audit and adoption checklist

Before adopting the method, confirm that the project can answer yes to each item:

- [ ] One human owns purpose, ratification, disposition, mainline, publication, and continuation.
- [ ] The same human's courier role is distinguished from those control decisions.
- [ ] Governing documents have an explicit precedence order and locked set.
- [ ] Durable state identifies exact ratified plan versions.
- [ ] The Orchestrator can issue all eleven brief fields and no implementation prescription.
- [ ] The brief declares the Git reference profile or a complete equivalent mapping.
- [ ] Invalid briefs return before edits, workbench, execution resource, candidate, Critic, verdict,
  evidence identity, Return Packet, or execution clock.
- [ ] A valid run's first observable output is start time plus verified actual state.
- [ ] Actual state can be surfaced without silently changing authorization.
- [ ] The designated execution authority is the sole version publisher/integrator and parallel
  write ownership is disjoint.
- [ ] Builders may write tests, while Critics derive mandatory independent oracles independently.
- [ ] Fresh review, read-only behavior, and withheld Builder narrative are labeled procedural.
- [ ] Critics receive exact candidate identities, verbatim bars, commands, tolerances, provenance,
  and actual artifacts.
- [ ] Every verdict records exhaustive reviewed dependencies and one explicit largest gap.
- [ ] Staleness is computed by declared lineage and dependency change, with selective re-review.
- [ ] PASS requires distinct resolvable final-candidate and evidence-tip identities with an
  evidence-only terminal delta; non-PASS fields reflect only what exists.
- [ ] Durable verdicts and their candidate identities remain independently resolvable.
- [ ] The Return Packet is the sole upward handoff but is not falsely described as committed.
- [ ] The Orchestrator's receipt has all-return, PASS-only, and conditional non-PASS gates and
  explicitly excludes technical re-review.
- [ ] The receipt is an existing program-state entry, not a new authority tier.
- [ ] The Orchestrator detects, declares, and durably records abandonment under the ratified
  liveness/ceiling rule; the Owner alone decides disposition, retry, changed direction, and
  continuation; lifecycle mutation waits for that human decision.
- [ ] LAND and DISCARD preserve existing evidence before resource reclamation, including a coherent
  no-artifact path.
- [ ] Mainline, publication, disposition, and continuation remain Owner-only.
- [ ] Every claim of enforcement distinguishes verified artifacts from procedural declarations and
  human judgment.

The accompanying ten forms implement these boundaries. If a local form conflicts with this
rulebook or the project's ratified higher-order governance, stop and resolve the conflict before
execution; do not select whichever version is more convenient.
