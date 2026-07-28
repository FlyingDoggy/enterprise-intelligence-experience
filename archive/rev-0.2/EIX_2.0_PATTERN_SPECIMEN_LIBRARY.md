# EIX 2.0 Pattern Specimen Library

> Governed Human–AI Interaction Patterns  
> Candidate Companion · Revision 0.2 · 2026-07-25

| 文档属性 | 内容 |
|---|---|
| 身份 | **Candidate Companion**：把Canonical原则转成可评审的Pattern规格 |
| 主要读者 | Product、UX、Content Design、Engineering、Governance、QA |
| Canonical来源 | [Enterprise Intelligence Experience Principles 2.0](./ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md) |
| 当前成熟度 | Reference Specimen；不是生产Design System或组件API |
| 晋升条件 | 至少两个真实消费者验证共同结构、状态和无障碍要求 |

---

## 0. 使用规则

Pattern是可以跨场景复用的体验契约，不是视觉模板。

一个Pattern只有在以下内容保持稳定时才成立：

- 用户要完成的工作；
- 使用的Work Object；
- 必须可见的信息；
- Human与AI的责任；
- 状态、权限和失败路径；
- 验收方式。

颜色、字体、圆角和布局可以由品牌系统适配；治理语义、状态边界和可访问性不能被主题覆盖。

---

## 1. Pattern Specification

### 1.1 必填Schema

```yaml
pattern:
  id: "PAT-000"
  name: "[Pattern Name]"
  maturity: "candidate | validated | shared"
  purpose: "[What work this pattern enables]"
  user_fear: "[What could go wrong from the user's perspective]"
  interaction_contract: "shared | process | collaborative"
  work_object: "[Typed Work Object]"
  owner: "[Accountable role]"
  trigger: "[When it appears]"
  fixed_regions:
    - "[Required region]"
  optional_regions:
    - "[Conditional region]"
  semantic_axes:
    - "[Claim / Evidence / Risk / Permission / Autonomy / Workflow]"
  states:
    - "[State]"
  supported_actions:
    - "[Action]"
  gate_policy: "[Gate requirement]"
  permission_policy: "[Permission requirement]"
  failure_and_recovery:
    - "[Failure → recovery]"
  responsive_behavior:
    compact: "[Behavior]"
    full: "[Behavior]"
  accessibility:
    - "[Requirement]"
  acceptance_tests:
    - "[Test]"
```

### 1.2 固定区与扩展区

| 类型 | 规则 |
|---|---|
| Fixed Region | 缺失会改变Pattern语义或造成治理风险，不允许产品删除 |
| Optional Region | 仅在数据、角色或状态满足条件时出现 |
| Extension Slot | 产品可以增加领域内容，但不得改变固定状态或推导关系 |
| Composition | 多个Pattern组成的Reference Surface，不自动晋升共享组件 |

### 1.3 Pattern评审顺序

1. User Goal与User Fear是否真实；
2. Work Object与Owner是否明确；
3. Fixed Region是否足够完成判断；
4. 语义轴是否正交；
5. Lifecycle和按钮是否一致；
6. Failure、Recovery和Takeover是否存在；
7. Brief与Deep Dive是否读取同一Revision；
8. 键盘、触控和辅助技术是否完成同一任务；
9. 最后才评审视觉风格。

---

## 2. Shared Pattern 01 — Goal & Context Header

### Purpose

让用户无需阅读Transcript，就能识别当前工作、目标、范围、Owner和正在使用的Context。

### User Fear

> “AI到底在处理什么？它用了哪些信息？”

### Contract / Work Object

- Contract：Shared
- Work Object：Root Work Object或任一Typed Child Object
- Accountable Owner：业务Owner

### Fixed Regions

1. Goal或Case Purpose；
2. Work Object Type与Stable ID；
3. Owner；
4. Workflow State与Revision；
5. Scope；
6. Context Snapshot；
7. Permission Scope；
8. Freshness / As-of。

### Optional Regions

- Audience；
- Success Definition；
- Deadline；
- Persistent Memory Indicator；
- Related Parent / Child Objects。

### States

`Complete`、`Needs Confirmation`、`Scope Changed`、`Restricted`、`Stale`。

### Behavior

- Header在工作区中保持可见；
- Scope、Context或Method变化时显示Patch Marker；
- 点击Context打开Inspector，不直接修改；
- Brief可折叠细节，但不得隐藏Owner、Scope、Freshness和Restriction。

### Accessibility

- 所有Chip必须有可读Label，不只显示缩写；
- Context变化使用`aria-live="polite"`；
- 横向Chip在小屏允许换行，不只依赖横向滚动。

