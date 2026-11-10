# Enterprise Intelligence Experience 2.0

Rev 0.2采用“一主两伴侣、一套静态站点”：

- `ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md`：唯一Canonical架构源；
- `EIX_2.0_EXPERIENCE_NARRATIVE.md`：面向管理层和首次接触者的5分钟Companion；
- `EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md`：面向Product、UX与Engineering的Candidate Pattern规范；
- `index.html`、`styles.css`、`app.js`：Hash路由静态阅读站点与确定性Fixture；
- `archive/rev-0.1/`：Rev 0.1只读归档；
- `verification/`：Rev 0.2验证截图、自动化测试、验证记录与Reader Test Protocol。

## 本地启动

```bash
cd enterprise-intelligence-experience
python3 -m http.server 4190 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4190/#/brief
```

## 路由

- `#/brief`：Experience Narrative；
- `#/architecture`：Canonical Architecture；
- `#/patterns`：Pattern Library与交互样章；
- `#/journeys`：两条Reference Journey；
- `#/acceptance`：Experience Gate、Reader Testing与2027 Workstream。
- `#/document?doc=charter|narrative|patterns&from=<route>`：内置Markdown阅读器；显式UTF-8解码，并保留返回来源页面的控制。

## 运行边界

站点完全静态，不连接LLM、数据库、Identity、Permission、Policy或外部业务系统。所有交互都标记为：

> Simulation · No external action

它用于解释信息架构、状态和治理Pattern，不证明生产执行能力或Design System工程复用性。

站内不会再直接打开`.md`原文件。Canonical与Companion仍以Markdown作为内容源，由浏览器内置阅读器加载、清理并渲染为GFM HTML。Markdown解析使用本地vendored `marked`，其MIT声明位于`vendor/MARKED_LICENSE.md`。

## 验证

- [`verification/REV_0.2_VERIFICATION.md`](./verification/REV_0.2_VERIFICATION.md)：自动化、治理、视觉与内容验证记录；
- [`verification/READER_TEST_PROTOCOL.md`](./verification/READER_TEST_PROTOCOL.md)：无上下文Reader Testing任务、答案与评分标准；
- `verification/test_eix_rev02.py`：Playwright回归脚本。
