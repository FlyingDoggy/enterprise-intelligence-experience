# EIX 2.0 中文文案统一提案

> 状态：待确认，不影响当前网站  
> 范围：当前版本的静态站点与根目录 Markdown  
> 不包含：`archive/rev-*` 历史归档、代码标识符、URL 和文件路径  
> 审计日期：2026-07-27

## 1. 审计结论

当前站点同时使用中文、英文术语、英文状态值和英文页面结构标签。单个概念经常出现三种表达，例如：

- `Shared Experience Kernel`、`Kernel`、共享工作模型；
- `Pattern`、交互 Pattern、模式；
- `Evidence`、依据、证据；
- `Action`、行动、执行；
- `Design System`、核心设计系统。

这不是单纯的排版问题。读者需要在阅读业务概念的同时完成术语翻译，理解成本被分散到语言切换上。

本次浏览器审计覆盖：

| 内容 | 数量 |
|---|---:|
| 一级页面 | 6 |
| 当前可访问路由 | 61 |
| 设计系统条目 | 49 |
| 智能协作体验模式 | 17 |
| 参考旅程 | 3 |
| 验收协议 | 8 |
| 含拉丁字母的可见文本片段 | 1,801 |
| 中英文混排文本片段 | 335 |
| 纯英文可见文本片段 | 1,466 |

上述 1,801 个片段包含稳定编号、代码示例和标准缩写，并不代表全部都要翻译。实施时应按本提案区分“用户文案”和“技术标识”。

## 2. 中文化原则

### 2.1 用户可见内容

以下内容全部使用中文：

- 全站导航、页面名称和文档身份；
- 标题、正文、图例、分组名称和解释文字；
- 按钮、筛选器、菜单、表单标签和错误提示；
- 状态名称、流程步骤、生命周期和校验结果；
- 设计系统目录、组件名称和体验模式名称；
- 交互示例中的业务内容；
- Markdown 正文。

### 2.2 可以保留英文的内容

| 类型 | 保留示例 | 原因 |
|---|---|---|
| 产品简称 | `EIX` | 稳定项目标识 |
| 结构编号 | `L1`、`X2`、`S04`、`P01`、`C03`、`A08` | 用于深链接和跨文档引用 |
| 对象编号 | `ROOT-018`、`ART-052`、`TRACE-9C21` | 审计和追踪标识 |
| 技术标准 | `HTML`、`CSS`、`JavaScript`、`Markdown`、`UTF-8`、`WCAG`、`ARIA` | 标准或语言专名 |
| 包名与代码 | `@eix/ui`、`semantic.text.primary`、`aria-label` | 必须与实现保持一致 |
| 产品与框架名 | `React`、`Vite`、`ECharts` | 外部产品专名 |
| 代码示例中的值 | `variant="primary"` | 参考标记必须保持真实 |

`AI`、`UX`、`Design System`、`Pattern`、`Component`、`Token`、`Workflow` 等均有清晰中文表达，不进入保留名单。

### 2.3 展示与搜索分离

目录和页面标题显示中文。原英文名称保留为不可见搜索别名，使用户仍可搜索 `Button`、`Pattern` 或 `Evidence`，但页面不再同时显示两套名称。

## 3. 十个核心术语决策

这十项会影响全站所有页面，建议先确认。

| 当前表达 | 建议统一为 | 不再使用 | 选择理由 |
|---|---|---|---|
| `Shared Experience Kernel` / `Kernel` | 共享工作模型 | 内核、共用骨架、八步流程 | 直接说明它是一组可按任务组合的工作记录与关系 |
| `Interaction Contract` | 人机协作约定 | Contract、模式 | 强调责任和控制边界，不暗示法律合同 |
| `Process Intelligence` | 流程智能 | Process、流程 AI | 中文清晰且保留类别含义 |
| `Collaborative Intelligence` | 协作智能 | Collaborative、聊天模式 | 覆盖分析、研究、规划、创作和决策支持 |
| `Work Object` | 工作对象 | Object、任务容器 | 保留对象身份、负责人、状态和修订关系 |
| `Work Result` / `Result` | 工作结果 | Result、输出 | 与“业务成效”区分 |
| `Artifact` | 可版本化成果 | Artifact、产物 | 明确可评审、发布、分支和交接的特征 |
| `Goal Resolution` | 目标完成判断 | Resolution、目标解决状态 | 说明它是一次判断，不是业务成效 |
| `Business Outcome` | 业务成效 | Outcome、业务结果 | 仅用于外部事实证明的真实变化 |
| `Pattern` | 交互模式 | Pattern、模板 | 表达可复用的人机协作结构 |

