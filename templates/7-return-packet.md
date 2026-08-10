# Zero-Trust Hierarchy form 7 — Consolidated Return Packet

The accountable **execution authority** writes this form (**Engineering Lead** in the Git reference
profile), the **human courier / development-management function** (the same person as the
**Architect / Owner** in a second operational hat) carries it unchanged, and the **Orchestrator**
reads it. It is the sole upward handoff for a valid run and is used only for `PASS`, `BLOCKED`,
`PLATEAU`, or `BUDGET_EXHAUSTED`. Use form 10 for `BRIEF_INVALID`.

The Return Packet is not a Critic verdict, receipt, disposition, or continuation authorization.
Zero-Trust Hierarchy does **not** claim that the packet is committed or durably preserved.

````markdown
# Checkpoint Return — [checkpoint id]

## Terminal result
- status: PASS | BLOCKED | PLATEAU | BUDGET_EXHAUSTED
- target workspace or repository:
- authorized checkpoint:
- exact ratified plan anchor:
- execution/evidence profile: GIT_REFERENCE | DECLARED_EQUIVALENT — [mapping]
- candidate branch/workspace: [identity] | NOT_CREATED — [specific reason]
- workspace modification state at return:
- final candidate identity / Git final_candidate_sha: [identity] | NOT_CREATED — [specific reason]
- evidence identity / Git evidence_tip_sha: [identity] | NOT_CREATED — [specific reason]
- candidate/evidence lineage or linkage: yes / no — [query/result] | NOT_APPLICABLE — [missing operand/profile reason]
- final-to-evidence changed dependencies / Git paths: [complete list] | NOT_APPLICABLE — [reason]
- terminal delta is evidence-only: yes / no — [query/result] | NOT_APPLICABLE — [reason]
- all cited identities independently resolvable: yes / no — [checks] | NOT_APPLICABLE — [none exist]
- Integration verdict: PASS | FAIL | BLOCKED | NOT_RUN — [durable verdict identity or exact reason]

For PASS, both identities are mandatory, distinct, and resolvable; the evidence identity must link
to the Integration-reviewed final candidate, and the terminal delta must be evidence-only. For a
non-PASS, report only what exists. Use `NOT_CREATED` for a genuinely absent resource and
`NOT_APPLICABLE` only for a check whose operands do not exist or whose declared profile uses a
different query. Never fabricate a branch, candidate, verdict, or evidence revision to fill this
form.

## Full checkpoint-brief echo — all eleven fields
1. Target workspace or repository:
2. Authorized checkpoint:
3. Ratified plan anchor:
4. Orchestrator-reported expected state:
5. Observable goal:
6. Complete checklist citation and verbatim supporting extract:
7. Relevant constraints and execution/evidence profile:
8. Numeric active-elapsed ceiling:
9. Owner-only actions already authorized:
10. Executor tier, reasoning requirement, and new-session/read-scope preconditions:
11. Stop and return instruction:

## Actual start state and clock
- started_at_utc:
- terminal_at_utc:
- timestamp-acquisition mechanism selected by this implementation:
- exact starting artifact/workspace version and modification state:
- actual Git branch / full HEAD / working-tree state, if applicable:
- relevant environment / data state at start:
- actual profile resources/topology at start:
- expected-state mismatch and disposition: none / [exact account]
- eligible pause ledger (UTC, raw seconds, reason/evidence, all contexts stopped):
- consumed active elapsed: [raw seconds; decimal hours may follow]
- numeric ceiling:

## Exhaustive decision-bearing provenance
| Source/input | Stable identity/version/hash | Accessed_at_utc | Role | Purpose | Decision or claim affected | Secret redaction, if any |
|---|---|---|---|---|---|---|

Use an explicit `none beyond the ratified bar and versioned artifacts` row when true. Include local
files, external references, datasets, prompts, tool outputs, supplied expected values, and seeded
context.

## Procedural boundaries and post-verdict reads
- ASSERTED_ROLE_BOUNDARY — exact pre-Integration program/unrelated-track sources excluded, and any
  deviation:
- cooperative fresh-context/read-only/no-Builder-narrative controls used: yes / no / exact deviation:
- ordinary worktrees treated as OS or cryptographic sandboxes: no / [correct any contrary claim]:
- blind comparison: NOT_APPLICABLE | COOPERATIVE_PROCEDURAL — [mapping/reveal record]:
- terminal read boundary: [Integration verdict time] | [non-PASS stop decision time when no verdict]

