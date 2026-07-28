# EIX 2.0 Rev 0.4 Reader Test Protocol

> Purpose: verify that the document suite communicates the architecture without prior project context.  
> Test subject: Rev 0.4 Canonical Charter、Core Design System、Intelligence UX Guidance与静态参考站。  
> Rule: do not brief participants with the expected answers before the session.

## 1. Cohorts

Recruit at least two readers per cohort:

1. Management / Business Owner;
2. Product / UX;
3. Engineering / Data / Governance.

The facilitator may explain how to navigate the site, but may not explain EIX terminology.

## 2. Session

### Part A · Five-minute unaided reading

Open `#/brief` in `快速阅读`. After five minutes, close the page and ask:

1. What problem is EIX 2.0 solving?
2. What is shared between Process and Collaborative Intelligence?
3. What is different between the two Contracts?
4. Name three things a user should always be able to understand or control.
5. Which document is the architecture source of truth?

### Part B · Semantic distinction

Show one fixture containing:

- Claim: Forecast;
- Evidence: Verified;
- Risk: High / Irreversible;
- Permission: Denied;
- Autonomy: Recommend;
- Workflow: Draft.

Ask the reader:

1. Is the Claim a fact?
2. Is the Evidence allowed to be used for this action?
3. Can the action execute?
4. Which label explains each answer?

Pass requires the participant not to infer Permission, Autonomy, or Workflow from Evidence.

### Part C · State distinction

Open the Controlled Action specimen and stop at `Approved`.

Ask:

1. Has the action executed?
2. What is the next valid transition?
3. Where would the real-world result appear?

Pass requires: “not executed,” “Queued,” and “Outcome Receipt.”

### Part D · Pattern selection

Give four scenarios without naming the Pattern:

1. A published brief is based on a now-stale Evidence Snapshot.
2. A process Case fails after three of five steps.
3. A user wants to change Scope without overwriting the current Revision.
4. A human exception decision may become a reusable rule.

Expected choices:

1. Evidence Receipt + Publication Gate;
2. Recovery & Rollback Workspace + Outcome Receipt;
3. Intent / Change Preview with Branch or Revert;
4. Rule Proposal & Change Approval.

### Part E · Cross-Contract continuity

Open both Reference Journeys. Ask the participant to explain:

1. why Analysis and Process Case are not the same object;
2. what a Handoff must carry;
3. who owns the next Decision;
4. what happens if Permission is Denied.

Pass requires a typed Work Object link, Context / Evidence / Policy continuity, explicit Decision Owner, and no silent execution.

### Part F · Design System与Guidance边界

Open `#/design-system` and `#/guidance`. Give the reader six items:

1. Button Disabled state；
2. Focus Ring；
3. Evidence Receipt；
4. Publication Gate；
5. Table responsive behavior；
6. Rule Proposal lifecycle。

Ask which source owns each item.

Expected:

- Core Design System owns 1、2、5；
- Intelligence UX Guidance owns 3、4、6；
- Canonical Charter remains the authority for the semantic and lifecycle invariants used by 3、4、6。

Pass requires the reader not to put Evidence、Permission或业务Lifecycle into a Core Component。

### Part G · Capability、Permission与Action边界

Open `#/guidance/shared/S09`, then switch the Capability fixture through `Complete`、`Scope Missing`、`Permission Drift` and `Suspended`.

Ask:

1. Does `Complete` mean the Action is approved?
2. What should the interface do when Scope is missing?
3. Which checks still belong to Action Preflight?

Pass requires: Capability is a versioned declaration, not authorization; the Proposal and escalation path remain visible while Execute is unavailable; Actor、Target、Parameters、Policy、Permission与Risk are revalidated.

### Part H · Theme、Mode与semantic stability

Open Color Foundation and switch across Neutral / EIX and Light / Dark.

Ask:

1. What changes when Theme changes?
2. What changes when Mode changes?
3. May either change Permission、Risk、State or Component behavior?

Pass requires: Theme changes brand expression, Mode changes light/dark mapping, and neither changes the interaction or business contract.

## 3. Scoring

| Measure | Numerator | Target |
|---|---|---:|
| Architecture | Correctly explains one Kernel and two Contracts | ≥90% |
| Semantics | Correctly separates Claim, Evidence, Risk, Permission, and Autonomy | ≥85% |
| State | Separates Prepared, Approved, Executed, and Outcome | ≥95% |
| Pattern | Selects the expected Pattern set | ≥85% |
| Identity | Identifies Canonical, Companion, and Candidate | 100% |
| Layer boundary | Separates Core Design System from Intelligence UX Guidance | ≥90% |
| Capability boundary | Separates capability declaration, Permission, Approval and Execution | ≥90% |
| Theme / Mode | Separates visual mapping from business semantics | ≥90% |

Score answers by meaning, not by exact English terminology.

## 4. Observation notes

Record:

- first point of hesitation;
- terminology the participant rephrases;
- incorrect state inference;
- information they expected but could not find;
- whether `快速阅读` or `完整规范` was needed;
- route and Pattern used to recover;
- task completion time.

Do not solve comprehension problems by adding more text before checking hierarchy, naming, and interaction.

## 5. Structural dry run

Rev 0.4 contains an explicit location for every expected answer:

| Test answer | Primary location |
|---|---|
| One Kernel / Two Contracts | Brief hero and `#/architecture` |
| Canonical identity | Persistent document identity and source-of-truth list |
| Semantic distinction | `#/architecture` Semantic Axes |
| Approved ≠ Executed | Controlled Action specimen |
| Stale invalidates Gate | Evidence & Gate specimen |
| Typed Handoff | `#/journeys` Handoff Envelope |
| Core Component | `#/design-system` Foundation、Primitive与Component详情 |
| Pattern selection | `#/guidance` Intelligence UX Guidance |
| Layer boundary | `#/design-system` Overview与`#/guidance` Hero |
| Capability boundary | `#/guidance/shared/S09`与Capability & Scope specimen |
| Theme / Mode | `#/design-system/foundations/color`与Spec Info controls |

Structural readiness: **PASS**. Human comprehension result: **Not yet measured**.
