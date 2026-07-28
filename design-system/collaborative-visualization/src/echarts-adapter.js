import { validateChartSpec } from "./chart-validator.js";
import { seriesProfile, seriesSlot } from "./series-registry.js";

const defaultPalette = {
  series: [
    "#0078D6",
    "#299C6E",
    "#8A94A6",
    "#C9A227",
    "#B52D2A",
    "#0A4276",
    "#7A4FD4",
    "#C25E12",
    "#0E7C86",
    "#C0468C",
  ],
  actual: "#171A1D",
  plan: "#53606B",
  forecast: "#0078D6",
  muted: "#B7C0C8",
  favorable: "#0078D6",
  unfavorable: "#C23934",
  uncertainty: "rgba(0, 120, 214, 0.14)",
  text: "#171A1D",
  secondaryText: "#53606B",
  grid: "#E4E8EC",
  sequential: ["#E3EFFA", "#C2DDF4", "#93C4EC", "#5EA6E2", "#2C85D3", "#0F63AC", "#0A4276"],
};

/**
 * Resolve EIX visualization CSS variables for canvas-based ECharts rendering.
 * SVG consumers can use CSS variables directly; Canvas consumers cannot.
 */
export function readVisualizationPalette(root = document.documentElement) {
  const style = getComputedStyle(root);
  const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
  return {
    series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) =>
      read(`--eix-viz-series-${index}`, defaultPalette.series[index - 1]),
    ),
    actual: read("--eix-viz-time-actual", defaultPalette.actual),
    plan: read("--eix-viz-time-plan", defaultPalette.plan),
    forecast: read("--eix-viz-time-forecast", defaultPalette.forecast),
    muted: read("--eix-viz-emphasis-muted", defaultPalette.muted),
    favorable: read("--eix-viz-diverging-favorable-medium", defaultPalette.favorable),
    unfavorable: read("--eix-viz-diverging-unfavorable-medium", defaultPalette.unfavorable),
    uncertainty: read("--eix-viz-uncertainty-fill", defaultPalette.uncertainty),
    text: read("--eix-viz-value", defaultPalette.text),
    secondaryText: read("--eix-viz-label", defaultPalette.secondaryText),
    grid: read("--eix-viz-grid", defaultPalette.grid),
    sequential: [1, 2, 3, 4, 5, 6, 7].map((index) =>
      read(`--eix-viz-sequential-${index}`, defaultPalette.sequential[index - 1]),
    ),
  };
}

function seriesColor(spec, seriesId, palette) {
  if (
    seriesProfile(spec) === "emphasis" &&
    !spec.encoding.series?.focusIds?.includes(String(seriesId))
  ) {
    return palette.muted;
  }
  return palette.series[seriesSlot(spec, seriesId) - 1];
}

function baseOption(spec, palette) {
  return {
    animationDuration: 180,
    color: palette.series,
    aria: {
      enabled: true,
      description: spec.accessibleSummary,
    },
    textStyle: {
      color: palette.text,
      fontFamily: "MBCorpoSText, PingFang SC, Microsoft YaHei, sans-serif",
    },
    grid: { left: 80, right: 32, top: 28, bottom: 48, containLabel: true },
    tooltip: {
      trigger: "item",
      confine: true,
      appendToBody: false,
    },
    xAxis: {
      axisLine: { lineStyle: { color: palette.grid } },
      axisLabel: { color: palette.secondaryText },
      splitLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      axisLine: { lineStyle: { color: palette.grid } },
      axisLabel: { color: palette.secondaryText },
      splitLine: { lineStyle: { color: palette.grid } },
    },
  };
}

function rankingOption(spec, palette) {
  const valueField = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const rows = [...spec.data].sort((a, b) => b[valueField] - a[valueField]);
  return {
    ...baseOption(spec, palette),
    xAxis: { type: "value", min: 0, splitLine: { lineStyle: { color: palette.grid } } },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((row) => row[labelField]),
      axisLabel: { color: palette.secondaryText },
    },
    series: [
      {
        type: "bar",
        data: rows.map((row) => ({
          value: row[valueField],
          itemStyle: {
            color: row.focus === "primary" ? palette.series[0] : palette.muted,
          },
        })),
        label: { show: true, position: "right", color: palette.text },
      },
    ],
  };
}

function varianceOption(spec, palette) {
  const valueField = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  return {
    ...baseOption(spec, palette),
    xAxis: { type: "value", splitLine: { lineStyle: { color: palette.grid } } },
    yAxis: {
      type: "category",
      inverse: true,
      data: spec.data.map((row) => row[labelField]),
      axisLabel: { color: palette.secondaryText },
    },
    series: [
      {
        type: "bar",
        data: spec.data.map((row) => ({
          value: row[valueField],
          itemStyle: {
            color: row.direction === "unfavorable" ? palette.unfavorable : palette.favorable,
          },
          label: {
            show: true,
            position: row[valueField] >= 0 ? "right" : "left",
            color: palette.text,
          },
        })),
      },
    ],
  };
}

