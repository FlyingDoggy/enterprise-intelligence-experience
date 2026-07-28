/**
 * Runtime validation for EIX ChartSpec.
 *
 * This intentionally validates governance-relevant invariants without trying
 * to replace JSON Schema validation. Failures return structured issues so the
 * interface can block one advanced result while preserving verified basics.
 */

import {
  DENSE_VISIBLE_SERIES,
  SERIES_SLOT_COUNT,
  declaredSeriesRegistry,
  seriesProfile,
  visibleSeriesIds,
  visibleSeriesLimit,
} from "./series-registry.js";

const requiredScopeFields = ["metric", "period", "version", "unit", "grain", "freshness"];
const allowedActions = new Set(["explain", "compare", "filter", "drill"]);
const advancedRepresentations = new Set([
  "waterfall",
  "scatter",
  "anomaly-band",
  "forecast-line-with-band",
  "sankey",
]);

function issue(id, status, message, fallback = null) {
  return { id, status, message, fallback };
}

function numeric(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function unique(values) {
  return new Set(values).size === values.length;
}

function validateScope(spec, issues) {
  for (const field of requiredScopeFields) {
    if (!String(spec.scope?.[field] ?? "").trim()) {
      issues.push(issue(`scope-${field}`, "fail", `口径缺少 ${field}。`, "crosstab"));
    }
  }
}

function validateEvidence(spec, issues) {
  if (!Array.isArray(spec.evidenceRefs) || spec.evidenceRefs.length === 0) {
    issues.push(issue("evidence-required", "fail", "图表没有绑定依据。", "crosstab"));
  }
  if (spec.claim?.status === "verified" && spec.evidenceRefs?.length === 0) {
    issues.push(issue("verified-without-evidence", "fail", "没有依据的结论不能标记为已验证。"));
  }
}

function validateViews(spec, issues) {
  if (!spec.accessibleSummary?.trim()) {
    issues.push(issue("accessible-summary", "fail", "图表缺少等价文本摘要。"));
  }
  if (!spec.dataTable?.columns?.length || !Array.isArray(spec.dataTable?.rows)) {
    issues.push(issue("data-table", "fail", "图表缺少同源数据表。"));
  }
  if (
    Array.isArray(spec.dataTable?.rows) &&
    Array.isArray(spec.data) &&
    spec.dataTable.rows.length !== spec.data.length
  ) {
    issues.push(
      issue(
        "view-row-count",
        "warn",
        "图表数据和支撑数据表行数不同；请确认是否存在聚合或折叠并解释规则。",
      ),
    );
  }
}

function validateSeries(spec, issues) {
  const visibleIds = visibleSeriesIds(spec);
  if (visibleIds.length === 0) return;

  const registry = declaredSeriesRegistry(spec);
  const profile = seriesProfile(spec);
  const visibleLimit = visibleSeriesLimit(spec);

  if (registry.length > SERIES_SLOT_COUNT) {
    issues.push(
      issue(
        "series-registry-cap",
        "fail",
        `系列身份注册表包含 ${registry.length} 个身份，超过十个稳定色槽。`,
        "crosstab",
      ),
    );
    return;
  }

  if (visibleIds.some((id) => !registry.includes(id))) {
    issues.push(
      issue(
        "series-registry-incomplete",
        "fail",
        "当前可见系列未全部进入稳定身份注册表。",
        "crosstab",
      ),
    );
  }

  if (visibleIds.length > visibleLimit) {
    const fallback = profile === "default" ? "small-multiples-line" : "crosstab";
    issues.push(
      issue(
        "series-visible-cap",
        "fail",
        profile === "default"
          ? `当前单图包含 ${visibleIds.length} 个彩色系列；常规模式最多同时显示五个。请选择重点、切换小倍数或显式启用高密度模式。`
          : `当前单图包含 ${visibleIds.length} 个彩色系列；高密度模式最多同时显示 ${DENSE_VISIBLE_SERIES} 个。`,
        fallback,
      ),
    );
  }

  if (profile === "dense" && visibleIds.length > 5 && spec.encoding?.series?.directLabels !== true) {
    issues.push(
      issue(
        "dense-series-labels",
        "fail",
        "六至八个系列使用高密度模式时，必须启用直接标注或等价的可追踪图例。",
        "small-multiples-line",
      ),
    );
  }

  if (profile === "emphasis" && visibleIds.length > 1) {
    const focusIds = spec.encoding?.series?.focusIds || [];
    if (!Array.isArray(focusIds) || focusIds.length === 0 || focusIds.length > 2) {
      issues.push(
        issue(
          "emphasis-series-focus",
          "fail",
          "强调模式必须明确一至两个重点系列，其余系列使用中性色。",
          "small-multiples-line",
        ),
      );
    }
  }
}

function validateSankey(spec, issues) {
  if (spec.representation !== "sankey") return;
  const links = spec.data;
  if (
    links.some(
      (row) =>
        !String(row.source || "").trim() ||
        !String(row.target || "").trim() ||
        !numeric(row.value) ||
        row.value < 0,
    )
  ) {
    issues.push(issue("sankey-links", "fail", "桑基图链路缺少合法来源、目标或非负流量。", "crosstab"));
    return;
  }
  const incoming = new Map();
  const outgoing = new Map();
  for (const row of links) {
    outgoing.set(row.source, (outgoing.get(row.source) || 0) + row.value);
    incoming.set(row.target, (incoming.get(row.target) || 0) + row.value);
  }
  const internalNodes = [...incoming.keys()].filter((node) => outgoing.has(node));
  const broken = internalNodes.filter(
    (node) => Math.abs((incoming.get(node) || 0) - (outgoing.get(node) || 0)) > 0.000001,
  );
  if (broken.length > 0) {
    issues.push(
      issue(
        "sankey-conservation",
        "fail",
        `节点 ${broken.join("、")} 的流入与流出不守恒。`,
        "crosstab",
      ),
    );
  }
  const nodes = new Set(links.flatMap((row) => [row.source, row.target]));
  if (nodes.size > 7) {
    issues.push(
      issue("sankey-node-count", "fail", "桑基图可见节点超过七个，应先折叠路径。", "crosstab"),
    );
  }
}

function validateWaterfall(spec, issues) {
  if (spec.representation !== "waterfall") return;
  const contributions = spec.data.filter((row) => row.kind === "contribution");
  const start = spec.data.find((row) => row.kind === "start");
  const end = spec.data.find((row) => row.kind === "end");

  if (!start || !end || !numeric(start.value) || !numeric(end.value)) {
    issues.push(issue("waterfall-endpoints", "fail", "瀑布图缺少可核对的起点或终点。", "crosstab"));
    return;
  }
  if (contributions.length === 0 || contributions.some((row) => !numeric(row.value))) {
    issues.push(issue("waterfall-contributions", "fail", "瀑布图贡献项为空或包含非数值。", "crosstab"));
    return;
  }
  const expectedEnd = start.value + contributions.reduce((sum, row) => sum + row.value, 0);
  const tolerance = Math.max(0.000001, Math.abs(end.value) * 0.000001);
  if (Math.abs(expectedEnd - end.value) > tolerance) {
    issues.push(
      issue(
        "waterfall-reconcile",
        "fail",
        `贡献项重算结果 ${expectedEnd} 与终点 ${end.value} 不一致。`,
        "contribution-bar",
      ),
    );
  }
  const evidenceMissing = contributions.filter(
    (row) => !row.evidenceRef && !spec.evidenceRefs.includes(`${row.id || row.label}`),
  );
  if (evidenceMissing.length > 0) {
    issues.push(
      issue(
        "waterfall-evidence",
        "warn",
        `${evidenceMissing.length} 个贡献项没有独立依据引用。`,
      ),
    );
  }
}

function validateForecast(spec, issues) {
  if (spec.representation !== "forecast-line-with-band") return;
  const forecastRows = spec.data.filter((row) => row.kind === "forecast");
  if (forecastRows.length === 0) {
    issues.push(issue("forecast-points", "fail", "预测图没有预测数据点。", "line"));
    return;
  }
  if (
    forecastRows.some(
      (row) =>
        !numeric(row.value) ||
        !numeric(row.lower) ||
        !numeric(row.upper) ||
        row.lower > row.value ||
        row.value > row.upper,
    )
  ) {
    issues.push(issue("forecast-interval", "fail", "预测值缺少合法区间。", "line"));
  }
  if (!spec.limitations?.some((text) => /假设|区间|模型/.test(text))) {
    issues.push(issue("forecast-assumptions", "fail", "预测图必须说明区间或模型假设。", "line"));
  }
  if (spec.claim?.kind !== "forecast") {
    issues.push(issue("forecast-claim-kind", "fail", "预测图的结论类型必须是forecast。"));
  }
}

function validateRelationship(spec, issues) {
  if (spec.representation !== "scatter") return;
  if (!spec.limitations?.some((text) => /非因果|不代表因果|相关/.test(text))) {
    issues.push(issue("scatter-non-causal", "fail", "关系图必须明确说明相关不代表因果。"));
  }
  if (spec.data.length < 12) {
    issues.push(issue("scatter-sample-size", "fail", "关系图样本少于12个。", "crosstab"));
  }
}

function validateAnomaly(spec, issues) {
  if (spec.representation !== "anomaly-band") return;
  const checks = new Map(spec.validation?.checks?.map((check) => [check.id, check.status]));
  for (const checkId of ["baseline-certified", "threshold-certified", "seasonality-addressed"]) {
    if (checks.get(checkId) !== "pass") {
      issues.push(
        issue(
          `anomaly-${checkId}`,
          "fail",
          "异常识别的基线、阈值或季节性条件尚未全部通过。",
          "line",
        ),
      );
      break;
    }
  }
}

function validateInteractions(spec, issues) {
  const actions = spec.interactions?.actions || [];
  if (!Array.isArray(actions) || !unique(actions) || actions.some((action) => !allowedActions.has(action))) {
    issues.push(issue("interaction-actions", "fail", "图表交互动作包含重复项或未允许的动作。"));
  }
  if (actions.length > 4) {
    issues.push(issue("interaction-count", "fail", "选择后的动作不得超过四个。"));
  }
}

/**
 * @param {object} spec
 */
export function validateChartSpec(spec) {
  const issues = [];

  if (!spec || typeof spec !== "object") {
    return {
      status: "blocked",
      issues: [issue("spec-required", "fail", "缺少ChartSpec。")],
      fallback: "crosstab",
    };
  }

  for (const field of ["id", "resultRef", "revision", "intent", "representation", "claim", "data"]) {
    if (spec[field] === undefined || spec[field] === null || spec[field] === "") {
      issues.push(issue(`required-${field}`, "fail", `ChartSpec缺少 ${field}。`));
    }
  }

  if (!Array.isArray(spec.data) || spec.data.length === 0) {
    issues.push(issue("data-required", "fail", "图表没有数据。", "crosstab"));
  }

  validateScope(spec, issues);
  validateEvidence(spec, issues);
  validateViews(spec, issues);
  validateSeries(spec, issues);
  validateWaterfall(spec, issues);
  validateForecast(spec, issues);
  validateRelationship(spec, issues);
  validateAnomaly(spec, issues);
  validateSankey(spec, issues);
  validateInteractions(spec, issues);

  if (advancedRepresentations.has(spec.representation) && spec.validation?.status === "blocked") {
    issues.push(
      issue(
        "advanced-analysis-blocked",
        "fail",
        "高级分析前置检查已阻断；保留基础结果并使用降级表达。",
        spec.validation?.fallback || "crosstab",
      ),
    );
  }

  const failures = issues.filter((item) => item.status === "fail");
  const warnings = issues.filter((item) => item.status === "warn");
  return {
    status: failures.length ? "blocked" : warnings.length ? "partial" : "pass",
    issues,
    fallback:
      failures.find((item) => item.fallback)?.fallback ?? spec.validation?.fallback ?? null,
  };
}
