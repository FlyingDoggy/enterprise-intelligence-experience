# EIX Core Design System

> Candidate Platform Standard · Revision 0.5 · 2026-07-27
> Brand-neutral Core + EIX Theme · Documentation-first, implementation-ready

| Field | Definition |
|---|---|
| Status | **Candidate Standard** |
| Audience | Product、UX、Frontend Engineering、Accessibility与Delivery Partners |
| Purpose | 为企业内部数字产品提供稳定的视觉、布局、状态和交互构件 |
| Does not own | Kernel、Work Object、Claim、Evidence、Permission、Autonomy或业务Lifecycle |
| Interactive reference | `#/design-system` |
| Domain guidance | [Intelligence UX Guidance](./EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md) |
| Canonical architecture | [Enterprise Intelligence Experience Principles 2.0](./ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md) |

---

## 1. Purpose、Audience与Ownership

### 1.1 Design System职责

Core Design System回答：

- 页面如何建立一致的信息层级；
- Component如何表达Default、Focus、Disabled、Loading和Error；
- Token如何把原始视觉值转化为可替换的用途语义；
- 同一任务如何在不同视口保持能力等价；
- Product、UX和Engineering如何使用同一份Component Contract验收交付。

它不回答：

- Evidence是否足以支持Claim；
- 当前主体是否有Permission；
- Action是否可以执行；
- Process Case或Analysis Document处于什么业务状态；
- AI应该Recommend、Prepare还是Execute。

这些问题分别由Canonical Charter和Intelligence UX Guidance负责。

### 1.2 Ownership

| Area | Accountable Owner | Required Review |
|---|---|---|
| Foundation Token | Design System Owner | Brand、Accessibility、Frontend |
| Semantic Token | Design System Owner | Product UX、Frontend |
| EIX Extension Token | EIX Experience Owner | Canonical Architecture、Domain Governance |
| Primitive | Frontend Architecture | Accessibility、Design System |
| Component Contract | Design System Owner | UX、Frontend、Accessibility |
| Intelligence Pattern | EIX Experience Owner | Process / Collaborative Domain Owner |

### 1.3 Reference Site Navigation Model

Reference Site中的区域必须只承担一种职责：

| Region | Scope | Changes | Does not change |
|---|---|---|---|
| 顶部主导航 | 整个EIX文档站 | 5分钟、架构、Design System、UX Guidance、Journeys与验收 | 当前Component状态 |
| Design System Catalog | 当前Design System章节 | Foundation、Primitive或Component规范正文与Spec Info | 全局文档身份 |
| Spec Info | 当前Catalog条目 | Theme预览；Related链接经明确点击后导航 | 不自行切换正文 |
| Architecture Map | 仅Canonical Architecture页面 | 在L1–L5与X1–X3之间定位对应说明 | 不作为其他章节的导航 |

Architecture Map只在Architecture页面展示，并与该页左侧分组目录联动。Design System、UX Guidance、Journeys、验收、Brief与Markdown阅读页不显示该架构定位控件。Design System只保留顶部主导航、Catalog、正文与Spec Info。

连续浏览规则：

- Catalog拥有独立滚动区域，切换条目时保留滚动位置；
- Search Query在同一浏览会话的条目切换间保留；
- Search固定在Catalog顶部；
- 规范正文每页提供Previous / Next；
- 直接打开深链接时可以定位当前条目，但不得在后续选择中强制把Catalog滚回顶部。

---

## 2. Core、Semantic Extension与Theme

依赖方向固定为：

```text
Foundation
    ↓
Semantic Token
    ↓
Primitive
    ↓
Core Component
    ↓
EIX Semantic Component
    ↓
Process Intelligence / Collaborative Intelligence Pattern
```

禁止反向依赖：

- Button不得知道Publication Lifecycle；
- Card不得拥有Evidence Status；
- Table不得把绿色解释为Favorable；
- Dialog不得把“确认”默认解释为Approval；
- Core Component不得根据High Confidence自动提升Autonomy。

### 2.1 Theme与Mode是两个独立维度

- **Theme**回答“这套界面采用哪一种品牌表达”：Neutral Core或EIX。
- **Mode**回答“同一语义角色在何种明暗环境中呈现”：Light或Dark。
- Neutral Core定义品牌中性的Semantic Value；EIX Theme覆盖Navigation、Action、Workspace等视觉值。
- Theme与Mode只能改变视觉值，不能改变Anatomy、State、Content、Permission或业务含义。
- Rev 0.5继续提供`Neutral Light`、`Neutral Dark`、`EIX Light`与`EIX Dark`四种可运行组合。
- Dark Mode使用独立的语义Token组合；每个Theme × Mode组合都必须分别通过对比度、Focus与状态辨识检查。

---

## 3. Token Architecture与命名

结构化Token源：

