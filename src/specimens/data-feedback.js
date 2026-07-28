import {
  boolAttribute,
  createDefinition,
  escapeHtml,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";

const tableRows = [
  ["样例 A", "1,248", "1,310", "−62"],
  ["样例 B", "982", "970", "+12"],
  ["样例 C", "—", "760", "暂无数据"],
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
      <div class="sp-table-loading" role="status" aria-label="正在加载支撑数据">
        ${Array.from({ length: 4 }, () => `<div><i></i><i></i><i></i><i></i></div>`).join("")}
      </div>
    `;
  }
  if (dataState === "empty") {
    return `
      <div class="sp-table-empty">
        <strong>所选期间内没有数据行。</strong>
        <p>更改期间，或清除业务实体筛选条件。</p>
        <button type="button">清除筛选条件</button>
      </div>
    `;
  }
  if (dataState === "error") {
    return `
      <div class="sp-table-error" role="alert">
        <strong>支撑数据未能载入。</strong>
        <p>图表结果保持原样；请重试数据表，不要把缺失行解释为零。</p>
        <button type="button" data-sp-table-retry>重试载入</button>
      </div>
    `;
  }
  const rows =
    sortDirection === "descending"
      ? [...tableRows].sort((a, b) => numericCellValue(b[1]) - numericCellValue(a[1]))
      : tableRows;
  const selectedRowId = selection === "none" ? null : selection;
  return `
    <div class="sp-table-scroll" tabindex="0" role="region" aria-label="可滚动的支撑数据">
      <table>
        <caption>支撑数据 · FY27 YTD · MRMB · 08:30 CST 刷新</caption>
        <thead>
          <tr>
            <th>对象</th>
            <th aria-sort="${sortDirection}">
              <button type="button" data-sp-sort>实际 ${sortDirection === "descending" ? "↓" : "↕"}</button>
            </th>
            <th>计划</th>
            <th>偏差</th>
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
      { key: "variant", label: "变体", options: ["standard", "compact", "numeric"] },
      { key: "dataState", label: "数据状态", options: ["populated", "loading", "empty", "error"] },
      { key: "sortDirection", label: "排序", options: ["none", "descending"] },
      {
        key: "selection",
        label: "已选行",
        options: ["none", "样例 A", "样例 B", "样例 C"],
      },
    ],
    normalizeModel(model) {
      const state =
        model.dataState === "loading"
          ? "loading"
          : model.dataState === "empty"
            ? "empty"
            : model.dataState === "error"
              ? "error"
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
      return "加载中、空或错误表格既没有可排序数据，也不能包含已选行。";
    },
    render(model) {
      return previewFrame(model, tableContent(model), {
        label: "表格交互示例",
        status: stateReceipt(
          model,
          model.dataState === "loading"
            ? "忙碌状态"
            : model.dataState === "empty"
              ? "零行数据"
              : model.dataState === "error"
                ? "载入失败且原结果保留"
                : "保留单位与新鲜度",
        ),
      });
    },
    markup(model) {
      if (model.dataState === "loading") return '<div role="status" aria-label="正在加载支撑数据">…</div>';
      if (model.dataState === "empty") {
        return '<div class="table-empty"><p>所选期间内没有数据行。</p><button type="button">清除筛选条件</button></div>';
      }
      if (model.dataState === "error") {
        return '<div class="table-error" role="alert"><p>支撑数据未能载入；图表结果保持原样。</p><button type="button">重试载入</button></div>';
      }
      return stripIndent(`
        <div role="region" aria-label="可滚动的支撑数据" tabindex="0">
          <table class="table table--${model.variant}">
            <caption>支撑数据 · FY27 YTD · MRMB</caption>
            <thead><tr><th>对象</th><th aria-sort="${model.sortDirection}"><button type="button">实际 ${model.sortDirection === "descending" ? "↓" : "↕"}</button></th></tr></thead>
            <tbody><tr tabindex="0"${model.selection !== "none" ? ' aria-selected="true"' : ' aria-selected="false"'}><th scope="row">${model.selection === "none" ? "样例 A" : model.selection}</th><td>1,248</td></tr></tbody>
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
      host.querySelector("[data-sp-table-retry]")?.addEventListener("click", () =>
        setModel({ dataState: "loading", sortDirection: "none", selection: "none" }),
      );
    },
  }),

  createDefinition({
    id: "progress",
    defaultVariant: "linear",
    defaultState: "running",
    render(model) {
      const values = {
        running: [60, "已校验 3 / 5 个步骤"],
        paused: [60, "已暂停 · 等待审批"],
        complete: [100, "已校验 5 / 5 个步骤"],
        error: [60, "步骤 4 失败 · 已核验步骤仍然保留"],
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
              const stateText = {
                error: "失败",
                paused: "暂停",
                current: "当前",
                complete: "完成",
                pending: "待处理",
              }[currentClass || (className === "complete" ? "complete" : "pending")];
              return `<li class="${className}"${current}><span>${stepNumber}</span><small>${stateText}</small></li>`;
            }).join("")}</ol>`
          : `<progress value="${value}" max="100">${value}%</progress>`;
      return previewFrame(
        model,
        `
          <div class="sp-progress-value" role="${model.state === "error" ? "alert" : "group"}" aria-label="校验进度">
            <div><strong>${escapeHtml(label)}</strong><span>${value}%</span></div>
            ${visual}
            <p>${model.state === "error" ? "部分失败不会删除已核验产出。" : "进度由已完成的确定性步骤计算得出。"}</p>
          </div>
        `,
        { label: "进度交互示例", status: stateReceipt(model, `${value}%`) },
      );
    },
    markup(model) {
      const value = model.state === "complete" ? 100 : 60;
      return model.variant === "linear"
        ? `<label>校验进度 <progress value="${value}" max="100">${value}%</progress></label>`
        : `<ol class="step-progress" aria-label="校验进度"><li>校验输入 · 完成</li><li>基础结果 · 完成</li><li>依据 · 完成</li><li aria-current="step">${model.state === "error" ? "高阶方法 · 失败" : model.state === "paused" ? "审批 · 暂停" : "当前步骤"}</li></ol>`;
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
          ? `<div class="sp-spinner-value" role="status"><i aria-hidden="true"></i><span>正在加载参考数据…</span></div>`
          : `<div class="sp-spinner-resolved"><strong>加载指示器已移除。</strong><span>这不代表业务成效；所属界面仍需呈现完成、空或错误状态。</span></div>`,
        { label: "加载指示器交互示例", status: stateReceipt(model, active ? "无法量化的等待" : "指示器已移除；业务成效未知") },
      );
    },
    markup(model) {
      return model.state === "active"
        ? `<div class="spinner spinner--${model.variant}" role="status"><span aria-hidden="true"></span><span>正在加载参考数据…</span></div>`
        : "<!-- 加载指示器已移除；所属区域负责呈现完成、空或错误状态。 -->";
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
        text: `<div class="sp-resolved-content"><h3>依据摘要</h3><p>三个已核验来源支持该结果。</p></div>`,
        block: `<article class="sp-resolved-card"><span>工作对象</span><h3>分析文档 · r4</h3></article>`,
        "table-row": tableContent({ ...model, state: "default" }),
      };
      return previewFrame(
        model,
        `<div class="sp-skeleton-value" aria-busy="${loading}">${loading ? `${shapes[model.variant]}<span class="visually-hidden">正在加载内容</span>` : resolved[model.variant]}</div>`,
        { label: "骨架屏交互示例", status: stateReceipt(model, loading ? "占位结构" : "真实内容已恢复") },
      );
    },
    markup(model) {
      return model.state === "loading"
        ? `<div class="skeleton-region" aria-busy="true"><div class="skeleton skeleton--${model.variant}" aria-hidden="true"></div><span class="visually-hidden">正在加载内容</span></div>`
        : model.variant === "text"
          ? '<article><h2>依据摘要</h2><p>三个已核验来源支持该结果。</p></article>'
          : model.variant === "block"
            ? '<article><span>工作对象</span><h2>分析文档 · r4</h2></article>'
            : '<table><tbody><tr><th scope="row">样例 A</th><td>1,248</td><td>1,310</td></tr></tbody></table>';
    },
  }),

  createDefinition({
    id: "empty-state",
    defaultVariant: "first use",
    defaultState: "default",
    render(model) {
      const content = {
        "first use": ["尚无分析", "从一个受治理的问题开始。", "创建分析"],
        "no data": ["当前范围没有数据", "所选数据集和期间有效，但没有可用记录。", "调整分析范围"],
        "no results": ["没有匹配项", "没有组件符合当前筛选条件。", "清除筛选条件"],
        error: ["内容未能载入", "请求失败，现有工作没有被删除。", "重试"],
        restricted: ["受限", "你无权访问该数据集。", "申请访问"],
        complete: ["当前已处理完毕", "没有需要你关注的异常。", "查看历史记录"],
      }[model.variant];
      return previewFrame(
        model,
        `
          <div class="sp-empty-value">
            <span>${escapeHtml(content[0])}</span>
            <h3>${escapeHtml(content[1])}</h3>
            <p>${
              model.variant === "restricted"
                ? "权限与可信程度分别判断。"
                : model.variant === "error"
                  ? "错误不是空数据；重试前保留现有内容。"
                  : "页面解释空状态原因，并提供一个下一步。"
            }</p>
            <button type="button">${escapeHtml(content[2])}</button>
          </div>
        `,
        { label: "空状态交互示例", status: stateReceipt(model, "一个明确的下一步") },
      );
    },
    markup(model) {
      const content = {
        "first use": ["从一个受治理的问题开始。", "创建分析"],
        "no data": ["所选数据集和期间有效，但没有可用记录。", "调整分析范围"],
        "no results": ["没有组件符合当前筛选条件。", "清除筛选条件"],
        error: ["请求失败，现有工作没有被删除。", "重试"],
        restricted: ["你无权访问该数据集。", "申请访问"],
        complete: ["没有需要你关注的异常。", "查看历史记录"],
      }[model.variant];
      return `<section class="empty-state empty-state--${model.variant.replaceAll(" ", "-")}"><h2>${content[0]}</h2><p>${model.variant === "restricted" ? "权限与可信程度分别判断。" : model.variant === "error" ? "错误不是空数据；重试前保留现有内容。" : "页面解释空状态原因，并提供一个下一步。"}</p><button type="button">${content[1]}</button></section>`;
    },
  }),

  createDefinition({
    id: "toast",
    defaultVariant: "success",
    defaultState: "entering",
    render(model) {
      const messages = {
        success: ["修订版本已保存。", "撤销"],
        information: ["依据刷新已开始。", "查看"],
        warning: ["该草稿已不是最新版本。", "检查"],
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
                    <button type="button" aria-label="关闭通知" data-sp-toast-dismiss>×</button>
                  </div>
                `
                : `<p class="sp-toast-dismissed" role="status">通知已关闭，页面上下文没有变化。</p>`
            }
          </div>
        `,
        { label: "消息提示交互示例", status: stateReceipt(model, visible ? "非阻断确认" : "已移除") },
      );
    },
    markup(model) {
      const messages = {
        success: ["修订版本已保存。", "撤销"],
        information: ["依据刷新已开始。", "查看"],
        warning: ["该草稿已不是最新版本。", "检查"],
      };
      return model.state === "dismissed"
        ? '<!-- 消息提示在关闭后移除。 -->'
        : `<div class="toast toast--${model.variant} is-${model.state}" role="status"><span>${messages[model.variant][0]}</span><button type="button">${messages[model.variant][1]}</button><button type="button" aria-label="关闭">×</button></div>`;
    },
    bind(host, { setModel }) {
      host.querySelector("[data-sp-toast-dismiss]")?.addEventListener("click", () => setModel({ state: "dismissed" }));
    },
  }),
];
