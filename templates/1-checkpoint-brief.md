# 1 — Checkpoint brief

Written by the **Orchestrator**, carried by the human, read by the **Engineering Lead**.

One repository, one checkpoint, one plan anchor, one ceiling. A brief missing the anchor, the
complete checklist citation, or the numeric ceiling — or naming more than one repository or
checkpoint — is invalid and is returned before any file is edited.

Never infer an anchor from the highest version number on disk.

```markdown
# Checkpoint Brief — [checkpoint id]

Target repository: [absolute path or unambiguous repo name]
Authorized checkpoint: [exactly one]
Ratified plan anchor: [exact filename and version, copied from the program state file]
Complete checkpoint checklist: [exact citation to the full named checklist]
Supporting sections: [exact citations needed for this checkpoint]
Total checkpoint active-elapsed ceiling: [numeric hours, orientation through terminal return]

## Orchestrator-reported expected state
- branch / commit / working-tree expectation
- completed predecessor and artifacts expected to exist
- data snapshot or cutoff expected

The Engineering Lead must verify this against the repository before relying on it. A material
mismatch is returned, not silently reconciled.

## Observable outcome
[The state that must exist when this checkpoint closes.]

## Complete authoritative checkpoint bar
- [every item in the named checklist, with citation]

## Task-specific supporting extract
- [supporting citation]: [faithful outcome-level statement]

The complete named checklist remains controlling even if this extract omits an item. An extract
may not weaken, strengthen, or replace it.

## Applicable constraints
- [ratified architecture, data, and method constraints]
- [budget ceiling]
- [hardware envelope]

## Blind-comparison outcome (include only when a blind comparison is in scope)
- Scientific bar — the Blind Critic recomputes and never adjudicates; a fresh Integration context
  performs identification afterwards and must match the committed selection declaration:
  [citation + verbatim excerpt]
- Metric, eligibility, and tie-break authority: [citation + verbatim excerpt]
- Blinding is procedural: the Lead withholds the mapping and reveals only after the Blind verdict
  is written. Label the run COOPERATIVE_PROCEDURAL. Never describe it as cryptographically
  enforced.

## Owner-only actions already authorized
- none / [credential, signup, browser-bound action, payment, publication]

## Stop and return
Run the bounded Gauntlet autonomously under the execution contract. Return exactly one Return
Packet with PASS, BLOCKED, PLATEAU, or BUDGET_EXHAUSTED. Stop all work before any later
checkpoint. Do not inspect, plan, or begin it.
```

## Notes

- The Orchestrator supplies the **what** and the ceiling. It does not supply modules, file layout,
  decomposition, agent count, internal workstream budgets, implementation steps, or a fixed number
  of review rounds.
- A brief cannot reduce a bar. That requires an owner-ratified amendment to the plan and a new exact
  anchor, and only then a replacement brief.
- A standalone advisory brief authorizes only its stated advisory outcome. It cannot open or close a
  checkpoint.
