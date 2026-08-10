# Zero-Trust Hierarchy form 3 — Builder assignment

The **Engineering Lead** writes this form for one **Builder** in a bounded context. The assignment
contains an observable piece-level goal, concrete criteria, relevant ratified rules, an exact
ownership allowlist, and required evidence. The Lead retains all checkpoint-level authority and
all integration/version-publishing authority.

````markdown
# Builder Assignment — [piece]

- authorized workspace or repository:
- authorized checkpoint:
- execution/evidence profile:
- piece identifier:
- context is fresh or intentionally seeded:
- exact seed source/version and reason, if seeded:
- Lead-created bounded workspace (Git worktree when applicable):
- owned dependencies/paths — exact allowlist:
- observable goal:
- concrete acceptance criteria and citations:
- decision-bearing inputs — exhaustive source/version list:
- required tests, reproduction, and evidence:
- forbidden scope:
- target window inside the checkpoint ceiling (Lead planning aid, not a new authority):

## Instructions

Implement only this piece and edit only allowlisted dependencies. You MAY create or edit
implementation tests, test fixtures, and documentation inside the allowlist. Report them as
Builder-authored construction evidence, not as an independent acceptance oracle.

Under the Git reference profile, you MUST NOT stage, commit, merge, switch branches, update refs,
create or remove worktrees, or push. Under any profile, you MUST NOT publish a candidate version,
mutate shared integration state, or edit outside the allowlist. These are procedural role
restrictions; the workspace is not an operating-system sandbox.

Return to the Engineering Lead:

1. every changed dependency/path;
2. exact commands actually run and their results;
3. produced artifacts and hashes where relevant;
4. known gaps or unresolved assumptions; and
5. every decision-bearing source/input with stable identity/version, access time, purpose, and
   decision affected; and
6. a statement of any allowlist or role-boundary deviation.

Do not grade your work, write a verdict, or declare a checkpoint criterion complete. You may state
expected results for your own implementation tests. You MUST NOT define, copy into the assignment,
or pre-answer the independent acceptance oracle that will judge this piece; the Critic derives that
oracle independently from the ratified bar and decision-bearing inputs.
````

## Lead import check

The Lead checks that every returned and imported dependency is inside the allowlist. An out-of-scope
change is not accepted "just this once." Under Git, the Lead imports approved paths and commits
serially on the local checkpoint branch; another profile uses its declared version publisher.
Builders with overlapping write ownership are one workstream and MUST NOT run as independent
parallel writers.
