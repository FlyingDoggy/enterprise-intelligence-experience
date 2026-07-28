import {
  boolAttribute,
  createDefinition,
  escapeHtml,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";

const tableRows = [
  ["Sample A", "1,248", "1,310", "−62"],
  ["Sample B", "982", "970", "+12"],
  ["Sample C", "—", "760", "Not available"],
];

function numericCellValue(value) {
  const parsed = Number.parseFloat(String(value).replaceAll(",", "").replaceAll("−", "-"));
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function tableContent(model) {
  const dataState = model.dataState || "populated";
  const sortDirection = model.sortDirection || "none";
  const selection = model.selection || "none";
  if (dataState === "loading") {
    return `
      <div class="sp-table-loading" role="status" aria-label="Loading supporting data">
        ${Array.from({ length: 4 }, () => `<div><i></i><i></i><i></i><i></i></div>`).join("")}
      </div>
    `;
  }
  if (dataState === "empty") {
    return `
      <div class="sp-table-empty">
        <strong>No rows in the selected period.</strong>
        <p>Change the period or clear the Entity filter.</p>
        <button type="button">Clear filters</button>
      </div>
    `;
  }
  const rows =
    sortDirection === "descending"
      ? [...tableRows].sort((a, b) => numericCellValue(b[1]) - numericCellValue(a[1]))
      : tableRows;
  const selectedRowId = selection === "none" ? null : selection;
  return `
    <div class="sp-table-scroll" tabindex="0" role="region" aria-label="Scrollable supporting data">
      <table>
        <caption>Supporting data · FY27 YTD · MRMB · refreshed 08:30 CST</caption>
        <thead>
          <tr>
            <th>Object</th>
            <th aria-sort="${sortDirection}">
              <button type="button" data-sp-sort>Actual ${sortDirection === "descending" ? "↓" : "↕"}</button>
            </th>
            <th>Plan</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr
                  class="${row[0] === selectedRowId ? "selected" : ""}"
                  aria-selected="${row[0] === selectedRowId}"
                  tabindex="0"
                  data-sp-table-row="${escapeHtml(row[0])}"
                >
                  ${row.map((cell, cellIndex) => `<${cellIndex === 0 ? "th scope=\"row\"" : "td"}>${escapeHtml(cell)}</${cellIndex === 0 ? "th" : "td"}>`).join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export const dataFeedbackDefinitions = [
  createDefinition({
    id: "table",
    defaultVariant: "standard",
    defaultState: "default",
    defaultModel: { dataState: "populated", sortDirection: "none", selection: "none" },
    controls: [
      { key: "variant", label: "Variant", options: ["standard", "compact", "numeric"] },
      { key: "dataState", label: "Data", options: ["populated", "loading", "empty"] },
      { key: "sortDirection", label: "Sort", options: ["none", "descending"] },
      {
        key: "selection",
        label: "Selected row",
        options: ["none", "Sample A", "Sample B", "Sample C"],
      },
    ],
    normalizeModel(model) {
      const state =
        model.dataState === "loading"
          ? "loading"
          : model.dataState === "empty"
            ? "empty"
            : model.sortDirection === "descending"
              ? "sorted"
              : model.selection !== "none"
                ? "selected row"
                : "default";
      return { ...model, state, selectedRowId: model.selection === "none" ? null : model.selection };
    },
    isValidModel(model) {
      return (
        model.dataState === "populated" ||
        (model.sortDirection === "none" && model.selection === "none")
      );
    },
    invalidReason() {
      return "Loading and empty Tables have neither sortable rows nor a selected row.";
    },
    render(model) {
      return previewFrame(model, tableContent(model), {
        label: "Table specimen",
        status: stateReceipt(
          model,
          model.dataState === "loading" ? "aria-busy" : model.dataState === "empty" ? "zero rows" : "unit and freshness retained",
        ),
      });
    },
    markup(model) {
      if (model.dataState === "loading") return '<div role="status" aria-label="Loading supporting data">…</div>';
      if (model.dataState === "empty") {
        return '<div class="table-empty"><p>No rows in the selected period.</p><button type="button">Clear filters</button></div>';
      }
      return stripIndent(`
        <div role="region" aria-label="Scrollable supporting data" tabindex="0">
          <table class="table table--${model.variant}">
            <caption>Supporting data · FY27 YTD · MRMB</caption>
            <thead><tr><th>Object</th><th aria-sort="${model.sortDirection}"><button type="button">Actual ${model.sortDirection === "descending" ? "↓" : "↕"}</button></th></tr></thead>
            <tbody><tr tabindex="0"${model.selection !== "none" ? ' aria-selected="true"' : ' aria-selected="false"'}><th scope="row">${model.selection === "none" ? "Sample A" : model.selection}</th><td>1,248</td></tr></tbody>
          </table>
        </div>
      `);
    },
    bind(host, { model, setModel }) {
      host.querySelector("[data-sp-sort]")?.addEventListener("click", () =>
        setModel(
          { sortDirection: model.sortDirection === "descending" ? "none" : "descending" },
          { focusSelector: "[data-sp-sort]" },
        ),
      );
      host.querySelectorAll("[data-sp-table-row]").forEach((row) => {
        const selectRow = () => {
          const rowId = row.dataset.spTableRow;
          setModel(
            { selection: rowId, selectedRowId: rowId },
            { focusSelector: `[data-sp-table-row="${CSS.escape(rowId)}"]` },
          );
        };
        row.addEventListener("click", selectRow);
        row.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          selectRow();
        });
      });
    },
  }),

  createDefinition({
    id: "progress",
    defaultVariant: "linear",
    defaultState: "running",
    render(model) {
      const values = {
        running: [60, "3 of 5 steps validated"],
        paused: [60, "Paused · waiting for approval"],
        complete: [100, "5 of 5 steps validated"],
        error: [60, "Step 4 failed · verified steps retained"],
      };
      const [value, label] = values[model.state];
      const visual =
        model.variant === "step"
          ? `<ol class="sp-progress-steps" data-flow-contract="progress-indicator">${Array.from({ length: 5 }, (_, index) => {
              const stepNumber = index + 1;
              const completed = stepNumber <= 3;
              const currentClass =
                stepNumber === 4 && model.state === "error"
                  ? "error"
                  : stepNumber === 4 && model.state === "paused"
                    ? "paused"
                    : stepNumber === 4 && model.state === "running"
                      ? "current"
                      : "";
              const className = model.state === "complete" || completed ? "complete" : currentClass;
              const current = currentClass ? ' aria-current="step"' : "";
              return `<li class="${className}"${current}><span>${stepNumber}</span><small>${currentClass || (className === "complete" ? "complete" : "pending")}</small></li>`;
            }).join("")}</ol>`
          : `<progress value="${value}" max="100">${value}%</progress>`;
      return previewFrame(
        model,
        `
          <div class="sp-progress-value" role="${model.state === "error" ? "alert" : "group"}" aria-label="Validation progress">
            <div><strong>${escapeHtml(label)}</strong><span>${value}%</span></div>
            ${visual}
            <p>${model.state === "error" ? "Partial failure does not remove verified output." : "Progress is derived from completed deterministic steps."}</p>
          </div>
        `,
        { label: "Progress specimen", status: stateReceipt(model, `${value}%`) },
      );
    },
    markup(model) {
      const value = model.state === "complete" ? 100 : 60;
      return model.variant === "linear"
        ? `<label>Validation progress <progress value="${value}" max="100">${value}%</progress></label>`
        : `<ol class="step-progress" aria-label="Validation progress"><li>Validate inputs · complete</li><li>Base result · complete</li><li>Evidence · complete</li><li aria-current="step">${model.state === "error" ? "Advanced method · failed" : model.state === "paused" ? "Approval · paused" : "Current step"}</li></ol>`;
    },
  }),

  createDefinition({
    id: "spinner",
    defaultVariant: "small",
    defaultState: "active",
    render(model) {
      const active = model.state === "active";
      return previewFrame(
        model,
        active
          ? `<div class="sp-spinner-value" role="status"><i aria-hidden="true"></i><span>Loading reference data…</span></div>`
          : `<div class="sp-spinner-resolved"><strong>Spinner removed.</strong><span>No outcome is implied; the owning surface must render its own resolved, empty or error state.</span></div>`,
        { label: "Spinner specimen", status: stateReceipt(model, active ? "indeterminate wait" : "indicator removed; outcome unknown") },
      );
    },
    markup(model) {
      return model.state === "active"
        ? `<div class="spinner spinner--${model.variant}" role="status"><span aria-hidden="true"></span><span>Loading reference data…</span></div>`
        : "<!-- Loading indicator removed. The owning region renders its resolved, empty, or error outcome. -->";
    },
  }),

  createDefinition({
    id: "skeleton",
    defaultVariant: "text",
    defaultState: "loading",
    render(model) {
      const loading = model.state === "loading";
      const shapes = {
        text: `<div class="sp-skeleton-text"><i></i><i></i><i></i></div>`,
        block: `<div class="sp-skeleton-block"><i></i><i></i></div>`,
        "table-row": `<div class="sp-skeleton-table">${Array.from({ length: 3 }, () => `<div><i></i><i></i><i></i></div>`).join("")}</div>`,
      };
      const resolved = {
        text: `<div class="sp-resolved-content"><h3>Evidence summary</h3><p>Three verified sources support this result.</p></div>`,
        block: `<article class="sp-resolved-card"><span>WORK OBJECT</span><h3>Analysis Document · r4</h3></article>`,
        "table-row": tableContent({ ...model, state: "default" }),
      };
      return previewFrame(
        model,
        `<div class="sp-skeleton-value" aria-busy="${loading}">${loading ? `${shapes[model.variant]}<span class="visually-hidden">Loading content</span>` : resolved[model.variant]}</div>`,
        { label: "Skeleton specimen", status: stateReceipt(model, loading ? "placeholder structure" : "real content restored") },
      );
    },
    markup(model) {
      return model.state === "loading"
        ? `<div class="skeleton-region" aria-busy="true"><div class="skeleton skeleton--${model.variant}" aria-hidden="true"></div><span class="visually-hidden">Loading content</span></div>`
        : model.variant === "text"
          ? '<article><h2>Evidence summary</h2><p>Three verified sources support this result.</p></article>'
          : model.variant === "block"
            ? '<article><span>WORK OBJECT</span><h2>Analysis Document · r4</h2></article>'
            : '<table><tbody><tr><th scope="row">Sample A</th><td>1,248</td><td>1,310</td></tr></tbody></table>';
    },
  }),

  createDefinition({
    id: "empty-state",
    defaultVariant: "first use",
    defaultState: "default",
    render(model) {
      const content = {
        "first use": ["NO ANALYSES YET", "Start with a governed question.", "Create analysis"],
        "no results": ["NO MATCHES", "No components match the current filters.", "Clear filters"],
        restricted: ["RESTRICTED", "You do not have access to this dataset.", "Request access"],
        complete: ["ALL CAUGHT UP", "No exceptions require your attention.", "View history"],
      }[model.variant];
      return previewFrame(
        model,
        `
          <div class="sp-empty-value">
            <span>${escapeHtml(content[0])}</span>
            <h3>${escapeHtml(content[1])}</h3>
            <p>${model.variant === "restricted" ? "Permission is evaluated separately from confidence." : "The page explains why it is empty and offers one next step."}</p>
            <button type="button">${escapeHtml(content[2])}</button>
          </div>
        `,
        { label: "Empty State specimen", status: stateReceipt(model, "one directed next action") },
      );
    },
    markup(model) {
      const content = {
        "first use": ["Start with a governed question.", "Create analysis"],
        "no results": ["No components match the current filters.", "Clear filters"],
        restricted: ["You do not have access to this dataset.", "Request access"],
        complete: ["No exceptions require your attention.", "View history"],
      }[model.variant];
      return `<section class="empty-state empty-state--${model.variant.replaceAll(" ", "-")}"><h2>${content[0]}</h2><p>${model.variant === "restricted" ? "Permission is evaluated separately from confidence." : "The page explains why it is empty and offers one next step."}</p><button type="button">${content[1]}</button></section>`;
    },
  }),

  createDefinition({
    id: "toast",
    defaultVariant: "success",
    defaultState: "entering",
    render(model) {
      const messages = {
        success: ["Revision saved.", "Undo"],
        information: ["Evidence refresh started.", "View"],
        warning: ["Draft is no longer current.", "Review"],
      };
      const [message, action] = messages[model.variant];
      const visible = model.state !== "dismissed";
      return previewFrame(
        model,
        `
          <div class="sp-toast-stage">
            ${
              visible
                ? `
                  <div class="sp-toast-value" role="status" data-sp-toast>
                    <i aria-hidden="true"></i>
                    <span>${escapeHtml(message)}</span>
                    <button type="button">${escapeHtml(action)}</button>
                    <button type="button" aria-label="Dismiss notification" data-sp-toast-dismiss>×</button>
                  </div>
                `
                : `<p class="sp-toast-dismissed" role="status">Notification dismissed. Page context is unchanged.</p>`
            }
          </div>
        `,
        { label: "Toast specimen", status: stateReceipt(model, visible ? "non-blocking confirmation" : "removed") },
      );
    },
    markup(model) {
      const messages = {
        success: ["Revision saved.", "Undo"],
        information: ["Evidence refresh started.", "View"],
        warning: ["Draft is no longer current.", "Review"],
      };
      return model.state === "dismissed"
        ? '<!-- Toast removed after dismissal -->'
        : `<div class="toast toast--${model.variant} is-${model.state}" role="status"><span>${messages[model.variant][0]}</span><button type="button">${messages[model.variant][1]}</button><button type="button" aria-label="Dismiss">×</button></div>`;
    },
    bind(host, { setModel }) {
      host.querySelector("[data-sp-toast-dismiss]")?.addEventListener("click", () => setModel({ state: "dismissed" }));
    },
  }),
];
