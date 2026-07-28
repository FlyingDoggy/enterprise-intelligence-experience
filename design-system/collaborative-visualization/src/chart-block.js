import { renderChartSvg } from "./svg-renderer.js";
import { validateChartSpec } from "./chart-validator.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatValue = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value)
    : value === undefined || value === null || value === ""
      ? "—"
      : String(value);

const actionLabels = {
  explain: "解释",
  compare: "比较",
  filter: "筛选",
  drill: "下钻",
};

const statusLabels = {
  unverified: "未核验",
  supported: "有依据",
  verified: "已核验",
  contested: "有争议",
  stale: "已过期",
  insufficient: "依据不足",
};

const workQuestionLabels = {
  status: "状态",
  compare: "比较",
  rank: "排名",
  trend: "趋势",
  variance: "差异",
  contribution: "贡献",
  composition: "构成",
  distribution: "分布",
  relationship: "关系",
  anomaly: "异常",
  forecast: "预测",
  audit: "数字核对",
};

function tableHtml(spec) {
  const columns = spec.dataTable.columns;
  const headers = columns
    .map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`)
    .join("");
  const rows = spec.dataTable.rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => {
            const value = row[column.key];
            const numeric = typeof value === "number" ? ` class="is-numeric"` : "";
            return `<td${numeric}>${escapeHtml(formatValue(value))}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `
    <div class="eix-chart-table-scroll" tabindex="0" aria-label="可横向滚动的支撑数据表">
      <table class="eix-chart-table">
        <caption>与图形同源的支撑数据。单位：${escapeHtml(spec.scope.unit)}</caption>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function explanationHtml(spec, validation) {
  const limitations = (spec.limitations || [])
    .map((text) => `<li>${escapeHtml(text)}</li>`)
    .join("");
  const checks = (spec.validation?.checks || [])
    .map(
      (check) =>
        `<li><strong>${check.status === "pass" ? "已通过" : check.status === "warn" ? "需注意" : "未通过"}</strong> · ${escapeHtml(
          check.message || check.id,
        )}</li>`,
    )
    .join("");
  const runtimeIssues = validation.issues
    .map((item) => `<li><strong>${item.status === "fail" ? "阻断" : "提示"}</strong> · ${escapeHtml(item.message)}</li>`)
    .join("");
  return `
    <div class="eix-chart-block__explanation">
      <section>
        <span class="eix-chart-block__section-label">结论</span>
        <h3>${escapeHtml(spec.claim.text)}</h3>
      </section>
      <section>
        <span class="eix-chart-block__section-label">为什么选择这种表达</span>
        <p>${escapeHtml(spec.intent.method)}；当前图形只表达“${escapeHtml(
          workQuestionLabels[spec.intent.workQuestion] || spec.intent.workQuestion,
        )}”问题，不自动扩大为因果判断。</p>
      </section>
      ${
        checks
          ? `<section><span class="eix-chart-block__section-label">前置检查</span><ul>${checks}</ul></section>`
          : ""
      }
      ${
        runtimeIssues
          ? `<section><span class="eix-chart-block__section-label">运行时检查</span><ul>${runtimeIssues}</ul></section>`
          : ""
      }
      ${
        limitations
          ? `<section><span class="eix-chart-block__section-label">限制</span><ul>${limitations}</ul></section>`
          : ""
      }
    </div>
  `;
}

function blockedHtml(validation) {
  const issues = validation.issues
    .filter((item) => item.status === "fail")
    .map((item) => `<li>${escapeHtml(item.message)}</li>`)
    .join("");
  return `
    <div class="eix-chart-block__blocked" role="status">
      <span class="eix-chart-block__section-label">高级分析未运行</span>
      <h3>前置条件不足，保留基础结果</h3>
      <ul>${issues}</ul>
      <p>建议降级为：${escapeHtml(validation.fallback || "支撑数据表")}</p>
    </div>
  `;
}

/**
 * @param {object} spec
 * @param {{profile?: "standard"|"compact"}} [options]
 * @returns {string}
 */
export function renderChartBlock(spec, options = {}) {
  const validation = validateChartSpec(spec);
  const profile = options.profile === "compact" ? "compact" : "standard";
  const headingId = `${spec.id}-heading`;
  const scope = [
    spec.scope.metric,
    spec.scope.period,
    spec.scope.version,
    spec.scope.unit,
    spec.scope.freshness,
  ];
  const actions = spec.interactions.actions
    .map(
      (action) =>
        `<button type="button" data-chart-action="${escapeHtml(action)}">${escapeHtml(
          actionLabels[action] || action,
        )}</button>`,
    )
    .join("");
  const evidence = spec.evidenceRefs
    .map((reference) => `<li><code>${escapeHtml(reference)}</code></li>`)
    .join("");
  return `
    <article class="eix-chart-block eix-chart-block--${profile}" aria-labelledby="${headingId}" data-chart-block="${escapeHtml(
      spec.id,
    )}" data-chart-representation="${escapeHtml(spec.representation)}" data-chart-profile="${profile}">
      <header class="eix-chart-block__header">
        <div>
          <span class="eix-chart-block__eyebrow">分析结果 · ${escapeHtml(
            workQuestionLabels[spec.intent.workQuestion] || spec.intent.workQuestion,
          )}</span>
          <h2 class="eix-chart-block__title" id="${headingId}">${escapeHtml(spec.claim.text)}</h2>
          <div class="eix-chart-block__scope">${scope
            .map((item) => `<span>${escapeHtml(item)}</span>`)
            .join("")}</div>
        </div>
        <span class="eix-chart-block__status">${escapeHtml(
          statusLabels[spec.claim.status] || spec.claim.status,
        )}</span>
      </header>
      <div class="eix-chart-block__toolbar">
        <div class="eix-chart-block__views" role="group" aria-label="结果表达">
          <button type="button" data-chart-view="chart" aria-pressed="true">图形</button>
          <button type="button" data-chart-view="table" aria-pressed="false">数据表</button>
          <button type="button" data-chart-view="explanation" aria-pressed="false">解释</button>
        </div>
        <div class="eix-chart-block__actions" aria-label="分析动作">${actions}</div>
      </div>
      <div class="eix-chart-block__view" data-chart-panel="chart">
        <p class="eix-chart-block__mobile-hint">横向滑动查看完整图形</p>
        <div
          class="eix-chart-block__plot"
          tabindex="0"
          aria-label="图形区域；窄屏可横向滚动"
        >${
          validation.status === "blocked" ? blockedHtml(validation) : renderChartSvg(spec)
        }</div>
        <p class="eix-chart-block__annotation"><strong>等价摘要：</strong>${escapeHtml(
          spec.accessibleSummary,
        )}</p>
      </div>
      <div class="eix-chart-block__view" data-chart-panel="table" hidden>${tableHtml(spec)}</div>
      <div class="eix-chart-block__view" data-chart-panel="explanation" hidden>${explanationHtml(
        spec,
        validation,
      )}</div>
      <footer class="eix-chart-block__footer">
        <div class="eix-chart-block__meta">
          结果记录 · 修订 ${spec.revision} · 校验 ${
            validation.status === "pass" ? "通过" : validation.status === "partial" ? "部分通过" : "阻断"
          }
        </div>
        <details class="eix-chart-block__evidence">
          <summary>查看依据（${spec.evidenceRefs.length}）</summary>
          <ul>${evidence}</ul>
        </details>
      </footer>
      <p class="eix-viz-sr-only" aria-live="polite" data-chart-live></p>
    </article>
  `;
}

/**
 * Binds deterministic local interactions. No request, mutation, or external
 * action is triggered.
 *
 * @param {HTMLElement|Document} root
 */
export function bindChartBlocks(root = document) {
  root.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-chart-view]");
    const block = event.target.closest("[data-chart-block]");
    if (!block) return;
    const live = block.querySelector("[data-chart-live]");

    if (viewButton) {
      const targetView = viewButton.dataset.chartView;
      block.querySelectorAll("[data-chart-view]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button === viewButton));
      });
      block.querySelectorAll("[data-chart-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.chartPanel !== targetView;
      });
      if (live) live.textContent = `已切换到${viewButton.textContent.trim()}。`;
      return;
    }

    const action = event.target.closest("[data-chart-action]");
    if (action && live) {
      live.textContent = `${action.textContent.trim()}仅为界面示例，未执行外部操作。`;
      action.dataset.triggered = "true";
      return;
    }

    const mark = event.target.closest("[data-mark-key]");
    if (mark) selectMark(block, mark);
  });

  root.addEventListener("keydown", (event) => {
    const mark = event.target.closest?.("[data-mark-key]");
    if (!mark || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    const block = mark.closest("[data-chart-block]");
    if (block) selectMark(block, mark);
  });
}

function selectMark(block, mark) {
  const multiple = false;
  if (!multiple) {
    block.querySelectorAll("[data-mark-key]").forEach((item) => {
      item.setAttribute("aria-selected", String(item === mark));
    });
  }
  const live = block.querySelector("[data-chart-live]");
  if (live) live.textContent = `已选择 ${mark.getAttribute("aria-label")}。`;
}
