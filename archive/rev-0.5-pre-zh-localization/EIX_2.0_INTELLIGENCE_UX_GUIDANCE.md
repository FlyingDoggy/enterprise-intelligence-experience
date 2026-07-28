# Intelligence UX Guidance

> Candidate Companion · Revision 0.5 · 2026-07-27  
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
- 按三个用户问题组织、在实现层分别保存的独立状态字段；
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

Kernel是Coverage与Relationship Model。页面不得把它渲染成八步Wizard、全局导航或完成进度。

| Canonical Concern / Record | Default Interface Expression | Applicability |
|---|---|---|
| Goal | Goal & Context Header | 所有Task Projection Required |
| Context | Context Snapshot、Source与Permission | Required；受限内容只显示影响 |
| Plan | Inspectable Plan与Progress | Conditional；简单可信回答可省略 |
| Evidence | Evidence Receipt与Provenance | 任何可信Claim或Decision Required |
| Work Result | Answer、Result Block或Prepared Change | 知识工作与计算任务Required |
| Goal Resolution | Completion Strip与Assessment Receipt | Result交付后Required；可为Unobserved |
| Artifact | Stable Canvas、Revision与Publication | 仅在复用、协作、发布或审计时出现 |
| Decision | Decision Record | Conditional |
| Action | Action Preview与Authorization | Conditional；改变外部状态时Required |
| Business Outcome | Business Outcome Receipt | 真实Action或Process之后Linked |
| Feedback | Correction、Memory、Rule或Model Proposal | Conditional |

Patch、Gate、Receipt、Revision、Branch和Handoff是作用于这些记录或Work Object的跨记录机制。

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

### 3.2 Work Result & Goal Resolution

Work Result固定显示：

- Result ID、Producer Object与Revision；
- Answer、Calculation、Analysis、Draft或Prepared Change类型；
- Scope、Evidence、Freshness与Limit；
- 是否已被包装为Artifact。

Goal Resolution Assessment固定显示：

- Goal Revision与Success Definition；
- Resolved、Partially Resolved、Unresolved或Redirected；
- Criteria Evaluated、User Confirmed或Unobserved；
- 支撑Result与未解决项；
- Continue、Redirect或Done。

用户离开不自动触发Resolved。界面可以显示`Result已交付 · Goal完成情况未观测`，且不得生成Business Outcome。

### 3.3 Intent / Change Diff

所有来自自然语言、拖拽、表单和系统建议的变更统一形成Typed Patch。

必须显示：

- Source；
- Before / After；
- Affected Objects；
- Impact；
- Validation；
- Apply、Cancel、Revert或Branch。

澄清预算：

| 情况 | 系统行为 | 上限 |
|---|---|---:|
| High Confidence、低风险且不改变Scope | 直接应用并提供Undo | 0问 |
| Medium Confidence | 提供最多两个具体解释 | 1次选择 |
| Low Confidence | 只问会改变结果的一个关键问题 | 1问 |
| Scope或Method变化 | 展示Diff并重新校验 | 1次确认 |
| Permission、Policy或不可逆性不明 | 停止，不用默认值猜测 | 必须补齐 |

不能连续抛出开放式问题；也不能为了减少提问而静默扩大Scope。

### 3.4 Plan Status

Plan Node使用：

- Ready；
- Conditional；
- Running；
- Verified；
- Partial；
- Blocked；
- Failed。

Spinner不能替代真实业务状态。高阶分析失败不得删除Verified基础结果。

长任务按真实运行事件表达：

| 时长 | 必须呈现 |
|---|---|
| `<1s` | 直接返回，不播放过场 |
| `1–5s` | 当前步骤名称 |
| `5–30s` | 节点进度、基础结果先行、取消入口 |
| `>30s` | 转后台任务、允许离开、完成后通知、保留部分结果 |

不显示模型猜测的精确剩余时间。取消Plan Run要保留已完成Result与Evidence；取消Action则必须根据Queued、Executing和Reversible状态选择Stop或Compensate。

### 3.5 Evidence Receipt

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

### 3.6 Decision Record

Recommendation只有在具备Selected Option、Rationale、Evidence、Owner和需要的Approval后，才成为Decision。

### 3.7 Publication Gate

