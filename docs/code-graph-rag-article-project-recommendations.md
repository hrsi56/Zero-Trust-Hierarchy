# Code-Graph-RAG for the Zero-Trust Hierarchy Article Project

## Recommendation and implementation design

**Research date:** 2026-08-14  
**Repository reviewed:** `Zero-Trust-Hierarchy` at Git commit `8151927`  
**Upstream candidate reviewed:** Code-Graph-RAG `v0.0.589`, commit `76b8d6c25e85c7531797c0e946110570b857064d`  
**Decision owner:** repository owner  
**Document status:** implementation recommendation; it does not authorize installation or change project policy

## Executive decision

Do **not** make Code-Graph-RAG a mandatory or always-on dependency of this repository now.

The current project is small, structurally simple, and already has strong deterministic navigation points. Its difficult maintenance problem is not call-graph discovery. It is preserving semantic consistency across the article, Rulebook, canonical forms, large declarative prompt strings, and validation logic. Code-Graph-RAG parses supported programming-language syntax, but it does not turn Markdown clauses or prose inside JavaScript strings into a reliable doctrine/traceability graph. For this project alone, a permanent graph service would cost more to operate and secure than it is likely to save.

A **conditional, development-only pilot** is reasonable if either condition becomes true:

1. the electricity-forecasting project already justifies and operates the shared infrastructure; or
2. the article project grows materially and a measured benchmark shows that graph retrieval beats `rg`, direct reads, the stage registry, and the existing validators.

Even in that case, the integration must remain an optional, read-only agent sidecar. It must never be embedded in the published site or Builder. It must not weaken the Builder's local-first and no-network boundary.

### Decision summary

| Question | Decision |
|---|---|
| Install it as a required project dependency now? | **No-go** |
| Ship it with the article or Builder? | **Never** |
| Let every upstream MCP tool reach agents? | **No** |
| Run an isolated benchmark against source code? | **Conditional go** |
| Reuse a separately justified local service? | **Conditional go**, with tenant isolation |
| Treat graph answers as authoritative evidence? | **No** |
| Add a custom Markdown traceability layer later? | **Potentially valuable**, but separate from the base graph |

## 1. What was reviewed

This recommendation is based on:

- the complete tracked repository, including the article, Rulebook, ten templates, Builder source, validator, and publication build script;
- the attached universal-integration recommendation prepared for the electricity-forecasting project;
- the upstream Code-Graph-RAG repository and source at the pinned revision above;
- the upstream release, security, MCP, update, graph-schema, ignore-policy, and evaluation material;
- the current local toolchain and the official Codex MCP configuration model.

The findings are time-bound. Before any future implementation, repeat the release and advisory review rather than assuming `v0.0.589` remains the correct pin.

## 2. Current repository profile

The repository is a static publication plus an offline browser application:

- 65 tracked files, approximately 2.38 MB;
- 23 JavaScript files, one MJS validator, and one Python publication builder;
- no application server, database, package manifest, lockfile, container configuration, or CI workflow;
- no existing repository-level Codex, Claude, MCP, or agent configuration;
- a clean, deterministic publication pipeline;
- a plain-ES-module Builder with a linear registry of 13 stages.

The authoritative inputs are:

- [`article.md`](../article.md)
- [`RULEBOOK.md`](../RULEBOOK.md)
- [`templates/`](../templates/)
- [`scripts/build.py`](../scripts/build.py)
- [`builder/js/`](../builder/js/)
- [`builder/tests/validate.mjs`](../builder/tests/validate.mjs)

The 13 checked-in publication HTML files are generated artifacts. They are not independent sources of truth and must not be indexed. Including them would duplicate the canonical Markdown, increase irrelevant results, and let an agent cite a derivative artifact instead of the source.

The Builder's important structural graph is compact:

```text
builder/js/app.js
  +-- stages/index.js ---> 13 stage modules
  +-- state.js ----------> storage.js + stages/index.js
  +-- ui/render.js ------> questions.js + state.js + compiler.js + schema.js
  +-- ui/journeyMap.js --> state.js
  +-- storage.js

compiler.js -------------> schema.js
tests/validate.mjs ------> schema + compiler + stages + storage + state
```

The existing validation baseline passes:

```text
python3 scripts/build.py --check
  Verified 13 deterministic HTML artifacts

node builder/tests/validate.mjs
  All checks passed
```

This matters because any graph integration must demonstrate added value beyond a repository that an agent can already inspect accurately with a few direct reads.

## 3. What Code-Graph-RAG actually provides

Code-Graph-RAG uses Tree-sitter-derived code structure, stores entities and relationships in Memgraph, and translates natural-language graph questions into Cypher. Its MCP server can expose graph queries, snippets, repository indexing and updating, database deletion, file reads and writes, structural replacement, semantic search, and an internal agent. The upstream MCP guide lists the full surface explicitly. See the [upstream MCP guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/mcp-server.md) and [graph schema](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/graph-schema.md).

