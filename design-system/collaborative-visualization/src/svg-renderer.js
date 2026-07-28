/**
 * Dependency-free SVG reference renderer for EIX ChartSpec.
 *
 * It is intentionally small: the renderer demonstrates the visual contract,
 * while ChartSpec and the validator remain the source of truth. Production
 * consumers may replace this renderer with ECharts without changing ChartSpec.
 */

const WIDTH = 760;
const HEIGHT = 300;
const MARGIN = { top: 22, right: 42, bottom: 48, left: 96 };

const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const finite = (value) => Number.isFinite(Number(value));
const number = (value) => Number(value);
const format = (value) =>
  finite(value)
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(number(value))
    : "—";

function extent(values, includeZero = false) {
  const valid = values.filter(finite).map(number);
  if (valid.length === 0) return [0, 1];
  let min = Math.min(...valid);
  let max = Math.max(...valid);
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (min === max) {
    const padding = Math.abs(min || 1) * 0.1;
    return [min - padding, max + padding];
  }
  const padding = (max - min) * 0.08;
  return [min - padding, max + padding];
}

function linear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + ((number(value) - d0) / span) * (r1 - r0);
}

function linePath(points) {
  return points
    .filter(([x, y]) => finite(x) && finite(y))
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

function axes(x0, y0, x1, y1, horizontalTicks = 4) {
  const grid = Array.from({ length: horizontalTicks + 1 }, (_, index) => {
    const y = y0 + ((y1 - y0) * index) / horizontalTicks;
    return `<line class="eix-chart-grid" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" />`;
  }).join("");
  return `${grid}<line class="eix-chart-axis" x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" />`;
}

function markGroup({ key, label, body }) {
  const safeKey = escapeXml(key);
  return `<g class="eix-chart-mark" role="button" tabindex="0" aria-label="${escapeXml(
    label,
  )}" aria-selected="false" data-mark-key="${safeKey}">${body}</g>`;
}

function renderRanking(spec) {
  const field = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const rows = [...spec.data].sort((a, b) => number(b[field]) - number(a[field]));
  const x0 = MARGIN.left;
  const x1 = WIDTH - MARGIN.right;
  const y0 = MARGIN.top;
  const y1 = HEIGHT - MARGIN.bottom;
  const x = linear(extent(rows.map((row) => row[field]), true), [x0, x1]);
  const rowHeight = (y1 - y0) / rows.length;
  const zero = x(0);
  const bars = rows
    .map((row, index) => {
      const value = number(row[field]);
      const y = y0 + index * rowHeight + rowHeight * 0.18;
      const height = rowHeight * 0.62;
      const end = x(value);
      const left = Math.min(zero, end);
      const width = Math.max(2, Math.abs(end - zero));
      const fill =
        row.focus === "primary"
          ? "var(--eix-viz-emphasis-primary)"
          : "var(--eix-viz-emphasis-muted)";
      return markGroup({
        key: row[labelField],
        label: `${row[labelField]}，${format(value)} ${spec.scope.unit}`,
        body: `
          <text class="eix-chart-label" x="${x0 - 12}" y="${y + height / 2 + 4}" text-anchor="end">${escapeXml(
            row[labelField],
          )}</text>
          <rect x="${left}" y="${y}" width="${width}" height="${height}" rx="3" fill="${fill}" />
          <text class="eix-chart-value" x="${end + (value >= 0 ? 8 : -8)}" y="${
            y + height / 2 + 4
          }" text-anchor="${value >= 0 ? "start" : "end"}">${format(value)}</text>
        `,
      });
    })
    .join("");
  return `${axes(x0, y0, x1, y1)}<line class="eix-chart-axis" x1="${zero}" y1="${y0}" x2="${zero}" y2="${y1}" />${bars}`;
}

function renderVariance(spec) {
  const field = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const rows = [...spec.data].sort((a, b) => number(a[field]) - number(b[field]));
  const x0 = MARGIN.left;
  const x1 = WIDTH - MARGIN.right;
  const y0 = 42;
  const y1 = HEIGHT - MARGIN.bottom;
  const x = linear(extent(rows.map((row) => row[field]), true), [x0, x1]);
  const zero = x(0);
  const rowHeight = (y1 - y0) / rows.length;
  const negativeDirection =
    rows.find((row) => number(row[field]) < 0)?.direction === "favorable" ? "有利" : "不利";
  const positiveDirection =
    rows.find((row) => number(row[field]) > 0)?.direction === "unfavorable" ? "不利" : "有利";
  const bars = rows
    .map((row, index) => {
      const value = number(row[field]);
      const y = y0 + index * rowHeight + rowHeight * 0.18;
      const height = rowHeight * 0.5;
      const end = x(value);
      const left = Math.min(zero, end);
      const width = Math.max(2, Math.abs(end - zero));
      const unfavorable = row.direction === "unfavorable";
      const fill = unfavorable
        ? "var(--eix-viz-diverging-unfavorable-medium)"
        : "var(--eix-viz-diverging-favorable-medium)";
      const direction = unfavorable ? "不利" : "有利";
      return markGroup({
        key: row[labelField],
        label: `${row[labelField]}，${format(value)} ${spec.scope.unit}，${direction}`,
        body: `
          <text class="eix-chart-label" x="${x0 - 12}" y="${y + height / 2 + 4}" text-anchor="end">${escapeXml(
            row[labelField],
          )}</text>
          <rect x="${left}" y="${y}" width="${width}" height="${height}" rx="3" fill="${fill}" />
          <text class="eix-chart-value" x="${end}" y="${
            y - 7
          }" text-anchor="${value >= 0 ? "start" : "end"}">${value > 0 ? "+" : ""}${format(
            value,
          )} · ${direction}</text>
        `,
      });
    })
    .join("");
  const guide = `
    <text class="eix-chart-label" x="${x0}" y="20" text-anchor="start">← ${negativeDirection}</text>
    <text class="eix-chart-label" x="${zero}" y="20" text-anchor="middle">0 · 基准</text>
    <text class="eix-chart-label" x="${x1}" y="20" text-anchor="end">${positiveDirection} →</text>
  `;
  return `${guide}${axes(x0, y0, x1, y1)}<line class="eix-chart-axis" x1="${zero}" y1="${y0}" x2="${zero}" y2="${y1}" />${bars}`;
}

function renderTrend(spec) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const seriesField = spec.encoding.series?.field || spec.encoding.detail?.field;
  const periods = [...new Set(spec.data.map((row) => row[xField]))];
  const series = [...new Set(spec.data.map((row) => row[seriesField] || "值"))];
  const x0 = MARGIN.left;
  const x1 = WIDTH - MARGIN.right;
  const y0 = MARGIN.top;
  const y1 = HEIGHT - MARGIN.bottom;
  const x = (period) =>
    x0 + (periods.indexOf(period) / Math.max(1, periods.length - 1)) * (x1 - x0);
  const y = linear(extent(spec.data.map((row) => row[yField])), [y1, y0]);
  const labels = periods
    .map(
      (period, index) =>
        `<text class="eix-chart-label" x="${x(period)}" y="${y1 + 26}" text-anchor="${
          index === 0 ? "start" : index === periods.length - 1 ? "end" : "middle"
        }">${escapeXml(period)}</text>`,
    )
    .join("");
  const lines = series
    .map((seriesName, seriesIndex) => {
      const rows = periods
        .map((period) =>
          spec.data.find(
            (row) =>
              row[xField] === period && String(row[seriesField] || "值") === String(seriesName),
          ),
        )
        .filter(Boolean);
      const points = rows.map((row) => [x(row[xField]), y(row[yField])]);
      const normalized = String(seriesName).toLowerCase();
      const lineClass =
        normalized.includes("基准") || normalized.includes("计划") || normalized.includes("plan")
          ? "eix-chart-line--plan"
          : normalized.includes("预测") || normalized.includes("forecast")
            ? "eix-chart-line--forecast"
            : "eix-chart-line--actual";
      const dots = rows
        .map((row) =>
          markGroup({
            key: `${seriesName}-${row[xField]}`,
            label: `${seriesName}，${row[xField]}，${format(row[yField])} ${spec.scope.unit}`,
            body: `<circle cx="${x(row[xField])}" cy="${y(row[yField])}" r="4.5" fill="var(--eix-viz-series-${
              Math.min(seriesIndex + 1, 5)
            })" />`,
          }),
        )
        .join("");
      return `<path class="eix-chart-line ${lineClass}" d="${linePath(points)}" />${dots}`;
    })
    .join("");
  return `${axes(x0, y0, x1, y1)}${labels}${lines}`;
}

