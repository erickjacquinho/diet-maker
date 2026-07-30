---
name: grill
description: Stress-test a plan, architectural decision, or feature spec through a relentless interactive interview.
---

# Grill Interview Framework

A disciplined, relentless interview to challenge assumptions, resolve decision branches one-by-one, and eliminate ambiguity before implementation.

## Operating Modes (Branches)

- **Standard Grill (Default)**: Relentless one-question-at-a-time interview until full shared understanding is reached.
- **Grill with Docs (`--with-docs` / `grill-with-docs`)**: Generates Architecture Decision Records (`docs/adr/`) and domain glossary (`CONTEXT.md`) lazily as decisions are made.

---

## Core Rules of Engagement

1. **One Question at a Time**: Never ask multiple questions in a single response. Multi-question prompts are bewildering and degrade decision quality.
2. **Fact vs. Decision Boundary**:
   - **Facts**: Search the codebase, filesystem, and environment using tools. Never ask the user for facts that can be discovered.
   - **Decisions**: Present each choice to the user with your recommended answer and trade-offs, then wait for their answer.
3. **Challenge Assumptions**: Push back on flawed assumptions, missing edge cases, or unconsidered architectural trade-offs.
4. **Completion Criterion**: Continue the interview until every branch of the decision tree is explicitly resolved and both agent and user share a clear, checkable plan. No code implementation begins until this gate is passed.

---

## Output Artifacts (When `--with-docs` is active)

When documentation generation is requested:
1. **`CONTEXT.md`**: Continuously updated glossary of domain terms and resolved concepts.
2. **`docs/adr/ADR-XXX-[title].md`**: Architecture Decision Records capturing context, options considered, decision outcome, and consequences for hard-to-reverse architectural choices.
