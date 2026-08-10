# Zero-Trust Hierarchy form 9 — Landing, disposition, evidence, and reclamation

This form enforces fill order. Begin with **Phase A read-only inspection** after either a supported
Orchestrator receipt or an Orchestrator-declared abandonment recorded in durable cross-track program
state under the ratified liveness/ceiling rule. Do not prefill the disposition. Stop after inspection
until the **Architect / Owner** decides disposition, retry, changed direction, and continuation.
Only then may Phase B mutate state.

LAND requires a supported PASS. The Owner alone accepts the artifact into the authoritative
destination and performs any mainline/publication action. After an Owner decision, an authorized
lifecycle agent may perform delegated DISCARD preservation, citation repointing, and reclamation.

````markdown
# Lifecycle Record — [checkpoint id]

## Phase A — trigger and read-only inspection

### A1. Trigger
- authorized target workspace/repository:
- checkpoint:
- execution/evidence profile: GIT_REFERENCE | DECLARED_EQUIVALENT — [mapping]
- trigger: SUPPORTED_RECEIPT | ORCHESTRATOR_DECLARED_ABANDONMENT
- supported receipt program-state entry: [identity/location] | NOT_APPLICABLE — abandonment
- Orchestrator abandonment program-state declaration: [identity/time/liveness rule] |
  NOT_APPLICABLE — returned run
- packet status: PASS | BLOCKED | PLATEAU | BUDGET_EXHAUSTED | NOT_APPLICABLE — abandonment
- candidate branch/workspace reported: [identity] | NOT_CREATED — [reason] | UNKNOWN — abandonment inspection
- final candidate identity / Git final_candidate_sha: [identity] | NOT_CREATED — [reason] | UNKNOWN — abandonment inspection
- evidence identity / Git evidence_tip_sha: [identity] | NOT_CREATED — [reason] | UNKNOWN — abandonment inspection

### A2. Actual resource inventory
| Resource/version/workspace | Created? | Exact identity or `NOT_CREATED — reason` | Owner / purpose | Current state | Cited by a live record? |
|---|---|---|---|---|---|

### A3. Git topology — GIT_REFERENCE only
| Branch/worktree/tag | Tip/HEAD | Ahead/behind main | Attached/clean state | Unique cited SHA? | Belongs to this checkpoint? |
|---|---|---|---|---|---|

### A4. Identity, preservation, and citation inspection
- every existing cited identity resolves: yes / no / NOT_APPLICABLE — none exist
- candidate/evidence linkage verified: yes / no / NOT_APPLICABLE — [reason]
- existing preservation reference(s):
- live citations that would require repointing:
- unknown/unrelated resources and Owner recommendation:
- exact resources eligible for this checkpoint's reclamation:

STOP. Present Phase A to the Owner. Do not fill Phase B and do not mutate a version, tag,
citation, branch, worktree, authoritative destination, or publication before the Owner decides.

## Owner disposition — completed only after Phase A
- Owner decision: LAND | DISCARD
- decision recorded_at_utc:
- decision source:
- exact candidate/resource covered:
- LAND eligibility (supported PASS exists): yes / no / NOT_APPLICABLE — DISCARD
- retry decision: NO | [separate explicit authorization]
- changed direction or priority: none | [separate ratified decision]
- continuation decision: NO | [separate explicit authorization]

If LAND eligibility is not `yes`, LAND is invalid. An abandoned run cannot LAND unless it later
returns through a valid supported-PASS path.

## Phase B — post-decision action

### B1. LAND — Owner-only authoritative action

Complete only for LAND.

- exact final candidate accepted:
- authoritative destination:
- Owner review completed:
- Owner-authored landing/publication identity:
- separate evidence preservation identity:

Git reference profile — the Owner, by hand:

1. runs the equivalent of `git merge --squash <exact_checkpoint_branch>` on mainline;
2. reviews the staged tree;
3. authors the mainline commit;
4. creates `land/<checkpoint>` at that commit; and
5. creates `evidence/<checkpoint>` at `evidence_tip_sha`.

- Owner-authored mainline landing SHA:
- `land/<checkpoint>` target verified:
- `evidence/<checkpoint>` target verified:

The landing and evidence identities mark different things. A squash commit does not preserve the
candidate chain by ancestry; the evidence tag does.

### B2. DISCARD — preserve what exists, fabricate nothing

Complete only for DISCARD.

- existing candidate/evidence identities requiring preservation:
- preservation action and identity:
- preservation verified:
- no authoritative landing/publication made: yes / no

Git reference profile:

- evidence tip exists: yes / no
- archive preservation target: `evidence_tip_sha` | [exact inspected candidate/attempt tip when no
  evidence tip exists] | NOT_APPLICABLE — no ref/artifact existed
- `archive/<checkpoint>-attempt-<k>` created at that preservation target: yes / no /
  NOT_APPLICABLE — no ref/artifact existed
- target is not an evidence tip, if applicable: [explicit reason]
- tag target verified: yes / no / NOT_APPLICABLE — no tag was required

If inspection proved that no branch, candidate, verdict, or evidence identity exists, record
`NOT_APPLICABLE — no execution artifact existed` for preservation. Do not create an empty commit,
tag, document version, or branch to make the lifecycle look populated.

### B3. Preservation-before-reclamation guard
- Owner disposition covers the exact resource: yes / no
- every existing cited candidate/evidence identity is preserved: yes / no / NOT_APPLICABLE — none
- preservation identity resolves independently: yes / no / NOT_APPLICABLE — none
- every live citation has a durable replacement target: yes / no / NOT_APPLICABLE — none

STOP if a required guard is not `yes`.

### B4. Repoint live citations
| Live record | Retiring resource reference | New durable reference | Updated and checked? |
|---|---|---|---|

Use `NOT_APPLICABLE — no retiring live citation` when true. Preserving an identity while leaving a
live record pointed at a deleted resource is incomplete.

### B5. Reclaim only checkpoint-owned resources
| Exact resource/workspace/branch | Created by this checkpoint? | Preservation guard | Reclamation action/result |
|---|---|---|---|

- candidate branch deletion: yes / no / NOT_APPLICABLE — branch was NOT_CREATED
- bounded workspace removal: yes / no / NOT_APPLICABLE — workspace was NOT_CREATED
- profile-specific cleanup/pruning:
- unknown and unrelated resources left intact: yes / no

### B6. Final state and lifecycle closure
- final profile resource inventory:
- preservation identities resolve: yes / no / NOT_APPLICABLE — none existed
- authoritative landing identity resolves: yes / no / NOT_APPLICABLE — DISCARD
- every live citation resolves: yes / no / NOT_APPLICABLE — none
- all checkpoint-owned retiring resources absent: yes / no / NOT_APPLICABLE — none were created
- lifecycle result: CLOSED | NOT_CLOSED
- exact remaining defect, if not closed:
- durable program-state lifecycle entry:

## Continuation
- next checkpoint authorized by Owner: NO | [separate explicit decision reference]
- new Orchestrator form-1 brief issued: NO | [separate brief identity]

This lifecycle record does not itself authorize continuation.
````

Under the Git reference profile, never delete an undispositioned branch or a ref whose cited SHAs
are not already reachable from a verified tag. Unknown branches are an Owner question, not a
cleanup opportunity and not a reason to block reclamation of the checkpoint's own accounted-for
resources.

Agents MUST NOT perform a merge, squash, fast-forward, rebase, cherry-pick, or commit that writes
mainline. They also MUST NOT push, publish, open a pull request, create a release, or mutate a
remote. Those actions remain Owner-only; only post-decision local evidence and reclamation mechanics
are delegable.
