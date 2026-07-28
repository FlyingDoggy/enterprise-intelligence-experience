# EIX 2.0 Consolidation Decision Record

> Consolidated Candidate · Revision 0.4 · 2026-07-26  
> Decision owner: EIX Product / Experience Owner  
> Inputs: EIX Rev 0.3、`GAX-Design-Principles-2.0.html`、`GAX-Design-System.html`

## 1. 目标

把两套设计收敛为一个可继续维护、可验证、可部署的工程：

- 保留EIX Rev 0.3已经验证的Canonical架构、结构化Registry、Token生成、独立交互示例与自动化测试；
- 吸收GAX最新版中更清楚的管理层叙事、Foundation表达、等待与澄清规则、能力边界、反馈信号和采用路径；
- 不保留第二套站点、第二套Kernel或混合生命周期；
- 不复制GAX HTML/CSS/JavaScript作为生产实现，所有合并内容按EIX契约重新实现。

## 2. 合并起点（Rev 0.3）

| 项目 | 已验证事实 |
|---|---|
| Canonical来源 | 一个Shared Experience Kernel、两种Interaction Contract |
| Work Object | Root维持Goal连续性，Typed Child Object拥有独立State与Revision |
| 生命周期 | Publication、Action、Rule Change三套独立生命周期 |
| 语义轴 | Claim、Evidence、Uncertainty、Risk、Permission、Autonomy、Workflow互不推出 |
| Design System | 10 Foundations、9 Primitives、30 Components与独立交互示例 |
| UX Guidance | 8个Shared Pattern、3个Process Composition、3个Collaborative Composition |
| 工程边界 | 静态参考实现；不连接LLM、数据库、权限服务或外部动作 |
| 验证 | Registry、Token、ARIA、键盘、响应式、视觉与治理状态均有自动检查 |

## 3. 不变量

| 不变量 | 处理 |
|---|---|
| `Goal → Context → Plan → Evidence → Decision → Action → Outcome → Feedback`是唯一Kernel | 保留 |
| Patch、Gate、Receipt、Revision与Handoff是机制，不是Kernel节点 | 保留 |
| Process Intelligence与Collaborative Intelligence通过关联对象Handoff，不共享可变对象 | 保留 |
| Publication、Action、Rule Change不得共用状态机 | 保留 |
| Verified不等于Allowed或Auto；Approved不等于Executed | 保留 |
| 单次人工判断只能产生Rule Candidate | 保留 |
| Core Component不拥有业务Lifecycle | 保留 |

## 4. 合并裁决

### 4.1 直接吸收

| GAX内容 | 合并位置 | 原因 |
|---|---|---|
| “模型能力趋同，体验差异来自采纳、可核对与可恢复” | Experience Narrative与Acceptance | 把UI/UX价值从审美陈述变成可测量业务判断 |
| 完整色阶与Light / Dark模式 | Core Design System Token与Color Foundation | 当前Rev 0.3只有主题，没有真正模式 |
| 标题、正文、数据、Audit ID四种文字材质 | Typography Foundation | 强化工作底稿与可追溯对象的视觉区分 |
| 表单错误说明“哪里错、为什么、怎么改” | Form Component规范 | 比“输入无效”更可执行 |
| 澄清预算 | Intent / Change Preview | 限制连续追问，保持任务推进 |
| 长任务等待规则 | Plan & Progress | 用真实节点、可取消和部分结果替代伪倒计时 |
| Agent能力声明中的Scope、Action白名单、Reversibility、Receipt与Escalation | Capability & Scope Receipt | 让界面能在渲染Action前判断所需控制 |
| 四条Reference Flow | UX Guidance Overview | 帮助读者从问题选择Pattern组合 |
| 行为反馈信号 | Acceptance与Guidance | 让“感受”具有可观测证据 |
| 分阶段采用路径 | Acceptance | 自主权随可核对性逐步提升 |

### 4.2 改写后吸收

| GAX主张 | 问题 | EIX改写 |
|---|---|---|
| UI是把模型准确转成用户负责的“唯一一层” | Ontology、Data、Policy和组织责任同样决定采纳 | UI/UX是Human Control Layer：把底层治理转成可见、可理解、可操作的体验 |
| 十个共享原语是一根新脊柱 | 会与Canonical Kernel竞争 | Intent、Patch、Plan、Receipt、Gate与Branch作为作用于Kernel对象的机制 |
| 发布门禁与动作门禁是同一个原语 | 可共享视觉骨架，但Subject、检查项和生命周期不同 | 共享Gate Anatomy；Publication Gate、Action Gate、Rule Gate保持独立 |
| Evidence等级与Autonomy车道使用同一颜色映射 | 会让Verified看起来等于Auto | 每个Badge始终显示轴名称；Evidence、Risk、Permission、Autonomy分别编码 |
| 高置信、低风险可直接执行并Undo | Confidence不能覆盖Permission、Policy或不可逆性 | 只有Allowed、Policy内、低风险、可恢复且Action Contract允许时才可自动推进 |
| 一次人工判断“晋升为规则” | 容易被理解为立即生效 | 只创建Rule Candidate；Replay、冲突扫描、SoD、Stage和Monitor后才可能Active |
| 按钮层级由风险决定 | 视觉强调与风险是两个维度 | `emphasis`决定主次，`risk/reversibility`决定确认、文案与Gate |
| 视觉禁止清单全部绝对化 | 不同业务上下文可能有合法例外 | 作为EIX工作底稿主题的默认约束；Core只保留可访问性与语义正确性硬规则 |