function renderForecast(spec) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const periods = spec.data.map((row) => row[xField]);
  const forecast = spec.data.filter((row) => row.kind === "forecast");
  const actual = spec.data.filter((row) => row.kind === "actual");
  const x0 = MARGIN.left;
  const x1 = WIDTH - MARGIN.right;
  const y0 = MARGIN.top;
  const y1 = HEIGHT - MARGIN.bottom;
  const allValues = spec.data.flatMap((row) => [row[yField], row.lower, row.upper]).filter(finite);
  const y = linear(extent(allValues), [y1, y0]);
  const x = (period) =>
    x0 + (periods.indexOf(period) / Math.max(1, periods.length - 1)) * (x1 - x0);
  const anchor = actual.at(-1);
  const actualPoints = actual.map((row) => [x(row[xField]), y(row[yField])]);
  const forecastPoints = [anchor, ...forecast].filter(Boolean).map((row) => [
    x(row[xField]),
    y(row[yField]),
  ]);
  const upper = forecast.map((row) => [x(row[xField]), y(row.upper)]);
  const lower = [...forecast].reverse().map((row) => [x(row[xField]), y(row.lower)]);
  const band = [...upper, ...lower]
    .map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`)
    .join(" ");
  const labels = periods
    .filter((_, index) => index === 0 || index === periods.length - 1 || index === actual.length - 1)
    .map(
      (period) =>
        `<text class="eix-chart-label" x="${x(period)}" y="${y1 + 26}" text-anchor="middle">${escapeXml(
          period,
        )}</text>`,
    )
    .join("");
  const marks = spec.data
    .map((row) =>
      markGroup({
        key: row[xField],
        label:
          row.kind === "forecast"
            ? `${row[xField]}，预测 ${format(row[yField])}，区间 ${format(row.lower)} 到 ${format(
                row.upper,
              )} ${spec.scope.unit}`
            : `${row[xField]}，实际 ${format(row[yField])} ${spec.scope.unit}`,
        body: `<circle cx="${x(row[xField])}" cy="${y(row[yField])}" r="4.5" fill="${
          row.kind === "forecast"
            ? "var(--eix-viz-time-forecast)"
            : "var(--eix-viz-time-actual)"
        }" />`,
      }),
    )
    .join("");
  return `
    ${axes(x0, y0, x1, y1)}
    <polygon points="${band}" fill="var(--eix-viz-uncertainty-fill)" stroke="var(--eix-viz-uncertainty-border)" />
    <path class="eix-chart-line eix-chart-line--actual" d="${linePath(actualPoints)}" />
    <path class="eix-chart-line eix-chart-line--forecast" d="${linePath(forecastPoints)}" />
    ${labels}${marks}
  `;
}

