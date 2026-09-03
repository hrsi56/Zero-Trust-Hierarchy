# Engineering Lead Live Code Intelligence

## Code-Graph-RAG reference implementation for the Zero-Trust Hierarchy

**Research date:** 2026-08-14

**Method repository reviewed:** `Zero-Trust-Hierarchy` at Git commit `8151927d363d6b916d277ee2d353e92eb3193a06`

**Upstream baseline reviewed:** Code-Graph-RAG `v0.0.589`, commit `76b8d6c25e85c7531797c0e946110570b857064d`

**Prior recommendation analyzed:** `/Users/djourno/Downloads/code-graph-rag-universal-agent-integration-recommendations.md`

**Intended implementer:** a fresh implementation agent, not an active Orchestrator or Critic

**Status:** implementation specification; not permission to install dependencies, edit an adopting project's locked agent configuration, or activate a live service

## Executive decision

Add **Live Code Intelligence** to the Zero-Trust Hierarchy as an **optional Engineering Lead capability**, and document Code-Graph-RAG as the current reference implementation.

This does **not** mean indexing the article repository. The article, Rulebook, templates, and Builder define how adopting projects configure their agents. The implementation therefore has two separate outputs:

1. a safe, project-neutral Code-Graph-RAG sidecar that an authorized Engineering Lead can query while working in an adopting project; and
2. a coherent change to the method's canonical text and generated prompts explaining when that capability may be used, how freshness is established, and what its output can and cannot prove.

The capability belongs at Tier 2 because the Engineering Lead already owns architecture, tools, decomposition, and integration. It creates no new role or authority tier. The Owner may ratify whether the capability exists and what data boundary applies; the Lead decides whether and how to use an available optional capability inside a valid checkpoint. The Orchestrator must not prescribe graph queries or turn the reference implementation into checkpoint architecture.

The live service must not be the stock upstream MCP server. The stock server exposes mutation, indexing, deletion, broad file access, and an internal agent with file and shell tools. Instead, put an independent façade in front of pinned upstream query components and expose only three read-only tools in the first release:

```text
graph_status
query_code_graph
get_code_snippet
```

Every graph answer is advisory. A decision-bearing claim must be verified against the current source or another authoritative artifact. A stale, unavailable, out-of-scope, or ambiguous graph is a reason to fall back to direct source inspection, not a reason to invent an answer or lower the checkpoint bar.

### Disposition of the prior universal-agent recommendation

The attached recommendation was directionally right to propose a live query façade, freshness metadata, provenance, fallback behavior, and a measured pilot. This specification narrows and hardens that proposal: access is Engineering-Lead-only rather than universal; the article repository is guidance rather than an index target; source scope is a positive subset of the Lead's authorized influence boundary; version 1 uses no stock MCP server, service-side LLM, watcher, incremental update, or raw Cypher; and every activation has technical isolation, revocation, and lifecycle attestation. Those corrections preserve the useful idea without changing the hierarchy's authority or evidence model.

### Decision summary

| Question | Decision |
|---|---|
| Describe the capability in the article? | **Yes** |
| Make it a universal method invariant? | **No** |
| Make Code-Graph-RAG the only permitted implementation? | **No; reference implementation only** |
| Give the Engineering Lead access? | **Yes, after the deployment gates pass** |
| Require the Lead to use it on every checkpoint? | **No** |
| Expose the stock upstream MCP server? | **No** |
| Allow the graph to replace direct source verification? | **No** |
| Give the Orchestrator access? | **No** |
| Give Builders or ordinary Critics access in the first profile? | **No; only a separately authorized fixture-only Critic may invoke the capability when the capability itself is the candidate under review** |
| Use automatic filesystem watchers? | **No** |
| Let graph failure block ordinary engineering? | **No, unless an Owner-ratified bar explicitly made the capability mandatory** |

## 1. Scope

### 1.1 In scope

- a generic method concept named **Live Code Intelligence**;
- Code-Graph-RAG as its first tested reference implementation;
- a read-only MCP façade for the Engineering Lead;
- positive, role-compatible project indexing policy;
- exact source and generation identity;
- dirty-worktree-aware freshness checks;
- explicit, generation-safe graph rebuilds;
- decision-bearing provenance rules;
- Codex configuration guidance and a client-neutral MCP contract;
- article, Rulebook, template, Builder, validation, and generated-publication changes;
- a measured rollout, rollback, and removal path.

### 1.2 Out of scope

- indexing the `Zero-Trust-Hierarchy` article repository for its own maintenance;
- making a graph answer authoritative program state, acceptance evidence, or a Critic verdict;
- source editing through Code-Graph-RAG;
- automatic code modification or optimization;
- project status tracking;
- reading program/governance material forbidden by an Engineering Lead's influence boundary;
- Orchestrator source inspection;
- seeding Critics with the Lead's graph-derived narrative;
- semantic embeddings, Qdrant, structural replacement, dead-code deletion, or real-time watchers in the initial profile;
- a shared graph database across unrelated projects;
- a remotely reachable MCP service in the initial profile;
- installing prerequisites or changing credentials without the adopting Owner's approval.

## 2. Method-level capability contract

### 2.1 Definition

**Live Code Intelligence** is a disposable, revision-bound cache of structural facts derived from an adopting project's allowed source scope. It helps an Engineering Lead form and test hypotheses about code relationships. It does not own work, authorize scope, judge acceptance, or change the source of truth.

The method-level definition must remain vendor-neutral. The article may name Code-Graph-RAG in a clearly labeled reference profile, just as the method names Git as its current execution profile without treating Git as the universal invariant.

### 2.2 Authority allocation

| Actor | Authority concerning the capability |
|---|---|
| Architect / Owner | Ratifies whether the capability may be installed, data/provider boundaries, credentials, durable configuration, and any mandatory use stated in a governing bar |
| Orchestrator | Reports already-ratified availability and preconditions in a brief; does not choose the product, queries, index architecture, or use sequence |
| Engineering Lead | Chooses whether and how to use an available optional capability; validates freshness; verifies decision-bearing results; records provenance |
| Builder | No access in the initial profile; receives only its bounded assignment and direct project sources |
| Component Critic | No access to the production Lead tenant or graph-assisted analysis; when the capability itself is the candidate, a separately authorized fresh Critic may invoke a disposable fixture-only test instance with bounded review credentials |
| Integration Critic | No access to the production Lead tenant or graph-assisted analysis; independently reviews the final candidate and evidence currency, subject to the same candidate-under-test exception |

Code-Graph-RAG is a tool used by a role, not a seventh role. Its internal LLM is not an Orchestrator under the method and receives no authority from that name.

### 2.3 Availability is not a command to use

The Checkpoint Brief may state that the capability is:

```text
PROHIBITED
OPTIONAL
REQUIRED_BY_BAR
```

`OPTIONAL` reports an already-ratified capability that is available to this Lead; it does not let the Orchestrator prescribe HOW. `REQUIRED_BY_BAR` is valid only when the exact ratified plan or higher-order governance already requires it and the brief cites that requirement; the Orchestrator may not invent it.

If an optional service is absent, stale, or unhealthy, the Lead continues with `rg`, direct file reads, language tooling, tests, and other authorized methods. That condition is not `BRIEF_INVALID`, `BLOCKED`, or a reason to pause the active clock. If a ratified bar genuinely requires the capability and it cannot be supplied, the Lead reports the appropriate existing terminal state without weakening the bar.

### 2.4 Eight non-negotiable use rules

1. **Status before graph facts.** The Lead calls `graph_status` before the first graph query and the façade rechecks freshness internally on every later call.
2. **Revision binding.** Every result names the indexed generation, source fingerprint, repository/worktree identity, and indexed/current revision state.
3. **Direct verification.** A graph result that affects architecture, decomposition, scope, risk, or an engineering claim is verified in current authoritative source before action.
4. **No acceptance borrowing.** A graph answer is not a test, independent oracle, Critic verdict, evidence of PASS, or proof of absence.
5. **No scope expansion.** The tool cannot reveal or legitimize material outside the Lead's ratified read/influence boundary.
6. **Provenance survives.** Decision-bearing queries and their source verification are recorded under the existing workbench and Return Packet provenance rules.
7. **Staleness fails closed.** A source, policy, provider, parser, or backend identity mismatch discards in-flight results and returns a structured stale/error response.
8. **No hidden refresh.** Index rebuilds are explicit, audited operations. The initial agent-facing MCP surface cannot initiate them.

### 2.5 What the graph can help with

Good initial uses include:

- locating definitions and qualified symbols;
- finding callers, callees, imports, inheritance, implementations, and route relationships;
- identifying likely change surfaces before decomposition;
- tracing a multi-file structural path;
- discovering tests structurally connected to a symbol;
- comparing an architectural hypothesis with observed graph edges;
- finding candidate ownership seams for Builder assignments;
- highlighting areas requiring direct inspection.

### 2.6 What it cannot establish

Do not use it alone to claim:

- that code is correct, secure, complete, reachable, unreachable, or dead;
- that runtime behavior matches static structure;
- that no caller, flow, or dependency exists;
- that an acceptance criterion passed;
- that a prior Critic verdict remains current;
- that a project status, plan, or governance fact is true;
- that an unsupported language/configuration/generated surface is irrelevant;
- that a source snippet from one generation describes the current worktree.

`flow_verdict` remains deferred. If later enabled, `NO_FLOW` is usable only when the result proves complete coverage for every relevant module; otherwise the only safe negative result is `UNKNOWN`.

## 3. Reference architecture

```text
Engineering Lead client
        |
        | MCP: exactly three read-only tools
        v
+------------------------------+
| Engineering Lead MCP façade  |
| schemas, status, limits,      |
| provenance, query policy     |
+---------------+--------------+
                |
       +--------+---------+
       |                  |
       v                  v
freshness probe      active query adapter
       |                  |
       |                  v
       |          isolated Memgraph generation
       |
       v
fixed adopting repository
Git/worktree identity plus
positive-allowlist metadata/content hashes

Owner/operator
       |
       v
sync controller -> coherent source mirror -> pinned indexer
       |                    |                      |
       |                    v                      v
       |              seal after audit     candidate graph/backend
       |                                           |
       +---------- audit and atomic routing -------+
```

### 3.1 Components

1. **Project policy** — immutable or versioned declaration of repository identity, allowed source scope, resource limits, language grammars, provider policy, and role access.
2. **Freshness probe** — minimal read-only process that verifies the fixed repository and computes current identity without exposing arbitrary live source through MCP.
3. **Mirror builder** — creates a coherent, positive-allowlist copy outside the repository while rejecting symlinks and special files.
4. **Pinned indexer** — runs the exact reviewed Code-Graph-RAG artifact against only the candidate mirror.
5. **Dedicated Memgraph boundary** — stores only this project's isolated generations.
6. **Query adapter** — binds a query process to one immutable generation and exact project namespace.
7. **MCP façade** — owns the public tool schemas and refuses to dynamically forward upstream tools.
8. **Sync controller** — performs full generation builds, audits, promotion, rollback, and cleanup.
9. **Audit log** — records bounded metadata about generation and queries without becoming program truth or leaking secrets/source unnecessarily.

### 3.2 Trust boundaries

- The adopting repository is authoritative; the graph is replaceable cache state.
- The indexer may write only to a disposable candidate mirror, its dedicated database volume, and a declared generation state directory.
- The query process sees the sealed mirror read-only and executes only server-owned, parameterized, project-scoped query templates in the initial profile.
- The façade cannot write the repository, mirror, graph, routing record, or policy.
- The freshness probe can read only fixed identity metadata and positively included files; it cannot accept a caller-supplied path.
- The client allowlist is defense in depth. The server itself must not register dangerous tools.

### 3.3 Initial deployment profile

Prefer a local, per-Engineering-Lead-session STDIO façade. It has the smallest network and identity surface and is directly supported by Codex. A loopback Streamable HTTP service is a later option only when a second legitimate client or long-lived service is measured to justify it.

Do not bind a public/LAN address, expose Memgraph, run Memgraph Lab, mount the Docker socket, or share the database with another project.

## 4. Upstream baseline and containment

### 4.1 Pinned baseline

The reviewed baseline is:

```text
package: code-graph-rag
version: 0.0.589
source commit: 76b8d6c25e85c7531797c0e946110570b857064d
wheel: code_graph_rag-0.0.589-py3-none-any.whl
wheel SHA-256: 4f2a3b3972b76e92f1586ab7e18c1f950c0b63eec185f7cf739e5a8b58da7811
Python: >=3.12
license: MIT
maturity classifier: Beta
```

These values are evidence for the researched baseline, not a permanent “latest” declaration. Before implementation, re-check the current release, advisories, artifact attestation and hash, release notes, and compatibility. An upgrade is a deliberate new candidate requiring the corpus and security gates; never float to latest.

### 4.2 Why the stock MCP server is not acceptable