### Acceptance

- 用户在十秒内能说出Goal、Owner、Scope和State；
- Brief与Deep Dive显示相同Revision；
- Restricted状态不泄露无权限内容或记录数量。

---

## 3. Shared Pattern 02 — Intent / Change Preview

### Purpose

把自然语言、表单、拖拽、图表点击和系统建议统一成可预览、可确认的Typed Patch。

### User Fear

> “系统是不是偷偷改变了我的问题或工作范围？”

### Fixed Regions

1. Change Source；
2. Before / After Diff；
3. Affected Work Object；
4. Affected Blocks / Steps；
5. Scope、Method、Permission影响；
6. Validation Result；
7. Apply、Revise、Cancel；
8. Branch / New Revision要求。

### Patch行为

| 条件 | 行为 |
|---|---|
| 高理解度、低风险、不改变Scope | 可直接Apply，保留Undo事件 |
| 存在两个合理解释 | 展示最多两个具体解释 |
| 低理解度 | 只问一个最关键问题 |
| 改变Scope、Method、Context或Audience | 必须展示Diff并重新验证 |
| 影响Published Revision | 必须创建Branch或New Revision |
| Permission Denied | 不允许Apply，说明合法替代 |

### Invariants

- Undo不是删除Revision，而是产生Revert Patch；
- 等价输入应生成等价Canonical Intent；
- Patch不能直接执行Action；
- Apply后所有受影响Gate Decision失效。

### Responsive

- Full：字段级Diff和影响Inspector并列；
- Compact：先显示业务影响，再按需展开字段Diff；
- Mobile：不提供复杂拖拽，但可以Review、Apply或Reject Patch。

### Acceptance

- 用户能准确说出什么将改变；
- Scope改变时无静默裁剪；
- Published内容不会被Patch原地覆盖。

---

## 4. Shared Pattern 03 — Plan & Progress

### Purpose

让用户看见系统打算怎样实现Goal、哪些步骤可运行、哪些需要条件，以及真实进度。

### User Fear

> “系统是在工作、卡住，还是只是在播放动画？”

### Fixed Regions

1. Plan Node；
2. Purpose；
3. Dependency；
4. Data / Tool Preconditions；
5. State；
6. Owner；
7. Missing Input；
8. Stop / Skip / Retry / Takeover。

### Node States

`Ready`、`Conditional`、`Running`、`Verified`、`Partial`、`Blocked`、`Skipped`、`Failed`。

`Verified`描述节点输出通过验证，不代表整个Artifact可发布，也不代表任何Action可执行。

### Progressive Result

- 基础结果优先返回；
- 高阶节点独立失败；
- Partial保留Verified部分；
- Progress只由真实事件推进；
- Reduced Motion下状态立即更新但不丢信息。

### Degradation Copy

固定回答：

1. What could not run；
2. Why；
3. What is still verified；
4. What is missing；
5. What next。

### Acceptance

- 用户能解释Ready、Conditional与Blocked的差异；
- 高阶失败不删除已验证基础结果；
- 不使用计时器模拟Verified业务状态。

---

## 5. Shared Pattern 04 — Evidence Receipt

### Purpose

把Claim、Calculation或Decision连接到可追溯依据。

### User Fear

> “这个数字和解释到底从哪里来？”

### Fixed Regions

| Slot | 内容 |
|---|---|
| Evidence ID | 类型化Stable ID |
| Source | 数据集、文档、规则或事件 |
| Semantic Version | Metric、Definition或Policy版本 |
| Snapshot | As-of、Timezone、Closed / Open状态 |
| Scope | Filters、Grain、Population |
| Method | Formula、Query Fingerprint或Analysis Method |
| Permission | 数据裁剪和使用权限 |
| Validation | Evidence Status与Validator |
| Limitation | Missing、Assumption、Known Bias |
| Related Claims | 引用此Evidence的对象 |

### Variants

- Data Evidence；
- Document Evidence；
- Rule / Policy Evidence；
- Execution Evidence；
- Composite Evidence。

### States

`Unverified`、`Supported`、`Verified`、`Contested`、`Stale`、`Insufficient`。

### Invariants

- Stale不是Warning装饰，而是Gate输入；
- `0 restricted`不得被用来泄露受限记录是否存在；
- Brief默认隐藏Query Hash，但始终保留访问入口；
- Evidence Status不推出Permission或Autonomy。

### Acceptance

- 重要Claim的Evidence Coverage为100%；
- 用户能找到Source、Method、Scope和Limitation；
- Evidence变化后相关Gate失效。

---

## 6. Shared Pattern 05 — Decision Record

### Purpose

