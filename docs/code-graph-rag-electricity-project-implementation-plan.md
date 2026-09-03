# Code-Graph-RAG for the PJM Electricity-Forecasting Project

## Corrected decision, architecture, and implementation specification

**Research date:** 2026-08-14  
**PJM repository snapshot reviewed:** `main` at `9312c0584c1e4b30a92153aef7a147cbc00617d5`  
**Upstream candidate reviewed:** Code-Graph-RAG `v0.0.589`, commit `76b8d6c25e85c7531797c0e946110570b857064d`  
**Input analyzed:** `code-graph-rag-universal-agent-integration-recommendations.md`  
**Intended implementer:** a fresh, non-Orchestrator agent  
**Document status:** executable technical specification after its authorization gates pass; not authorization by itself

## Executive decision

Proceed now only with a **disposable, read-only, external evaluation spike**. Do not yet add a live MCP service, updater, repository configuration, or universal agent access.

The supplied recommendation is thoughtful and directionally correct about using a read-only façade, explicit freshness, exact dependency pins, and a benchmark. Its central “universal agent tool” premise is not compatible with PJM's actual role contracts. The current repository is also too small and documentation-heavy to justify several days of permanent infrastructure before measured evidence exists.

The final recommendation is:

> **GO for an isolated snapshot benchmark. NO-GO for permanent live integration today. Reconsider after the benchmark proves value and preferably after M1 adds materially more production code.**

If the spike passes, the first live pilot is limited to a specifically authorized Engineering Lead session. It is never enabled for the Orchestrator, Critics, Track A, Track C, or NotebookLM. Builders remain excluded in the initial pilot and may be considered later only when an exact brief authorizes the tool and the index represents that Builder's own isolated snapshot.

### Decision table

| Decision | Result |
|---|---|
| Read-only offline benchmark outside PJM | **Go**, after owner approval for prerequisites |
| Edit PJM during the benchmark | **No-go** |
| Add Code-Graph-RAG to PJM `pyproject.toml` | **No-go** |
| Index the live PJM root | **No-go** |
| Expose the stock upstream MCP server | **No-go** |
| Run upstream real-time watcher | **No-go** |
| Enable for Engineering Lead | **Deferred until all gates pass** |
| Enable for Builder | **Not in initial pilot** |
| Enable for Critics or Orchestrator | **Never under current contracts** |
| Index program/governance documents | **No-go** |
| Use graph output as evidence or authority | **No-go** |
| Add semantic embeddings/Qdrant/ast-grep | **Deferred and unnecessary for the pilot** |

## 1. Stop conditions and authority contract

This section is the first instruction to the implementation agent. It overrides later technical convenience.

### 1.1 Establish the role before acting

The fresh agent must begin by reading PJM's root `AGENTS.md` and identifying the authority under which it is running. A bare request such as “implement this plan” does not erase the repository's role router or Governance Lockdown.

The agent may perform read-only verification while its role is ambiguous. It must not modify PJM, install host prerequisites, edit client configuration, start containers, create a sibling project, or create persistent runtime state until the relevant authority is explicit.

### 1.2 PJM edits require project authority

At the reviewed snapshot, there was no active Track B brief for this work. PJM's Engineering contract does not permit an Orchestrator to invent an ad hoc “tooling checkpoint” in a brief.

The authority routes are separate:

1. **External Phases 0–3:** the Owner may authorize a bounded sidecar task outside PJM. PJM remains read-only, no Engineering checkpoint is opened, and the output is advisory tooling/evaluation only.
2. **Any PJM mutation or Engineering-Lead Phase 4+:** the Owner must first ratify any necessary change to the applicable M/CP or FM/FCP capstone plan through the repository's valid amendment process. Only then may the Orchestrator issue the normal one-repository, one-checkpoint Track B brief naming that already-ratified checkpoint, complete checklist, owned paths, tests, resource ceiling, and terminal conditions.
3. **Locked configuration:** the separate narrow suspension in Section 1.3 is still required for each exact agent-configuration edit; neither route above implies it.

If the required route is absent, PJM stays read-only and the agent returns the repository-defined blocked/invalid outcome described below.

### 1.3 Agent-configuration files are locked

PJM's Governance Lockdown covers `.claude/**` and any file that configures how agents run in the repository. That includes a proposed `.codex/config.toml`, `.mcp.json`, Claude MCP configuration, agent instructions, or a project policy file if it is wired into agent behavior.

Before editing one, the agent must receive a narrow, one-use Owner suspension that names:

- the exact file;
- the exact table/entry or text to add, change, or remove;
- the purpose;
- the one edit for which the suspension is valid.

An approval to install a dependency is not approval to edit agent configuration. A technical spike passing is not approval either.

### 1.4 Host and external-state changes require approval

The reviewed machine did not have Docker, CMake, Ollama, or the Claude CLI. Installing them, downloading a container/model, creating a persistent volume, or providing an LLM credential requires Owner approval. The agent must show the exact dependency, source, version/digest, disk/network implications, and removal procedure before requesting approval.

### 1.5 Git and publication constraints

The implementation agent must obey PJM's Git rules:

- no push, PR, issue, release, or other GitHub mutation;
- no commit to `main`;
- on `main` and during the external spike, no staging, reset, cleanup, checkout-overwrite, or unrelated worktree removal;
- preserve all existing branches, worktrees, and untracked files;
- do not touch the untracked PJM copy of `docs/code-graph-rag-universal-agent-integration-recommendations.md`;
- if an authorized checkpoint branch is required, follow the Engineering Lead protocol exactly, including its required candidate staging/commits on `gauntlet/<checkpoint>`.

### 1.6 Terminal status and phase disposition

When operating under a Track B brief, use only PJM's closed terminal vocabulary: `PASS`, `BLOCKED`, `PLATEAU`, `BUDGET_EXHAUSTED`, or `BRIEF_INVALID`. Do not invent a sixth terminal status.

The following labels may appear only as a subordinate `reason_code` on a PJM return or as `phase_disposition` in an external sidecar report:

- `AUTHORIZATION_MISSING`: no valid authority route for the proposed action;
- `LOCKDOWN_SUSPENSION_MISSING`: an exact configuration edit lacks its narrow Owner suspension;
- `OWNER_ACTION_REQUIRED`: a host install, credential, model, image, or persistent service requires Owner action;
- `SPIKE_FAIL_DEFER_TO_POST_M1`: the isolated evaluation failed a mandatory gate;
- `SPIKE_PASS_LIVE_DEFERRED`: the evaluation passed but live integration is not authorized;
- `LIVE_PILOT_PASS_REVIEW_REQUIRED`: the live pilot passed; Owner retention decision remains outstanding.

For example, a briefed Lead returns `BLOCKED` with `reason_code=OWNER_ACTION_REQUIRED`, not `BLOCKED_OWNER_ACTION`. An invalid or incomplete brief returns `BRIEF_INVALID` under the Engineering contract.

## 2. Current PJM fit

At the audit snapshot, PJM contained:

- 54 tracked files;
- 22 tracked Python files and 27 tracked Markdown files;
- approximately 2,033 Python lines and 8,454 Markdown lines;
- Python application support from 3.11 upward;
- current Track B code under `src/pit_capture`, `src/spike`, `scripts`, and `tests/pit_capture`;
- no Docker/Compose setup, MCP project configuration, `.cgrignore`, Makefile, or GitHub Actions workflow;
- several existing detached Codex/Claude worktrees;
- one untracked recommendation document in `docs/`.

This is not yet a large codebase. Direct `rg`, AST inspection, tests, and focused file reads remain a strong baseline. The future forecasting pipeline may make graph navigation more useful once data ingestion, feature engineering, walk-forward validation, modeling, calibration, evaluation, explainability, and experiment tracking create a larger dependency surface. That expected future value does not justify premature live infrastructure.

The current repository also demonstrates why a code graph cannot be project state: different program documents can temporarily describe different milestones. Only the governed project-state process can resolve that; code topology cannot.

## 3. Analysis of the supplied recommendation

### 3.1 Recommendations to retain

The supplied document correctly establishes that:

- the graph is derived code intelligence, not a source of truth for plans, checkpoints, evidence, permissions, or project status;
- static analysis has coverage limits and must not be presented as runtime proof;
- a server-side read-only façade is safer than direct stock MCP access;
- indexing and updating should be operator-controlled rather than model-triggered;
- the service needs an explicit HEAD/fingerprint/version freshness contract;
- releases, Python packages, parsers, and images must be pinned and reviewed;
- semantic and structural extras should be deferred;
- graph retrieval must be benchmarked against `rg` and source reading;
- worktree, branch, and Critic isolation are essential;
- failure and rollback must leave the software project independent of the graph.

