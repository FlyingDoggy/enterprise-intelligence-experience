# Collaborative Intelligence数据表达验证记录

> 日期：2026-07-27
> 状态：候选扩展验证通过
> 范围：结构化设计源、Token、ChartSpec、Router、校验器、SVG/ECharts/React参考、交互样例和主站入口

## 1. 自动契约测试

```bash
node --test design-system/collaborative-visualization/tests/visualization-contract.test.mjs
```

结果：13项通过，0项失败。

覆盖：

- 12份完整交互ChartSpec通过运行时治理检查；
- 14类工作问题得到确定性的默认表达；
- 36种默认或备选表达均具有结构化定义；
- 22个图形图谱样例均声明用途、色彩责任、停止条件与替代表达；
- 趋势、贡献、预测和关系分析的停止条件；
- 瀑布图加总核对；
- 桑基图节点守恒与节点数量上限；
- 预测区间和假设；
- 五个系列色硬上限；
- SVG、ECharts和ChartBlock共享同一ChartSpec；
- 哑铃图、小倍数图、热力图、异常带与桑基图使用独立视觉语法，不复用错误图形；
- Router引用的所有默认和替代表达均有图表家族定义；
- 45个可视化Token具有浅色和深色映射；
- 样例页面本地资源无缺失。

## 2. 主站回归

```bash
node verification/validate_registry.mjs
node verification/validate_conformance.mjs
python verification/test_eix_rev05.py
```

结果：

- 66个目录条目有效；
- 139个Core Token有效；
- 30个通用组件和17个智能体验交互模式覆盖不变；
- EIX 2.0 Rev 0.5完整浏览器回归通过；
- 新扩展没有改变既有Core、Guidance或生命周期契约。

## 3. 新样例浏览器回归

```bash
python verification/test_collaborative_visualization.py
```

结果：通过。

覆盖：

- `1440 × 1000`、`1280 × 720`、`1024 × 900`和`390 × 844`；
- 页面无横向溢出；
- 12个完整ChartBlock中的文字均未超出SVG边界，且标签间没有视觉碰撞；
- 22个图谱预览中的文字均未超出SVG边界；
- 手机端复杂图形在图内横向浏览，不压缩字号和标签；
- 样例切换保持当前阅读位置；
- 图谱筛选保持当前阅读位置；
- 图形、数据表和解释无损切换；
- 数据标记可通过键盘选中；
- 选择后的分析动作不会触发外部操作；
- 依据入口可展开；
- 浅色与深色Token可切换；
- 浏览器样机使用规范允许的最大`7px`圆角；
- Console error为0，Page error为0；
- Design System的数据表达入口与四类交付文件可访问。

## 4. 截图

- `verification/collaborative-visualization/design-system-entry-1440.png`
- `verification/collaborative-visualization/gallery-1440.png`
- `verification/collaborative-visualization/gallery-1280.png`
- `verification/collaborative-visualization/gallery-1024.png`
- `verification/collaborative-visualization/gallery-390.png`

## 5. 公网发布

- 发布版本：`20260727-235102`
- 地址：`https://example.com/eix/design-system/collaborative-visualization/samples/index.html`
- Nginx配置检查与发布后健康检查通过；
- 上述四个视口、全部ChartBlock、图谱、键盘、Console和溢出检查已对公网版本重新执行并通过。

## 6. 生产化前仍需完成

- 以真实语义层元数据替换占位指标和维度；
- 对目标项目的ECharts版本建立逐图截图基线；
- 使用真实高密度数据验证标签碰撞和渲染性能；
- 把色觉、对比度和ChartSpec Schema校验接入持续集成；
- 明确结果服务、依据服务与ChartSpec之间的版本兼容策略。
