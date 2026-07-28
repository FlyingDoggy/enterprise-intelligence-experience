import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { renderChartBlock } from "../src/chart-block.js";
import { toEChartsOption } from "../src/echarts-adapter.js";
import { routeChart } from "../src/chart-router.js";
import { validateChartSpec } from "../src/chart-validator.js";
import { renderChartSvg } from "../src/svg-renderer.js";
import { seriesSlot } from "../src/series-registry.js";
import { atlasFamilies, chartAtlas } from "../samples/atlas.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, "..");
const sampleIds = [
  "ranking",
  "variance",
  "dumbbell",
  "trend",
  "anomaly",
  "forecast",
  "waterfall",
  "composition",
  "distribution",
  "heatmap",
  "scatter",
  "sankey",
];

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const sample = (id) => json(join(packageRoot, "samples", "specs", `${id}.json`));
const clone = (value) => structuredClone(value);

test("all reference ChartSpecs satisfy runtime governance checks", () => {
  for (const id of sampleIds) {
    const result = validateChartSpec(sample(id));
    assert.equal(result.status, "pass", `${id}: ${JSON.stringify(result.issues)}`);
  }
});

test("deterministic router selects all interactive reference expressions", () => {
  const cases = [
    [{ workQuestion: "rank", categories: 4, focusCount: 1 }, "horizontal-bar-emphasis"],
    [{ workQuestion: "variance", categories: 4, comparison: true }, "variance-bar"],
    [{ workQuestion: "compare", categories: 3, paired: true }, "dumbbell"],
    [{ workQuestion: "trend", timePoints: 6, series: 2, versionComparison: true }, "line"],
    [{ workQuestion: "anomaly", timePoints: 12 }, "anomaly-band"],
    [{ workQuestion: "contribution", categories: 3, additive: true }, "waterfall"],
    [{ workQuestion: "composition", categories: 3, additive: true }, "stacked-bar"],
    [{ workQuestion: "distribution", categories: 1, rowCount: 20 }, "histogram"],
    [{ workQuestion: "compare", categories: 3, matrixRows: 3, matrixColumns: 6 }, "heatmap"],
    [{ workQuestion: "forecast", timePoints: 15 }, "forecast-line-with-band"],
    [{ workQuestion: "relationship", measures: 2, rowCount: 12 }, "scatter"],
    [{ workQuestion: "flow", nodes: 6, conservation: true }, "sankey"],
  ];
  for (const [request, representation] of cases) {
    assert.equal(routeChart(request).representation, representation);
  }
});

test("router refuses unsupported analytical conditions and declares fallback", () => {
  const blocked = [
    routeChart({ workQuestion: "trend", timePoints: 2 }),
    routeChart({ workQuestion: "contribution", categories: 4, additive: false }),
    routeChart({ workQuestion: "forecast", timePoints: 5 }),
    routeChart({ workQuestion: "relationship", measures: 2, rowCount: 6 }),
  ];
  for (const decision of blocked) {
    assert.equal(decision.status, "blocked");
    assert.ok(decision.fallback);
    assert.ok(decision.rationale.length > 10);
  }
});

test("waterfall cannot render when contributions do not reconcile", () => {
  const spec = clone(sample("waterfall"));
  spec.data.at(-1).value = 80;
  const result = validateChartSpec(spec);
  assert.equal(result.status, "blocked");
  assert.ok(result.issues.some((issue) => issue.id === "waterfall-reconcile"));
});

test("forecast requires legal intervals and explicit assumptions", () => {
  const spec = clone(sample("forecast"));
  spec.data.at(-1).lower = 60;
  spec.limitations = [];
  const result = validateChartSpec(spec);
  assert.equal(result.status, "blocked");
  assert.ok(result.issues.some((issue) => issue.id === "forecast-interval"));
  assert.ok(result.issues.some((issue) => issue.id === "forecast-assumptions"));
});

test("series registry exposes ten stable slots while normal charts stop at five visible colors", () => {
  const spec = clone(sample("trend"));
  const periods = ["期间1", "期间2", "期间3"];
  spec.data = Array.from({ length: 6 }, (_, seriesIndex) =>
    periods.map((period, periodIndex) => ({
      period,
      version: `系列${seriesIndex + 1}`,
      value: 10 + seriesIndex + periodIndex,
    })),
  ).flat();
  spec.dataTable.rows = clone(spec.data);
  const result = validateChartSpec(spec);
  assert.equal(result.status, "blocked");
  assert.ok(result.issues.some((issue) => issue.id === "series-visible-cap"));

  spec.encoding.series.paletteProfile = "dense";
  spec.encoding.series.directLabels = true;
  spec.encoding.series.registry = [
    "系列1",
    "系列2",
    "系列3",
    "系列4",
    "系列5",
    "系列6",
    "系列7",
    "系列8",
    "系列9",
    "系列10",
  ];
  assert.equal(validateChartSpec(spec).status, "pass");

  const originalSlots = Object.fromEntries(
    spec.encoding.series.registry.map((seriesId) => [seriesId, seriesSlot(spec, seriesId)]),
  );
  spec.data.reverse();
  assert.deepEqual(
    Object.fromEntries(
      spec.encoding.series.registry.map((seriesId) => [seriesId, seriesSlot(spec, seriesId)]),
    ),
    originalSlots,
  );
});