Gate绑定：

- Subject ID与Revision；
- Evidence Snapshot；
- Policy Version；
- Permission Version；
- Checks；
- Invalidation Reason；
- Revalidation Requirement。

Passed不等于Published。

### 3.8 Action Authorization

必须区分：

```text
Recommend
→ Prepare
→ Awaiting Approval
→ Approved
→ Queued
→ Executing
→ Succeeded | Partial | Failed
```

Approved不等于Executed。

需要Compensation时创建引用原Action ID的新Action；不得覆盖原Action终态。

### 3.9 Business Outcome Receipt

Business Outcome来自System of Record，不由LLM重新发明，也不是Action Workflow State。

界面分别显示两个字段：

- `Observation State`：Pending / Observed / Inconclusive；
- `Observed Effect`：Not Assessed / Improved / No Change / Worsened。

Observation变化只更新观察状态；Effect必须引用已经存在的System of Record观察，不得复用Action的Succeeded / Partial / Failed。

Partial必须说明：

- 已完成；
- 未完成；
- 影响；
- 下一步；
- Owner。

Action Succeeded时Business Outcome仍可能是`Pending observation`。

### 3.10 Human Handoff

Handoff可以在Action前、Failure中或Business Outcome之后发生。它创建或转交关联Typed Work Object，固定显示：

- From Object与Revision；
- To Object Type与Owner；
- Goal、Context Snapshot和Evidence；
- Work Done与Pending Work；
- Requested Decision；
- Policy、Permission、Constraints与Trace ID。

Business Outcome成功不强制产生Handoff；Handoff也不要求先存在Business Outcome。

### 3.11 Permission与Autonomy

两者分别表达：

```text
Permission: Allowed / Conditional / Denied
Autonomy: Recommend / Prepare / Approval Required / Execute Within Policy / Monitor by Exception
```

High Confidence不能覆盖Denied。

### 3.12 Revision、Branch与Audit

- Undo创建Revert Patch，不删除Revision。
- Published对象上的追问创建Branch。
- Audit ID稳定且可引用。
- Object Lineage同时显示Root、Parent Revision、Branch与关联Typed Object。

### 3.13 Capability & Scope Receipt

界面准备呈现Action时，必须先获得当前版本的Capability Snapshot：

- Identity、Owner与Version；
- 可读取和可操作的Scope；
- Action Allowlist；
- 每个Action的Permission、Policy与Autonomy边界；
- Risk与Reversibility；
- 必须产生的Receipt；
- Failure、Timeout与Escalation Owner。

Capability Snapshot说明执行主体“声明能做什么”，不等于当前Action已经获得授权。Target、Policy、Permission和Risk仍在Action Gate中按当前Snapshot重新校验。

---

## 4. Process Intelligence Guidance

Process Intelligence的主要对象是Case、Exception、Action、Business Outcome与Rule Proposal。

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
| Verify | Action是否达到终态；可观测的Business Outcome是否符合Expected？ |
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

Compensation是新的关联Action，必须引用：

- 原Action ID；
- 原Action终态与Business Outcome（如已观察）；
- Compensation Reason；
- Actor；
- Result；
- Remaining Risk。

---

## 5. Collaborative Intelligence Guidance

Collaborative Intelligence围绕Goal、Context与Work Result展开；Mission、Analysis、Research、Decision、Artifact与Action Proposal按任务深度出现。

### 5.1 Experience Contract

- 人提出Goal、检查Context，并在任务需要时承担Decision。
- AI按需组织Plan，生成Evidence-linked Result，并在需要时准备Option和Artifact。
- Chat提供输入和控制通道；Mission、Result、Artifact与Decision保存可继续工作的状态。
- 重要Result优先形成稳定Artifact；简单可信回答不强制发布。

### 5.2 Mission与Context

Mission Workspace围绕以下内容组织：

- Goal Header；
- Context Snapshot；
- Conditional Plan；
- Result / Artifact Canvas；
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

ChatBI属于Analytical Intelligence，可与Research、Decision Support或Action Handoff按任务需要组合。

### 5.4 Analysis与Research

固定区域：

- Intent；
- Result Blocks；
- Typed Claims；
- Evidence；
- Supporting Data；
- Degradation与Goal Resolution。

