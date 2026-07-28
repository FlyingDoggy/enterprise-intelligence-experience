# EIX 2.0 Ubiquitous Language

> Status: Accepted for Rev 0.5 active content  
> Scope: root documents, `index.html`, `app.js`, `src/`, `design-system/` and `verification/`  
> Excluded: all `archive/rev-*/` directories, whose historical wording remains unchanged

This glossary keeps one concept under one stable name across architecture, documentation, interface copy and implementation. A shorter UI label is allowed only when it is recorded below.

## Document system

**Canonical Charter**  
The only source for the Experience Kernel, Interaction Contracts, governed work objects, independent state fields and lifecycle invariants.  
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

**Static Anatomy Reference**  
A visual reference that explains regions, content obligations and states without claiming to simulate transitions. Chinese interface copy uses `结构参考`.  
_Avoid_: Live Specimen when controls do not change the governed object.

**Interactive State Specimen**  
An interactive reference that previews independent states or variants but does not claim to validate a full workflow. Chinese interface copy uses `状态示例`.  
_Avoid_: Contract Simulation when guards, failure and recovery are not implemented.

**Contract Simulation**  
An interactive reference that demonstrates at least one governed transition, one failure or degradation path and one recovery path against deterministic fixture state. Chinese interface copy uses `契约模拟`.  
_Avoid_: production workflow, external action.

**Verified Reference**  
A Contract Simulation that has passed contract, keyboard, accessibility and responsive tests, plus the reader or user evidence required by its maturity level.  
_Avoid_: verified when only a renderer or screenshot exists.

## Reuse levels

**Component**  
A reusable Core Design System control or content building block. It does not own an enterprise work lifecycle.  
_Avoid_: Pattern when referring to Button, Card, Menu or Table.

**Pattern**  
A reusable Intelligence UX interaction structure with a Work Object, owner, independent state fields and recovery path.  
_Avoid_: Component, template.

**Composition**  
A workspace- or page-level assembly of multiple Patterns.  
_Avoid_: Component, single Pattern.

## Architecture

**Shared Experience Kernel**  
The canonical coverage and relationship model for common Human–AI work concerns, records and controls. A concrete task instantiates only what is required; other concerns remain conditional, linked or not applicable. The short label `Kernel` is allowed after first use. In management-facing Chinese, explain it first as `共用工作骨架`.  
_Avoid_: canonical sequence, eight-step flow, progress tracker, GAX nodes, second Kernel.

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
A stable, versioned package of one or more Work Results that can be reviewed, published, branched or handed off. On first use in management copy, explain it as `可版本化的业务成果（Artifact）`.  
_Avoid_: every answer, raw output, Outcome.

**Work Result**  
An immutable, referenceable answer, calculation, analysis or draft produced by a specific Work Object Revision. A Result records scope, Evidence, limitations and producer Revision, but does not own an independent enterprise workflow lifecycle. The short UI label may be `Result`.  
_Avoid_: Artifact when persistence or publication has not been requested; Business Outcome when no external postcondition was observed.

**Goal Resolution Assessment**  
A versioned assessment attached to a Goal Revision that records whether the current Goal is resolved, partially resolved, unresolved or redirected, and on what Result or Evidence that assessment is based. When no completion signal is observed, the UI says `Result已交付 · Goal完成情况未观测`.  
_Avoid_: Business Outcome, Root lifecycle state, automatic success inferred from user departure.

**Business Outcome Receipt**  
A stable system-of-record receipt of the postcondition observed after an Action or Process event. The short UI label may be `Business Outcome`.  
_Avoid_: analytical Result, generated report, Action workflow state.

## State and trace

**Independent State Fields**  
Implementation fields that keep content type, evidence, uncertainty, risk, permission, AI authority and workflow progress from being inferred from one another. The user-facing interface groups them into three questions: `结论靠不靠谱？`、`这件事能不能做？`、`工作走到哪一步？`.  
_Avoid_: seven axes, orthogonal semantics or epistemology in user-facing copy.

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
The short UI label for Work Result after the full term has been introduced.  
_Avoid_: Outcome when no external postcondition has been observed.

**Outcome**  
Use only as a short contextual label for Business Outcome Receipt after the full term has been introduced.  
_Avoid_: Result, Artifact, Goal Resolution, Action workflow state.

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
- Page and section headings state the subject and the information delivered. They must stand alone without relying on an earlier objection or conversation.
- Interface headings do not use `不是……而是……`、`只是……`、`不再……`或rhetorical questions to correct an imagined reader. Put historical corrections in Decision Records.
- Define a concept positively before stating its boundary. Negative wording remains appropriate for validation errors、risk warnings、Do / Don’t rules and governance invariants.
- Questions appear only when the reader can answer them or when a Pattern explicitly labels a real user fear; navigation and explanatory headings use declarative language.
