# Enterprise Intelligence Experience 2.0

Rev 0.5采用“一套静态站点、三层职责”，并将Shared Experience Kernel从线性Sequence修正为Task Projection驱动的Coverage Model：

- `ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md`：唯一Canonical架构源；
- `EIX_2.0_EXPERIENCE_NARRATIVE.md`：管理层与首次接触者的5分钟Companion；
- `EIX_2.0_CORE_DESIGN_SYSTEM.md`：品牌中性的Token、Foundation、Primitive与通用Component；
- `EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md`：Process Intelligence与Collaborative Intelligence领域交互规范；
- `EIX_2.0_CONSOLIDATION_RECORD.md`：EIX Rev 0.3与Claude GAX两套方案的吸收、改造和拒绝记录；
- `EIX_2.0_REV_0.5_DECISION_RECORD.md`：Kernel、Result、Goal Resolution、Business Outcome与Pattern成熟度的纠偏记录；
- `EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md`：Rev 0.2 Pattern文档迁移说明；
- `index.html`、`styles.css`、`app.js`与`src/`：Hash路由静态参考站；
- `design-system/tokens.json`：Design Token唯一结构化源；
- `src/specimens/`：30个Core Component的独立Live Specimen定义、统一运行时与交互绑定；
- `src/guidance-specimens.js`：17个Intelligence UX Pattern的结构参考、状态示例或契约模拟；
- `src/architecture-data.js`与`src/conformance-data.js`：Task Projection以及Task → Contract → Pattern → Component → Acceptance追踪关系；
- `specimen.html`：同源隔离的Live Specimen Sandbox，用真实iframe宽度触发响应式契约；
- `archive/rev-0.1/`至`archive/rev-0.4/`：只读历史版本；
- `verification/`：自动化、视觉与Reader Testing。

当前静态站是EIX Core Design System的首个参考消费者。站点壳层、文档页面、Core Component和Intelligence UX交互示例使用同一套Semantic Token、Typography、Responsive与Accessibility契约；领域Guidance只应用于存在Work Object、Evidence、Gate或Handoff的场景。

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
- `#/acceptance?focus=A01...A08`：直接打开并聚焦一项验收协议；
- `#/document?doc=charter|narrative|design-system|guidance|consolidation|rev05|patterns&from=<route>`：内置Markdown阅读器。

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

Core Live Specimen覆盖30个Component和9个Primitive。Intelligence UX Guidance提供17个Reference条目，并分别标记Canonical Listed、Specified、Behavioral Specimen或Validated Pattern；契约完成度由状态覆盖、交互行为和验证证据判断。自动化会阻止非法状态组合、独立状态字段混用、Action/Business Outcome混用、未命中的CSS Selector、无`type`的Button、Listener累积、Modal焦点错误和视口溢出。

Token源包含139个Token，并提供Neutral Core / EIX Theme与Light / Dark Mode的四种组合。Theme只改变品牌表达，Mode只改变明暗映射；两者都不得改变Component行为或业务语义。

术语以`CONTEXT.md`为准。Rev 0.1至Rev 0.4归档保留历史用语，不参与当前语言收敛。

Markdown解析继续使用本地vendored `marked`，其MIT声明位于`vendor/MARKED_LICENSE.md`。

## 验证

```bash
node verification/validate_registry.mjs
node verification/validate_conformance.mjs
python3 verification/test_eix_rev05.py
```

浏览器验证需要Python Playwright；当前验证结果见`verification/REV_0.5_VERIFICATION.md`，三类首次读者的独立评审见`verification/REV_0.5_READER_CRITIQUE.md`。

## ECS发布

验证通过后发布为新的不可变Release，并原子切换`/opt/eix/current`：

```bash
./deploy/publish-ecs.sh
```

脚本默认发布到`ecs-user@8.160.176.104`，使用`/Users/muyuyang/Downloads/audi-chatbi-poc.pem`。可通过`EIX_DEPLOY_HOST`和`EIX_DEPLOY_KEY`覆盖。旧Release保留，可通过重新指向`/opt/eix/current`回退。