function renderWaterfall(spec) {
  const rows = spec.data;
  const x0 = MARGIN.left;
  const x1 = WIDTH - MARGIN.right;
  const y0 = MARGIN.top;
  const y1 = HEIGHT - MARGIN.bottom;
  let running = 0;
  const computed = rows.map((row) => {
    if (row.kind === "start") {
      running = number(row.value);
      return { ...row, from: 0, to: running };
    }
    if (row.kind === "end") return { ...row, from: 0, to: number(row.value) };
    const from = running;
    running += number(row.value);
    return { ...row, from, to: running };
  });
  const domain = extent(computed.flatMap((row) => [row.from, row.to]), true);
  const y = linear(domain, [y1, y0]);
  const step = (x1 - x0) / rows.length;
  const width = Math.min(72, step * 0.58);
  const bars = computed
    .map((row, index) => {
      const x = x0 + index * step + (step - width) / 2;
      const top = Math.min(y(row.from), y(row.to));
      const height = Math.max(2, Math.abs(y(row.from) - y(row.to)));
      const fill =
        row.direction === "unfavorable"
          ? "var(--eix-viz-diverging-unfavorable-medium)"
          : row.direction === "favorable"
            ? "var(--eix-viz-diverging-favorable-medium)"
            : "var(--eix-viz-emphasis-muted)";
      const connector =
        index < computed.length - 1
          ? `<line class="eix-chart-grid" x1="${x + width}" y1="${y(row.to)}" x2="${
              x0 + (index + 1) * step + (step - width) / 2
            }" y2="${y(row.to)}" />`
          : "";
      return `${connector}${markGroup({
        key: row.id || row.label,
        label: `${row.label}，${row.kind === "contribution" && row.value > 0 ? "+" : ""}${format(
          row.value,
        )} ${spec.scope.unit}`,
        body: `
          <rect x="${x}" y="${top}" width="${width}" height="${height}" rx="3" fill="${fill}" />
          <text class="eix-chart-value" x="${x + width / 2}" y="${top - 8}" text-anchor="middle">${
            row.kind === "contribution" && row.value > 0 ? "+" : ""
          }${format(row.value)}</text>
          <text class="eix-chart-label" x="${x + width / 2}" y="${y1 + 26}" text-anchor="middle">${escapeXml(
            row.label,
          )}</text>
        `,
      })}`;
    })
    .join("");
  return `${axes(x0, y0, x1, y1)}${bars}`;
}

