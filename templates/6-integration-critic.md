# Zero-Trust Hierarchy form 6 — Fresh Integration Critic

The **Engineering Lead** issues this form when artifact changes stop and designates the exact final
candidate identity. A fresh **Integration Critic** reviews the complete candidate from a new
declared review context at that exact version. Under the Git reference profile, these are
`final_candidate_sha` and a clean detached worktree. This is a cooperative fresh-context,
read-only, no-Builder-narrative review; the workspace is not an operating-system sandbox. The
evidence-tip identity does not yet exist: durably recording the completed Integration verdict
creates it later without changing the artifact the verdict judged.

````markdown
# Fresh Integration Critic — [checkpoint id]

## Candidate and bar
- authorized workspace or repository:
- authorized checkpoint:
- execution/evidence profile:
- final candidate identity / Git final_candidate_sha:
- Lead-created isolated review context / Git clean detached worktree:
- complete artifact:
- decision-bearing inputs / data snapshot / cutoff: [complete provenance table below]
- controlling plan: [file/document] · [exact version] · [complete checklist citation]
- complete checkpoint bar and verbatim supporting excerpt:

  > [exact text verified in the independently resolvable controlling plan version; under Git, the
  > file at final_candidate_sha]

- clean reproduction commands:
- expected outputs and tolerances:

## Component verdicts relied on
| Piece / surface | Verdict record | Component candidate identity | Reviewed dependencies / Git reviewed_paths | Result |
|---|---|---|---|---|

## Decision-bearing provenance
| Source/input | Stable identity/version/hash | Accessed_at_utc | Supplied by | Purpose | Decision or claim affected |
|---|---|---|---|---|---|

## Mandatory surface applicability
| Surface / acceptance oracle | Applicable? | Reason | Verdict / direct evidence |
|---|---|---|---|

## Required checks

From this fresh context, verify:

1. every item in the complete named checklist against direct evidence;
2. every required component verdict exists, is durably versioned, is PASS, and is computed-current;
3. every component candidate is in the final candidate's valid lineage under the declared profile;
4. no reviewed dependency changed between each component candidate and the final candidate;
5. every declared reviewed dependency exists and resolves at the final candidate;
6. cross-component contracts and hard invariants;
7. metrics or outputs recomputed from fixed inputs where applicable, with independent oracle
   derivation rather than adoption of Builder-authored expectations;
8. clean-environment reproducibility and documentation consistency; and
9. absence of unauthorized later-checkpoint work.

Use only the artifact, exact bar, declared inputs, reproduction commands, and durably versioned
verdicts.
Do not request or inspect Builder checkouts, reasoning, summaries, conversations, or the Engineering
Lead's workbench. Do not edit, repair, or redesign.

Return form 5 as an Integration `PASS`, `FAIL`, or `BLOCKED`. Record complete decision-bearing
provenance, reviewed dependencies (`reviewed_paths` for Git paths), independent oracle derivation,
commands and tolerances, and one explicit largest remaining gap. On PASS write `None — bar met`.
````

## Computed staleness

For each relied-on component verdict, apply the declared lineage and dependency-change query. Under
the Git reference profile, run:

```text
git merge-base --is-ancestor <component_sha> <final_candidate_sha>
git diff --name-only <component_sha>..<final_candidate_sha> -- <reviewed_paths>
```

The ancestry command must succeed and the path-diff command must return no paths. A non-Git profile
must record equivalent results. If either check fails, that verdict is stale. Rerun exactly the
affected Critic; do not discard computed-current verdicts merely because another version exists.

An Integration `FAIL` re-enters the repair loop. Any repair creates a new candidate, selectively
stales component verdicts by the same rule, and requires a fresh Integration review. Technical
PASS requires the complete bar, all applicable mandatory independent checks, and a current fresh
Integration PASS. It does not grant Orchestrator receipt, Owner disposition, landing, lifecycle
closure, publication, or continuation.