条件区域：

- 复杂任务的Plan；
- 复用或协作时的Artifact；
- 存在Publication Intent与Audience时的Publication Gate。

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
- Business Outcome；
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
| S08 | Business Outcome Receipt | Business Outcome |
| S09 | Capability & Scope Receipt | Capability Snapshot |
| S10 | Human Handoff / Work Transfer | Handoff Envelope |
| S11 | Work Result & Goal Resolution | Result Record / Goal Assessment |

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

### 7.4 Governed Reference Flows

Flow帮助选择Pattern组合，不替换Shared Experience Kernel。

| Flow | Pattern组合 | 不得继续的条件 |
|---|---|---|
| Ask → Conclude | S01 → S04 → S11；S02 / S03 / C02 / S06按需 | Goal无法识别、Scope越权、Claim无Evidence；可信Result后可合法结束 |
| Event → Action | S01 → S09 → P01 → S07 → S08 | Action未声明、Permission Denied、不可逆且缺授权、Receipt无法写入 |
| Exception → Investigation | P01 → S10 → C01 / C02 → S05 | Handoff缺Context、Evidence、Requested Decision或Trace |
| Decision → Rule Candidate | S05 → P02 | 样本不足、Scope不明、Replay/SoD/Conflict Scan未通过 |

Exception与Analysis是两个关联Typed Work Object，不共用可变状态。Decision只能创建Rule Candidate；不能直接把一次判断写成Active Rule。

所有业务流程图共用一套视觉契约：

- 主路径在容器可容纳时居中；节点等高，宽度按内容自适应，不强制等宽；
- 条件、合法停止点、执行结果、恢复和关联Outcome必须离开主路径单独表达；
- 不把`Succeeded / Partial / Failed`、`Suspended / Retired`等互斥状态塞进同一个节点；
- Desktop只在确实无法容纳时使用局部横向滚动；小屏改为纵向主路径；
- 只有纯数字或短标签的Progress Indicator可以等分宽度；阶段矩阵和上一项/下一项导航不得冒充业务流程。

Reference站点通过`data-semantic-flow`标记业务流程，通过`data-flow-contract="progress-indicator|stage-matrix"`标记其他序列视觉，并对所有已登记流程执行跨视口回归。

### 7.5 Canonical Pattern Coverage与成熟度

成熟度不得由Renderer或截图数量推断：

| Maturity | 完成条件 |
|---|---|
| Canonical Listed | 只有Canonical身份与不变量，明确显示尚未形成Reference |
| Specified | Purpose、Anatomy、独立状态字段、失败、恢复与Acceptance完整；可以是Static Anatomy Reference |
| Behavioral Specimen | 至少一条主要行为、一个Failure或Degradation和一个Recovery路径可观察 |
| Validated Pattern | 自动契约测试与真实Reader/User证据通过 |

| Canonical Pattern | Online Mapping | Current Maturity |
|---|---|---|
| Goal & Context Header | S01 | Specified |
| Work Result & Goal Resolution | S11 | Behavioral Specimen |
| Intent / Change Preview | S02 + Intent Patch Scenario | Behavioral Specimen |
| Plan & Progress | S03 + Plan / Partial Scenario | Behavioral Specimen |
| Evidence Receipt | S04 + Evidence / Gate Scenario | Behavioral Specimen |
| Decision Record | S05 | Specified |
| Publication Gate | S06 + Evidence / Gate Scenario | Behavioral Specimen |
| Action Preview & Authorization | S07 + Controlled Action Scenario | Behavioral Specimen |
| Business Outcome Receipt | S08 | Specified |
| Branch & Revision | S02 / C03 | Specified |
| Human Handoff | S10 | Behavioral Specimen |
| Feedback Capture | — | Canonical Listed |
| Degradation & Partial Result | S03 / C02 | Behavioral Specimen |
| Capability & Scope Receipt | S09 + Capability Scenario | Behavioral Specimen |
| Work Queue | P01 | Specified |
| Case Workspace | P01 | Specified |
| Decision Checkpoint | P01 / S05 | Specified |
| Approval Brief | S07 | Specified |
| Exception-first Console | P01 | Specified |
| Rule Proposal & Change Approval | P02 + Rule Scenario | Behavioral Specimen |
| Recovery & Rollback | P03 | Specified |
| Process Control Tower | — | Canonical Listed |
| Execution Audit Timeline | P03 | Specified |
| Mission Workspace | C01 | Specified |
| Research Board | — | Canonical Listed |
| Analysis Document | C02 | Specified |
| Decision Canvas | S05 | Specified |
| Creation Workspace | — | Canonical Listed |
| Planning Board | S03 / C01 | Specified |
| Audience Brief | C03 | Specified |
| Artifact History & Branch | C03 | Specified |
| Personal / Team Memory Library | — | Canonical Listed |