function renderScatter(spec) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const labelField = spec.encoding.detail?.field || "label";
  const x0 = MARGIN.left;
  const x1 = WIDTH - MARGIN.right;
  const y0 = MARGIN.top;
  const y1 = HEIGHT - MARGIN.bottom;
  const x = linear(extent(spec.data.map((row) => row[xField])), [x0, x1]);
  const y = linear(extent(spec.data.map((row) => row[yField])), [y1, y0]);
  const marks = spec.data
    .map((row) =>
      markGroup({
        key: row[labelField],
        label: `${row[labelField]}，X ${format(row[xField])}，Y ${format(row[yField])}`,
        body: `<circle cx="${x(row[xField])}" cy="${y(row[yField])}" r="7" fill="var(--eix-viz-series-1)" opacity="0.82" />`,
      }),
    )
    .join("");
  return `${axes(x0, y0, x1, y1)}${marks}<text class="eix-chart-label" x="${
    (x0 + x1) / 2
  }" y="${HEIGHT - 8}" text-anchor="middle">${escapeXml(spec.scope.metric.split("×")[0].trim())}</text>`;
}

function renderDumbbell(spec) {
  const beforeField = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const afterField = spec.encoding.detail?.field || "after";
  const rows = [...spec.data].sort(
    (a, b) => Math.abs(number(b[afterField]) - number(b[beforeField])) - Math.abs(number(a[afterField]) - number(a[beforeField])),
  );
  const x0 = 126;
  const x1 = WIDTH - 120;
  const y0 = 48;
  const y1 = HEIGHT - 58;
  const x = linear(
    extent(rows.flatMap((row) => [row[beforeField], row[afterField]])),
    [x0, x1],
  );
  const rowHeight = (y1 - y0) / Math.max(1, rows.length);
  const marks = rows
    .map((row, index) => {
      const y = y0 + rowHeight * (index + 0.5);
      const before = number(row[beforeField]);
      const after = number(row[afterField]);
      const delta = after - before;
      const start = x(before);
      const end = x(after);
      return markGroup({
        key: row[labelField],
        label: `${row[labelField]}，之前 ${format(before)}，之后 ${format(after)}，差值 ${
          delta > 0 ? "+" : ""
        }${format(delta)} ${spec.scope.unit}`,
        body: `
          <text class="eix-chart-label" x="${x0 - 18}" y="${y + 5}" text-anchor="end">${escapeXml(
            row[labelField],
          )}</text>
          <line class="eix-chart-dumbbell-link" x1="${start}" y1="${y}" x2="${end}" y2="${y}" />
          <circle cx="${start}" cy="${y}" r="8" fill="var(--eix-viz-sequential-3)" />
          <circle cx="${end}" cy="${y}" r="8" fill="var(--eix-viz-sequential-7)" />
          <text class="eix-chart-value" x="${x1 + 18}" y="${y + 5}">${
            delta > 0 ? "+" : ""
          }${format(delta)}</text>
        `,
      });
    })
    .join("");
  return `
    <text class="eix-chart-label" x="${x0}" y="${HEIGHT - 18}">之前 · 浅色</text>
    <text class="eix-chart-label" x="${x1}" y="${HEIGHT - 18}" text-anchor="end">之后 · 深色</text>
    ${marks}
  `;
}