The reviewed stock server registers, depending on extras, tools including:

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
semantic_search
structural_search
structural_replace
ask_agent
flow_verdict
```

`ask_agent` internally receives graph, file-reader, file-writer, file-editor, shell-command, and directory-listing tools. Hiding these names with a client `enabled_tools` list does not remove their authority from the reachable server. The façade must create its own fixed tool registry.

The stock adapter also publishes basic name/description/input schemas without the safety annotations required by this profile, and directly dispatches to handlers. Its snippet lookup is qualified-name-oriented, can traverse broadly, and can select one result without the generation/project/path identity contract required here. Therefore even the two stock read-looking tools are wrapped rather than forwarded unchanged.

### 4.3 Required upstream containment

Version 1 has one permitted query implementation: a custom adapter connects directly to the dedicated Memgraph backend with a least-privilege query identity and executes only this specification's server-owned, parameterized fixed templates. Snippets come from the matching sealed mirror through the façade's own path- and generation-bound reader. Code-Graph-RAG is used only as the pinned offline structural indexer.

Do not instantiate or proxy upstream `create_server`, `MCPToolsRegistry`, `CypherGenerator`, or `CodeRetriever` in version 1. Even a private stock MCP child constructs the model-backed Cypher path and the broad registry, derives its active graph project from the mirror path, and has a snippet lookup that does not supply this profile's generation/project/path binding. Client hiding, a private socket, or wrapping its response does not repair those server-side authority and identity defects.

The stock MCP project name is derived from the resolved target path as a sanitized basename plus an eight-character SHA-256 path digest; the CLI/indexer path also supports an explicit project name. The offline indexer assigns a never-reused, sanitized generation project name such as `cgr_<repository-id>_<generation-id>` and records it in the manifest. The custom query adapter injects and verifies that exact project on every fixed template; changing a manifest alone cannot retarget a running backend.

### 4.4 State containment

Set a generation-specific upstream home before importing or starting upstream code:

```text
CGR_HOME=<state-root>/upstream/<generation-id>
```

The default is under the user's home and may contain `state.json`. During indexing the reviewed updater also writes these files inside its target root:

```text
.cgr-hash-cache.json
.cgr-dir-mtimes.json
.cgr-parser-fingerprint
```

For that reason, never point the indexer at the live adopting repository. Keep the candidate mirror writable only during indexing, audit and remove exactly these known mirror-local state files, fail on any unexpected source/mirror mutation, and then seal the mirror for query use.

### 4.5 Known risk baseline

- Versions through `0.0.588` had a symlink-following escape in structural search/replace; `0.0.589` fixes it.
- An earlier advisory covered paginated `read_file` path traversal.
- The stock Compose/daemon path has used floating images. A current issue reports Memgraph 3.x incompatibility in cleanup queries. Select and test an immutable image digest rather than using `latest`.
- The real-time updater has correctness and tenant-isolation risks unsuitable for the first profile.
- `treesitter-full` installs the complete language grammar set. Install only the base Python grammar plus the exact additional grammars the adopting project needs and that the implementation tests, or document why the full extra is accepted.
- For C# repositories, force the Tree-sitter frontend unless the Owner separately approves and the security review qualifies Roslyn/MSBuild execution; upstream's automatic C# path can invoke `dotnet restore`, evaluate MSBuild, and execute source generators.
- For C/C++ repositories, force the Tree-sitter frontend in version 1. The hybrid/libclang path can discover an ancestor `compile_commands.json` and follow absolute compilation/include paths outside the coherent mirror. A later libclang tier requires a rewritten, generation-local compilation database, validation that every source/include path stays inside the sealed mirror or an explicitly approved immutable sysroot, and an OS filesystem sandbox.

Do not install `semantic`, `ast-grep`, Qdrant, Transformers, PyTorch, or extra language grammars merely because upstream quick-start examples include them.

### 4.6 Offline indexer invocation

After verifying the exact installed CLI options, the operator command should be equivalent to:

```bash
CGR_HOME=/dedicated/state/upstream/<generation-id> \
CGR_SKIP_EMBEDDINGS=1 \
CSHARP_FRONTEND=treesitter \
CPP_FRONTEND=treesitter \
cgr start \
  --repo-path /dedicated/state/mirrors/<generation-id> \
  --update-graph \
  --project-name cgr_<repository-id>_<generation-id> \
  --no-start-stack \
  --no-embeddings \
  --capture "none,+structure,+calls,+types,+imports"
```

The implementation wrapper supplies every path/name and frontend setting from validated policy and generation state; it does not accept these values from an agent and rejects inherited overrides of `CSHARP_FRONTEND` or `CPP_FRONTEND`. Do not use `cgr daemon up`, which carries the packaged floating stack, and never pass `--clean`: the reviewed CLI clean path can clear the whole database rather than only one generation. Bring up one separately digest-pinned Memgraph service and perform project-scoped cleanup only through the operator plane.

The reviewed `cgr start` path validates configured Orchestrator and Cypher model settings even for `--update-graph`, although indexing itself need not call either model. Use a tested local/no-key configuration and instrument the disconnected spike to prove zero model endpoint calls, or invoke the smallest pinned indexing component directly. Never introduce a remote model credential merely to satisfy index-only startup validation.

If the exact chosen version's CLI differs, stop and update the locked invocation and tests rather than guessing. Run two consecutive clean builds against the selected Memgraph digest before qualification.

## 5. Project policy

### 5.1 Policy must be positive and role-compatible

Each adopting project gets an explicit policy. Never rely on a broad repository mount plus negative ignore patterns. The policy must be no broader than the Engineering Lead's pre-Integration read/influence boundary and must distinguish read scope from Builder write ownership.

Example:

```toml
schema_version = 1
project_id = "example-track-b"

[repository]
expected_realpath = "/absolute/path/to/project"
expected_remote_hash = "sha256:..."
worktree_identity_mode = "git-common-dir-plus-realpath"

[scope]
include_untracked = false
include = [
  "src/**/*.py",
  "tests/**/*.py",
  "scripts/**/*.py",
]
exclude = [
  ".git/**",
  ".claude/**",
  ".codex/**",
  "**/.env",
  "**/*secret*",
  "dist/**",
  "build/**",
  "vendor/**",
]
reject_symlinks = true
reject_hardlinks = true
reject_special_files = true

[languages]
enabled = ["python"]
unsupported_surface_behavior = "report"

[limits]
max_files = 5000
max_file_bytes = 2000000
max_total_source_bytes = 100000000
max_build_seconds = 900
max_query_seconds = 45
max_query_rows = 200
max_snippet_lines = 240
max_result_bytes = 1000000

[provider]
mode = "none-for-fixed-query-v1"
remote_source_egress = false

[roles]
allowed = ["engineering_lead"]

[refresh]
mode = "explicit-full-rebuild"
agent_facing_refresh = false
```

`include_untracked = false` is the default qualification profile. Enabling eligible untracked source later requires an explicit Owner-ratified policy revision, the same positive path filters and file-safety checks, and inclusion of those exact bytes in the live and generation fingerprints. An implementation must never sweep all untracked files into a mirror implicitly.

The values above are illustrative ceilings, not universal defaults. The adopting Owner confirms costs and boundaries, and the implementation agent measures suitable limits.

### 5.2 Path resolution rules

For every included file:

1. begin from the expected repository descriptor, not a caller path;
2. traverse without following symlinks;
3. reject symlinks at every component and reject multiply linked source files when policy requires a single unambiguous inode identity;
4. accept only regular files beneath the canonical root;
5. enforce root-anchored include policy;
6. apply size/count ceilings before copying;
7. use no-follow opens where supported;
8. compare pre/post file identity and metadata around reads;
9. preserve repository-relative paths in the mirror;
10. hash content bytes, not modification time alone.

If source changes while a coherent mirror is being built, discard the candidate and retry from a new pre-build state. Never combine files from two worktree moments and label the result one generation.

### 5.3 Unsupported and generated surfaces

The manifest records excluded, unsupported, skipped, unreadable, and parse-failed paths. Query responses carry coverage warnings. Absence of a graph node can never establish absence from the project when any relevant surface was not successfully indexed.

Generated files should normally be excluded when canonical source exists. If generated code is runtime-significant and has no equivalent source representation, include it deliberately and label it generated so the Lead can distinguish provenance.

## 6. Source identity and freshness

### 6.1 Source fingerprint

Hash the positive include set using a canonical byte sequence:

```text
repository-relative-path NUL file-content-sha256 LF
```

Sort paths bytewise. Also record separately:

- repository ID derived from expected realpath and remote identity;
- worktree ID;
- full Git HEAD when Git applies;
- branch/detached state;
- included-scope dirty state at index time;
- include-policy digest;
- parser/grammar fingerprint;
- query-stack fingerprint;
- list/count/digest of unsupported or failed files.

The profile supports a dirty Engineering Lead worktree: the included byte fingerprint, not HEAD alone, binds the graph. Any included-source edit immediately makes the active generation stale until a new coherent generation is promoted.

### 6.2 Immutable generation manifest

Example:

```json
{
  "schema_version": 1,
  "generation_id": "sha256:...",
  "project_id": "example-track-b",
  "repository_id": "sha256:...",
  "worktree_id": "sha256:...",
  "indexed_head": "40-character-sha-or-not-applicable",
  "indexed_branch": "name-or-detached",
  "indexed_scope_dirty": true,
  "source_fingerprint": "sha256:...",
  "include_policy_digest": "sha256:...",
  "indexed_paths_digest": "sha256:...",
  "indexed_file_count": 123,
  "indexed_source_bytes": 456789,
  "upstream_version": "0.0.589",
  "upstream_commit": "76b8d6c25e85c7531797c0e946110570b857064d",
  "upstream_wheel_sha256": "4f2a3b3972b76e92f1586ab7e18c1f950c0b63eec185f7cf739e5a8b58da7811",
  "graph_project_name": "cgr_repoid_generationid",
  "parser_fingerprint": "sha256:...",
  "database_image_digest": "sha256:...",
  "query_stack_fingerprint": "sha256:...",
  "parse_failures": [],
  "coverage_warnings": [],
  "indexed_at": "RFC3339"
}
```

Do not store mutable fields such as `current_head` in this immutable manifest. Current state is supplied only by the live freshness probe.

### 6.3 One authoritative routing record

`active-routing.json` is the sole serving authority. It contains:

- generation ID and manifest digest;
- exact derived graph project;
- immutable generation-specific backend socket/endpoint;
- backend process/instance identity;
- protocol version;
- query-stack fingerprint;
- predecessor routing-record digest.

A candidate backend starts and passes identity and query smoke tests before promotion. Under a serving lock, promotion writes and fsyncs one complete temporary routing record, atomically renames it on the same filesystem, and fsyncs the containing directory. The façade holds no second mutable “current backend” pointer. On startup or mismatch, it serves no ready result until the routing record, manifest digest, project, socket, and backend handshake agree.

### 6.4 State model

Track active serving state separately from candidate build state:

```text
active:    READY -- live source/policy/query stack changes --> STALE
active:    READY -- backend/probe/identity failure ---------> ERROR
active:    STALE/ERROR -- verified promotion ---------------> READY

