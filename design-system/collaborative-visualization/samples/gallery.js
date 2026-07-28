import { bindChartBlocks, renderChartBlock } from "../src/chart-block.js";
import { routeChart } from "../src/chart-router.js";
import { atlasFamilies, chartAtlas } from "./atlas.js";

const samples = [
  {
    id: "ranking",
    index: "01",
    label: "排名与重点",
    question: "哪些对象最高或最低？",
    conditions: "2–20个同口径对象；排序规则固定",
    fallback: "对象不足时用关键数字，类别过多时用数据表",
    usage: [
      "对象必须使用相同指标、期间、版本和单位。",
      "只突出结论重点，其余对象使用弱化色。",
      "排序字段和值必须随结果记录，刷新后不得静默改变。",
    ],
    request: { workQuestion: "rank", categories: 4, focusCount: 1, rowCount: 4 },
  },
  {
    id: "variance",
    index: "02",
    label: "差异与方向",
    question: "实际相对基准差多少？",
    conditions: "实际与基准口径一致；有利/不利方向已定义",
    fallback: "缺少可比基准时只展示实际值和支撑数据",
    usage: [
      "零线是差异判断的固定参照，不得裁剪或隐藏。",
      "有利与不利按指标业务定义计算，不能只依赖红绿。",
      "图形必须同时显示实际、基准、差异值和单位。",
    ],
    request: { workQuestion: "variance", categories: 4, comparison: true, rowCount: 4 },
  },
  {
    id: "dumbbell",
    index: "03",
    label: "前后状态比较",
    question: "同一批对象的两个状态相差多少？",
    conditions: "每个对象都有两个同口径端点；对象身份稳定",
    fallback: "端点不完整时使用数据表，不能把不同对象连成一对",
    usage: [
      "浅色和深色表示同一指标的两个状态，不是两个独立系列身份。",
      "连线长度表达差距，端点必须可以回到同一对象的支撑数据。",
      "如果还要表达业务有利/不利，应增加文字或符号，不用第三种颜色替代。",
    ],
    request: { workQuestion: "compare", categories: 3, paired: true, rowCount: 3 },
  },
  {
    id: "trend",
    index: "04",
    label: "趋势与拐点",
    question: "指标随时间如何变化？",
    conditions: "至少3个同粒度时间点；指标定义稳定",
    fallback: "时间点不足时使用数据表或当前值",
    usage: [
      "Actual使用实线，Plan使用虚线，预测使用点线与区间。",
      "缺失点必须保留为空缺，不得用连线制造连续性。",
      "多对象趋势优先使用共享尺度的小倍数，避免折线缠绕。",
    ],
    request: {
      workQuestion: "trend",
      timePoints: 6,
      series: 2,
      versionComparison: true,
      rowCount: 12,
    },
  },
  {
    id: "anomaly",
    index: "05",
    label: "异常与预期区间",
    question: "哪些时间点偏离了已认证的预期范围？",
    conditions: "至少12个历史点；基线、阈值和季节性处理已认证",
    fallback: "条件不足时降级为描述性趋势，不声称识别出异常",
    usage: [
      "预期区间与实际线同时出现，异常点用形状、颜色和文字三重标识。",
      "异常只代表偏离阈值，不等于根因已经确定。",
      "基线版本和阈值变化后，原异常结论必须重新校验。",
    ],
    request: { workQuestion: "anomaly", timePoints: 12, rowCount: 12 },
  },
  {
    id: "waterfall",
    index: "06",
    label: "贡献与桥接",
    question: "哪些因素构成总变化？",
    conditions: "贡献项可加总、互斥且完备；起点与终点可核对",
    fallback: "条件不满足时使用排序贡献表，不声称完成归因",
    usage: [
      "起点、每项贡献与终点必须在数值上完全核对。",
      "贡献项超过12项时改用排序贡献条或分组下钻。",
      "无法覆盖的剩余差异必须单独展示为未解释项。",
    ],
    request: { workQuestion: "contribution", categories: 3, additive: true, rowCount: 5 },
  },
  {
    id: "composition",
    index: "07",
    label: "构成与结构",
    question: "整体由哪些互斥部分构成？",
    conditions: "构成项互斥、可加总；常规模式不超过5个系列",
    fallback: "构成项重叠或单位不一致时使用数据表",
    usage: [
      "系列色只用于稳定的构成身份，跨图表保持同一顺序。",
      "需要比较比例时使用100%堆叠，需要比较总量时保留绝对值堆叠。",
      "构成项超过5个时使用筛选、小倍数或显式高密度模式；不得静默合并为“其他”。",
    ],
    request: {
      workQuestion: "composition",
      categories: 3,
      series: 3,
      additive: true,
      rowCount: 9,
    },
  },
  {
    id: "forecast",
    index: "08",
    label: "预测与区间",
    question: "未来范围可能是多少？",
    conditions: "至少12个历史点；预测范围、区间和假设齐全",
    fallback: "历史不足时只保留描述性趋势，不生成预测",
    usage: [
      "历史、预测和预测区间使用不同线型与填充。",
      "标题与叙事必须把预测写成范围或情景，不写成事实。",
      "模型假设、训练范围和更新时间必须随结果可达。",
    ],
    request: { workQuestion: "forecast", timePoints: 15, rowCount: 15 },
  },
  {
    id: "distribution",
    index: "09",
    label: "分布与集中区间",
    question: "观察值集中在哪里，尾部和离群情况如何？",
    conditions: "至少20个同粒度观察值；分箱规则可见",
    fallback: "样本不足时展示排序数据和描述性统计",
    usage: [
      "直方图的横轴是连续数值区间，柱间不得留出分类间距。",
      "分箱宽度必须随结果记录，改变分箱应形成可见的分析变更。",
      "多个分组比较分布时改用箱线图或小倍数，避免重叠直方图。",
    ],
    request: { workQuestion: "distribution", categories: 1, rowCount: 20 },
  },
  {
    id: "heatmap",
    index: "10",
    label: "二维量级矩阵",
    question: "两个离散维度交叉后，哪些区域量级较高？",
    conditions: "矩阵组合完整；单元格数量不超过120；同一连续指标",
    fallback: "矩阵过密或需要精确核对时使用交叉表",
    usage: [
      "热力图使用单一色相的顺序色阶，并始终提供有刻度的图例。",
      "色彩只表示量级，不承担对象身份、状态或有利/不利含义。",
      "高低判断必须可以切换到同源数据表，不在格子里塞满数字。",
    ],
    request: {
      workQuestion: "compare",
      categories: 3,
      matrixRows: 3,
      matrixColumns: 6,
      rowCount: 18,
    },
  },
  {
    id: "scatter",
    index: "11",
    label: "关系与假设",
    question: "两个指标是否同向变化？",
    conditions: "两个同粒度指标；至少12个观察值",
    fallback: "样本或粒度不足时使用数据表，不生成关系结论",
    usage: [
      "散点图只能描述当前样本中的关系，不能直接表述因果。",
      "异常点必须可定位到支撑数据，并保留筛选范围。",
      "趋势线仅作辅助；样本量、控制变量和限制需要可见。",
    ],
    request: { workQuestion: "relationship", measures: 2, rowCount: 12 },
  },
  {
    id: "sankey",
    index: "12",
    label: "流程流转与路径",
    question: "任务从哪里进入，又流向了哪些结果？",
    conditions: "中间节点流入等于流出；可见节点不超过7个",
    fallback: "节点不守恒或路径过多时使用流转表并先折叠路径",
    usage: [
      "链路宽度只编码流量，不编码置信度、质量或自动化程度。",
      "节点必须守恒；无法解释的差额要显示为“未映射”，不能硬画。",
      "超过7个节点先折叠或筛选；不要让桑基图变成不可读的面条图。",
    ],
    request: { workQuestion: "flow", nodes: 6, conservation: true, rowCount: 6 },
  },
];

