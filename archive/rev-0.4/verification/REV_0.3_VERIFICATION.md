# EIX 2.0 Rev 0.3 Verification Record

> Verification date: 2026-07-26  
> Subject: Canonical文档、Core Design System、Intelligence UX Guidance与确定性静态参考站  
> Runtime boundary: no LLM、API、database、permission service、policy engine or external action

## 1. Automated result

Test sources:

- `verification/validate_registry.mjs`
- `verification/validate_conformance.mjs`
- `verification/test_eix_rev03.py`
- `verification/test_contract_visualization.py`

| Area | Result | Verified behavior |
|---|---|---|
| Token generation | PASS | 112个Token由JSON源生成，四个Tier与两个Theme完整 |
| Reference consumer | PASS | 主站与Specimen CSS只消费Semantic、Component或EIX Extension Token；无直接色值和Foundation消费 |
| Typography | PASS | Body 16px、Supporting 14px、Control 13px、Metadata 12px；运行态页面无低于12px的有效文字 |
| Spacing | PASS | 页面和组件间距使用Semantic Space Token；1–3px仅作为具名光学校准Token |
| Contrast | PASS | 关键文本、Action、Feedback和EIX语义色在声明背景上达到4.5:1 |
| Language | PASS | `CONTEXT.md`定义活跃内容术语；归档保持历史用语；退役简称和模板化文案由自动检查阻断 |
| Registry coverage | PASS | 63个Catalog Entry唯一；10 Foundation、9 Primitive、30 Component、14 Guidance Pattern |
| Design System routes | PASS | 49个Foundation、Primitive和Component深链接逐一加载 |
| Navigation continuity | PASS | Kernel Trace仅在Architecture展示；Catalog滚动与搜索在条目切换间保留，并提供Previous / Next |
| Guidance routes | PASS | Shared、Process、Collaborative与Handoff深链接可刷新恢复 |
| Compatibility | PASS | `#/patterns`迁移到`#/guidance`；Rev 0.2保持归档 |
| Theme | PASS | Neutral Core与EIX Theme切换并本地保存 |
| Live specimen coverage | PASS | 30个Component、9个Primitive与14个Guidance Pattern分别拥有可操作交互示例；84个Variant与102个Scenario作为声明清单 |
| Legal model coverage | PASS | 逐组件验证适用轴、合法可达组合与非法组合禁用；数量不再替代契约完成度 |
| Live specimen runtime | PASS | Variant、Value、Interaction、Visibility、Availability、Data与Viewport读取同一Resolved Model；Reset可恢复默认值 |
| Responsive sandbox | PASS | 同源iframe以真实390/768宽度触发组件Media Query，不再只缩放外层Stage |
| Runtime listener lifecycle | PASS | Stage重绘会清除旧Listener；重复打开和状态切换不会累积Keyboard、Escape或Roving Focus处理器 |
| Live specimen interaction | PASS | Tabs、Segmented Control、Disclosure、Tooltip、Menu、Dialog、Drawer、Select、Checkbox、Switch、Table、Sidebar与Toast等关键行为可操作 |
| Overlay and focus | PASS | Dialog、Drawer和移动Sidebar具备初始焦点、Tab约束、Esc、Backdrop与Focus Return |
| Primitive coverage | PASS | 9个Primitive的每个Variant均可独立切换，并通过DOM与Computed Style指纹检查 |
| Guidance coverage | PASS | S01–S08、P01–P03、C01–C03均有专属Work Object、Fixed Regions、Lifecycle与Recovery样章 |
| Structural contract | PASS | ARIA引用、Label、Button Type、CSS Selector命中、44px交互目标和Modal Surface均通过 |
| Reference markup | PASS | 不出现虚假的`@eix/ui`导入；Markup与Live的Role、Value、Disabled、Busy、Invalid和Selection关键语义一致 |
| Data interaction | PASS | Table排序与Row Selection可同时存在；稳定Row ID支持鼠标、Enter与Space |
| Markdown reader | PASS | Charter、Design System、Guidance与迁移文档以UTF-8渲染 |
| Governance | PASS | Evidence失效、Approved ≠ Executed、Rule Candidate不产生Active影响 |
| Responsive | PASS | 1440、1280、1024和390无Document-level横向溢出；1024 Guidance降为单主栏，390保留阅读和关键控制 |
| Runtime quality | PASS | Console Error与Page Error均为0 |

## 2. Boundary result

- Canonical Charter继续拥有Kernel、Contract、语义轴与生命周期。
- Core Design System只拥有Token、Primitive与通用Component。
- EIX Extension Token与Intelligence Pattern不进入Core Component生命周期。
- UX Guidance通过`coreComponents[]`显式引用Core Component。
- Theme改变视觉值，不改变Work Object、Evidence、Permission或Workflow。
- Static Reference明确标记`No package API`。

## 3. Visual review

Reviewed:

- `rev-0.3/design-system-1440.png`
- `rev-0.3/component-table-1280.png`
- `rev-0.3/guidance-process-1024.png`
- `rev-0.3/component-button-390.png`
- `rev-0.3/guidance-brief-390.png`
- `rev-0.3/specimens/contract-*.png`：30个Component受控Live Specimen逐项截图
- `rev-0.3/specimens/guidance-*.png`：14个Guidance Pattern逐项截图
- `rev-0.3/drawer-open-1280.png`
- `rev-0.3/drawer-open-390.png`
- `rev-0.3/sidebar-mobile-open-390.png`

Result:

- 保留Editorial Architecture / Finance Working Paper方向；
- `Foundation → Primitive → Component → Intelligence Pattern`成为Design System的结构性视觉签名；
- Component页面具备统一的Purpose、Anatomy、Live Specimen、Reference Markup、Token、Accessibility和Do/Don’t；
- 30个Component不再共享通用占位Fixture；每个交互示例均有自己的结构、状态、变体和交互绑定；
- Drawer三种Placement拥有真实Panel Surface、受控焦点、Backdrop、Esc和Reduced Motion行为；
- Sidebar的Mobile Open状态使用Modal Navigation语义，不再只是视觉上变暗的Expanded Sidebar；
- 390宽度保留搜索、阅读、状态控制、Evidence和Guidance，不保留复杂多面板编辑；
- 所有重要状态同时使用文字或结构，不只依赖颜色。
- 100%浏览器缩放下，主要正文、导航、状态和控件标签保持可读；阅读密度不再通过缩小字号实现。

## 4. Reader Testing

`READER_TEST_PROTOCOL.md`已增加Design System与Guidance边界任务。

自动化只证明结构、状态与可操作性，不声称真实无上下文读者已达到理解率目标。