### 4.3 明确拒绝

| 拒绝项 | 原因 |
|---|---|
| Document与Case在两个Contract中共用同一对象或同一状态机 | 会把分析、发布、执行与恢复状态混在一起 |
| `draft / verified / published / executing / executed`混成一套Lifecycle | 产生非法跨状态转移，无法正确审计 |
| Verified直接映射Auto，低Confidence直接映射Human Required | Evidence、Confidence、Permission、Risk与Autonomy不是同一轴 |
| 分析Result与外部Action作为同一个产出类型 | Result不改变外部状态，Action需要权限、政策、执行与Outcome |
| 默认“先跑并标假设”适用于所有低置信场景 | 对越权、范围变化、高风险或不可逆任务不安全 |
| 自动化占比或规则覆盖率作为单一北极星 | 可能掩盖误执行、未知分母、恢复债务与接管能力下降 |
| 直接复用GAX单文件HTML/CSS/JavaScript | 缺少Registry、状态契约、覆盖测试与可维护边界 |

## 5. 三个审查视角

### 5.1 架构与泛化

- **P0：** GAX的共享对象与混合生命周期会破坏EIX已经冻结的Typed Work Object边界，拒绝。
- **P1：** Capability Contract值得吸收，但只能作为版本化Capability Snapshot与Action Preflight输入，不能成为第二套授权系统。
- **P1：** 四条Flow适合帮助选择Pattern，但不能替换Kernel。
- **P2：** “十个原语”可作为教学对照，不进入Canonical词汇表。

### 5.2 语义正确性与治理

- **P0：** Evidence、Confidence、Risk、Permission和Autonomy共色共级会产生错误推断，必须拆轴。
- **P0：** Rule Promotion必须停在Candidate，直到Rule Change Gate完成。
- **P1：** 长任务取消必须保留已完成Result与Evidence；Action取消需区分尚未Queued、正在Executing和需要Compensation。
- **P1：** 反馈信号必须绑定用途、对象、时间和保留规则，不能把所有点击当“模型训练数据”。

### 5.3 产品与交付

- **P1：** GAX Narrative更容易让管理层理解“为什么UI/UX重要”，应吸收其可证伪和可测量结构。
- **P1：** GAX Color Ramp、Light/Dark、Form Error、Waiting示例能显著提高Design System的可用性。
- **P1：** 当前EIX组件覆盖更完整，GAX静态组件样例不能替代现有独立交互示例。
- **P2：** “感受就是产品”适合作为候选表达，不作为Canonical定义或全站口号。

## 6. 最终工程边界

```text
Canonical Charter
  └─ Kernel · Contract · Work Object · Semantic Axes · Lifecycles

EIX Core Design System
  └─ Token · Foundation · Primitive · Component · Light/Dark · Theme

Intelligence UX Guidance
  └─ Shared Patterns · Process · Collaborative · Handoff
       ├─ Clarification budget
       ├─ Long-running work
       ├─ Capability & Scope Receipt
       └─ Governed Reference Flows

Experience Narrative / Journeys / Acceptance
  └─ Value story · observable signals · adoption path · reader tests
```

## 7. 交付切片

| 顺序 | 可验证结果 | 验收 |
|---|---|---|
| 1 | Rev 0.3只读归档与Rev 0.4身份 | 旧版本可独立打开，新版无身份混用 |
| 2 | Token支持Theme × Light/Dark Mode | 四种组合无缺失Token、对比度通过 |
| 3 | Color Foundation展示完整色阶与语义角色 | 组件只消费Semantic / Component Token |
| 4 | S02补充澄清预算，S03补充长任务契约 | 不连续追问；取消保留已完成结果 |
| 5 | 新增Capability & Scope Receipt | Scope、Actions、Permission、Autonomy、Risk可独立检查 |
| 6 | Guidance新增四条纠正后的Reference Flow | Handoff创建关联对象；Rule只产生Candidate |
| 7 | Acceptance新增体验观测信号与采用路径 | 指标成对解释，不以单一自动化率判定成功 |
| 8 | 全量回归与ECS发布 | Registry、状态、键盘、多视口、暗色、Console和线上Smoke全部通过 |

## 8. 合并结果

Rev 0.4最终工程包含：

- 1个Canonical Charter、1个Experience Narrative、1个Core Design System与1个Intelligence UX Guidance；
- 64个Registry Entry；
- 139个Token与4种Theme × Mode组合；
- 10个Foundation、9个Primitive、30个Core Component；
- 9个Shared Pattern、3个Process Composition、3个Collaborative Composition；
- 30个Component与15个Guidance Pattern的一对一Live Specimen；
- 4条Governed Reference Flow；
- Rev 0.1、Rev 0.2与Rev 0.3只读归档。

Registry、Token、语义、键盘、多视口、Dark Mode、Markdown和治理状态的自动化回归结果见`verification/REV_0.4_VERIFICATION.md`。

## 9. 重新打开条件

以下条件出现时再评估生产组件包或Canonical变更：

- 至少两个真实项目使用同一Capability Snapshot或Flow Contract；
- 真实权限、Policy、Action与Outcome系统提供稳定API；
- Dark Mode有真实业务消费者，而不只是参考站预览；
- Reader Testing发现现有Kernel或Contract无法解释真实场景；
- EIX Product / Experience Owner明确批准将Candidate内容晋升为标准。
