# EIX 2.0 Rev 0.5 Kernel & Interaction Decision Record

> Accepted Candidate · Revision 0.5 · 2026-07-27  
> Scope: Shared Experience Kernel、Work Result、Goal Resolution、Business Outcome、Action Lifecycle、Pattern Coverage

## 1. 为什么改

Rev 0.4同时把Kernel写成`Canonical sequence`和“非页面流程”，线上又使用横向Step式Trace。Outcome还同时代表分析输出与Action后的真实结果。这会让简单ChatBI被误解为必须继续形成Decision、Publication、Action与业务改善。

Rev 0.5不新增第二Kernel，而是修正同一Kernel的表达和数据契约。

## 2. 已锁定决定

1. Shared Experience Kernel是Canonical coverage与relationship model，不是Wizard、导航或进度条。
2. 具体任务通过Task Projection标记`Required / Conditional / Linked / Not Applicable`。
3. Work Result是由特定Work Object Revision产生的不可变、可引用Canonical Record。
4. Artifact是一个或多个Result的稳定、版本化包装；简单回答不强制创建Artifact。
5. Goal Resolution Assessment绑定Goal Revision，记录完成判断及其依据；用户离开不自动代表成功。
6. Business Outcome Receipt只来自真实Action或Process Event之后的System of Record。
7. Decision、Publication、Action与Business Outcome都是条件性扩展。
8. Action Workflow分别终止于`Succeeded`、`Partial`或`Failed`；界面不得把三者合并成一个状态节点；Compensation是引用原Action的新Action。
9. Business Outcome Receipt与Human Handoff是两个独立Pattern。
10. Pattern存在Renderer不等于Contract已验证；成熟度必须明确。

## 3. 关系模型

```text
Goal + Context
      ↓
Plan when needed
      ↓
Evidence-backed Work Result
      ↓
Goal Resolution Assessment

Optional:
Work Result → Artifact Revision
Work Result → Decision → Action → Business Outcome Receipt
Feedback → any governed record or proposal
```

## 4. Task Projection

| Task Shape | Required | Conditional | Linked | Not Applicable | 合法结束点 |
|---|---|---|---|---|---|
| Trustworthy Answer | Goal、Context、Evidence、Work Result、Goal Resolution | Plan | Feedback | Artifact、Decision、Action、Business Outcome | Result已交付，Goal criteria已评估；无需创建Artifact、Decision或Action。 |
| Analysis Artifact | Goal、Context、Evidence、Work Result、Goal Resolution、Artifact | Plan | Feedback | Decision、Action、Business Outcome | Artifact Revision稳定，来源Result与Evidence可追溯；是否发布由独立Publication lifecycle决定。 |
| Decision Support | Goal、Context、Evidence、Work Result、Goal Resolution、Decision | Plan、Artifact | Feedback | Action、Business Outcome | Decision由Owner确认并引用稳定Result；Recommendation不得伪装成Decision。 |
| Controlled Action | Goal、Context、Evidence、Work Result、Goal Resolution、Decision、Action | Plan、Artifact | Business Outcome、Feedback | — | Action结束于Succeeded、Partial或Failed；Business Outcome作为关联记录另行观察。 |
| Process Case | Goal、Context、Plan、Evidence、Work Result、Goal Resolution | Artifact、Decision、Action | Business Outcome、Feedback | — | Case达到合法终态或进入可见的Exception / Takeover；Rule Proposal拥有独立生命周期。 |

Task Projection只映射共享记录；Case State、Policy、Exception与Handoff由Process Contract补充。

## 5. Pattern成熟度

| Maturity | 声明边界 |
|---|---|
| Canonical Listed | 只有目录身份与不可变量 |
| Specified | 完成Anatomy、轴、状态、失败、恢复与验收；可提供Static Anatomy Reference |
| Behavioral Specimen | 至少证明一条主要行为、一个失败或降级和一个恢复路径 |
| Validated Pattern | 自动契约测试与真实Reader/User证据通过 |

Gate、Action、Branch、Handoff、Feedback与Recovery等高风险Pattern必须至少达到Behavioral Specimen，才能称为`契约模拟`。

## 6. 被拒绝的替代方案

- 保留顶部八步Kernel Trace；
- 把Result包装成第九个强制步骤；
- 将用户离开自动解释为Goal Resolved；
- 将Action Succeeded自动解释为Business Outcome；
- 用状态按钮、Renderer数量或截图数量宣称Pattern已验证；
- 将Outcome Receipt与Human Handoff继续共用一个Work Object或Lifecycle。

## 7. 验收不变量

- Trustworthy Answer可以在没有Decision、Artifact、Action和Business Outcome时合法结束。
- Work Result、Artifact、Goal Resolution Assessment和Business Outcome Receipt使用不同类型与ID。
- 每类独立状态拥有显式Field ID；Evidence、Permission、Autonomy和Workflow不得共享一个状态槽。
- Journey明确标注合法停止点、条件分支和Typed Object Handoff。
- Reader百分比在没有样本证据时显示`Target · Not yet measured`。
- Canonical Pattern目录的每一项都有Coverage与Maturity状态，允许Pending，不允许静默缺失。

## 8. Reference Site的信息架构

- 架构总览图与左侧目录表达同一个模型，不是两套架构。
- `L1–L5`分别展开Foundation、Kernel、Interaction Contract、Canonical Surfaces与Experience Outcomes。
- `X1–X3`表示对象关系、三个判断与治理生命周期等跨层机制，不能冒充第六、第七层。
- `A1`是应用分类，用来展示Collaborative Intelligence的任务家族，不拥有Canonical层级。
- 点击总览中的层或跨层机制必须定位到对应章节；滚动正文时，总览图与左侧目录同步显示当前位置。
