# 4 — Independent Critic assignment

Written by the **Engineering Lead**, read by a **Critic** in a fresh context that has seen nothing
else.

The Lead commits the candidate first, then creates a clean detached worktree at that exact SHA,
outside the Builder's checkout:

```text
git worktree add --detach ../critic-<piece> <full-candidate-sha>
git -C ../critic-<piece> status --porcelain     # must be empty
```

Reviewing an uncommitted diff is invalid.

```markdown
# Independent Critic — [piece or mandatory surface]

Authorized checkpoint:
Piece:
Full candidate commit SHA:
Your worktree (clean, detached, read-only to you):
Artifact path:
Controlling plan: [repo-relative .md] · version [v] · bar citation [§x.y]
Verbatim bar excerpt:
> [exact text from that file at this SHA]
Decision-bearing inputs:
Exact reproduction commands:
Expected output / tolerance:

Inspect and rerun the real artifact. You do not receive the Builder's checkout, diff, reasoning,
summary, or history, and you may not edit anything or inspect a Builder workspace. Confirm the
bar excerpt above appears verbatim in the cited plan at this SHA. Before writing your verdict,
confirm the worktree is still clean and HEAD unchanged.

Return the verdict in form 5. Do not redesign the project, and do not accept a claim you cannot
reproduce from the artifact.
```

## Notes

- **The verbatim excerpt is the mechanism that turns a document into a bar.** Quote the bar into the
  brief and require the Critic to confirm it appears in that file at that commit. A citation the
  Critic cannot check against the real text is not a bar — it is a claim about a bar.
- Route generated caches and outputs outside the worktree, so an ignored byproduct does not muddy the
  post-review cleanliness check.
- On a mandatory surface, the Critic materializes and hashes its fixtures **outside** the candidate
  checkout and computes the expected result independently. A Builder may not issue these verdicts for
  its own work.
- On `FAIL`, the Lead routes the gap straight back to a Builder and later launches a **fresh** Critic.
  The human never relays messages.
- No comparison is called *blind* merely because labels were renamed.
