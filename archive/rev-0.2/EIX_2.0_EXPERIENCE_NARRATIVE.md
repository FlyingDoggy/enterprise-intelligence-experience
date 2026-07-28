# EIX 2.0 Experience Narrative

> 面向管理层与首次接触者的5分钟体验说明  
> Companion · Revision 0.2 · 2026-07-25

| 文档属性 | 内容 |
|---|---|
| 身份 | **Companion**：解释Canonical Architecture带来的用户体验 |
| 主要读者 | Management、Business Owner、Product、Transformation Lead |
| 阅读时间 | 5分钟主线；20分钟完整Journey |
| Canonical来源 | [Enterprise Intelligence Experience Principles 2.0](./ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md) |
| 不负责 | 重定义Kernel、治理状态、技术架构或生产组件 |

---

## 一句话

> Enterprise Intelligence不是一个更聪明的聊天框，而是一套让人能够理解、控制并与AI共同完成真实工作的体验。

---

## 1. 为什么Chat不够

Chat非常适合表达问题，但企业工作不会停在“得到一段回答”。

企业用户还需要知道：

- 现在真正要实现的业务结果是什么；
- AI使用了哪些数据、规则和历史；
- 哪些是事实，哪些只是候选解释；
- 下一步会不会改变真实系统；
- 谁拥有决定权；
- 出错后如何恢复；
- 这次工作如何被保存、复用和审计。

当这些内容只存在于对话记录里，用户不得不反复翻阅历史、重新确认口径、复制结果并手工解释风险。AI看似减少了工作，却制造了新的监督劳动。

EIX 2.0把这些隐藏在对话后的工作对象，变成稳定、可见、可控制的界面。

---

## 2. 一套体验，两种协作契约

### Process Intelligence

适合结构化、有状态、可重复的工作。

```text
系统推进正常路径
        ↓
人处理授权、异常和边界
        ↓
Outcome与反馈改进未来工作
```

用户不再逐条执行，而是治理自动化能力、处理真正需要判断的少数情况。

### Collaborative Intelligence

适合目标驱动、上下文丰富、路径开放的知识工作。

```text
人定义Goal与判断标准
        ↓
AI理解、规划、分析和生成
        ↓
人确认Decision与高影响Action
```

用户得到的不是一次性答案，而是可以继续分析、协作、发布和行动的稳定Artifact。

### 它们如何连接

一次分析如果需要改变真实系统，会产生一个受控Action Proposal并进入Process；一个流程如果遇到无法按规则解释的Exception，会创建一项Collaborative Investigation。

它们共享Goal、Context、Evidence和Trace，但不会把Analysis、Case和Action混成同一个可变对象。

---

## 3. 六个体验承诺

### 3.1 Clarity · 我知道正在处理什么

**用户原始焦虑**

> “我问了一句话，但AI到底理解成了什么？”

**常见失败体验**

- Chat、筛选器和图表维护不同状态；
- AI静默改变时间、范围或方法；
- 用户只能通过结果猜测系统理解。

**EIX机制**

- Goal & Scope Header；
- Intent / Change Preview；
- Work Object、Owner、State和Revision常驻；
- Scope或Method改变时显示Diff和影响。

**体验承诺**

> 我不需要询问AI，就能看见当前目标、口径和状态。

---

### 3.2 Trust · 我知道依据和限制

**用户原始焦虑**

> “这个结论听起来很合理，但它是真的吗？”

**常见失败体验**

- 引用只是一串链接；
- 事实、计算、假设和预测使用相同语气；
- Narrative中的数字和图表不一致；
- 过期数据仍被包装成Verified。

**EIX机制**

- Claim绑定Evidence Receipt；
- Fact、Calculation、Hypothesis、Forecast和Recommendation分型；
- Source、Method、Scope、Freshness和Limitation可展开；
- Evidence变化会使Publication Gate失效。

**体验承诺**

> 我能从任何重要结论回到来源、方法和边界。

---

### 3.3 Control · 我知道在哪里干预

**用户原始焦虑**

> “AI是在建议、准备，还是已经替我执行了？”

**常见失败体验**

- “批准”按钮同时代表授权和执行；
- Confidence较高被误认为可以自动行动；
- 用户不知道目标对象、影响和恢复方式。

**EIX机制**

