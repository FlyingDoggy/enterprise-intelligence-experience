# Intelligence UX Guidance

> Candidate Companion · Revision 0.3 · 2026-07-25  
> Process Intelligence × Collaborative Intelligence

| Field | Definition |
|---|---|
| Status | **Candidate Companion** |
| Audience | Product、UX、Engineering、Process Owner、Domain Steward与Governance |
| Purpose | 把Canonical架构转化为Process和Collaborative场景可执行的体验指导 |
| Depends on | [Canonical Concept Charter](./ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md) |
| Built with | [EIX Core Design System](./EIX_2.0_CORE_DESIGN_SYSTEM.md) |
| Interactive reference | `#/guidance` |

---

## 1. Guidance与Canonical Charter的关系

Canonical Charter拥有：

- Shared Experience Kernel；
- Process Intelligence与Collaborative Intelligence Interaction Contract；
- Root与Typed Work Object关系；
- 七个正交语义轴；
- Publication、Action与Rule Change三套生命周期；
- Gate与Handoff不变量。

本Guidance只负责：

- 这些对象在界面中如何出现；
- 哪些Region固定、哪些可以扩展；
- 用户可以执行什么控制；
- Failure、Degradation和Recovery如何表达；
- Pattern如何组合成Process Intelligence或Collaborative Intelligence工作区。

Guidance不得：

- 新增第二Kernel；
- 把Verified解释为Allowed或Auto；
- 让一个Document同时承担Analysis、Case和Execution状态；
- 修改Canonical Lifecycle；
- 让视觉主题拥有架构主权。

---

## 2. Shared Experience Kernel的界面映射

| Kernel Object | Default Interface Expression | Stable Artifact |
|---|---|---|
| Goal | Goal & Context Header | Goal Revision |
| Context | Context Snapshot、Source与Permission | Context Snapshot |
| Plan | Inspectable Plan与Progress | Plan Revision |
| Evidence | Evidence Receipt与Provenance | Evidence Snapshot |
| Decision | Decision Record | Decision Revision |
| Action | Action Preview与Authorization | Action Record |
| Outcome | Outcome Receipt | System Outcome |
| Feedback | Correction、Memory或Rule Proposal | Typed Proposal |

Patch、Gate、Receipt、Revision和Handoff是作用于Kernel对象的机制，不是新的Kernel节点。

---

## 3. Shared Semantic Components

### 3.1 Work Object Header

固定：

- Goal；
- Object Type与ID；
- Owner；
- Workflow State与Revision；
- Scope；
- Context Snapshot；
- Permission；
- Freshness。

可扩展：

- Audience；
- Domain-specific Metadata；
- Related Work Objects；
- Help与Definition。

### 3.2 Intent / Change Diff

所有来自自然语言、拖拽、表单和系统建议的变更统一形成Typed Patch。

必须显示：

- Source；
- Before / After；
- Affected Objects；
- Impact；
- Validation；
- Apply、Cancel、Revert或Branch。

### 3.3 Plan Status

Plan Node使用：

- Ready；
- Conditional；
- Running；
- Verified；
- Partial；
- Blocked；
- Failed。

Spinner不能替代真实业务状态。高阶分析失败不得删除Verified基础结果。

### 3.4 Evidence Receipt

必须显示：

- Source；
- Semantic Version；
- Snapshot；
- Scope；
- Method；
- Permission；
- Validation；
- Limitation。

Evidence Status不得推出Permission或Autonomy。

### 3.5 Decision Record

Recommendation只有在具备Selected Option、Rationale、Evidence、Owner和需要的Approval后，才成为Decision。

### 3.6 Publication Gate

Gate绑定：

- Subject ID与Revision；
- Evidence Snapshot；
- Policy Version；
- Permission Version；
- Checks；
- Invalidation Reason；
- Revalidation Requirement。

Passed不等于Published。

### 3.7 Action Authorization

必须区分：

```text
Recommend
→ Prepare
→ Awaiting Approval
→ Approved
→ Queued
→ Executing
→ Outcome
```

Approved不等于Executed。

### 3.8 Outcome Receipt

Outcome来自业务系统记录，不由LLM重新发明。

Partial必须说明：

- 已完成；
- 未完成；
- 影响；
- 下一步；
- Owner。

### 3.9 Permission与Autonomy

两者分别表达：

```text
Permission: Allowed / Conditional / Denied
Autonomy: Recommend / Prepare / Approval Required / Execute Within Policy / Monitor by Exception
```

High Confidence不能覆盖Denied。

### 3.10 Revision、Branch、Audit与Handoff

- Undo创建Revert Patch，不删除Revision。
- Published对象上的追问创建Branch。
- Audit ID稳定且可引用。
- Handoff创建新的Typed Work Object，并通过Root与Trace关联。

