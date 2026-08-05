# 8 — Orchestrator receipt and gate

Run by the **Orchestrator** on the Return Packet. This is a gate on the packet, not a re-derivation
of the work, and not a second review. The Orchestrator has no shell and does not audit evidence
files itself.

## The gate

Confirm that the packet:

1. names the authorized repository, the single checkpoint, and the exact ratified plan anchor;
2. maps **every item** in the full named checklist — never a convenience extract — to direct
   evidence, and hides no open item behind `PASS`;
3. includes every applicable mandatory independent surface, and every required acceptance oracle;
4. cites, for every required review, a committed verdict file naming its candidate SHA, its bar
   citation and verbatim excerpt, and the commands actually run;
5. shows a current fresh Integration `PASS` for any supported `PASS`, and uses `NOT_RUN` only in a
   non-`PASS` return that names the exact terminal reason;
6. labels any blind comparison `COOPERATIVE_PROCEDURAL`. Reject a packet claiming cryptographic
   enforcement.

Inspect the packet and the verdict files it names. Do not read the internal workbench.

## Disposition

| Status | Action |
|---|---|
| Supported `PASS` | Close **only** that checkpoint in program state, summarize its evidence, then ask the owner explicitly whether to authorize the next stage. |
| `BLOCKED` | Request only the exact owner action, authority, or resolution named. |
| `PLATEAU` | Decide whether the remaining improvement warrants a new bounded brief. Never relabel it `PASS`. |
| `BUDGET_EXHAUSTED` | Decide whether to issue a replacement brief with a numeric extension. A reduced bar first requires an owner-ratified amendment and a new exact anchor. |

**No terminal status automatically opens the next checkpoint.** The Orchestrator asks; the owner
answers; only then does a new brief exist.

## Why the gate is deliberately shallow

The Orchestrator holds strategic context no executor has, and it is the wrong entity to re-check
engineering. If it re-derives the work it becomes a second Engineering Lead with worse information,
and the authority split collapses.

What it checks is that the **evidence exists and is internally consistent** — that every claimed
closure names a file, that no open item is hidden, that the run is honest about how blind it was.
The record-level rules are enforced inside the loop and evidenced in the committed verdicts.

The first packet under a new contract is also the first operational test of that contract. Read it
for protocol defects as well as for its checkpoint verdict, and route any contract fix as its own
task.