function lineOption(spec, palette) {
  const xField = spec.encoding.x.field;
  const valueField = spec.encoding.y.field;
  const seriesField = spec.encoding.series?.field || spec.encoding.detail?.field;
  const periods = [...new Set(spec.data.map((row) => row[xField]))];
  const seriesNames = [...new Set(spec.data.map((row) => row[seriesField] || "值"))];
  return {
    ...baseOption(spec, palette),
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: periods,
      axisLabel: { color: palette.secondaryText },
    },
    yAxis: { type: "value", scale: true, splitLine: { lineStyle: { color: palette.grid } } },
    legend: {
      show: seriesNames.length > 1,
      type: "scroll",
      bottom: 0,
      data: seriesNames,
    },
    series: seriesNames.map((name) => {
      const normalized = String(name).toLowerCase();
      const plan =
        normalized.includes("基准") || normalized.includes("计划") || normalized.includes("plan");
      const forecast = normalized.includes("预测") || normalized.includes("forecast");
      return {
        name,
        type: "line",
        symbolSize: 7,
        connectNulls: false,
        data: periods.map(
          (period) =>
            spec.data.find(
              (row) => row[xField] === period && String(row[seriesField] || "值") === String(name),
            )?.[valueField] ?? null,
        ),
        lineStyle: {
          width: 2,
          type: plan ? "dashed" : forecast ? "dotted" : "solid",
          color: plan ? palette.plan : forecast ? palette.forecast : seriesColor(spec, name, palette),
        },
        itemStyle: {
          color: plan ? palette.plan : forecast ? palette.forecast : seriesColor(spec, name, palette),
        },
      };
    }),
  };
}

function waterfallOption(spec, palette) {
  let running = 0;
  const helper = [];
  const values = [];
  const colors = [];
  spec.data.forEach((row) => {
    if (row.kind === "start") {
      running = row.value;
      helper.push(0);
      values.push(row.value);
      colors.push(palette.muted);
      return;
    }
    if (row.kind === "end") {
      helper.push(0);
      values.push(row.value);
      colors.push(palette.muted);
      return;
    }
    const next = running + row.value;
    helper.push(Math.min(running, next));
    values.push(Math.abs(row.value));
    colors.push(row.direction === "unfavorable" ? palette.unfavorable : palette.favorable);
    running = next;
  });
  return {
    ...baseOption(spec, palette),
    xAxis: {
      type: "category",
      data: spec.data.map((row) => row.label),
      axisLabel: { color: palette.secondaryText },
    },
    yAxis: { type: "value", min: 0, splitLine: { lineStyle: { color: palette.grid } } },
    series: [
      {
        type: "bar",
        stack: "bridge",
        silent: true,
        itemStyle: { color: "transparent" },
        emphasis: { itemStyle: { color: "transparent" } },
        data: helper,
      },
      {
        type: "bar",
        stack: "bridge",
        data: values.map((value, index) => ({
          value,
          itemStyle: { color: colors[index] },
          label: {
            show: true,
            position: "top",
            formatter:
              spec.data[index].kind === "contribution" && spec.data[index].value > 0
                ? `+${spec.data[index].value}`
                : spec.data[index].value,
          },
        })),
      },
    ],
  };
}

function forecastOption(spec, palette) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const periods = spec.data.map((row) => row[xField]);
  const actual = spec.data.map((row) => (row.kind === "actual" ? row[yField] : null));
  const anchorIndex = spec.data.findLastIndex((row) => row.kind === "actual");
  const forecast = spec.data.map((row, index) =>
    row.kind === "forecast" || index === anchorIndex ? row[yField] : null,
  );
  const lower = spec.data.map((row) => (row.kind === "forecast" ? row.lower : null));
  const interval = spec.data.map((row) =>
    row.kind === "forecast" ? row.upper - row.lower : null,
  );
  return {
    ...baseOption(spec, palette),
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: periods,
      axisLabel: { color: palette.secondaryText },
    },
    yAxis: { type: "value", scale: true, splitLine: { lineStyle: { color: palette.grid } } },
    series: [
      {
        name: "实际",
        type: "line",
        data: actual,
        lineStyle: { color: palette.actual, width: 2 },
        itemStyle: { color: palette.actual },
      },
      {
        name: "区间下界",
        type: "line",
        data: lower,
        stack: "interval",
        symbol: "none",
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        tooltip: { show: false },
      },
      {
        name: "预测区间",
        type: "line",
        data: interval,
        stack: "interval",
        symbol: "none",
        lineStyle: { opacity: 0 },
        areaStyle: { color: palette.uncertainty, opacity: 1 },
        tooltip: { show: false },
      },
      {
        name: "预测",
        type: "line",
        data: forecast,
        lineStyle: { color: palette.forecast, width: 2, type: "dotted" },
        itemStyle: { color: palette.forecast },
      },
    ],
  };
}

