# 3 — Builder assignment

Written by the **Engineering Lead**, read by a **Builder** in a fresh bounded context.

Give the Builder an observable goal, a concrete bar, the relevant ratified rules, a disjoint path
allowlist, and the evidence it must return. Nothing else — not the program plan, not the other
builders' work, not the checkpoint's full checklist.

Parallelize only disjoint ownership. Two Builders that can touch the same path are one Builder.

```markdown
# Builder assignment — [piece]

Authorized checkpoint:
Your worktree (Lead-created, writable):
Owned paths (exact allowlist):
Observable goal:
Concrete acceptance bar:
Relevant ratified rules / citations:
Required tests / reproduction / evidence:
Forbidden scope:
Target window within the checkpoint ceiling (Lead-set, non-authoritative):

Implement only this piece and edit only the allowlisted paths. Do not stage, commit, merge,
switch branches, update refs, or manage worktrees. Return the changed-path list, exact
reproduction commands, evidence, and known gaps to the Engineering Lead. The Lead alone imports
those paths and commits serially on the checkpoint branch. Do not grade your own work, write a
verdict, or mark any checklist item complete.
```

## Notes

- The Lead creates the worktree; the Builder never manages one.
- The Builder has no Git write access of any kind. This is what makes parallelism safe: there is no
  shared index to race on.
- On import, the Lead verifies that the staged path set **equals** the allowlist. A Builder that
  returned a path outside its allowlist gets that path dropped, not merged "just this once."
- The Builder never writes the expected output of an acceptance oracle that judges its own work.