## 4. 其余领域术语对照

### 4.1 工作与治理

| 当前表达 | 建议文案 |
|---|---|
| `Goal` | 目标 |
| `Context` | 上下文 |
| `Plan` | 计划 |
| `Evidence` | 依据 |
| `Claim` | 结论陈述 |
| `Decision` | 决策 |
| `Action` | 业务操作 |
| `Feedback` | 反馈 |
| `Owner` | 负责人 |
| `Audience` | 受众 |
| `Scope` | 范围 |
| `Constraint` | 约束 |
| `Freshness` | 数据时效 |
| `Revision` | 修订版本 |
| `Branch` | 工作分支 |
| `Trace ID` | 追踪编号 |
| `Receipt` | 系统回执 |
| `Gate` | 校验 |
| `Handoff` | 工作交接 |
| `Capability Snapshot` | 能力快照 |
| `Permission` | 权限 |
| `Policy` | 管控策略 |
| `Autonomy` | 人工智能可推进范围 |
| `Risk & Reversibility` | 风险与可恢复性 |
| `Workflow State` | 工作状态 |
| `System of Record` | 业务记录系统 |
| `Exception` | 异常 |
| `Takeover` | 人工接管 |
| `Recovery` | 恢复 |
| `Compensation` | 补偿操作 |
| `Case` | 流程事项 |
| `Mission` | 协作任务 |
| `Analysis` | 分析任务 |
| `Root Work Object` | 根工作对象 |

### 4.2 设计系统

| 当前表达 | 建议文案 |
|---|---|
| `Design System` | 设计系统 |
| `Core Design System` | 核心设计系统 |
| `Token` | 设计变量 |
| `Foundation` | 基础规范 |
| `Primitive` | 布局基础件 |
| `Component` | 通用组件 |
| `Variant` | 变体 |
| `State` | 状态 |
| `Live Specimen` | 交互示例 |
| `Reference Markup` | 参考标记 |
| `Fixture` | 示例数据 |
| `Responsive` | 响应式规则 |
| `Accessibility` | 无障碍要求 |
| `Do / Don’t` | 推荐做法 / 避免做法 |
| `Maturity` | 成熟度 |
| `Catalog` | 目录 |
| `Theme` | 主题 |
| `Mode` | 明暗模式 |
| `Light` / `Dark` | 浅色 / 深色 |
| `Neutral` | 中性主题 |

## 5. 全站框架文案

### 5.1 顶部导航

| 当前文案 | 建议文案 |
|---|---|
| `Enterprise Intelligence Experience` | 企业智能体验 |
| `Human–AI Work Architecture · Rev 0.5` | 人机协作架构 · 修订 0.5 |
| `5分钟` | 5分钟导读 |
| `架构` | 规范架构 |
| `Design System` | 设计系统 |
| `UX Guidance` | 体验规范 |
| `Journeys` | 参考旅程 |
| `验收` | 验收标准 |
| `REV 0.5` | 修订 0.5 |
| `MODE · LIGHT` | 明暗模式 · 浅色 |
| `MODE · DARK` | 明暗模式 · 深色 |

品牌标记 `EI` 建议改为 `EIX`，作为允许保留的项目简称。

### 5.2 左侧文档区

