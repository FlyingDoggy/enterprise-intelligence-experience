# 企业智能体验 2.0

这是一套面向企业人工智能产品、界面与用户体验及工程团队的**设计白皮书与可交互参考实现**。管理层和首次接触者从五分钟导读进入；产品、界面与用户体验及工程团队再按问题查看规范架构、设计系统、体验设计指导、端到端场景和设计检查。

Rev 0.5 采用“一套静态站点、三层职责”：

- `ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md`：唯一的核心架构来源；
- `EIX_2.0_EXPERIENCE_NARRATIVE.md`：面向管理层和首次接触者的五分钟说明；
- `EIX_2.0_CORE_DESIGN_SYSTEM.md`：品牌中性的设计变量、基础规范、布局基础件和通用组件；
- `EIX_2.0_COLLABORATIVE_VISUALIZATION_STANDARD.md`：Collaborative Intelligence的数据表达、图形选择和依据绑定规范；
- `EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md`：Process Intelligence 与 Collaborative Intelligence 的领域交互规范；
- `EIX_2.0_CONSOLIDATION_RECORD.md`：两套方案的吸收、改造和拒绝记录；
- `EIX_2.0_REV_0.5_DECISION_RECORD.md`：共享工作模型、工作结果、目标完成判断和业务成效的决策记录；
- `EIX_2.0_DESIGNER_INPUT_ADOPTION_RECORD.md`：设计师补充材料的吸收、适配、拒绝与实施边界；
- `EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md`：Rev 0.2 交互模式文档的迁移说明；
- `UBIQUITOUS_LANGUAGE.md`：当前中文版本的唯一术语基准；
- `index.html`、`styles.css`、`app.js` 和 `src/`：使用哈希路由的静态参考站；
- `design-system/tokens.json`：设计变量的唯一结构化来源；
- `design-system/fonts.generated.css`：从批准的showcase提取并内嵌的五个MB字体面；
- `design-system/collaborative-visualization/`：设计JSON、CSS令牌、ChartSpec、确定性Chart Router、SVG/ECharts/React实现样例和交互参考；
- `design-system/collaborative-visualization/CLAUDE_SOURCE_REVIEW.md`：Claude补充材料与EIX的逐项对照和取舍记录；
- `src/specimens/`：34 个通用组件的独立交互示例；
- `src/guidance-data.js` 与 `src/guidance-specimens.js`：17 个智能体验交互模式的真实 Agent 应用映射、结构参考、状态示例或协作约定模拟；
- `src/architecture-data.js` 和 `src/conformance-data.js`：任务投影和从任务到设计检查的追踪关系；
- `specimen.html`：使用同源 `iframe` 隔离的交互示例环境；
- `archive/rev-0.1/` 至 `archive/rev-0.5-pre-zh-localization/`：只读历史版本和英文原稿；
- `verification/`：自动化、视觉回归和真实用户验证方案。

当前站点是 EIX 核心设计系统的第一个参考消费者。站点壳层、文档页面、通用组件和智能体验交互示例使用同一套设计变量、排版、响应式和无障碍约定。智能体验设计指导只应用于存在工作对象、依据、校验或交接的场景。

完整界面、交互模式、端到端场景与组件效果均使用统一“界面样机框”，把可视化参考与方法论正文明确分开。同页切换状态、筛选或样机时保留阅读位置；一级页面变化才回到新页面开头。

## 本地启动

```bash
cd "/Users/muyuyang/Desktop/Muyu-AI-Projects/FC China (FG)/54. Enterprise Intelligence Experience 2.0"
python3 -m http.server 4190 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4190/#/brief
```

## 主要路由

- `#/brief`：体验叙事；
- `#/architecture`：核心架构；
- `#/design-system`：核心设计系统总览；
- `#/design-system/foundations/:id`：基础规范；
- `#/design-system/primitives/:id`：布局基础件；
- `#/design-system/components/:id`：通用组件；
- `design-system/collaborative-visualization/samples/index.html`：Collaborative Intelligence数据表达交互参考；
- `#/guidance`：智能体验设计指导，以及 Staff Claim 流程事项、政策调查、规则候选和失败恢复的端到端交互场景；
- `#/guidance/shared|process|collaborative|handoff/:id`：交互模式详情；
- `#/journeys`：端到端场景；
- `#/acceptance`：设计检查；
- `#/acceptance?focus=A01...A08`：直接打开并聚焦某项设计检查；
- `#/document?doc=charter|narrative|design-system|visualization|guidance|consolidation|rev05|patterns&from=<route>`：内置 Markdown 阅读器。
- `/eix-pocs/#/collaborative-v3`：从五分钟导读进入的ChatBI 2.0 V3独立可交互应用示例。

旧路由 `#/patterns` 会自动迁移到 `#/guidance`。

## 生成设计变量

设计变量 CSS 已提交，因此纯静态浏览不依赖构建服务。修改结构化来源后运行：

```bash
node scripts/generate-tokens.mjs
```

## 更新内嵌字体

字体CSS已提交，静态站点不依赖外部字体服务。需要从批准的showcase重新生成时运行：

```bash
node scripts/extract-showcase-fonts.mjs "/absolute/path/to/UI components showcase 1.html"
```

脚本只接受预期的五个MB字体面，并在生成文件中记录源文件SHA-256。

## 运行边界

站点不连接大语言模型、数据库、身份、权限、管控策略或外部业务系统。所有治理和业务交互都使用确定性示例，并显示：

> 模拟环境 · 不会执行外部操作

设计系统页面展示参考标记和实现约定，不代表 `@eix/ui` 已经发布。

当前版本覆盖 34 个通用组件、9 个布局基础件和 17 个智能体验交互模式。自动化会检查非法状态组合、独立状态混用、业务操作与业务成效混用、无效 CSS 选择器、缺少 `type` 的按钮、事件监听器累积、模态层焦点错误和视口溢出。

设计变量来源包含 147 个变量，并提供中性主题、EIX 主题、浅色和深色四种组合。主题只改变品牌表达，明暗模式只改变颜色映射，两者都不能改变组件行为或业务语义。

当前术语以 `UBIQUITOUS_LANGUAGE.md` 为准。历史归档保留原始用语，不参与当前中文版本的语言收敛。

Markdown 解析使用仓库内的 `marked`，其 MIT 声明位于 `vendor/MARKED_LICENSE.md`。

## 验证

```bash
node verification/validate_registry.mjs
node verification/validate_conformance.mjs
python3 verification/test_eix_rev05.py
```

浏览器验证需要 Python Playwright。最新验证记录位于 `verification/`。
设计师输入吸收的专项结果见 `verification/DESIGNER_INPUT_ADOPTION_VERIFICATION.md`。

## 发布到 ECS

验证通过后，可以发布为新的不可变版本，并原子切换 `/opt/eix/current`：

```bash
./deploy/publish-ecs.sh
```

脚本默认发布到 `ecs-user@8.160.176.104`，使用 `/Users/muyuyang/Downloads/audi-chatbi-poc.pem`。可以通过 `EIX_DEPLOY_HOST` 和 `EIX_DEPLOY_KEY` 覆盖默认值。旧版本会保留，可通过重新指向 `/opt/eix/current` 回退。