记录选择了什么、为什么、由谁负责、使用了哪些Evidence。

### User Fear

> “这是AI建议、团队共识，还是已经批准的决定？”

### Fixed Regions

1. Decision Question；
2. Selected Option；
3. Alternatives；
4. Rationale；
5. Evidence；
6. Assumptions与Risk；
7. Decision Owner；
8. Approval State；
9. Effective Scope与Time；
10. Revisit Trigger。

### States

`Open`、`Evidence Pending`、`Proposed`、`Confirmed`、`Superseded`、`Reopened`。

### Invariants

- Recommendation不是Decision；
- AI可以组织Option，不能替代Accountable Owner；
- Decision变化产生新Revision；
- Decision Record不直接执行Action。

### Acceptance

- 用户能识别Owner、Rationale和Alternative；
- 无Owner的内容不得显示为Confirmed；
- Superseded Decision仍可审计。

---

## 7. Shared Pattern 06 — Publication Gate

### Purpose

阻止不一致、无Evidence、过期或越权内容被发布。

### User Fear

> “报告看起来完成了，但数字、口径或Evidence可能已经变了。”

### Fixed Checks

- Subject Revision固定；
- Intent / Contract确认；
- Narrative与Result一致；
- Claim Evidence完整；
- Evidence Freshness；
- Metric / Definition未Deprecated；
- Forecast包含Range与Assumption；
- Hypothesis未写成Fact；
- Restricted内容未暴露；
- Partial / Failed节点被正确表达；
- Audience Permission；
- Owner与Approval。

### States

`Not Run`、`Checking`、`Passed`、`Failed`、`Invalidated`。

### Invariants

- Passed不等于Published；
- Check必须显示Pass / Fail / N/A；
- Subject、Evidence、Policy、Permission或内容变化后状态变为Invalidated；
- Publish时原子重验。

### Acceptance

- Stale切换后Publish立即不可用；
- 修改Scope后旧Gate不能继续使用；
- 所有Check绑定Revision Hash。

---

## 8. Shared Pattern 07 — Action Preview & Authorization

### Purpose

在改变外部状态前，让用户理解动作、依据、影响、权限和恢复方式。

### User Fear

> “我点的是批准、执行，还是已经发生了改变？”

### Fixed Regions

1. Action与Target；
2. Actor与Requestor；
3. Parameters与Scope；
4. Evidence / Decision依据；
5. Permission Decision与Policy Version；
6. Impact与Risk；
7. Reversibility / Compensation；
8. Preconditions与Expiry；
9. Current Action State；
10. 明确命名的下一动作。

### Action Lifecycle

`Proposed → Preflight Ready → Awaiting Approval → Approved → Queued → Executing → Succeeded / Partial / Failed → Compensated`

### Control Copy

- `准备动作`只生成Preview；
- `提交审批`只进入Awaiting Approval；
- `批准`只产生Approval Receipt；
- `加入执行队列`进入Queued；
- `执行`改变外部状态；
- `补偿`产生新Action，不删除原Execution。

### Invariants

- Confidence不决定Permission；
- Approve不等于Execute；
- Execute前重验Permission、Policy、Target State和Expiry；
- 双击、重试和重放必须依赖Idempotency；
- Action Receipt与Outcome Receipt分离。

### Acceptance

- 用户对Prepared、Approved、Executed和Outcome辨识正确率≥95%；
- Denied Action无法进入Queued；
- Target State变化后要求重新授权。

---

## 9. Shared Pattern 08 — Outcome Receipt & Human Handoff

### Purpose

证明真实发生了什么，并让下一位用户在保留Context的情况下继续工作。

### User Fear

> “系统说成功了，但真实结果是什么？交给我后为什么又要从头查？”

### Outcome Receipt Fixed Regions

- Action / Analysis ID；
- Expected vs Actual；
- Start / End Time；
- Target与Postcondition；
- Success / Partial / Failed；
- Affected Objects；
- Exception；
- Rollback / Compensation Reference；
- Next State；
- Audit / Trace ID。

### Handoff Fixed Regions

- From / To Typed Work Object；
- Goal与Scope；
- Context Snapshot；
- Evidence；
- Work Done；
- Failure / Handoff Reason；
- Requested Decision；
- Permission与Policy；
- Owner与Due State；
- Trace ID。

### Invariants

- Outcome来自系统记录；
- Handoff创建关联对象，不改变原对象类型；
- Takeover保留Work Done；
- Partial明确列出已完成、未完成和恢复动作。

### Acceptance

- 人工接管不需要重新收集已存在的Context；
- Execution成功但Postcondition失败时Outcome不能显示Succeeded；
- 原对象和新对象可通过Trace互相访问。

