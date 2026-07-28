# EIX 2.0 可见语言检查

> 日期：2026-07-27  
> 基准：`UBIQUITOUS_LANGUAGE.md`  
> 检查对象：6个一级路由、49个设计系统详情页、17个智能体验模式详情页，以及当前版Markdown阅读页。

## 结论

当前中文界面的导航、标题、正文、按钮、状态、流程步骤、错误与恢复说明使用中文。下列英文只在专名或专业技术语境中保留。

## 保留的产品名称

- `EIX`：首次写作“企业智能体验（EIX）”。
- `Process Intelligence`
- `Collaborative Intelligence`
- `ChatBI`

## 保留的技术标准与格式

- `WCAG 2.2 AA`
- `ARIA`及其角色、属性名，例如`aria-expanded`、`menuitemradio`
- `HTML`、`CSS`、`JavaScript`、`JSON`、`Markdown`、`UTF-8`
- `React`、`Node.js`、`Playwright`

## 保留的实现标识

- 设计变量路径与CSS变量，例如`semantic.surface.paper`、`var(--foundation-space-4)`
- 组件参考属性，例如`href`、`target`、`aria-label`
- 包名，例如`@eix/tokens`、`@eix/ui`
- 字体族名称，例如`MBCorpoSText`、`MBCorpoATitle`、`PingFang SC`、`JetBrains Mono`

## 保留的业务代码、单位与编号

- `KPI`、`SLA`、`SoD`
- `MBBP`、`EUR`、`MRMB`、`CST`
- 财年与期间代码，例如`FY27 YTD`
- 对象及追踪编号，例如`ROOT-018`、`ANL-118 r4`、`TRACE-000`
- 尺寸、时长和颜色值，例如`44px`、`160ms`、`#006FBE`

## 已移出中文界面的英文术语

`Kernel`、`Contract`、`Work Result`、`Artifact`、`Goal Resolution`、`Business Outcome`、`Evidence`、`Permission`、`Autonomy`、`Workflow State`、`Gate`、`Receipt`、`Handoff`、`Design System`、`UX Guidance`、`Foundation`、`Primitive`、`Component`、`Pattern`与`Specimen`均已替换为统一中文名称。

英文原稿保存在：

- `src/locales/en-backlog.js`
- `archive/rev-0.5-pre-zh-localization/`
