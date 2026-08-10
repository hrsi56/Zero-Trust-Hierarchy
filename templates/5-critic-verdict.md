# Zero-Trust Hierarchy form 5 — Critic verdict

A component or Integration **Critic** completes this verdict record after reviewing one exact
immutable or uniquely versioned candidate. The execution authority durably versions it under the
declared evidence profile only after review, so recording the verdict does not alter the candidate
identity it judged. Under the Git reference profile, the Engineering Lead commits this plain
Markdown form under the authorized evidence path after review.

````markdown
# Critic Verdict — [piece, surface, or Integration] — round [n]

- status: PASS | FAIL | BLOCKED
- authorized checkpoint:
- execution/evidence profile:
- review type: component | mandatory surface | Integration
- exact candidate identity / Git full candidate SHA:
- candidate identity before and after review:
- review workspace unchanged; Git worktree clean before and after review: yes / no
- controlling plan: [file/document] · [exact version] · [bar citation]
- bar excerpt, verified verbatim in the controlling plan version:

  > [exact text]

- artifact:
- decision-bearing provenance: [complete table below]
- reviewed dependencies: [every versioned input the conclusion depends on]
- Git reviewed_paths: [every repository path the conclusion depends on, or NOT_APPLICABLE — non-Git]
- context boundary: COOPERATIVE_PROCEDURAL — fresh-context/read-only/no-Builder-narrative, or
  [exact deviation]
- blind comparison, if applicable: COOPERATIVE_PROCEDURAL | NOT_APPLICABLE

## What I inspected
- [exact files, data, outputs, or rendered surfaces]

## Decision-bearing provenance
| Source/input | Stable identity/version/hash | Accessed_at_utc | Supplied by | Purpose | Decision or claim affected |
|---|---|---|---|---|---|

Use an explicit `none beyond the bar and candidate` row when true. Do not omit supplied expected
values, external references, datasets, prompts, or tool outputs.

## Commands actually run
```text
[command] -> exit [n]
[observed output, result summary, or path plus SHA-256 for a large/restricted artifact]
```

## Expected results and tolerances
| Command / criterion | Expected result | Tolerance |
|---|---|---|

## Independent oracle derivation
- Builder-authored tests run as additional evidence: none / [commands]
- independently derived fixture/input:
- independently derived expected result and derivation:
- separation from Builder-authored expectations:

## Bar comparison
| Criterion and exact citation | Direct evidence | Result: PASS / FAIL / BLOCKED |
|---|---|---|

## Largest remaining gap
[Exactly one highest-impact gap. On PASS write: `None — bar met`. Never omit this field.]

## Exact next acceptance test
[Observable condition that would close the gap. On PASS write: `None — bar met`.]

## Non-blocking observations
- [optional; do not turn this into an unprioritized finding list]
````

`BLOCKED` means the review could not be performed, not that the artifact failed a criterion. `FAIL`
routes the single largest meaningful gap back to a Builder; a later review uses a fresh Critic
context. The human does not relay repair messages.

Reviewed dependencies are the soundness boundary for verdict reuse. They must cover every versioned
input on which the conclusion depends. Under Git, `reviewed_paths` must include every repository
path dependency. A verdict becomes stale when its candidate falls outside the declared valid
lineage or any reviewed dependency changes; Git computes those conditions with ancestry and path
diff.

## Invalid verdict conditions

A verdict is invalid if it:

- omits its exact candidate identity, exact plan/version/bar citation, verified verbatim excerpt,
  commands, expected results/tolerances, observed results, decision-bearing provenance, reviewed
  dependencies, largest gap, or next acceptance test;
- omits the explicit `None — bar met` entry on PASS;
- reviewed a mutable/unversioned candidate, changed candidate identity, or violated its declared
  review-workspace conditions;
- cannot verify the bar excerpt in the cited plan version;
- conceals a fresh-context, read-only, narrative-withholding, or blinding deviation; or
- cites a candidate identity that is not independently resolvable under the declared profile.