| Source/input | Stable identity/version/hash | Read time or unambiguous stage | Sole reason needed | What it did not/could not influence | Context-boundary deviation | Consequence / rereview |
|---|---|---|---|---|---|---|

Use `none` if no later read occurred. “Sole reason needed” must be specific; “for context” is not
sufficient. A packet-only administrative read must state which artifact, technical claim,
engineering decision, bar interpretation, or status it did not and could not influence. Record any
context-boundary deviation rather than hiding it. For PASS, a read that influenced a technical
claim or engineering decision reopens the candidate and requires fresh review. For a non-PASS with
no verdict, the same table exhaustively records reads after the executor chose the terminal return.

## Builder contexts and seeds
| Piece | Fresh or seeded | Exact seed source/version | Reason | Owned dependencies | Workspace | Returned/imported dependencies | Deviation |
|---|---|---|---|---|---|---|---|

## Component and Integration verdicts
| Piece / surface | Review type | Candidate identity | Reviewed dependencies / Git reviewed_paths | Durable verdict identity | Result | Largest gap / disposition | Current against final? |
|---|---|---|---|---|---|---|---|

For every relied-on component verdict, record the declared profile's lineage and dependency-change
queries. Under Git, record both computations:

```text
git merge-base --is-ancestor <component_sha> <final_candidate_sha> -> [exit]
git diff --name-only <component_sha>..<final_candidate_sha> -- <reviewed_paths> -> [empty / paths]
```

For a declared equivalent profile:

| Component identity | Final identity | Lineage query/result | Reviewed-dependency change query/result |
|---|---|---|---|

## Mandatory surfaces and acceptance oracles
| Surface / oracle | Applicable? | Reason | Independent fixture / expected result | Verdict or direct evidence |
|---|---|---|---|---|

## Complete named checklist
| Criterion and exact citation | PASS / OPEN / BLOCKED | Direct evidence | Exact reproduction |
|---|---|---|---|

## Engineering decisions
- decision and evidence-based rationale:
- material rejected alternatives and why:
- largest failure exposed and its disposition:

## Reproduction
- exact commands and exit/results:
- artifacts, hashes, metrics, or screenshots:
- relevant environment and fixed inputs:

## Open risks or exact Owner action
- none / smallest exact decision, authority, credential, destructive/public act, or resource change:

## Landing Report — live topology at return

### Universal resource inventory
| Resource/version/workspace | Created? | Exact identity or `NOT_CREATED — reason` | Owner / purpose | Current state | Proposed disposition; Owner decides |
|---|---|---|---|---|---|

### Git branches — GIT_REFERENCE only
| Exact branch | Owner | Purpose | Tip SHA | Ahead/behind main | Attached worktree | Clean/dirty | Proposed disposition; Owner decides |
|---|---|---|---|---|---|---|---|

### Git worktrees — GIT_REFERENCE only
| Exact path | Owner / creator | Purpose / checkpoint | Branch or detached HEAD | SHA | Clean/dirty | Proposed lifecycle action |
|---|---|---|---|---|---|---|

### Preservation identities and reachability
| Existing or required preservation identity | Target / intended target | Cited identities resolvable? | Verification |
|---|---|---|---|

### Unaccounted or unrelated resources
- none / [identity/version, age, divergence/change, attachment/ownership, citation reachability, and
  recommendation for Owner]

## Optional proposed Owner-authored commit message
[NONE, or proposed text. Advisory only: this does not stage, commit, LAND, publish, or grant
mainline authority.]

## Defense questions
1. [Question grounded in actual architecture, tradeoffs, and evidence.]
2. [Question grounded in actual architecture, tradeoffs, and evidence.]
3. [Question grounded in actual architecture, tradeoffs, and evidence.]
[Add at most two more.]

## Stop declaration
All checkpoint work has stopped. No later checkpoint has been inspected, researched, planned,
scaffolded, branched for, or begun.
````

## Terminal meanings

| Status | Meaning |
|---|---|
| `PASS` | Complete checklist, all applicable mandatory independent surfaces, and a current fresh Integration PASS. |
| `BLOCKED` | A previously valid run exposed a need for an Owner action, credential, new authority, plan amendment, destructive/public action, an untestable criterion, or resolution of a material plan-versus-reality contradiction. |
| `PLATEAU` | The next improvement is not worth its cost under the current goal and ceiling, or repeated material repairs produced no meaningful improvement. |
| `BUDGET_EXHAUSTED` | The numeric active-elapsed ceiling was reached before PASS; the bar remains unchanged. |

A non-PASS packet preserves the evidence that exists and names the smallest exact change required.
No status opens another checkpoint.
