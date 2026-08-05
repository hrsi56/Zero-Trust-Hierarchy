# Checkpoint-Oriented Gauntlet Hierarchy

**How to run a Gauntlet Loop when the bar is a ratified plan, not a screenshot.**

Read the write-up: **<https://hrsi56.github.io/gauntlet-hierarchy/>**

---

Matt Shumer's [Gauntlet Loop](https://somethingbig.ai/gauntlet-loop) is the best short description
of how to get real quality out of an agent: give it a bar it can't talk its way around, let it split
the work, and never let the builder grade itself.

It leaves three questions open, and a long engineering program runs into all three on day one:

1. **Who decides when a loop starts, and when it is over?** An agent that picks its own next
   objective will always pick one it can reach.
2. **What is the bar when there is no screenshot?** On a research or data project the bar is prose
   in a versioned document. Prose can be reinterpreted. A screenshot cannot.
3. **What survives the run?** A verdict that lives in a chat transcript is not evidence a month
   later, and it certainly is not evidence to anyone else.

This repository is the answer I ended up with while building a probabilistic day-ahead electricity
price forecaster across five checkpoints: **a two-level authority split with a Gauntlet Loop inside
the lower level.** The loop is Shumer's. The hierarchy around it, and the evidence contract that
makes a document usable as a bar, are the parts I had to build.

## The shape

```
        Orchestrator          decides WHEN, which single checkpoint, and one time ceiling.
             │                Owns program state. Never looks inside the loop.
             │  one brief
             ▼
          [ human ]           carries exactly two messages, and routes nothing
             │
             ▼
      Engineering Lead        decides HOW. Decomposition, parallelism, agent count,
             │                repair routing. Sole Git writer.
   ┌─────────┼─────────┐
   ▼         ▼         ▼
Builder   Builder   Builder   isolated worktrees, disjoint path allowlists,
   │         │         │      no Git access at all
   └────► integrate ◄──┘      Lead imports allowlisted paths, commits serially
             │
             ▼
       fresh Critic           clean detached worktree at the candidate SHA.
             │                Gets the artifact, never the builder's story.
             │                FAIL routes straight back to a Builder.
             ▼
    fresh Integration Critic  new clean worktree at the final SHA
             │
             ▼
      Return Packet           one artifact upward, then a hard stop
             │
             ▼
        Orchestrator
```

## The rules that carry the weight

1. **Separate WHEN from HOW.** The brief states one repository, one checkpoint, one plan anchor, one
   observable goal, and one numeric time ceiling. It never states decomposition, file layout, agent
   count, or a fixed number of review rounds.
2. **An invalid brief is returned before any edit.** Missing anchor, missing checklist citation,
   missing ceiling, more than one checkpoint — stop and return the discrepancy.
3. **Verify the state; never trust the brief's description of it.** Branch, commit, working tree,
   environment, artifacts. A material mismatch is reported, not silently reconciled.
4. **Make the bar checkable.** The Critic brief carries the plan file, its version, the citation,
   and a **verbatim excerpt** — and the Critic must confirm that excerpt appears in that file at the
   candidate SHA. A citation the Critic cannot check against the real text is not a bar.
5. **Give the critic the artifact, never the story.** A clean `git worktree --detach` at the
   candidate SHA, created outside the builder's checkout. No uncommitted diff, no builder summary,
   no conversation history. Reviewing an uncommitted diff is invalid.
6. **One Git writer.** Builders never stage, commit, merge, switch branches, or update refs. They
   run in parallel only on disjoint path allowlists; the Lead imports exactly those paths and commits
   serially on a disposable branch.
7. **Verdicts are commits.** Markdown, committed *after* the review completes so that recording a
   review never changes the SHA it judged. Every verdict names the candidate SHA, the bar excerpt,
   the commands actually run with exit codes, **the single largest gap**, and **the exact next
   acceptance test**.
8. **Aim the criticism.** Pre-register the few surfaces where a failure would be silent and
   expensive, and require independent review there. On those, the Critic materializes and hashes its
   own fixtures outside the candidate checkout and computes the expected result itself — builder-
   authored tests do not count as evidence about the builder.
9. **Compute staleness; don't assume it.** Each verdict declares the paths its review actually
   covers. A `PASS` still binds if its candidate is an ancestor of the final candidate and
   `git diff --name-only <component-sha>..<final-sha> -- <reviewed-paths>` is empty. A repair that
   touches a reviewed path invalidates exactly that verdict; a repair elsewhere invalidates nothing.
   The alternative — rerun everything on every commit — makes a long loop unaffordable.
10. **One clock, four exits.** `consumed = terminal − start − eligible pauses`, measured as a single
    active elapsed wall clock; parallel contexts overlap and never sum. A run ends as `PASS`,
    `BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED`. Reaching the ceiling is a prioritization signal,
    never permission to weaken a criterion.
11. **Context is a control.** A role router decides which contract a session is under. The executor
    cannot read program state, so it cannot select its own next milestone — and no terminal status
    automatically opens the next checkpoint.
12. **Publication belongs to the human.** No agent pushes, and no agent commits to `main`.

## Templates

Eight boundary forms, generalized from the ones in use. Replace every bracketed field.

| | Form | Written by | Read by |
|---|---|---|---|
| 1 | [Checkpoint brief](templates/1-checkpoint-brief.md) | Orchestrator | Engineering Lead |
| 2 | [Active workbench](templates/2-workbench.md) | Engineering Lead | Engineering Lead only |
| 3 | [Builder assignment](templates/3-builder-assignment.md) | Engineering Lead | Builder |
| 4 | [Critic assignment](templates/4-critic-assignment.md) | Engineering Lead | Critic |
| 5 | [Critic verdict](templates/5-critic-verdict.md) | Critic | Engineering Lead, and the record |
| 6 | [Integration Critic](templates/6-integration-critic.md) | Engineering Lead | Integration Critic |
| 7 | [Return Packet](templates/7-return-packet.md) | Engineering Lead | Orchestrator |
| 8 | [Orchestrator receipt](templates/8-orchestrator-receipt.md) | Orchestrator | — |

## Status

The full write-up publishes after **CP-0**, the first checkpoint run under this contract. It will
report what the loop actually did — including whatever the first run proves wrong about the contract
itself — rather than only what the contract specifies.

## Credit and license

The Gauntlet Loop, and rules 4, 5 and 10's "let it keep going," are Matt Shumer's:
[How to Run a Gauntlet Loop](https://somethingbig.ai/gauntlet-loop). The hierarchy, the evidence
contract, and the staleness and clock rules are mine.

Prose and templates: [CC BY 4.0](LICENSE). Attribution: Yarden Viktor Dejorno.