允许条目保持`Canonical Listed`，但不得静默缺失或宣称全部Pattern已经验证。

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
8. Independent State Fields
9. Permission与Autonomy
10. Failure、Degradation与Recovery
11. Responsive Behavior
12. Accessibility
13. Do / Don’t
14. Acceptance Tests
15. Used Core Components
16. Extension Rules
17. Kernel Coverage：Required / Conditional / Linked / Not Applicable
18. Outputs、Termination Conditions与Optional Extensions
19. Explicit State Field IDs与阻断规则
20. Maturity与验证证据

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

### 9.3 Feedback Signals

反馈从已有操作中采集，不额外打断用户。每条信号必须绑定Work Object、Revision、Trace、用途、Owner与保留期限。

| Signal | 触发 | 用途 |
|---|---|---|
| `intent_corrected` | 用户修改AI解析出的Intent | 改进解析与默认值 |
| `patch_rejected` | 预览后拒绝或撤销 | 校准自动应用边界 |
| `evidence_opened` | 展开Evidence Receipt | 配对评估可达性与信任，不单独追求打开率 |
| `claim_challenged` | 用户降级或质疑Claim | 评估Calibration |
| `action_overridden` | 人修改或拒绝Action | 调整Rule、Threshold或UI说明 |
| `handoff_reopened` | 接收者因Context不足重新调查 | 衡量交接完整度 |
| `abandoned` | 任务中途退出 | 定位流程断点 |

这些信号默认服务产品评估与治理审计，不自动等同于模型训练授权。

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
- Action Succeeded不得自动显示为Business Outcome已观察。
- Rule Candidate审批前不得Active。
- Reject后不保留Active派生状态。
- Partial与Failure保留Work Done。
- Compensation创建新Action并引用原Action。

### Collaborative

- 快速阅读与完整规范共享Revision。
- Narrative数字与Result一致。
- Published上的追问创建Branch。
- Evidence变化使Publication Gate失效。
- 高阶失败不删除Verified基础结果。
- Recommendation进入Process前只能形成Action Proposal。
- Trustworthy Answer可以在无Decision、Artifact、Action和Business Outcome时记录Goal Resolution。
- 简单可信回答可以在Result与Goal Resolution后结束。

### Cross-contract

- Handoff创建新的Typed Object。
- From Revision不可变。
- Root与Trace连续。
- Policy、Permission和Constraints显式传递。
- Business Outcome成功时可以没有Handoff；Handoff也可以发生在Business Outcome之前。

---

## 12. Visual Specimen Coverage

Rev 0.5在线Registry提供17个Reference条目：S01–S11、P01–P03与C01–C03。7.5 Coverage Registry分别声明每个条目的成熟度与可验证范围。

所有Reference至少可见：

1. 当前Typed Work Object、Owner与Contract；
2. Pattern的Fixed Regions；
3. 明确Field ID的状态或条件；
4. 独立的Evidence、Permission、Autonomy、Risk或Workflow字段，不使用名称正则推断；
5. Failure、Degradation与Recovery路径；
6. `Simulation · No external action`运行边界。

只有达到Behavioral Specimen的条目，才必须验证：

- 对象或Receipt状态真实变化；
- 可用Action集合、Disabled或Gate状态随契约变化；
- Failure或Degradation保留有效工作；
- Recovery或Reset产生可观察结果；
- 仅修改Header Badge不能通过测试。

页面中的`{placeholder}`代表可扩展领域内容；Pattern结构、对象类型、生命周期与Gate边界不可被领域内容覆盖。