- Recommend、Prepare、Approve、Execute与Outcome明确分开；
- Action Preview展示Actor、Target、Impact、Permission、Risk和Reversibility；
- Permission与Policy拥有独立否决权；
- Pause、Takeover、Rollback或Compensation在适用时可用。

**体验承诺**

> 改变现实之前，我先看见后果；系统不会把建议偷偷变成行动。

---

### 3.4 Momentum · 我看到工作在推进

**用户原始焦虑**

> “AI是在工作、卡住了，还是只是在播放动画？”

**常见失败体验**

- 长时间“思考中”；
- 基础结果和高阶分析一起等待；
- 一个高级步骤失败后所有内容消失。

**EIX机制**

- Plan显示Ready、Conditional、Blocked和Missing Input；
- 基础结果优先返回；
- 高阶节点独立失败并标记Partial；
- Progress只对应真实状态变化。

**体验承诺**

> 我知道已经完成了什么、正在做什么、还缺什么。

---

### 3.5 Continuity · 我不需要每次重新开始

**用户原始焦虑**

> “为什么每次追问、交接或换页面都要重新解释背景？”

**常见失败体验**

- Context锁在聊天线程；
- 追问覆盖原报告；
- 流程异常交给人时只剩一句错误信息；
- 不同页面保存不同事实版本。

**EIX机制**

- Root Work Object维持Goal、Owner、Context和Trace；
- Branch与Revision保护Published状态；
- Handoff携带Context Snapshot、Evidence、Work Done和Requested Decision；
- Brief与Deep Dive读取同一Revision。

**体验承诺**

> 工作可以跨角色、页面和时间继续，而不是重新开始。

---

### 3.6 Calm · 自动化没有制造新的焦虑

**用户原始焦虑**

> “为了确保AI没犯错，我是不是要监督每一步？”

**常见失败体验**

- 所有Agent活动都要求人关注；
- Dashboard强调吞吐和自动化率，隐藏Failure和Recovery；
- 系统用拟人化动画制造“忙碌感”。

**EIX机制**

- Exception-first；
- 正常路径安静推进；
- 人只接收有Owner、有Context、有Next Step的事项；
- 同时展示Unknown、Failure、Queue Age、SLA和Recovery；
- 不以自动化比例作为唯一成功指标。

**体验承诺**

> 系统减少我的监督负担，而不是把我变成AI监工。

---

## 4. Before / After

### 4.1 Collaborative Intelligence

#### Before：一个聪明的Chat

1. 用户输入一个复杂业务问题。
2. AI返回一段答案和几个图表。
3. 用户发现期间不对，再追问修改。
4. 新答案覆盖旧上下文，数字和解释需要人工核对。
5. 用户复制到PPT，手工补充口径和来源。
6. CFO追问后，Controller重新开始调查。

#### After：一个可持续的Mission

1. Goal、Owner、Scope和Success Definition先被确认。
2. AI展示使用的Context和建议Plan。
3. 基础Result先返回，高阶分析按数据条件运行。
4. 每个Claim绑定Evidence，Hypothesis与Fact明确区分。
5. 管理层阅读Brief，专家在同一Revision中查看Deep Dive。
6. 追问创建Branch；Published Artifact不被污染。
7. 需要行动时产生Action Proposal，而不是由报告直接执行。

### 4.2 Process Intelligence

#### Before：人在流程里逐条处理

1. 每个Case都进入人的队列。
2. 操作者在多个系统之间查找上下文。
3. 规则和判断存在于个人经验。
4. 自动化失败后，人从头调查。
5. 一次人工判断可能被口头推广为“以后都这样做”。

#### After：人治理正常路径和边界

1. 合法、低风险、可恢复的正常路径按Policy推进。
2. Exception带着完整Context、Evidence和Requested Decision到达人。
3. 人清楚区分建议、授权、执行和Outcome。
4. 系统失败时保留Work Done并提供Recovery。
5. 人工判断只产生Rule Candidate。
6. Candidate经过回放、冲突扫描、SoD、Stage和监控后才影响未来Case。

---

## 5. Reference Journey A · Collaborative Journey：从分析到受控行动

### Step 1 · Frame Goal