---

## 10. Process Composition A — Exception-first Console

### Purpose

让运营者关注异常、审批、抽检、恢复和系统边界，而不是逐条监督正常Case。

### Fixed Regions

- Queue Universe与分母；
- Auto / Assisted / Human-required；
- Unknown、Failure与Restricted；
- Queue Age与SLA；
- Health、Recovery Debt与抽检；
- Priority和Impact；
- Owner；
- Pause、Takeover与Investigate；
- Audit入口。

### 不使用

- 单一“自动化天花板”；
- 只展示吞吐不展示失败；
- 以Agent人格替代Accountable Owner；
- 将绿色车道同时表示可信、允许和成功。

### Reference Metrics

Safe Automation Frontier使用多指标：

- Correctness；
- Exception Rate；
- Human Touch Time；
- Recovery Success；
- Silent Failure Detection；
- Policy Violation；
- Business Outcome。

---

## 11. Process Composition B — Rule Proposal & Change Approval

### Purpose

把一次人工判断转化为可验证的未来能力提案，而不是立即生效的规则。

### Required Flow

```text
Current Case Decision
  → Rule Candidate
  → Owner & Scope
  → Historical Replay
  → Counterexample Test
  → Conflict Scan
  → SoD Approval
  → Shadow / Stage / Canary
  → Observe
  → Active | Suspended | Rejected
```

### Fixed Regions

- Candidate ID与来源Decision；
- Existing Policy依据；
- Proposed Trigger、Scope和Action；
- Owner、Proposer、Approver；
- Validation Dataset与Results；
- Conflict / Coverage；
- Risk、Reversibility、Kill Switch；
- Stage、Monitor和Rollback；
- Change Receipt。

### Invariants

- 当前Case不得依据尚未创建的Candidate；
- 点击“提出规则”只创建Candidate；
- Approval前不得显示Active或改变自动化指标；
- Reject后所有派生状态保持一致；
- Active只影响未来匹配Scope的Case。

---

## 12. Process Composition C — Recovery & Rollback Workspace

### Purpose

在Failure或Partial后恢复业务方向，而不是只显示技术错误。

### Fixed Regions

- Failure Classification；
- Business Impact；
- Completed / Pending / Unknown；
- Retry Eligibility；
- Compensation / Rollback Plan；
- Manual Takeover；
- Owner与SLA；
- Related Execution和Outcome；
- Audit Timeline。

### States

`Detected`、`Contained`、`Recovering`、`Recovered`、`Takeover Required`、`Unrecoverable`。

### Acceptance

- Recovery不删除原失败事件；
- Compensation引用原Action；
- Takeover保留Completed Work和Context。

---

## 13. Collaborative Composition A — Mission Workspace

### Purpose

围绕Goal组织开放式知识工作，而不是围绕聊天消息组织。

### Fixed Regions

- Goal & Context Header；
- Plan；
- Primary Artifact Canvas；
- Evidence / Context Inspector；
- Revision与Branch；
- Next Best Action；
- Mission Log。

### Density

- Brief：Goal、关键Artifact、Scope、Freshness、Risk和Next Step；
- Deep Dive：完整Plan、Evidence、Context、Methods和History；
- 两者读取同一Revision。

---

## 14. Collaborative Composition B — Analysis / Research Document

### Purpose

把探索、Evidence、Result、Claim和Narrative组织为可验证、可发布的Document。

### Fixed Story Order

```text
What changed
  → Where
  → Why or what can be supported
  → Context and limitations
  → Implication
  → Next question or action
```

### Fixed Regions

- Intent；
- Result Blocks；
- Typed Claims；
- Evidence；
- Supporting Data；
- Plan与Degradation；
- Branch / Revision；
- Publication Gate。

### Invariants

- Narrative数字引用Result Object；
- Correlation不写成Causation；
- 数据不足是一种合法结论；
- 高阶失败不抹掉基础结果。

---

## 15. Collaborative Composition C — Audience Brief & Revision History

### Purpose

让管理层读取同一事实的低密度表达，同时保持Evidence和限制。

### Fixed Regions

- What / Where / Why；
- Scope、Freshness与Version；
- Key Evidence入口；
- Limitation；
- Decision / Next Question；
- Published Revision；
- Question Pin / Branch；
- Owner。

### Invariants

- Brief不创建另一份事实；
- CFO追问创建Branch；
- Published Revision不可修改；
- “交给专家”携带Focus、Evidence和Question。

---

## 16. Semantic Visual Language Candidate

### 16.1 Token Namespaces

