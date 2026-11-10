# 设计师输入吸收专项验证

> 日期：2026-07-28
> 对应记录：`EIX_2.0_DESIGNER_INPUT_ADOPTION_RECORD.md`
> 结论：字体、数据表达、Candidate Component 与 Intelligence UX Guidance 的本轮吸收项已实现并通过自动化与视觉回归。

## 覆盖范围

- 五个批准的 系统字体面及中文回退；
- 十槽稳定系列色注册表、普通 / 密集 / 强调三种系列策略；
- 业务状态、界面反馈与选择态的独立色彩职责；
- 直角定量图形、图例图形一致性与 Compact ChartBlock；
- Search Field、Date / Date Range、Breadcrumb、Pagination；
- Switch Pending、Table Error、No Data / No Results / Error；
- C02 分析范围与依据检查器；
- P01 运行实例、模板版本、触发方式与历史入口；
- 1440、1280、1024、390 及额外图表断点回归。

## 自动化结果

| 检查 | 结果 |
|---|---|
| 图表契约单元测试 | 15 / 15 通过 |
| Registry | 70个目录条目、34个通用组件、17个智能体验模式 |
| Token / CSS 一致性 | 147个核心设计变量；可视化令牌在浅色和深色模式完整生成 |
| 全站浏览器回归 | 通过；70个详情路由、全部组件合法状态和17个智能体验模式 |
| 数据表达浏览器回归 | 通过；12种工作问题、22个图谱样例、9个视口 |
| 控制台与页面错误 | 0 |
| 页面级横向溢出 | 0 |
| 最小文字与控件字号 | 正文不低于12px；交互控件不低于13px |
| 触控目标 | 可操作目标不低于44px |

## 回归中发现并修复的问题

1. 新增组件后，目录和 Inspector 仍显示旧的 30 个组件。
2. Date Range 的 Disabled 状态在参考标记中丢失。
3. Switch Pending 的 `aria-busy` 与禁用语义未同步到参考标记。
4. Breadcrumb 的溢出控件只有 28px 宽，不满足 44px 触控目标。
5. Compact ChartBlock 标题降到 18px，低于已定义的结果标题层级。
6. C02 的分析期间在中等宽度被省略，导致范围信息不完整。
7. 新增组件变体名称没有全部进入中文受控词表。

## 运行命令

```bash
node --test design-system/collaborative-visualization/tests/visualization-contract.test.mjs
node verification/validate_registry.mjs
node verification/validate_conformance.mjs
python3 verification/test_eix_rev05.py
python3 verification/test_collaborative_visualization.py
```

浏览器测试使用本地静态 HTTP 服务、Headless Chromium、`networkidle` 等待和 Reduced Motion。截图位于：

- `verification/rev-0.5/`
- `verification/collaborative-visualization/`
