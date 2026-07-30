---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Run a `/grill-with-docs` session.

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a *fact* can be found by exploring the environment (filesystem, tools, codebase), look it up rather than asking me. The *decisions*, though, are mine – put each one to me and wait for my answer.

As decisions are made and domain terms are clarified, lazily update:
1. `CONTEXT.md`: A glossary of resolved domain terms and concepts.
2. `docs/adr/`: Architecture Decision Records for significant or hard-to-reverse design choices.

Do not begin implementing code until we confirm a shared understanding and the documentation is updated.