| 项目 | 内容 |
|---|---|
| Work Object | `MIS-041 · Collaborative Mission` |
| 人的责任 | 确认业务目标、范围和最终使用者 |
| AI的责任 | 解释Goal并识别关键歧义 |
| Evidence / Policy | 当前无结论；只使用有权限的Context |
| 控制 | 修改Goal、移除Context、停止 |
| 降级 | 目标不可判定时只问一个关键问题 |
| Artifact | Goal & Context Header |

### Step 2 · Inspect Context

| 项目 | 内容 |
|---|---|
| Work Object | `MIS-041 r2` |
| 人的责任 | 检查Source、Freshness和Memory边界 |
| AI的责任 | 组装授权Context Snapshot |
| Evidence / Policy | Permission Snapshot `PERM-88` |
| 控制 | Remove、Correct、Add Source |
| 降级 | Restricted Source显示限制，不泄露内容或计数 |
| Artifact | Context Snapshot `CTX-041` |

### Step 3 · Review Plan

| 项目 | 内容 |
|---|---|
| Work Object | `ANL-118 · Analysis` |
| 人的责任 | 调整深度与优先级 |
| AI的责任 | 推荐基础、诊断和条件性步骤 |
| Evidence / Policy | 每个节点声明数据条件 |
| 控制 | Run、Skip、Reorder、Stop |
| 降级 | Forecast历史不足时标记Blocked |
| Artifact | Inspectable Plan |

### Step 4 · Read Evidence-backed Result

| 项目 | 内容 |
|---|---|
| Work Object | `ANL-118 r4` |
| 人的责任 | 判断Evidence是否足以支持业务结论 |
| AI的责任 | 组织Result和候选解释 |
| Evidence / Policy | `CLM-118 → EVD-118` |
| 控制 | Open Evidence、Challenge、Branch |
| 降级 | Attribution Partial不影响Verified KPI |
| Artifact | Analysis Document |

### Step 5 · Form Decision

| 项目 | 内容 |
|---|---|
| Work Object | `DEC-052 · Decision Record` |
| 人的责任 | 选择Option并承担Decision Ownership |
| AI的责任 | 组织Option、Trade-off和Impact |
| Evidence / Policy | Decision绑定使用的Claim Revision |
| 控制 | Select、Request More Evidence、Reject |
| 降级 | Evidence不足时保持Open，不包装成Recommendation |
| Artifact | Decision Record |

### Step 6 · Publish Artifact

| 项目 | 内容 |
|---|---|
| Work Object | `ART-052 r3 · Audience Brief` |
| 人的责任 | 批准发布内容和Audience |
| AI的责任 | 准备Narrative并运行一致性检查 |
| Evidence / Policy | Publication Gate绑定Revision与Evidence Snapshot |
| 控制 | Publish、Return to Draft、Create Branch |
| 降级 | Evidence Stale时旧Gate失效 |
| Artifact | Published Brief |

### Step 7 · Propose Action

| 项目 | 内容 |
|---|---|
| Work Object | `ACT-077 · Action Proposal` |
| 人的责任 | 决定是否授权进入Process |
| AI的责任 | 准备Target、Impact和Constraints |
| Evidence / Policy | Permission、Policy、Risk Preflight |
| 控制 | Prepare、Send for Approval、Cancel |
| 降级 | Denied保持Proposal，不进入Queue |
| Artifact | Action Preview与Handoff Envelope |

---

## 6. Reference Journey B · Process Journey：从流程异常到规则改进

### Step 1 · Advance Case

| 项目 | 内容 |
|---|---|
| Work Object | `CASE-204 · Process Case` |
| 系统责任 | 按当前Policy推进正常节点 |
| 人的责任 | 监控例外与抽检，不逐条监督 |
| Evidence / Policy | `POL-17 v6`、Permission Snapshot |
| 控制 | Pause、Takeover |
| 降级 | 无合法Policy时停止 |
| Artifact | Case State与Audit Timeline |

### Step 2 · Raise Exception

| 项目 | 内容 |
|---|---|
| Work Object | `CASE-204 · Exception EXC-19` |
| 系统责任 | 分类Exception并保存Work Done |
| 人的责任 | 确认是否需要开放调查 |
| Evidence / Policy | Failure、Inputs、Rule Evaluation |
| 控制 | Retry、Investigate、Takeover |
| 降级 | 未知原因明确显示Unknown |
| Artifact | Exception Brief |

### Step 3 · Create Investigation Mission