| 当前文案 | 建议文案 |
|---|---|
| `DOCUMENT SUITE` | 文档套件 |
| `Experience Narrative` | 体验说明 |
| `Canonical Architecture` | 规范架构 |
| `EIX Core Design System` | EIX 核心设计系统 |
| `Intelligence UX Guidance` | 智能协作体验规范 |
| `Reference Journeys` | 参考旅程 |
| `Experience Acceptance` | 体验验收 |
| `CANONICAL` | 规范 |
| `COMPANION` | 配套说明 |
| `CANDIDATE STANDARD` | 候选标准 |
| `CANDIDATE COMPANION` | 候选配套规范 |
| `SOURCE OF TRUTH` | 规范来源 |
| `DOCUMENT MAP` | 文档地图 |

### 5.3 右侧信息栏

| 当前文案 | 建议文案 |
|---|---|
| `CURRENT VIEW` | 当前页面 |
| `DENSITY` | 阅读模式 |
| `NON-NEGOTIABLE` | 不可变规则 |
| `THREE CHECKS` | 三个判断 |
| `Experience Narrative` | 体验说明 |
| `Canonical Charter` | 架构章程 |
| `Core Design System` | 核心设计系统 |
| `Two Intelligence Contracts` | 两种人机协作约定 |
| `Controlled Handoffs` | 受控工作交接 |
| `Experience Gate` | 体验验收 |

### 5.4 页脚与文档阅读器

| 当前文案 | 建议文案 |
|---|---|
| `One canonical architecture. Multiple governed experiences.` | 一套规范架构，支持多种受控智能体验。 |
| `Read Canonical Charter` | 阅读架构章程 |
| `Document Reader` | 文档阅读器 |
| `CANONICAL SOURCE` | 规范原文 |
| `Rendered from Markdown · UTF-8` | 由 Markdown 原文渲染 · UTF-8 |
| `SOURCE FILE` | 原文文件 |
| `ON THIS PAGE` | 本页目录 |
| `Loading document…` | 正在加载文档…… |

## 6. 一级页面标题对照

### 6.1 5分钟导读

| 当前文案 | 建议文案 |
|---|---|
| 企业 `AI` 的工作界面，让目标、依据、责任和下一步始终可见。 | 企业人工智能工作界面，让目标、依据、责任和下一步始终可见。 |
| 六项体验承诺，让状态、风险和下一步清晰可见。 | 保留 |
| 稳定的 `Work Object`，让对话后的任务继续推进。 | 稳定的工作对象，让对话结束后的任务继续推进。 |
| 四个入口对应架构规则、界面构件、场景指导与完整工作路径。 | 四个入口分别对应架构规则、设计系统、场景规范和完整工作路径。 |
| `ONE EXPERIENCE · TWO CONTRACTS · ONE HUMAN CONTROL LAYER` | 一套体验 · 两种协作约定 · 同一套人工控制原则 |
| `HUMAN CONTROL LAYER` | 人工控制层 |
| `What must become visible` | 界面必须持续显示什么 |
| 一个聪明的 `Chat` | 一个看起来聪明的对话框 |
| 一个稳定的 `Work Object` | 一个可持续的工作对象 |

六项体验承诺统一为：

| 当前 | 建议 |
|---|---|
| `Clarity` | 清晰 |
| `Trust` | 可信 |
| `Control` | 掌控 |
| `Momentum` | 推进 |
| `Continuity` | 连续 |
| `Calm` | 从容 |

### 6.2 规范架构

| 当前文案 | 建议文案 |
|---|---|
| 一个共享工作模型。两种 `Contract`。按任务深度展开。 | 一个共享工作模型，两种人机协作约定，按任务深度展开。 |
| 两种协作契约分别定义发起、判断、推进与停止责任。 | 两种人机协作约定分别定义发起、判断、推进与停止责任。 |
| 稳定工作界面承载 `Case`、`Mission`、`Analysis` 与 `Decision`。 | 标准工作界面承载流程事项、协作任务、分析与决策。 |
| 一个 `Goal` 关联多个拥有独立状态的工作对象。 | 一个目标关联多个拥有独立状态的工作对象。 |
| 发布、行动和规则变更分别治理。 | 发布、业务操作和自动化规则变更分别治理。 |
| `Collaborative Intelligence` 覆盖分析、研究、规划、创作与决策支持。 | 协作智能覆盖分析、研究、规划、创作与决策支持。 |
| `THE SOURCE OF TRUTH` | 规范来源 |
| `CROSS-LAYER MECHANISMS` | 跨层共同机制 |