function scatterOption(spec, palette) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const labelField = spec.encoding.detail?.field || "label";
  return {
    ...baseOption(spec, palette),
    xAxis: {
      type: "value",
      name: spec.scope.metric.split("×")[0]?.trim(),
      splitLine: { lineStyle: { color: palette.grid } },
    },
    yAxis: {
      type: "value",
      name: spec.scope.metric.split("×")[1]?.trim(),
      splitLine: { lineStyle: { color: palette.grid } },
    },
    series: [
      {
        type: "scatter",
        symbolSize: 12,
        data: spec.data.map((row) => ({
          name: row[labelField],
          value: [row[xField], row[yField]],
        })),
        itemStyle: { color: palette.series[0], opacity: 0.82 },
      },
    ],
  };
}

function dumbbellOption(spec, palette) {
  const beforeField = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const afterField = spec.encoding.detail?.field || "after";
  const labels = spec.data.map((row) => row[labelField]);
  const connectorSeries = spec.data.map((row) => ({
    name: row[labelField],
    type: "line",
    symbol: "none",
    silent: true,
    lineStyle: { color: palette.muted, width: 3 },
    data: [
      [row[beforeField], row[labelField]],
      [row[afterField], row[labelField]],
    ],
  }));
  return {
    ...baseOption(spec, palette),
    tooltip: { trigger: "item", confine: true },
    xAxis: { type: "value", scale: true, splitLine: { lineStyle: { color: palette.grid } } },
    yAxis: {
      type: "category",
      inverse: true,
      data: labels,
      axisLabel: { color: palette.secondaryText },
    },
    series: [
      ...connectorSeries,
      {
        name: "之前",
        type: "scatter",
        symbolSize: 13,
        itemStyle: { color: palette.sequential?.[2] || palette.series[0] },
        data: spec.data.map((row) => [row[beforeField], row[labelField]]),
      },
      {
        name: "之后",
        type: "scatter",
        symbolSize: 13,
        itemStyle: { color: palette.sequential?.[6] || palette.series[0] },
        data: spec.data.map((row) => [row[afterField], row[labelField]]),
      },
    ],
  };
}

function stackedOption(spec, palette) {
  const valueField = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const seriesField = spec.encoding.series.field;
  const labels = [...new Set(spec.data.map((row) => row[labelField]))];
  const seriesNames = [...new Set(spec.data.map((row) => row[seriesField]))];
  return {
    ...baseOption(spec, palette),
    legend: { top: 0, textStyle: { color: palette.secondaryText } },
    xAxis: { type: "value", min: 0, splitLine: { lineStyle: { color: palette.grid } } },
    yAxis: {
      type: "category",
      inverse: true,
      data: labels,
      axisLabel: { color: palette.secondaryText },
    },
    legend: {
      show: seriesNames.length > 1,
      type: "scroll",
      bottom: 0,
      data: seriesNames,
    },
    series: seriesNames.map((name) => ({
      name,
      type: "bar",
      stack: "total",
      itemStyle: { color: seriesColor(spec, name, palette) },
      data: labels.map(
        (label) =>
          spec.data.find((row) => row[labelField] === label && row[seriesField] === name)?.[
            valueField
          ] ?? 0,
      ),
    })),
  };
}

function histogramOption(spec, palette) {
  const field = spec.encoding.x.field;
  const values = spec.data.map((row) => Number(row[field])).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const count = 8;
  const width = (max - min) / count || 1;
  const bins = Array.from({ length: count }, (_, index) => ({
    start: min + index * width,
    end: min + (index + 1) * width,
    count: 0,
  }));
  values.forEach((value) => {
    bins[Math.min(count - 1, Math.max(0, Math.floor((value - min) / width)))].count += 1;
  });
  return {
    ...baseOption(spec, palette),
    xAxis: {
      type: "category",
      data: bins.map((bin) => `${Math.round(bin.start)}–${Math.round(bin.end)}`),
      axisLabel: { color: palette.secondaryText, interval: 1 },
    },
    yAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: palette.grid } } },
    series: [
      {
        type: "bar",
        barCategoryGap: "4%",
        data: bins.map((bin) => bin.count),
        itemStyle: { color: palette.series[0] },
      },
    ],
  };
}