function renderSmallMultiples(spec) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const seriesField = spec.encoding.series?.field || spec.encoding.detail?.field;
  const periods = [...new Set(spec.data.map((row) => row[xField]))];
  const series = [...new Set(spec.data.map((row) => row[seriesField] || "值"))];
  const columns = Math.min(3, series.length);
  const rowsCount = Math.ceil(series.length / columns);
  const panelGap = 28;
  const left = 36;
  const right = WIDTH - 28;
  const top = 26;
  const bottom = HEIGHT - 30;
  const panelWidth = (right - left - panelGap * (columns - 1)) / columns;
  const panelHeight = (bottom - top - panelGap * (rowsCount - 1)) / rowsCount;
  const y = linear(extent(spec.data.map((row) => row[yField])), [panelHeight - 22, 28]);
  return series
    .map((seriesName, index) => {
      const column = index % columns;
      const rowIndex = Math.floor(index / columns);
      const tx = left + column * (panelWidth + panelGap);
      const ty = top + rowIndex * (panelHeight + panelGap);
      const rows = periods
        .map((period) =>
          spec.data.find(
            (item) =>
              item[xField] === period &&
              String(item[seriesField] || "值") === String(seriesName),
          ),
        )
        .filter(Boolean);
      const x = (period) =>
        (periods.indexOf(period) / Math.max(1, periods.length - 1)) * panelWidth;
      const points = rows.map((item) => [x(item[xField]), y(item[yField])]);
      const dots = rows
        .map((item) =>
          markGroup({
            key: `${seriesName}-${item[xField]}`,
            label: `${seriesName}，${item[xField]}，${format(item[yField])} ${spec.scope.unit}`,
            body: `<circle cx="${x(item[xField])}" cy="${y(item[yField])}" r="3.8" fill="var(--eix-viz-series-1)" />`,
          }),
        )
        .join("");
      return `
        <g transform="translate(${tx} ${ty})">
          <text class="eix-chart-value" x="0" y="12">${escapeXml(seriesName)}</text>
          <line class="eix-chart-axis" x1="0" y1="${panelHeight - 22}" x2="${panelWidth}" y2="${
            panelHeight - 22
          }" />
          <path class="eix-chart-line eix-chart-line--actual" d="${linePath(points)}" />
          ${dots}
        </g>
      `;
    })
    .join("");
}

function renderStacked(spec) {
  const valueField = spec.encoding.x.field;
  const labelField = spec.encoding.y.field;
  const seriesField = spec.encoding.series.field;
  const labels = [...new Set(spec.data.map((row) => row[labelField]))];
  const series = [...new Set(spec.data.map((row) => row[seriesField]))];
  const totals = new Map(
    labels.map((label) => [
      label,
      spec.data
        .filter((row) => row[labelField] === label)
        .reduce((sum, row) => sum + number(row[valueField]), 0),
    ]),
  );
  const x0 = 116;
  const x1 = WIDTH - 46;
  const y0 = 58;
  const y1 = HEIGHT - 42;
  const x = linear([0, Math.max(...totals.values())], [x0, x1]);
  const rowHeight = (y1 - y0) / labels.length;
  const legend = series
    .map(
      (name, index) => `
        <g transform="translate(${x0 + index * 150} 18)">
          <rect width="12" height="12" rx="2" fill="var(--eix-viz-series-${index + 1})" />
          <text class="eix-chart-label" x="19" y="11">${escapeXml(name)}</text>
        </g>
      `,
    )
    .join("");
  const bars = labels
    .map((label, labelIndex) => {
      let running = 0;
      const y = y0 + labelIndex * rowHeight + rowHeight * 0.19;
      const height = rowHeight * 0.62;
      const parts = series
        .map((seriesName, seriesIndex) => {
          const item = spec.data.find(
            (row) => row[labelField] === label && row[seriesField] === seriesName,
          );
          const value = number(item?.[valueField] || 0);
          const start = x(running);
          running += value;
          const end = x(running);
          return markGroup({
            key: `${label}-${seriesName}`,
            label: `${label}，${seriesName}，${format(value)} ${spec.scope.unit}`,
            body: `<rect x="${start}" y="${y}" width="${Math.max(1, end - start - 1)}" height="${height}" rx="2" fill="var(--eix-viz-series-${
              seriesIndex + 1
            })" />`,
          });
        })
        .join("");
      return `
        <text class="eix-chart-label" x="${x0 - 16}" y="${y + height / 2 + 5}" text-anchor="end">${escapeXml(
          label,
        )}</text>
        ${parts}
        <text class="eix-chart-value" x="${x1 + 10}" y="${y + height / 2 + 5}">${format(
          totals.get(label),
        )}</text>
      `;
    })
    .join("");
  return `${legend}${bars}`;
}