五层架构统一为：

| 编号 | 当前文案 | 建议文案 |
|---|---|---|
| L1 | `Enterprise Intelligence Foundation` | 企业智能基础 |
| L2 | `Shared Experience Kernel` | 共享工作模型 |
| L3 | `Interaction Contracts` | 人机协作约定 |
| L4 | `Canonical Surfaces` | 标准工作界面 |
| L5 | `Experience Outcomes` | 体验结果 |

任务类型统一为：

| 当前文案 | 建议文案 |
|---|---|
| `Trustworthy Answer` | 可信回答 |
| `Analysis Artifact` | 分析成果 |
| `Decision Support` | 决策支持 |
| `Controlled Action` | 受控业务操作 |
| `Process Case` | 流程事项 |

任务地图状态统一为：

| 当前文案 | 建议文案 |
|---|---|
| `Required` | 必需 |
| `Conditional` | 按需 |
| `Linked` | 关联 |
| `Not Applicable` / `N/A` | 不适用 |
| `Legal Stop` | 合法停止点 |

两种人机协作约定统一为：

| 当前文案 | 建议文案 |
|---|---|
| `Process` | 流程智能 |
| `Collaborative` | 协作智能 |
| `SYSTEM-LED · STATE-DRIVEN · EXCEPTION-FIRST` | 系统主导 · 状态驱动 · 异常优先 |
| `HUMAN-LED · GOAL-DRIVEN · RESULT-FIRST` | 人工主导 · 目标驱动 · 结果优先 |
| `PRIMARY WORK OBJECT` | 主要工作对象 |
| `SYSTEM DEFAULT` | 系统默认负责 |
| `HUMAN DEFAULT` | 人工默认负责 |
| `MUST BE VISIBLE` | 必须显示 |

流程智能步骤统一为：

| 当前文案 | 建议文案 |
|---|---|
| `Event` | 事件 |
| `Interpret` | 理解 |
| `Validate` | 校验 |
| `Decide` | 判断 |
| `Prepare` | 准备 |
| `Approve` | 审批 |
| `Execute` | 执行 |
| `Verify` | 核验 |
| `Recover` | 恢复 |
| `WHEN REQUIRED` | 需要时 |
| `EXCEPTION PATH` | 异常处理路径 |

协作智能步骤统一为：

| 当前文案 | 建议文案 |
|---|---|
| `Frame` | 明确目标 |
| `Context` | 检查上下文 |
| `Produce Result` | 生成工作结果 |
| `Assess Goal` | 评估目标 |
| `Stop / Continue` | 结束或继续 |
| `Optional Artifact / Decision / Action` | 可选：版本化成果、决策或业务操作 |

### 6.3 设计系统

| 当前文案 | 建议文案 |
|---|---|
| 统一 `Token`、布局、组件状态和无障碍要求，支持不同 `Enterprise AI` 场景。 | 统一设计变量、布局、组件状态和无障碍要求，支持不同企业人工智能场景。 |
| 业务 `Pattern` 复用 `Core Component`，基础组件不持有业务生命周期。 | 业务交互模式复用通用组件，基础组件不承载业务生命周期。 |
| 从值到页面组合的可检查目录。 | 从设计变量到页面组合的可检查目录。 |
| 中性内核，`EIX` 是第一套主题。 | 核心能力保持中性，EIX 是首个主题。 |
| 当前交付是实现参考和验收契约，尚未发布生产组件包。 | 当前交付为实现参考与验收规范，尚未发布生产组件包。 |
| `REFERENCE RENDERER` | 参考页面 |
| `STATIC` | 静态 |
| `Spec Rev 0.5 · No package API` | 规范修订 0.5 · 尚无组件包接口 |

### 6.4 智能协作体验规范

