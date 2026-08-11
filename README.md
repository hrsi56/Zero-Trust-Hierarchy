# Zero-Trust Hierarchy

**No success claim promotes itself. A distributed verification system for agent work.**

### ▶ [Try the live Gauntlet Builder](https://hrsi56.github.io/Zero-Trust-Hierarchy/builder/)

It runs entirely in your browser and compiles thirteen stage-specific prompts for an agent you run
yourself — no account, no API key, and no project data leaves the page.

**[Read the publication](https://hrsi56.github.io/Zero-Trust-Hierarchy/)** ·
**[Source](https://github.com/hrsi56/Zero-Trust-Hierarchy)** ·
[Article](article.md) · [Rulebook](RULEBOOK.md) · [Forms](templates/1-checkpoint-brief.md)

## What this is

Two things, in one repository.

**An AI-reliability framework.** Work moves through bounded authority tiers, and every boundary
either receives independently checkable evidence or labels the facts that remain procedural
declarations and human judgement. The question is not “Do we trust this agent?” It is “What must be
true before this claim is allowed to change anything above it?”

**A working local-first prompt and workflow compiler.** The [Gauntlet Builder](builder/index.html)
turns the method into a guided sequence of generated prompts for your own project. It is a static
browser application: your answers stay in `localStorage`, export and import are the only ways data
moves, and its Content-Security-Policy sets `connect-src 'none'`.

The core mechanics:

- **Thirteen Builder stages** — orientation, capstone, ratification, roadmap, roles, rulebook,
  source-of-truth map, forms, bootstrap and fit check, orchestrator initialization, first execution,
  return and disposition, and scaling. One compiled prompt per stage, in journey order.
- **Ten boundary forms** — checkpoint brief, active workbench, Builder assignment, Component Critic
  assignment, Critic verdict, fresh Integration Critic, consolidated return packet, Orchestrator
  receipt, landing/disposition/evidence/reclamation, and invalid-brief return.
- **Independent review roles** — a Component Critic reviews one bounded piece in a fresh context
  against the real bar; a *different* fresh context reviews the whole candidate and the currency of
  the verdicts underneath it. Neither is the context that built the work.
- **Version-linked evidence** — a verdict names the exact revision it reviewed and the paths it
  depended on. Candidate ancestry and path-scoped change detection then decide which verdicts are
  still current and which must rerun. On PASS, the final candidate and the evidence tip are distinct
  revisions with an evidence-only delta between them.
- **Explicit human disposition** — technical PASS permits an Owner decision; it does not itself land
  the work, close the lifecycle, or authorize continuation. A prefilled disposition is invalid.

## What this is not

- **Not a cybersecurity implementation.** Here, *zero-trust* is a method metaphor for refusing
  unsupported success claims — not a network, identity, or infrastructure threat model. Nothing
  here claims operating-system or cryptographic isolation.
- **Not an AI model.** Nothing in this repository trains, serves, fine-tunes, or evaluates a model.
- **Not an orchestration backend.** There is no scheduler, runtime, agent framework, database, or
  API. The Builder never calls a model and never asks for a key; it composes text you hand to an
  agent yourself.
- **Not a guarantee against AI failure.** It does not stop an agent from being wrong. It decides
  where wrongness has to surface, who is qualified to judge it, and what a claim must carry before
  it changes anything. Fresh-context review, restricted reading, and role separation are cooperative
  controls unless the environment independently enforces them. There is no automatic ratification
  and no automatic repair route — a failed review returns to a human decision.

## Why this matters for data science

The failure this method targets — a result that certifies itself and then acquires consequences —
is a familiar one in modelling work, not only in agent work.

- **Separation between construction and independent evaluation.** The context that builds an
  artifact is never the context that judges it. The reviewer sees the artifact and the bar, not the
  builder’s narrative about it.
- **Protection against self-certification.** No Builder grades its own output, and no role may
  rewrite its own authority, lower its own bar, or widen its own scope. A metric reported by the
  process that optimized it is not evidence.
- **Version-bound evidence and stale-decision detection.** Every verdict is tied to an exact
  revision and a declared set of reviewed paths, so an approval cannot silently outlive the code or
  configuration it was about. If a covered path changes, that review is stale and reruns; if
  unrelated paths change, current evidence is retained.
- **Human acceptance before results affect a real system.** A technically supported result still
  has to pass a person who owns purpose. The Owner decides LAND or DISCARD, whether the result still
  serves the project, and whether work continues at all.

## Dogfooding

The framework has been dogfooded while developing
[delu-day-ahead-forecast](https://github.com/hrsi56/delu-day-ahead-forecast), a day-ahead
forecasting project in development. That project is the setting in which these boundaries, forms,
and evidence rules have been exercised on real modelling work — it is not offered as evidence of a
completed model, a production deployment, or demonstrated predictive performance.

## What is here

- [The canonical article](article.md) explains the problem, hierarchy, evidence flow, human control
  points, termination model, parallel-track model, and a bootstrap payload.
- [The rulebook](RULEBOOK.md) is the complete generic operating contract.
- [The authority diagram](assets/zero-trust-hierarchy.svg) shows the governance loop, one execution
  track, and the same human acting at both control points.
- [Ten boundary forms](templates/1-checkpoint-brief.md) provide copy-pasteable briefs, assignments,
  verdicts, handoffs, receipts, disposition records, and invalid-brief returns.
- [Gauntlet Builder](builder/index.html) is the official local-first guided implementation kit. It
  turns the method into thirteen stage-specific prompts without sending project data to a model.

## Build the publication

The canonical sources are `article.md`, `RULEBOOK.md`, and `templates/*.md`. With Python 3 and
Pandoc 3.6.4 available, run `python3 scripts/build.py` to generate the styled article, Rulebook,
forms index, and ten individual form pages. Run `python3 scripts/build.py --check` to verify that
all thirteen HTML artifacts are present, current, internally linked, script-free, and deterministic.
The Builder is a separate static application with no build step; run
`node builder/tests/validate.mjs` to validate its stage and prompt contracts.

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

This repository is the current generic reference publication: article, rulebook, diagram, ten
forms, and the Gauntlet Builder — the local-first thirteen-stage prompt compiler that turns the
method into an implementation path for a reader’s own project. The method has been exercised on
complex work and revised against reality, but it does not claim operating-system or cryptographic
isolation, and not every repair or terminal path has yet been observed. The article states the
evidence and remaining limits without identifying its source project.

## Credit and license

The inner execution interface adapts ideas from Matt Shumer’s
[“How to Run a Gauntlet Loop”](https://somethingbig.ai/gauntlet-loop): a concrete bar, lead-directed
decomposition, separate fresh criticism of the artifact rather than the Builder’s narrative, and
iteration against the largest meaningful remaining gap. Zero-Trust Hierarchy is the surrounding
authority, evidence, receipt, human-control, and lifecycle system.

Prose, forms, presentation, and diagram assets are licensed under
[CC BY 4.0](LICENSE). Attribution: Yarden Viktor Dejorno.
