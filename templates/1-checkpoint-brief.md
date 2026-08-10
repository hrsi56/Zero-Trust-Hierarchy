# Zero-Trust Hierarchy form 1 — Checkpoint brief

The **Orchestrator** writes this form, the **human courier / development-management function**
(the same person as the **Architect / Owner** in a second operational hat) carries it unchanged,
and the **Engineering Lead** validates it before execution.

One brief authorizes one target workspace or repository, one checkpoint, one exact ratified anchor,
one execution/evidence profile, and one numeric ceiling. It grants WHAT, WHEN, WHERE, and the bar.
It does not prescribe HOW.

````markdown
# Checkpoint Brief — [checkpoint id]

## 1. Target workspace or repository
[One absolute path, workspace identity, or unambiguous repository identity.]

## 2. Authorized checkpoint
[Exactly one checkpoint or bounded unit.]

## 3. Ratified plan anchor
[Exact filename/document identity and version selected by durable program state. Never infer the
anchor from the highest version number on disk.]

## 4. Orchestrator-reported expected state
- expected artifact/workspace version:
- expected modification state:
- expected Git branch and full commit SHA, if using the Git reference profile:
- completed predecessor and artifacts expected to exist:
- relevant environment, data snapshot, or cutoff:

The Engineering Lead must verify actual state before relying on this narrative. Actual state wins.
A material mismatch is surfaced, not silently reconciled.

## 5. Observable goal
[The inspectable outcome that must exist when this checkpoint succeeds.]

## 6. Complete checklist citation and supporting extract

Complete named checklist: [exact plan/version/section citation]

Complete authoritative checkpoint bar:
- [every criterion from the named checklist]

Verbatim supporting extract:
> [faithful text from the ratified anchor]

The complete named checklist remains controlling. This extract may clarify it but may not omit,
replace, strengthen, or weaken it.

## 7. Relevant constraints and execution/evidence profile
- [ratified architecture, data, method, resource, and scope constraints]
- [mandatory surfaces or independent acceptance oracles]
- [other applicable limits]

Profile: GIT_REFERENCE | DECLARED_EQUIVALENT

| Universal primitive | Exact mechanism for this run |
|---|---|
| Target workspace/repository | |
| Immutable or uniquely versioned candidate identity | |
| Independently resolvable evidence identity and candidate linkage | |
| Reviewed-dependency change/currency query | |
| Isolation and single-writer/version-publisher mechanism | |
| Preservation and reclamation procedure | |

For `GIT_REFERENCE`, use commit SHAs, ordinary worktrees, `reviewed_paths`, ancestry plus path diff,
one Git writer, branches/tags, and worktree reclamation. For `DECLARED_EQUIVALENT`, name the finite
read-only queries the Orchestrator may use for identity, lineage, change, linkage, preservation, and
live-resource inspection.

## 8. Numeric active-elapsed ceiling
[Numeric seconds or hours, covering orientation through terminal return.]

## 9. Owner-only actions already authorized
[Explicitly `none`, or an exact list of already-authorized credentials, browser-bound actions,
payments, destructive actions, public actions, or other Owner-only acts.]

## 10. Executor and session preconditions
- Engineering Lead executor tier / reasoning requirement:
- fresh-session requirement:
- pre-Integration read-scope boundary:
- other governed execution preconditions:

## 11. Stop and return
Run only this checkpoint. For a valid run, return exactly one form-7 Return Packet with `PASS`,
`BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED`. Stop all checkpoint work before returning. Do not
inspect, plan, scaffold, branch for, or begin a later checkpoint.

If this brief is invalid, return form 10 as `BRIEF_INVALID` before an execution clock, workbench,
branch or equivalent execution workspace, candidate, Builder/Critic context, verdict, evidence
identity, or edit exists. Do not produce a Return Packet.
````

## Validation rule

All eleven fields are mandatory. The brief is invalid if it is missing, ambiguous, contradictory,
names more than one target or checkpoint, lacks the complete bar, exact anchor, complete profile,
or numeric ceiling, or conflicts with higher-order ratified governance. The Lead lists **every**
defect in one form-10 return.

After a valid brief, the first observable execution output is `started_at_utc` plus verified actual
workspace/repository, exact starting version, modification, environment/data, and profile-resource
state. For Git, include branch, full HEAD, working tree, and topology. This contract does not
prescribe a timestamp-acquisition mechanism; the adopting implementation must choose and validate
one without representing it as a ratified rule.

The Orchestrator MUST NOT use this form to choose architecture, libraries, file layout,
decomposition, Builder count, internal budgets, implementation steps, or a fixed review-round
count. Reducing the bar requires an Owner-ratified replacement anchor and a new brief.