| 项目 | 内容 |
|---|---|
| Work Object | `MIS-044 · Investigation Mission` |
| 系统责任 | 创建授权Context Snapshot和Requested Decision |
| 人的责任 | 确认调查Scope |
| Evidence / Policy | Handoff Envelope `HOF-31` |
| 控制 | Accept Handoff、Narrow Scope、Return |
| 降级 | Restricted字段被裁剪并说明影响 |
| Artifact | Investigation Mission |

### Step 4 · Record Human Decision

| 项目 | 内容 |
|---|---|
| Work Object | `DEC-057` |
| AI责任 | 整理Evidence和Option |
| 人的责任 | 形成有Owner的Decision |
| Evidence / Policy | Decision不依赖尚不存在的新Rule |
| 控制 | Approve Decision、Request More Evidence |
| 降级 | 证据不足时选择人工处理当前Case |
| Artifact | Decision Record |

### Step 5 · Execute Current Case

| 项目 | 内容 |
|---|---|
| Work Object | `ACT-081` |
| 系统责任 | Preflight、重新校验、执行和记录 |
| 人的责任 | 在需要时Approve，不假定已经Executed |
| Evidence / Policy | 当前Policy、Permission、Target State |
| 控制 | Approve、Queue、Cancel、Compensate |
| 降级 | Target State变化后重新授权 |
| Artifact | Approval、Execution与Outcome Receipts |

### Step 6 · Propose Future Rule

| 项目 | 内容 |
|---|---|
| Work Object | `RPROP-204 · Rule Candidate` |
| 系统责任 | 从本次Decision准备Candidate和测试范围 |
| 人的责任 | 确认Owner、Scope和不可接受反例 |
| Evidence / Policy | Historical Replay、Conflict Scan、SoD |
| 控制 | Draft、Validate、Reject |
| 降级 | 单例不足时保留Candidate |
| Artifact | Rule Proposal |

### Step 7 · Stage and Observe

| 项目 | 内容 |
|---|---|
| Work Object | `RULE-204 v1` |
| 系统责任 | Shadow / Canary、Monitor、Kill Switch |
| 人的责任 | 独立Approve并决定Active范围 |
| Evidence / Policy | Validation Report和Change Approval |
| 控制 | Stage、Activate、Suspend、Rollback |
| 降级 | 指标恶化时自动Suspend并通知Owner |
| Artifact | Rule Change Receipt |

---

## 7. UIUX为什么是Human Control Layer

Enterprise AI真正的能力来自多层组合：

```text
Ontology与数据语义
        +
Context与企业知识
        +
Process与系统集成
        +
Models、Agents与Tools
        +
Identity、Permission与Governance
        ↓
Human Control Layer
        ↓
可理解、可控制、可恢复的业务结果
```

如果没有Human Control Layer：

- 用户看不见系统使用了什么；
- 治理只存在于后台日志；
- 正确的能力无法转化为信任；
- 自动化可能增加监督和返工；
- 业务结果难以持续复用。

因此，视觉和交互不是“让AI看起来更先进”，而是让企业能力真正可用的最后一公里。

---

## 8. 五分钟术语表

| Term | Plain-language说明 |
|---|---|
| Kernel | 所有Human–AI工作都共有的八类稳定对象 |
| Interaction Contract | 在一种工作模式下，人和系统分别负责什么 |
| Work Object | 可以保存、协作、追踪和审计的一份工作 |
| Artifact | 能脱离聊天独立使用的稳定产出 |
| Evidence | 能回到来源、方法、范围和限制的依据 |
| Gate | 针对特定版本执行的确定性检查 |
| Receipt | 证明依据、决定、授权、执行或结果发生了什么 |
| Revision | Work Object的不可变版本 |
| Branch | 不污染正式版本的追问、模拟或探索 |
| Handoff | 在不同类型工作对象之间传递Context和控制约束 |
| Autonomy | AI在当前Policy下可以建议、准备还是执行 |
| Degradation | 无法完成全部工作时，保留有效结果并说明下一步 |

---

## 9. 下一步阅读

- 想理解哪些架构边界不可改变：阅读[Canonical Charter](./ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md)。
- 想设计具体页面和交互：阅读[Pattern Specimen Library](./EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md)。
- 想直接体验Patch、Evidence、Gate、Action和Rule Proposal：打开[Interactive Reference](./index.html#/brief)。