---

## 4. Process Intelligence Guidance

Process Intelligence的主要对象是Case、Exception、Action、Outcome与Rule Proposal。

### 4.1 Experience Contract

- 系统默认推进Policy允许的Case。
- 人默认关注Exception、Approval、Recovery和边界。
- 正常流保持安静，异常、未知与失败保持可见。
- 用户能够Pause、Takeover、Retry、Compensate或Escalate。

### 4.2 Case推进与Exception-first处理

固定区域：

- Queue Universe与分母；
- Healthy、Attention、Unknown、Failure；
- SLA；
- Owner；
- Recovery Debt；
- Pause与Takeover。

不以自动化比例作为唯一成功指标。

### 4.3 Prepare、Approve、Execute、Verify、Recover

| Phase | Human Question |
|---|---|
| Prepare | 系统准备做什么，影响什么？ |
| Approve | 谁授权，基于什么Policy和Evidence？ |
| Execute | 是否真的进入Queue并改变外部状态？ |
| Verify | Expected与Actual是否一致？ |
| Recover | Failure后如何Retry、Compensate或Takeover？ |

每一阶段必须对应不同状态和Receipt。

### 4.4 Human Takeover

Takeover Envelope必须携带：

- Goal；
- Current Case State；
- Work Done；
- Pending Work；
- Evidence；
- Policy与Permission；
- Failure或Requested Decision；
- Trace ID。

“转人工”不能让人从头调查。

### 4.5 Rule Proposal

单次人工判断只能产生Candidate。

```text
Candidate
→ Drafted
→ Validated
→ Approved
→ Staged
→ Active
→ Suspended / Retired
```

进入Active前必须完成：

- Replay；
- Counterexample；
- Conflict Scan；
- Segregation of Duties；
- Scope；
- Monitor；
- Kill Switch；
- Rollback。

### 4.6 Failure、Compensation与Rollback

Recovery不得删除原Failure或Action。

Compensation必须引用：

- 原Action ID；
- 原Outcome；
- Compensation Reason；
- Actor；
- Result；
- Remaining Risk。

---

## 5. Collaborative Intelligence Guidance

Collaborative Intelligence的主要对象是Mission、Analysis、Research、Decision、Artifact与Action Proposal。

### 5.1 Experience Contract

- 人提出Goal、检查Context、选择方向并承担Decision。
- AI组织Plan、Evidence、Option和Artifact。
- Chat是输入方式，不是唯一工作表面。
- 稳定Artifact优先于长期消息记录。

### 5.2 Mission与Context

Mission Workspace围绕以下内容组织：

- Goal Header；
- Context Snapshot；
- Inspectable Plan；
- Artifact Canvas；
- Evidence；
- Revision与Branch；
- Next Action。

### 5.3 Collaborative Families

| Family | Core Question | Typical Artifact |
|---|---|---|
| Knowledge & Research | 我们知道什么，依据与冲突是什么？ | Research Board、Evidence Map |
| Analytical | 发生了什么、为什么、接下来可能怎样？ | Analysis Document、Scenario Canvas |
| Decision | 面对Option应如何形成可解释选择？ | Decision Canvas、Decision Record |
| Creation & Communication | 如何形成可协作、可发布的产出？ | Document、Deck、Brief |
| Planning & Action | 如何把Goal变成计划并安全推进？ | Planning Board、Action Proposal |

ChatBI只是Analytical Intelligence中的一种组合。

### 5.4 Analysis与Research

固定区域：

- Intent；
- Result Blocks；
- Typed Claims；
- Evidence；
- Supporting Data；
- Plan与Degradation；
- Publication Gate。

规则：

- Narrative数字引用同一Result对象。
- Correlation不能写成Causation。
- Hypothesis、Forecast和Recommendation必须标明类型。
- Partial不删除Verified基础结果。

### 5.5 Artifact、Revision与Publication

```text
Draft
→ Validated
→ Approval Pending
→ Published
→ Superseded / Withdrawn
```

- Brief与Studio读取同一Revision。
- Publication Gate通过后仍需要明确Publish动作。
- Evidence变化后旧Gate失效。
- Published内容上的追问创建Branch。

### 5.6 Action Handoff

Recommendation不能直接变成业务执行。

Collaborative输出Action Proposal，Process负责：

- Preflight；
- Permission；
- Policy；
- Approval；
- Queue；
- Execution；
- Outcome；
- Recovery。

---

## 6. Cross-contract Handoff

Handoff创建关联对象，不在同一对象上静默切换Contract。

必须携带：