| 当前文案 | 建议文案 |
|---|---|
| `Core Design System` 定义通用界面构件，`UX Guidance` 定义企业 `AI` 协作规则。 | 设计系统定义通用界面构件，体验规范定义企业人工智能如何协作。 |
| 工作问题决定 `Kernel` 记录与 `Pattern` 组合。 | 工作问题决定共享工作记录与交互模式组合。 |
| 统一 `Pattern` 结构覆盖对象、状态、权限、失败和恢复。 | 统一交互模式结构覆盖对象、状态、权限、失败和恢复。 |
| `Pattern` 成熟度分为登记、规范、行为参考与真实验证。 | 交互模式成熟度分为已收录、已定义、行为示例和真实验证。 |
| `Process Intelligence` | 流程智能 |
| `Collaborative Intelligence` | 协作智能 |
| `Cross-contract Handoff` | 跨场景交接 |

### 6.5 参考旅程

| 当前文案 | 建议文案 |
|---|---|
| 工作交接保留目标、依据、责任与控制边界。 | 保留 |
| 交接包携带目标、上下文、依据、待决问题和可用操作。 | 保留 |
| `Current Journey` | 当前旅程 |
| `Handoff State` | 交接状态 |
| `Optional Trigger` | 可选触发条件 |
| `Root & Trace` | 根任务与追踪编号 |
| `From Revision` | 来源修订版本 |
| `To Type` | 目标对象类型 |
| `Decision Owner` | 决策负责人 |
| `Policy & Permission` | 管控策略与权限 |
| `Return Contract` | 返回约定 |

### 6.6 验收标准

| 当前文案 | 建议文案 |
|---|---|
| `Enterprise AI` 体验通过八项 `Gate` 与读者测试验收。 | 企业人工智能体验通过八项验收协议与读者测试验证。 |
| `TEST PROTOCOL` | 验收协议 |
| `GIVEN` | 前提 |
| `WHEN` | 操作 |
| `THEN` | 预期 |
| `EVIDENCE` | 验收依据 |
| `THRESHOLD` | 通过标准 |
| `OWNER` | 负责人 |
| `NOT YET MEASURED` | 尚未实测 |
| `READER TESTING` | 读者测试 |
| `EXPERIENCE SIGNALS` | 体验指标 |
| `LEADING` | 过程指标 |
| `OUTCOME` | 结果指标 |

## 7. 设计系统目录对照

### 7.1 基础规范

| 路由标识 | 当前名称 | 建议名称 |
|---|---|---|
| `color` | `Color` | 色彩 |
| `typography` | `Typography` | 字体 |
| `spacing-density` | `Spacing & Density` | 间距与密度 |
| `layout-breakpoints` | `Layout & Breakpoints` | 布局与断点 |
| `borders-radius` | `Borders & Radius` | 边框与圆角 |
| `elevation` | `Elevation` | 层级 |
| `motion` | `Motion` | 动效 |
| `iconography` | `Iconography` | 图标 |
| `data-display` | `Data Display` | 数据表达 |
| `accessibility-localization` | `Accessibility & Localization` | 无障碍与本地化 |

### 7.2 布局基础件

| 路由标识 | 当前名称 | 建议名称 |
|---|---|---|
| `surface` | `Surface` | 内容容器 |
| `stack` | `Stack` | 纵向排列 |
| `inline` | `Inline` | 横向排列 |
| `grid` | `Grid` | 网格布局 |
| `cluster` | `Cluster` | 自适应分组 |
| `scroll-area` | `Scroll Area` | 滚动区域 |
| `focus-ring` | `Focus Ring` | 焦点指示 |
| `visually-hidden` | `Visually Hidden` | 视觉隐藏内容 |
| `overlay-portal` | `Overlay / Portal` | 浮层与挂载点 |

### 7.3 通用组件

