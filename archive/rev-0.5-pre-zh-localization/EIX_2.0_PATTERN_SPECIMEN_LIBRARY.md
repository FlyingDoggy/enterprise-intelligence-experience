# Pattern Specimen Library迁移说明

> Migration Notice · Revision 0.5 · 2026-07-27

Rev 0.2的`Pattern Specimen Library`同时承担了组件参考、领域Pattern和交互示例三种责任。  
Rev 0.5继续将其拆分为两个边界明确的标准：

| New destination | Responsibility |
|---|---|
| [EIX Core Design System](./EIX_2.0_CORE_DESIGN_SYSTEM.md) | Token、Foundation、Primitive与通用Component |
| [Intelligence UX Guidance](./EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md) | Process Intelligence、Collaborative Intelligence与Handoff Pattern |

原有8个Shared Pattern、3个Process Composition和3个Collaborative Composition已迁入Intelligence UX Guidance，并保留原ID。

## 访问方式

- 新版Design System：`#/design-system`
- 新版UX Guidance：`#/guidance`
- Rev 0.2原始文档：`archive/rev-0.2/EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md`
- Rev 0.2原始静态站点：`archive/rev-0.2/index.html#/patterns`

Rev 0.2内容保持只读，不会被Rev 0.5重新解释。
