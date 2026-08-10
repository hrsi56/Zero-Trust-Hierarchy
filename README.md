# Zero-Trust Hierarchy

**No success claim promotes itself. A distributed verification system for agent work.**

Here, **zero-trust** is a method metaphor for refusing unsupported success claims—not a
cybersecurity threat model. Work moves through bounded authority tiers, and every boundary either
receives independently checkable evidence or labels the facts that remain procedural declarations
and human judgement.

Read the publication: **<https://hrsi56.github.io/gauntlet-hierarchy/>**

## What is here

- [The canonical article](article.md) explains the problem, hierarchy, evidence flow, human control
  points, termination model, parallel-track model, and a bootstrap payload.
- [The rulebook](RULEBOOK.md) is the complete generic operating contract.
- [The authority diagram](assets/zero-trust-hierarchy.svg) shows the governance loop, one execution
  track, and the same human acting at both control points.
- [Ten boundary forms](templates/1-checkpoint-brief.md) provide copy-pasteable briefs, assignments,
  verdicts, handoffs, receipts, disposition records, and invalid-brief returns.

## Build the publication

The canonical sources are `article.md`, `RULEBOOK.md`, and `templates/*.md`. With Python 3 and
Pandoc 3.6.4 available, run `python3 scripts/build.py` to generate the styled article, Rulebook,
forms index, and ten individual form pages. Run `python3 scripts/build.py --check` to verify that
all thirteen HTML artifacts are present, current, internally linked, script-free, and deterministic.

## When it is useful

Zero-Trust Hierarchy is designed for work that is long-running, consequential, or distributed
across several agent contexts—especially when acceptance depends on versioned prose rather than a
single visible output. It is useful when the person setting direction needs to delegate technical
execution without also delegating purpose, acceptance authority, publication authority, or the
decision to continue.

The method is intentionally heavier than ordinary collaboration. For a small, reversible task with
one executor, one reviewer, and an immediately observable result, a direct review is usually enough.
Do not add tiers, evidence records, or lifecycle machinery unless the cost of an unsupported success
claim justifies them.

## The core boundary

The Architect / Owner ratifies direction. The Orchestrator authorizes one bounded unit and later
checks its receipt. The Engineering Lead owns technical decomposition and serial integration. One
replaceable execution box receives a goal plus ratified bar and returns a reviewed artifact plus
durable Critic verdicts. The human then judges direction, disposition, and continuation. Technical
correctness does not promote itself into strategic correctness.

Fresh-context review, restricted reading, and role separation are cooperative controls unless the
environment independently enforces them. Exact Git candidates, committed Markdown verdicts,
reviewed paths, and computed staleness make the technical evidence inspectable after the chat ends.

## Status

This repository is the current generic reference publication: article, rulebook, diagram, and ten
forms. The method has been exercised on complex work and revised against reality, but it does not
claim operating-system or cryptographic isolation, and not every repair or terminal path has yet
been observed. The article states the evidence and remaining limits without identifying its source
project.

## Credit and license

The inner execution interface adapts ideas from Matt Shumer’s
[“How to Run a Gauntlet Loop”](https://somethingbig.ai/gauntlet-loop): a concrete bar, lead-directed
decomposition, separate fresh criticism of the artifact rather than the Builder’s narrative, and
iteration against the largest meaningful remaining gap. Zero-Trust Hierarchy is the surrounding
authority, evidence, receipt, human-control, and lifecycle system.

Prose, forms, presentation, and diagram assets are licensed under
[CC BY 4.0](LICENSE). Attribution: Yarden Viktor Dejorno.