candidate: IDLE -- explicit sync ----------------------------> BUILDING
candidate: BUILDING -- audit passes -------------------------> READY_TO_PROMOTE
candidate: BUILDING -- failure ------------------------------> FAILED
candidate: READY_TO_PROMOTE -- atomic promotion -------------> IDLE
```

A candidate build or failure does not disable a still-fresh and healthy active generation. If the live source already changed, the old active generation is stale and remains unavailable while the candidate builds.

### 6.5 Per-call race protection

Every query/snippet call obtains a successful freshness snapshot immediately before graph execution and again immediately before returning. The snapshots must be identical and must match the immutable active manifest and routing record. If HEAD, worktree identity, source fingerprint, policy, query stack, project, or backend changes, discard the in-flight result and return `STALE`.

This second check is mandatory; a single pre-query status check leaves a race in which source changes while the graph executes.

## 7. Full generation lifecycle

The first profile uses explicit full rebuilds only:

1. resolve the expected repository and worktree;
2. acquire a cross-process project sync lock;
3. compute the pre-build repository/source identity and enforce all ceilings;
4. mark only `candidate_sync_state=BUILDING`;
5. create a new generation directory and positively included mirror;
6. use no-follow reads and per-file pre/post identity checks;
7. require `mirror fingerprint == pre-build live fingerprint`;
8. set generation-specific `CGR_HOME`;
9. index into a new isolated graph project or blue/green database while the mirror is writable;
10. verify that no mirrored source bytes or modes changed unexpectedly;
11. audit and remove only the three expected mirror-local `.cgr-*` files;
12. fail on every undeclared write outside the mirror, database volume, and generation state root;
13. recompute and verify the mirror fingerprint;
14. seal mirror directories/files and expose an OS-enforced read-only view to the query backend;
15. start the exact candidate backend bound to that generation;
16. audit file scope, graph project, parse coverage, representative symbols/edges, query identity, and effective write denial;
17. run end-to-end candidate calls through the façade path;
18. recompute live source and require `sealed mirror == pre-build live == post-build live`;
19. write/fsync the immutable generation manifest and complete candidate routing record;
20. compare-and-swap the authoritative routing record under the serving lock;
21. run a post-switch identity/status check;
22. on failure, serve no `READY` result and restore the verified previous routing record only if it remains fresh;
23. retain one previous known-good generation and remove older generations through a separately validated cleanup command;
24. release the lock and report the result.

Do not run the upstream real-time watcher or incremental updater in the initial profile. Reconsider only after full-build cost is measured to violate an Owner-approved resource target, and treat incremental publication as a new design requiring the same correctness corpus and atomicity proof.

### 7.1 Refresh control

Version 1 has no agent-facing refresh tool. A session bootstrap or human/operator invokes a fixed sync command with no caller-supplied repository path. The Lead may request a refresh, but cannot bypass policy or directly call upstream `index_repository`/`update_repository`.

After the read-only profile is proven, a later `request_graph_refresh` tool may be considered only if:

- it targets the session-bound repository and policy with no arbitrary path;
- it mutates only disposable external cache state;
- the client prompts for explicit approval;
- cost/rate/concurrency limits are enforced server-side;
- refresh does not expose stock mutation tools;
- all generation, race, and rollback tests pass.

That later tool is not part of this implementation specification's accepted surface.

## 8. Engineering Lead MCP façade

### 8.1 Discovery contract

`tools/list` returns exactly:

```text
graph_status
query_code_graph
get_code_snippet
```

No project-listing, generic path, raw Cypher, refresh, file, shell, write, edit, index, update, delete, wipe, semantic, structural, internal-agent, or optimization tool may be registered. Test the actual public discovery response; reviewing source code or client configuration alone is insufficient.

Each of the three tool definitions declares MCP safety annotations equivalent to:

```json
{
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

Annotations help clients choose approval behavior; the façade's actual absence of write/admin handlers remains the security boundary.

### 8.2 Common response envelope

Every success and failure uses a strict, versioned envelope:

```json
{
  "schema_version": 1,
  "request_id": "opaque-id",
  "session_binding_digest": "sha256:...",
  "session_issued_at_utc": "RFC3339",
  "session_expires_at_utc": "RFC3339",
  "ok": true,
  "error": null,
  "advisory_only": true,
  "project_id": "example-track-b",
  "repository_id": "sha256:...",
  "worktree_id": "sha256:...",
  "generation_id": "sha256:...",
  "policy_digest": "sha256:...",
  "query_stack_fingerprint": "sha256:...",
  "indexed_head": "40-character-sha-or-not-applicable",
  "current_head": "40-character-sha-or-not-applicable",
  "indexed_source_fingerprint": "sha256:...",
  "current_source_fingerprint": "sha256:...",
  "active_generation_state": "READY",
  "candidate_sync_state": "IDLE",
  "fresh": true,
  "coverage_warnings": [],
  "data": {}
}
```

On failure, `ok=false`, `data=null`, and `error` is exactly `{code, safe_message, retryable, fallback}`. Initial codes are `INVALID_ARGUMENT`, `UNAUTHORIZED_SESSION`, `WRONG_SCOPE`, `AMBIGUOUS_SELECTOR`, `NOT_FOUND`, `STALE`, `COVERAGE_INSUFFICIENT`, `LIMIT_EXCEEDED`, `BACKEND_UNAVAILABLE`, and `INTERNAL_ERROR`; errors expose no Cypher, credentials, host paths, or backend details. Except for `graph_status`'s metadata-only stale/error state, a failed call returns no graph facts or snippets.

The response schema rejects additional fields by default. Results are bounded by row, byte, time, path, and snippet limits. Log a result digest rather than an unbounded source body.

### 8.3 `graph_status`

Input:

```json
{}
```

It returns:

- active and candidate state;
- expected and observed repository/worktree identity;
- indexed and current HEAD/branch state where applicable;
- indexed and current included-source fingerprint;
- dirty-at-index and dirty-now status;
- policy, parser, upstream, database, and query-stack identity;
- generation, indexed time, file/byte count;
- parse failures and coverage warnings;
- backend handshake/health result;
- a concise fallback instruction.

`graph_status` is the only tool that returns normally when active state is `STALE` or `ERROR`. It returns metadata, never arbitrary live source.

### 8.4 `query_code_graph`

All operations use a strict `source` selector; `shortest_path` also uses `target`. A selector is exactly one of:

```json
{
  "entity_id": "generation-bound-opaque-id"
}
```

or:

```json
{
  "qualified_name": "project.module.symbol",
  "expected_path": "src/module.py",
  "expected_kind": "Function"
}
```

or:

```json
{
  "name_suffix": "service.run",
  "expected_path": "src/service.py",
  "expected_kind": "Function"
}
```

`expected_path` and `expected_kind` are optional filters but, when present, must match exactly. `entity_id` is allowed only for `neighbors` and `shortest_path`; `resolve_symbol` accepts one of the two name selectors. `resolve_symbol` returns its bounded candidate list normally. A traversal operation must resolve each selector to exactly one entity or return `AMBIGUOUS_SELECTOR`/`NOT_FOUND` with no result data and a safe instruction to call `resolve_symbol`; it never chooses a candidate silently.

Per-operation request contract:

| Operation | Required fields | Forbidden fields | Exact semantics |
|---|---|---|---|
| `resolve_symbol` | `operation`, `source`, `purpose`, `limit` | `target`, `relationship_types`, `direction`, `max_depth` | Return bounded exact/suffix matches in the active project/generation; never choose one ambiguous match |
| `neighbors` | `operation`, `source`, `relationship_types`, `direction`, `max_depth`, `purpose`, `limit` | `target` | Return simple paths of one through `max_depth` hops rooted at `source` over only the named relationships |
| `shortest_path` | `operation`, `source`, `target`, `relationship_types`, `direction`, `max_depth`, `purpose`, `limit` | none | Return only tied shortest simple paths from the unique source to the unique target within `max_depth` |

Example `neighbors` request:

```json
{
  "operation": "neighbors",
  "source": {
    "qualified_name": "project.module.symbol",
    "expected_path": "src/module.py",
    "expected_kind": "Function"
  },
  "relationship_types": ["CALLS"],
  "direction": "incoming",
  "max_depth": 1,
  "purpose": "checkpoint decomposition",
  "limit": 50
}
```

Example `shortest_path` request:

```json
{
  "operation": "shortest_path",
  "source": {"entity_id": "generation-bound-source-id"},
  "target": {"entity_id": "generation-bound-target-id"},
  "relationship_types": ["CALLS", "REFERENCES"],
  "direction": "outgoing",
  "max_depth": 3,
  "purpose": "verify proposed ownership seam",
  "limit": 10
}
```

Common validation:

- `operation`: one of `resolve_symbol`, `neighbors`, or `shortest_path` in version 1;
- selectors reject extra keys; names are valid UTF-8 without control characters and at most 512 bytes; `expected_path` is normalized repository-relative and at most 1,024 bytes; `expected_kind` must be in the server's node-kind allowlist;
- `relationship_types`: required for `neighbors`/`shortest_path`, absent for `resolve_symbol`, and a non-empty subset of the server allowlist: initially `CALLS`, `REFERENCES`, `INSTANTIATES`, `OVERRIDES`, `DEFINES`, `DEFINES_METHOD`, `INHERITS`, `IMPLEMENTS`, and `IMPORTS`;
- `relationship_types` has unique items and is canonicalized into server allowlist order before request hashing and query execution;
- `direction`: required for both traversal operations and one of `incoming`, `outgoing`, or `both`; for `neighbors` it is relative to the source; for `shortest_path`, `outgoing` follows stored edges source-to-target, `incoming` traverses stored edges in reverse, and `both` permits either while every returned edge records its traversal orientation;
- `max_depth`: required for graph walks and integer `1..3`;
- `purpose`: required enum or valid UTF-8 text of 1–256 bytes, recorded for provenance;
- `limit`: integer `1..50` and no higher than project policy; it limits matches for `resolve_symbol` and returned paths for traversal operations;
- reject null bytes, control characters, raw Cypher, caller-supplied project names, absolute/traversal paths, extra fields, and operation-specific field mismatches;
- enforce overall request and response byte limits.

The initial profile uses **only fixed, server-owned, parameterized Cypher templates**. The façade injects the exact active project and generation, validates every relationship/direction/depth/limit, and executes through a database identity with the least permissions the selected edition supports. No agent-supplied or model-generated Cypher reaches Memgraph, and no Cypher/orchestrator LLM is needed.

Every returned node must be proven reachable from a module in the exact active project; qualified name alone is insufficient. Traversal templates reject repeated entity IDs within a path. `shortest_path` computes the minimum hop count within the bound and returns only paths at that hop count. An empty traversal result is never proof of absence and carries current coverage warnings.

Opaque entity IDs include or cryptographically bind the generation ID plus the underlying graph node identity; database node IDs alone are not stable and may be recycled.

Natural-language-to-Cypher may be evaluated later as a separate risk tier only after the fixed-query profile is qualified. It requires Owner-approved provider egress, query-only database enforcement, AST/statement validation, a new query-stack fingerprint, a dedicated corpus, and explicit requalification. It is not part of version 1.

Every entity uses this shape:

```json
{
  "entity_id": "generation-bound-opaque-id",
  "qualified_name": "project.module.symbol",
  "kind": "Function",
  "path": "src/module.py",
  "line_start": 10,
  "line_end": 24
}
```

`resolve_symbol` output `data` contains:

```json
{
  "operation": "resolve_symbol",
  "purpose": "checkpoint decomposition",
  "query_id": "resolve-symbol-v1",
  "result_digest": "sha256:...",
  "matches": [
    {
      "match_type": "EXACT_QUALIFIED_NAME",
      "entity": {
        "entity_id": "generation-bound-opaque-id",
        "qualified_name": "project.module.symbol",
        "kind": "Function",
        "path": "src/module.py",
        "line_start": 10,
        "line_end": 24
      }
    }
  ],
  "returned_count": 1,
  "truncated": false,
  "direct_source_verification_required": true
}
```

`neighbors` and `shortest_path` output `data` contains:

```json
{
  "operation": "neighbors",
  "purpose": "checkpoint decomposition",
  "query_id": "neighbors-v1",
  "result_digest": "sha256:...",
  "shortest_hop_count": null,
  "paths": [
    {
      "hop_count": 1,
      "nodes": [
        {"entity_id": "generation-bound-source-id", "qualified_name": "project.module.symbol", "kind": "Function", "path": "src/module.py", "line_start": 10, "line_end": 24},
        {"entity_id": "generation-bound-neighbor-id", "qualified_name": "project.caller", "kind": "Function", "path": "src/caller.py", "line_start": 5, "line_end": 12}
      ],
      "edges": [
        {"type": "CALLS", "from_entity_id": "generation-bound-neighbor-id", "to_entity_id": "generation-bound-source-id", "traversal": "REVERSE"}
      ]
    }
  ],
  "returned_count": 1,
  "truncated": false,
  "direct_source_verification_required": true
}
```

For `shortest_path`, `operation`/`query_id` change accordingly and `shortest_hop_count` is the returned minimum or `null` when no path is found. `resolve_symbol` ordering is exact match before suffix match, then qualified name, path, kind, and entity ID in bytewise ascending order. Path ordering is hop count followed by the bytewise canonical sequence of node qualified-name/path/entity-ID and edge type/orientation. Each fixed Cypher template implements that stable `ORDER BY` and requests `limit + 1`; the façade returns the first `limit` and sets `truncated=true` only when the extra ordered record exists. It does not claim an exact total count unless a separately bounded count was actually computed.

The façade returns structured entities/paths only. The Engineering Lead client may explain those rows in its own reasoning, but the service does not add a second model-generated summary. Query-template identity and source paths remain visible so the Lead can verify them.

### 8.5 `get_code_snippet`

The tool does not accept an arbitrary path.

Input:

```json
{
  "generation_id": "sha256:...",
  "entity_id": "opaque-id-from-query-result",
  "qualified_name": "project.module.symbol",
  "expected_path": "src/module.py",
  "context_lines": 12
}
```

The façade must:

1. require the current active generation and matching `generation_id`;
2. resolve the entity uniquely inside that generation;
3. verify entity ID, qualified name, kind, and path agree;
4. enforce the positive include policy and path containment;
5. read only from the immutable sealed mirror;
6. enforce a bounded line range and response size;
7. return line numbers, content hash, entity identity, and provenance;
8. refuse ambiguous, stale, missing, mismatched, unsupported, or out-of-scope requests.

The snippet helps the Lead inspect a result, but a decision-bearing claim is still verified against the current authoritative worktree. The second freshness snapshot protects the interval before return.

### 8.6 Server instructions

MCP initialization instructions should begin with a self-contained block within the first 512 characters:

> Lead-only advisory code intelligence. Call graph_status before relying on graph facts. Use only READY results for this exact project/worktree/generation. Verify every decision-bearing result in current authoritative source. This tool cannot authorize scope, prove acceptance, determine status, or replace tests/Critics. If stale, unavailable, ambiguous, or incomplete, use Git, rg, direct source, language tooling, and tests.

Continue with the no-provider/no-egress policy, coverage, negative-result, provenance, rate-limit, and escalation instructions. Instructions improve model behavior but are not a security boundary.

## 9. Client and role activation

### 9.1 Default-off capability declaration

Each adopting project that qualifies the capability should have one Owner-ratified, governance-protected declaration:

```yaml
capability_id: lead-code-intelligence/v1
project_id: example-track-b
status: PILOT_LEAD_ONLY
eligible_role: ENGINEERING_LEAD
default_activation: disabled
activation_scope: one-session-one-checkpoint-one-tenant
approved_agent_tools:
  - graph_status
  - query_code_graph
  - get_code_snippet
source_policy_identity: sha256:...
tenant_identity: opaque-project-tenant
provider_egress: local-only
fallback: git-rg-direct-source-tests
evidence_class: advisory-provenance-only
operator_plane: not-agent-accessible
lifecycle_controller: owner-preauthorized-external-supervisor
max_session_ttl_seconds: 1800
lifecycle_attestation_channel: protected-resource-metadata
```

Allowed lifecycle values are:

```text
NOT_ADOPTED
EVALUATION_ONLY
PILOT_LEAD_ONLY
QUALIFIED_LEAD_OPTIONAL
SUSPENDED
RETIRED
```

There is no `UNIVERSAL`, `ALL_AGENTS`, or auto-enrollment state.

### 9.2 Role isolation levels

The method must state the actual enforcement level:

1. **Procedural role separation:** the same client can see the capability, but role contracts prohibit non-Lead use. This is permitted only for disconnected evaluation with fixture data; it is not sufficient for a live pilot.
2. **Client configuration isolation:** only the dedicated Lead launch/profile contains the MCP entry; other role contexts cannot list it.
3. **Server/session isolation:** a short-lived session credential binds one checkpoint, project, worktree, role, and expiry; the façade rejects other or ambiguous sessions.
4. **OS/process isolation:** separate user/process/network/secret boundaries additionally prevent unintended access.

For the first live pilot, require at least levels 2 and 3 if the client's spawned contexts or role switches might inherit tools. If the client cannot prevent Builder, Critic, Orchestrator, or ambiguous contexts from listing/calling the capability, the live rollout is a no-go. Never describe a configuration profile alone as a cryptographic boundary.

### 9.3 Owner-preauthorized revocation and lifecycle attestation

Revocation is an operator-plane transition, not a fourth agent-facing tool. Before activation, the Owner must authorize one exact external lifecycle controller: a trusted client/runtime hook, a dedicated launcher/supervisor, or an identified human operator using a protected control channel. The controller exercises only the preauthorized technical lifecycle; it is not a new hierarchy role and cannot choose queries, architecture, verdicts, or continuation.

Required protocol:

1. Activation issues a single-use or short-lived credential bound to the role, checkpoint, project, worktree/client instance, capability policy, and maximum TTL. Only its digest is recorded.
2. The controller writes an activation event to an append-only or equivalently integrity-protected lifecycle attestation before the façade becomes usable.
3. The client/runtime transition hook blocks spawning or switching to a non-Lead context and blocks a successful terminal Return Packet while the binding is active. The Lead first prepares its handoff or packet draft and declares readiness for deactivation through the project's existing administrative lifecycle channel—not through the graph MCP surface. The hook must also be able to remove the MCP entry, token, and transport from the current context independently so an emergency non-PASS return cannot retain graph access.
4. The controller revokes the server-side binding. For a dedicated STDIO instance it also closes the MCP transport and terminates the process, or otherwise proves that the live process now rejects the binding. Removing a token only from the Lead's prompt or environment is insufficient by itself.
5. The controller writes and seals a revocation event, then acknowledges it through the already-authorized administrative channel. The Lead may continue only in a context where the capability is absent and may submit a normal final packet only after receiving the acknowledgment.
6. Any revocation or attestation timeout prevents the requested role transition and successful terminalization. Quarantine the credential/service and use the emergency return below; do not treat this as a harmless optional-service outage.

The durable, nontechnical lifecycle attestation contains no graph rows or source. It contains at least:

```yaml
lifecycle_attestation_id: <stable-id>
lifecycle_attestation_digest: sha256:...
capability_policy_identity: sha256:...
session_binding_digest: sha256:...
project_id: <opaque-id>
checkpoint_id: <id>
client_instance_identity: <opaque-id>
issued_at_utc: <RFC3339>
activated_at_utc: <RFC3339>
expires_at_utc: <RFC3339>
deactivated_at_utc: <RFC3339>
deactivation_mode: REVOKED | EXPIRED | PROCESS_TEARDOWN | UNRESOLVED
server_rejection_verified: true | false | UNRESOLVED
resources:
  - identity: <service/session/generation/mirror-or-cache-id>
    owner: <exact-owner>
    purpose: <bounded-purpose>
    observed_state: <state>
    proposed_disposition: <disposition>
```

Expiry counts as deactivation only when the controller records the expiry, proves subsequent server rejection, and the transition hook waits for that receipt. The session token itself, source content, query text, and graph facts must not appear in the attestation.

Emergency return on revocation failure:

1. The client/runtime hook removes the MCP entry, token, and transport from the Lead context and proves locally that the context can no longer list or call the capability. This local absence does not falsely assert that the server-side binding was revoked.
2. From that capability-absent context, the same Lead submits form 7 with terminal status `BLOCKED`, naming the exact external action still required. Set lifecycle attestation fields to `MISSING`, deactivation mode and server rejection to `UNRESOLVED`, both deactivation confirmations to `UNRESOLVED`, and record the boundary deviation and quarantine state.
3. The Orchestrator can inspect only the packet and authorized resource metadata. Because actual server-side revocation/resource reality is unproven, the receipt is `REJECTED` and escalates the exact lifecycle incident to the Owner. It must not repair, query, or infer success.
4. If the runtime cannot even establish a capability-absent Lead context, terminate/quarantine the context and use the method's existing silence/no-return escalation. No agent-authored packet may be emitted from a context that still holds the capability.

This exception permits honest reporting, not successful completion or role transition.

A normal form 7 cites one attestation ID/digest for every session binding; an emergency `BLOCKED` row instead declares its missing attestation fields `MISSING` and follows the rejection path above. The existing resource-reality receipt gate must be able to resolve exact nontechnical lifecycle/resource facts through its already-authorized protected metadata channel. The Orchestrator checks identity, integrity, times, completeness, and declared resource state only; it never calls the graph, reads source, or inspects graph results. If the adopting platform cannot produce and expose these attestations within the existing receipt boundary, live activation is a no-go.

### 9.4 Codex STDIO example

Official Codex documentation supports local STDIO MCP servers and configuration in user or trusted-project `config.toml`. The desktop app, CLI, and IDE extension on the same host share that MCP configuration, so a general host entry is not automatically role-scoped. Use a dedicated Lead configuration/launcher or leave the general entry disabled.

Illustrative Lead-only configuration after the façade is qualified:

```toml
[mcp_servers.engineering_lead_code_graph]
command = "/absolute/path/to/sidecar/.venv/bin/python"
args = ["-m", "lead_code_graph.facade"]
cwd = "/absolute/path/to/sidecar"
env_vars = ["LEAD_CODEGRAPH_SESSION_TOKEN"]
enabled = true
required = false
enabled_tools = ["graph_status", "query_code_graph", "get_code_snippet"]
default_tools_approval_mode = "prompt"
startup_timeout_sec = 20
tool_timeout_sec = 45
```

Rules:

- keep `required=false`; graph failure must not prevent the Lead from using ordinary source tools;
- use the client allowlist only as defense in depth;
- do not put provider keys or bearer tokens directly in a committed configuration file;
- bind the session token server-side to the expected project/worktree/checkpoint and a short expiry;
- validate the exact installed Codex version's configuration behavior before relying on it;
- use the configured external lifecycle controller and wait for its sealed revocation acknowledgment before spawning or switching to a Builder, Critic, Integration Critic, or Orchestrator context;
- do not place this entry in an adopting project's protected configuration without the exact Owner authorization that project requires.

During pilot, prompting on every tool call makes use visible. After measured qualification, an Owner may permit automatic approval for the three server-enforced read-only tools without changing their authority.

### 9.5 Other MCP clients

For any other client, prove:

- STDIO or authenticated loopback transport behavior;
- exact tool discovery and schema rendering;
- whether tools/configuration are inherited by subagents or new contexts;
- role-specific activation and revocation;
- timeout, output-size, and approval behavior;
- whether server instructions are read and retained;
- secret handling and log retention.

A client that can hide tools but cannot prevent direct invocation does not supply role isolation by itself.

## 10. Engineering Lead operating protocol

### 10.1 Before any capability use

The Lead first performs the method's existing brief validation directly. The graph cannot validate its own authorization. If the brief is valid, the Lead reports `started_at_utc` and verified actual state through ordinary authoritative mechanisms.

Then, only if the brief's field-7 capability block permits it:

1. verify the capability-policy identity and session binding;
2. call `graph_status`;
3. compare repository, worktree, HEAD, dirty state, and included-source identity with the actual state just reported;
4. use graph tools only when state is `READY` and every identity agrees;
5. record capability status in the private workbench;
6. fall back immediately if any identity or coverage check fails.

### 10.2 During orientation and decomposition

Recommended sequence:

1. inspect the ratified bar and current source directly;
2. ask bounded structural questions tied to an explicit purpose;
3. retrieve only the snippets needed to understand returned entities;
4. open and verify current authoritative paths directly;
5. use verified findings to inform architecture and decomposition;
6. assign Builders exact real paths and criteria, not graph narrative or opaque entity IDs;
7. record decision-bearing provenance.

Useful prompts:

```text
Which in-scope modules import src.package.service?
Which functions call project.package.service.run?
Which implementations satisfy the Repository interface?
What tests reference qualified.symbol?
Show the bounded two-hop dependency neighborhood around qualified.symbol.
Which modules import the module containing qualified.symbol?
```

Avoid vague prompts such as “understand the whole system” or “what should I change?” They encourage unbounded interpretation and hide the graph facts that need verification.

### 10.3 After source changes

Any included-source change makes the prior generation stale. The Lead must not keep querying it because it is “close enough.” Options are:

- continue with direct source, Git, language tooling, and tests;
- request an explicit stable-point refresh through the operator plane;
- use a new qualified generation after it is promoted and `graph_status` matches.

Refresh/build time and all service work count against the checkpoint's active-elapsed ceiling unless an existing authorized pause rule genuinely applies. A later Owner-approved provider tier would count its calls and cost as well.

### 10.4 Before Builder or Critic transitions

- prepare the handoff, declare readiness for deactivation, and let the Owner-preauthorized lifecycle controller revoke the server-side binding before any child/context is created;
- wait for the sealed lifecycle attestation and verify that it identifies the same session-binding digest, checkpoint, project, client instance, and deactivation time;
- verify non-Lead `tools/list` does not expose the capability and that the old binding is rejected;
- give Builders verified paths and assignments, not raw graph output;
- give Critics the exact candidate, bar, reproduction commands, inputs, and direct sources required by existing templates;
- do not include the Lead's graph-generated explanation as Critic context;
- if the capability itself is the checkpoint artifact, a separately authorized fresh Critic may invoke only a disposable fixture-only candidate through bounded review credentials; the production Lead tenant remains inaccessible, and this is review of the tool—not ordinary graph-assisted analysis of another candidate.

### 10.5 After final Integration review

A decision-bearing graph read after the Integration verdict follows the existing post-verdict rule. If it changes a technical assertion, source dependency, architecture decision, or candidate, reopen the candidate and rerun affected review. Packet-only administrative reads may be declared without reopening only when they cannot change the technical claim.

Any use after a Builder/Critic transition is a new activation, never reuse of the revoked binding. Re-run §10.1 in order: confirm the still-valid brief, report current graph-independent actual state, obtain a new session binding/activation attestation, then call `graph_status`. Append the new binding to the exhaustive session ledger and associate every later query with it. The same rule applies to a permitted post-Integration read.

Prepare the terminal packet, invoke the configured external lifecycle transition, receive the sealed revocation attestation, and only then submit a normal final Return Packet from a capability-absent context. If revocation cannot be proved, follow §9.3's capability-absent emergency path and return only an honest `BLOCKED` packet with `MISSING`/`UNRESOLVED` lifecycle fields; never claim successful terminalization.

### 10.6 Provenance record

When a graph result affects a decision, record:

| Field | Required value |
|---|---|
| tool/schema | exact façade and schema version |
| policy | capability/source-policy identity |
| generation | generation ID and indexed source identity |
| query stack | façade/schema/fixed-template/driver/limits/policy fingerprint; add provider/model/prompt/settings only in a separately qualified future natural-language tier |
| request | request ID, session-binding digest, time, purpose, structured operation/parameter digest; keep raw server logs metadata-only |
| result | digest, returned symbols/paths, coverage warnings |
| effect | exact decomposition/architecture/edit decision influenced |
| verification | authoritative paths and exact source identity opened afterward |
| fallback | stale rejection, ambiguity, or direct-source method used |

Full source bodies and secrets need not be copied into logs. A protected receipt may retain metadata and a structured-result digest.

### 10.7 Return Packet disclosure

Add this administrative block to form 7:

```yaml
lead_code_intelligence_usage:
  declared_disposition: PROHIBITED | OPTIONAL | REQUIRED_BY_BAR
  used: true | false
  capability_policy_identity: <id-or-not-applicable>
  generations: [<ids>]
  query_stack_fingerprints: [<ids>]
  purposes: [<bounded summaries>]
  decisions_influenced: [<bounded summaries>]
  authoritative_paths_verified: [<paths plus source identity>]
  stale_rejections_and_fallbacks: []
  boundary_deviations: none
  sessions:
    - sequence: 1
      session_binding_digest: <sha256>
      activation_purpose: <bounded-purpose>
      issued_at_utc: <RFC3339>
      activated_at_utc: <RFC3339-or-NOT_ACTIVATED>
      expires_at_utc: <RFC3339>
      deactivated_at_utc: <RFC3339-or-UNRESOLVED>
      deactivation_mode: REVOKED | EXPIRED | PROCESS_TEARDOWN | UNRESOLVED
      deactivation_purpose: BUILDER_TRANSITION | COMPONENT_CRITIC_TRANSITION | INTEGRATION_CRITIC_TRANSITION | TERMINAL_RETURN | STALE_FALLBACK | ACTIVATION_FAILURE | MANUAL_SUSPENSION | EMERGENCY_UNRESOLVED
      server_rejection_verified: true | UNRESOLVED
      lifecycle_attestation_id: <id-or-MISSING>
      lifecycle_attestation_digest: <sha256-or-MISSING>
      local_capability_absence_verified: true
      deactivated_before_role_transition: true | NOT_APPLICABLE | UNRESOLVED
      deactivated_before_terminal_return: true | NOT_APPLICABLE | UNRESOLVED
      terminal_binding: true | false
```

`used: true` means that any binding was issued or any capability call was attempted; `used: false` therefore requires `sessions: []`. `sessions` is exhaustive and ordered by contiguous `sequence`. Every activation—including reactivation after Builder or Critic work and any post-verdict read—gets one row and one matching lifecycle attestation containing its activation/revocation events. Exactly the final binding has `terminal_binding: true`. Query provenance rows reference the corresponding `session_binding_digest`; no earlier binding or transition may be summarized away. An emergency `BLOCKED` return uses one final row with the required `MISSING`/`UNRESOLVED` values.

The Orchestrator checks declaration completeness and boundary compliance only. It does not rerun graph queries, inspect raw output, or become a technical reviewer.

The YAML block is a supplemental administrative summary, not the sole durable provenance record. Every decision-bearing graph query must also occupy its own row in form 7's existing exhaustive decision-bearing provenance table with all fields from §10.6, or that row must reference an authorized durable artifact containing those fields. The private workbench cannot be the only surviving copy because it is removed at terminalization.

### 10.8 Role-handoff matrix

| Handoff | Capability rule |
|---|---|
| Owner → role/config ratification | Owner approves capability, source/provider boundary, administration, and Lead-only surface; this is not per-query technical direction |
| Orchestrator → Lead brief | Echo permitted availability and preauthorized setup only; do not prescribe use, queries, or conclusions |
| Lead → Builder | Pass exact direct-verified paths and ownership; no graph credential, raw result, or opaque graph oracle |
| Lead → Component Critic | Pass candidate, bar, and expected dependencies as correctable hypotheses; withhold graph narrative/results |
| Critic → Lead | Return independently derived reviewed dependencies, commands, observations, and verdict |
| Lead → Integration Critic | Preserve the same isolation; graph reasoning is not evidence or currency proof |
| Lead → lifecycle controller | Declare transition readiness only after preparing the handoff; no graph query or technical decision is delegated |
| Lifecycle controller → capability-absent Lead/next role | Revoke/tear down the exact binding and return a sealed nontechnical lifecycle/resource attestation before the transition proceeds |
| Lead → Orchestrator | Disclose use, affected decisions, direct verification, post-verdict reads, and resource lifecycle |
| Orchestrator → Owner | Check bounded envelope completeness only; do not call/inspect the graph |
| Owner → lifecycle action | Disposition graph resources by exact ownership; never treat a shared service as checkpoint-owned |

Index maintenance and lifecycle supervision remain Owner-authorized infrastructure behavior, not new “Graph Operator” or “Lifecycle Controller” authority roles.

## 11. Canonical method changes

This section is the implementation map for the `Zero-Trust-Hierarchy` repository. Edit canonical Markdown/templates and Builder source first; regenerate HTML through the existing deterministic build. Do not hand-edit generated HTML.

### 11.1 `article.md`

Add a subsection immediately after the core Tier-2 description in §8:

> ### Optional live code intelligence
>
> An adopting project may provide a revision-bound, read-only code-intelligence capability to the Engineering Lead. It is a tool inside HOW, not a new role, authority tier, source of program state, or acceptance oracle. The Owner ratifies installation, data boundaries, credentials, and any governing requirement; an available optional capability remains the Lead's choice. The Orchestrator may communicate already-ratified availability but may not prescribe graph queries or implementation decisions.
>
> The capability must identify its project, worktree or source snapshot, policy, query stack, and index generation on every result. A consequential result is verified in authoritative current source before it affects decomposition, an edit, or a technical claim. Stale, incomplete, or unavailable graph state fails closed and ordinary Git, search, direct source, language tooling, and tests remain the fallback.
>
> Code-Graph-RAG is the current reference implementation. A conforming deployment exposes only a small Lead-facing read surface; index, update, file mutation, internal-agent, shell, deletion, and cross-project capabilities remain outside the agent plane. The production Lead tenant is unavailable to the Orchestrator, Builders, and Critics. A fresh Critic may invoke a separately authorized disposable fixture-only instance only when the capability itself is the candidate under review; this is tool testing, not graph-assisted analysis.

Add coordinated cross-references:

- **§6 / Orchestrator boundary:** the Orchestrator does not query or technically inspect a code graph; it may receipt-check only disclosure and direct-verification declarations.
- **§9 / mechanisms versus invariants:** add a paragraph outside the invariant/profile table stating that revision-bound derived context is a replaceable accelerator, not a seventh universal primitive.
- **§10 / verdict staleness:** graph-discovered dependencies are hypotheses. Only a Critic's honestly declared reviewed dependencies plus the profile's direct lineage/change query control verdict currency; a missing edge proves nothing.
- **§11 / Return Packet:** disclose consequential graph use and graph-owned resources without treating responses as verdicts or acceptance evidence.
- **§12 / terminal states:** stale/unavailable optional graph state triggers direct fallback, not `BLOCKED` by itself. If ordinary work consumes the ceiling, use the existing honest terminal outcome.
- **§13 / tracks:** bind every graph tenant/generation to one authorized repository/track; an edge into another track does not authorize inspection or work there.

Do not add the capability to the five meanings of “done,” evidence authority, universal-invariant table, or hierarchy diagram as a role/tier. Do not modify `assets/zero-trust-hierarchy*.svg`.

In §14's bootstrap payload, extend the Engineering Lead bullet with one sentence:

> An Owner-ratified project may make advisory live code intelligence available to the Lead under a fixed source policy; availability does not require use, widen scope, or replace direct source verification.

Also state that Phase A may inventory or propose the capability but cannot install, connect, index, acquire credentials, or disclose code before ratification. Phase B use begins only after a valid brief and direct actual-state verification.

### 11.2 `RULEBOOK.md`

Add a short grant/prohibition cross-reference under Tier 2 and place the detailed operational subsection inside §7, “Engineering decomposition and one-writer integration,” using this normative core:

> #### Optional Lead-only advisory code intelligence
>
> A project MAY adopt live code intelligence as a project-specific Engineering Lead capability. Adoption does not add a universal invariant, alter role authority, or make the capability available to other roles.
>
> The capability MUST be Owner-ratified, default-off, bound to one authorized Lead session/checkpoint/project/source identity, read-only, advisory, and removable without impairing ordinary execution through Git, search, direct source, language tooling, and tests. Its source projection MUST be a subset of the Lead's already-authorized pre-Integration influence boundary.
>
> Technical availability never grants authority. The capability MUST NOT widen the brief, read scope, bar, checkpoint, ceiling, or permitted influences; determine program state, eligibility, permission, verdict currency, disposition, landing, publication, or continuation; replace a test, mandatory oracle, direct source, or Critic judgment; or prove runtime/security behavior or absence when coverage is incomplete.
>
> When the brief declares it optional, the Lead MAY choose it. Use is required only when an exact Owner-ratified bar explicitly requires the capability. Before relying on a result, the Lead MUST verify fresh project/worktree/source/policy/query-stack/generation identity and MUST verify every consequential finding in authoritative current source. Stale or unavailable optional capability state requires fallback, not BLOCKED or a reduced bar.
>
> A live deployment MUST have an Owner-preauthorized external lifecycle controller that technically revokes the exact session binding and produces a durable nontechnical lifecycle/resource attestation. A transition to any non-Lead context and every normal final Return Packet MUST wait for that attestation. If revocation acknowledgment fails, only a capability-absent emergency `BLOCKED` packet with explicit `MISSING`/`UNRESOLVED` lifecycle fields may cross upward; its receipt is `REJECTED` and escalated. Procedural separation alone is permitted only in disconnected fixture evaluation. A production Lead tenant MUST remain inaccessible to Builders, Orchestrator, and ordinary Critics; only a separately authorized fixture-only candidate-under-test may be exposed to a fresh Critic when the capability itself is under review.

Cross-reference this detailed clause throughout the Rulebook:

- **§1 / profile primitives:** the graph is outside the six execution/evidence-profile primitives.
- **§2 / Orchestrator:** prohibit graph querying and technical validation.
- **§2 / Engineering Lead:** grant only the bounded optional query capability.
- **§2 / Tier 3:** Builders and ordinary Critics do not inherit it; define the narrow disposable fixture-only candidate-under-test exception without granting production-tenant access.
- **§3 / precedence:** graph/index output has no independent precedence; authoritative source/candidate state wins.
- **§5 / brief:** preserve exactly eleven fields; fields 7/10 disclose an already-ratified optional capability, while field 9 carries any exact installation, credential, network, or code-disclosure preauthorization.
- **§6 / start:** validate the brief and actual state directly; graph use starts only after a valid start.
- **§7 / decomposition:** graph results may seed hypotheses, but Builder allowlists and technical decisions require direct verification. Extend decision-bearing provenance with generation and direct-source identity.
- **§8–10 / Critics:** withhold Lead graph narrative; expected dependencies remain correctable hypotheses; a no-edge result cannot justify dependency completeness or PASS.
- **§11 / terminalization:** consequential post-verdict graph reads reopen review.
- **§12 / terminals:** optional outage/staleness is not independently `BLOCKED`.
- **§13 / workbench and packet:** detailed query ledger remains private; a concise declaration and resource inventory cross upward.
- **§14 / receipt:** check disclosure/direct-evidence mapping/resource accounting only, without expanding the Orchestrator's finite query class.
- **§16 / reclamation:** distinguish checkpoint-owned disposable index resources from shared/project-level infrastructure.
- **§17 / tracks:** enforce tenant/generation separation and no inferred cross-track authority.
- **§18 / adoption:** add Lead-only, freshness, direct-verification, fallback, no-scope-expansion, and lifecycle checks.

Keep §6's first observable actual-state report graph-independent: validate the brief and report `started_at_utc`, repository/worktree state, source identity, and any other required actual state through ordinary authoritative mechanisms before a graph call. Immediately afterward, when field 7 permits or requires the capability, emit a separate capability-status declaration containing policy, tenant/project, generation, indexed source identity, query-stack identity, and freshness. Do not ask the graph to establish or retroactively alter the underlying actual-state report.

Extend §11 post-verdict reads: a consequential graph read that changes a technical claim reopens the candidate exactly like any other decision-bearing post-verdict source.

Extend §13 Return Packet requirements with the administrative usage block in §10.7 of this specification. State that the receipt gate checks only declaration/boundary completeness.

Do not alter the existing terminal vocabulary, authority precedence, eleven-field brief shape, evidence identities, or acceptance rules.

### 11.3 `templates/1-checkpoint-brief.md`

Do not add a twelfth field. Under field 7, add this optional subrecord:

```yaml
lead_code_intelligence:
  checkpoint_disposition: PROHIBITED | OPTIONAL | REQUIRED_BY_BAR
  capability_policy_identity: <exact-version-or-hash>
  tenant_identity: <project-specific-tenant>
  authorized_source_policy: <exact-policy-id>
  expected_workspace_or_snapshot: <identity>
  approved_tools:
    - graph_status
    - query_code_graph
    - get_code_snippet
  activation: lead-session-only-default-off
  lifecycle_controller_identity: <owner-ratified-identity>
  max_session_ttl_seconds: <positive-bounded-integer>
  lifecycle_attestation_channel: <protected-resource-metadata-channel>
  fallback: git-rg-direct-source-tests
  evidence_rule: advisory-provenance-only
  required_bar_citation: NOT_APPLICABLE | <exact-ratified-citation>
```

Rules:

- omitted means `PROHIBITED`;
- `OPTIONAL` leaves use to the Lead;
- `REQUIRED_BY_BAR` without an exact ratified citation is invalid;
- installation/configuration/provider egress/credential actions must also appear in field 9 when they are not already available and authorized;
- a requested source policy broader than the ratified influence boundary makes the brief contradictory;
- an unavailable optional service does not invalidate the brief.

Field 10 names the Lead-only activation/read boundary and says explicitly that an optional capability is not an executor precondition. The Orchestrator cannot use this block to select an implementation product or query. Brief validation must not connect to the graph; an invalid brief produces no graph query, index/refresh, credential acquisition, or source disclosure.

### 11.4 `templates/2-workbench.md`

Add:

- separate post-start capability-status identity/freshness, emitted only after the graph-independent actual-state report;
- a decision-bearing graph-query provenance table using §10.6;
- refresh requests/generations and elapsed cost;
- stale/coverage rejections and fallback actions;
- activation and revocation checkpoints.

Extend the existing Current Resources/Topology section with one row each, as applicable, for the service, temporary session credential, index generation, and sealed mirror/cache. Every row states exact owner, purpose, current state, and proposed disposition; shared project infrastructure must not be mislabeled as checkpoint-owned.

Track an exhaustive row per activation: lifecycle-controller identity, session-binding digest, sequence, purpose, issued/activation/expiry/deactivation times, deactivation purpose, transition-readiness state, terminal-binding marker, and lifecycle-attestation identity/digest, without storing credentials. The final packet, not this temporary workbench, must retain every sealed attestation reference.

The workbench remains private, temporary, Git-ignored, and non-evidentiary. Unique decision-bearing provenance still moves deliberately into the Return Packet or an authorized evidence artifact before removal.

### 11.5 Builder and Critic assignment templates

Add explicit non-inheritance clauses to:

- `templates/3-builder-assignment.md`;
- `templates/4-critic-assignment.md`;
- `templates/6-integration-critic.md`.

Required meaning:

> This context does not inherit the Engineering Lead's live code-intelligence configuration, credential, tenant, graph generation, query history, or narrative. Work only from the exact assignment/candidate, authoritative source, controlling bar, and permitted direct tools named here. If the capability is visible or callable unexpectedly, stop and report the isolation defect.

Do not add graph output to a Critic's mandatory input set. When the capability itself is the artifact under review, use a separately authorized disposable fixture-only test instance and bounded review credential; deny the production Lead tenant and say explicitly that the Critic is testing the service rather than using it to analyze another candidate.

For `templates/3-builder-assignment.md`, add that a graph hint cannot widen the ownership allowlist and any graph-informed path passed by the Lead is labeled advisory and direct-verified. The Builder reports discrepancies rather than treating the graph as an oracle.

For `templates/4-critic-assignment.md`, add Lead graph output, summaries, queries, and dependency reasoning to withheld narrative. Any expected dependency list is a hypothesis the Critic independently corrects through direct inspection; graph absence cannot establish completeness.

For `templates/5-critic-verdict.md`, extend the context-boundary declaration: no Lead-generated code-intelligence result was used as an oracle or proof. Actual reviewed dependencies remain Critic-derived. Copying a graph dependency set, treating no-edge as complete, or relying on an unverified graph claim invalidates the verdict.

For `templates/6-integration-critic.md`, withhold the Lead's graph output/workbench and require direct checklist evidence, exact candidate identities, lineage, and path-scoped change checks. Graph output cannot satisfy a mandatory check or turn unknown coverage into PASS.

### 11.6 `templates/7-return-packet.md`

Add the usage block in §10.7 under exhaustive decision-bearing provenance or procedural declarations. Require an explicit `used: false` row when permitted but unused. Require session deactivation confirmation and every stale rejection/boundary deviation, except that the §9.3 emergency `BLOCKED` path must report deactivation as `UNRESOLVED` rather than fabricate confirmation.

The concise YAML usage block is supplemental. Require one row per decision-bearing graph query in the existing exhaustive provenance table, containing every §10.6 field, or a stable reference from that row to an authorized durable artifact containing those fields. The private workbench is not an acceptable sole surviving source.

Graph output must not appear as a checklist proof or substitute for Critic evidence. Add the service, every session, index generation, sealed mirror/cache, and credential class to the existing resource inventory with exact owner, purpose, state, and proposed disposition. Require the exhaustive ordered `sessions` ledger from §10.7: for each binding cite its sealed lifecycle-attestation ID/digest and record purpose, issue/activation/expiry/deactivation times, deactivation purpose/mode, server-rejection result, terminal marker, and separate before-transition/before-terminal confirmations. On the §9.3 emergency path, require terminal `BLOCKED`, explicit `MISSING`/`UNRESOLVED` values in the final session row, local capability-absence proof, quarantine state, boundary deviation, and exact Owner/operator action required. Record every graph read after Integration or a non-PASS stop in the existing post-verdict-read block and link it to the correct session digest.

### 11.7 `templates/8-orchestrator-receipt.md`

Add only a boundary-level receipt check:

- the declared disposition matched the brief;
- required policy/generation/source/provenance fields are complete when used;
- direct-source verification and deactivation were declared;
- no boundary deviation is hidden;
- graph material is not treated as technical evidence;
- graph service/session/generation/cache resources are completely inventoried with ownership and proposed disposition.

Resolve every cited lifecycle attestation through the existing protected resource-metadata/actual-resource channel. When `sessions` is nonempty, require contiguous sequence and exactly one terminal binding; require no unexplained activation and matching digests, session bindings, times, purposes, revocation results, and resource identities. This is the existing resource-reality check, not a new technical query class.

The Orchestrator must not call the service, inspect raw graph rows, open cited source, reproduce the Lead's analysis, or expand its existing finite receipt-query class merely because a graph exists. If the lifecycle/resource attestation is absent or not resolvable through the already-authorized metadata channel, receipt is `REJECTED` and the exact lifecycle incident is elevated to the Owner; the Orchestrator does not improvise a graph inspection.

### 11.8 Lifecycle and invalid-return templates

For `templates/9-landing-disposition-evidence-reclamation.md`:

- inventory index generations, mirrors/cache, service, and temporary session credential with exact ownership;
- reclaim checkpoint-owned disposable resources only after Owner disposition;
- treat a shared/project-level service or retained last-known-good generation as outside checkpoint reclamation;
- revoke a temporary checkpoint credential only under its declared lifecycle authority;
- return unknown ownership or disposition to the Owner instead of deleting.

For `templates/10-brief-invalid-return.md`:

- add no-start assertions for graph query, connection, index/refresh, credential acquisition, and code disclosure;
- state that optional capability absence/staleness is not a brief defect;
- allow a defect only when the brief improperly requires the capability, contradicts the ratified policy, widens source scope, or lacks a needed Owner authorization;
- never connect to the capability merely to validate an invalid brief.

No eleventh form and no twelfth brief field are created.

### 11.9 Builder stage changes

#### `builder/js/stages/05-source-of-truth.js`

Teach the source-of-truth drafting and validation prompts that derived graphs/indexes are not governing documents, durable program state, evidence stores, acceptance oracles, or a seventh execution/evidence-profile primitive. A capability policy may be governance when the Owner ratifies it; graph content never is.

#### `builder/js/stages/06-rulebook.js`

Teach the drafting prompt always to include the generic, vendor-neutral, default-off normative contract for optional Lead-only live code intelligence. Stage 6 does not ask a separate adoption question and does not decide whether the current project enables the capability; it drafts the reusable rule and audits that the capability cannot add a role, authority, evidence class, or universal requirement. Project-specific adoption status is owned solely by Stage 7.

#### `builder/js/stages/07-roles.js`

Add one required Owner decision, `leadCodeIntelligencePolicy`, to the existing tools/platform question. It offers exactly these project-level dispositions:

```text
disabled
proposal/evaluation only
qualified optional Lead-only capability
delegate investigation and proposal
```

The Stage-7 answer is the single adoption decision. Conditional follow-ups may capture an already-ratified adapter identity, source/provider boundary, enforcement level, evaluation owner, external lifecycle-controller identity, maximum TTL, and protected attestation channel, but must never request or store credentials. Add capability mapping to the generated role contracts and platform configuration, which must:

- map the capability only to the Engineering Lead;
- state the real enforcement level;
- keep it default-off and session-bound;
- prohibit inheritance by Builders, Critics, and Orchestrator;
- make procedural-only isolation evaluation-only and require technical isolation plus the revocation/attestation hook for a live pilot;
- draft configuration but not install/connect it without Owner approval;
- avoid claiming that one AI product's profiles are stronger isolation than verified.

#### `builder/js/stages/08-forms.js`

Include the exact field-7, workbench, non-inheritance, Return Packet, and receipt additions from this section. The prompt must preserve the eleven-field brief and distinct handoffs.

#### `builder/js/stages/09-bootstrap.js`

Extend cross-artifact contradiction checks so capability wording agrees across Rulebook, role contracts, forms, source-of-truth map, and first checkpoint. Report rather than silently resolve any mismatch.

The bootstrap may inventory or propose the capability but must not install, connect, index, acquire credentials, disclose code, or make it a fit requirement.

#### `builder/js/stages/10-orchestrator-init.js`

Preserve the exact eleven `BRIEF_FIELDS`. Add the optional capability block only inside fields 7, 9, and 10. The generated Orchestrator prompt must:

- echo an already-ratified capability policy rather than select the product;
- treat omission as `PROHIBITED`;
- require an exact bar citation for `REQUIRED_BY_BAR`;
- avoid individual query/use instructions;
- state that optional absence/staleness is not a brief defect;
- avoid connecting to the tool while producing or validating the brief.

#### `builder/js/stages/11-first-execution.js`

Add a conditional block to the Engineering Lead prompt:

- validate the brief without graph assistance;
- report authoritative actual state first;
- if permitted, verify capability policy/session and call status;
- use only fresh exact-identity results;
- verify consequential results directly;
- record provenance;
- invalidate graph use after included-source changes;
- revoke access before spawning a non-Lead context;
- wait for the external controller's sealed revocation attestation before spawning a non-Lead context or submitting a normal terminal packet; on timeout use only the capability-absent emergency `BLOCKED` branch;
- disclose an exhaustive session-binding/timestamp/purpose/attestation ledger and deactivation state in the terminal packet;
- continue normally if an optional service is unavailable.

Do not inject Code-Graph-RAG instructions into Builder or Critic prompts except the non-inheritance stop rule.

#### `builder/js/stages/12-return-disposition.js`

In the same Lead-context packet path, require the concise usage/query/resource ledger, post-verdict reads, direct-verification mapping, deviations, and a lifecycle-attestation-backed deactivation. The Lead prepares a normal packet before deactivation but submits it only after controller acknowledgment in that same context with the capability removed. Add the §9.3 emergency branch: once local capability absence is proven, a revocation-acknowledgment failure may submit only terminal `BLOCKED` with `MISSING`/`UNRESOLVED` lifecycle fields and a boundary deviation. In the fresh Orchestrator receipt path, resolve only the cited nontechnical lifecycle/resource attestation through the existing authorized resource-metadata channel; permit identity, integrity, time, completeness, and resource-state checks while explicitly prohibiting graph invocation, raw-result inspection, source inspection, or technical re-derivation. The emergency packet receives `REJECTED` and exact Owner escalation.

#### `builder/js/stages/13-scaling.js`

Require one isolated graph tenant/generation/source policy per authorized repository/track. A cross-track edge cannot grant authority or expand read scope. Distinguish shared project-level service resources from checkpoint-owned disposable state for preservation/reclamation.

Stages 1–4 need no capability-specific change. Do not add a fourteenth stage or modify the stage registry merely to represent a tool.

#### Applicable recovery prompts

Every recovery path that can regenerate, repair, audit, or invalidate affected governance must preserve the same capability decision and boundaries. Update and test at least `repair-brief-invalid`, `audit-brief-drift`, `repair-component-gap`, `plateau-audit`, `repair-blocked-return`, and `audit-stale-verdicts`, plus the Stage 6–9 governance/form recovery prompts. A recovery prompt must not silently enable the capability, invent a missing Stage-7 answer, connect to/index the service, widen role inheritance, treat graph output as evidence, or bypass downstream staleness after the Owner decision changes.

#### Compiler, state, and design documentation

- **`builder/js/compiler.js`:** update the Stage-7 Owner-decision summary to include the Lead capability/configuration boundary and Stage 8 to mention the amended form guards.
- **`builder/js/state.js`:** when a newly required Stage-7 question or completion-gate ID is absent from saved state, `computeStageStatus` must return `needs_review` and cascade staleness downstream. Preserve old answers; never silently apply a default capability decision.
- **`builder/js/lib/schema.js`:** no new question type, prompt layer, or stage-module property is required.
- **`builder/js/storage.js`:** no storage schema bump is necessary if current required-answer/gate absence correctly produces `needs_review`.
- **`builder/PRODUCT-SPEC.md`:** document the optional Lead-only capability, no new stage, the Stage-7 Owner decision, and the invariant that the local Builder remains offline and only drafts configuration/prompts for external agents.
- **`builder/README.md`:** update validator coverage and clarify that the Builder never connects to the graph.
- **root `README.md`:** add one concise statement that the publication may guide adopting projects to configure Lead-only code intelligence; the service is not installed in, shipped with, or called by the publication/Builder.

### 11.10 Validation and generated artifacts

Extend `builder/tests/validate.mjs` with cross-cutting checks that compiled prompts preserve:

- Lead-only mapping;
- no new role/tier;
- optional-not-mandatory semantics;
- exact three-tool surface in the reference profile;
- status/freshness and direct-verification rules;
- no graph-as-evidence wording;
- non-inheritance for Builder/Critic contexts;
- no Orchestrator source/tool access;
- no production-tenant Critic access, while a fixture-only candidate-under-test exception remains reviewable without becoming ordinary graph-assisted analysis;
- no twelfth brief field;
- `REQUIRED_BY_BAR` requires an exact ratified citation;
- optional outage is fallback, not terminal by itself;
- externally attested technical deactivation before role transition and every normal terminal submission, including the required session/timestamp/receipt fields, plus the strictly capability-absent emergency `BLOCKED`/receipt-rejection path.

Also test:

- every form definition contains its form-specific guard from §§11.3–11.8;
- every applicable recovery prompt—including `repair-brief-invalid`, `audit-brief-drift`, `repair-component-gap`, `plateau-audit`, `repair-blocked-return`, `audit-stale-verdicts`, and Stage 6–9 governance/form recoveries—preserves default-off semantics, the single Stage-7 Owner decision, role isolation, and downstream invalidation;
- Stage 10 still has exactly eleven fields;
- Stage 12's Lead path discloses use/resources and cites the sealed lifecycle attestation, while its fresh receipt path resolves only authorized nontechnical resource metadata and prohibits graph/source use or inspection;
- Stage 12's emergency path permits only a capability-absent `BLOCKED` packet with `MISSING`/`UNRESOLVED` lifecycle fields and forces receipt rejection/Owner escalation;
- Stage 12 requires an exhaustive, contiguous session ledger, associates every decision-bearing query with one binding, and preserves every deactivation/reactivation attestation through terminal receipt;
- Stage 13 prevents cross-track namespace/authority leakage;
- no compiled prompt says graph output proves PASS/absence, authorizes scope, replaces reviewed dependencies, or controls currency;
- a saved pre-change journey missing the new required Stage-7 Owner answer/gate becomes `needs_review` and cascades downstream;
- edited compiled prompts become visibly stale rather than retaining an old accepted result.

After canonical edits:

```text
python3 scripts/build.py
python3 scripts/build.py --check
node builder/tests/validate.mjs
```

Visually inspect affected generated pages. The canonical sources are `article.md`, `RULEBOOK.md`, `templates/*.md`, and Builder source; generated HTML must match the deterministic build and must not be edited manually.

Manually walk the Builder in a browser and verify it makes no network request. Do not hand-edit `index.html`, `RULEBOOK.html`, `forms/index.html`, or `forms/*.html`.

## 12. Sidecar implementation layout

Create the reference implementation in a dedicated external tooling repository or service directory, not as a runtime dependency of the article or every adopting project:

```text
lead-code-intelligence/
  pyproject.toml
  uv.lock
  README.md
  SECURITY.md
  LICENSES.md
  policy/
    schema.json
    example.toml
  src/lead_code_graph/
    facade.py
    tools.py
    schemas.py
    envelopes.py
    instructions.py
    auth.py
    lifecycle.py
    attestation.py
    limits.py
    freshness_probe.py
    query_adapter.py
    query_policy.py
    fixed_queries.py
    snippet.py
    audit_log.py
    sync/
      controller.py
      repository.py
      projection.py
      fingerprint.py
      generation.py
      upstream.py
      manifest.py
      routing.py
      permissions.py
      cleanup.py
  tests/
    unit/
    integration/
    security/
    role_isolation/
    freshness/
  eval/
    corpus.yaml
    scoring.py
    baseline.md
  runbooks/
    install.md
    sync.md
    activate-lead.md
    deactivate-lead.md
    health.md
    rollback.md
    upgrade.md
    remove.md
```

Use a separate Python 3.12/3.13 environment and lock every direct/transitive package. Do not add Code-Graph-RAG to an adopting application's production dependency graph.

### 12.1 External state layout

```text
<state-root>/
  policies/<project-id>.toml
  active-routing/<project-id>.json
  previous-routing/<project-id>.json
  locks/<project-id>.sync.lock
  locks/<project-id>.serving.lock
  generations/<project-id>/<generation-id>/manifest.json
  mirrors/<project-id>/<generation-id>/...
  upstream/<project-id>/<generation-id>/...
  backends/<project-id>/<generation-id>.sock
  database/<project-id>/...
  logs/<project-id>/...
  sessions/<short-lived-session-id>.json
  attestations/<project-id>/<checkpoint-id>/<session-digest>.json
```

Validate resolved cleanup targets against the expected state root and project ID. Never use a home directory, `/`, unresolved variable, broad glob, or repository root as a destructive target. Mutable state uses least-privilege permissions; sealed mirrors use an effective read-only view verified with an actual failed write attempt.

## 13. Security model

### 13.1 Threats

- stock or accidentally forwarded mutation tools;
- accidental construction of the upstream model-backed MCP registry or unscoped retriever;
- accidental introduction of caller-supplied or model-generated Cypher outside the fixed-template profile;
- wrong repository, worktree, project, tenant, or generation;
- stale-as-fresh answers and query-time races;
- symlink/path traversal or special-file reads;
- C/C++ compilation-database or language-frontend reads outside the coherent mirror;
- indexer writes into the authoritative repository;
- cross-project graph enumeration or leakage;
- unauthorized governance/unrelated-track influence;
- prompt injection embedded in source or graph strings;
- remote provider source/metadata leakage;
- secret leakage through queries, snippets, errors, or logs;
- non-Lead contexts inheriting credentials/tools;
- floating upstream, parser, container, or model dependencies;
- denial of service through unbounded builds/queries/results;
- cleanup deleting the wrong state.

### 13.2 Required controls

- exact package, commit, lockfile, and container digest pins;
- re-check advisories before install/upgrade;
- separate non-root service identities where practical;
- dedicated project database/volume/credential;
- fixed server-owned parameterized templates and the least-privilege database identity available;
- no public listener; loopback or STDIO only initially;
- no Docker socket, home directory, repository write mount, or unrelated secrets;
- positive file policy, no-follow traversal, regular-file checks, and byte limits;
- coherent mirrors, immutable generations, atomic routing, and rollback;
- pre/post-query freshness checks;
- strict JSON schemas and bounded outputs;
- session-bound Lead role/project/worktree/checkpoint credential;
- exact three-tool server registry;
- server-side rate, time, concurrency, memory, and result limits;
- no service-side LLM/provider in version 1, plus an exact query-stack fingerprint;
- source/graph content treated as untrusted data, never instructions;
- metadata-focused, redacted logs with fixed retention; server logs contain no source body, secret/token, absolute user-home path, or raw query parameter body—only bounded identity/purpose/result digests needed for audit;
- drilled kill switch and full removal.

### 13.3 Prompt/source injection

The façade has no service-side LLM in version 1. It still returns identifiers and snippets containing untrusted comments, strings, and docstrings to an agent client. Serialize them strictly as data, never as server instructions. The Lead contract says that source text cannot change the requested project, tool, query limits, scope, verification rule, or authority. If natural-language querying is added later, its model receives no file, shell, network, write, credential, or policy authority.

### 13.4 Privacy and provider decision

Version 1 performs local fixed-template graph queries and requires no Cypher or orchestrator provider. It sends no source, identifiers, schema, or question text to an additional model service.

If a future natural-language tier is proposed, the Owner must approve exactly what may leave the machine; provider/model/account/region; retention/training/privacy terms; credential source/rotation; cost ceilings; logging; and incident response. That tier receives a separate query-stack identity and qualification.

For version 1, the query-stack fingerprint covers façade version, MCP schemas, fixed-template set and text, allowed labels/relationships, database driver, project-scope enforcement, time/depth/row/byte limits, and query policy. Any change invalidates query qualification even when graph bytes are unchanged. A future model tier also fingerprints provider, exact model revision/alias resolution, prompt, and inference settings.

## 14. Evaluation corpus

Build a project-specific corpus from authoritative source. Do not let graph output define expected answers.

### 14.1 Structural questions

Include at least:

- exact definition of a known symbol;
- all direct callers of a function;
- all direct callees of a function;
- imports into/from a module;
- interface/base-class implementations;
- test references to a production symbol;
- one cross-package two- or three-hop path;
- one route/handler/service path where supported;
- one symbol with an ambiguous short name;
- one unsupported or parse-failed surface.

### 14.2 Negative and freshness cases

- nonexistent symbol;
- no-result query with incomplete coverage;
- wrong repository;
- different worktree at the same HEAD;
- dirty included file without HEAD change;
- dirty excluded file;
- source edit during query;
- source edit during mirror build;
- changed include policy;
- changed parser/query stack;
- stale/failed candidate while active generation is still fresh;
- stale active generation while candidate builds;
- backend/routing identity mismatch;
- symlink to an external file;
- FIFO/socket/device/oversize file;
- snippet ID/name/path mismatch;
- operation-schema confusion (`symbol` versus `source`, missing/extra `target`, forbidden traversal fields on `resolve_symbol`);
- ambiguous source/target selectors, traversal cycles, tied shortest paths, deterministic ordering, and `limit + 1` truncation;
- raw Cypher/write/procedure injection;
- cross-tenant/project enumeration;
- prompt injection in a comment/docstring;
- Builder/Critic/Orchestrator tool discovery and invocation attempts;
- production-tenant denial plus a bounded fixture-only Critic candidate-under-test;
- multiple Lead activation/deactivation/reactivation cycles with every query mapped to the correct session-ledger row;
- session expiry, explicit revocation, process teardown, transition-hook blocking, missing/forged/mismatched lifecycle attestations, and attempted terminal return before acknowledgment.

### 14.3 Baseline experiment

Compare fresh Engineering Lead-like sessions using:

```text
Baseline: Git + rg + direct source + language tooling + tests
Candidate: same tools plus the qualified graph façade
```

Randomize order and hide expected answers from the acting agent. Measure:

- file-set precision/recall/F1;
- symbol/edge precision and recall;
- unsupported-claim count;
- severe missed dependency count;
- time to first correct path set;
- total task time;
- source bytes/context consumed;
- number of direct-source verification steps;
- index/query latency, memory, disk, and service cost; provider cost is `NOT_APPLICABLE` in fixed-query version 1;
- stale/wrong-scope/role rejections;
- user-rated decomposition usefulness.

Pre-register a value gate. A reasonable starting gate is either:

1. at least 20% median time reduction with no accuracy regression; or
2. at least a 10-percentage-point improvement in file-set F1 or relevant-edge recall on five or more designated multi-hop tasks, zero severe unsupported claims, and no more than 10% time increase.

The Owner may ratify a different gate before results exist. Do not tune the gate after observing the outcome.

## 15. Acceptance criteria

### 15.1 Method coherence

- the article describes an optional Tier-2 capability, not an article-repository integration;
- no new role, tier, success authority, evidence class, or terminal state is introduced;
- Owner, Orchestrator, Lead, Builder, and Critic authority remains unchanged;
- the Orchestrator reports availability but cannot prescribe use;
- optional outage falls back rather than blocking;
- every canonical source, template, Builder prompt, and generated page agrees;
- generated HTML is deterministic and validation passes.

### 15.2 Tool and role isolation

- exactly three tools are discoverable and callable by the Lead façade;
- dangerous upstream names return unknown-tool at the server;
- version 1 does not instantiate upstream `create_server`, `MCPToolsRegistry`, `CypherGenerator`, or `CodeRetriever`;
- Builder, Orchestrator, ordinary Critic/Integration, ambiguous, expired, and wrong-project sessions cannot list or call the production Lead capability;
- the only Critic exception is a separately authorized, disposable, fixture-only candidate-under-test with bounded review credentials and no production tenant access;
- spawned contexts do not inherit it;
- an Owner-preauthorized external controller technically revokes every exact session binding and sealed attestations record each binding's digest, purpose, issue/activation/expiry/deactivation times, mode, server rejection, and resource reality before role transition and every normal terminal return; the packet's exhaustive ledger accounts for reactivations, and failure exercises the emergency `BLOCKED`/rejected-receipt path;
- a client allowlist is not the only enforcement layer.

### 15.3 Source and freshness

- mirror bytes equal coherent pre/post live included-source bytes;
- no authoritative repository write occurs;
- symlinks/special/out-of-scope/oversize files are rejected;
- C/C++ and C# frontend settings are server-fixed to Tree-sitter, inherited overrides are rejected, and an ancestor/absolute-path compilation-database fixture cannot cause an out-of-mirror read;
- every result binds repository/worktree/generation/policy/query stack;
- dirty-worktree changes are detected without relying on HEAD;
- pre- and pre-return probes catch concurrent edits;
- candidate failure does not disable a fresh active generation;
- stale/identity mismatch never returns graph facts;
- snippet content comes only from the matching sealed generation.

### 15.4 Query safety

- only fixed server-owned parameterized templates execute; no caller-supplied or model-generated Cypher reaches the database;
- all three operation schemas enforce their exact required/forbidden fields, selector cardinality, and response shape; the obsolete `symbol` key and cross-operation fields are rejected;
- `resolve_symbol`, `neighbors`, and `shortest_path` fixtures prove deterministic entity/path/edge ordering, `limit + 1` truncation, direction semantics, ambiguity handling, and empty-result coverage warnings;
- project scope is server-injected;
- raw agent Cypher, multi-statements, writes, procedures, admin operations, and unbounded queries are rejected;
- results obey time/row/byte limits;
- source text cannot alter system policy;
- no cross-tenant rows or project names are visible.

### 15.5 Provenance and engineering behavior

- Lead calls status before use;
- every consequential result has authoritative-source verification recorded;
- graph output never satisfies a checklist or Critic evidence requirement;
- stale rejections and fallback are disclosed;
- post-verdict consequential reads reopen review;
- Return Packet usage declaration is complete without asking the Orchestrator to technically inspect output.
- the Return Packet cites the sealed lifecycle attestation, and the existing receipt gate can resolve its nontechnical identity/resource facts without graph or source access.
- every activation/reactivation appears in the contiguous session ledger, every consequential query names its binding, and no prior transition attestation is lost.

### 15.6 Supply chain and operations

- artifact, transitive dependencies, grammars, database image, and fixed query stack are pinned; any later provider tier is pinned separately;
- current advisories and compatibility are checked;
- all writes remain in declared state boundaries;
- install, sync, health, rollback, upgrade, removal, and incident runbooks pass dry runs;
- kill switch disables access without altering project source;
- full removal leaves normal Engineering Lead execution intact.

## 16. Phased implementation plan

Each phase has an independent authorization and exit gate. Passing one does not authorize the next.

### Phase 0 — ratify the method design

1. confirm the vendor-neutral capability name and Code-Graph-RAG reference status;
2. ratify Lead-only/default-off/advisory/direct-verification rules;
3. ratify technical role isolation and the exact external revocation/attestation controller for any live pilot; procedural-only isolation is evaluation-only;
4. approve provider/privacy/resource principles;
5. approve canonical article/Rulebook/form/Builder scope;
6. record unresolved Owner judgments.

**Exit:** exact design is Owner-approved. No live installation occurs.

### Phase 1 — disconnected upstream capability audit

1. re-check latest release, advisories, artifact attestation/hash, license, and changelog;
2. inspect the exact installed wheel and `tools/list`;
3. resolve language grammar set and immutable Memgraph digest;
4. verify platform compatibility and query-only authorization options;
5. capture all file/database/network/process writes;
6. prove explicit project-name and backend startup behavior;
7. prove the custom direct Memgraph adapter does not construct any upstream MCP/model/retriever object;
8. prove forced C/C++ and C# Tree-sitter settings and the out-of-mirror compilation-database negative control;
9. write the threat and data-egress decision.

**Exit:** reproducible evidence supports the chosen containment. No agent is connected.

### Phase 2 — sidecar and fixed project policy

1. create the external code layout and lockfile;
2. implement policy parsing and strict schema;
3. implement no-follow coherent projection and fingerprinting;
4. implement external state boundaries and cleanup validation;
5. implement full-generation index/audit/seal lifecycle;
6. run the structural corpus against disposable graphs;
7. prove project source/status are unchanged.

**Exit:** disconnected corpus correctness, scope, write-containment, and resource measurements pass their predeclared Phase-2 gates. Comparative utility against the ordinary-tool baseline is not gated until the qualified façade is exercised in Phase 6.

### Phase 3 — read-only façade

1. implement strict envelopes and three tools;
2. implement freshness probe and two-snapshot calls;
3. implement only the fixed-template structured query policy;
4. implement generation-bound snippet identity;
5. implement limits, logs, injection handling, and coverage warnings;
6. prove dangerous tool absence and direct-call rejection;
7. run all security negative controls.

**Exit:** tool, query, source, and freshness acceptance gates pass.

### Phase 4 — atomic publication and recovery

1. implement candidate backend identity handshake;
2. implement immutable manifest and single authoritative routing record;
3. implement serving/sync locks and compare-and-swap promotion;
4. implement startup recovery, last-good retention, and rollback;
5. inject failures at every lifecycle boundary;
6. drill kill switch and cleanup.

**Exit:** no crash or mismatch serves split/stale state; rollback is proven.

### Phase 5 — method repository implementation

1. edit canonical article, Rulebook, templates, and Builder stages from §11;
2. extend validation tests;
3. regenerate deterministic HTML;
4. run build/validation and visual checks;
5. audit cross-document wording for authority contradictions;
6. obtain independent method review.

**Exit:** all canonical and generated artifacts agree and existing invariants still pass.

### Phase 6 — role-isolated Engineering Lead pilot

1. create short-lived Lead-only session bindings through the Owner-preauthorized lifecycle controller, including at least one deactivation/authorized reactivation cycle;
2. prove other roles cannot list or invoke tools;
3. run one bounded, valid checkpoint with optional use;
4. record direct verification and provenance;
5. run the pre-registered comparative utility experiment against the ordinary-tool baseline and evaluate the §14.3 value gate;
6. exercise the blocking transition hook, revoke the exact binding, prove server rejection, and receive the sealed lifecycle/resource attestation before every role transition and normal terminal return;
7. inject a revocation-acknowledgment failure and prove that only the capability-absent emergency `BLOCKED` packet is emitted and its receipt is rejected/escalated;
8. have the fresh receipt context resolve only the attestation's authorized nontechnical metadata and match it to the normal packet;
9. inspect source/status/state roots after completion.

**Exit:** all safety, role, correctness, and pre-registered utility gates pass with no method regression.

### Phase 7 — qualification decision

The Owner chooses one per-project state:

```text
QUALIFIED_LEAD_OPTIONAL
SUSPENDED
RETIRED
```

Qualification in one adopting project does not automatically qualify another. Shared software is permitted; tenants, source policies, indexes, endpoints/credentials, freshness state, and logs remain isolated.

## 17. Operations and failure behavior

### 17.1 Session start

1. confirm one valid Engineering Lead role/checkpoint;
2. validate the brief and report graph-independent authoritative actual state, including `started_at_utc`, before activating or calling the capability;
3. only when field 7 permits/requires use and the Lead chooses to use it, have the Owner-preauthorized external controller mint/bind the short-lived session identity and write the activation attestation;
4. verify session-binding digest, issue/expiry, project policy, transition hook, and active routing record without treating them as the underlying repository actual state;
5. run `graph_status` and compare it with the already-reported authoritative actual state;
6. continue only on exact `READY`; otherwise deactivate the binding and use fallback.

### 17.2 Health checks

Check without returning source:

- façade/process health;
- policy and routing checksum;
- manifest/backend handshake;
- Memgraph connectivity through query identity;
- live source probe status;
- generation/policy/query-stack agreement;
- disk/memory/latency/expiry thresholds.

### 17.3 Failure matrix

| Failure | Agent-facing behavior | Operator action |
|---|---|---|
| Optional service absent | Use fallback | Repair outside checkpoint or leave absent |
| Source/policy/query stack changed | `STALE`, no facts | Full candidate build |
| Probe unavailable | `ERROR`, no facts | Restore probe; never bypass |
| Candidate build failed, active fresh | Continue serving active | Diagnose candidate |
| Candidate build failed, active stale | No graph facts | Repair/rebuild; Lead uses fallback |
| Routing/backend mismatch | `ERROR`, no facts | startup recovery or verified rollback |
| Database/query backend unavailable | `ERROR`, no facts | fallback or backend repair |
| Parse/coverage gap | warning; no strong negative claim | direct source/language tooling |
| Wrong role/project/worktree | authorization/identity error | revoke and investigate |
| Revocation/attestation acknowledgment missing or mismatched | prevent transition/terminal success; after local capability removal, emit only emergency `BLOCKED` with `UNRESOLVED` lifecycle fields | quarantine binding/service, reject receipt, escalate, and repair lifecycle channel |
| Repository write or source leakage | immediate suspension | incident response and full audit |
| New upstream advisory | suspend affected version | assess, patch, requalify |

### 17.4 Kill switch

The operator can:

1. set capability status `SUSPENDED`;
2. revoke all session tokens;
3. seal lifecycle attestations proving exact binding deactivation and server rejection;
4. disable/remove client entries;
5. stop façade/query/index/database processes;
6. preserve bounded incident logs and policy evidence;
7. validate exact external state targets;
8. remove disposable graphs, mirrors, sockets, and secrets;
9. verify project source/status are unchanged;
10. continue engineering with the documented fallback.

### 17.5 Upgrade rule

Any change to Code-Graph-RAG, its wheel/source, parser grammars, Memgraph, fixed query templates, database driver, façade schema/policy, source policy, or role activation mechanism invalidates the relevant qualification. A later query model/provider/prompt/settings tier does likewise. Build a new candidate stack, rerun affected corpus/security/role tests, and promote deliberately. Never auto-upgrade a live Lead service.

## 18. Rollback and removal

Rollback is external and source-independent:

1. deactivate/revoke the Lead capability through the configured external controller and retain its sealed lifecycle attestation;
2. atomically restore the verified previous routing record only if its source and query stack remain fresh;
3. otherwise serve no graph and use fallback;
4. stop services and remove the exact declared external state after validation;
5. remove client configuration and secrets under the adopting project's authority rules;
6. confirm repository HEAD, status, worktrees, source bytes, and governance are unchanged;
7. retain only approved evaluation/incident metadata;
8. if retiring the method feature, amend canonical article/Rulebook/Builder content through normal Owner ratification and regenerate HTML.

No project migration or graph-derived recovery is permitted. The graph is rebuilt from authoritative source, never the reverse.

## 19. Required implementation-agent handoff

At every phase, return:

1. exact authority and role used;
2. article and adopting-project pre/post HEAD, branch, worktrees, and full status;
3. every file/state path created or changed and its purpose;
4. every install, image, model, provider, credential class, listener, process, and volume introduced;
5. upstream version/commit/artifact hash, dependency lock, grammars, database digest, and query-stack fingerprint;
6. exact public `tools/list` and schemas;
7. policy, manifest, routing, every session-binding/lifecycle-attestation ledger row, and source-fingerprint examples with secrets redacted;
8. commands/tests and complete results;
9. raw evaluation scores and resource/cost measurements;
10. all freshness, path, query, tenant, role, injection, and crash negative-control results;
11. direct-source verification/provenance samples;
12. deviations, unresolved risks, and failed mandatory criteria;
13. rollback/removal steps and drill results;
14. whether any additional Owner decision or authorization is required.

Do not summarize a failed mandatory criterion as “mostly passed.” Do not implement a later phase merely because an earlier phase succeeded.

### 19.1 Final instruction to the implementation agent

> Implement the Live Code Intelligence capability as an optional, default-off Engineering Lead tool and Code-Graph-RAG as its pinned offline indexing backend. Do not index the article repository as the feature's target. Preserve the hierarchy: the Owner ratifies capability boundaries, the Orchestrator only reports already-ratified availability, and the Lead owns optional use inside HOW. Build an external generation-safe sidecar with a custom direct Memgraph adapter, expose exactly three read-only tools, never construct the stock MCP/model/retriever registry, enforce project/worktree/policy/query-stack freshness before and after every call, require direct-source verification, technically isolate all non-Lead roles, and keep normal Git/rg/direct-source/tests as the fallback. Implement the Owner-preauthorized external revocation controller and sealed nontechnical lifecycle/resource attestation before live use. Then coherently update the canonical article, Rulebook, templates, Builder prompts/tests, and deterministic HTML. Stop at every authorization or failed acceptance gate.

## 20. Implementation-time unknowns

The implementer must verify rather than assume:

- the current safe upstream release and installed-wheel behavior;
- current security advisories;
- exact tool registry and schemas;
- platform/architecture compatibility of the selected Memgraph digest;
- resolution or workaround of the Memgraph 3.x issue;
- real database read-only authorization behavior;
- exact language/parser coverage for the pilot project;
- client role/profile/tool inheritance and revocation behavior;
- confirmation that version 1 has no query provider/egress, or the privacy, retention, model identity, determinism, and cost of a separately proposed later tier;
- full-build p50/p95 latency, memory, and disk use;
- whether the adopting project permits dirty/untracked source in the Lead read scope;
- the adopting project's governance lock for client/configuration edits;
- the exact client/server mechanism that proves technical non-Lead denial and blocking revocation before live use; cooperative procedure alone is insufficient.

## 21. Final recommendation

The corrected article recommendation is **yes**: teach the Zero-Trust Hierarchy that an adopting project may provide a live, revision-bound code-intelligence capability specifically to its Engineering Lead. This is a natural extension of the Lead's existing ownership of tools and decomposition and can materially improve multi-file orientation and impact analysis.

The article should teach the capability, not mandate the vendor. Code-Graph-RAG should appear as the current reference profile with an explicit safe wrapper. Its graph remains derived, advisory context; direct source, tests, and independent Critics retain their existing authority.

Implement the façade and qualification gates before offering live access. Once those pass, there is no methodological reason to wait for a later project milestone: a project Owner may authorize a measured Lead-only pilot immediately. What must wait is universal/default access, raw stock-server exposure, and any claim that the graph is evidence.

## Sources

- [Code-Graph-RAG repository](https://github.com/vitali87/code-graph-rag)
- [Pinned v0.0.589 release](https://github.com/vitali87/code-graph-rag/releases/tag/v0.0.589)
- [Pinned source commit](https://github.com/vitali87/code-graph-rag/commit/76b8d6c25e85c7531797c0e946110570b857064d)
- [PyPI 0.0.589 package, artifacts, hashes, and attestation](https://pypi.org/project/code-graph-rag/0.0.589/)
- [Upstream MCP guide and tool surface](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/mcp-server.md)
- [Pinned stock server initialization](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/mcp/server.py#L80-L110)
- [Pinned stock MCP registry](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/mcp/tools.py#L120-L430)
- [Pinned stock snippet query](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/cypher_queries.py#L162-L168)
- [Upstream configuration guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/getting-started/configuration.md)
- [Upstream architecture overview](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/overview.md)
- [Upstream graph schema](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/graph-schema.md)
- [Upstream security model](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/architecture/security.md)
- [Pinned C/C++ compilation-database ancestor search](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/parsers/cpp_frontend/frontend.py#L41-L55)
- [Pinned libclang compilation-argument use](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/parsers/cpp_frontend/frontend.py#L883-L901)
- [Upstream real-time update guide](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/docs/guide/realtime-updates.md)
- [Project-name derivation at the pinned tag](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/utils/path_utils.py#L16-L24)
- [Updater state-file implementation](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/graph_updater.py#L158-L201)
- [Upstream `CGR_HOME` default](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/config.py#L207)
- [Upstream `state.json` location](https://github.com/vitali87/code-graph-rag/blob/v0.0.589/codebase_rag/cgr_state.py#L12-L23)
- [Security advisory GHSA-85gg-2gfq-q95m](https://github.com/vitali87/code-graph-rag/security/advisories/GHSA-85gg-2gfq-q95m)
- [Security advisory GHSA-vvr2-h2jp-838m](https://github.com/vitali87/code-graph-rag/security/advisories/GHSA-vvr2-h2jp-838m)
- [Memgraph 3.x incompatibility issue #1257](https://github.com/vitali87/code-graph-rag/issues/1257)
- [Official Codex MCP documentation](https://developers.openai.com/codex/mcp)