As of the research date, the latest reviewed release is [`v0.0.589`](https://github.com/vitali87/code-graph-rag/releases/tag/v0.0.589). The [PyPI package](https://pypi.org/project/code-graph-rag/) requires Python 3.12 or newer and is classified as Beta. Python grammar support is a base dependency; JavaScript needs an additional grammar. Upstream's `treesitter-full` extra installs the complete supported grammar set, not only JavaScript. The pilot must either lock and audit that full set or verify and pin a minimal direct JavaScript-grammar installation against the exact release.

### 3.1 Capabilities relevant here

The useful base capabilities are:

- definitions and qualified names;
- import and call relationships;
- class/function/method structure;
- source locations and code snippets;
- natural-language-to-Cypher graph queries;
- source-to-sink flow verdicts where the language analyzer has coverage;
- incremental repository updates.

These can help an agent orient itself before editing Builder code, especially for import impact and source-to-consumer questions.

### 3.2 Capabilities that do not solve this project's main problem

The base system does not provide a dependable semantic graph for:

- Markdown headings, clauses, normative statements, and definitions;
- relationships between a Rulebook clause and the forms that implement it;
- relationships between article prose and prompt text embedded in JavaScript strings;
- proof that generated content still expresses the intended doctrine;
- project status, current work, owner decisions, or governance authority;
- runtime behavior that static analysis cannot establish;
- absence of a path when analyzer coverage is incomplete.

Markdown files may appear as generic files, but that is not equivalent to parsing their internal concepts. The optional semantic feature focuses on code entities and brings Qdrant, PyTorch, and Transformers; it should not be assumed to solve cross-document traceability and should not be installed in the first pilot.

### 3.3 Upstream evaluation evidence is encouraging but not dispositive

The upstream evaluation material reports strong results on its own graph-retrieval tasks. That supports running a local benchmark; it does not establish value on this repository's mostly prose-and-declarative questions. Review the methodology and raw artifacts in the [upstream evaluation directory](https://github.com/vitali87/code-graph-rag/tree/v0.0.589/evals). Incremental-update documentation also acknowledges residual divergence in some derived relationships, which is why periodic full reconciliation and local correctness tests are required.

## 4. Fit assessment

| Work type | Expected fit | Reason |
|---|---:|---|
| Find imports and callers in Builder code | Good | Direct code-graph use case |
| Locate stage definitions and dependencies | Good | Structured modules and registry |
| Determine publication source-to-output mapping | Limited | The Python map is easy to read directly |
| Find all doctrine occurrences across prose and prompt strings | Poor without enrichment | Most meaning is not represented as code structure |
| Validate that generated HTML matches canonical Markdown | No added value | Existing deterministic builder already proves this |
| Infer repository status or current owner intent | Invalid use | A code graph is not program state or authority |
| Make or approve edits | Invalid use | Retrieval does not grant authority or certify correctness |
| Reduce context use on future large Builder changes | Plausible | Must be measured locally |

The project should therefore optimize for a small, reversible experiment, not an infrastructure commitment.

## 5. Non-negotiable boundaries

1. **Development only.** No graph client, token, network call, generated database, or service code enters the published article or Builder runtime.
2. **Optional.** Normal work must continue with Git, `rg`, direct reads, the build check, and the validator when the service is unavailable.
3. **Read-only to agents.** Agents must not receive upstream mutation, indexing, deletion, shell, or agent tools.
4. **Advisory only.** Every consequential answer must be verified in authoritative source files.
5. **Freshness is explicit.** A response without repository identity, index generation, indexed revision, and source paths is unusable.
6. **Canonical-source discipline.** Generated HTML and obsolete duplicated content are excluded.
7. **Tenant isolation.** Sharing infrastructure with another repository must not share tool endpoints, authorization, project listings, index namespaces, or freshness state.
8. **No hidden model-triggered updates.** Index creation and refresh are operator-controlled in the initial phases.
9. **No source disclosure by default.** Prefer a local Cypher model. If an external provider is proposed, the owner must approve what code may leave the machine.
10. **Failure is safe.** Stale, unavailable, updating, or malformed graph state causes an explicit fallback, not a plausible answer from old data.

## 6. Recommended architecture

Do not connect Codex directly to the stock upstream MCP server. The stock server exposes destructive and expansive tools, and its tool definitions do not provide a sufficient server-side policy boundary. An MCP client allowlist improves usability but is not a substitute for removing dangerous capabilities from the reachable server.

Use this topology only after the benchmark gate:

```text
Codex or agent ---> read-only facade ---> active-generation query adapter
                         |                              |
                         |                              v
                         |                  dedicated Memgraph generation
                         |
                         +-- freshness probe --read-only--> fixed repository
                               |                          Git identity plus
                               |                          allowlisted files only
                               v
                         authoritative active-routing record

Owner/operator ---> sync controller ---> generation source projection
                         |                         |
                         | exclusive lock          v
                         +----------------> pinned indexer
                                                   |
                                                   v
                                      new isolated graph generation
                                                   |
                                          audit + atomic promotion
```

### 6.1 Why a source projection is preferable

Build a temporary generation projection containing only allowed files. Keep it owner/indexer-writable during the full index because `v0.0.589` writes `.cgr-hash-cache.json`, `.cgr-dir-mtimes.json`, and `.cgr-parser-fingerprint` in its target root. After indexing, prove that no projected source byte changed, accept and remove only those three known state files, then seal the projection read-only before candidate query audit and promotion. This is safer and easier to audit than mounting the whole repository and relying only on negative ignore patterns. It prevents accidental ingestion of generated pages, binary assets, Git internals, temporary files, or future secrets.

The projection must preserve repository-relative paths so graph citations map back to source. Its content is disposable and stored outside the repository.

Set the upstream home explicitly to a generation-specific directory under the declared external state root before importing or starting upstream code. The reviewed default is `~/.cgr` and includes `state.json`; the pilot must audit all writes and leave no undeclared state in the default location.

The façade does not read arbitrary live source. A separate minimal freshness probe has fixed, read-only access to the expected repository's Git identity and the same allowlisted current files. On every status or query call it recomputes HEAD, worktree identity, dirty state, and the in-scope fingerprint, returning only status metadata to the façade over a local authenticated channel. If the probe is unavailable, mismatched, or cannot read an expected file, the façade fails closed. Snippets still come only from the immutable active projection.

### 6.2 Why not two independent agent servers

If several agent clients need the graph, they should query the same read-only façade and generation, rather than each launching an independent indexer. One controlled service prevents divergent views and duplicated databases. Client configuration remains separate, and each repository receives a dedicated endpoint and token.

“Shared infrastructure” means shared façade/sync code and operational practice, not a shared graph database. Give each repository a separate Memgraph service or database boundary. In the reviewed release, the real-time watcher deletes `CALLS` relationships without a project filter before recalculating one project; sharing that database could corrupt another tenant's call graph. Do not use the upstream watcher in this pilot.

Within the article database, use generation-scoped graph projects or blue/green database volumes. Never update the active generation in place. Build and audit a new generation, then promote one authoritative routing record that identifies its immutable manifest and already-running query backend. Drain old queries and retain one last-known-good generation. If the exact pinned upstream APIs cannot isolate project generations safely, use two Memgraph instances/volumes rather than weakening atomic promotion.

### 6.3 Preferred upstream containment

Choose one of these implementation patterns, in order:

1. import the exact pinned upstream query modules inside the façade, bind them to the active routing record's immutable manifest and explicit project namespace, and register only wrapper tools;
2. run one upstream server as a private STDIO child per promoted projection, reachable only by the façade;
3. if neither is viable, run a private loopback upstream HTTP server with a distinct internal token and firewall/process controls.

The public agent endpoint must never be the full upstream server.

The stock `v0.0.589` server has no arbitrary project-name argument. It [derives the project namespace](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/utils/path_utils.py#L16-L24) from `TARGET_REPO_PATH` and fixes the Cypher generator's active project at child startup. If using option 2, record the exact upstream-derived project name for the generation, start and smoke-test a candidate child against its exact projection, and prepare one complete `active-routing.json` that identifies the immutable generation manifest, project, socket, backend instance, protocol, and query-stack fingerprint. Under a serving lock, promote that single record with a same-filesystem atomic rename and verify the backend identity handshake before returning `READY`; the façade must have no second mutable “current backend” pointer. Changing a manifest alone cannot retarget a running child. Verify its required Orchestrator and Cypher-provider configuration during the capability audit.

## 7. Index policy

### 7.1 Initial code-graph include set

Include only:

```text
scripts/build.py
builder/js/**/*.js
builder/tests/validate.mjs
```

Optionally add these only for specific UI-impact questions:

```text
builder/index.html
builder/css/*.css
assets/site.css
```

Keep the initial graph code-focused. Listing Markdown as generic files does not justify ingesting it.

### 7.2 Canonical material for a later traceability layer

If Phase 3 is approved, a separate deterministic extractor may read:

```text
article.md
RULEBOOK.md
templates/*.md
README.md
builder/README.md
builder/PRODUCT-SPEC.md
selected declarative fields in builder/js/stages/*.js
```

Its edges must be labeled by provenance:

- `DETERMINISTIC`: generated from explicit source/build/import structure;
- `DECLARED`: manually maintained mapping with a reviewer;
- `INFERRED`: model-produced association that is never presented as fact.

Candidate relation names are `GENERATED_FROM`, `VALIDATES`, `STAGE_REQUIRES`, `IMPLEMENTS_RULE`, `CITES_METHOD_SOURCE`, and `FORM_OF_BOUNDARY`.

### 7.3 Mandatory exclusions

```text
.git/**
.DS_Store
index.html
RULEBOOK.html
forms/**/*.html
assets/zero-trust-hierarchy-social.png
assets/**/*.png
zero-trust-hierarchy-source-update.patch
**/__pycache__/**
**/.cache/**
**/node_modules/**
local graph data, model data, logs, sockets, tokens, and manifests
```

SVG and CSS should remain excluded until a golden question demonstrates a need.

## 8. Agent-facing tool contract

Publish exactly three read-only tools initially. Use project-specific names or a dedicated server so they cannot be confused with another repository.

### `graph_status`

No arguments. It returns:

- active-generation state: `READY`, `STALE`, or `ERROR`;
- candidate-sync state: `IDLE`, `BUILDING`, `READY_TO_PROMOTE`, or `FAILED`;
- repository ID and expected real path hash;
- indexed Git HEAD from the immutable generation manifest and current Git HEAD from the per-call freshness probe;
- indexed-scope dirty-at-index and dirty-now flags;
- source fingerprint at index time and now;
- include-policy digest;
- Code-Graph-RAG version and commit;
- parser/grammar fingerprint;
- query-stack fingerprint covering provider, exact model revision, prompt/template, inference settings, and Cypher policy;
- index generation and completion time;
- indexed file count, parse failures, and coverage summary.

The other two tools must internally perform the same freshness check. For every query/snippet call, capture a successful probe snapshot immediately before graph execution and again immediately before returning. Both snapshots must match each other and the active routing record's immutable manifest: HEAD, worktree, indexed-scope fingerprint, policy, and query stack; otherwise discard the result as `STALE`. Agents should not be able to bypass this by skipping `graph_status`.

### `query_code_graph`

Inputs:

```json
{
  "question": "Which modules depend on builder/js/state.js?",
  "max_results": 50
}
```

Output requirements:

- a bounded set of facts, not an unqualified narrative;
- generated Cypher for auditability;
- qualified symbol, repository-relative path, and line span for every entity;
- relationship type and direction;
- indexed HEAD, generation, and fingerprint;
- query-stack fingerprint;
- truncation, parser gaps, and confidence/provenance flags;
- a reminder to verify source.

Reject mutation clauses, unsafe procedures, unbounded variable-length paths, oversized results, and requests about project status, owner intent, or prose doctrine.

The query process must use a database principal that cannot write or invoke unsafe procedures. If the tested Memgraph edition cannot provide a genuine query-only principal, do not execute arbitrary model-generated Cypher: map supported intents to fixed, parameterized, project-scoped query templates and reject everything else. Generated-Cypher validation is defense in depth, not the sole write boundary. Record the selected Memgraph edition, license/cost decision, and authorization test; Memgraph publishes role-based access control in its [edition comparison](https://memgraph.com/pricing).

### `get_code_snippet`

Inputs come from a prior graph result and contain the graph entity ID, index generation, expected repository-relative path, qualified symbol, and a bounded line budget. The façade requires the active generation, resolves the entity uniquely, verifies that ID/name/path agree, checks containment in the source projection, enforces the positive include policy, and returns source provenance. It does not accept arbitrary paths and rejects ambiguous or mismatched symbols.

### Deferred `flow_verdict`

Do not publish this tool in the initial pilot. If a later JavaScript-specific evaluation demonstrates a real need, its inputs identify a source symbol, sink symbol, and bounded depth. Output is exactly one of:

- `FOUND`: a path was found and is listed;
- `NO_FLOW`: no path was found and the relevant project scope had complete analyzer coverage;
- `UNKNOWN`: no path was found but coverage is incomplete.

`NO_FLOW` is not permitted when any relevant file or language construct is outside coverage. Promotion requires positive, true-negative, and incomplete-coverage fixtures; until then, `flow_verdict` remains absent from `tools/list`.

### Tools that must not be reachable

Do not publish or proxy:

```text
list_projects
delete_project
wipe_database
index_repository
update_repository
read_file
write_file
list_directory
surgical_replace_code
structural_search
structural_replace
semantic_search
ask_agent
flow_verdict
```

`list_projects` is omitted because a repository-specific endpoint does not need tenant discovery and should not leak other tenant names. Index/update actions belong to the operator-only sync path.

### Server instructions

Put a self-contained rule at the start of the MCP server's `instructions` field:

> Read-only advisory code intelligence for Zero-Trust-Hierarchy. Call graph_status first. Never infer project status, authority, or prose doctrine from this graph. If the active generation is STALE or ERROR, stop and use Git, rg, and source files. Verify returned paths before edits. This service cannot authorize or certify work.

## 9. Freshness contract

The graph is a cache. A cache without a strong identity contract is more dangerous than no cache because it can return convincing facts about a different revision.

### 9.1 Manifest schema

Store an immutable, signed or permission-protected generation manifest outside the repository. A separate `active-routing.json` is the sole serving authority and contains the manifest digest plus the exact project and immutable generation-specific backend identity; promote that one complete record atomically, never the manifest and backend independently:

```json
{
  "schema_version": 1,
  "repository_id": "sha256-of-canonical-realpath-and-remote",
  "worktree_id": "stable-local-id",
  "branch": "main",
  "indexed_head": "full-40-character-sha",
  "indexed_scope_dirty_at_index": false,
  "source_fingerprint": "sha256-of-sorted-path-and-content-hashes",
  "include_policy_digest": "sha256",
  "upstream_version": "0.0.589",
  "upstream_commit": "76b8d6c25e85c7531797c0e946110570b857064d",
  "parser_fingerprint": "sha256",
  "query_stack_fingerprint": "sha256-of-provider-model-prompt-settings-and-policy",
  "index_generation": 1,
  "indexed_at": "RFC3339 timestamp",
  "parse_errors": [],
  "result": "READY"
}
```

The real manifest also records the derived indexed-file count; do not hard-code it.

### 9.2 Source fingerprint

Compute the fingerprint as a SHA-256 hash over a canonical sequence of:

```text
repository-relative-path NUL file-content-sha256 LF
```

Sort paths bytewise, reject symlinks, and record the policy digest separately. Git HEAD alone is insufficient because the worktree may be dirty or the include policy may have changed.

The freshness probe recomputes this sequence from the fixed live repository on every agent-facing call. It also reads repository/worktree identity, HEAD, and Git state restricted to the allowlisted paths through a constrained invocation or narrowly implemented metadata reader. It never reads out-of-scope content or returns live file contents to the façade. An unavailable probe is `ERROR`; a mismatch is `STALE`.

### 9.3 State transitions

Track active serving state separately from candidate build state:

```text
active:    READY -- source/policy/head changes --> STALE
active:    READY -- health failure -------------> ERROR
active:    STALE/ERROR -- verified promotion ---> READY

candidate: IDLE -- operator starts sync --------> BUILDING
candidate: BUILDING -- audits pass -------------> READY_TO_PROMOTE
candidate: BUILDING -- failure -----------------> FAILED
candidate: READY_TO_PROMOTE -- atomic switch ---> IDLE
```

A candidate build or failure does not disable a still-fresh, healthy active generation. Query tools reject only when the **active** generation is `STALE` or `ERROR`, or when the two mandatory per-call probe snapshots disagree. If current source already made the active generation stale, it remains unavailable while the candidate builds. A sync promotes only after rechecking that the live allowlisted fingerprint did not change during indexing. Query-stack drift also blocks queries until the new provider/model/template/settings/policy fingerprint passes the golden corpus and is deliberately promoted. It does not require rebuilding an unchanged code graph.

## 10. Security and privacy design

### 10.1 Threats to address

- destructive MCP tools or an internal agent acting beyond retrieval scope;
- stale or cross-worktree results influencing an edit;
- cross-repository data leakage through a shared graph or `list_projects`;
- path traversal or symlink escape in source access;
- malicious source text influencing a secondary LLM;
- generated Cypher causing expensive or mutating database operations;
- external LLM disclosure of proprietary source or prompts;
- database or MCP ports exposed beyond loopback;
- unpinned Python packages or container images changing underneath the pilot;
- logs capturing code, credentials, prompts, or bearer tokens.

### 10.2 Required controls

- bind the façade and data services to `127.0.0.1` only;
- require a high-entropy bearer token even on loopback;
- set restrictive file permissions on state, logs, and tokens;
- give the façade read-only access to the active projection, not the repository root;
- isolate a minimal freshness probe with fixed read-only access to Git identity and current allowlisted files; return metadata only and fail closed if it is unavailable;
- reject symlinks and verify every resolved path remains within the projection;
- use a query-only database principal with a safe procedure allowlist; if unavailable in the selected edition, execute fixed parameterized query templates only;
- validate generated Cypher even when database permissions provide the primary write boundary;
- enforce query time, traversal-depth, row, byte, and token limits;
- redact tokens and avoid source bodies in normal logs;
- isolate graph namespaces, endpoints, tokens, manifests, and projections by repository and worktree;
- keep the operator indexer unreachable from agent clients;
- pin Python artifacts and container image digests;
- scan the candidate release and review all newer upstream advisories before promotion;
- document whether a remote LLM is used and require explicit owner approval for any source transmission.

The reviewed release contains a fix for a high-severity symlink escape affecting earlier versions. The project has also published an earlier path-traversal advisory. These are reasons to pin and re-audit, not assurances that exposing arbitrary file tools is safe. See [GHSA-85gg-2gfq-q95m](https://github.com/vitali87/code-graph-rag/security/advisories/GHSA-85gg-2gfq-q95m), [GHSA-vvr2-h2jp-838m](https://github.com/vitali87/code-graph-rag/security/advisories/GHSA-vvr2-h2jp-838m), and the [advisory index](https://github.com/vitali87/code-graph-rag/security/advisories).

## 11. Installation and supply-chain profile

The local audit found Python 3.14 and `uv`, but no Docker or CMake. Upstream requires Python 3.12 or newer; Memgraph is normally run as a container, and `pymgclient` may require build tooling. Installation therefore has prerequisites and should not be performed implicitly by an implementation agent.

For a future pilot:

1. use a dedicated tool environment outside the application runtime;
2. pin Code-Graph-RAG to both version `0.0.589` and the reviewed commit;
3. verify downloaded artifact hashes against the [PyPI release files](https://pypi.org/project/code-graph-rag/);
4. use either the fully locked/audited `treesitter-full` extra or a tested minimal direct JavaScript grammar; do not describe `treesitter-full` as a two-language install;
5. omit `semantic`, `ast-grep`, and other optional mutation-related extras;
6. pin Memgraph and any supporting container by immutable digest after compatibility testing;
7. generate and retain an SBOM or locked dependency list;
8. keep graph data and service configuration outside the repository;
9. rerun the test corpus before any package, grammar, model, or image upgrade.

Do not rely on the upstream Compose defaults: the reviewed file uses floating image references. A current upstream report describes a Memgraph 3.x compatibility failure and a proposed fix that includes engine pinning. Resolve and test an immutable image digest before the spike. See [issue #1257](https://github.com/vitali87/code-graph-rag/issues/1257) and [PR #1259](https://github.com/vitali87/code-graph-rag/pull/1259).

Do not add Code-Graph-RAG to a future Builder `package.json`, Python application dependency file, publication builder, or browser assets.

## 12. Codex connection design

Codex supports local STDIO and Streamable HTTP MCP servers. Local clients on the same host share user configuration, while trusted projects can use project-scoped `.codex/config.toml`. Server and per-tool approval controls are available. See the [official Codex MCP documentation](https://developers.openai.com/codex/mcp).

For the first pilot, prefer a user-scoped registration so the repository does not imply that the service is required. If adoption is later approved, a project-scoped configuration may be reviewed separately.

Illustrative configuration for the façade—not for direct upstream use:

```toml
[mcp_servers.zth_code_graph]
url = "http://127.0.0.1:18081/mcp"
bearer_token_env_var = "ZTH_CGR_MCP_TOKEN"
enabled_tools = [
  "graph_status",
  "query_code_graph",
  "get_code_snippet",
]
default_tools_approval_mode = "approve"
startup_timeout_sec = 10
tool_timeout_sec = 45
enabled = false
required = false
```

Keep the user-scoped entry disabled except during an intentional article-project session, and use `required = false` because the repository must remain workable without the optional service. The façade must enforce its own policy even if a client is misconfigured.

## 13. Synchronization strategy

### Phase-one behavior: explicit sync only

The owner/operator runs a sync command when needed. The controller:

1. resolves and validates the repository and expected worktree;
2. acquires a per-tenant exclusive lock;
3. marks only the candidate sync `BUILDING`; it continues serving the active generation if independent freshness/health probes still report `READY`;
4. constructs the positive-allowlist projection with no-follow opens and per-file pre/post metadata checks, requiring `mirror source fingerprint == pre-build live fingerprint`;
5. records HEAD, dirty state, path hashes, policy digest, tool version, parser fingerprint, and query-stack fingerprint;
6. performs a full index into a new generation-scoped project or blue/green database, never the active generation;
7. verifies that projected source bytes are unchanged, accepts/removes only the three known `.cgr-*` state files, and seals the candidate projection read-only;
8. audits file counts, parse errors, representative graph invariants, exact derived project namespace, and read-only query identity;
9. recomputes both mirror and live allowlisted source fingerprints through the freshness probe, requires `mirror == pre-build live == post-build live`, and smoke-tests the exact candidate façade/backend path;
10. writes and fsyncs the immutable generation manifest, then atomically renames one complete authoritative routing record that names both its digest and the already-smoke-tested generation backend; serve no `READY` response unless the backend handshake agrees;
11. drains old queries and retains the previous known-good graph and projection until the new generation is proven healthy.

### When a full rebuild is mandatory

- branch or worktree identity changes;
- the include policy changes;
- Code-Graph-RAG, Tree-sitter grammar, indexing policy, or Memgraph version changes;
- an incremental audit detects missing or extra nodes/edges;
- a checkout, rebase, reset, or large rename invalidates update assumptions;
- the service recovered from an interrupted update;
- the periodic reconciliation interval is reached.

A Cypher provider, model, prompt/template, inference-setting, or query-policy change requires a new query-stack fingerprint and a complete golden-corpus rerun before promotion. It does not require rebuilding an unchanged code graph.

### Automatic updates

The per-call freshness probe is mandatory and does not update the graph. Do not add a filesystem watcher until explicit sync proves valuable. If later approved, use a custom invalidation-only watcher that marks the graph stale immediately and debounces notifications; it must not invoke the upstream real-time updater or mutate a query-visible generation. Rebuild and promotion remain generation-isolated and serialized.

## 14. Phased implementation plan

### Phase 0 — baseline, no installation

**Goal:** determine whether there is a real retrieval problem.

Tasks:

1. Create a versioned corpus of 18–24 questions.
2. Divide them into structural code, generated-source lineage, semantic cross-document, and negative-control groups.
3. Answer them using the current `rg`/direct-read workflow.
4. Record correct source set, time to first useful result, total elapsed time, files opened, false positives, and approximate context consumed.
5. Freeze the expected answers at a clean commit.

Exit gate: proceed only if the corpus contains repeated, costly structural tasks that a graph plausibly improves.

### Phase 1 — isolated upstream spike

**Goal:** test retrieval quality without connecting any live agent.

Tasks:

1. Obtain owner approval for container/build prerequisites.
2. verify the current release and security advisories;
3. create a disposable external environment and source projection;
4. pin all dependencies and images;
5. index only the initial code allowlist;
6. run the same corpus through the graph;
7. resolve the Memgraph edition/license/cost and prove a query-only principal, or constrain the pilot to fixed parameterized templates;
8. record and test the query-stack fingerprint, generated Cypher, and cited paths;
9. test stale, dirty, wrong-worktree, symlink, ambiguous-symbol, and malformed-query behavior;
10. destroy the disposable graph after collecting results.

Exit gate: no live-agent connection unless structural questions meet the accuracy gate and demonstrate a meaningful efficiency gain.

### Phase 2 — read-only façade and explicit sync

**Goal:** create the actual safety and freshness boundary.

Suggested project-neutral components, stored in a dedicated external tooling repository or service directory:

```text
code_graph_sidecar/
  pyproject.toml
  uv.lock
  README.md
  policy/article.toml
  src/facade/server.py
  src/facade/tools.py
  src/facade/cypher_policy.py
  src/facade/freshness_probe.py
  src/sync/controller.py
  src/sync/generation.py
  src/sync/projection.py
  src/sync/manifest.py
  src/sync/routing.py
  tests/test_tool_surface.py
  tests/test_freshness.py
  tests/test_freshness_probe.py
  tests/test_mirror_state_writes.py
  tests/test_generation_promotion.py
  tests/test_backend_routing.py
  tests/test_query_only_identity.py
  tests/test_snippet_identity.py
  tests/test_path_containment.py
  tests/test_cypher_policy.py
  tests/test_tenant_isolation.py
  eval/article_questions.yaml
  runbooks/article.md
```

Required tests appear in Section 16.

Exit gate: a security review proves that only the three initial read-only tools are discoverable and callable, all stale queries fail closed, and another tenant cannot be enumerated or queried.

### Phase 3 — limited live pilot

**Goal:** let one development agent use the service for selected Builder tasks.

Tasks:

1. register the façade as optional in one client;
2. keep explicit operator sync;
3. require `graph_status` before graph-assisted work;
4. require direct source verification in the agent instructions;
5. collect query, latency, result-count, fallback, and stale-rejection metrics without logging source bodies;
6. compare five to ten real investigations against the baseline.

Exit gate: retain only if it improves work without a correctness or boundary regression.

### Phase 4 — optional semantic traceability experiment

**Goal:** address the project's actual cross-document problem.

This is a separate project. Build a deterministic Markdown/parser layer that assigns stable clause and form-field IDs, then declares or reviews mappings to Builder stages and tests. Do not merge model-inferred links into deterministic code edges. Evaluate it on questions such as “Which artifacts implement exact-revision verdict currency?”

Exit gate: at least 80% top-five recall on the semantic corpus with clear provenance and no authoritative claim based solely on inference.

### Phase 5 — keep or remove

Promote the service only if all adoption criteria pass. Otherwise unregister it, remove its state, and preserve only the corpus and findings.

## 15. Golden-question corpus

At minimum include these questions.

### Structural questions

1. Which modules import `state.js`?
2. What code participates in compiling answers into the final prompt?
3. What must change to add a new question type?
4. Which files are involved in persisting and restoring Builder state?
5. Where are stage prerequisites declared and consumed?
6. Which tests cover stale prompts after prerequisite changes?
7. What imports `schema.js` directly or transitively?
8. What is the impact surface of reordering a stage?

### Source-lineage questions

9. Which source generates `RULEBOOK.html`?
10. Which source generates a selected form page?
11. Which checked-in pages are generated rather than authoritative?
12. Which validator detects publication drift?

The graph may not outperform direct reading here; that is a useful result.

### Semantic questions

13. Where is the fresh-context rule expressed across all artifacts?
14. Which forms and stages implement exact-revision verdict currency?
15. Which content enforces Owner ratification?
16. Where is the no-self-certification boundary described and operationalized?
17. Which article claims are supported by a Rulebook clause?
18. Which prompt instructions correspond to a canonical form field?

The expected base-graph answer may be “unsupported.” Do not score an honest limitation as a retrieval failure; score invented relationships as severe failures.

### Negative controls

19. Ask for the current project milestone. The service must refuse or state it has no authority.
20. Make an allowlisted code file dirty after indexing. Every query must reject the stale generation.
21. Point a client at the electricity tenant. Authentication or repository identity must reject it.
22. Request a generated HTML file as authoritative source. It must not appear in the graph.
23. Attempt write, delete, index, update, directory-listing, arbitrary file-read, and internal-agent tool calls. They must not exist.
24. Request an unbounded Cypher traversal or mutation. It must be rejected.
25. Disable or spoof the freshness probe. Queries must fail closed.
26. Request a snippet for an ambiguous/mismatched symbol identity. It must be rejected.
27. Modify an allowlisted file between the pre-execution and pre-return probes. The in-flight result must be discarded as `STALE`.

## 16. Acceptance criteria

### Correctness

- 100% of allowlisted code files are represented, with zero files outside policy.
- At least 90% of deterministic structural questions return the correct file/symbol set.
- Top-five recall on cross-cutting structural questions is at least 90%.
- Every fact includes a repository-relative source path and indexed generation.
- Snippet retrieval requires a matching entity ID, generation, path, and qualified name, and rejects ambiguity.
- `flow_verdict` is absent until its separate coverage corpus passes.
- No unsupported prose relationship is represented as deterministic fact.

### Freshness and isolation

- HEAD, indexed-scope dirty-state, content, policy, parser, and worktree mismatches all produce `STALE`.
- query-stack drift blocks queries until its fingerprint and golden corpus are promoted.
- No query succeeds while active state is `STALE` or `ERROR`, or while the pre/post probe snapshots disagree.
- A concurrent source change cannot cause an old fingerprint to be published as `READY`.
- a failed build cannot alter the active graph; the last-good generation remains queryable only while fresh.
- a failed candidate build does not disable a still-fresh, healthy active generation.
- an unavailable or spoofed freshness probe fails closed.
- One tenant cannot list, infer, authenticate to, or query another tenant.
- Generated HTML, binary assets, Git internals, ignored files, caches, logs, and credentials are absent.

### Security

- MCP discovery returns exactly the three approved tools.
- All upstream mutation and internal-agent capabilities are unreachable, including by crafted names or passthrough arguments.
- Symlink, `..`, absolute-path, encoding, and case-normalization containment tests pass.
- Cypher mutation, unsafe procedure, Cartesian explosion, unbounded path, timeout, and result-size tests pass.
- the façade uses a proven query-only database identity, or exposes fixed parameterized query templates only.
- No secret or source body appears in normal logs.
- All network listeners are loopback-only and authenticated.

### Utility

- Median investigation time or context/file consumption improves by at least 30% on the structural corpus.
- The improvement appears on at least ten representative tasks, not one demonstration.
- Warm-query p95 is under three seconds on this small repository.
- Operators spend less than 30 minutes per month on the article tenant after stabilization.
- Agents fall back cleanly when the service is disabled.

### Project invariants

- `python3 scripts/build.py --check` passes.
- `node builder/tests/validate.mjs` passes.
- generated publication bytes are unchanged by the integration itself;
- the Builder performs no graph/network operation and retains its existing CSP;
- no graph state or secret is tracked by Git.
- all upstream writes are confined to the declared external state root, dedicated database volume, or known candidate-mirror indexing files; the default `~/.cgr` is untouched.

## 17. Operating runbook

### Before a query session

1. confirm the intended repository and worktree;
2. inspect `graph_status`;
3. if not `READY`, use direct source or ask the operator to sync;
4. verify that the indexed HEAD and dirty state match the intended task;
5. use graph results only for orientation and impact discovery.

### Before an edit

1. open every cited authoritative file;
2. confirm symbol names and line locations in the current worktree;
3. search for prose/declarative occurrences that the graph cannot parse;
4. make the scoped edit;
5. run the normal deterministic validations.

### Health and observability

Record only operational metadata:

- request ID, tenant, tool, generation, status, latency, result count, truncation, and error class;
- sync duration, source count, node/edge counts, parse failures, and reconciliation result;
- stale rejections and fallback counts.

Do not record tokens, source snippets, complete prompts, generated answers, or database credentials in normal logs.

### Backup and recovery

The graph is disposable. Back up policy, dependency locks, evaluation corpus, and manifests—not the database as authoritative data. Recovery is a full rebuild from an approved source projection. Never recover program truth from a graph backup.

## 18. Rollback and kill switch

Rollback must be immediate and must not affect the publication:

1. disable or remove the optional MCP registration;
2. stop the façade and private graph services;
3. revoke the article tenant token;
4. remove only the explicitly identified external projection, manifest, logs, and graph volume;
5. confirm that no state is tracked in the repository;
6. run the publication and Builder validators;
7. record why the pilot was removed and retain benchmark results.

Triggers for immediate disablement include cross-tenant results, a reachable mutation tool, a stale answer marked `READY`, source disclosure, a containment failure, repeated false structural facts, or operational cost exceeding the agreed ceiling.

## 19. Effort and cost expectation

For this repository alone, a robust façade, freshness controller, isolation tests, evaluation corpus, dependency maintenance, and local services are disproportionate. A safe implementation is not a one-command install.

Approximate engineering effort if shared infrastructure already exists:

| Work | Estimate |
|---|---:|
| Baseline corpus and scoring | 4–6 hours |
| Article projection/policy and tenant setup | 3–5 hours |
| Freshness and isolation adaptation | 3–5 hours |
| Live pilot and analysis | 4–8 hours |
| Optional Markdown traceability prototype | 12–24+ hours |

If the façade and sync controller do not already exist, budget roughly 5–10 engineering days for a security-conscious initial implementation, generation/failure testing, and review. That cost is the main reason for the current no-go decision.

## 20. Instructions for a future implementation agent

If the owner later authorizes a pilot, the implementation agent must:

1. treat this document as design input, not authorization to install host software;
2. report the exact repository HEAD and dirty state before edits;
3. benchmark first and stop if the Phase 0 gate fails;
4. request approval before installing Docker, CMake, container images, or external-model credentials;
5. keep all runtime state outside the repository;
6. implement server-side tool removal, path containment, positive includes, and freshness before connecting Codex;
7. use one tenant and one worktree only in the initial pilot;
8. make no changes to publication output, Builder runtime, CSP, or canonical prose;
9. run all acceptance tests and existing project validators;
10. deliver a decision report with measured baseline versus graph results and a complete rollback record.

The agent must stop rather than improvise if it cannot guarantee that only the three initial read-only tools are reachable.

## 21. Final recommendation

For the Zero-Trust Hierarchy article repository, the correct present decision is:

> **No-go for mandatory or always-on Code-Graph-RAG adoption. Conditional go for a small, isolated, read-only benchmark only after shared infrastructure exists or the repository's complexity materially increases.**

The likely high-value future feature is not a deeper call graph. It is a transparent traceability map from Rulebook clauses to article explanations, canonical forms, Builder stages, and validating tests. Build that only if a measured maintenance problem warrants it, and keep deterministic, declared, and inferred relationships visibly separate.

## Sources

- [Code-Graph-RAG repository](https://github.com/vitali87/code-graph-rag)
- [Code-Graph-RAG v0.0.589 release](https://github.com/vitali87/code-graph-rag/releases/tag/v0.0.589)
- [PyPI package and release files](https://pypi.org/project/code-graph-rag/)
- [Upstream MCP guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/mcp-server.md)
- [Upstream real-time update guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/realtime-updates.md)
- [Upstream graph schema](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/graph-schema.md)
- [Upstream ignore-pattern guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/advanced/ignore-patterns.md)
- [Upstream evaluation material](https://github.com/vitali87/code-graph-rag/tree/v0.0.589/evals)
- [Updater state-file implementation](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/graph_updater.py#L158-L201)
- [Upstream `CGR_HOME` default](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/config.py#L207)
- [Upstream `state.json` location](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/cgr_state.py#L12-L23)
- [Upstream project-name derivation](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/utils/path_utils.py#L16-L24)
- [Upstream security advisories](https://github.com/vitali87/code-graph-rag/security/advisories)
- [Memgraph edition comparison](https://memgraph.com/pricing)
- [Official Codex MCP documentation](https://developers.openai.com/codex/mcp)