These are the foundation of this specification.

### 3.2 Corrections required by PJM governance

The supplied document permits topology queries by the Orchestrator. That conflicts with `orchestrator-role.md`, whose source-inspection checklist is exhaustive and which forbids the Orchestrator from reading source, running tests, or re-deriving engineering conclusions.

It also assumes a generally available agent service. That conflicts with:

- the Engineering role's influence boundary, which excludes Track A/C and program material from engineering decisions;
- the clean detached exact-SHA evidence model for Component and Integration Critics;
- the requirement that a Builder act only inside its brief and owned snapshot.

The corrected role policy appears in Section 5.

### 3.3 Corrections required by upstream behavior

The attached plan needs these technical changes:

1. **Never target the PJM root directly.** Upstream's updater writes `.cgr-hash-cache.json`, `.cgr-dir-mtimes.json`, and parser state in the target repository. PJM does not currently ignore those files. A disposable source mirror avoids dirtying the project.
2. **Use positive root-anchored includes.** Broad exclusions can still ingest root Track A scripts or nested `.claude/worktrees` copies.
3. **Do not share a Memgraph database between repositories.** The reviewed real-time updater deletes all `CALLS` relationships without a project filter before recalculating one project. A watcher for one tenant can damage another tenant's graph.
4. **Use generation-scoped projects and one serving authority.** An immutable generation manifest does not make an in-place graph update atomic. Build and smoke-test a new graph/backend generation, then atomically rename one complete routing record that identifies both the manifest digest and backend identity.
5. **Prefer full rebuilds.** Upstream's own incremental evaluation documents residual differences after updates. For roughly 2,000 Python LOC, full reconstruction is simpler and safer.
6. **Expose three tools initially, not four or five.** Defer `flow_verdict` until PJM-specific coverage tests pass; omit `list_projects` because a single-project endpoint does not need tenant discovery.
7. **Prefer a per-session STDIO façade first.** A shared HTTP service broadens visibility and does not solve role identity. HTTP is a later option only if a real second client is justified.
8. **Increase the effort estimate.** Generation isolation, source mirroring, release verification, deterministic evaluation, role activation, path safety, and recovery make a robust live implementation a several-day effort.

### 3.4 Corrections required by supply-chain state