function heatmapOption(spec, palette) {
  const columnField = spec.encoding.x.field;
  const rowField = spec.encoding.y.field;
  const valueField = spec.encoding.color.field;
  const columns = [...new Set(spec.data.map((row) => row[columnField]))];
  const rows = [...new Set(spec.data.map((row) => row[rowField]))];
  const values = spec.data.map((row) => Number(row[valueField]));
  return {
    ...baseOption(spec, palette),
    grid: { left: 80, right: 42, top: 24, bottom: 62, containLabel: true },
    xAxis: { type: "category", data: columns, splitArea: { show: true } },
    yAxis: { type: "category", data: rows, splitArea: { show: true } },
    visualMap: {
      min: Math.min(...values),
      max: Math.max(...values),
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 2,
      inRange: { color: palette.sequential || defaultPalette.sequential },
      textStyle: { color: palette.secondaryText },
    },
    series: [
      {
        type: "heatmap",
        data: spec.data.map((row) => [
          columns.indexOf(row[columnField]),
          rows.indexOf(row[rowField]),
          row[valueField],
        ]),
        label: { show: false },
      },
    ],
  };
}

function anomalyOption(spec, palette) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const periods = spec.data.map((row) => row[xField]);
  const lower = spec.data.map((row) => row.lower);
  const interval = spec.data.map((row) => row.upper - row.lower);
  return {
    ...baseOption(spec, palette),
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: periods,
      axisLabel: { color: palette.secondaryText },
    },
    yAxis: { type: "value", scale: true, splitLine: { lineStyle: { color: palette.grid } } },
    series: [
      {
        name: "预期下界",
        type: "line",
        stack: "expected",
        symbol: "none",
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        tooltip: { show: false },
        data: lower,
      },
      {
        name: "预期区间",
        type: "line",
        stack: "expected",
        symbol: "none",
        lineStyle: { opacity: 0 },
        areaStyle: { color: palette.muted, opacity: 0.28 },
        tooltip: { show: false },
        data: interval,
      },
      {
        name: "实际",
        type: "line",
        data: spec.data.map((row) => ({
          value: row[yField],
          symbol: row.anomaly ? "triangle" : "circle",
          symbolSize: row.anomaly ? 15 : 7,
          itemStyle: { color: row.anomaly ? palette.unfavorable : palette.actual },
          label: {
            show: Boolean(row.anomaly),
            formatter: "异常",
            position: "bottom",
            color: palette.text,
          },
        })),
        lineStyle: { color: palette.actual, width: 2 },
      },
    ],
  };
}

function sankeyOption(spec, palette) {
  const names = [...new Set(spec.data.flatMap((row) => [row.source, row.target]))];
  const colorByName = new Map([
    ["进入", palette.series[0]],
    ["自动处理", palette.series[0]],
    ["人工处理", palette.series[1]],
    ["完成", palette.series[3]],
    ["异常", palette.series[1]],
    ["升级", palette.series[2]],
  ]);
  return {
    ...baseOption(spec, palette),
    tooltip: { trigger: "item", confine: true },
    series: [
      {
        type: "sankey",
        left: 30,
        right: 72,
        top: 22,
        bottom: 22,
        nodeWidth: 14,
        nodeGap: 14,
        layoutIterations: 0,
        emphasis: { focus: "adjacency" },
        label: { color: palette.secondaryText },
        data: names.map((name) => ({
          name,
          itemStyle: { color: colorByName.get(name) || palette.muted },
        })),
        links: spec.data.map((row) => ({
          source: row.source,
          target: row.target,
          value: row.value,
        })),
        lineStyle: { color: "source", opacity: 0.28, curveness: 0.5 },
      },
    ],
  };
}

/**
 * Convert a governed ChartSpec into an ECharts option.
 * The adapter refuses blocked ChartSpecs instead of silently drawing them.
 */
export function toEChartsOption(spec, palette = defaultPalette) {
  const validation = validateChartSpec(spec);
  if (validation.status === "blocked") {
    const error = new Error("ChartSpec failed governance validation.");
    error.validation = validation;
    throw error;
  }
  switch (spec.representation) {
    case "horizontal-bar-emphasis":
    case "dot-plot":
      return rankingOption(spec, palette);
    case "variance-bar":
    case "bullet":
      return varianceOption(spec, palette);
    case "dumbbell":
      return dumbbellOption(spec, palette);
    case "line":
    case "small-multiples-line":
      return lineOption(spec, palette);
    case "waterfall":
    case "contribution-bar":
      return waterfallOption(spec, palette);
    case "forecast-line-with-band":
      return forecastOption(spec, palette);
    case "scatter":
      return scatterOption(spec, palette);
    case "stacked-bar":
    case "100-percent-stacked-bar":
      return stackedOption(spec, palette);
    case "histogram":
      return histogramOption(spec, palette);
    case "heatmap":
      return heatmapOption(spec, palette);
    case "anomaly-band":
      return anomalyOption(spec, palette);
    case "sankey":
      return sankeyOption(spec, palette);
    default:
      throw new Error(`No ECharts reference adapter for ${spec.representation}.`);
  }
}
