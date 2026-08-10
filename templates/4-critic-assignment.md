# Zero-Trust Hierarchy form 4 — Component Critic assignment

The **Engineering Lead** writes this form after freezing an immutable or uniquely versioned
candidate. A **component Critic** reviews the real artifact in a fresh cooperative context at that
exact candidate identity. Under the Git reference profile, the candidate is committed and reviewed
in a clean detached worktree at its full SHA.

Git reference-profile checkout:

```text
git worktree add --detach ../critic-<piece> <full_candidate_sha>
git -C ../critic-<piece> status --porcelain
```

The status output must be empty. A non-Git profile must provide its declared equivalent identity,
immutability, and review-workspace checks. Reviewing a mutable or unversioned artifact is invalid.

````markdown
# Component Critic Assignment — [piece or mandatory surface]

- authorized workspace or repository:
- authorized checkpoint:
- execution/evidence profile:
- piece or surface:
- exact candidate identity / Git full candidate SHA:
- isolated review workspace / Git clean detached worktree:
- artifact path:
- decision-bearing inputs and provenance:

| Source/input | Stable identity/version/hash | Supplied by | Access method | Why decision-bearing |
|---|---|---|---|---|
- controlling plan: [file/document] · [exact version] · [bar citation]
- verbatim bar excerpt, to be verified in that independently resolvable plan version and bound in
  the verdict to this candidate identity:

  > [exact text]

- exact reproduction commands:
- bar-supplied result and tolerance for each command:
- expected reviewed dependencies, which the Critic must correct honestly (Git paths go in
  `reviewed_paths`):
- independent fixture/oracle requirement, including what the Critic must derive independently:

## Procedural context declaration

This is a fresh-context, read-only, no-Builder-narrative review under cooperative procedural
controls. You receive the versioned artifact and acceptance bar, not the Builder's checkout, diff,
reasoning, summary, conversation history, or the Engineering Lead's workbench. You MUST NOT inspect
a Builder workspace, edit or repair the candidate, or redesign the project. An ordinary detached
review workspace is not an operating-system or cryptographic sandbox.

## Review instruction

Confirm the exact candidate identity and unchanged review workspace. Confirm the verbatim excerpt
appears in the cited immutable/unique plan version; under Git, confirm the file at the candidate
SHA. Inspect and rerun the real artifact. You MAY run Builder-authored
tests as additional evidence, but independently derive every mandatory oracle fixture and expected
result from the ratified bar and independently identified inputs. Materialize independent fixtures
outside the candidate workspace when required. Before writing the verdict, reconfirm the same
candidate identity and unchanged workspace.

Return form 5 with `PASS`, `FAIL`, or `BLOCKED`. Record exhaustive decision-bearing provenance,
actual reviewed dependencies (`reviewed_paths` for Git paths), oracle derivation, commands,
observed results, and one explicit largest remaining gap. On PASS write `None — bar met`; never
omit the field. Do not accept a claim that you cannot reproduce from the artifact.
````

A comparison is called blind only if the relevant identity mapping was withheld until the verdict
was written. Label such a comparison `COOPERATIVE_PROCEDURAL`; do not claim cryptographic
enforcement.
