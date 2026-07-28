const svg = (label, body, viewBox = "0 0 360 160") => `
  <svg viewBox="${viewBox}" role="img" aria-label="${label}">
    ${body}
  </svg>
`;

const line = (points, className = "atlas-line atlas-line--actual") =>
  `<polyline class="${className}" points="${points}" />`;

const dots = (points, className = "atlas-dot atlas-fill-s1") =>
  points
    .split(" ")
    .map((point) => {
      const [cx, cy] = point.split(",");
      return `<circle class="${className}" cx="${cx}" cy="${cy}" r="4" />`;
    })
    .join("");

const previews = {
  kpi: () =>
    svg(
      "关键数字和趋势微图示例",
      `
        <text class="atlas-kpi" x="24" y="66">92.4%</text>
        <text class="atlas-value atlas-positive" x="26" y="94">+3.2pp · 有利</text>
        ${line("205,91 228,83 251,86 274,67 297,72 320,49")}
        ${dots("205,91 228,83 251,86 274,67 297,72 320,49")}
        <text class="atlas-label" x="205" y="118">最近6期</text>
      `,
    ),
  crosstab: () =>
    svg(
      "带内嵌条的数据表示例",
      `
        <line class="atlas-grid" x1="22" y1="34" x2="338" y2="34" />
        <line class="atlas-grid" x1="22" y1="72" x2="338" y2="72" />
        <line class="atlas-grid" x1="22" y1="110" x2="338" y2="110" />
        <text class="atlas-label" x="28" y="24">对象</text>
        <text class="atlas-label" x="278" y="24">精确值</text>
        <text class="atlas-label" x="28" y="58">对象A</text>
        <text class="atlas-label" x="28" y="96">对象B</text>
        <text class="atlas-label" x="28" y="134">对象C</text>
        <rect class="atlas-fill-muted" x="102" y="45" width="168" height="12" rx="2" />
        <rect class="atlas-fill-muted" x="102" y="83" width="119" height="12" rx="2" />
        <rect class="atlas-fill-muted" x="102" y="121" width="82" height="12" rx="2" />
        <text class="atlas-value" x="312" y="57" text-anchor="end">92</text>
        <text class="atlas-value" x="312" y="95" text-anchor="end">71</text>
        <text class="atlas-value" x="312" y="133" text-anchor="end">58</text>
      `,
    ),
  emphasis: () =>
    svg(
      "强调式横向条形图示例",
      `
        <line class="atlas-axis" x1="88" y1="18" x2="88" y2="142" />
        <text class="atlas-label" x="78" y="43" text-anchor="end">对象A</text>
        <text class="atlas-label" x="78" y="75" text-anchor="end">对象B</text>
        <text class="atlas-label" x="78" y="107" text-anchor="end">对象C</text>
        <text class="atlas-label" x="78" y="139" text-anchor="end">对象D</text>
        <rect class="atlas-fill-s1" x="88" y="29" width="206" height="18" rx="2" />
        <rect class="atlas-fill-muted" x="88" y="61" width="147" height="18" rx="2" />
        <rect class="atlas-fill-muted" x="88" y="93" width="111" height="18" rx="2" />
        <rect class="atlas-fill-muted" x="88" y="125" width="76" height="18" rx="2" />
        <text class="atlas-value" x="304" y="43">92</text>
      `,
    ),
  dot: () =>
    svg(
      "点图示例",
      `
        <line class="atlas-grid" x1="100" y1="30" x2="324" y2="30" />
        <line class="atlas-grid" x1="100" y1="72" x2="324" y2="72" />
        <line class="atlas-grid" x1="100" y1="114" x2="324" y2="114" />
        <text class="atlas-label" x="88" y="34" text-anchor="end">对象A</text>
        <text class="atlas-label" x="88" y="76" text-anchor="end">对象B</text>
        <text class="atlas-label" x="88" y="118" text-anchor="end">对象C</text>
        <circle class="atlas-fill-s1" cx="286" cy="30" r="7" />
        <circle class="atlas-fill-s1" cx="226" cy="72" r="7" />
        <circle class="atlas-fill-s1" cx="168" cy="114" r="7" />
        <text class="atlas-value" x="300" y="34">92</text>
      `,
    ),
  variance: () =>
    svg(
      "零基准差异条示例",
      `
        <line class="atlas-axis" x1="190" y1="16" x2="190" y2="146" />
        <text class="atlas-label" x="68" y="43" text-anchor="end">对象A</text>
        <text class="atlas-label" x="68" y="83" text-anchor="end">对象B</text>
        <text class="atlas-label" x="68" y="123" text-anchor="end">对象C</text>
        <rect class="atlas-fill-negative" x="104" y="28" width="86" height="18" rx="2" />
        <rect class="atlas-fill-positive" x="190" y="68" width="54" height="18" rx="2" />
        <rect class="atlas-fill-negative" x="151" y="108" width="39" height="18" rx="2" />
        <text class="atlas-value atlas-negative" x="96" y="42" text-anchor="end">−18 U</text>
        <text class="atlas-value atlas-positive" x="252" y="82">+9 F</text>
      `,
    ),
  bullet: () =>
    svg(
      "子弹图示例",
      `
        <text class="atlas-label" x="24" y="39">当前绩效</text>
        <rect class="atlas-seq-1" x="24" y="58" width="294" height="34" />
        <rect class="atlas-seq-2" x="24" y="58" width="214" height="34" />
        <rect class="atlas-seq-3" x="24" y="58" width="146" height="34" />
        <rect class="atlas-fill-s1" x="24" y="68" width="194" height="14" rx="2" />
        <line class="atlas-target" x1="242" y1="50" x2="242" y2="101" />
        <text class="atlas-value" x="218" y="126" text-anchor="end">实际 74</text>
        <text class="atlas-label" x="248" y="126">目标 82</text>
      `,
    ),
  dumbbell: () =>
    svg(
      "哑铃图前后对比示例",
      `
        <text class="atlas-label" x="88" y="33" text-anchor="end">对象A</text>
        <text class="atlas-label" x="88" y="77" text-anchor="end">对象B</text>
        <text class="atlas-label" x="88" y="121" text-anchor="end">对象C</text>
        <line class="atlas-link" x1="128" y1="29" x2="286" y2="29" />
        <line class="atlas-link" x1="164" y1="73" x2="238" y2="73" />
        <line class="atlas-link" x1="196" y1="117" x2="218" y2="117" />
        <circle class="atlas-seq-3" cx="128" cy="29" r="8" />
        <circle class="atlas-seq-7" cx="286" cy="29" r="8" />
        <circle class="atlas-seq-3" cx="164" cy="73" r="8" />
        <circle class="atlas-seq-7" cx="238" cy="73" r="8" />
        <circle class="atlas-seq-3" cx="196" cy="117" r="8" />
        <circle class="atlas-seq-7" cx="218" cy="117" r="8" />
        <text class="atlas-label" x="104" y="151">之前</text>
        <text class="atlas-label" x="276" y="151">之后</text>
      `,
    ),
  line: () =>
    svg(
      "实际与计划趋势折线图示例",
      `
        <line class="atlas-grid" x1="34" y1="34" x2="330" y2="34" />
        <line class="atlas-grid" x1="34" y1="78" x2="330" y2="78" />
        <line class="atlas-axis" x1="34" y1="132" x2="330" y2="132" />
        ${line("40,102 88,83 136,91 184,54 232,67 280,45 326,59")}
        ${line("40,110 88,102 136,83 184,75 232,59 280,66 326,48", "atlas-line atlas-line--plan")}
        <text class="atlas-value" x="326" y="53" text-anchor="end">实际</text>
        <text class="atlas-label" x="326" y="43" text-anchor="end">计划</text>
      `,
    ),
  smallMultiples: () =>
    svg(
      "共享尺度趋势小倍数示例",
      `
        <g transform="translate(18 18)">
          <text class="atlas-label" x="0" y="10">对象A</text>
          <line class="atlas-grid" x1="0" y1="72" x2="94" y2="72" />
          ${line("2,60 24,49 46,54 68,29 92,36")}
        </g>
        <g transform="translate(132 18)">
          <text class="atlas-label" x="0" y="10">对象B</text>
          <line class="atlas-grid" x1="0" y1="72" x2="94" y2="72" />
          ${line("2,42 24,51 46,39 68,57 92,50")}
        </g>
        <g transform="translate(246 18)">
          <text class="atlas-label" x="0" y="10">对象C</text>
          <line class="atlas-grid" x1="0" y1="72" x2="94" y2="72" />
          ${line("2,66 24,61 46,52 68,45 92,31")}
        </g>
        <text class="atlas-label" x="18" y="142">共享Y轴 · 同一时间范围</text>
      `,
    ),
  anomaly: () =>
    svg(
      "预期区间与异常点示例",
      `
        <path class="atlas-band-neutral" d="M34,54 L76,49 L118,56 L160,42 L202,50 L244,38 L286,47 L326,42 L326,88 L286,84 L244,78 L202,91 L160,82 L118,96 L76,87 L34,93 Z" />
        ${line("34,74 76,68 118,77 160,62 202,114 244,58 286,66 326,61")}
        <circle class="atlas-fill-negative" cx="202" cy="114" r="7" />
        <path class="atlas-anomaly-shape" d="M202 126 l-6 10 h12 z" />
        <text class="atlas-value atlas-negative" x="214" y="136">异常</text>
        <text class="atlas-label" x="326" y="36" text-anchor="end">预期上界</text>
      `,
    ),
  forecast: () =>
    svg(
      "历史预测和区间示例",
      `
        <path class="atlas-band" d="M220,54 L256,45 L292,37 L328,27 L328,108 L292,96 L256,89 L220,80 Z" />
        ${line("36,103 72,92 108,83 144,72 180,65 220,70")}
        ${line("220,70 256,66 292,62 328,58", "atlas-line atlas-line--forecast")}
        <line class="atlas-divider" x1="220" y1="28" x2="220" y2="128" />
        <text class="atlas-label" x="36" y="145">历史</text>
        <text class="atlas-label" x="328" y="145" text-anchor="end">预测 · 区间</text>
      `,
    ),
  stacked: () =>
    svg(
      "构成堆叠条示例",
      `
        <text class="atlas-label" x="70" y="41" text-anchor="end">对象A</text>
        <text class="atlas-label" x="70" y="83" text-anchor="end">对象B</text>
        <text class="atlas-label" x="70" y="125" text-anchor="end">对象C</text>
        <rect class="atlas-fill-s1" x="82" y="26" width="116" height="20" />
        <rect class="atlas-fill-s2" x="200" y="26" width="68" height="20" />
        <rect class="atlas-fill-s3" x="270" y="26" width="48" height="20" />
        <rect class="atlas-fill-s1" x="82" y="68" width="88" height="20" />
        <rect class="atlas-fill-s2" x="172" y="68" width="92" height="20" />
        <rect class="atlas-fill-s3" x="266" y="68" width="52" height="20" />
        <rect class="atlas-fill-s1" x="82" y="110" width="143" height="20" />
        <rect class="atlas-fill-s2" x="227" y="110" width="51" height="20" />
        <rect class="atlas-fill-s3" x="280" y="110" width="38" height="20" />
      `,
    ),
  waterfall: () =>
    svg(
      "瀑布图贡献拆解示例",
      `
        <line class="atlas-axis" x1="24" y1="132" x2="338" y2="132" />
        <rect class="atlas-fill-muted" x="36" y="42" width="48" height="90" />
        <rect class="atlas-fill-negative" x="98" y="42" width="48" height="31" />
        <rect class="atlas-fill-negative" x="160" y="73" width="48" height="18" />
        <rect class="atlas-fill-positive" x="222" y="82" width="48" height="14" />
        <rect class="atlas-fill-muted" x="284" y="82" width="48" height="50" />
        <line class="atlas-connector" x1="84" y1="42" x2="98" y2="42" />
        <line class="atlas-connector" x1="146" y1="73" x2="160" y2="73" />
        <line class="atlas-connector" x1="208" y1="91" x2="222" y2="91" />
        <line class="atlas-connector" x1="270" y1="82" x2="284" y2="82" />
        <text class="atlas-label" x="60" y="151" text-anchor="middle">计划</text>
        <text class="atlas-label" x="122" y="151" text-anchor="middle">量</text>
        <text class="atlas-label" x="184" y="151" text-anchor="middle">价</text>
        <text class="atlas-label" x="246" y="151" text-anchor="middle">结构</text>
        <text class="atlas-label" x="308" y="151" text-anchor="middle">实际</text>
        <text class="atlas-value atlas-negative" x="122" y="34" text-anchor="middle">−8 U</text>
        <text class="atlas-value atlas-positive" x="246" y="74" text-anchor="middle">+3 F</text>
      `,
    ),
  histogram: () =>
    svg(
      "直方图分布示例",
      `
        <line class="atlas-axis" x1="34" y1="132" x2="332" y2="132" />
        <rect class="atlas-fill-s1" x="48" y="109" width="32" height="23" />
        <rect class="atlas-fill-s1" x="82" y="84" width="32" height="48" />
        <rect class="atlas-fill-s1" x="116" y="51" width="32" height="81" />
        <rect class="atlas-fill-s1" x="150" y="29" width="32" height="103" />
        <rect class="atlas-fill-s1" x="184" y="42" width="32" height="90" />
        <rect class="atlas-fill-s1" x="218" y="68" width="32" height="64" />
        <rect class="atlas-fill-s1" x="252" y="97" width="32" height="35" />
        <rect class="atlas-fill-s1" x="286" y="116" width="32" height="16" />
        <text class="atlas-label" x="34" y="151">分箱宽度：10</text>
      `,
    ),
  boxplot: () =>
    svg(
      "箱线图分布比较示例",
      `
        <text class="atlas-label" x="70" y="42" text-anchor="end">对象A</text>
        <text class="atlas-label" x="70" y="82" text-anchor="end">对象B</text>
        <text class="atlas-label" x="70" y="122" text-anchor="end">对象C</text>
        <line class="atlas-link" x1="94" y1="38" x2="304" y2="38" />
        <rect class="atlas-box" x="148" y="27" width="94" height="22" />
        <line class="atlas-target" x1="198" y1="27" x2="198" y2="49" />
        <line class="atlas-link" x1="112" y1="78" x2="286" y2="78" />
        <rect class="atlas-box" x="156" y="67" width="72" height="22" />
        <line class="atlas-target" x1="188" y1="67" x2="188" y2="89" />
        <line class="atlas-link" x1="124" y1="118" x2="275" y2="118" />
        <rect class="atlas-box" x="167" y="107" width="64" height="22" />
        <line class="atlas-target" x1="207" y1="107" x2="207" y2="129" />
        <circle class="atlas-fill-negative" cx="316" cy="38" r="4" />
      `,
    ),
  heatmap: () =>
    svg(
      "二维交叉量级热力图示例",
      `
        <text class="atlas-label" x="72" y="39" text-anchor="end">对象A</text>
        <text class="atlas-label" x="72" y="75" text-anchor="end">对象B</text>
        <text class="atlas-label" x="72" y="111" text-anchor="end">对象C</text>
        ${[
          [1, 3, 5, 7, 6, 7],
          [2, 2, 3, 2, 4, 3],
          [1, 3, 2, 4, 5, 4],
        ]
          .flatMap((row, rowIndex) =>
            row.map(
              (level, colIndex) =>
                `<rect class="atlas-seq-${level}" x="${84 + colIndex * 38}" y="${
                  22 + rowIndex * 36
                }" width="34" height="28" />`,
            ),
          )
          .join("")}
        <text class="atlas-label" x="101" y="145" text-anchor="middle">1月</text>
        <text class="atlas-label" x="291" y="145" text-anchor="middle">6月</text>
      `,
    ),
  scatter: () =>
    svg(
      "散点关系图示例",
      `
        <line class="atlas-axis" x1="42" y1="132" x2="332" y2="132" />
        <line class="atlas-axis" x1="42" y1="22" x2="42" y2="132" />
        <line class="atlas-trend" x1="64" y1="116" x2="310" y2="42" />
        ${dots("68,111 92,104 116,109 142,87 165,96 190,77 213,70 239,62 264,48 290,54 316,35")}
        <text class="atlas-label" x="330" y="151" text-anchor="end">指标X</text>
        <text class="atlas-label" x="48" y="16">指标Y</text>
      `,
    ),
  sankey: () =>
    svg(
      "流程流转桑基图示例",
      `
        <rect class="atlas-fill-s1" x="28" y="30" width="12" height="96" />
        <rect class="atlas-fill-s4" x="168" y="30" width="12" height="59" />
        <rect class="atlas-fill-s2" x="168" y="99" width="12" height="27" />
        <rect class="atlas-fill-s4" x="320" y="30" width="12" height="42" />
        <rect class="atlas-fill-s2" x="320" y="82" width="12" height="18" />
        <rect class="atlas-fill-s3" x="320" y="110" width="12" height="16" />
        <path class="atlas-flow atlas-flow-s4" d="M40,30 C102,30 106,30 168,30 L168,89 C106,89 102,89 40,89 Z" />
        <path class="atlas-flow atlas-flow-s2" d="M40,89 C102,89 106,99 168,99 L168,126 C106,126 102,126 40,126 Z" />
        <path class="atlas-flow atlas-flow-s4" d="M180,30 C246,30 254,30 320,30 L320,72 C254,72 246,72 180,72 Z" />
        <path class="atlas-flow atlas-flow-s2" d="M180,72 C246,72 254,82 320,82 L320,100 C254,100 246,89 180,89 Z" />
        <path class="atlas-flow atlas-flow-s3" d="M180,99 C246,99 254,110 320,110 L320,126 C254,126 246,126 180,126 Z" />
        <text class="atlas-label" x="28" y="22">进入 161</text>
        <text class="atlas-label" x="168" y="22">自动 108</text>
        <text class="atlas-label" x="292" y="22">完成 96</text>
      `,
    ),
  funnel: () =>
    svg(
      "同队列转化漏斗示例",
      `
        <path class="atlas-funnel-1" d="M38,24 H322 L292,55 H68 Z" />
        <path class="atlas-funnel-2" d="M68,60 H292 L264,91 H96 Z" />
        <path class="atlas-funnel-3" d="M96,96 H264 L238,127 H122 Z" />
        <text class="atlas-value atlas-on-dark" x="180" y="46" text-anchor="middle">线索 1,240</text>
        <text class="atlas-value atlas-on-dark" x="180" y="82" text-anchor="middle">到店 618</text>
        <text class="atlas-value atlas-on-dark" x="180" y="118" text-anchor="middle">成交 186</text>
        <text class="atlas-label" x="180" y="151" text-anchor="middle">同一线索队列 · 15.0%</text>
      `,
    ),
  processMap: () =>
    svg(
      "流程路径与频次示例",
      `
        <path class="atlas-process-link atlas-process-link--strong" d="M62,76 C112,76 118,40 162,40" />
        <path class="atlas-process-link" d="M62,76 C112,76 118,116 162,116" />
        <path class="atlas-process-link atlas-process-link--strong" d="M206,40 C252,40 260,76 308,76" />
        <path class="atlas-process-link" d="M206,116 C252,116 260,76 308,76" />
        <rect class="atlas-node" x="22" y="58" width="40" height="36" rx="4" />
        <rect class="atlas-node" x="162" y="22" width="44" height="36" rx="4" />
        <rect class="atlas-node" x="162" y="98" width="44" height="36" rx="4" />
        <rect class="atlas-node" x="308" y="58" width="34" height="36" rx="4" />
        <text class="atlas-label" x="42" y="80" text-anchor="middle">进入</text>
        <text class="atlas-label" x="184" y="44" text-anchor="middle">自动</text>
        <text class="atlas-label" x="184" y="120" text-anchor="middle">人审</text>
        <text class="atlas-label" x="325" y="80" text-anchor="middle">完成</text>
      `,
    ),
  timeline: () =>
    svg(
      "单个任务时间轴和服务时限示例",
      `
        <line class="atlas-axis" x1="40" y1="80" x2="328" y2="80" />
        <rect class="atlas-band-sla" x="40" y="58" width="210" height="44" rx="3" />
        <circle class="atlas-fill-s1" cx="58" cy="80" r="7" />
        <circle class="atlas-fill-s1" cx="138" cy="80" r="7" />
        <circle class="atlas-fill-s2" cx="226" cy="80" r="7" />
        <circle class="atlas-fill-negative" cx="294" cy="80" r="7" />
        <text class="atlas-label" x="58" y="42" text-anchor="middle">创建</text>
        <text class="atlas-label" x="138" y="122" text-anchor="middle">校验</text>
        <text class="atlas-label" x="226" y="42" text-anchor="middle">人审</text>
        <text class="atlas-label" x="294" y="122" text-anchor="middle">超时</text>
        <text class="atlas-label" x="250" y="54" text-anchor="end">服务时限</text>
      `,
    ),
  pareto: () =>
    svg(
      "受控帕累托图示例",
      `
        <line class="atlas-axis" x1="38" y1="132" x2="330" y2="132" />
        <line class="atlas-pareto-80" x1="38" y1="52" x2="330" y2="52" />
        <rect class="atlas-fill-s1" x="52" y="44" width="34" height="88" />
        <rect class="atlas-fill-s1" x="104" y="70" width="34" height="62" />
        <rect class="atlas-fill-s1" x="156" y="91" width="34" height="41" />
        <rect class="atlas-fill-s1" x="208" y="105" width="34" height="27" />
        <rect class="atlas-fill-s1" x="260" y="116" width="34" height="16" />
        ${line("69,98 121,70 173,53 225,43 277,37", "atlas-line atlas-line--pareto")}
        ${dots("69,98 121,70 173,53 225,43 277,37", "atlas-dot atlas-fill-neutral")}
        <text class="atlas-label" x="326" y="48" text-anchor="end">累计80%</text>
      `,
    ),
};

export const atlasFamilies = [
  { id: "all", label: "全部" },
  { id: "summary", label: "数字与核对" },
  { id: "comparison", label: "比较" },
  { id: "time", label: "时间" },
  { id: "composition", label: "构成与拆解" },
  { id: "distribution", label: "分布与关系" },
  { id: "process", label: "流程" },
  { id: "conditional", label: "条件例外" },
];

export const chartAtlas = [
  {
    id: "kpi",
    family: "summary",
    name: "关键数字 + 趋势微图",
    usage: "一个当前值，并需要补充短期方向",
    color: "单一色相",
    stop: "口径或比较基准不完整",
    preview: previews.kpi,
  },
  {
    id: "crosstab",
    family: "summary",
    name: "交叉表 / 内嵌条",
    usage: "逐位核对数字、高基数类别或不同单位",
    color: "中性 + 单列顺序",
    stop: "无；这是多数图形的降级表达",
    preview: previews.crosstab,
  },
  {
    id: "horizontal-bar-emphasis",
    family: "comparison",
    name: "强调式横向条形图",
    usage: "只有一个对象是结论重点，其余用于参照",
    color: "1个系列色 + 灰",
    stop: "对象不可比或类别超过20",
    preview: previews.emphasis,
  },
  {
    id: "dot-plot",
    family: "comparison",
    name: "点图",
    usage: "按共享刻度比较多个对象的位置",
    color: "单一色相",
    stop: "样本不可比或需要逐位核对",
    preview: previews.dot,
  },
  {
    id: "variance-bar",
    family: "comparison",
    name: "零基准差异条",
    usage: "实际相对计划或基准的方向与幅度",
    color: "发散色阶",
    stop: "基准不可比或有利/不利未定义",
    preview: previews.variance,
  },
  {
    id: "bullet",
    family: "comparison",
    name: "子弹图",
    usage: "一个实际值相对目标和绩效区间",
    color: "顺序色阶 + 目标线",
    stop: "缺少目标或区间定义",
    preview: previews.bullet,
  },
  {
    id: "dumbbell",
    family: "comparison",
    name: "哑铃图",
    usage: "多个对象的两个版本或时点前后对比",
    color: "同一色相两个深浅",
    stop: "超过两个端点或超过15行",
    preview: previews.dumbbell,
  },
  {
    id: "line",
    family: "time",
    name: "实际 / 计划趋势",
    usage: "指标随时间变化，并与计划或基准比较",
    color: "Actual实线 · Plan虚线",
    stop: "少于3个时间点或口径中途变更",
    preview: previews.line,
  },
  {
    id: "small-multiples-line",
    family: "time",
    name: "趋势小倍数",
    usage: "多个对象共享尺度比较趋势",
    color: "每格单一色相",
    stop: "超过12格或无法共享尺度",
    preview: previews.smallMultiples,
  },
  {
    id: "anomaly-band",
    family: "time",
    name: "预期区间与异常点",
    usage: "识别偏离经过认证预期区间的点",
    color: "时间线 + 状态叠加",
    stop: "历史、季节性或阈值未认证",
    preview: previews.anomaly,
  },
  {
    id: "forecast-line-with-band",
    family: "time",
    name: "预测趋势与区间",
    usage: "区分历史、预测中位值和不确定范围",
    color: "Actual实线 · Forecast点线+区间",
    stop: "历史不足、无区间或无假设",
    preview: previews.forecast,
  },
  {
    id: "stacked-bar",
    family: "composition",
    name: "堆叠条 / 百分比堆叠条",
    usage: "互斥部分的整体构成或结构变化",
    color: "稳定系列色",
    stop: "分类重叠、不可加总或超过5部分",
    preview: previews.stacked,
  },
  {
    id: "waterfall",
    family: "composition",
    name: "瀑布图",
    usage: "从起点到终点拆解贡献",
    color: "发散方向 + 中性端点",
    stop: "贡献项不互斥、不完备或无法核对",
    preview: previews.waterfall,
  },
  {
    id: "histogram",
    family: "distribution",
    name: "直方图",
    usage: "查看单一连续变量的分布形态",
    color: "单一色相",
    stop: "样本不足或分箱规则不明确",
    preview: previews.histogram,
  },
  {
    id: "box-plot",
    family: "distribution",
    name: "箱线图",
    usage: "比较分组的中位数、离散程度和候选离群值",
    color: "单一色相 + 状态标记",
    stop: "样本过小或四分位规则不明确",
    preview: previews.boxplot,
  },
  {
    id: "heatmap",
    family: "distribution",
    name: "热力图",
    usage: "二维网格上的连续量级",
    color: "单一色相顺序色阶",
    stop: "单元格过多、缺失值不明或名义类别",
    preview: previews.heatmap,
  },
  {
    id: "scatter",
    family: "distribution",
    name: "散点 + 趋势线",
    usage: "两个同粒度指标在当前样本中的关系",
    color: "单一色相；分组最多3个",
    stop: "粒度错配、样本不足或未标非因果",
    preview: previews.scatter,
  },
  {
    id: "sankey",
    family: "process",
    name: "桑基图",
    usage: "Case流转或多层归因路径",
    color: "稳定路径身份",
    stop: "节点不守恒或节点超过约7个",
    preview: previews.sankey,
  },
  {
    id: "funnel",
    family: "process",
    name: "漏斗 + 阶段表",
    usage: "同一队列从阶段到阶段的转化",
    color: "单一色相顺序",
    stop: "分子分母不属于同一队列",
    preview: previews.funnel,
  },
  {
    id: "process-map",
    family: "process",
    name: "流程路径 / 状态转移",
    usage: "实际路径、分支和频次",
    color: "路径身份 + 线宽频次",
    stop: "路径过多未折叠或缺少事件顺序",
    preview: previews.processMap,
  },
  {
    id: "case-timeline",
    family: "process",
    name: "Case时间轴",
    usage: "单个任务的事件顺序与服务时限",
    color: "时间中性 + 状态叠加",
    stop: "事件时间不可比或时区不明确",
    preview: previews.timeline,
  },
  {
    id: "pareto",
    family: "conditional",
    name: "帕累托图",
    usage: "判断少数类别是否贡献大部分问题",
    color: "单一色相 + 固定累计线",
    stop: "累计轴不是0–100%或不是由柱值推导",
    preview: previews.pareto,
  },
];