const representationLabels = {
  "horizontal-bar-emphasis": "重点横向条形图",
  "variance-bar": "零基准差异条",
  dumbbell: "成对状态哑铃图",
  line: "时间折线图",
  "small-multiples-line": "共享尺度小倍数折线图",
  waterfall: "贡献瀑布图",
  "stacked-bar": "构成堆叠条",
  histogram: "分布直方图",
  heatmap: "顺序色阶热力图",
  "anomaly-band": "预期区间异常图",
  "forecast-line-with-band": "带区间的预测折线图",
  scatter: "散点关系图",
  sankey: "流量桑基图",
  crosstab: "支撑数据表",
  "contribution-bar": "排序贡献条",
};

const checkLabels = {
  "comparable-scope": "对象口径一致",
  "stable-sort": "排序规则已固定",
  "baseline-comparable": "基准可比",
  "favorable-direction-defined": "有利/不利方向已定义",
  "time-grain-consistent": "时间粒度一致",
  "definition-stable": "指标定义稳定",
  "shared-scale-valid": "共享尺度有效",
  "contributions-mutually-exclusive": "贡献项互不重叠",
  "contributions-exhaustive": "贡献项覆盖完整",
  "bridge-reconciles": "起点、贡献与终点可核对",
  "history-sufficient": "历史长度充足",
  "forecast-horizon-declared": "预测范围已声明",
  "interval-present": "预测区间存在",
  "assumptions-present": "预测假设已记录",
  "grains-compatible": "两个指标粒度一致",
  "sample-size-sufficient": "样本数量充足",
  "non-causal-label-present": "非因果说明可见",
  "paired-endpoints-comparable": "两个端点口径一致",
  "pair-identity-stable": "对象身份稳定",
  "baseline-certified": "预期基线已认证",
  "threshold-certified": "异常阈值已认证",
  "seasonality-addressed": "季节性已处理",
  "categories-mutually-exclusive": "构成项互不重叠",
  "parts-compatible": "构成项可加总",
  "binning-explained": "分箱规则可见",
  "matrix-complete": "矩阵组合完整",
  "sequential-scale-declared": "顺序色阶已声明",
  "flow-conservation": "节点流量守恒",
  "path-count-readable": "路径数量可读",
};