| Namespace | 用途 | 例子 |
|---|---|---|
| `foundation.*` | 品牌、表面、字体、边框、空间 | `foundation.surface.paper` |
| `interaction.*` | 选择、焦点、变化 | `interaction.focus` |
| `claim.*` | Claim Kind | `claim.hypothesis` |
| `validation.*` | Evidence / Validation | `validation.stale` |
| `risk.*` | Impact与Reversibility | `risk.high` |
| `permission.*` | Allowed / Conditional / Denied | `permission.denied` |
| `workflow.*` | 对象Lifecycle | `workflow.awaitingApproval` |

### 16.2 Visual Obligations

- 颜色从不单独承担状态；
- 同色相跨Namespace时必须显示轴Label；
- 数字使用Tabular Numerals；
- Trace、Hash和Stable ID使用Mono；
- Action按钮名称与产生的State一致；
- Stale、Denied和Failed使用不同文案和结构；
- Brief不显示无决策价值的内部置信小数。

### 16.3 品牌选择与不变量

以下属于品牌或产品选择，不是EIX架构不变量：

- 圆角大小；
- 是否使用渐变；
- 阴影；
- 插画风格；
- Emoji；
- 卡片密度。

以下属于不变量：

- 状态可辨识；
- Evidence可达；
- Action Consequence可见；
- Failure有恢复方向；
- 颜色之外有文字和符号；
- 正文与交互达到可访问性标准。

---

## 17. Content Voice

### 原则

- 使用业务用户认识的对象和动词；
- 一个控件只表达一个动作；
- Action名称贯穿按钮、状态和Receipt；
- 不使用“magic”“AI发现了惊人洞察”等话术；
- 不把Correlation写成Causation；
- 不用“输入无效”代替具体修复方法；
- Failure不道歉，直接说明发生了什么和下一步。

### Degradation模板

```text
[未能完成什么]
[为什么]
[什么仍然有效]
[还缺什么]
[下一步可以做什么]
```

---

## 18. Responsive & Accessibility

### Capability Breakpoints

| Viewport | 能力 |
|---|---|
| ≥1280 | 多面板、Pattern Inspector、复杂直接操作 |
| 768–1279 | 单主栏、Inspector Drawer、Guided Interaction |
| <768 | Brief、Journey、Review、Approval；不提供复杂拖拽 |

### Accessibility Baseline

- WCAG 2.2 AA正文对比度；
- 44px触控目标；
- 2px可见Focus；
- Tab、Arrow、Escape和Focus Return符合组件模型；
- 动态状态使用合适Live Region；
- Reduced Motion不丢失信息；
- 图表有数据表或等价文本；
- 状态使用文字、符号和结构，不只依赖颜色。

---

## 19. Acceptance & Maturity

### Candidate → Validated

- 在一个Reference Journey中完整使用；
- 所有状态和失败Fixture通过；
- 键盘与移动阅读通过；
- 业务用户理解测试通过；
- 无架构或生命周期冲突。

### Validated → Shared

- 至少两个实质不同消费者；
- 共同Schema不含领域名称；
- API、Owner、Version和Migration明确；
- 自动化状态与无障碍测试；
- 真实业务Outcome验证。

### Reference Test Fixtures

- Empty；
- Loading；
- Ready；
- Partial；
- Stale；
- Restricted；
- Conflict；
- Permission Denied；
- Approval Pending；
- Executing；
- Failed；
- Compensated；
- Superseded；
- Rule Candidate Rejected。

---

## Appendix A — Design Review Questions

1. 用户正在处理哪个Typed Work Object？
2. 当前Goal、Owner、Scope和Revision是否可见？
3. Claim、Evidence、Risk、Permission、Autonomy和Workflow是否被混合？
4. 点击主要按钮后究竟产生哪个状态？
5. Approve与Execute是否分开？
6. Gate绑定哪个Revision和治理快照？
7. Evidence或Policy变化后会发生什么？
8. Failure保留了哪些Verified Work？
9. Handoff携带了哪些Context和Requested Decision？
10. Brief是否仍显示关键Scope、Freshness和Risk？
11. 小屏删除的是能力还是关键信息？
12. 没有颜色、动画和营销文案时，用户仍能理解状态吗？

## Appendix B — Reference Implementation Boundary

当前静态站点只证明：

- 文档信息架构；
- Pattern Anatomy；
- 客户端Fixture状态机；
- 交互文案；
- 响应式与无障碍方向。

它不证明：

- 真实Identity或Permission；
- Policy Enforcement；
- Evidence查询；
- 外部系统执行；
- 不可变审计；
- Idempotency；
- Compensation；
- Production Design System可复用性。

所有Reference Interaction固定标记：

> Simulation · No external action