function histogramBins(values, count = 8) {
  const [min, max] = extent(values);
  const width = (max - min) / count || 1;
  const bins = Array.from({ length: count }, (_, index) => ({
    start: min + index * width,
    end: min + (index + 1) * width,
    count: 0,
  }));
  values.forEach((value) => {
    const index = Math.min(count - 1, Math.max(0, Math.floor((number(value) - min) / width)));
    bins[index].count += 1;
  });
  return bins;
}

function renderHistogram(spec) {
  const field = spec.encoding.x.field;
  const bins = histogramBins(spec.data.map((row) => row[field]));
  const x0 = 66;
  const x1 = WIDTH - 34;
  const y0 = 32;
  const y1 = HEIGHT - 54;
  const y = linear([0, Math.max(...bins.map((bin) => bin.count))], [y1, y0]);
  const step = (x1 - x0) / bins.length;
  const bars = bins
    .map((bin, index) =>
      markGroup({
        key: `bin-${index}`,
        label: `${format(bin.start)}至${format(bin.end)}，${bin.count}个观察值`,
        body: `
          <rect x="${x0 + index * step + 1}" y="${y(bin.count)}" width="${Math.max(
            1,
            step - 2,
          )}" height="${y1 - y(bin.count)}" fill="var(--eix-viz-series-1)" opacity="0.88" />
        `,
      }),
    )
    .join("");
  return `
    ${axes(x0, y0, x1, y1)}
    ${bars}
    <text class="eix-chart-label" x="${x0}" y="${y1 + 27}">${format(bins[0].start)}</text>
    <text class="eix-chart-label" x="${x1}" y="${y1 + 27}" text-anchor="end">${format(
      bins.at(-1).end,
    )}</text>
    <text class="eix-chart-label" x="${(x0 + x1) / 2}" y="${HEIGHT - 8}" text-anchor="middle">固定分箱 · 频数</text>
  `;
}

function renderHeatmap(spec) {
  const columnField = spec.encoding.x.field;
  const rowField = spec.encoding.y.field;
  const valueField = spec.encoding.color.field;
  const columns = [...new Set(spec.data.map((row) => row[columnField]))];
  const rows = [...new Set(spec.data.map((row) => row[rowField]))];
  const x0 = 118;
  const x1 = WIDTH - 48;
  const y0 = 30;
  const y1 = HEIGHT - 76;
  const cellWidth = (x1 - x0) / columns.length;
  const cellHeight = (y1 - y0) / rows.length;
  const [min, max] = extent(spec.data.map((row) => row[valueField]));
  const level = (value) =>
    Math.min(7, Math.max(1, Math.ceil(((number(value) - min) / (max - min || 1)) * 7)));
  const cells = spec.data
    .map((row) => {
      const columnIndex = columns.indexOf(row[columnField]);
      const rowIndex = rows.indexOf(row[rowField]);
      const x = x0 + columnIndex * cellWidth;
      const y = y0 + rowIndex * cellHeight;
      return markGroup({
        key: `${row[rowField]}-${row[columnField]}`,
        label: `${row[rowField]}，${row[columnField]}，${format(row[valueField])} ${spec.scope.unit}`,
        body: `<rect x="${x + 2}" y="${y + 2}" width="${cellWidth - 4}" height="${
          cellHeight - 4
        }" rx="2" fill="var(--eix-viz-sequential-${level(row[valueField])})" />`,
      });
    })
    .join("");
  const rowLabels = rows
    .map(
      (row, index) =>
        `<text class="eix-chart-label" x="${x0 - 14}" y="${
          y0 + index * cellHeight + cellHeight / 2 + 5
        }" text-anchor="end">${escapeXml(row)}</text>`,
    )
    .join("");
  const columnLabels = columns
    .map(
      (column, index) =>
        `<text class="eix-chart-label" x="${
          x0 + index * cellWidth + cellWidth / 2
        }" y="${y1 + 24}" text-anchor="middle">${escapeXml(column)}</text>`,
    )
    .join("");
  const legend = Array.from(
    { length: 7 },
    (_, index) =>
      `<rect x="${x0 + index * 30}" y="${HEIGHT - 29}" width="30" height="10" fill="var(--eix-viz-sequential-${
        index + 1
      })" />`,
  ).join("");
  return `
    ${cells}${rowLabels}${columnLabels}${legend}
    <text class="eix-chart-label" x="${x0 - 10}" y="${HEIGHT - 19}" text-anchor="end">低</text>
    <text class="eix-chart-label" x="${x0 + 222}" y="${HEIGHT - 19}">高</text>
  `;
}

