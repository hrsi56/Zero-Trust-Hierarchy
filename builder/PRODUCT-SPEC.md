# Gauntlet Builder — product & design record

Gauntlet Builder is a standalone, static, offline prompt compiler that walks a human through
constructing a Zero-Trust Hierarchy operating system for their own project, one generated prompt
at a time. It lives entirely under `builder/` and does not modify anything else in this
repository. This document is the design record for a future maintainer or article-integration
agent — not marketing copy.

## 1. What this is not

- Not an AI chatbot. It never calls a model, never holds an API key, never asks for one.
- Not a backend service. There is no server, no account, no database.
- Not a place to paste project artifacts. It never asks for a Capstone, a rulebook, a roadmap, a
  source file, or an agent's output. It only asks the human for judgment calls and, optionally, a
  repository-relative path string.
- Not a replacement for reading the method. It is a guided on-ramp; the "How to do this yourself"
  layer in every stage exists so an experienced practitioner can go straight to the source
  (`article.md`, `RULEBOOK.md`, `templates/*.md`) and never need the site at all.

The core loop: **human answers a few grounded questions → the browser compiles a prompt locally →
the human hands that prompt to an AI agent they run themselves → that agent inspects the real
project and does the work → the human reviews and records a disposition → the next prompt is
compiled from the accumulated decisions.**

## 2. Verified method summary (what the source repository actually says)

This section separates three things, as required by the brief that produced this feature:

1. **Directly supported by the repository's operating method** (`article.md`, `RULEBOOK.md`, the
   ten `templates/*.md` forms).