test("dense series mode requires direct labels and never silently creates Other", () => {
  const spec = clone(sample("trend"));
  const periods = ["期间1", "期间2", "期间3"];
  spec.data = Array.from({ length: 7 }, (_, seriesIndex) =>
    periods.map((period, periodIndex) => ({
      period,
      version: `系列${seriesIndex + 1}`,
      value: 10 + seriesIndex + periodIndex,
    })),
  ).flat();
  spec.dataTable.rows = clone(spec.data);
  spec.encoding.series.paletteProfile = "dense";
  spec.encoding.series.registry = Array.from({ length: 7 }, (_, index) => `系列${index + 1}`);
  let result = validateChartSpec(spec);
  assert.equal(result.status, "blocked");
  assert.ok(result.issues.some((issue) => issue.id === "dense-series-labels"));
  assert.ok(!spec.encoding.series.registry.includes("其他"));

  spec.encoding.series.directLabels = true;
  result = validateChartSpec(spec);
  assert.equal(result.status, "pass");
});

test("SVG and ChartBlock preserve equivalent views and evidence", () => {
  for (const id of sampleIds) {
    const spec = sample(id);
    const svg = renderChartSvg(spec);
    const block = renderChartBlock(spec);
    assert.match(svg, /role="img"/);
    assert.match(svg, /data-chart-id=/);
    assert.match(block, /data-chart-view="chart"/);
    assert.match(block, /data-chart-view="table"/);
    assert.match(block, /data-chart-view="explanation"/);
    assert.match(block, new RegExp(`data-chart-representation="${spec.representation}"`));
    assert.match(block, new RegExp(spec.evidenceRefs[0]));
    assert.match(block, /结果记录 · 修订/);
    assert.doesNotMatch(block, new RegExp(spec.resultRef));
  }
});

test("specialized expressions use their own visual grammar", () => {
  assert.match(renderChartSvg(sample("dumbbell")), /eix-chart-dumbbell-link/);
  assert.match(renderChartSvg(sample("composition")), /eix-viz-series-3/);
  assert.match(renderChartSvg(sample("heatmap")), /eix-viz-sequential-/);
  assert.match(renderChartSvg(sample("anomaly")), />异常</);
  assert.match(renderChartSvg(sample("sankey")), /eix-chart-flow/);
});

test("ECharts adapter returns governed options and rejects invalid input", () => {
  for (const id of sampleIds) {
    const option = toEChartsOption(sample(id));
    assert.equal(option.aria.enabled, true);
    assert.ok(Array.isArray(option.series));
    assert.ok(option.series.length > 0);
  }
  const invalid = clone(sample("scatter"));
  invalid.limitations = [];
  assert.throws(() => toEChartsOption(invalid), /governance validation/);
});

test("design JSON covers every routed chart family", () => {
  const design = json(join(packageRoot, "eix-visualization.design.json"));
  assert.equal(design.status, "candidate-extension");
  assert.ok(design.router.length >= 14);
  assert.ok(design.chartFamilies.length >= 36);
  const familyIds = new Set(design.chartFamilies.map((family) => family.id));
  for (const rule of design.router) {
    for (const representation of [rule.defaultRepresentation, ...(rule.alternatives || [])]) {
      if (representation) {
        assert.ok(
          familyIds.has(representation),
          `router references missing family ${representation}`,
        );
      }
    }
  }
});

test("chart atlas exposes the full governed specimen set", () => {
  assert.equal(chartAtlas.length, 22);
  assert.ok(atlasFamilies.length >= 8);
  assert.equal(new Set(chartAtlas.map((entry) => entry.id)).size, chartAtlas.length);
  for (const entry of chartAtlas) {
    assert.ok(entry.usage.length > 8);
    assert.ok(entry.color.length > 2);
    assert.ok(entry.stop.length > 4);
    assert.match(entry.preview(), /role="img"/);
  }
});

test("generated CSS exposes every token in light and dark modes", () => {
  const source = json(join(packageRoot, "eix-visualization.tokens.json"));
  const css = readFileSync(join(packageRoot, "eix-visualization.tokens.css"), "utf8");
  assert.equal(source.tokens.length, 54);
  const variables = source.tokens.map((token) => token.cssVariable);
  assert.equal(new Set(variables).size, variables.length);
  for (const variable of variables) {
    const occurrences = css.split(`${variable}:`).length - 1;
    assert.ok(occurrences >= 2, `${variable} is missing a mode mapping`);
  }
  assert.equal(new Set(source.tokens.slice(0, 10).map((token) => token.defaultValue)).size, 10);
});

test("reference CSS does not consume undefined custom properties", () => {
  const core = json(join(packageRoot, "..", "tokens.json"));
  const visualization = json(join(packageRoot, "eix-visualization.tokens.json"));
  const sources = [
    readFileSync(join(packageRoot, "chart-components.css"), "utf8"),
    readFileSync(join(packageRoot, "samples", "gallery.css"), "utf8"),
  ];
  const declared = new Set([
    ...core.tokens.map((token) => token.cssVariable),
    ...visualization.tokens.map((token) => token.cssVariable),
    "--swatch",
  ]);
  for (const source of sources) {
    for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:/gi)) declared.add(match[1]);
  }
  const missing = new Set();
  for (const source of sources) {
    for (const match of source.matchAll(/var\((--[a-z0-9-]+)/gi)) {
      if (!declared.has(match[1])) missing.add(match[1]);
    }
  }
  assert.deepEqual([...missing].sort(), []);
});

test("sample gallery local links resolve to committed files", () => {
  const html = readFileSync(join(packageRoot, "samples", "index.html"), "utf8");
  const hrefs = [...html.matchAll(/href="([^"#][^"]*)"/g)]
    .map((match) => match[1])
    .filter((href) => !/^(?:data:|https?:)/.test(href) && !href.includes("#"));
  for (const href of hrefs) {
    assert.doesNotThrow(
      () => readFileSync(join(packageRoot, "samples", href)),
      `missing local resource ${href}`,
    );
  }
});