| 路由标识 | 当前名称 | 建议名称 |
|---|---|---|
| `text` | `Text` | 文本 |
| `heading` | `Heading` | 标题 |
| `link` | `Link` | 链接 |
| `button` | `Button` | 按钮 |
| `icon-button` | `Icon Button` | 图标按钮 |
| `badge` | `Badge` | 徽标 |
| `callout` | `Callout` | 提示框 |
| `card` | `Card` | 卡片 |
| `divider` | `Divider` | 分隔线 |
| `tabs` | `Tabs` | 标签页 |
| `segmented-control` | `Segmented Control` | 分段选择器 |
| `disclosure` | `Disclosure` | 展开收起 |
| `tooltip` | `Tooltip` | 悬浮提示 |
| `menu` | `Menu` | 菜单 |
| `dialog` | `Dialog` | 对话框 |
| `drawer` | `Drawer` | 抽屉 |
| `text-field` | `Text Field` | 单行输入框 |
| `textarea` | `Textarea` | 多行输入框 |
| `select` | `Select` | 下拉选择 |
| `checkbox` | `Checkbox` | 复选框 |
| `switch` | `Switch` | 开关 |
| `table` | `Table` | 表格 |
| `progress` | `Progress` | 进度条 |
| `spinner` | `Spinner` | 加载指示 |
| `skeleton` | `Skeleton` | 骨架屏 |
| `empty-state` | `Empty State` | 空状态 |
| `toast` | `Toast` | 短时通知 |
| `header` | `Header` | 页头 |
| `sidebar` | `Sidebar` | 侧边栏 |
| `application-shell` | `Application Shell` | 应用框架 |

### 7.4 组件详情页固定结构

| 当前文案 | 建议文案 |
|---|---|
| `Purpose` | 用途 |
| `Usage` | 使用方式 |
| `Anatomy` | 结构 |
| `Live Specimen` | 交互示例 |
| `Variants` | 变体 |
| `States` | 状态 |
| `Reference Markup` | 参考标记 |
| `Tokens` | 设计变量 |
| `Responsive` | 响应式规则 |
| `Accessibility` | 无障碍要求 |
| `Do / Don’t` | 推荐做法 / 避免做法 |
| `Related` | 相关内容 |
| `Real viewport` | 真实视口 |
| `Reset` | 重置 |
| `Copy` / `Copied` | 复制 / 已复制 |
| `CURRENT RESOLVED MODEL` | 当前有效配置 |

代码块中的属性名、元素名和真实值保持英文。交互控件显示中文标签，但继续提交原英文值。

## 8. 智能协作体验模式对照

| 编号 | 当前名称 | 建议名称 |
|---|---|---|
| S01 | `Goal & Context Header` | 目标与上下文页头 |
| S02 | `Intent / Change Preview` | 意图与变更预览 |
| S03 | `Plan & Progress` | 计划与进度 |
| S04 | `Evidence Receipt` | 依据回执 |
| S05 | `Decision Record` | 决策记录 |
| S06 | `Publication Gate` | 发布校验 |
| S07 | `Action Preview & Authorization` | 业务操作预览与授权 |
| S08 | `Business Outcome Receipt` | 业务成效回执 |
| S09 | `Capability & Scope Receipt` | 能力与范围回执 |
| S10 | `Human Handoff / Work Transfer` | 人工交接与工作移交 |
| S11 | `Work Result & Goal Resolution` | 工作结果与目标完成判断 |
| P01 | `Exception-first Console` | 异常优先处理台 |
| P02 | `Rule Proposal & Change Approval` | 自动化规则提案与变更审批 |
| P03 | `Recovery & Rollback Workspace` | 恢复与回退工作台 |
| C01 | `Mission Workspace` | 协作任务工作台 |
| C02 | `Analysis / Research Document` | 分析与研究文档 |
| C03 | `Audience Brief & Revision History` | 受众简报与修订历史 |

### 8.1 模式详情页固定结构

