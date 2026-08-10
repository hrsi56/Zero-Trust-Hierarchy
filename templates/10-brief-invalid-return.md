# Zero-Trust Hierarchy form 10 — Invalid brief return

The **Engineering Lead** returns this minimal form when the checkpoint brief is invalid. It is
`BRIEF_INVALID`, not a form-7 Return Packet and not an execution terminal produced by consuming the
checkpoint ceiling.

Validation occurs before the execution clock, active workbench, branch or equivalent execution
workspace, candidate, Builder/Critic context, verdict, evidence identity, or project edit. List
every defect in one return so the Orchestrator can issue one corrected brief.

````markdown
# Invalid Brief Return — [brief identity]

- status: BRIEF_INVALID
- brief_received_at_utc: [administrative validation timestamp; not execution time]
- validation_started_at_utc: [administrative validation timestamp; not execution time]
- returned_at_utc: [administrative validation-return timestamp; not execution time]
- started_at_utc: NOT_STARTED
- terminal_at_utc: NOT_APPLICABLE — no execution began
- consumed active elapsed: 0 — execution clock NOT_STARTED
- execution started: no
- execution clock started: no
- workbench created: no
- candidate branch or equivalent execution workspace created: no
- Builder or Critic context created: no
- candidate identity created: no
- verdict created: no
- evidence identity created: no
- project files edited: no
- Return Packet created: no

## Read-only facts checked for validation
- supplied target workspace/repository identity / availability:
- supplied checkpoint count:
- supplied anchor identity and consistency with the exact plan named in the brief:
- relevant higher-order governance conflict, if any:
- other actual facts used to establish invalidity:

## Eleven-field validation
| # | Required field | Present and unambiguous? | Defect |
|---:|---|---|---|
| 1 | Target workspace or repository — exactly one | | |
| 2 | Authorized checkpoint — exactly one | | |
| 3 | Exact ratified plan anchor | | |
| 4 | Orchestrator-reported expected state | | |
| 5 | Observable goal | | |
| 6 | Complete checklist citation and faithful verbatim supporting extract | | |
| 7 | Relevant constraints and complete execution/evidence profile | | |
| 8 | Numeric active-elapsed ceiling | | |
| 9 | Owner-only actions already authorized, including explicit `none` | | |
| 10 | Executor tier, reasoning requirement, and new-session/read-scope preconditions | | |
| 11 | Stop and return instruction | | |

## All invalidating defects
1. [Every missing, ambiguous, contradictory, multi-target, multi-checkpoint, or governance-
   conflicting condition.]

## Exact replacement required
[Smallest exact correction the Orchestrator must make. A reduced bar first requires an
Owner-ratified replacement anchor.]

The three administrative timestamps above describe brief validation only. They do not satisfy or
trigger the valid run's first-observable-output rule. No execution artifact was created, no
execution work was performed, and no later checkpoint was inspected or begun.
````

After correction, the Orchestrator issues a new complete form-1 brief. The invalid brief does not
carry partial authority forward, reserve a branch, start the ceiling, or authorize a later unit.
