# Enterprise Intelligence Experience 2.0

Rev 0.3采用“一套静态站点、三层职责”：

- `ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md`：唯一Canonical架构源；
- `EIX_2.0_EXPERIENCE_NARRATIVE.md`：管理层与首次接触者的5分钟Companion；
- `EIX_2.0_CORE_DESIGN_SYSTEM.md`：品牌中性的Token、Foundation、Primitive与通用Component；
- `EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md`：Process Intelligence与Collaborative Intelligence领域交互规范；
- `EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md`：Rev 0.2 Pattern文档迁移说明；
- `index.html`、`styles.css`、`app.js`与`src/`：Hash路由静态参考站；
- `design-system/tokens.json`：Design Token唯一结构化源；
- `src/specimens/`：30个Core Component的独立Live Specimen定义、统一运行时与交互绑定；
- `src/guidance-specimens.js`：14个Intelligence UX Pattern的一对一交互示例；
- `specimen.html`：同源隔离的Live Specimen Sandbox，用真实iframe宽度触发响应式契约；
- `archive/rev-0.1/`、`archive/rev-0.2/`：只读历史版本；
- `verification/`：自动化、视觉与Reader Testing。

当前静态站是EIX Core Design System的首个参考消费者。站点壳层、文档页面、Core Component和Intelligence UX交互示例使用同一套Semantic Token、Typography、Responsive与Accessibility契约；领域Guidance只应用于存在Work Object、Evidence、Gate或Handoff的场景。

## 本地启动

```bash
cd enterprise-intelligence-experience
python3 -m http.server 4190 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4190/#/brief
```

## 主要路由

- `#/brief`：Experience Narrative；
- `#/architecture`：Canonical Architecture；
- `#/design-system`：Core Design System Overview；
- `#/design-system/foundations/:id`；
- `#/design-system/primitives/:id`；
- `#/design-system/components/:id`；
- `#/guidance`：Intelligence UX Guidance；
- `#/guidance/shared|process|collaborative|handoff/:id`；
- `#/journeys`：Reference Journeys；
- `#/acceptance`：Experience Gate；
- `#/document?doc=charter|narrative|design-system|guidance|patterns&from=<route>`：内置Markdown阅读器。

旧`#/patterns`自动迁移到`#/guidance`。

## Token生成

Token CSS已提交，不影响纯静态浏览。修改Token源后运行：

```bash
node scripts/generate-tokens.mjs
```

## 运行边界

站点不连接LLM、数据库、Identity、Permission、Policy或外部业务系统。所有治理和业务交互均为确定性Fixture，并标记：

> Simulation · No external action

Design System页面展示的是Reference Markup和实现级契约，不代表`@eix/ui`已经发布。

Live Specimen覆盖30个Component、9个Primitive与14个Intelligence UX Pattern。84个Variant和102个Scenario保留为声明清单，但完成度由合法Model覆盖、轴独立性、键盘行为、Reference Markup语义一致性、真实iframe响应式和信息保存能力判断。自动化会阻止非法状态组合、未命中的CSS Selector、无`type`的Button、Listener累积、Modal焦点错误和视口溢出。

术语以`CONTEXT.md`为准。Rev 0.1与Rev 0.2归档保留历史用语，不参与当前语言收敛。

Markdown解析继续使用本地vendored `marked`，其MIT声明位于`vendor/MARKED_LICENSE.md`。

## 验证

```bash
node verification/validate_registry.mjs
node verification/validate_conformance.mjs
python3 verification/test_eix_rev03.py
```

浏览器验证需要Python Playwright；当前验证结果见`verification/REV_0.3_VERIFICATION.md`。

## ECS发布

验证通过后发布为新的不可变Release，并原子切换`/opt/eix/current`：

```bash
./deploy/publish-ecs.sh
```

运行前显式设置`EIX_DEPLOY_HOST`和`EIX_DEPLOY_KEY`；公开仓库不提供部署主机或私钥路径。旧Release保留，可通过重新指向`/opt/eix/current`回退。
