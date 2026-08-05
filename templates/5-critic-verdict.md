# 5 — Critic verdict

Written by the **Critic**. One markdown file, committed under
`docs/evidence/<checkpoint>/<piece>-<round>.md` on the checkpoint branch **after** the review is
complete — so the act of recording a review never alters the SHA that review judged.

The verdict cites the candidate SHA. That SHA plus the checkpoint branch is the entire provenance
chain. There is no separate evidence store to maintain.

````markdown
# Verdict — [piece] — round [n]

Status: PASS | FAIL | BLOCKED
Checkpoint: [checkpoint id]
Candidate SHA: [full sha]
Reviewed paths: [repo-relative paths this review actually covers]
Controlling plan: [file] · [version] · [bar citation]
Bar excerpt (verbatim, verified present at this SHA):
> [exact text]
Artifact: [path]
Worktree clean before and after review: yes/no

## What I inspected
- exact files, data, and pages

## Commands actually run
```text
[command]   → exit [n]
[observed output, or sha256sum of the output file]
```

## Bar comparison
| Criterion | Evidence | Result |
|---|---|---|

## Largest remaining gap
[one, high-impact — omit only on PASS]

## Exact next acceptance test
[the observable condition that would close it]

## Non-blocking observations
- [optional]
````

## Notes

- **`BLOCKED` means the check could not be performed** — a missing token, an unavailable API. It is
  never a substitute for `FAIL`.
- **One gap, not a list.** A verdict that returns fifteen findings returns no priority. Name the
  single largest meaningful gap and the exact test that would close it; the next round surfaces the
  next one.
- **`Reviewed paths` is the soundness condition of the staleness rule.** Declare them honestly and
  broadly enough to cover what the verdict actually depends on. Understating them is the one way to
  make verdict reuse unsound.
- Reproduction artifacts too large or too restricted to commit are represented by their path and a
  `sha256sum` line, not by the raw data.

## What invalidates a verdict

- it omits its candidate SHA, plan or bar citation, verbatim bar excerpt, the commands actually run,
  the largest gap, or the next acceptance test;
- the bar excerpt does not appear in the cited plan at that SHA;
- the review was performed on an unclean worktree, or on an uncommitted diff;
- the cited candidate SHA is no longer reachable on the checkpoint branch.