const codeSamples = {
  tokens: `/* 图形只使用语义化数据表达令牌 */
.analysis-chart {
  color: var(--eix-viz-value);
  background: var(--eix-viz-surface);
  border-color: var(--semantic-border-subtle);
}

.analysis-chart__actual { stroke: var(--eix-viz-time-actual); }
.analysis-chart__plan { stroke: var(--eix-viz-time-plan); }
.analysis-chart__forecast { stroke: var(--eix-viz-time-forecast); }`,
  echarts: `import { toEChartsOption } from "../src/echarts-adapter.js";
import { validateChartSpec } from "../src/chart-validator.js";

const validation = validateChartSpec(chartSpec);
if (validation.status === "blocked") {
  renderFallback(validation.fallback);
} else {
  chart.setOption(toEChartsOption(chartSpec));
}`,
  react: `// 参考实现不依赖尚未发布的 EIX 组件包
<ChartBlock
  spec={chartSpec}
  validation={validateChartSpec(chartSpec)}
  ChartRenderer={EChartsRenderer}
  onAction={handleAnalysisAction}
/>`,
};

const deliverySources = {
  usage: {
    href: "../../../#/document?doc=visualization&from=design-system",
    label: "打开完整规范",
  },
  json: {
    href: "../eix-visualization.design.json",
    label: "打开 Design JSON",
  },
  tokens: {
    href: "../eix-visualization.tokens.css",
    label: "打开 CSS Token",
  },
  echarts: {
    href: "../src/echarts-adapter.js",
    label: "打开 ECharts 适配器",
  },
  react: {
    href: "./react/ChartBlock.tsx",
    label: "打开 React 样例",
  },
};

const state = {
  activeId: "ranking",
  deliveryTab: "usage",
  atlasFamily: "all",
  specs: new Map(),
};

