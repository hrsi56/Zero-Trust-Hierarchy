# Gauntlet Builder

A standalone, offline, local-first guide that compiles precise, stage-specific prompts for
building a [Zero-Trust Hierarchy](../article.md) operating system around your own project — one
generated prompt at a time, for an AI agent you run yourself.

This directory is self-contained. It does not read, write, or link to anything else in this
repository at runtime, and nothing outside `builder/` was modified to build it. See
[PRODUCT-SPEC.md](PRODUCT-SPEC.md) for the full design record, method-provenance breakdown, and
list of implementation decisions.

## What it is not

- Not a chatbot. It never calls an AI model and never asks for an API key.
- Not a backend. There is no server, account, or database — everything runs in your browser tab.
- Not a place to paste your project. It never asks for a Capstone, a rulebook, a roadmap, a source
  file, or an agent's output — only for your own judgment calls, and, optionally, a file path.

## Run it locally

No build step and no dependencies — any static file server works. From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/builder/`. Opening `builder/index.html` directly via a `file://`
URL will **not** work, because browsers block ES module imports over `file://` — a local static
server (or GitHub Pages itself) is required.

## Deploying

This is a static site. Once this repository (or a subtree of it) is served by GitHub Pages, the
guide is reachable at `https://<user>.github.io/<repo>/builder/`. Every asset path in
`builder/index.html` and every JS import is relative, so it works unmodified from any subpath —
there is no assumption that the site is deployed at a domain root.

## Directory layout

```
builder/
  index.html              App shell: header, journey nav mount point, main content mount point, footer
  README.md                This file
  PRODUCT-SPEC.md          Full design record — read this first if you're extending the guide
  css/
    tokens.css              Design tokens (colors, type, spacing) — light/dark via prefers-color-scheme
                             and a `data-theme` override, echoing the parent publication's palette
    app.css                 Layout and component styles
  js/
    app.js                  Boot: hash router, theme toggle, export/import/reset wiring
    state.js                 Central store: answers, free text, mode, gates, prompt edits, derived status
    storage.js                localStorage persistence + versioned export/import validation
    compiler.js                Assembles a stage's 14 prompt layers into one portable prompt string
    lib/
      schema.js                 The StageModule contract (JSDoc) + a runtime shape validator
    ui/
      dom.js                     Safe DOM builders — no innerHTML anywhere in this app
      questions.js                Renders each question type; owns the "ask the agent instead" option
      journeyMap.js                Renders the left-hand stage list and progress bar
      render.js                    Renders a full stage screen from a stage module + current state
    stages/
      index.js                   Registry — imports all thirteen stage modules in journey order
      01-orientation.js .. 13-scaling.js
                                    One data-driven module per stage: questions, the prompt compiler
                                    function, recovery prompts, and the "How to do this yourself"
                                    content. Adding or revising a stage means editing one of these
                                    files — the app shell never needs to change.
  tests/
    validate.mjs              Node-runnable check: every stage's shape, both operating modes'
                               compiled prompts, unresolved-token scan, and artifact-paste scan.
                               Run: `node builder/tests/validate.mjs`
```

## Adding or editing a stage

1. Read `js/lib/schema.js` for the exact `StageModule` contract.
2. Copy the structure of an existing stage module (`js/stages/01-orientation.js` is the reference
   implementation) rather than starting from scratch.
3. Register the new module in `js/stages/index.js`, in journey order.
4. Run `node builder/tests/validate.mjs` — it will catch shape defects, unresolved template
   tokens, and a handful of policy checks (no artifact-paste requests, no stray `CP-0` references,
   both operating modes actually differ) before you open a browser.
5. Open the app in a browser and walk the stage end to end: every question, the delegate option
   where present, both operating-mode prompts, both recovery prompts if any, the advanced
   accordion, and the completion gate.

## Privacy

Nothing you type leaves this browser tab. Answers persist only in this browser's `localStorage`
under one key; export/import are the only ways data leaves or enters, and both are entirely
under your control as a downloaded/uploaded JSON file. There is no analytics, no tracking, and the
Content-Security-Policy in `index.html` sets `connect-src 'none'`, so the browser itself will block
any accidental network call.
