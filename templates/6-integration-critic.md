# 6 — Fresh Integration Critic

Written by the **Engineering Lead** once the candidate stops changing. Read by a **fresh** Critic in
a new clean detached worktree at the **final** candidate SHA — a different worktree from any
component review.

Its job is to connect and align the pieces. It does not redesign.

```markdown
# Fresh Integration Critic — [checkpoint id]

Final candidate SHA / your worktree:
Controlling plan · version · complete checkpoint bar citation + verbatim excerpt:
Component verdict files relied on:
Clean reproduction commands / expected outputs:
Data snapshot / cutoff:

From this fresh context, verify:
1. every item in the complete named checklist against direct evidence;
2. every required component verdict exists, is PASS, and is computed-current — its candidate is an
   ancestor of the final candidate, and
   `git diff --name-only <component-sha>..<final-sha> -- <its reviewed paths>` is empty;
3. every declared reviewed path exists in the candidate tree;
4. cross-component contracts and hard invariants;
5. metrics recomputed from frozen outputs where applicable;
6. clean-environment reproducibility and documentation consistency;
7. absence of unauthorized later-checkpoint work.

When a blind comparison is in scope, additionally apply the identification rules after reveal and
confirm the adjudicated real winner equals the committed selection declaration. A mismatch is FAIL.

Return a form-5 verdict. Do not redesign.
```

## Computed staleness

This is the rule that makes a long loop affordable, so it is worth stating precisely.

A component `PASS` taken at an earlier candidate **still binds** if:

- that candidate is an **ancestor** of the final candidate, **and**
- `git diff --name-only <component-sha>..<final-sha> -- <reviewed_paths>` is **empty**.

A repair that touches a reviewed path makes exactly that verdict stale and reruns exactly that
Critic. A repair elsewhere reruns nothing.

The naïve alternative — every new commit invalidates every prior `PASS` — sounds safer and is
unusable: on a checkpoint with sixteen checklist items and three mandatory surfaces, every
integration commit forces a full re-review of all of them, and the loop never converges.

Integration binds the exact final SHA and tree. Each relied-on component `PASS` binds **its own**
SHA and tree, and must be computed-current against the final candidate. It need not equal it.

## Closing

An Integration `FAIL` re-enters the repair loop, and the repair invalidates only the component
verdicts whose reviewed paths it touched.

`PASS` requires every item in the complete named checklist, every applicable mandatory independent
check, and a current Integration `PASS`. Neither the Lead nor a Builder can self-certify closure.
