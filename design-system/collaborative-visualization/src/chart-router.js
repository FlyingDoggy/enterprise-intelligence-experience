/**
 * Deterministic Chart Router for Collaborative Intelligence.
 *
 * The router selects a representation from the work question and data shape.
 * It does not generate titles, conclusions or data. A language model may
 * explain `rationale`, but it must not override blocked checks.
 */

const MAX_CATEGORICAL_SERIES = 5;
const MAX_SMALL_MULTIPLES = 12;
const MAX_RANKED_CATEGORIES = 20;

const asCount = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

function decision({
  status = "ready",
  representation,
  rationale,
  requiredChecks = [],
  fallback = null,
  alternatives = [],
}) {
  return {
    status,
    representation,
    rationale,
    requiredChecks,
    fallback,
    alternatives,
  };
}

function blocked(rationale, fallback, requiredChecks = []) {
  return decision({
    status: "blocked",
    representation: fallback,
    rationale,
    fallback,
    requiredChecks,
  });
}

/**
 * @typedef {Object} ChartRouteRequest
 * @property {"status"|"compare"|"rank"|"trend"|"variance"|"contribution"|"composition"|"distribution"|"relationship"|"anomaly"|"forecast"|"audit"|"flow"} workQuestion
 * @property {number} [measures]
 * @property {number} [dimensions]
 * @property {number} [categories]
 * @property {number} [series]
 * @property {number} [timePoints]
 * @property {number} [rowCount]
 * @property {boolean} [comparison]
 * @property {boolean} [additive]
 * @property {number} [focusCount]
 * @property {boolean} [requiresExactLookup]
 * @property {boolean} [paired]
 * @property {number} [matrixRows]
 * @property {number} [matrixColumns]
 * @property {number} [nodes]
 * @property {boolean} [conservation]
 * @property {boolean} [versionComparison]
 */

/**
 * @param {ChartRouteRequest} request
 */
