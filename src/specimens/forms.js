import {
  bindEscape,
  bindRovingGroup,
  boolAttribute,
  createDefinition,
  escapeHtml,
  focusWhenPreviewed,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";

function fieldValues(state) {
  if (state === "default" || state === "focus") return "";
  if (state === "error") return "A";
  if (state === "readonly") return "已核验的分析标题";
  return "季度绩效分析";
}

export const formDefinitions = [
  createDefinition({
    id: "text-field",
    defaultVariant: "standard",
    defaultState: "default",
    render(model) {
      const error = model.state === "error";
      const value = fieldValues(model.state);
      return previewFrame(
        model,
        `
          <label class="sp-field-value">
            <span>分析标题 <b aria-hidden="true">*</b></span>
            <input
              type="text"
              value="${escapeHtml(value)}"
              placeholder="输入清晰的标题"
              aria-invalid="${error}"
              aria-describedby="sp-text-field-note"
              ${boolAttribute("disabled", model.state === "disabled")}
              ${boolAttribute("readonly", model.state === "readonly")}
              data-sp-field
            >
            <small id="sp-text-field-note" class="${error ? "is-error" : ""}">
              ${error ? "至少输入 3 个字符。" : model.state === "readonly" ? "已核验内容不可编辑。" : "协作者可见。"}
            </small>
          </label>
        `,
        { label: "单行输入框交互示例", status: stateReceipt(model, error ? "输入无效" : "短文本输入") },
      );
    },
    markup(model) {
      const error = model.state === "error";
      const value = fieldValues(model.state);
      return stripIndent(`
        <label class="text-field text-field--${model.variant}">
          分析标题
          <input type="text" value="${value}" placeholder="输入清晰的标题" aria-describedby="title-note"${error ? ' aria-invalid="true"' : ""}${model.state === "disabled" ? " disabled" : ""}${model.state === "readonly" ? " readonly" : ""}>
        </label>
        <small id="title-note">${error ? "至少输入 3 个字符。" : model.state === "readonly" ? "已核验内容不可编辑。" : "协作者可见。"}</small>
      `);
    },
    bind(host, { model }) {
      focusWhenPreviewed(host, model, "[data-sp-field]");
    },
  }),

  createDefinition({
    id: "search-field",
    defaultVariant: "standard",
    defaultState: "default",
    defaultModel: { query: "", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["standard", "with suggestions"] },
      {
        key: "query",
        label: "查询内容",
        options: [
          { value: "", label: "空查询" },
          { value: "利润", label: "有匹配结果" },
          { value: "不存在的指标", label: "无匹配结果" },
        ],
      },
      { key: "interaction", label: "交互状态", options: ["rest", "focus", "disabled"] },
    ],
    normalizeModel(model) {
      const state =
        model.interaction === "disabled"
          ? "disabled"
          : model.interaction === "focus"
            ? "focus"
            : model.query === "不存在的指标"
              ? "no results"
              : model.query
                ? "filled"
                : "default";
      return { ...model, state };
    },
    render(model) {
      const query = model.query || "";
      const noResults = model.state === "no results";
      const suggestions =
        model.variant === "with suggestions" && query
          ? noResults
            ? `<div class="sp-search-results" role="status"><strong>没有匹配项</strong><span>检查名称，或切换数据集范围。</span></div>`
            : `<div class="sp-search-results" role="listbox" aria-label="搜索建议">
                <button type="button" role="option">认证利润</button>
                <button type="button" role="option">利润偏差</button>
                <button type="button" role="option">利润率</button>
              </div>`
          : "";
      return previewFrame(
        model,
        `
          <div class="sp-search-value">
            <label for="sp-search-input">在“指标目录”中搜索</label>
            <div class="sp-search-control">
              <span aria-hidden="true">⌕</span>
              <input
                id="sp-search-input"
                type="search"
                value="${escapeHtml(query)}"
                placeholder="搜索指标、维度或数据集"
                autocomplete="off"
                ${boolAttribute("disabled", model.interaction === "disabled")}
                data-sp-search-input
              >
              ${query ? '<button type="button" aria-label="清除搜索" data-sp-search-clear>×</button>' : ""}
            </div>
            ${suggestions}
            <small>${noResults ? "查询范围保持不变；系统不会自动扩大到其他数据集。" : "输入后可以查看建议，Esc 关闭建议。"}</small>
          </div>
        `,
        {
          label: "搜索框交互示例",
          status: stateReceipt(model, noResults ? "零个匹配项" : query ? `查询“${query}”` : "等待输入"),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <form role="search" class="search-field search-field--${model.variant.replaceAll(" ", "-")}">
          <label for="catalog-search">在“指标目录”中搜索</label>
          <input id="catalog-search" type="search" value="${model.query || ""}" placeholder="搜索指标、维度或数据集"${model.interaction === "disabled" ? " disabled" : ""}>
          ${model.query ? '<button type="button" aria-label="清除搜索">×</button>' : ""}
          <p role="status">${model.state === "no results" ? "没有匹配项。" : ""}</p>
        </form>
      `);
    },
    bind(host, { model, setModel }) {
      focusWhenPreviewed(host, model, "[data-sp-search-input]");
      const input = host.querySelector("[data-sp-search-input]");
      input?.addEventListener("input", () =>
        setModel(
          { query: input.value, interaction: "rest" },
          { focusSelector: "[data-sp-search-input]" },
        ),
      );
      host.querySelector("[data-sp-search-clear]")?.addEventListener("click", () =>
        setModel(
          { query: "", interaction: "rest" },
          { focusSelector: "[data-sp-search-input]" },
        ),
      );
      host.querySelectorAll("[role='option']").forEach((option) => {
        option.addEventListener("click", () =>
          setModel(
            { query: option.textContent.trim(), interaction: "rest" },
            { focusSelector: "[data-sp-search-input]" },
          ),
        );
      });
      bindEscape(host, () =>
        setModel(
          { interaction: "rest" },
          { focusSelector: "[data-sp-search-input]" },
        ),
      );
    },
  }),

  createDefinition({
    id: "date-range",
    defaultVariant: "date range",
    defaultState: "default",
    render(model) {
      const range = model.variant === "date range";
      const values = {
        default: ["", ""],
        filled: ["2026-07-01", "2026-07-28"],
        focus: ["2026-07-01", "2026-07-28"],
        error: ["2026-07-28", "2026-07-01"],
        disabled: ["2026-07-01", "2026-07-28"],
        readonly: ["2026-07-01", "2026-07-28"],
      }[model.state] || ["", ""];
      const error = model.state === "error";
      const field = (id, label, value) => `
        <label>
          <span>${label}</span>
          <input
            id="${id}"
            type="date"
            value="${value}"
            min="2025-01-01"
            max="2027-12-31"
            aria-invalid="${error}"
            aria-describedby="sp-date-note"
            ${boolAttribute("disabled", model.state === "disabled")}
            ${boolAttribute("readonly", model.state === "readonly")}
            ${id === "sp-date-start" ? "data-sp-date-start" : ""}
          >
        </label>`;
      return previewFrame(
        model,
        `
          <fieldset class="sp-date-range-value">
            <legend>${range ? "分析期间" : "截止日期"}</legend>
            <div>
              ${field("sp-date-start", range ? "开始日期" : "日期", values[0])}
              ${range ? `<span aria-hidden="true">至</span>${field("sp-date-end", "结束日期", values[1])}` : ""}
            </div>
            <small id="sp-date-note" class="${error ? "is-error" : ""}">
              ${error ? "结束日期不能早于开始日期。" : model.state === "readonly" ? "该期间来自已发布修订版本。" : "格式：年-月-日；包含开始日和结束日。"}
            </small>
          </fieldset>
        `,
        {
          label: "日期与日期范围交互示例",
          status: stateReceipt(model, range ? "闭合日期范围" : "单一日期"),
        },
      );
    },
    markup(model) {
      const range = model.variant === "date range";
      const stateAttributes = `${model.state === "error" ? ' aria-invalid="true"' : ""}${model.state === "disabled" ? " disabled" : ""}${model.state === "readonly" ? " readonly" : ""}`;
      return stripIndent(`
        <fieldset class="date-range date-range--${range ? "range" : "single"}">
          <legend>${range ? "分析期间" : "截止日期"}</legend>
          <label>${range ? "开始日期" : "日期"}<input type="date" min="2025-01-01" max="2027-12-31"${stateAttributes}></label>
          ${range ? `<label>结束日期<input type="date" min="2025-01-01" max="2027-12-31"${stateAttributes}></label>` : ""}
          <small>${model.state === "error" ? "结束日期不能早于开始日期。" : "包含范围边界。"}</small>
        </fieldset>
      `);
    },
    bind(host, { model }) {
      focusWhenPreviewed(host, model, "[data-sp-date-start]");
    },
  }),

  createDefinition({
    id: "textarea",
    defaultVariant: "standard",
    defaultState: "default",
    render(model) {
      const error = model.state === "error";
      const value =
        error
          ? "上下文不足。"
          : model.state === "default" || model.state === "focus"
            ? ""
            : "现有依据支持在已批准范围内采用所选方案。";
      return previewFrame(
        model,
        `
          <label class="sp-field-value">
            <span>决策理由</span>
            <textarea
              rows="4"
              maxlength="240"
              placeholder="说明选择该方案的理由"
              aria-invalid="${error}"
              aria-describedby="sp-textarea-note"
              ${boolAttribute("disabled", model.state === "disabled")}
              ${boolAttribute("readonly", model.state === "readonly")}
              data-sp-textarea
            >${escapeHtml(value)}</textarea>
            <small id="sp-textarea-note" class="${error ? "is-error" : ""}">
              ${error ? "请补充依据和决策边界。" : `${value.length} / 240 · 无需重复结论。`}
            </small>
          </label>
        `,
        { label: "多行输入框交互示例", status: stateReceipt(model, model.variant === "resizable" ? "可纵向调整尺寸" : "固定高度") },
      );
    },
    markup(model) {
      const value =
        model.state === "error"
          ? "上下文不足。"
          : model.state === "default" || model.state === "focus"
            ? ""
            : "现有依据支持在已批准范围内采用所选方案。";
      return `<label class="textarea textarea--${model.variant}">决策理由<textarea rows="4" maxlength="240"${model.state === "error" ? ' aria-invalid="true"' : ""}${model.state === "disabled" ? " disabled" : ""}${model.state === "readonly" ? " readonly" : ""}>${value}</textarea></label>`;
    },
    bind(host, { model }) {
      focusWhenPreviewed(host, model, "[data-sp-textarea]");
      const textarea = host.querySelector("[data-sp-textarea]");
      textarea?.addEventListener("input", () => {
        const note = host.querySelector("#sp-textarea-note");
        if (note && model.state !== "error") note.textContent = `${textarea.value.length} / 240 · 无需重复结论。`;
      });
    },
  }),

  createDefinition({
    id: "select",
    defaultVariant: "native",
    defaultState: "default",
    defaultModel: { selection: "0", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["native", "enhanced"] },
      {
        key: "selection",
        label: "已选值",
        options: [
          { value: "0", label: "财务管理层" },
          { value: "1", label: "流程负责人" },
          { value: "2", label: "工作团队" },
        ],
      },
      { key: "interaction", label: "交互状态", options: ["rest", "focus", "open", "error", "disabled"] },
    ],
    normalizeModel(model) {
      const states = { rest: "default", focus: "focus", open: "open", error: "error", disabled: "disabled" };
      return {
        ...model,
        selectedIndex: Number(model.selection),
        state: states[model.interaction] || "default",
      };
    },
    isValidModel(model) {
      return !(model.variant === "native" && model.interaction === "open");
    },
    invalidReason(model) {
      return model.variant === "native" && model.state === "open"
        ? "原生选择框浮层由浏览器和操作系统控制，参考站点不模拟该界面。"
        : "";
    },
    render(model) {
      const error = model.interaction === "error";
      const open = model.interaction === "open";
      const disabled = model.interaction === "disabled";
      const options = ["财务管理层", "流程负责人", "工作团队"];
      const selectedIndex = Number.isInteger(model.selectedIndex)
        ? Math.max(0, Math.min(options.length - 1, model.selectedIndex))
        : 0;
      const control =
        model.variant === "native"
          ? `
            <select
              aria-invalid="${error}"
              aria-describedby="sp-select-note"
              ${boolAttribute("disabled", disabled)}
              data-sp-native-select
            >
              ${options
                .map(
                  (option, index) =>
                    `<option value="${index}"${index === selectedIndex ? " selected" : ""}>${escapeHtml(option)}</option>`,
                )
                .join("")}
            </select>
          `
          : `
            <button
              type="button"
              role="combobox"
              aria-expanded="${open}"
              aria-controls="sp-select-listbox"
              aria-invalid="${error}"
              ${boolAttribute("disabled", disabled)}
              data-sp-select-trigger
            >${escapeHtml(options[selectedIndex])} <span aria-hidden="true">⌄</span></button>
            <div id="sp-select-listbox" role="listbox" ${boolAttribute("hidden", !open)} data-sp-select-listbox>
              ${options
                .map(
                  (option, index) => `
                    <button type="button" role="option" aria-selected="${index === selectedIndex}" tabindex="${index === selectedIndex ? "0" : "-1"}" data-sp-select-option="${index}">
                      ${escapeHtml(option)}
                    </button>
                  `,
                )
                .join("")}
            </div>
          `;
      return previewFrame(
        model,
        `
          <label class="sp-field-value sp-select-value">
            <span>受众</span>
            ${control}
            <small id="sp-select-note" class="${error ? "is-error" : ""}">
              ${error ? "请选择权限范围内的受众。" : `${model.variant === "native" ? "原生" : "增强"}选择控件。`}
            </small>
          </label>
        `,
        { label: "选择框交互示例", status: stateReceipt(model, open ? "选项可见" : "单一已选值") },
      );
    },
    markup(model) {
      const options = ["财务管理层", "流程负责人", "工作团队"];
      const selectedIndex = Number.isInteger(model.selectedIndex)
        ? Math.max(0, Math.min(options.length - 1, model.selectedIndex))
        : 0;
      if (model.variant === "native") {
        return `<label>受众<select aria-describedby="audience-note"${model.interaction === "disabled" ? " disabled" : ""}${model.interaction === "error" ? ' aria-invalid="true"' : ""}>${options.map((option, index) => `<option${index === selectedIndex ? " selected" : ""}>${option}</option>`).join("")}</select><small id="audience-note">${model.interaction === "error" ? "请选择权限范围内的受众。" : "原生选择控件。"}</small></label>`;
      }
      return `<button type="button" role="combobox" aria-expanded="${model.interaction === "open"}" aria-controls="audience-options"${model.interaction === "disabled" ? " disabled" : ""}${model.interaction === "error" ? ' aria-invalid="true"' : ""}>${options[selectedIndex]}</button>\n<div id="audience-options" role="listbox"${model.interaction === "open" ? "" : " hidden"}>${options.map((option, index) => `<button type="button" role="option" aria-selected="${index === selectedIndex}">${option}</button>`).join("")}</div>`;
    },
    bind(host, { model, setModel }) {
      focusWhenPreviewed(host, model, model.variant === "native" ? "[data-sp-native-select]" : "[data-sp-select-trigger]");
      const trigger = host.querySelector("[data-sp-select-trigger]");
      trigger?.addEventListener("click", () =>
        setModel({ interaction: model.interaction === "open" ? "rest" : "open" }, {
          focusSelector:
            model.interaction === "open"
              ? "[data-sp-select-trigger]"
              : '[data-sp-select-option][aria-selected="true"]',
        }),
      );
      host.querySelector("[data-sp-native-select]")?.addEventListener("change", (event) => {
        setModel(
          {
            interaction: "rest",
            selection: String(event.currentTarget.selectedIndex),
            selectedIndex: event.currentTarget.selectedIndex,
          },
          { focusSelector: "[data-sp-native-select]" },
        );
      });
      host.querySelectorAll("[data-sp-select-option]").forEach((option) => {
        option.addEventListener("click", () =>
          setModel(
            {
              interaction: "rest",
              selection: option.dataset.spSelectOption,
              selectedIndex: Number(option.dataset.spSelectOption),
            },
            { focusSelector: "[data-sp-select-trigger]" },
          ),
        );
      });
      bindRovingGroup(host, "[data-sp-select-option]", { orientation: "vertical" });
      bindEscape(host, () => {
        if (model.interaction === "open") {
          setModel({ interaction: "rest" }, { focusSelector: "[data-sp-select-trigger]" });
        }
      });
      if (model.variant === "enhanced" && model.interaction === "open") {
        requestAnimationFrame(() =>
          host.querySelector('[data-sp-select-option][aria-selected="true"]')?.focus({ preventScroll: true }),
        );
      }
    },
  }),

  createDefinition({
    id: "checkbox",
    defaultVariant: "standalone",
    defaultState: "unchecked",
    defaultModel: { value: "unchecked", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["standalone", "parent group"] },
      { key: "value", label: "值", options: ["unchecked", "checked", "indeterminate"] },
      { key: "interaction", label: "交互状态", options: ["rest", "focus", "disabled"] },
    ],
    normalizeModel(model) {
      return {
        ...model,
        state: model.interaction === "focus" ? "focus" : model.interaction === "disabled" ? "disabled" : model.value,
      };
    },
    isValidModel(model) {
      return !(model.variant === "standalone" && model.value === "indeterminate");
    },
    invalidReason() {
      return "部分选中状态仅用于汇总子选项的父级复选框。";
    },
    variantPreviewState: "indeterminate",
    render(model) {
      const checked = model.value === "checked";
      const indeterminate = model.value === "indeterminate";
      return previewFrame(
        model,
        `
          <fieldset class="sp-checkbox-value">
            <legend>发布选项</legend>
            <label>
              <input
                type="checkbox"
                ${boolAttribute("checked", checked)}
                ${boolAttribute("disabled", model.interaction === "disabled")}
                data-sp-checkbox
              >
              <span>包含支撑数据</span>
              <small>${indeterminate ? "已选择部分子数据集。" : checked ? "将发布支撑数据。" : "只发布叙事内容。"}</small>
            </label>
            ${
              model.variant === "parent group"
                ? `<div class="sp-child-options"><label><input type="checkbox" checked> 实际</label><label><input type="checkbox"> 计划</label></div>`
                : ""
            }
          </fieldset>
        `,
        { label: "复选框交互示例", status: stateReceipt(model, indeterminate ? "混合选择" : checked ? "已选中" : "未选中") },
      );
    },
    markup(model) {
      return `<fieldset class="checkbox checkbox--${model.variant}"><legend>发布选项</legend><label><input type="checkbox"${model.value === "checked" ? " checked" : ""}${model.interaction === "disabled" ? " disabled" : ""}${model.value === "indeterminate" ? ' data-indeterminate="true"' : ""}> 包含支撑数据</label>${model.variant === "parent group" ? "\n<div><label><input type=\"checkbox\" checked> 实际</label><label><input type=\"checkbox\"> 计划</label></div>" : ""}</fieldset>${model.value === "indeterminate" ? "\n<!-- 挂载后设置 input.indeterminate = true。 -->" : ""}`;
    },
    bind(host, { model, setModel }) {
      const checkbox = host.querySelector("[data-sp-checkbox]");
      if (checkbox) checkbox.indeterminate = model.value === "indeterminate";
      checkbox?.addEventListener("change", () =>
        setModel(
          { value: checkbox.checked ? "checked" : "unchecked", interaction: "rest" },
          { focusSelector: "[data-sp-checkbox]" },
        ),
      );
      focusWhenPreviewed(host, model, "[data-sp-checkbox]");
    },
  }),

  createDefinition({
    id: "switch",
    defaultVariant: "standard",
    defaultState: "off",
    defaultModel: { value: "off", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["standard"] },
      { key: "value", label: "值", options: ["off", "on"] },
      { key: "interaction", label: "交互状态", options: ["rest", "focus", "pending", "disabled"] },
    ],
    normalizeModel(model) {
      return {
        ...model,
        state:
          model.interaction === "focus"
            ? "focus"
            : model.interaction === "pending"
              ? "pending"
              : model.interaction === "disabled"
                ? "disabled"
                : model.value,
      };
    },
    render(model) {
      const checked = model.value === "on";
      return previewFrame(
        model,
        `
          <label class="sp-switch-value">
            <input
              type="checkbox"
              role="switch"
              ${boolAttribute("checked", checked)}
              ${boolAttribute("disabled", ["disabled", "pending"].includes(model.interaction))}
              aria-busy="${model.interaction === "pending"}"
              data-sp-switch
            >
            <span aria-hidden="true"><i></i></span>
            <b>显示依据编号</b>
            <small data-sp-switch-status>${
              model.interaction === "pending"
                ? `正在保存 · 当前仍为${checked ? "开启" : "关闭"}`
                : checked
                  ? "开启 · 编号立即可见"
                  : "关闭 · 编号保持隐藏"
            }</small>
          </label>
        `,
        {
          label: "开关交互示例",
          status: stateReceipt(
            model,
            model.interaction === "pending" ? "等待设置回执" : checked ? "设置已开启" : "设置已关闭",
          ),
        },
      );
    },
    markup(model) {
      const pending = model.interaction === "pending";
      return `<label><input type="checkbox" role="switch"${model.value === "on" ? " checked" : ""}${pending ? ' aria-busy="true"' : ""}${["disabled", "pending"].includes(model.interaction) ? " disabled" : ""}> 显示依据编号</label>`;
    },
    bind(host, { model, setModel }) {
      focusWhenPreviewed(host, model, "[data-sp-switch]");
      const input = host.querySelector("[data-sp-switch]");
      input?.addEventListener("change", () => {
        setModel(
          { value: input.checked ? "on" : "off", interaction: "rest" },
          { focusSelector: "[data-sp-switch]" },
        );
      });
    },
  }),
];
