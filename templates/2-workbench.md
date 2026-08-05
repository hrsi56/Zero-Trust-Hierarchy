# 2 — Active workbench

Written and read by the **Engineering Lead only**. Created after a valid brief arrives, and only
while that checkpoint is active.

This file is operational visibility — not program state, not acceptance authority, not an audit log.
Keep it Git-ignored. It never enters a candidate commit, never enters a Critic worktree, the
Orchestrator never reads it, and the human never carries anything from it upward.

At terminal return: freeze a renamed snapshot only if it holds unique evidence, otherwise delete it.
Never carry it into the next checkpoint.

```markdown
# Active Workbench — [checkpoint id]

Plan anchor:
Candidate branch / full commit SHA:
Checkpoint active-elapsed ceiling:
started_at_utc / last_updated_at_utc:
Consumed active elapsed: [raw seconds / decimal hours]

## Eligible pause ledger
| paused_at_utc | resumed_at_utc | seconds | reason / evidence | all contexts stopped? |
|---|---|---:|---|---|

## Authorized goal and bar
- criterion → evidence required

## Lead-chosen pieces
| Piece | Owned paths | Builder worktree | Integration SHA | Critic verdict | Largest open gap |
|---|---|---|---|---|---|

## Mandatory independent surfaces in scope
| Surface | Applicable? | Verdict file |
|---|---|---|
| [pre-registered surface 1] | | |
| [pre-registered surface 2] | | |
| [pre-registered surface 3] | | |

## Independent acceptance-oracle pack (when its checkpoint is active)
| Oracle | Independent fixture | Independent expected result | Critic commands / verdict |
|---|---|---|---|
| [O1 — adversarial condition] | | [the result computed independently of the builder] | |
| [O2 — adversarial condition] | | | |

## Integration
- final candidate SHA:
- reproduction commands:
- Integration verdict file:

## Exact blocker, if terminal
- none / exact owner or authority request
```

## Notes

- Record raw seconds and preserve them for enforcement; show decimal hours only as a convenience.
- A pause is eligible only while **all** Lead, Builder, Critic, Integration, test, and tool activity
  is stopped for an already-authorized external dependency or a platform suspension. A newly
  required credential, source, or authority is a terminal `BLOCKED`, not an open-ended pause.
- The oracle table is mandatory where the plan defines one, not illustrative. The independent-fixture
  requirement is the whole point: a fixture the builder wrote proves nothing about the builder.