export function routeChart(request) {
  const question = request?.workQuestion;
  const measures = asCount(request?.measures, 1);
  const dimensions = asCount(request?.dimensions);
  const categories = asCount(request?.categories);
  const series = asCount(request?.series, categories > 0 ? 1 : 0);
  const timePoints = asCount(request?.timePoints);
  const rowCount = asCount(request?.rowCount);
  const focusCount = asCount(request?.focusCount);

  if (request?.requiresExactLookup || question === "audit") {
    return decision({
      representation: "crosstab",
      rationale: "当前任务需要逐位核对数字，交叉表比图形保留更多精确信息。",
      requiredChecks: ["scope-complete", "units-visible"],
      alternatives: ["table-with-inline-bars"],
    });
  }

  switch (question) {
    case "status": {
      if (dimensions > 0 || categories > 0) {
        return decision({
          representation: categories > MAX_RANKED_CATEGORIES ? "crosstab" : "horizontal-bar-emphasis",
          rationale:
            categories > MAX_RANKED_CATEGORIES
              ? "类别过多，不使用颜色或密集柱形；改为可排序交叉表。"
              : "当前值按对象展开，使用横向条形图便于比较标签和量级。",
          requiredChecks: ["scope-complete", "unit-known", "comparable-scope"],
          alternatives: ["dot-plot", "crosstab"],
        });
      }
      if (measures === 1) {
        return decision({
          representation: timePoints >= 3 ? "kpi" : "kpi",
          rationale:
            timePoints >= 3
              ? "单一当前值使用关键数字，并以趋势微图补充方向。"
              : "单一当前值不需要单柱图，使用带口径的关键数字。",
          requiredChecks: ["scope-complete", "unit-known"],
          alternatives: timePoints >= 3 ? ["kpi-with-sparkline", "crosstab"] : ["crosstab"],
        });
      }
      return decision({
        representation: measures <= 6 ? "kpi-row" : "crosstab",
        rationale:
          measures <= 6
            ? "少量头条指标使用关键数字行。"
            : "指标数量超过头条阅读上限，改为交叉表。",
        requiredChecks: ["scope-complete", "units-compatible-or-separated"],
        alternatives: ["crosstab"],
      });
    }

    case "compare":
    case "rank": {
      if (question === "compare" && request?.paired) {
        if (categories < 2) {
          return blocked("成对比较至少需要两个对象，且每个对象都要有两个可比状态。", "crosstab", [
            "paired-endpoints-comparable",
          ]);
        }
        return decision({
          representation: "dumbbell",
          rationale: "同一对象的两个状态使用哑铃图，读者可以直接比较端点和差距长度。",
          requiredChecks: ["paired-endpoints-comparable", "pair-identity-stable"],
          alternatives: ["variance-bar", "crosstab"],
        });
      }
      if (
        question === "compare" &&
        asCount(request?.matrixRows) >= 2 &&
        asCount(request?.matrixColumns) >= 2
      ) {
        const cells = asCount(request?.matrixRows) * asCount(request?.matrixColumns);
        if (cells > 120) {
          return blocked("矩阵单元格过多，颜色差异已无法稳定读取。", "crosstab", [
            "matrix-complete",
            "sequential-scale-declared",
          ]);
        }
        return decision({
          representation: "heatmap",
          rationale: "两个离散维度形成量级矩阵，使用单一色相的顺序色阶定位高低区域。",
          requiredChecks: ["matrix-complete", "sequential-scale-declared"],
          alternatives: ["crosstab"],
        });
      }
      if (categories < 2) {
        return blocked("比较任务至少需要两个可比对象。", "crosstab", ["comparable-scope"]);
      }
      if (categories > MAX_RANKED_CATEGORIES) {
        return decision({
          representation: "crosstab",
          rationale: "类别超过同屏排名上限，使用可排序表格并按需查看前后区间。",
          requiredChecks: ["comparable-scope", "stable-sort"],
          alternatives: ["horizontal-bar-emphasis"],
        });
      }
      return decision({
        representation: focusCount === 1 ? "horizontal-bar-emphasis" : "dot-plot",
        rationale:
          focusCount === 1
            ? "只有一个对象是结论重点，使用一色高亮、其余置灰。"
            : "多个对象需要精确比较位置，点图比多色柱形图更节省视觉通道。",
        requiredChecks: ["comparable-scope", "stable-sort"],
        alternatives: ["horizontal-bar-emphasis", "crosstab"],
      });
    }

    case "trend": {
      if (timePoints < 3) {
        return blocked("少于三个时间点不足以表达趋势。", "crosstab", [
          "time-grain-consistent",
          "definition-stable",
        ]);
      }
      if (series <= 1 || request?.versionComparison) {
        return decision({
          representation: "line",
          rationale: request?.versionComparison
            ? "实际与基准属于同一指标的版本比较，使用线型区分并共享同一坐标。"
            : "单系列时间变化使用折线图，并明确缺失点和口径变化。",
          requiredChecks: ["time-grain-consistent", "definition-stable"],
          alternatives: ["crosstab"],
        });
      }
      if (series > MAX_SMALL_MULTIPLES) {
        return decision({
          representation: "crosstab",
          rationale: "系列超过小倍数同屏上限，改为表格、筛选或分组下钻。",
          requiredChecks: ["time-grain-consistent", "definition-stable"],
          alternatives: ["small-multiples-line"],
        });
      }
      return decision({
        representation: "small-multiples-line",
        rationale:
          series > MAX_CATEGORICAL_SERIES
            ? "系列超过颜色上限，使用共享尺度的小倍数。"
            : "多对象趋势使用小倍数，避免折线交叠和依赖图例追踪。",
        requiredChecks: ["time-grain-consistent", "definition-stable", "shared-scale-valid"],
        alternatives: ["line", "indexed-line", "crosstab"],
      });
    }

    case "variance": {
      if (!request?.comparison) {
        return blocked("差异分析缺少可比较的计划或基准。", "crosstab", [
          "baseline-comparable",
        ]);
      }
      return decision({
        representation: categories > 1 ? "variance-bar" : "bullet",
        rationale:
          categories > 1
            ? "多个对象相对基准的正负差异使用零基准差异条。"
            : "单个对象相对目标的表现使用子弹图。",
        requiredChecks: ["baseline-comparable", "favorable-direction-defined"],
        alternatives: ["dumbbell", "crosstab"],
      });
    }

    case "contribution": {
      if (!request?.additive) {
        return blocked("当前指标或贡献项不可加总，不能生成瀑布图。", "crosstab", [
          "contributions-mutually-exclusive",
          "contributions-exhaustive",
          "bridge-reconciles",
        ]);
      }
      return decision({
        representation: categories > 12 ? "contribution-bar" : "waterfall",
        rationale:
          categories > 12
            ? "贡献项过多，改用排序贡献条并保留总差异核对。"
            : "互斥且完备的贡献项使用瀑布图连接起点和终点。",
        requiredChecks: [
          "contributions-mutually-exclusive",
          "contributions-exhaustive",
          "bridge-reconciles",
        ],
        alternatives: ["contribution-bar", "crosstab"],
      });
    }

    case "composition": {
      if (!request?.additive) {
        return blocked("组成部分不可加总，不能生成堆叠图。", "crosstab", [
          "categories-mutually-exclusive",
          "parts-compatible",
        ]);
      }
      return decision({
        representation: "stacked-bar",
        rationale: "互斥的可加总部分使用堆叠条表达整体构成。",
        requiredChecks: ["categories-mutually-exclusive", "parts-compatible"],
        alternatives: ["100-percent-stacked-bar", "crosstab"],
      });
    }

    case "distribution": {
      if (rowCount < 20) {
        return blocked("样本数量不足以稳定表达分布形态。", "crosstab", [
          "sample-size-sufficient",
        ]);
      }
      return decision({
        representation: categories > 1 ? "box-plot" : "histogram",
        rationale:
          categories > 1
            ? "多个分组的分布比较使用箱线图。"
            : "单一连续变量的分布使用直方图，并明确分箱规则。",
        requiredChecks: ["sample-size-sufficient", "binning-explained"],
        alternatives: ["box-plot", "crosstab"],
      });
    }

    case "relationship": {
      if (measures !== 2) {
        return blocked("关系分析需要两个同粒度指标。", "crosstab", ["grains-compatible"]);
      }
      if (rowCount < 12) {
        return blocked("样本数量不足以支持关系图的稳定判读。", "crosstab", [
          "sample-size-sufficient",
        ]);
      }
      return decision({
        representation: "scatter",
        rationale: "两个同粒度指标的关系使用散点图，并明确标注非因果。",
        requiredChecks: [
          "grains-compatible",
          "sample-size-sufficient",
          "non-causal-label-present",
        ],
        alternatives: ["crosstab"],
      });
    }

    case "anomaly": {
      if (timePoints < 12) {
        return blocked("历史长度不足，不能声称已识别异常。", "line", [
          "baseline-certified",
          "threshold-certified",
        ]);
      }
      return decision({
        representation: "anomaly-band",
        rationale: "实际趋势与经过认证的预期区间共同呈现，偏离点使用形状和文字标注。",
        requiredChecks: ["baseline-certified", "threshold-certified", "seasonality-addressed"],
        alternatives: ["line", "crosstab"],
      });
    }

    case "forecast": {
      if (timePoints < 12) {
        return blocked("历史长度不足，保留描述性趋势但不生成预测。", "line", [
          "history-sufficient",
        ]);
      }
      return decision({
        representation: "forecast-line-with-band",
        rationale: "历史、预测和区间使用不同线型与填充，避免把预测读成事实。",
        requiredChecks: [
          "history-sufficient",
          "forecast-horizon-declared",
          "interval-present",
          "assumptions-present",
        ],
        alternatives: ["small-multiples-line", "crosstab"],
      });
    }

    case "flow": {
      const nodes = asCount(request?.nodes);
      if (!request?.conservation) {
        return blocked("节点流入与流出无法核对，不能用链路宽度表示流量。", "crosstab", [
          "flow-conservation",
        ]);
      }
      if (nodes > 7) {
        return decision({
          representation: "crosstab",
          rationale: "可见节点超过七个，先折叠路径或使用可筛选流转表，避免桑基图不可读。",
          requiredChecks: ["flow-conservation", "path-count-readable"],
          alternatives: ["sankey"],
        });
      }
      return decision({
        representation: "sankey",
        rationale: "守恒节点之间的流量使用桑基图；链路宽度只编码数量，不编码置信度。",
        requiredChecks: ["flow-conservation", "path-count-readable"],
        alternatives: ["crosstab"],
      });
    }

    default:
      return blocked("无法识别工作问题，不自动猜测图表类型。", "crosstab", [
        "work-question-required",
      ]);
  }
}

export const chartRouterLimits = Object.freeze({
  maxCategoricalSeries: MAX_CATEGORICAL_SERIES,
  maxSmallMultiples: MAX_SMALL_MULTIPLES,
  maxRankedCategories: MAX_RANKED_CATEGORIES,
});