| Field | Why |
|---|---|
| Root ID | 保持业务Goal连续 |
| From Object与Revision | 固定来源 |
| To Object Type | 明确新的责任契约 |
| Context Snapshot | 保持授权Context |
| Evidence | 保留Claim与依据 |
| Decision Owner | 明确责任 |
| Policy与Permission | 约束下一Contract |
| Action Constraints | 不扩大授权范围 |
| Trace ID | 跨对象审计 |

---

## 7. Reference Patterns与Compositions

### 7.1 Shared Patterns

| ID | Pattern | Work Object |
|---|---|---|
| S01 | Goal & Context Header | Root / Typed Work Object |
| S02 | Intent / Change Preview | Patch → Target Revision |
| S03 | Plan & Progress | Plan |
| S04 | Evidence Receipt | Evidence |
| S05 | Decision Record | Decision |
| S06 | Publication Gate | Artifact Revision |
| S07 | Action Preview & Authorization | Action |
| S08 | Outcome Receipt & Human Handoff | Outcome / Handoff |

### 7.2 Process Compositions

| ID | Composition | Primary Object |
|---|---|---|
| P01 | Exception-first Console | Case Portfolio |
| P02 | Rule Proposal & Change Approval | Rule Proposal |
| P03 | Recovery & Rollback Workspace | Recovery Case |

### 7.3 Collaborative Compositions

| ID | Composition | Primary Object |
|---|---|---|
| C01 | Mission Workspace | Mission |
| C02 | Analysis / Research Document | Analysis |
| C03 | Audience Brief & Revision History | Artifact |

---

## 8. Pattern Specification Template

每个Pattern必须包含：

1. Purpose与User Fear
2. Applicable Contract
3. Work Object与Owner
4. Fixed Regions
5. Optional Regions
6. Anatomy
7. States与Lifecycle
8. Semantic Axes
9. Permission与Autonomy
10. Failure、Degradation与Recovery
11. Responsive Behavior
12. Accessibility
13. Do / Don’t
14. Acceptance Tests
15. Used Core Components
16. Extension Rules

---

## 9. Content与Data Narrative

### 9.1 五段式Degradation

1. 发生了什么；
2. 保留了什么；
3. 缺少什么；
4. 下一步是什么；
5. 谁负责。

### 9.2 Data Story

```text
What changed
→ Where
→ Why / Candidate drivers
→ Context
→ Implication
→ Next question or action
```

事实、计算、假设、预测和建议分别标注。

---

## 10. Responsive Capability

| Width | Process | Collaborative |
|---|---|---|
| ≥1280 | Queue、Case、Inspector并列 | Plan、Artifact、Evidence并列 |
| 768–1279 | Case为主，Inspector转Drawer | Artifact为主，Context转Drawer |
| <768 | Exception阅读、Approve或Escalate | Brief阅读、Evidence、评论和Question Pin |

小屏不保留复杂编辑器，但不能隐藏：

- 当前对象；
- 状态；
-风险；
- Permission；
- Evidence；
- 主要下一步。

---

## 11. Contract-specific Acceptance

### Process

- Denied不得进入Queue。
- Approved不得显示为Executed。
- Rule Candidate审批前不得Active。
- Reject后不保留Active派生状态。
- Partial与Failure保留Work Done。
- Compensation引用原Action。

### Collaborative

- Brief与Deep共享Revision。
- Narrative数字与Result一致。
- Published上的追问创建Branch。
- Evidence变化使Publication Gate失效。
- 高阶失败不删除Verified基础结果。
- Recommendation进入Process前只能形成Action Proposal。

### Cross-contract

- Handoff创建新的Typed Object。
- From Revision不可变。
- Root与Trace连续。
- Policy、Permission和Constraints显式传递。

---

## 12. Visual Specimen Coverage

Rev 0.3为全部14个Guidance Pattern建立一对一Live Specimen：

- S01–S08分别呈现Goal/Context、Intent Diff、Plan、Evidence、Decision、Publication Gate、Action Authorization与Outcome/Handoff；
- P01–P03分别呈现Exception Console、Rule Change与Recovery Workspace；
- C01–C03分别呈现Mission Workspace、Analysis Document与Audience Brief。

每个Specimen必须同时可见：

1. 当前Typed Work Object、Owner与Contract；
2. Pattern的Fixed Regions；
3. 可切换的Lifecycle State；
4. 独立的Evidence、Permission、Autonomy、Risk或Workflow轴；
5. Failure、Degradation与Recovery路径；
6. `Simulation · No external action`运行边界。

页面中的`{placeholder}`代表可扩展领域内容；Pattern结构、对象类型、生命周期与Gate边界不可被领域内容覆盖。14个Pattern不得复用同一张通用治理卡片作为完成证据。
