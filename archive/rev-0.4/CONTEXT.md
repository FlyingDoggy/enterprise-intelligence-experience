# EIX 2.0 Ubiquitous Language

> Status: Accepted for Rev 0.4 active content  
> Scope: root documents, `index.html`, `app.js`, `src/`, `design-system/` and `verification/`  
> Excluded: `archive/rev-0.1/` and `archive/rev-0.2/`, whose historical wording remains unchanged

This glossary keeps one concept under one stable name across architecture, documentation, interface copy and implementation. A shorter UI label is allowed only when it is recorded below.

## Document system

**Canonical Charter**  
The only source for the Experience Kernel, Interaction Contracts, governed work objects, semantic axes and lifecycle invariants.  
_Avoid_: Concept Paper, Principle Library, Guidance Charter.

**EIX Core Design System**  
The brand-neutral Token, Foundation, Primitive and reusable Component contract. The top navigation may display `Design System`.  
_Avoid_: Pattern Library, UI Kit, Component Demo.

**Intelligence UX Guidance**  
The domain interaction specification for Process Intelligence, Collaborative Intelligence and cross-contract Handoff. The top navigation may display `UX Guidance`.  
_Avoid_: Guidance Library, Pattern Specimen Library, UX Design System.

**Experience Narrative**  
The management-facing explanation of user concerns, experience promises and Reference Journeys. The top navigation may display `5分钟`.  
_Avoid_: Executive Charter, Product Manifesto.

**Live Specimen**  
An interactive reference that demonstrates one declared visual or behavioral contract. Chinese interface copy uses `交互示例`.  
_Avoid_: 样章, mockup, screenshot, demo when referring to a governed specimen.

## Reuse levels

**Component**  
A reusable Core Design System control or content building block. It does not own an enterprise work lifecycle.  
_Avoid_: Pattern when referring to Button, Card, Menu or Table.

**Pattern**  
A reusable Intelligence UX interaction structure with a Work Object, owner, states, semantic axes and recovery path.  
_Avoid_: Component, template.

**Composition**  
A workspace- or page-level assembly of multiple Patterns.  
_Avoid_: Component, single Pattern.

## Architecture

**Shared Experience Kernel**  
The canonical sequence `Goal → Context → Plan → Evidence → Decision → Action → Outcome → Feedback`. The short label `Kernel` is allowed after first use.  
_Avoid_: GAX nodes, second Kernel.

**Interaction Contract**  
A responsibility model that defines who initiates, judges and advances work. EIX defines Process Intelligence and Collaborative Intelligence as two Interaction Contracts.  
_Avoid_: mode, persona, page type.

**Process Intelligence**  
A system-led, state-driven contract in which people handle authorization, exceptions and boundaries.  
_Avoid_: automation mode, back-office bot.

**Collaborative Intelligence**  
A human-led, goal-driven contract in which AI helps produce analysis, research, plans, decisions and knowledge artifacts.  
_Avoid_: chatbot mode, ChatBI as the whole category.

**Work Object**  
A governed object with identity, owner, state, context, revision and trace.  
_Avoid_: chat session, mutable document as a universal object.

**Artifact**  
A stable, versioned business result that can be reviewed, published, branched or handed off. On first use in management copy, explain it as `可版本化的业务成果（Artifact）`.  
_Avoid_: output, answer when persistence and governance are intended.

## State and trace

**Revision**  
An immutable revision of a Work Object or Artifact.  
_Avoid_: Version when referring to work history.

**Version**  
A software, data, policy, schema or model version.  
_Avoid_: Revision for external system versions.

**Branch**  
A divergent line of work created without overwriting a validated or published Revision.  
_Avoid_: copy when lineage matters.

**State**  
The lifecycle state owned by an object.  
_Avoid_: Status when a lifecycle transition is intended.

**Status**  
A presented condition or progress indicator. It does not by itself authorize a lifecycle transition.  
_Avoid_: State when the object lifecycle is intended.

**Trace ID**  
The stable identifier linking related Work Objects across a Handoff.  
_Avoid_: shared mutable object.

## Evidence and control

**Claim**  
A fact, calculation, hypothesis, forecast or recommendation presented for use in a decision.  
_Avoid_: conclusion when the semantic kind is not clear.

**Evidence**  
The inspectable basis supporting or contesting a Claim, Decision or Action. In management copy, first use may be `依据（Evidence）`.  
_Avoid_: citation when provenance and status are intended.

**Gate**  
A deterministic check that controls Publication, Action or Rule Change. In management copy, first use may be `校验门（Gate）`.  
_Avoid_: approval when validation, permission and policy checks are also included.

**Receipt**  
A stable system record of what was checked, decided, executed or observed. In management copy, first use may be `系统回执（Receipt）`.  
_Avoid_: notification, success message.

**Permission**  
Whether a subject is allowed, conditionally allowed or denied for a scope under a policy version.  
_Avoid_: confidence, autonomy.

**Autonomy**  
How far the system may progress: Recommend, Prepare, Approval Required, Execute Within Policy or Monitor by Exception.  
_Avoid_: trust score, confidence.

**Capability Snapshot**  
A versioned declaration of a Tool or Agent’s scope, supported actions, risk, reversibility, receipt and escalation contract. It is an input to Action Preflight, not Permission or Approval.  
_Avoid_: permission grant, trust badge, proof that execution is allowed.

**Result**  
An analytical or system output.  
_Avoid_: Outcome when no real-world effect has been observed.

**Outcome**  
The observed real-world result after an Action or Process step.  
_Avoid_: Result when verification of impact is intended.

**Handoff**  
An explicit transfer between related Work Objects that preserves goal, context, evidence, owner, policy, constraints and Trace ID.  
_Avoid_: 转人工 when no context package is transferred.

## Content and interface rules

- Chinese interface actions use plain Chinese verbs. Canonical English domain nouns remain English where translation would blur the contract.
- The first management-facing occurrence of an unfamiliar canonical term includes a concise Chinese explanation.
- Chinese and English terms use symmetrical full names. The interface uses `text-autospace` for CJK–Latin boundaries instead of inconsistent hand-inserted spaces.
- The top navigation may use the short labels recorded in this file; page titles and document identities use the full canonical names.
- Reading density changes visible detail and layout, not the minimum readable font size.
- Reading density的界面标签固定为`快速阅读`与`完整规范`；`Brief`只用于Audience Brief等Artifact名称，不再作为密度按钮。
- Theme changes brand expression; Mode changes light/dark mapping. Neither changes component behavior or business semantics.
- Normative documents may use `必须` and `不得`. Narrative and interface copy should avoid repeated slogans, forced contrasts and decorative abstractions.