```text
design-system/tokens.json
    ↓ node scripts/generate-tokens.mjs
design-system/tokens.generated.css
```

生成文件提交进静态站点，因此浏览站点不依赖Node或Build Server。

### 3.1 四个Tier

| Tier | Example | Usage |
|---|---|---|
| Foundation | `foundation.color.neutral.900` | 原始值和尺度，不直接进入业务组件 |
| Semantic | `semantic.text.primary` | 说明界面用途 |
| Component | `component.button.height` | 确有独立契约时建立 |
| EIX Extension | `eix.evidence.accent` | 领域语义，只能由Guidance层消费 |

### 3.2 命名规则

```text
foundation.<category>.<scale>
semantic.<role>.<emphasis>
component.<component>.<property>
eix.<state-domain>.<property>
```

规则：

1. Token名称描述用途，不描述当前色值。
2. Component优先消费Semantic Token。
3. Foundation Token只能用于定义Semantic Token或经过批准的视觉计算。
4. 相同颜色不代表相同语义；Evidence、Permission与Workflow必须保留独立Token路径。
5. 删除或重命名Token必须提供Deprecation Window与Migration。

### 3.3 Theme × Mode解析顺序

```text
Foundation default
    → Theme override
    → Mode override
    → Theme + Mode override
```

`modeOverrides`提供品牌中性的明暗映射；`themeModeOverrides`只处理某个Theme在某个Mode下确有差异的语义值。Component不得自行判断当前Theme或Mode，只消费最终解析后的Semantic Token。

---

## 4. Foundations

### 4.1 Color

Foundation Color提供Neutral、Blue、Teal、Amber、Red与Violet完整色阶，便于形成可校验的用途映射；组件不得直接消费这些色阶。

Core Semantic Color Roles：

- `surface.canvas`
- `surface.paper`
- `surface.subtle`
- `surface.inverse`
- `text.primary`
- `text.secondary`
- `text.inverse`
- `border.subtle`
- `border.strong`
- `action.primary`
- `action.on-primary`
- `action.hover`
- `focus.ring`
- `feedback.success`
- `feedback.warning`
- `feedback.danger`

颜色不能单独表达：

- ClaimKind；
- EvidenceStatus；
- PermissionAndPolicy；
- WorkflowState；
- Favorable / Unfavorable；
- Executed / Not Executed。

同一色相可以在不同状态字段中复用，但界面必须同时显示字段名称、文字或符号。`action.primary`只表达操作强调度，不表达Risk；Destructive、Blocked、Denied和Failed也不能因为同为红色就共享State。

### 4.2 Typography

| Role | Font | Use |
|---|---|---|
| Display | `system-ui` | Page和Section Title |
| Body | `system-ui, PingFang SC, Microsoft YaHei` | UI与正文 |
| Utility | `JetBrains Mono, ui-monospace` | ID、Revision、Token与数据元信息 |

数字统一使用Tabular Numerals。中英文边界由统一排版规则处理；参考站使用`text-autospace`，不依赖随机插入的手工空格。

Audit ID、Trace ID、Query Hash和Policy Version使用Utility字体，但必须保持可复制、可选择并提供完整Accessible Name；不得通过缩小字号把它们降为不可读装饰。

阅读字号下限：

| Role | Token | Default |
|---|---|---|
| Metadata | `semantic.typography.meta.size` | 12px |
| Control | `semantic.typography.control.size` | 14px |
| Supporting | `semantic.typography.supporting.size` | 15px |
| Body | `semantic.typography.body.size` | 17px |
| Lead | `semantic.typography.lead.size` | 19px |

`快速阅读 / 完整规范`改变显示内容和布局密度，不改变上述可读性下限。7–11px不得用于导航、控件、正文、状态或其他需要用户理解的信息。

### 4.3 Spacing与Density

