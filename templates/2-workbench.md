# Zero-Trust Hierarchy form 2 — Active workbench

The **Engineering Lead** may create this private, non-versioned file only after a brief has passed
validation and the required first observable output has reported start time plus verified actual
state. Under the Git reference profile, keep it Git-ignored.

The workbench is temporary operational state. It is not program state, an acceptance bar, a
verdict, or an upward handoff. Builders, Critics, the Orchestrator, and the human courier /
development-management function do not receive it. Before terminal return, move any unique
evidence deliberately into an authorized evidence artifact, then always remove the workbench. It
never survives under the workbench name.

````markdown
# Active Workbench — [checkpoint id]

## Authorization and clock
- target workspace or repository:
- authorized checkpoint:
- exact ratified plan anchor:
- execution/evidence profile:
- candidate branch or equivalent version workspace: [identity] | NOT_CREATED — not yet created
- active-elapsed ceiling:
- started_at_utc:
- last_updated_at_utc:
- consumed active seconds:
- decimal hours (derived convenience only):

## First observable state, already reported
- exact starting artifact/workspace version:
- modification state at start:
- Git full HEAD, branch, and working-tree state, if applicable:
- relevant environment / data state at start:
- profile resources/topology at start:
- expected-state mismatch: none / [exact mismatch and disposition]
- timestamp-acquisition mechanism selected by this implementation: [do not call it ratified unless
  the governing documents do]

## Eligible pause ledger
| paused_at_utc | resumed_at_utc | raw seconds | already-authorized reason / evidence | all contexts and tools stopped? |
|---|---|---:|---|---|

## Authorized observable goal and complete bar
| Criterion and exact citation | Evidence required | State |
|---|---|---|

## Decomposition, dependencies, and repair routing
| Piece / surface | Depends on | Builder context | Acceptance oracle | Current gap | Next repair or review route |
|---|---|---|---|---|---|

## Builder contexts and seeds
| Piece | Fresh or seeded | Exact seed source/version | Reason | Owned dependencies | Bounded workspace | Returned dependencies |
|---|---|---|---|---|---|---|

## Decision-bearing provenance
| Source/input | Stable identity/version/hash | Accessed_at_utc | Role | Purpose | Decision or claim affected | Secret redaction, if any |
|---|---|---|---|---|---|---|

Use an explicit `none` row if no source exists beyond the ratified bar and candidate. Include local
files, external references, datasets, prompts, tool outputs, supplied expected values, and seeded
context.

## Lead integration ledger
| Import/version | Ownership checked? | Candidate identity | Commands / result | Open gap |
|---|---|---|---|---|

## Mandatory surfaces and acceptance oracles
| Surface / oracle | Applicable? | Reason | Independent fixture / expected result | Critic verdict |
|---|---|---|---|---|

## Component verdict currency
| Verdict record | Candidate identity | Reviewed dependencies / Git reviewed_paths | Valid lineage? | Dependency change empty? | Current / stale | Rerun action |
|---|---|---|---|---|---|---|

## Integration and terminal identities
- final candidate identity / Git final_candidate_sha: [identity] | NOT_CREATED — [reason]
- Integration verdict file / result:
- evidence identity / Git evidence_tip_sha: [identity] | NOT_CREATED — [reason]
- candidate/evidence linkage: yes / no / not yet / NOT_APPLICABLE — [reason]
- terminal changed dependencies / Git diff paths:
- terminal delta is evidence-only: yes / no / not yet / NOT_APPLICABLE — [reason]
- cited identity resolution checked: yes / no / not yet / NOT_APPLICABLE — [reason]

## Post-verdict or post-stop reads
- terminal read boundary: [Integration verdict time] | [non-PASS stop decision time]

| Source/input read after terminal read boundary | Stable identity/version/hash | Read_at_utc | Purpose | Decision-bearing? | Consequence / rereview |
|---|---|---|---|---|---|

Use `none` if no later read occurred. A decision-bearing post-verdict read reopens the candidate
and requires fresh review; a non-PASS records later reads even if no verdict exists.

## Current resources/topology
| Branch/worktree/tag or profile equivalent | Owner | Purpose | Exact version | Clean/unchanged? | Planned disposition |
|---|---|---|---|---|---|

## Terminal reason, if not PASS
- none / exact blocker, plateau evidence, or exhausted-budget state:
- smallest exact Owner decision, authority, or resource change required:
````

An eligible pause exists only when every Lead, Builder, Critic, Integration, test, and tool context
is stopped for an already-authorized external dependency or platform suspension. A newly required
credential, authority, source, destructive/public act, or change to the bar is terminal `BLOCKED`,
not an open pause.
