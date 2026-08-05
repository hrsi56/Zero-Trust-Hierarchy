# 7 — Consolidated Return Packet

Written by the **Engineering Lead**, carried by the human, read by the **Orchestrator**.

This is the **sole** upward artifact. One packet per checkpoint. Before returning it, confirm every
cited candidate SHA is still reachable on the checkpoint branch and every cited verdict file exists.

Then stop. Do not inspect, research, scaffold, branch for, or plan the next checkpoint.

```markdown
# Checkpoint Return — [checkpoint id]

Status: PASS | BLOCKED | PLATEAU | BUDGET_EXHAUSTED
Target repository / ratified plan anchor:
Final candidate commit / branch:
Working-tree state:
Data snapshot / cutoff / hash:
Checkpoint active-elapsed ceiling:
started_at_utc / terminal_at_utc:
Eligible pause ledger (UTC, reason, all contexts stopped):
Consumed active elapsed: [raw seconds / decimal hours]
Integration verdict: PASS | FAIL | NOT_RUN — [verdict file, or the exact terminal reason]

## Verdicts
| Piece / surface | Candidate SHA | Reviewed paths | Verdict file | Result | Largest gap and disposition |
|---|---|---|---|---|---|

## Blind-comparison chain (only when one was in scope)
Blindness: COOPERATIVE_PROCEDURAL — the Lead withheld the mapping; not cryptographically enforced.
| Attempt | Mapping withheld until | Blind verdict | Reveal time | Adjudicated winner | Matches committed declaration? |
|---|---|---|---|---|---|

## Complete named checklist
| Criterion citation | PASS / OPEN | Direct evidence and reproduction |
|---|---|---|

## Engineering decisions
- decision and rationale
- rejected alternatives, and why
- the largest failure the Gauntlet uncovered, and how it was repaired

## Reproduction
- exact commands · artifacts · metrics or screenshots

## Open risks or exact owner action
- none / exact request

## Defense questions
1. [3–5, grounded in the actual architecture, tradeoffs, and evidence]

Work has stopped. No later-checkpoint work has begun.
```

## The four terminal statuses

| Status | Meaning |
|---|---|
| `PASS` | Every checklist item, every applicable mandatory independent check, and a current fresh Integration `PASS`. |
| `BLOCKED` | An owner credential or action, new authority, a ratified-methodology change, a destructive or public action, a missing or untestable bar, or a plan-versus-reality contradiction is required. |
| `PLATEAU` | The next improvement is not worth its cost, or two material repair attempts produced no meaningful improvement. |
| `BUDGET_EXHAUSTED` | The active-elapsed ceiling was reached before `PASS`. |

Never report partial work as `PASS`. A non-`PASS` return preserves its evidence and states the
smallest exact decision, authority, or resource change needed. No terminal status automatically
opens the next checkpoint.

## Why defense questions

Autonomy should not cost the owner their understanding of their own system. The packet carries three
to five questions grounded in the real architecture and evidence that the owner should be able to
answer — so the human is not a message carrier between agents, but also does not end up holding a
codebase they cannot defend.