基础序列：

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96
```

- `1 / 2 / 3px`只作为控件内部的光学校准Token，不用于页面布局。
- Compact用于核对、表格和Inspector。
- Comfortable用于阅读、解释和表单。
- 快速阅读与完整规范可以改变信息密度，但必须读取同一个Revision。
- Density不得隐藏风险、限制、权限或执行状态。

### 4.4 Layout与Breakpoints

| Viewport | Capability |
|---|---|
| ≥1280 | 完整工作台、多面板、Context与Inspector |
| 768–1279 | 单主栏，次级区域转Drawer |
| <768 | 阅读、审核、评论和轻量控制 |

Responsive按任务依赖重排内容和控制，并明确小屏下保留或降级的能力。

### 4.5 Borders与Radius

- 内容结构优先使用Hairline。
- 普通容器2–4px圆角。
- Overlay最多8px圆角。
- 不以大量独立Card制造Bento墙。

### 4.6 Elevation

- 普通内容保持Flat。
- Menu、Tooltip、Dialog和Drawer可以Raised。
- Modal必须同时处理Backdrop、Focus Trap和Return Focus。

### 4.7 Motion

- 标准区间160–220ms。
- 动效优先使用Opacity和Transform。
- Reduced Motion下保持功能完整。
- 禁止用计时动画伪造业务验证、执行或推理进度。

### 4.8 Iconography

- 使用16、20或24px网格。
- Icon-only Button必须提供Accessible Name。
- 高风险Action和关键状态必须同时显示文字。

### 4.9 Data Display

数字必须伴随适用的：

- Metric；
- Unit；
- Period；
- Version；
- Scope；
- Freshness。

`0`、`Missing`、`Not applicable`和`Restricted`是四种不同状态。

### 4.10 Accessibility与Localization

- WCAG 2.2 AA；
- Focus Visible；
- 44 × 44px触控目标；
- ARIA live用于异步状态变化；
- 状态不只依赖颜色；
- 日期、数字和币种使用Locale格式；
- 中文断行和英文术语在390px保持可读。

---

## 5. Layout与Accessibility Primitives

| Primitive | Responsibility | Must not own |
|---|---|---|
| Surface | 背景、边界、Padding | Work Object State |
| Stack | 垂直顺序与Gap | Section语义 |
| Inline | 横向排列与Wrap | Filter逻辑 |
| Grid | 列关系与Collapse Order | Dashboard业务结构 |
| Cluster | 自然聚合Tag、Filter或Action | Selection State |
| Scroll Area | 可访问的受限滚动区域 | Table语义 |
| Focus Ring | 一致键盘焦点 | Permission |
| Visually Hidden | 辅助技术等价文本 | 可见业务说明 |
| Overlay / Portal | Layer、Backdrop、Dismiss与Focus | Approval含义 |

Primitive提供可复用的布局与无障碍能力；业务Pattern由Intelligence UX Guidance定义。

---

## 6. 通用Components

### 6.1 Content

- Text
- Heading
- Link

### 6.2 Action

- Button
- Icon Button

### 6.3 Status与Surface

- Badge
- Callout
- Card
- Divider

### 6.4 Navigation

- Tabs
- Segmented Control
- Disclosure

### 6.5 Overlay

- Tooltip
- Menu
- Dialog
- Drawer

Menu包含两种不可混用的交互契约：

| Variant | 发生什么 | 持久状态 | 必须表达 |
|---|---|---|---|
| Action Menu | 执行一次明确命名的命令 | 不产生选中项；关闭后Trigger不变 | 动词、作用对象、禁用原因和执行结果 |
| Selection Menu | 修改一个当前值 | 当前项持久保留；Trigger同步显示新值 | 字段名称、当前值、`menuitemradio`与`aria-checked` |

同一组Menu Item不得同时混合一次性命令、持久选择和页面导航。最近执行的Action不是Selection，当前Selection也不是“已经执行”的证明。

### 6.6 Form

- Text Field
- Textarea
- Select
- Checkbox
- Switch

### 6.7 Data与Feedback

- Table
- Progress
- Spinner
- Skeleton
- Empty State
- Toast

### 6.8 Shell

- Header
- Sidebar
- Application Shell

组件详情、Live Specimen和Reference Markup位于`#/design-system/components/:id`。

### 6.9 Controlled Live Specimen Contract

Rev 0.5的30个Core Component继续提供独立、可操作的Live Specimen，不使用同一个占位示例冒充不同组件。

每个Specimen由同一个受控Model驱动：

```text
Component ID + Variant + State + Viewport
                 ↓
        Live Stage + Reference Markup
```

固定要求：

- 每个Component拥有独立`SpecimenDefinition`，包含默认Variant、默认State、Render、Markup与Behavior Binder；
- Variant、State和Viewport切换必须同时更新Live Stage与Reference Markup；
- Reset恢复该Component的声明式默认值；
- 每次Stage重绘必须替换旧的事件边界，禁止累积Keyboard、Escape或Roving Focus Listener；
- 真实交互可以改变示例内部状态，但不得静默修改站点路由或其他Component；
- Persistent Selection写回Specimen Model；Tooltip等瞬时Hover/Focus状态只在当前Stage生命周期内存在；
- Focus、Disabled、Loading、Error、Open、Selected等状态只在适用组件出现；
- Modal Drawer、Dialog和移动Sidebar必须将焦点移入、约束Tab、支持Esc，并在关闭后恢复焦点；
- 每个声明的Variant和State必须产生可辨识的DOM、视觉或行为差异，禁止No-op状态；
- 所有可见Button和Link触控目标不小于44 × 44px，Reference Markup中的Button必须声明`type`；
- Viewport Preview提供Auto、390和768三档，不伪装真实设备；
- Reference Markup展示当前选择的Contract Example；已发布API由正式组件包和版本记录声明。