2. **Originated in or adapted from the Gauntlet Loop** (Matt Shumer,
   [somethingbig.ai/gauntlet-loop](https://somethingbig.ai/gauntlet-loop)).
3. **Product design proposed by this guide** — not literally present in the source text.

Every stage module's `methodProvenance` field repeats this same three-way split for its own
content, so nothing in the app claims false authority.

### Roles (verified — RULEBOOK.md §2)

Six roles, no more: **Architect / Owner** (the human — owns purpose, ratification, disposition,
mainline, publication, continuation), **Orchestrator** (owns WHAT/WHEN/WHERE, one checkpoint, its
ceiling, and the receipt gate — never HOW, never a second technical review), **Engineering Lead**
(owns HOW — decomposition, Builder assignments, sole integrator, one terminal Return Packet),
**Builder** (implements one bounded piece, never self-certifies), **Component Critic** (fresh
context, reviews one piece against the bar), **Integration Critic** (a *different* fresh context,
reviews the whole candidate plus verdict currency). The human's Owner hat (before execution) and
courier/development-management hat (after a bounded return) are **the same person**, not a
seventh role — this repository is explicit that automating the courier's transport role would not
remove either control point. This guide deliberately does not invent a "Development Manager" or
any other tier, per the same instruction that produced this feature.

### The checkpoint brief (verified — RULEBOOK.md §5, `templates/1-checkpoint-brief.md`)

Eleven mandatory fields; missing or ambiguous on any one of them returns `BRIEF_INVALID` *before*
any file edit, clock start, or workspace is created. Stage 10 (Orchestrator Initialization) exists
specifically to walk a human through supplying every field.

### The ten operational forms (verified — `templates/1..10-*.md`)

Checkpoint Brief, Active Workbench, Builder Assignment, Component Critic Assignment, Critic
Verdict, Fresh Integration Critic, Consolidated Return Packet, Orchestrator Receipt,
Landing/Disposition/Evidence/Reclamation, Invalid Brief Return. Stage 8 exists to adopt, adapt, or
streamline these for the human's own project — and the generated prompts reproduce each form's
required content **inline**, since the human's own project has no access to this repository.

### The five terminal states and "done" has five meanings (verified — article.md §11, RULEBOOK.md §12)

`PASS`, `BLOCKED`, `PLATEAU`, `BUDGET_EXHAUSTED`, `BRIEF_INVALID`. Silence/abandonment is not a
sixth Lead-reported state — the Orchestrator detects and records it. "Done" separately means
technical PASS, terminal return, supported receipt, disposition, and lifecycle closure — collapsing
these is a named failure mode this guide repeatedly warns against, especially in Stage 12.

### The bootstrap — and why this guide does not use the term "CP-0"

**This repository never uses the term "CP-0."** An earlier planning draft for this feature used
that placeholder before the source method was read closely; it has been corrected everywhere in
the shipped content. The actual mechanism (article.md §14, "Bootstrap the hierarchy without
self-ratification") is a two-phase payload: **Phase A** collects ten intake items, returns exactly
one fit result (`FIT` / `FIT_WITH_REDUCED_PROFILE` / `NOT_FIT`), drafts all nine governance
artifacts as visibly `DRAFT`, and stops on the exact line `AWAITING_OWNER_RATIFICATION` — an agent
must never infer ratification from silence or enthusiasm. **Phase B** only proceeds after explicit
Owner ratification, and issues the first checkpoint brief.

**Design adaptation (this guide's own choice, not the source's):** the source bootstrap drafts all
nine governance artifacts in one agent turn. This guide instead spreads that drafting across
Stages 2–8 so a beginner reviews and ratifies one decision at a time, and reserves **Stage 9
(Bootstrap & Fit Check)** for the fit-check-and-coherence-audit half of the source mechanism —
confirming everything drafted earlier is actually ratified and internally consistent — plus
proposing the first eligible checkpoint that Stage 10 turns into a real brief.

### Attribution (verified — article.md §2, README.md "Credit and license")

[Matt Shumer's Gauntlet Loop](https://somethingbig.ai/gauntlet-loop) supplies the *replaceable
inner* execution pattern only: a concrete, inspectable reference bar; lead-directed decomposition
into independently judgeable pieces; builder and critic as separate agents so the critic judges the
artifact, not the builder's account of it; returning the single largest meaningful gap; iterating
without a fixed round count; blind/A-B comparison where useful. This is credited explicitly in
Stage 11's advanced content, where the pattern is actually exercised. Zero-Trust Hierarchy is
credited as the *surrounding* system — authority tiers, the brief, durable verdicts and staleness,
the Return Packet, the Orchestrator receipt, human disposition, and lifecycle — which this guide
never attributes to Shumer.

## 3. Final stage map and why it's ordered this way

| # | Stage | Prerequisite | Needs workspace agent? |
|---|---|---|---|
| 1 | Orientation & Operating Mode | — | No |
| 2 | Capstone — From Idea to Governing Plan | 1 | Yes |
| 3 | Capstone Challenge & Ratification | 2 | Yes |
| 4 | Program Decomposition & Roadmap | 3 | Yes |
| 5 | Source-of-Truth & Management Map | 4 | Yes |
| 6 | Governance & Rulebook | 5 | Yes |
| 7 | Roles & Agent Configuration | 6 | Yes |
| 8 | Operational Forms & Protocols | 7 | Yes |
| 9 | Bootstrap & Fit Check | 8 | Yes |
| 10 | Orchestrator Initialization | 9 | Yes |
| 11 | First Gauntlet Execution | 10 | Yes |
| 12 | Return, Receipt & Disposition | 11 | Yes |
| 13 | Scaling & Maintenance | 12 | Yes |

This is 13 stages against the brief's 14 numbered outcomes. Two deliberate merges, both allowed
explicitly by the brief ("combine or split stages when doing so materially improves
comprehension... do not omit any outcome"):

- **Outcomes 12 (return/learning/closure) and 13 (human acceptance/continuation) merge into Stage
  12.** In the source method these are one tightly chained arc — the Lead's Return Packet, the
  Orchestrator's receipt, and the Owner's LAND/DISCARD disposition — and every stage in this app
  already ends with a human disposition gate (accept / revise / stop). Splitting them into two
  separate stage screens would have meant asking for two dispositions back to back over the same
  event, which is exactly the "ceremonial approval" pattern the brief warns against.
- **Governance drafting (source outcomes captured in the bootstrap's nine artifacts) is unbundled
  across Stages 2–8** rather than drafted in one shot, as explained above under "The bootstrap."

Only one stage has `requiresWorkspaceAgent: false`: Orientation. Every other stage's prompt asks an
agent to inspect or change real project files, so every other stage gates behind an honest "yes, I
have a workspace-capable agent" answer from Orientation — this is the concrete implementation of
the brief's required gate: *"To continue, use an AI agent that can work inside your project
workspace."*

## 4. User types

- **The complete beginner**, who has never run a multi-agent project before. Served by: plain-
  language question `help` text, the `allowDelegate` escape hatch on every judgment-adjacent
  question that genuinely could go either way, and the fact that no stage requires understanding
  Git internals — Stage 5 asks only for a *preference*, never a SHA.
- **The advanced practitioner**, who could write these prompts by hand. Served by: the "How to do
  this yourself" accordion on every stage, which is never a restatement of the generated prompt —
  it teaches the underlying judgment/investigation split, the authority boundary in play, common
  failure modes, and a genuinely weak-vs-strong instruction pair, so a strong prompt could be
  reconstructed from scratch without the site.

## 5. Data boundary

Everything the site collects is listed in every stage module's `questions` array plus one free-text
field per stage. Nothing else is ever requested. Concretely, the app never asks for: the body of a
Capstone, roadmap, rulebook, role contract, form, brief, verdict, packet, or receipt; a commit SHA,
branch name, or any other fact the external agent should investigate; a password, API key, or
credential of any kind.

State lives in `localStorage` under one versioned key (`gauntlet-builder-journey-v1`,
`storage.js`). Export produces a JSON envelope (`{format, schemaVersion, exportedAt, journey}`);
import validates `schemaVersion`, top-level shape, and a 2 MB size ceiling before ever touching
existing state, and always asks for confirmation before replacing it. No field in the export
schema can contain project-artifact content, because the app itself never collects any.

**No network requests are made anywhere in this codebase.** The CSP in `index.html` sets
`connect-src 'none'` to make that verifiable, not just promised.

## 6. Question-design rules actually applied

Every `QuestionDef` (see `js/lib/schema.js`) carries `affectsPrompt` — a one-sentence, non-user-
facing design note on exactly how that answer changes the compiled prompt. This exists so a future
editor (or this document's author, during verification) can audit that every question earns its
place, rather than accumulating decorative form fields.

- **Required vs optional** is explicit per question; a stage's disposition can only be set to
  "accepted" once every `required` completion-gate item is checked.
- **`allowDelegate`** is added only to questions where an agent genuinely could investigate and
  propose options — never to questions that are pure human judgment (risk tolerance, intended
  users, destructive-action boundaries). Choosing it renders one extra option, "I'm not sure — ask
  the agent to investigate and recommend options before acting," and every stage's `buildLayers`
  branches on that exact value to reframe the relevant prompt layer as an investigation-and-propose
  instruction instead of quoting a placeholder as a real answer.
- **Progressive disclosure** (`dependsOn`) keeps a question hidden until its trigger answer is
  given, so nobody sees a "which different checkpoint?" text field before saying they want a
  different checkpoint.
- **Free text** is present on every stage as one field, always optional, always the last resort for
  "what didn't the structured questions capture" — and always passed through `quoteHumanInput()` so
  it is quoted as inert data in the compiled prompt, never concatenated as if it were an
  instruction to the receiving agent.

## 7. Prompt anatomy (the compiler contract)

Every generated prompt is assembled from the same fourteen ordered layers (`js/lib/schema.js`
`PROMPT_LAYERS`, rendered by `js/compiler.js` `compilePrompt()`): role and authority; stage
objective; human intent and decisions; operating mode; required repository investigation; source of
truth and precedence; exact task; constraints and non-goals; required deliverables; quality and
evidence gates; prohibited assumptions or actions; stop-and-escalate conditions; human approval
boundary; terminal return format. A stage may leave a layer's content empty (e.g. Orientation has
no meaningful "quality gates" layer); the compiler omits empty layers entirely rather than printing
a hollow heading.

Each stage's `buildLayers(answers, freeText, ctx)` branches on `ctx.mode` (`'same'` | `'fresh'`):
*same* continues an existing agent conversation but still requires the agent to verify current
state (the rulebook's "actual state overrides expected-state narrative" applies regardless of
continuity); *fresh* explicitly tells the agent to inspect the repository from zero and never trust
a prior conversation's claims. This directly implements the brief's Mode A/Mode B requirement.

## 8. Completion-state model

A stage's status is **derived, not stored redundantly**: `not_started` (no answers yet),
`in_progress` (some answers, no disposition saved), `needs_review`, or `complete`. `needs_review`
fires automatically when a stage was completed but a string snapshot of its prerequisites' answers,
taken at completion time, no longer matches their current answers (`state.js`
`snapshotPrereqs`/`computeStageStatus`). Resetting or editing an earlier stage invalidates its
*direct* dependent automatically, with zero manual propagation code, satisfying the brief's "mark
those stages for review rather than silently treating them as complete."

Invalidation propagates **one hop at a time, not transitively** — editing Orientation flags
Capstone for review, but Capstone Ratification (which depends on Capstone, not on Orientation
directly) stays `complete` until the human actually revises Capstone's own answers in response.
This is a deliberate mirror of the source method's own **computed staleness** rule (RULEBOOK.md
§9): a verdict goes stale only when a dependency it *actually relied on* changes, not merely
because something upstream of that dependency changed without touching it. Eagerly flagging all
eleven downstream stages the moment a human tweaks a sentence in Orientation would be exactly the
kind of blanket, non-selective re-review the source method argues against.

Disposition is one of `accepted` / `revise` / `stopped`, recorded alongside which completion-gate
checkboxes were ticked and an optional artifact path — never artifact content. Only `accepted`
unlocks the next stage's link in the journey map.

## 9. Notable implementation decisions

- **Prompt edits never mutate source answers.** The prompt preview is editable, but edits are
  stored in a separate `promptEdits` bucket keyed `"<stageId>::<mode>"`, distinct from `answers`.
  Reverting discards the edit and recompiles from current answers.
- **Hash-based routing** (`#/stage/<id>`) rather than a history-API router, so the app works
  unmodified from any GitHub Pages subpath without server-side rewrite rules.
- **No build step.** Every file is hand-written ES modules and plain CSS; there is no bundler,
  package manifest, or lockfile for this feature, matching the brief's "no runtime dependency, no
  CDN" constraint.
- **Safe DOM only.** `js/ui/dom.js`'s `el()` helper never accepts an `innerHTML`-style string
  parameter; every dynamic value, including all human-entered free text, is set via `textContent`
  or DOM properties, so there is no HTML-injection path from stored answers, imported files, or
  compiled prompts.
- **Node-runnable validation** (`tests/validate.mjs`) imports the real stage registry and compiler
  under Node, compiles every prompt in both modes (plus a delegate-flavored pass wherever a
  question allows it) with representative sample answers, and fails the process on any unresolved
  template token, blank required layer, or apparent artifact-paste request — a repeatable
  programmatic backstop underneath the manual browser verification pass.

## 10. Known limitations (V1)

- The generated prompts are long, information-dense Markdown. They are designed to be
  copy-pasted whole, not re-derived from memory — an agent that only skims the first paragraph will
  still miss context, the same way a human skimming the source rulebook would.
- `priorityOrder` ranking uses accessible up/down buttons rather than drag-and-drop; this was a
  deliberate accessibility-first tradeoff (keyboard operability without a drag library), not an
  oversight.
- The "needs_review" staleness check compares a JSON string snapshot of prerequisite answers, not a
  field-level diff — an edit that changes prerequisite answers in a way that round-trips to the
  same JSON string (effectively never, in practice, given free-text and ordering fields) would not
  be caught. This mirrors the source method's own preference for a computable, honest check over a
  more precise but fragile one.
- There is no way to reorder or skip stages outside the fixed thirteen; a project that genuinely
  needs a different path should treat the generated prompts as an editable starting draft (the
  preview textarea is editable) rather than a rigid form.

## 11. Explicitly out of scope for V1 (future optional modes)

- **BYOK (bring-your-own-key) AI calls from the page itself** — would contradict the "no AI API"
  constraint this V1 is built under and was never implemented, not even behind a flag.
- **Local, in-browser inference** (e.g. a WebGPU/WASM model running client-side) — technically
  compatible with the "no server" constraint but adds real bundle weight and a dependency this V1
  deliberately avoids; would need its own privacy and performance review before being considered.
- **Multi-project / multi-journey management** (saving more than one project's journey in the same
  browser profile) — V1 supports exactly one active journey per browser via a single storage key;
  export/import is the current workaround for managing more than one.

These are noted here so a future maintainer does not mistake their absence for an oversight.