function renderAnomaly(spec) {
  const xField = spec.encoding.x.field;
  const yField = spec.encoding.y.field;
  const periods = spec.data.map((row) => row[xField]);
  const x0 = 66;
  const x1 = WIDTH - 40;
  const y0 = 30;
  const y1 = HEIGHT - 52;
  const values = spec.data.flatMap((row) => [row[yField], row.lower, row.upper]);
  const x = (period) =>
    x0 + (periods.indexOf(period) / Math.max(1, periods.length - 1)) * (x1 - x0);
  const y = linear(extent(values), [y1, y0]);
  const upper = spec.data.map((row) => [x(row[xField]), y(row.upper)]);
  const lower = [...spec.data].reverse().map((row) => [x(row[xField]), y(row.lower)]);
  const band = [...upper, ...lower]
    .map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`)
    .join(" ");
  const actual = spec.data.map((row) => [x(row[xField]), y(row[yField])]);
  const marks = spec.data
    .map((row) => {
      const anomaly = Boolean(row.anomaly);
      return markGroup({
        key: row[xField],
        label: `${row[xField]}，实际 ${format(row[yField])}，预期 ${format(row.lower)}至${format(
          row.upper,
        )}${anomaly ? "，异常" : ""}`,
        body: `
          <circle cx="${x(row[xField])}" cy="${y(row[yField])}" r="${
            anomaly ? 8 : 3.5
          }" fill="${
            anomaly
              ? "var(--eix-viz-diverging-unfavorable-medium)"
              : "var(--eix-viz-time-actual)"
          }" />
          ${
            anomaly
              ? `<path d="M${x(row[xField]) - 6},${y(row[yField]) + 15} l6,10 l6,-10 z" fill="var(--eix-viz-value)" />
                 <text class="eix-chart-value" x="${x(row[xField]) + 14}" y="${
                   y(row[yField]) + 25
                 }">异常</text>`
              : ""
          }
        `,
      });
    })
    .join("");
  return `
    ${axes(x0, y0, x1, y1)}
    <polygon points="${band}" fill="var(--eix-viz-emphasis-muted)" opacity="0.28" />
    <path class="eix-chart-line eix-chart-line--actual" d="${linePath(actual)}" />
    ${marks}
    <text class="eix-chart-label" x="${x0}" y="${y1 + 26}">${escapeXml(periods[0])}</text>
    <text class="eix-chart-label" x="${x1}" y="${y1 + 26}" text-anchor="end">${escapeXml(
      periods.at(-1),
    )}</text>
    <text class="eix-chart-label" x="${x1}" y="${y0 + 12}" text-anchor="end">认证预期区间</text>
  `;
}

function renderSankey(spec) {
  const link = (source, target) =>
    spec.data.find((row) => row.source === source && row.target === target)?.value || 0;
  const total = link("进入", "自动处理") + link("进入", "人工处理");
  const scale = 0.78;
  const auto = link("进入", "自动处理") * scale;
  const human = link("进入", "人工处理") * scale;
  const autoDone = link("自动处理", "完成") * scale;
  const autoException = link("自动处理", "异常") * scale;
  const humanDone = link("人工处理", "完成") * scale;
  const humanEscalated = link("人工处理", "升级") * scale;
  const sourceY = 54;
  const autoY = 38;
  const humanY = autoY + auto + 22;
  const doneY = 34;
  const exceptionY = doneY + autoDone + humanDone + 16;
  const escalatedY = exceptionY + autoException + 14;
  const flowPath = (x0, y0, x1, y1, height, className) => `
    <path class="eix-chart-flow ${className}" d="M${x0},${y0} C${x0 + 90},${y0} ${
      x1 - 90
    },${y1} ${x1},${y1} L${x1},${y1 + height} C${x1 - 90},${y1 + height} ${
      x0 + 90
    },${y0 + height} ${x0},${y0 + height} Z" />
  `;
  return `
    ${flowPath(82, sourceY, 340, autoY, auto, "eix-chart-flow--primary")}
    ${flowPath(82, sourceY + auto, 340, humanY, human, "eix-chart-flow--secondary")}
    ${flowPath(356, autoY, 672, doneY, autoDone, "eix-chart-flow--primary")}
    ${flowPath(356, autoY + autoDone, 672, exceptionY, autoException, "eix-chart-flow--warning")}
    ${flowPath(356, humanY, 672, doneY + autoDone, humanDone, "eix-chart-flow--secondary")}
    ${flowPath(356, humanY + humanDone, 672, escalatedY, humanEscalated, "eix-chart-flow--tertiary")}
    <rect x="66" y="${sourceY}" width="16" height="${total * scale}" rx="2" fill="var(--eix-viz-series-1)" />
    <rect x="340" y="${autoY}" width="16" height="${auto}" rx="2" fill="var(--eix-viz-series-1)" />
    <rect x="340" y="${humanY}" width="16" height="${human}" rx="2" fill="var(--eix-viz-series-2)" />
    <rect x="672" y="${doneY}" width="16" height="${autoDone + humanDone}" rx="2" fill="var(--eix-viz-series-4)" />
    <rect x="672" y="${exceptionY}" width="16" height="${autoException}" rx="2" fill="var(--eix-viz-series-2)" />
    <rect x="672" y="${escalatedY}" width="16" height="${humanEscalated}" rx="2" fill="var(--eix-viz-series-3)" />
    <text class="eix-chart-value" x="66" y="${sourceY - 12}">进入 ${total}</text>
    <text class="eix-chart-value" x="340" y="${autoY - 12}">自动 ${link(
      "进入",
      "自动处理",
    )}</text>
    <text class="eix-chart-label" x="340" y="${humanY + human + 18}">人工 ${link(
      "进入",
      "人工处理",
    )}</text>
    <text class="eix-chart-value" x="688" y="${doneY + 14}">完成 ${
      link("自动处理", "完成") + link("人工处理", "完成")
    }</text>
    <text class="eix-chart-label" x="688" y="${exceptionY + 12}">异常 ${link(
      "自动处理",
      "异常",
    )}</text>
    <text class="eix-chart-label" x="688" y="${escalatedY + 14}">升级 ${link(
      "人工处理",
      "升级",
    )}</text>
  `;
}

/**
 * @param {object} spec
 * @returns {string}
 */
export function renderChartSvg(spec) {
  let body;
  switch (spec.representation) {
    case "horizontal-bar-emphasis":
    case "dot-plot":
      body = renderRanking(spec);
      break;
    case "variance-bar":
    case "bullet":
      body = renderVariance(spec);
      break;
    case "dumbbell":
      body = renderDumbbell(spec);
      break;
    case "line":
      body = renderTrend(spec);
      break;
    case "small-multiples-line":
      body = renderSmallMultiples(spec);
      break;
    case "waterfall":
    case "contribution-bar":
      body = renderWaterfall(spec);
      break;
    case "forecast-line-with-band":
      body = renderForecast(spec);
      break;
    case "scatter":
      body = renderScatter(spec);
      break;
    case "stacked-bar":
    case "100-percent-stacked-bar":
      body = renderStacked(spec);
      break;
    case "histogram":
      body = renderHistogram(spec);
      break;
    case "heatmap":
      body = renderHeatmap(spec);
      break;
    case "anomaly-band":
      body = renderAnomaly(spec);
      break;
    case "sankey":
      body = renderSankey(spec);
      break;
    default:
      body = `<text class="eix-chart-label" x="${WIDTH / 2}" y="${
        HEIGHT / 2
      }" text-anchor="middle">该表达应切换到数据表或由目标渲染器实现。</text>`;
  }
  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${escapeXml(
    spec.accessibleSummary,
  )}" data-chart-id="${escapeXml(spec.id)}">${body}</svg>`;
}