const nav = document.querySelector("#chartNav");
const specimen = document.querySelector("#specimen");
const modeButton = document.querySelector("#modeButton");
const deliveryPanel = document.querySelector("#deliveryPanel");
const deliverySource = document.querySelector("#deliverySource");
const atlasFilters = document.querySelector("#atlasFilters");
const atlasGrid = document.querySelector("#atlasGrid");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function renderNavigation() {
  nav.innerHTML = samples
    .map(
      (sample) => `
        <button
          type="button"
          role="listitem"
          class="gallery-nav__item"
          data-sample="${sample.id}"
          aria-current="${sample.id === state.activeId}"
        >
          <span>${sample.index}</span>
          <span>
            <strong>${sample.label}</strong>
            <small>${sample.question}</small>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderAtlas() {
  atlasFilters.innerHTML = atlasFamilies
    .map(
      (family) => `
        <button
          type="button"
          class="gallery-atlas__filter"
          data-atlas-family="${family.id}"
          aria-pressed="${family.id === state.atlasFamily}"
        >${escapeHtml(family.label)}</button>
      `,
    )
    .join("");

  const familyNames = new Map(atlasFamilies.map((family) => [family.id, family.label]));
  const visible =
    state.atlasFamily === "all"
      ? chartAtlas
      : chartAtlas.filter((entry) => entry.family === state.atlasFamily);
  atlasGrid.innerHTML = visible
    .map(
      (entry) => `
        <article class="gallery-atlas__card" data-atlas-id="${entry.id}">
          <header>
            <span>${escapeHtml(familyNames.get(entry.family) || entry.family)}</span>
            <h3>${escapeHtml(entry.name)}</h3>
          </header>
          <dl class="gallery-atlas__decision">
            <div><dt>用于</dt><dd>${escapeHtml(entry.usage)}</dd></div>
            <div><dt>不适用</dt><dd>${escapeHtml(entry.stop)}</dd></div>
          </dl>
          <div class="gallery-atlas__preview">${entry.preview()}</div>
          <dl class="gallery-atlas__encoding">
            <div><dt>色彩</dt><dd>${escapeHtml(entry.color)}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
  atlasGrid.setAttribute("aria-label", `当前显示${visible.length}种标准表达`);
}

function updateNavigation() {
  nav.querySelectorAll("[data-sample]").forEach((button) => {
    button.setAttribute("aria-current", String(button.dataset.sample === state.activeId));
  });
}

function renderChecks(requiredChecks) {
  document.querySelector("#routeChecks").innerHTML = requiredChecks
    .map((check) => `<span><i aria-hidden="true"></i>${escapeHtml(checkLabels[check] || check)}</span>`)
    .join("");
}

function designJsonSnippet(spec) {
  return JSON.stringify(
    {
      id: spec.id,
      intent: spec.intent,
      representation: spec.representation,
      claim: spec.claim,
      validation: spec.validation,
      evidenceRefs: spec.evidenceRefs,
    },
    null,
    2,
  );
}

function renderDelivery() {
  const sample = samples.find((item) => item.id === state.activeId);
  const spec = state.specs.get(state.activeId);
  if (!sample || !spec) return;

  const source = deliverySources[state.deliveryTab];
  deliverySource.href = source.href;
  deliverySource.textContent = source.label;
  document.querySelectorAll("[data-delivery-tab]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.deliveryTab === state.deliveryTab));
  });

  if (state.deliveryTab === "usage") {
    deliveryPanel.innerHTML = `
      <div class="gallery-usage">
        <div>
          <span>适用问题</span>
          <strong>${escapeHtml(sample.question)}</strong>
        </div>
        <ul>${sample.usage.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    `;
    return;
  }

  const descriptions = {
    json: "给设计工具与规范站使用：定义选图、固定区域、状态、禁用模式和交互边界。",
    tokens: "给样式实现使用：图形语义通过令牌表达，不在业务组件中复制色值。",
    echarts: "给 Canvas 图表实现使用：先校验 ChartSpec，再由确定性适配器生成配置。",
    react: "给产品前端使用：ChartBlock 组合图形、数据表、解释、依据和降级状态。",
  };
  const code = state.deliveryTab === "json" ? designJsonSnippet(spec) : codeSamples[state.deliveryTab];
  deliveryPanel.innerHTML = `
    <div class="gallery-code-intro">${escapeHtml(descriptions[state.deliveryTab])}</div>
    <pre tabindex="0"><code>${escapeHtml(code)}</code></pre>
  `;
}

function renderActive() {
  const sample = samples.find((item) => item.id === state.activeId);
  const spec = state.specs.get(state.activeId);
  if (!sample || !spec) return;
  const decision = routeChart(sample.request);

  document.querySelector("#routeQuestion").textContent = sample.question;
  document.querySelector("#routeConditions").textContent = sample.conditions;
  document.querySelector("#routeRepresentation").textContent =
    representationLabels[decision.representation] || decision.representation;
  document.querySelector("#routeFallback").textContent = sample.fallback;
  document.querySelector("#routeRationale").textContent = decision.rationale;
  renderChecks(decision.requiredChecks);

  specimen.innerHTML = renderChartBlock(spec, { profile: "compact" });
  updateNavigation();
  renderDelivery();
}

async function load() {
  try {
    const specs = await Promise.all(
      samples.map(async (sample) => {
        const response = await fetch(`./specs/${sample.id}.json`);
        if (!response.ok) throw new Error(`无法载入 ${sample.id}.json`);
        return [sample.id, await response.json()];
      }),
    );
    state.specs = new Map(specs);
    renderNavigation();
    renderAtlas();
    renderActive();
  } catch (error) {
    specimen.innerHTML = `<div class="gallery-loading" role="alert">${escapeHtml(error.message)}</div>`;
  }
}

nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sample]");
  if (!button || button.dataset.sample === state.activeId) return;
  state.activeId = button.dataset.sample;
  renderActive();
});

document.querySelector(".gallery-delivery__tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delivery-tab]");
  if (!button || button.dataset.deliveryTab === state.deliveryTab) return;
  state.deliveryTab = button.dataset.deliveryTab;
  renderDelivery();
});

atlasFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-atlas-family]");
  if (!button || button.dataset.atlasFamily === state.atlasFamily) return;
  state.atlasFamily = button.dataset.atlasFamily;
  renderAtlas();
});

modeButton.addEventListener("click", () => {
  const dark = document.documentElement.dataset.mode !== "dark";
  document.documentElement.dataset.mode = dark ? "dark" : "light";
  modeButton.setAttribute("aria-pressed", String(dark));
  modeButton.querySelector("strong").textContent = dark ? "深色" : "浅色";
});

bindChartBlocks(document);
load();