| 当前文案 | 建议文案 |
|---|---|
| `Purpose & User Fear` | 用途与用户顾虑 |
| `Applicable Contract` | 适用的人机协作约定 |
| `Work Object & Owner` | 工作对象与负责人 |
| `Fixed Regions` | 固定区域 |
| `Optional Regions` | 可扩展区域 |
| `Semantic Axes` | 独立状态字段 |
| `Permission & Autonomy` | 权限与人工智能可推进范围 |
| `Failure` | 失败 |
| `Degradation` | 降级 |
| `Recovery` | 恢复 |
| `Responsive` | 响应式规则 |
| `Accessibility` | 无障碍要求 |
| `Do / Don’t` | 推荐做法 / 避免做法 |
| `Acceptance` | 验收标准 |
| `Extensions` | 可扩展内容 |
| `Kernel Coverage` | 共享工作记录覆盖 |
| `Outputs & Termination` | 产出与停止条件 |
| `Maturity Evidence` | 成熟度依据 |

## 9. 状态与生命周期对照

### 9.1 依据状态

| 当前 | 建议 |
|---|---|
| `Unverified` | 未验证 |
| `Supported` | 有依据 |
| `Verified` | 已验证 |
| `Contested` | 有争议 |
| `Stale` | 已过期 |
| `Insufficient` | 依据不足 |

### 9.2 权限状态

| 当前 | 建议 |
|---|---|
| `Allowed` | 允许 |
| `Conditional` | 有条件允许 |
| `Denied` | 禁止 |

### 9.3 人工智能可推进范围

| 当前 | 建议 |
|---|---|
| `Recommend` | 仅建议 |
| `Prepare` | 可以准备 |
| `Approval Required` | 需要审批 |
| `Execute Within Policy` | 可在管控策略范围内执行 |
| `Monitor by Exception` | 异常时由人工介入 |

### 9.4 发布生命周期

| 当前 | 建议 |
|---|---|
| `Draft` | 草稿 |
| `Validated` | 已校验 |
| `Approval Pending` | 待审批 |
| `Published` | 已发布 |
| `Superseded` | 已取代 |
| `Withdrawn` | 已撤回 |

### 9.5 业务操作生命周期

| 当前 | 建议 |
|---|---|
| `Proposed` | 已提议 |
| `Preflight Ready` | 执行前检查就绪 |
| `Awaiting Approval` | 等待审批 |
| `Approved` | 已批准 |
| `Queued` | 已排队 |
| `Executing` | 执行中 |
| `Succeeded` | 执行成功 |
| `Partial` | 部分完成 |
| `Failed` | 失败 |
| `Compensated` | 已补偿 |

### 9.6 自动化规则变更生命周期

| 当前 | 建议 |
|---|---|
| `Candidate` | 候选 |
| `Drafted` | 已起草 |
| `Validated` | 已校验 |
| `Approved` | 已批准 |
| `Staged` | 待启用 |
| `Active` | 已生效 |
| `Suspended` | 已暂停 |
| `Retired` | 已停用 |

### 9.7 目标完成判断

| 当前 | 建议 |
|---|---|
| `Resolved` | 已满足 |
| `Partially Resolved` | 部分满足 |
| `Unresolved` | 未满足 |
| `Redirected` | 已转向 |
| `Criteria Evaluated` | 已按条件评估 |
| `User Confirmed` | 用户已确认 |
| `Unobserved` | 未观察到 |

## 10. 参考旅程步骤对照

### 10.1 可信回答

| 编号 | 当前名称 | 建议名称 |
|---|---|---|
| J-Q1 | `Frame Goal & Context` | 明确目标与上下文 |
| J-Q2 | `Deliver Trustworthy Result` | 交付可信工作结果 |
| J-Q3 | `Assess Goal & Stop` | 评估目标并结束 |

### 10.2 分析及可选延伸

| 编号 | 当前名称 | 建议名称 |
|---|---|---|
| J-A1 | `Frame Goal` | 明确目标 |
| J-A2 | `Inspect Context` | 检查上下文 |
| J-A3 | `Produce Stable Result` | 生成稳定工作结果 |
| J-A4 | `Assess Goal & Choose` | 评估目标并选择下一步 |
| J-A5 | `Optional · Form Decision` | 可选：形成决策 |
| J-A6 | `Optional · Package / Publish Artifact` | 可选：整理并发布版本化成果 |
| J-A7 | `Optional · Propose Action` | 可选：提出业务操作 |