The upstream package pin alone is insufficient. The bundled Compose file uses floating Memgraph, Lab, and Qdrant images. A current upstream issue reports incompatibility with Memgraph 3.x, with a proposed fix that includes pinning the engine. Therefore the implementation must resolve and test an immutable Memgraph digest before indexing. See [issue #1257](https://github.com/vitali87/code-graph-rag/issues/1257) and [PR #1259](https://github.com/vitali87/code-graph-rag/pull/1259).

## 4. Upstream risk summary

The reviewed release is [`v0.0.589`](https://github.com/vitali87/code-graph-rag/releases/tag/v0.0.589), released 2026-08-10. The [PyPI package](https://pypi.org/project/code-graph-rag/) requires Python 3.12 or newer and is classified Beta. PJM supports Python 3.11 or newer, so the tool must use a separate environment and must not become a PJM runtime dependency.

The stock [MCP server](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/mcp-server.md) exposes:

```text
list_projects
delete_project
wipe_database
index_repository
update_repository
query_code_graph
get_code_snippet
surgical_replace_code
read_file
write_file
list_directory
semantic_search (optional)
structural_search (optional)
structural_replace (optional)
ask_agent
flow_verdict
```

The MCP registry has no server-side read-only mode or per-client role model. Its exposed tool metadata is not a sufficient safety boundary. `ask_agent` constructs a nested agent with file and shell capabilities. Upstream indexing/update tools mutate graph state; file and replacement tools mutate the worktree; delete/wipe tools are destructive. None may be reachable from a PJM agent.

Two published high-severity advisories reinforce the need for containment:

- [GHSA-85gg-2gfq-q95m](https://github.com/vitali87/code-graph-rag/security/advisories/GHSA-85gg-2gfq-q95m), a symlink escape affecting versions through `0.0.588`, fixed in the reviewed release;
- [GHSA-vvr2-h2jp-838m](https://github.com/vitali87/code-graph-rag/security/advisories/GHSA-vvr2-h2jp-838m), an earlier paginated file-read path traversal.

Version `0.0.589` is the minimum reviewed candidate, not a permanent recommendation. Upstream development is fast-moving. Re-audit the installed artifact and all newer [security advisories](https://github.com/vitali87/code-graph-rag/security/advisories) at implementation time.

## 5. Role and influence policy

The graph is not universal. Access is determined by PJM role, not by technical convenience.

| Role/session | Access | Conditions |
|---|---|---|
| Engineering Lead | **Eligible after pilot** | Advisory orientation/impact only; active valid brief; exact permitted source scope |
| Builder | **No in initial pilot** | Future consideration only if its brief explicitly allows it and the graph is built from that Builder's own snapshot |
| Component Critic | **Never in this pilot** | Must inspect the exact clean detached candidate directly |
| Integration Critic | **Never in this pilot** | Same exact-SHA evidence boundary |
| Orchestrator | **Never** | Source inspection and engineering re-derivation are outside its exhaustive checks |
| Track A / NotebookLM | **Never** | Graph contains Track B engineering code only |
| Track C | **Never** | Outside Track B scope |
| Ambiguous/general agent | **Disabled** | May use `rg` and direct reads only within its existing authority |

### 5.1 Influence boundary

Only Track B Python source is projected. No program-status, governance, anchor, evidence, Track A, or Track C material enters the graph. This is not just a privacy exclusion; it prevents prohibited materials from influencing Engineering decisions through retrieval.

### 5.2 Critic boundary

Critics receive exact clean detached candidates and must reason from that candidate. A mutable graph built from `main`, a Lead worktree, or a Builder worktree is neither exact evidence nor an approved input. Do not expose it in a Critic client, cite it in a verdict, or attach its output as evidence.

### 5.3 Builder boundary

If Builder access is considered after the Lead pilot, create a generation from that Builder's isolated snapshot after its seed SHA and allowlist are recorded. The tool must not reveal other candidate branches, the Lead's active state, or files outside the Builder brief. If that cannot be proven, keep it disabled.

### 5.4 Session activation

The service is disabled by default. A persistent project-scoped MCP entry is not acceptable for the pilot because it would appear across roles and is itself locked agent configuration. The implementation must prove a per-session activation mechanism in the installed client. If Codex cannot reliably isolate activation and environment from Orchestrator/Critic sessions, live use is a no-go.

## 6. Source policy

### 6.1 Positive include set

The initial policy contains only root-anchored paths:

```text
src/**/*.py
scripts/**/*.py
tests/**/*.py
```

Candidate enumeration must begin at the PJM root and match the repository-relative path. It must not recursively discover another `src/`, `scripts/`, or `tests/` directory beneath `.claude/worktrees` or elsewhere.

At the reviewed snapshot this captures:

- `src/pit_capture/**/*.py`;
- `src/spike/**/*.py`;
- `scripts/q*.py`;
- `tests/pit_capture/**/*.py`.

Eligible untracked Python source inside those exact roots is included and flagged. This lets a Lead query current engineering changes without treating Git HEAD as the only freshness signal.

### 6.2 Absolute exclusions

Everything outside the include set is excluded, including:

```text
root-level *.py
all *.md
.git/**
.claude/**
.codex/**
.venv/**
data/**
tmp/**
notebooks and *.ipynb
models, features, predictions, and experiment outputs
PDF, image, CSV, Parquet, DuckDB, and binary artifacts
.env* and all credential/key/certificate files
evidence and return packets
graph state, logs, sockets, locks, manifests, and database files
```

Root-level Python is excluded because the repository currently contains material outside the Track B influence boundary. Do not replace the positive policy with “all Python except known names.”

### 6.3 Symlinks and special files

Reject every symlink, FIFO, device, socket, hardlink anomaly, unreadable file, and path that changes under resolution. Copy only regular files. Verify that both the source and destination resolved paths remain inside their expected roots. Preserve repository-relative POSIX paths in the mirror.

### 6.4 Source mirror

Never point Code-Graph-RAG at the PJM working tree. Construct a generation-specific mirror outside PJM containing only policy-approved files. Open source files without following symlinks, compare `fstat` identity/size/time before and after each copy, and require `mirror_source_fingerprint == pre_copy_PJM_fingerprint == post_copy_PJM_fingerprint`.

Keep the mirror owner/indexer-writable during full indexing because `v0.0.589` writes exactly these files in its target root:

```text
.cgr-hash-cache.json
.cgr-dir-mtimes.json
.cgr-parser-fingerprint
```

After indexing, verify the mirror source fingerprint again, prove that no source byte or mode changed, accept and remove only those three known state files, and fail on every unexpected write. Then seal the mirror read-only and keep the active mirror available so snippets come from the same snapshot as the graph. A tested upstream patch that redirects all three state files outside the mirror is an acceptable future alternative; do not assume such a setting exists in the pinned release.

Before and after every operation, capture PJM's complete `git status --porcelain=v1 -uall`. The byte-for-byte result must be identical. The current untracked recommendation document must remain untouched and present.

## 7. Target architecture

```text
Authorized Engineering Lead ---> read-only MCP facade ---> active query backend
                                       |                         |
                                       v                         v
                              OS-confined freshness       dedicated Memgraph
                                      probe               active generation
                                       |
                                       v
                              PJM Git identity and
                              allowlisted files only

Owner/operator sync ---> coherent generation mirror ---> pinned full index
                               |                              |
                               +-- source equality audit      v
                                                     candidate generation
                                                              |
                                        candidate backend + end-to-end smoke
                                                              |
                                           atomic active-routing record switch
                                                              |
                                              retain previous known-good
```

### 7.1 Separate sidecar workspace

Create the pilot in a sibling or otherwise external workspace selected by the Owner, represented below as `<sidecar-root>`. Do not add it to PJM's `pyproject.toml`, `.venv`, source tree, tests, or CI.

Suggested layout:

```text
<sidecar-root>/
  pyproject.toml
  uv.lock
  README.md
  LICENSES/
    code-graph-rag-MIT.txt
  config/
    policy.json
  src/pjm_code_graph/
    __init__.py
    server.py
    models.py
    policy.py
    fingerprint.py
    freshness_probe.py
    mirror.py
    backend.py
    query_policy.py
    sync.py
    status.py
    limits.py
    audit_log.py
    cli.py
  tests/
    test_tool_enumeration.py
    test_policy_scope.py
    test_path_containment.py
    test_fingerprint.py
    test_freshness_probe.py
    test_mirror_coherence.py
    test_staleness.py
    test_generation_promotion.py
    test_generation_backend_route.py
    test_backend_contract.py
    test_database_read_only.py
    test_query_policy.py
    test_snippet_identity.py
    test_output_limits.py
    test_resource_limits.py
    test_auth.py
    test_log_redaction.py
    test_pjm_immutability.py
  evals/
    corpus.jsonl
    ground_truth.json
    mutations/
    run_baseline.py
    run_graph.py
    score.py
  ops/
    compose.yaml
    runbook.md
    rollback.md
    upgrade.md
```

### 7.2 Runtime state

Keep runtime state in one explicit external directory, never in PJM or the sidecar's tracked tree:

```text
<state-root>/
  active-routing.json
  previous-routing.json
  serving.lock
  sync.lock
  generations/<generation-id>/manifest.json
  mirrors/<generation-id>/...
  upstream/<generation-id>/...
  backends/<generation-id>.sock
  logs/...
```

Validate the resolved state path before deletion or cleanup. Do not use a home-directory root, broad glob, or unresolved environment variable as a destructive target.

Create mutable state directories with mode `0700`; create manifests, locks, logs, and secrets with mode `0600`. A mirror staging directory is `0700` and its files `0600` only while the indexer must write its three state files. After auditing/removing those files, seal source directories `0500` and source files `0400`, and expose them to the query process through an OS-enforced read-only view. Verify effective permissions and an actual failed write attempt; mode bits alone are insufficient if the query identity can simply change them.

Before importing or launching any upstream component, set its verified home setting to `CGR_HOME=<state-root>/upstream/<generation-id>`. Audit the pinned package's `state.json` and all other writes. An upstream process may write only inside the candidate mirror during the known indexing interval, its exact database volume, and that generation's declared upstream-state directory. Any write elsewhere fails the phase.

### 7.3 Dedicated database

Use one dedicated Memgraph service for PJM. Do not share it with the article project or another repository. Multiple PJM generations may coexist temporarily within it, but the façade queries only the exact project in the immutable manifest named by the active routing record.

The stock `v0.0.589` MCP server cannot accept an arbitrary project name. It [derives one from the resolved target path](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/utils/path_utils.py#L16-L24) and fixes the Cypher generator's active project at process startup. Choose one of two implementations:

1. instantiate the exact pinned query components directly with the explicit project in the immutable manifest named by the active routing record; or
2. start one private upstream child per candidate mirror, record its exact derived project name and immutable socket/instance identity, smoke-test that child, and promote the complete routing record that names it.

Changing a manifest alone does not retarget a running stock child. Its startup also validates Orchestrator and Cypher-provider configuration; capture that exact contract in Phase 0.

Make `active-routing.json` the single serving authority. It contains the graph generation, manifest digest, exact derived project name, backend Unix-socket path, backend process/instance identity, protocol version, query-stack fingerprint, and compare-and-swap predecessor. A candidate backend starts and passes identity/smoke checks before this record changes. The façade acquires the serving lock, atomically reads one complete record, connects to that record's immutable generation-specific socket, and verifies the backend handshake matches every identity field. It never maintains a second independent “current backend” pointer.

Promotion is one same-filesystem temporary-write, file `fsync`, atomic rename of `active-routing.json`, and containing-directory `fsync`. On startup or every mismatch, the façade serves no `FRESH` result until the record checksum and backend handshake agree. Recovery may atomically restore the previous routing record only after its graph, mirror, query stack, and live source are proven fresh.

Do not run Memgraph Lab or Qdrant. Do not use the upstream watcher. Do not mount the Docker socket, home directory, PJM root, or secrets into the service. Bind any host port to loopback only.

For a live pilot, the façade must use a database principal that cannot write or invoke unsafe procedures. If the tested Memgraph edition cannot enforce that, expose only fixed, parameterized, project-scoped query templates and reject arbitrary model-generated Cypher. Process/network containment alone is insufficient. A disposable, agent-disconnected Phase 1 spike may accept a documented write-capable credential because the candidate graph is throwaway; it cannot pass the live gate on that basis. Record the selected Memgraph edition, license/cost decision, and authorization test; Memgraph publishes role-based access control in its [edition comparison](https://memgraph.com/pricing).

## 8. Dependency and supply-chain specification

### 8.1 Tool environment

- use a separate Python 3.12 or 3.13 environment, matching versions covered by upstream CI;
- do not assume local Python 3.14 compatibility merely because it is installed;
- lock all direct and transitive Python dependencies with `uv`;
- pin `code-graph-rag==0.0.589` and verify that the installed artifact corresponds to reviewed commit `76b8d6c25e85c7531797c0e946110570b857064d`;
- verify the wheel hash against PyPI before lock creation;
- use only Python Tree-sitter support for PJM;
- set `CGR_SKIP_EMBEDDINGS=true` or its verified equivalent;
- omit `semantic`, Qdrant, PyTorch, Transformers, `ast-grep`, structural search, and structural replacement.

At research time, the published wheel SHA-256 was:

```text
4f2a3b3972b76e92f1586ab7e18c1f950c0b63eec185f7cf739e5a8b58da7811
```

The implementation agent must re-fetch the PyPI metadata and verify this value rather than trusting this document alone.

### 8.2 Container

Do not run `cgr daemon up` blindly. Create a minimal sidecar Compose definition containing only the tested Memgraph image pinned by immutable digest. Record:

- image repository, tag, digest, and platform;
- Apple arm64 compatibility;
- Memgraph version;
- exact Code-Graph-RAG integration test result;
- listener binding;
- volume name and state location;
- CPU, memory, PID, and build-time limits;
- non-root user where supported, dropped Linux capabilities, `no-new-privileges`, and read-only root filesystem except the exact database volume;
- network/egress policy;
- uninstall/removal commands.

No `latest` tag or unpinned image passes review. If a hardening control is unavailable on the selected macOS/container runtime, record the exact gap and decide whether it blocks the spike; live promotion must not silently waive it.

### 8.3 LLM/Cypher provider

Natural-language graph queries require a Cypher-generation provider. Decide and record:

- local versus remote;
- exact model/version;
- what question, schema, symbol, or source information leaves the machine;
- retention and training policy;
- credential source and rotation;
- temperature/determinism settings;
- rate, timeout, and cost limits;
- behavior when the provider is unavailable.

Local is preferred. If a remote provider is used, run a source-egress review and obtain explicit Owner approval. Never place provider or MCP tokens in Git, Compose YAML, logs, or command-line arguments visible to process listings.

### 8.4 Upgrade rule

Every change to Code-Graph-RAG, Python, Tree-sitter grammar, Memgraph, source policy, or indexing code invalidates the graph generation and requires:

1. advisory and release review;
2. lock/digest update in a reviewable change;
3. full unit and integration suite;
4. full golden-corpus comparison;
5. new generation build;
6. explicit promotion or rollback.

Never auto-upgrade.

A Cypher provider/model, prompt/template, inference-setting, query-policy, or façade-output change invalidates the **query stack**, not necessarily the stored code graph. Hash those inputs separately, block queries on drift, rerun the full golden corpus, and deliberately promote the new query-stack fingerprint. Rebuild the graph only when an indexing input changed.

## 9. Canonical policy contract

Use canonical JSON, sorted keys, UTF-8, and no insignificant whitespace before hashing. An illustrative policy is:

```json
{
  "allowed_tools": [
    "get_code_snippet",
    "graph_status",
    "query_code_graph"
  ],
  "deny_stale_queries": true,
  "deny_symlinks": true,
  "include": [
    "src/**/*.py",
    "scripts/**/*.py",
    "tests/**/*.py"
  ],
  "build_limits": {
    "max_build_seconds": 120,
    "max_file_bytes": 1048576,
    "max_files": 200,
    "max_peak_rss_bytes": 4294967296,
    "max_total_source_bytes": 16777216
  },
  "query_limits": {
    "max_output_bytes": 65536,
    "max_query_characters": 2000,
    "max_rows": 100,
    "max_snippet_lines": 240,
    "query_timeout_seconds": 5
  },
  "project_id": "pjm-track-b",
  "schema_version": 1,
  "source_root_realpath_hash": "sha256:computed-not-hard-coded"
}
```

Do not hard-code the user's absolute source path in a tracked policy. Resolve it at runtime from an owner-selected configuration source, verify repository identity, and publish only a hash or redacted path in ordinary status output.

Every response includes the full `policy_hash`. Also derive `source_policy_hash` from projection/indexing fields and include the query-related policy subset in `query_stack_fingerprint`. Any policy change makes service state stale; only a source/indexing-policy change forces a graph rebuild.

The numeric build limits above are proposed pilot ceilings, not implicit Owner approval. Phase 0 must confirm or replace them before copying or indexing. Enforce file count, individual size, aggregate source bytes, build wall time, and process/container memory before and during the build; exceeding any ceiling fails the generation without promotion.

## 10. Freshness and generation contract

### 10.1 Source fingerprint

Enumerate included tracked and eligible untracked regular files without following symlinks. For every file, derive:

```text
repository-relative-path NUL git-compatible-mode NUL byte-size NUL sha256(content) LF
```

Sort records by normalized repository-relative POSIX path and hash the concatenation with SHA-256.

Record separately:

- full Git HEAD;
- branch or detached state;
- whole-repository dirty-at-index flag, captured by the trusted sync controller for audit only;
- indexed-scope dirty flag;
- included tracked/untracked file counts;
- source fingerprint;
- policy hash;
- parser/capture profile hash;
- Code-Graph-RAG version, commit, and wheel hash;
- Memgraph image digest;
- query-stack fingerprint covering Cypher provider/model, prompt/template, inference settings, and query policy;
- start/end timestamps and parser errors.

A Markdown-only dirty change may make the operator's repository-level audit dirty, but it does not set `indexed_scope_dirty` and does not stale an otherwise identical source generation. The live probe does not inspect out-of-scope content merely to recompute a whole-repository dirty flag. A HEAD change is always detected and initially requires a new generation, even if the included content hash is identical; optimize this only after the safety model is proven.

The façade and upstream components never receive general PJM access. A separate minimal freshness probe has an OS-enforced read-only view of the expected Git/worktree identity and root-anchored allowlisted files only. On every `graph_status` or query call it recomputes current HEAD, worktree ID, indexed-scope dirty state, and source fingerprint, then returns only authenticated metadata over local IPC. If the probe is unavailable, mismatched, or cannot be confined read-only on the host, the live service fails closed. An application promise to “only read” is not equivalent to an OS-enforced boundary on macOS; inability to implement the boundary is a live no-go.

### 10.2 Generation identity

Compute `generation_id` from repository ID, worktree ID, full HEAD, source fingerprint, source-policy hash, parser fingerprint, package artifact hash, and engine digest. Keep the query-stack fingerprint separate. Use a safe short prefix only in the internal generation label; retain both full digests in the manifest.

An internal generation label may be:

```text
pjm-track-b-a13f09c7d1e2
```

Do not assume that is the stock upstream project name. A private `v0.0.589` child derives `<mirror-basename>__<8-character-path-hash>` from the resolved `TARGET_REPO_PATH`; record and use the exact derived value in the generation manifest.

### 10.3 Active and candidate status

```text
active_generation_state:
  UNINITIALIZED
  FRESH
  STALE_SOURCE
  STALE_HEAD
  STALE_POLICY
  STALE_VERSION
  STALE_QUERY_STACK
  ERROR

candidate_sync_state:
  IDLE
  BUILDING
  READY_TO_PROMOTE
  FAILED
```

Only `graph_status` responds when the active generation is not `FRESH`. Every other tool fails closed with a structured freshness error. A candidate build or failure does not disable a still-fresh, healthy active generation; if the source/version/policy change that triggered the build already made the active generation stale, it remains unavailable.

### 10.4 Response envelope

Every successful and failed tool result uses a validated, versioned envelope:

```json
{
  "schema_version": 1,
  "advisory_only": true,
  "project_id": "pjm-track-b",
  "generation_id": "sha256:...",
  "policy_hash": "sha256:...",
  "query_stack_fingerprint": "sha256:...",
  "indexed_head": "40-character-sha",
  "current_head": "40-character-sha",
  "indexed_source_fingerprint": "sha256:...",
  "current_source_fingerprint": "sha256:...",
  "active_generation_state": "FRESH",
  "candidate_sync_state": "IDLE",
  "freshness": "FRESH",
  "warnings": [],
  "data": {}
}
```

### 10.5 Full-build lifecycle

1. resolve and verify the expected PJM repository;
2. acquire a cross-process per-project lock;
3. compute the pre-build Git/source state and enforce all resource ceilings;
4. mark candidate sync `BUILDING`; continue serving the active generation only if its independent state remains `FRESH`;
5. create a new policy-scoped mirror using no-follow opens and per-file pre/post `fstat` checks;
6. require `mirror fingerprint == pre-build PJM source fingerprint` before indexing;
7. full-index into a new isolated project while the candidate mirror remains owner/indexer-writable;
8. verify mirror source bytes/modes are unchanged, accept/remove only the three known `.cgr-*` state files, and fail on every unexpected write;
9. verify the mirror fingerprint again, seal it read-only, and run graph/file-scope/parse/symbol/edge audits;
10. start an exact candidate query backend/façade path for this generation without changing the active pointer;
11. run representative end-to-end status, query, snippet, identity, permission, and negative-control smoke tests through that candidate path;
12. recompute PJM source state and require `sealed mirror == pre-build PJM == post-build PJM`; abort if HEAD or included source changed;
13. write/fsync the immutable candidate manifest and a complete candidate `active-routing.json` referencing its already-running generation-specific backend socket; prepare a compare-and-swap from the expected old routing-record digest;
14. under the serving lock, verify the predecessor, atomically rename the single routing record, and `fsync` its containing directory; the façade has no separate mutable backend pointer;
15. run a post-switch identity/status check; on failure, serve no `FRESH` result and atomically restore the verified previous routing record if it is still fresh, then set candidate state `FAILED`;
16. retain one previous known-good generation and sealed mirror;
17. release the lock.

A failed build must not mutate the active generation. The atomically renamed routing record is the sole authority over manifest and backend identity; startup recovery refuses to serve when they disagree. Cleanup of failed or old generations is operator-only and separately authorized.

### 10.6 Why no incremental updater

For the current source volume, full rebuilds should be cheap and much easier to reason about. Upstream's incremental evaluation records residual differences, natural-language queries do not share the updater's process-local lock, and the real-time watcher recalculates calls broadly. Keep incremental updates disabled unless measured full-build p95 exceeds 30 seconds or an Owner-approved resource ceiling. Even then, design and evaluate incremental publication as a new phase.

## 11. Read-only MCP façade

The façade is a new, project-specific server. It may import exact pinned upstream query components or communicate with a generation-specific private upstream child under Section 7.3, but it must never dynamically forward a tool name or schema from upstream.

### 11.1 Tool discovery

`tools/list` returns exactly:

```text
graph_status
query_code_graph
get_code_snippet
```

Each tool has a strict input schema, strict output schema, and correct MCP read-only annotations. Client `enabled_tools` is defense in depth only.

Every forbidden upstream tool name must be absent. Calling one directly, using alternate case/encoding, or smuggling it through an argument returns an unknown-tool or validation error.

### 11.2 `graph_status`

No input and no LLM call. It returns:

- separate active-generation and candidate-sync states plus their last error classes;
- active and previous generation IDs;
- indexed/current HEAD and worktree identity;
- indexed/current source fingerprint;
- repository dirty-at-index audit flag and current indexed-scope dirty flag;
- policy, parser, package, image, and provider fingerprints;
- included file count and parse error summary;
- last successful sync time/duration;
- allowed tool list;
- `advisory_only=true` and role warning.

It obtains recomputed current HEAD and source fingerprint from the OS-confined freshness probe rather than trusting cached state or granting upstream PJM access.

Every query/snippet tool captures a successful probe snapshot immediately before graph execution and again immediately before returning. Both snapshots must match each other and the immutable generation manifest named by the active routing record: HEAD, worktree, indexed-scope fingerprint, policy, and query-stack fingerprints. If they differ, discard the in-flight result as stale; do not return facts computed across the change.

### 11.3 `query_code_graph`

Input:

```json
{
  "question": "What calls pit_capture.capture.classify?",
  "max_results": 50
}
```

Contract:

- reject empty, oversized, status/governance, mutation, raw-Cypher, or out-of-project questions;
- enforce timeout, row, serialized-byte, and token limits;
- return `query_used` for audit;
- return structured facts, not unsupported prose;
- include repository-relative path, qualified symbol, relation/direction, line bounds, and provenance for every fact;
- include truncation and coverage warnings;
- never return another generation or project.

Then use exactly one verified branch:

**Branch A — generated Cypher with database enforcement**

- require a database identity proven unable to write or invoke unsafe procedures;
- call the pinned Cypher generator with strict timeout/cost controls;
- parse the generated Cypher before execution;
- allow read-only clauses and an explicit safe procedure list only;
- reject writes, admin operations, unbounded paths, Cartesian amplification, cross-project access, excessive depth, or absent project filters;
- return the validated generated query as `query_used`.

**Branch B — fixed templates without query-only database enforcement**

- do not call a Cypher generator and never execute model-produced Cypher;
- classify/extract only an allowlisted intent and typed parameters, using deterministic parsing or a constrained model output schema;
- select an immutable, reviewed, parameterized, project-scoped query template by ID;
- reject unknown intent, unexpected parameter, or template mismatch;
- return the template ID, parameters, and fixed query as `query_used`.

The graph may orient an agent; the agent must open the cited source before changing or asserting behavior. In Branch A, parser/validator checks are defense in depth rather than the only protection against graph mutation.

### 11.4 `get_code_snippet`

Input:

```json
{
  "entity_id": "graph-entity-id-from-prior-query",
  "generation_id": "sha256:active-generation",
  "expected_path": "src/pit_capture/capture.py",
  "qualified_name": "pit_capture.capture.capture_attempt",
  "max_lines": 160
}
```

Contract:

- accept the entity ID, active generation, expected repository-relative path, and qualified name from a prior query, never an arbitrary path;
- require the active generation and resolve the entity uniquely;
- verify entity ID, qualified name, and expected path all identify the same node; reject ambiguity or mismatch;
- read from the active read-only mirror, not live PJM;
- remap the mirror location to a repository-relative path in output;
- resolve and contain the path on every request;
- reject symlinks and paths outside policy;
- return exact line bounds, content SHA-256, encoding, and truncation flag;
- apply maximum line and byte limits.

### 11.5 Deferred `flow_verdict`

Do not expose it initially. Static flow analysis is conservative and incomplete, and `NO_FLOW` is easy to overread. A later phase may add it only after PJM fixtures prove:

- positive flows;
- true negative flows with complete coverage;
- missing parser/construct coverage returns `UNKNOWN`;
- source/sink ambiguity is handled;
- cross-function and I/O boundaries are described accurately.

It must never be used as security or runtime proof.

### 11.6 Server instructions

The first 512 characters must be self-contained, as recommended by the [official Codex MCP documentation](https://developers.openai.com/codex/mcp):

> Read-only advisory code intelligence for PJM Track B, for an explicitly authorized Engineering Lead session only. Never use in Orchestrator, Critic, Track A/C, or NotebookLM work. Never infer program status, checkpoint state, permission, or evidence. Call graph_status first. If not FRESH, stop and use Git, rg, and source. Verify every returned path in authoritative source before changes. This tool cannot authorize or certify work.

The tools must enforce freshness even if the client ignores these instructions.

## 12. Client integration

Codex supports STDIO and Streamable HTTP MCP servers, server instructions, tool allow/deny lists, approval modes, timeouts, optional servers, and both user- and project-scoped configuration. Its desktop, CLI, and IDE clients on one host share configuration. These facts make a project-wide entry convenient but also make PJM's role isolation harder. See the [official Codex MCP documentation](https://developers.openai.com/codex/mcp).

### 12.1 First live pilot: STDIO

Use a façade STDIO command in one explicitly authorized Lead client. No network listener or bearer token is then needed for the MCP hop. Memgraph remains loopback-only.

Illustrative user-scoped entry, disabled by default:

```toml
[mcp_servers.pjm_code_graph]
command = "/absolute/path/to/sidecar/.venv/bin/pjm-code-graph-mcp"
args = []
env_vars = ["PJM_CGR_STATE_ROOT", "PJM_CGR_ENABLE_TOKEN"]
enabled_tools = [
  "graph_status",
  "query_code_graph",
  "get_code_snippet",
]
default_tools_approval_mode = "approve"
startup_timeout_sec = 10
tool_timeout_sec = 15
enabled = false
required = false
```

This is illustrative, not authorization to edit `~/.codex/config.toml`. The implementation agent must verify the installed Codex version and prove how a Lead session enables it without exposing the tool to prohibited sessions. The façade should refuse startup without a short-lived activation token, but this is defense in depth rather than a full role identity system.

Do not add a PJM `.codex/config.toml` in the pilot.

### 12.2 Later HTTP option

Only if a real second client exists and the Lead-only role boundary is solved, a loopback Streamable HTTP façade may be considered:

```toml
[mcp_servers.pjm_code_graph]
url = "http://127.0.0.1:18080/mcp"
bearer_token_env_var = "PJM_CGR_MCP_TOKEN"
enabled_tools = [
  "graph_status",
  "query_code_graph",
  "get_code_snippet",
]
default_tools_approval_mode = "approve"
startup_timeout_sec = 10
tool_timeout_sec = 15
enabled = false
required = false
```

HTTP requirements:

- loopback-only bind;
- high-entropy per-pilot token;
- constant-time token comparison;
- bounded sessions and request bodies;
- no unauthenticated fallback;
- no TLS assumption beyond loopback;
- a distinct private backend token if the façade talks to upstream HTTP;
- no LAN, tunnel, cloud, or remote exposure.

### 12.3 Client allowlists are not the boundary

Keep the three-tool `enabled_tools` list, but test the server independently. A different MCP client, configuration drift, or direct request must still be unable to discover or call forbidden tools.

## 13. Security and privacy controls

### 13.1 Required controls

- positive root-anchored source projection;
- no direct PJM mount in index/query services;
- a separate OS-confined, read-only freshness probe exposing metadata only;
- separate Python environment and dedicated database;
- server-side three-tool registry;
- read-only mirror for snippets;
- coherent mirror proof before and after indexing;
- symlink and resolved-path containment checks;
- generation-scoped project filter on every database query;
- query-only database identity, or fixed parameterized query templates when unavailable;
- parse-and-validate generated Cypher as defense in depth;
- row, traversal, timeout, request, response, and snippet limits;
- file-count, per-file, aggregate-source, build-time, CPU, memory, and PID limits;
- loopback-only services;
- non-root execution where supported, dropped capabilities, `no-new-privileges`, and restrictive state/mirror permissions;
- no Docker socket, home mount, `.env`, PJM credentials, or data mount;
- secret-safe structured logs with restrictive permissions and rotation;
- no remote provider without explicit egress approval;
- fail-closed freshness and provider behavior;
- exact artifacts/digests and reproducible locks;
- no updater or cleanup authority in agent-facing processes.

### 13.2 Query policy

At minimum reject Cypher containing or invoking:

```text
CREATE MERGE DELETE DETACH SET REMOVE DROP LOAD CSV
CALL outside an explicit allowlist
APOC or administrative procedures
cross-project matches
unbounded variable-length paths
dynamic labels/properties not in the schema allowlist
```

Do not enforce this with substring matching alone. Parse the query or use the exact upstream validated read-only layer plus additional project-scope checks. A live service executes arbitrary generated Cypher only with mandatory database-enforced read-only permissions and timeouts; otherwise it executes fixed templates only.

### 13.3 Prompt and source injection

Treat repository comments, names, docstrings, and questions as untrusted data. The Cypher model is permitted to produce a query only; it does not receive tools, filesystem access, shell access, or authority to answer generally. Validate its output independently and return graph facts rather than its narrative.

### 13.4 Logs

Allowed fields:

- timestamp and request ID;
- client/session class, never a credential;
- tool name, duration, generation, policy hash, freshness;
- row/result count, truncation, and error class;
- sync duration, included file count, parser errors, and audit result;
- aggregate provider token/cost totals if remote.

Never log:

- full natural-language questions;
- source snippets or complete generated answers;
- environment values;
- bearer/activation/API tokens;
- governance, evidence, program-state, or data contents;
- absolute user paths unless a protected diagnostic mode is explicitly enabled.

## 14. Phased execution plan

Each phase has an independent authorization and exit gate. Passing one does not authorize the next.

Phases 0–3 are an Owner-authorized external sidecar task with PJM strictly read-only; they are not an Engineering checkpoint. Phase 4 or any PJM mutation requires the ratified-plan and one-checkpoint-brief route in Section 1.2.

Apply acceptance gates by phase; do not require a later component before it exists:

| Phase | Gates that must pass to continue |
|---|---|
| 0 | authority, owner decisions, artifact/advisory verification, image/platform, provider/privacy, state boundaries, and pre-registered ceilings |
| 1 | mirror coherence/scope, PJM immutability, declared-write containment, resources, baseline correctness, and pre-registered value; a disposable write-capable DB credential may be recorded only here because no agent is connected |
| 2 | exact three-tool surface, strict schemas, path/snippet identity, logging/auth, and one safe query branch: database-enforced read-only generated Cypher or fixed templates |
| 3 | OS-confined freshness probe, two-probe query race protection, generation isolation, candidate smoke, single-record routing promotion, crash recovery, and last-good retention |
| 4 | client/session activation and PJM role isolation |
| 5 | second-client parity, only if a second client exists |
| 6 | real-task correctness, utility, cost, and maintenance results |

Permanent promotion requires every applicable Phase 0–6 gate, not merely the Phase 1 spike gates.

### Phase 0 — governance and capability audit

**PJM writes:** none  
**Persistent install:** none without approval

Tasks:

1. read `AGENTS.md`, establish role, and state the authority boundary;
2. capture PJM HEAD, status including all untracked files, branch, remotes without mutation, and worktree topology;
3. confirm that the supplied recommendation document and all unrelated state are preserved;
4. re-check PyPI latest release, artifact hashes/attestation, release notes, license, and all advisories;
5. inspect the exact candidate wheel in a disposable environment, including `tools/list`, schemas, HTTP/STDIO transport, path handling, mirror-local state files, `CGR_HOME`/`state.json`, and update locks;
6. resolve a tested immutable Memgraph digest, Apple arm64 support, edition/license/cost, and query-only authorization capability;
7. verify the stock derived-project-name and child-startup configuration contract, then choose direct components or per-generation private children;
8. design and prove the OS-enforced read-only freshness-probe boundary on this host;
9. decide local/remote Cypher provider and document egress, retention, credentials, and cost;
10. pre-register file/build/container/provider cost and resource ceilings, including the proposed policy values;
11. decide the exact sidecar/state locations, permissions, and cleanup boundary;
12. record whether a second real agent client exists;
13. produce a signed-off capability and Owner-decision matrix.

Exit gate: all prerequisites and Owner decisions are explicit. Otherwise an external report uses `phase_disposition=OWNER_ACTION_REQUIRED` or `AUTHORIZATION_MISSING`; a briefed Track B return uses `BLOCKED` or `BRIEF_INVALID` with that reason code.

### Phase 1 — disposable value spike

**PJM writes:** none  
**Agent configuration:** none

Tasks:

1. create the external sidecar skeleton and locked environment;
2. build a coherent disposable policy-scoped PJM source mirror and verify pre/mirror/post equality;
3. start only digest-pinned Memgraph on loopback;
4. disable embeddings, structural tools, Lab, Qdrant, and watcher;
5. set a generation-specific `CGR_HOME`, full-index one generation, audit the three expected mirror `.cgr-*` writes plus declared upstream state, remove the mirror state files, and seal the mirror;
6. run graph-integrity, mirror-integrity, scope, resource, and derived-project-name audits;
7. run the evaluation corpus against the normal `rg` plus direct-source workflow, randomizing graph/baseline order across fresh sessions;
8. measure index time, peak memory, disk, provider calls/cost, query latency, correctness, and failures;
9. verify exact PJM pre/post Git status equality;
10. stop services and retain only approved evaluation artifacts.

Exit gate: every **Phase 1-applicable** gate in the matrix above and the pre-registered value threshold passes. Otherwise report `phase_disposition=SPIKE_FAIL_DEFER_TO_POST_M1` and do not build the façade.

### Phase 2 — façade MVP

**Prerequisite:** explicit authorization after Phase 1

Tasks:

1. implement versioned strict models and error codes;
2. implement exactly the three tools;
3. add correct MCP read-only annotations and output schemas;
4. implement fixed project/policy handling;
5. implement path containment, symlink rejection, remapping, and output limits;
6. implement generated-Cypher validation and project scoping with a mandatory query-only database identity, or fixed parameterized templates;
7. implement token/activation checks and redacted logging;
8. use a fake backend for default tests;
9. prove all forbidden tools are absent and uncallable;
10. audit the installed package contract against the adapter.

Exit gate: the independent tool-surface, path, query-policy, and log tests pass. No client connection yet.

### Phase 3 — safe generation sync

**Prerequisite:** façade MVP accepted

Tasks:

1. implement deterministic enumeration and fingerprinting;
2. implement coherent mirror creation, expected state-write auditing, removal, and post-index read-only sealing;
3. implement generation ID, exact upstream-derived project naming, and backend lifecycle;
4. implement full build, candidate façade smoke audit, and pre/mirror/post source comparison;
5. implement the single authoritative routing record, immutable generation socket/identity handshake, serving lock, atomic rename, directory `fsync`, startup recovery, compare-and-swap rollback, and last-good retention;
6. implement inter-process locking;
7. implement stale detection on every status/query call;
8. simulate crash/failure at every lifecycle step;
9. prove failed builds cannot alter active query results;
10. keep incremental updates disabled.

Exit gate: no partial generation is ever visible, and recovery tests are deterministic.

### Phase 4 — one-client Engineering Lead pilot

**Prerequisite:** applicable Owner-ratified checkpoint plan, active valid one-checkpoint Lead brief, plus exact Owner approval/suspension for the selected user-client configuration

Tasks:

1. configure one client, disabled by default;
2. prove the activation mechanism is limited to the intended Lead session;
3. verify server instructions and exactly three visible tools;
4. test service down, stale graph, wrong token, missing token, timeout, malformed output, reconnect, and tool-list drift;
5. run five to ten real Lead orientation/impact tasks;
6. require direct source verification and normal tests after any graph-assisted change;
7. disable the service before spawning Critics or switching roles;
8. inspect metrics and all logs for source/secret leakage.

Exit gate: role isolation and all acceptance gates pass. Otherwise disable immediately.

### Phase 5 — optional second client

Only if a real second client is installed and separately authorized:

1. choose STDIO per client or justify HTTP;
2. run the same contract/negative tests in both clients;
3. verify both report the same active generation and policy hash;
4. prove neither client can update, delete, enumerate, or cross-query;
5. repeat role isolation tests.

The absence of a second client is not a reason to install one merely to complete the phase.

### Phase 6 — measured live trial

Run 10–20 real Lead tasks over one to two weeks. Collect only approved operational metrics. Stop if graph use:

- influences program/checkpoint decisions;
- appears in Critic evidence;
- crosses source/worktree boundaries;
- serves stale data;
- returns unsupported claims;
- increases total time or maintenance burden;
- cannot be kept disabled outside Lead sessions.

### Phase 7 — promote, defer, or remove

Produce a raw task-by-task report. The Owner chooses:

- **promote:** retain the external sidecar and define maintenance ownership;
- **defer:** disable and reassess after M1, CP-1, or another explicit milestone;
- **remove:** unregister clients and remove runtime state through the approved rollback.

Do not leave a partially maintained “temporary” live service.

## 15. PJM evaluation corpus

Ground truth must be prepared by AST/manual source inspection, never from the graph being tested. Freeze it to the evaluated source fingerprint.

### 15.1 Structural truth questions

1. Does `pit_capture.cli.main` call `capture_attempt`?
2. Which functions does `capture_attempt` call?
3. Which functions does `classify` depend on?
4. What calls `expected_quarter_hour_count`?
5. What does `expected_quarter_hour_grid_utc` call?
6. Which internal helpers does `ledger.append_entry` call?
7. Which production functions are exercised by each DST-related test?
8. What is the impact surface of changing `LedgerEntry`?
9. What is the impact surface of changing `delivery_day_window_utc`?
10. How do scripts import `spike.entsoe_helpers`, including path setup?
11. Where is the `ENTSOE_API_TOKEN` environment variable read?
12. Where are ENTSO-E HTTP, SMARD HTTP, and SFTP reachability operations initiated?
13. Which code writes beneath `data/`?
14. Which modules import each package initializer?
15. Can the graph distinguish same-named local/test symbols?

### 15.2 Mutation/freshness cases

16. add an eligible source file;
17. modify a function body without changing its name;
18. add/remove a call edge;
19. delete a file;
20. rename a file and symbol;
21. introduce a syntax error;
22. make an included file unreadable;
23. create an eligible untracked source file;
24. make a Markdown-only dirty change;
25. switch HEAD/branch to distinct source;
26. alter the include policy;
27. alter the parser fingerprint;
28. fail a build after the new project is partly populated.

Run these against disposable fixtures or copies, not the PJM working tree.

### 15.3 Security negative controls

29. create a nested `.claude/worktrees/.../src/poison.py`; it must never be mirrored;
30. create a symlink from an allowed path to an external secret; mirror construction must fail;
31. attempt `../`, absolute, encoded, Unicode-normalized, and case-variant path escapes;
32. request `write_file`, `read_file`, `ask_agent`, index, update, delete, wipe, directory list, and replace tools;
33. submit raw mutating Cypher and unsafe procedures;
34. submit an unbounded traversal and result-explosion query;
35. use a missing, wrong, expired, or other-session token;
36. attempt to query another project/generation;
37. change a source file during copy/index and restore it before the post-check; mirror/pre/post equality must still reject an incoherent candidate;
38. disable, spoof, or remove the read-only freshness probe; all query tools must fail closed;
39. change an allowlisted file between a query's pre-execution and pre-return probes; discard the in-flight result;
40. exceed each file-count, size, total-byte, build-time, CPU/memory/PID, and output ceiling;
41. inspect logs for questions, snippets, tokens, environment values, and absolute paths.

### 15.4 Governance negative controls

42. ask for the current checkpoint or whether work may land;
43. ask whether a candidate has passed Critic review;
44. ask for Track A/C program material;
45. try to use the server from an Orchestrator or Critic session;
46. ask the graph to certify an edit or provide evidence.

The service must refuse, explain the boundary briefly, and direct the agent to the proper governed source/process without reading it.

### 15.5 Experimental method

- randomize baseline/graph order across fresh sessions to reduce learning and cache effects;
- preserve exact prompts and scoring keys in protected evaluation artifacts, but do not place source-sensitive prompts in operational logs;
- score file-set precision/recall, edge precision/recall, factual correctness, time to first useful fact, total time, files opened, context use, and unsupported claims;
- record warm and cold latency separately;
- publish every task result, not only aggregates;
- do not label a 20-question pilot statistically significant.

## 16. Acceptance criteria

Apply these criteria at the phase assigned in Section 14. Failure of any criterion mandatory for the current phase means stop/defer; live promotion requires the complete applicable set. Do not negotiate a threshold after observing results.

### 16.1 Mandatory policy and security

- exactly three tools are visible;
- zero forbidden tools are visible or callable;
- zero files are written to or created in PJM;
- every upstream write is confined to the declared generation mirror during indexing, exact database volume, or generation-specific `CGR_HOME`; nothing is written to the default `~/.cgr` or elsewhere;
- PJM pre/post full status, including untracked files, is identical;
- zero indexed files fall outside the positive include set;
- zero nested-worktree, root Track A, Markdown, data, secret, evidence, or governance files enter mirror or graph;
- all symlinks and special files are rejected;
- absolute, parent, normalization, encoding, and remapping escapes are rejected;
- no listener binds outside loopback;
- missing/wrong credentials or activation fail closed;
- mutable state uses `0700`/`0600`; sealed mirror directories/files use `0500`/`0400`, are inaccessible to group/other, and an actual query-process write attempt fails under the OS-enforced read-only view;
- no token, source snippet, full question, environment value, or governance content appears in logs;
- package version, commit, wheel hash, parser fingerprint, image digest, and provider fingerprint are recorded;
- all approved file/build/container/provider resource ceilings are enforced;
- the service is disabled by default and unavailable to prohibited roles;
- no raw Cypher is accepted from an agent;
- no query can cross generation or project scope.
- arbitrary generated Cypher uses a proven query-only database identity; otherwise only fixed parameterized templates are available.

### 16.2 Freshness and recovery

- 100% detection of included-source, HEAD, policy, parser, package, image, provider, and worktree changes;
- query-stack drift blocks queries until its separate fingerprint and corpus are promoted without forcing an unrelated graph rebuild;
- Markdown-only dirty changes do not stale the scoped code graph;
- no query is served unless active state is `FRESH` and its pre/post probe snapshots agree;
- source changes during copying or build, including change-and-restore, prevent promotion unless `mirror == pre == post`;
- an unavailable, writable, or unauthenticated freshness probe prevents live queries;
- a failed build leaves the last-good generation and mirror intact;
- a failed candidate build does not disable a still-fresh, healthy active generation;
- candidate smoke tests run before promotion; one atomically renamed routing record is authoritative, its backend identity handshake must agree, and crash/startup recovery never serves a split state;
- every response reports the active generation and indexed/current identity;
- full rebuild p95 is 30 seconds or less on current PJM, or live use remains deferred;
- there is zero silent update failure and zero partial-generation exposure.

### 16.3 Correctness

- definition and import truth is 100% on the scoped corpus;
- caller/callee edge precision is at least 0.98;
- caller/callee edge recall is at least 0.95;
- every fact includes inspectable repository-relative path, qualified symbol, and line range;
- snippet retrieval requires matching entity ID, generation, expected path, and qualified name and rejects ambiguity;
- no unsupported natural-language factual claim is returned as a graph fact;
- ambiguity and parser gaps are explicit;
- `flow_verdict` remains unavailable until its separate gate passes.

### 16.4 Utility

- no accuracy regression versus `rg` and direct source;
- satisfy one pre-registered value path: **A)** at least 20% median total-time reduction on the designated multi-hop tasks with no lower accuracy metric; or **B)** at least a 10 percentage-point gain in file-set F1 or edge recall on at least five designated multi-hop tasks, zero severe unsupported claims, and no more than 10% median time increase;
- benefit occurs across several tasks, not one demonstration;
- warm query p95 is at most three seconds excluding an approved remote-provider latency exception;
- provider cost stays inside the pre-agreed ceiling;
- maintenance burden is measured and acceptable;
- Lead agents still open authoritative files before edits.

### 16.5 Role isolation

- the tool is unavailable in Orchestrator, Critic, Track A/C, NotebookLM, and ambiguous sessions;
- no Critic assignment, verdict, integration verdict, Return Packet, or checkpoint evidence cites graph output;
- no Builder sees a graph from another snapshot;
- role switch or Critic spawn is preceded by confirmed deactivation;
- client config drift is detected by a contract test.

## 17. Test strategy

Default sidecar checks must be local and require neither network nor Docker:

```text
pytest -q
ruff check .
ruff format --check .
```

Use fake backends for default tool, policy, freshness, generation, and error tests.

Mark a separate integration suite that exercises:

- the exact pinned wheel;
- real digest-pinned Memgraph;
- Python/Tree-sitter parsing;
- real MCP initialization and `tools/list`;
- STDIO lifecycle and optional HTTP authentication;
- generated-Cypher policy;
- query-only database identity or fixed-template fallback;
- graph project scoping;
- exact upstream-derived project name and per-generation child routing;
- coherent mirror copy, expected `.cgr-*`/`CGR_HOME` write audit, sealing, query-process write failure, and permissions;
- OS-confined freshness-probe failure/spoof behavior;
- full candidate smoke, generation build, single-routing-record promotion, crash/startup recovery, and rollback;
- stale rejection and recovery;
- source mirror remapping;
- every file/build/container/output resource ceiling;
- all forbidden-tool negative controls;
- PJM status immutability.

Run integration tests manually or in a future sidecar-only CI system. Do not add a PJM GitHub Actions workflow during the spike.

## 18. Operations

### 18.1 Operator actions only

Only an authorized human/operator path may:

- build or promote an index generation;
- start/stop/update Memgraph;
- change policy, version, parser, model, or images;
- delete a generation, project, mirror, log, or volume;
- issue/revoke activation or HTTP tokens;
- edit client configuration.

No agent-facing tool triggers these actions.

### 18.2 Health checks

Before a Lead uses the graph:

1. verify role and active brief;
2. verify the service was intentionally activated for this session;
3. call `graph_status`;
4. confirm `FRESH`, correct HEAD/worktree, policy hash, and generation;
5. stop if any field is unexpected.

### 18.3 Monitoring

Track:

- active status and generation;
- stale transitions and rejected calls;
- sync success/failure/duration;
- mirror file and graph node/edge counts;
- parse failures;
- query latency/result/truncation/error class;
- provider aggregate use/cost;
- fallbacks to direct source;
- client tool-list drift.

Use bounded log rotation and restrictive file permissions. Do not create a network dashboard for the pilot.

### 18.4 Recovery

The graph is disposable. Recovery is a full rebuild from the verified source allowlist. Preserve dependency locks, policy, manifests, eval results, and minimal operational logs; do not treat database backup as source of truth.

If the active graph is damaged, atomically point to the retained last-good generation only if it is still fresh for the current PJM state. Otherwise remain stale and rebuild.

## 19. Rollback and kill switch

Immediate disable triggers include:

- any forbidden tool visible or callable;
- any write to PJM;
- any out-of-scope or cross-worktree content;
- a stale or partial result marked `FRESH`;
- a path-containment/symlink failure;
- source, token, environment, or governance leakage;
- availability in a prohibited role;
- repeated unsupported structural claims;
- incompatible container/package upgrade;
- cost or maintenance ceiling breach.

Rollback sequence:

1. disable the client entry or terminate the authorized STDIO session;
2. stop the façade/private backend;
3. stop dedicated Memgraph;
4. verify no MCP, Memgraph, Qdrant, or Lab listener remains;
5. revoke activation and provider credentials used by the pilot;
6. restore the exact prior client configuration under the same authorization rules;
7. capture and compare PJM status and normal tests;
8. retain policy, manifests, raw evaluation results, and redacted logs for review;
9. remove packages, mirrors, generations, and volumes only on explicit Owner instruction and only by validated exact paths;
10. return all agents to Git, `rg`, direct source reads, and project tests.

Rollback must require no PJM source migration or graph-derived recovery.

## 20. Effort estimate

The original document's 16–29 hour estimate is optimistic for the corrected safety model. A realistic range after prerequisites are available is:

| Phase | Estimate |
|---|---:|
| Governance/capability audit | 0.5–1 day |
| Reproducible isolated spike and corpus | 1–2 days |
| Read-only façade and unit tests | 2–3 days |
| Generation-safe sync and recovery tests | 2–4 days |
| One-client role-isolated pilot | 1–2 days |
| Analysis, runbook, and handoff | 0.5–1 day |

Total for a robust live candidate is roughly **7–13 engineering days**, excluding delays for Owner decisions, provider/privacy review, or upstream compatibility problems. The disposable Phase 0–1 spike is much smaller and is the only work recommended now.

This cost is disproportionate to 2,033 current Python LOC unless the spike shows unusual value. Reassessment after M1 is economically sensible.

## 21. Required implementation handoff

At the end of each authorized phase, the fresh agent returns:

1. role and exact authority used;
2. PJM pre/post HEAD, branch, worktrees, and full status;
3. every external file created/changed with one-line purpose;
4. every host install, image, model, credential class, listener, volume, and process introduced;
5. exact Code-Graph-RAG version/commit/wheel hash, parser versions, Memgraph digest, and provider fingerprint;
6. tool-list and schema capture;
7. policy and generation manifests;
8. commands/tests executed with results;
9. raw per-question baseline and graph scores;
10. security/freshness negative-control results;
11. resource/cost measurements;
12. deviations, unresolved risks, the valid PJM terminal status when applicable, and the subordinate reason code or external phase disposition;
13. exact rollback steps and whether they were drilled;
14. no commit/push/PR unless separately and validly authorized by PJM's existing rules.

The agent must not summarize a failed mandatory criterion as “mostly passed.”

## 22. Explicitly out of scope

- project/program status tracking;
- reading or indexing governance, anchors, evidence, or program Markdown;
- updating `progress.md`;
- checkpoint opening, closure, landing, or evidence production;
- Orchestrator or Critic access;
- code editing through Code-Graph-RAG;
- stock `ask_agent`;
- file read/write/list, replace, delete, wipe, index, or update tools exposed to agents;
- raw Cypher supplied by agents;
- semantic embeddings, Qdrant, PyTorch, Transformers, ast-grep, or structural replacement;
- automatic real-time watcher;
- incremental updates before a separate measured need;
- shared multi-repository database;
- remote, LAN, tunneled, or cloud MCP service;
- data/model lineage, DVC, MLflow, runtime tracing, experiment tracking, monitoring, or forecasting changes;
- installing a second client solely for the pilot;
- any push, PR, publication, or commit to `main`.

## 23. Implementation-time unknowns

The fresh agent must verify rather than assume:

- the latest safe release and its exact installed-wheel behavior;
- the exact tool registry and schemas in that artifact;
- Apple arm64 compatibility of the selected immutable Memgraph image;
- the resolution of the Memgraph 3.x incompatibility;
- query-only Memgraph authorization support;
- full-index duration, memory, and disk use on this machine;
- accuracy on PJM's package and script-import layout;
- provider privacy, retention, deterministic settings, and cost;
- the installed Codex version's session-scoped activation behavior;
- whether a real second client exists and is authorized;
- whether a valid brief/suspension authorizes any future PJM or client-config edit.

Passing a technical test never grants governance authority.

## 24. Final recommendation

The supplied orchestrator recommendation should not be implemented verbatim. Keep its read-only, freshness, security, benchmark, and rollback principles, but replace universal access and a live main-root index with role-scoped, positive-allowlist, generation-isolated architecture.

The next action is a small external benchmark, not a live service:

> **Build nothing inside PJM. With explicit approval for prerequisites, coherently copy one disposable Track B Python mirror, keep it writable only for the audited indexing interval, then remove expected state files and seal it read-only. Compare the graph against the normal `rg` plus direct-source workflow. If the Phase 1 gates and pre-registered value threshold do not pass, stop and reassess after M1.**

## Sources

- [Code-Graph-RAG repository](https://github.com/vitali87/code-graph-rag)
- [Pinned v0.0.589 release](https://github.com/vitali87/code-graph-rag/releases/tag/v0.0.589)
- [Pinned source commit](https://github.com/vitali87/code-graph-rag/commit/76b8d6c25e85c7531797c0e946110570b857064d)
- [PyPI package and release artifacts](https://pypi.org/project/code-graph-rag/)
- [Installation guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/getting-started/installation.md)
- [MCP guide and complete tool surface](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/mcp-server.md)
- [Architecture overview](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/overview.md)
- [Graph schema](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/graph-schema.md)
- [Security model](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/security.md)
- [Real-time update guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/realtime-updates.md)
- [Upstream evaluation material](https://github.com/vitali87/code-graph-rag/tree/v0.0.589/evals)
- [Updater state-file implementation](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/graph_updater.py#L158-L201)
- [Upstream `CGR_HOME` default](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/config.py#L207)
- [Upstream `state.json` location](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/cgr_state.py#L12-L23)
- [Upstream project-name derivation](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/utils/path_utils.py#L16-L24)
- [Unscoped CALLS deletion used by the watcher](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/constants/graph.py#L372)
- [Security advisories](https://github.com/vitali87/code-graph-rag/security/advisories)
- [Memgraph compatibility issue #1257](https://github.com/vitali87/code-graph-rag/issues/1257)
- [Proposed compatibility fix #1259](https://github.com/vitali87/code-graph-rag/pull/1259)
- [Memgraph edition comparison](https://memgraph.com/pricing)
- [Official Codex MCP documentation](https://developers.openai.com/codex/mcp)
