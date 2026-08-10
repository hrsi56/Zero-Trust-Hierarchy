# Zero-Trust Hierarchy form 8 — Orchestrator receipt and gate

The **Orchestrator** applies this bounded gate to a form-7 Return Packet and only the durable
evidence records it cites. The result is an entry in the project's **existing durable program-state
document or log**. It is not a new authority tier, a second technical verdict, a requirement to
commit the Return Packet, an Owner disposition, or continuation authority.

The Orchestrator MUST NOT inspect source/content as a second reviewer, rerun tests, rederive
metrics, review generated technical outputs, inspect Builder workspaces, or read the Engineering
Lead's workbench.

````markdown
# Program-State Receipt Entry — [checkpoint id] — [entry id]

- existing program-state document/log:
- entry location or key:
- received_at_utc:
- decided_at_utc:
- packet terminal status: PASS | BLOCKED | PLATEAU | BUDGET_EXHAUSTED
- receipt result: SUPPORTED | REJECTED
- authorized target workspace/repository:
- authorized checkpoint:
- exact ratified anchor:
- execution/evidence profile: GIT_REFERENCE | DECLARED_EQUIVALENT — [mapping]
- final candidate identity / Git final_candidate_sha: [identity] | NOT_CREATED — [packet reason]
- evidence identity / Git evidence_tip_sha: [identity] | NOT_CREATED — [packet reason]

## A. Gates required for every valid-run packet
| # | Receipt check | Evidence inspected | PASS / FAIL | Exact defect |
|---:|---|---|---|---|
| A1 | Right target, exactly one checkpoint, exact anchor, and unchanged eleven-field brief echo | | | |
| A2 | Declared profile supplies identity, evidence linkage, dependency-change, isolation/write-ownership, preservation, and reclamation primitives | | | |
| A3 | Actual start state, administrative/active timing, pauses, and terminal status are internally consistent | | | |
| A4 | Checklist mapping is honest for the status: complete for PASS; every open item visible for non-PASS | | | |
| A5 | Decision-bearing provenance is exhaustive; seeds, role boundaries, and every post-verdict read are declared | | | |
| A6 | Live resource report matches reality, including every `NOT_CREATED` claim and unrelated resource | | | |
| A7 | Every candidate, verdict, evidence, data, or source identity claimed to exist resolves under the declared profile | | | |

## B. PASS-only gates

Complete every row when packet status is PASS. None may be `NOT_APPLICABLE`.

| # | PASS-specific receipt check | Evidence inspected | PASS / FAIL | Exact defect |
|---:|---|---|---|---|
| P1 | Every complete-checklist criterion and mandatory independent surface has direct evidence | | | |
| P2 | Every required component verdict is durable, binds an exact candidate, records provenance/reviewed dependencies, and is computed-current | | | |
| P3 | A fresh Integration PASS binds the exact final candidate | | | |
| P4 | Final candidate and evidence tip are distinct, independently resolvable, linked, and preserve every relied-on verdict | | | |
| P5 | Terminal delta is evidence-only | | | |
| P6 | Every post-verdict read is non-decision-bearing; no artifact or technical claim changed after Integration | | | |

Packet is non-PASS: NOT_APPLICABLE — [BLOCKED / PLATEAU / BUDGET_EXHAUSTED]. Continue with section C.

## C. Conditional non-PASS integrity gates

Complete this section only for BLOCKED, PLATEAU, or BUDGET_EXHAUSTED. Do not demand a candidate,
Critic, verdict, Integration review, branch, or evidence identity that the run never created.

| # | Conditional check | PASS / FAIL / NOT_APPLICABLE | Evidence or specific reason |
|---:|---|---|---|
| N1 | Exact terminal reason and smallest next decision/action are present; no PASS is implied | | |
| N2 | Existing candidate identity resolves, or `NOT_CREATED` reason is verified | | |
| N3 | Existing verdict/evidence identity resolves, or `NOT_CREATED` reason is verified | | |
| N4 | Candidate/evidence linkage and terminal delta are checked when both operands exist | | |
| N5 | Existing evidence is preserved in the proposed lifecycle; no absent artifact was fabricated | | |
| N6 | Integration result is truthful: actual verdict, or `NOT_RUN — reason` | | |

Use `NOT_APPLICABLE — [specific reason]` only when a required operand does not exist or the declared
profile uses a different named query. An absent PASS requirement is not a successful check.

## D. Bounded profile queries

Record exact query, exit/status, and output. Run a query only when its operands exist. Otherwise
record `NOT_APPLICABLE — [specific missing operand]`.

### Git reference profile

```text
git log --oneline main..<evidence_tip_sha>
->

git diff --stat main...<evidence_tip_sha>
->

git diff --name-only <final_candidate_sha>..<evidence_tip_sha>
->

git merge-base --is-ancestor <component_sha> <final_candidate_sha>
->

git diff --name-only <component_sha>..<final_candidate_sha> -- <reviewed_paths>
->

git worktree list
->

git branch -vv
->

git tag --list
->

git cat-file -e <every_cited_sha>
->
```

### Declared equivalent profile

| Universal query | Exact finite query named in form 1 | Status/output |
|---|---|---|
| Resolve candidate/evidence/source identity | | |
| Verify candidate/evidence linkage | | |
| Verify valid candidate lineage | | |
| Detect changes to reviewed dependencies | | |
| Inspect preservation state | | |
| Inspect live checkpoint resources | | |

## E. Receipt decision
- result: SUPPORTED | REJECTED
- every failed gate and exact correction required:
- packet's terminal reason accepted as honest: yes / no / not applicable
- technical PASS eligible for Owner disposition consideration: yes / no
- exact Owner decision or action now requested:
- program-state entry written at:

## Authority declaration
I did not inspect or evaluate source/content as a second reviewer, rerun a test, reproduce a metric,
review a generated technical output, inspect a Builder workspace, read the Engineering Lead's
workbench, choose LAND or DISCARD, or authorize another checkpoint.
````

## Result routing

- A **supported PASS** is eligible for separate human judgment and disposition. It is not yet LAND,
  lifecycle closure, or permission to continue.
- A supported `BLOCKED`, `PLATEAU`, or `BUDGET_EXHAUSTED` is an honest terminal return whose named
  decision may be presented to the Owner. It is never relabeled PASS.
- A **rejected** packet returns only the gate defects. The Orchestrator does not repair engineering
  artifacts or expand its review scope.
- No receipt result automatically opens the next checkpoint.
- `BRIEF_INVALID` never enters this packet gate. Form 10 returns before execution and the
  Orchestrator records only the invalid-brief event in ordinary program state before deciding
  whether to issue a corrected form 1.
- Silence never enters this gate. Under the ratified liveness/ceiling rule, the Orchestrator
  detects, declares, and records abandonment in durable cross-track program state. The Owner then
  decides disposition, retry, changed direction, or continuation; form 9 begins from the
  Orchestrator's recorded declaration and waits for that human decision before mutation.