### 10.3 异常到规则改进

| 编号 | 当前名称 | 建议名称 |
|---|---|---|
| J-B1 | `Advance Case` | 推进流程事项 |
| J-B2 | `Raise Exception` | 提出异常 |
| J-B3 | `Create Investigation` | 创建调查任务 |
| J-B4 | `Record Human Decision` | 记录人工决策 |
| J-B5 | `Execute Current Case` | 执行当前流程事项 |
| J-B6 | `Propose Future Rule` | 提出未来自动化规则 |
| J-B7 | `Stage and Observe` | 试运行并观察 |

## 11. 验收协议名称对照

| 编号 | 当前名称 | 建议名称 |
|---|---|---|
| A01 | `Orientation` | 页面定位 |
| A02 | `Comprehension` | 信息理解 |
| A03 | `Control` | 操作控制 |
| A04 | `Trust Calibration` | 可信度校准 |
| A05 | `Task Resolution` | 任务完成判断 |
| A06 | `Recovery` | 失败恢复 |
| A07 | `Continuity` | 工作连续性 |
| A08 | `Accessibility` | 无障碍 |

负责人角色也改为中文，例如：

| 当前 | 建议 |
|---|---|
| `Product Owner` | 产品负责人 |
| `Business Owner` | 业务负责人 |
| `Domain Steward` | 领域负责人 |
| `Data Steward` | 数据负责人 |
| `Process Owner` | 流程负责人 |
| `Control Owner` | 控制负责人 |
| `Mission Owner` | 协作任务负责人 |
| `Engineering Owner` | 工程负责人 |
| `UX Research` | 用户体验研究 |

## 12. Markdown 文档处理

当前根目录的五份主要 Markdown 与站点共享概念，但保留大量英文标题和术语。建议同步处理：

| 文档 | 修改方式 |
|---|---|
| 架构章程 | 使用本提案的领域术语；代码 Schema 和字段名保留英文 |
| 体验说明 | 全中文叙事；标准编号和 EIX 保留 |
| 核心设计系统 | 中文章节名和组件名；代码、属性名、设计变量路径保留英文 |
| 智能协作体验规范 | 中文模式名和状态；S01–C03 编号保留 |
| 修订决策记录 | 历史英文术语首次出现时用“原术语”说明，后文统一中文 |

历史归档保持只读，不追溯修改。

## 13. 不采用的实施方式

不建议增加一个运行时“自动翻译层”。原因是：

- 容易把同一个英文词在不同上下文中翻成同一中文；
- 可能误改代码示例、对象编号、可访问名称和搜索行为；
- 页面源文案与 Markdown 会继续分叉；
- 新内容可以绕过词表，问题会再次出现。

建议直接修改结构化内容源，并保留英文搜索别名。

## 14. 确认后的实施顺序

1. 确认第 3 节的十个核心术语。
2. 更新 `CONTEXT.md`，形成唯一中文术语源。
3. 修改全站导航、一级页面和共用模板。
4. 修改 49 个设计系统条目及交互示例。
5. 修改 17 个体验模式、3 条旅程和 8 项验收协议。
6. 同步五份根目录 Markdown。
7. 增加中英文混排检查：
   - 遍历全部 61 个路由；
   - 展开所有交互状态；
   - 检查同源 iframe；
   - 忽略代码、标准缩写和白名单标识；
   - 阻止新增未登记英文文案。
8. 完成 1440、1280、1024 和 390 四档视觉回归后再部署。

## 15. 建议优先确认的六个选择

| 英文术语 | 推荐中文 | 备选 |
|---|---|---|
| `Kernel` | 共享工作模型 | 共用工作骨架 |
| `Interaction Contract` | 人机协作约定 | 人机协作契约 |
| `Token` | 设计变量 | 设计令牌 |
| `Pattern` | 交互模式 | 体验模式 |
| `Artifact` | 可版本化成果 | 版本化成果 |
| `Case` | 流程事项 | 流程案例 |

本提案推荐第一列中文方案。它们优先考虑首次读者能否直接理解，而不是与英文逐词对应。