当前覆盖基线：

| Component | Variant | State | Default Screenshot |
|---|---:|---:|---:|
| 30 | 84 | 102 | 30 |

覆盖脚本同时验证定义唯一性、默认值合法性、CSS Selector是否被真实DOM使用、Reference Markup非空、Button Type、Variant/State非重复、44px目标、Modal焦点、键盘交互，以及390/768全组合溢出。

---

## 7. Theme、Localization与Content Rules

### 7.1 Theme Contract

Theme必须：

- 提供全部Required Semantic Token；
- 在Light与Dark下分别通过对比度、Focus和状态辨识检查；
- 不修改DOM结构和State Machine；
- 不通过品牌色重写Risk、Evidence或Permission含义。

Theme切换与Mode切换必须在当前页面、当前Component、当前Variant和当前State上原位完成，不得重置用户正在检查的规范。

### 7.2 Content Voice

- 用用户能够控制和识别的业务语言。
- Button名称描述实际发生的下一步。
- Form Label说明需要什么，Help说明为什么需要；Placeholder不得承担Label职责。
- Clarification只询问会改变结果、权限或风险的最小问题，并说明不回答时采用的默认处理。
- “Approve”之后只能显示Approved，不能显示Executed。
- Error解释发生了什么、保留了什么以及如何继续。
- Empty State说明原因和下一步，不使用情绪化拟人文案。
- Action的视觉强调度由任务重要性决定；Risk与Reversibility必须另外表达，不能把“Primary Button”等同于“安全”。

---

## 8. Component Authoring Template

每个Component必须包含：

1. Purpose
2. When to Use / Not Use
3. Anatomy
4. Variants
5. States
6. Live Specimen
7. Reference Markup
8. Token Dependencies
9. Reference Props
10. Responsive Behavior
11. Accessibility
12. Do / Don’t
13. Related Components
14. Acceptance Tests

Reference Markup必须标记为Contract Example，不得出现未发布的`@eix/ui`导入。

---

## 9. Maturity、Change与Deprecation

| Status | Meaning |
|---|---|
| Draft | 结构仍在探索 |
| Candidate | 已有完整规范和Fixture，尚未被真实消费者验证 |
| Validated | 至少一个真实产品完成任务与无障碍验证 |
| Stable | 至少两个消费者使用相同契约，无领域分支 |
| Deprecated | 提供替代方案、迁移和删除时间 |

Design System状态不能推出Intelligence Pattern的Canonical状态。

---

## 10. React Package晋级条件

进入`@eix/tokens`与`@eix/ui`阶段前必须同时满足：

1. 至少两个真实项目消费同一Component Contract。
2. 组件不存在Process Intelligence或Collaborative Intelligence专属分支。
3. Token、API、Owner和Version明确。
4. Keyboard、Screen Reader和多视口测试稳定。
5. 有Migration和Deprecation机制。
6. Reference Specimen能够改为真实Package Import。

Rev 0.5不声称已满足这些条件。

---

## 11. Acceptance

- Registry中的每个条目都有唯一深链接。
- Navigation、Overview、Search和Coverage Test读取同一Registry。
- Token生成结果与JSON源一致。
- Neutral与EIX Theme在Light与Dark四种组合下无缺失Token，并分别通过对比度检查。
- 参考站作为首个消费者，页面和Component CSS只消费Semantic、Component或EIX Extension Token；不得直接引用Foundation色值或硬编码色值。
- 中文正文默认17px，辅助正文不小于15px，有效元信息不小于12px。
- 活跃界面和文档中的术语符合`CONTEXT.md`；归档版本不追溯改写。
- Core Component不拥有业务Lifecycle。
- 每个组件具备适用的Default、Focus、Disabled、Loading或Error状态。
- 30个Component各自拥有Controlled Live Specimen；84个Variant与102个Scenario是声明清单，不作为完成度替代指标。
- 每个组件只暴露适用的`Variant / Value / Interaction / Visibility / Availability / Validation / Async / Data`控制维度；非法组合在控制面板中禁用并解释原因。
- Live Stage与Reference Markup读取同一份规范状态；Variant、Value、Disabled、Busy、Invalid与Viewport发生变化时，两者同步更新。
- Responsive Preview运行在同源iframe中，390与768触发真实Media Query；Reset恢复默认Model且不跨路由泄漏状态。
- 9个Primitive的全部Variant具有独立可切换示例；不能用一张静态拼图替代Variant行为。
- Modal、Menu、Tabs、Select、Table与移动Sidebar通过键盘、Esc、焦点恢复、状态同步和Listener生命周期测试。
- 合法状态矩阵在桌面与小屏保持信息和操作能力；非法组合、无效Variant和伪结果被自动化阻断。
- 1440、1280、1024和390宽度无关键遮挡。
- Console Error为0。
