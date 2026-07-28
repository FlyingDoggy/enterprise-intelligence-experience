import {
  bindEscape,
  bindFocusTrap,
  bindRovingGroup,
  boolAttribute,
  createDefinition,
  escapeHtml,
  focusWhenPreviewed,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";
import { uiLabel } from "../locales/zh-CN.js";

function tabsMarkup(model) {
  const selectedIndex = Number.isInteger(model.selectedTab)
    ? Math.max(0, Math.min(2, model.selectedTab))
    : model.state === "selected" || model.state === "focus"
      ? 1
      : 0;
  const labels = ["概览", "依据", "历史记录"];
  return `
    <div class="sp-tabs-value" data-sp-tabs>
      <div role="tablist" aria-label="分析章节">
        ${labels
          .map(
            (label, index) => `
              <button
                type="button"
                role="tab"
                id="sp-tab-${index}"
                aria-selected="${index === selectedIndex}"
                aria-controls="sp-tab-panel"
                tabindex="${index === selectedIndex ? "0" : "-1"}"
                ${boolAttribute("disabled", model.state === "disabled" && index === 2)}
                data-sp-tab="${index}"
              >${escapeHtml(label)}</button>
            `,
          )
          .join("")}
      </div>
      <section id="sp-tab-panel" role="tabpanel" aria-labelledby="sp-tab-${selectedIndex}">
        <strong>${escapeHtml(labels[selectedIndex])}</strong>
        <p>${selectedIndex === 1 ? "3 份已核验回执，1 个已过期来源。" : "当前分析文档修订版本 r4。"}</p>
      </section>
    </div>
  `;
}

export const navigationOverlayDefinitions = [
  createDefinition({
    id: "tabs",
    defaultVariant: "line",
    defaultState: "default",
    defaultModel: { selection: "0", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["line", "contained"] },
      {
        key: "selection",
        label: "已选值",
        options: [
          { value: "0", label: "概览" },
          { value: "1", label: "依据" },
          { value: "2", label: "历史记录" },
        ],
      },
      { key: "interaction", label: "交互状态", options: ["rest", "focus", "history disabled"] },
    ],
    normalizeModel(model) {
      const selectedTab = Number(model.selection);
      const state =
        model.interaction === "focus"
          ? "focus"
          : model.interaction === "history disabled"
            ? "disabled"
            : selectedTab === 0
              ? "default"
              : "selected";
      return { ...model, selectedTab, state };
    },
    isValidModel(model) {
      return !(model.interaction === "history disabled" && String(model.selection) === "2");
    },
    invalidReason() {
      return "已禁用的“历史记录”页签不能同时处于选中状态。";
    },
    render(model) {
      return previewFrame(model, tabsMarkup(model), {
        label: "页签交互示例",
        status: stateReceipt(model, "方向键移动并选择"),
      });
    },
    markup(model) {
      const selectedIndex = Number.isInteger(model.selectedTab)
        ? Math.max(0, Math.min(2, model.selectedTab))
        : model.state === "selected" || model.state === "focus"
          ? 1
          : 0;
      const selectedLabel = ["概览", "依据", "历史记录"][selectedIndex];
      return stripIndent(`
        <div class="tabs tabs--${model.variant}">
          <div role="tablist" aria-label="分析章节">
            <button type="button" role="tab" aria-selected="true" aria-controls="selected-panel">${selectedLabel}</button>
            ${model.state === "disabled" ? '<button type="button" role="tab" aria-selected="false" disabled>历史记录</button>' : ""}
          </div>
          <section id="selected-panel" role="tabpanel">${selectedLabel}内容</section>
        </div>
      `);
    },
    bind(host, { model, setModel }) {
      const tabs = [...host.querySelectorAll("[data-sp-tab]")];
      const select = (button) => {
        const index = Number(button.dataset.spTab);
        setModel(
          { selection: String(index), interaction: "rest", selectedTab: index },
          { focusSelector: `[data-sp-tab="${index}"]` },
        );
      };
      tabs.forEach((button) => button.addEventListener("click", () => select(button)));
      bindRovingGroup(host, "[data-sp-tab]", { select });
      focusWhenPreviewed(host, model, '[data-sp-tab="1"]');
    },
  }),

  createDefinition({
    id: "segmented-control",
    defaultVariant: "standard",
    defaultState: "default",
    defaultModel: { selection: "0", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["standard", "compact"] },
      {
        key: "selection",
        label: "已选值",
        options: [
          { value: "0", label: "快速阅读" },
          { value: "1", label: "完整规范" },
          { value: "2", label: "对比" },
        ],
      },
      { key: "interaction", label: "交互状态", options: ["rest", "focus", "compare disabled"] },
    ],
    normalizeModel(model) {
      const selectedSegment = Number(model.selection);
      const state =
        model.interaction === "focus"
          ? "focus"
          : model.interaction === "compare disabled"
            ? "disabled"
            : selectedSegment === 0
              ? "default"
              : "selected";
      return { ...model, selectedSegment, state };
    },
    isValidModel(model) {
      return !(model.interaction === "compare disabled" && String(model.selection) === "2");
    },
    invalidReason() {
      return "已禁用的分段选项不能同时处于选中状态。";
    },
    render(model) {
      const selectedIndex = Number.isInteger(model.selectedSegment)
        ? Math.max(0, Math.min(2, model.selectedSegment))
        : model.state === "selected" || model.state === "focus"
          ? 1
          : 0;
      return previewFrame(
        model,
        `
          <div class="sp-segmented-value" role="group" aria-label="阅读密度">
            ${["快速阅读", "完整规范", "对比"]
              .map(
                (label, index) => `
                  <button
                    type="button"
                    aria-pressed="${index === selectedIndex}"
                    ${boolAttribute("disabled", model.state === "disabled" && index === 2)}
                    data-sp-segment="${index}"
                  >${label}</button>
                `,
              )
              .join("")}
          </div>
          <p class="sp-segment-result">当前密度 · ${["快速阅读", "完整规范", "对比"][selectedIndex]}</p>
        `,
        { label: "分段选择器交互示例", status: stateReceipt(model, "单一即时选择") },
      );
    },
    markup(model) {
      const selectedIndex = Number.isInteger(model.selectedSegment)
        ? Math.max(0, Math.min(2, model.selectedSegment))
        : model.state === "selected" || model.state === "focus"
          ? 1
          : 0;
      return `<div class="segmented segmented--${model.variant}" role="group" aria-label="阅读密度"><button type="button" aria-pressed="${selectedIndex === 0}">快速阅读</button><button type="button" aria-pressed="${selectedIndex === 1}">完整规范</button><button type="button" aria-pressed="${selectedIndex === 2}"${model.state === "disabled" ? " disabled" : ""}>对比</button></div>`;
    },
    bind(host, { model, setModel }) {
      const buttons = [...host.querySelectorAll("[data-sp-segment]")];
      const select = (button) => {
        const index = Number(button.dataset.spSegment);
        setModel(
          { selection: String(index), interaction: "rest", selectedSegment: index },
          { focusSelector: `[data-sp-segment="${index}"]` },
        );
      };
      buttons.forEach((button) => button.addEventListener("click", () => select(button)));
      bindRovingGroup(host, "[data-sp-segment]", { select });
      focusWhenPreviewed(host, model, '[data-sp-segment="1"]');
    },
  }),

  createDefinition({
    id: "disclosure",
    defaultVariant: "plain",
    defaultState: "collapsed",
    defaultModel: { expansion: "collapsed", interaction: "rest" },
    controls: [
      { key: "variant", label: "变体", options: ["plain", "bordered"] },
      { key: "expansion", label: "值", options: ["collapsed", "expanded"] },
      { key: "interaction", label: "交互状态", options: ["rest", "focus"] },
    ],
    normalizeModel(model) {
      return {
        ...model,
        state: model.interaction === "focus" ? "focus" : model.expansion,
      };
    },
    render(model) {
      const expanded = model.expansion === "expanded";
      return previewFrame(
        model,
        `
          <div class="sp-disclosure-value">
            <button
              type="button"
              aria-expanded="${expanded}"
              aria-controls="sp-disclosure-panel"
              data-sp-disclosure
            >
              依据限制 <span aria-hidden="true">${expanded ? "−" : "+"}</span>
            </button>
            <div id="sp-disclosure-panel" ${boolAttribute("hidden", !expanded)}>
              缺少所需基准，因此无法进行归因分析。
            </div>
          </div>
        `,
        {
          label: "展开收起交互示例",
          status: stateReceipt(model, expanded ? "内容已展开" : "补充内容已收起"),
        },
      );
    },
    markup(model) {
      const expanded = model.expansion === "expanded";
      return `<button type="button" aria-expanded="${expanded}" aria-controls="limitations">依据限制</button>\n<div id="limitations"${expanded ? "" : " hidden"}>无法进行归因分析。</div>`;
    },
    bind(host, { model, setModel }) {
      host.querySelector("[data-sp-disclosure]")?.addEventListener("click", () => {
        setModel(
          {
            expansion: model.expansion === "expanded" ? "collapsed" : "expanded",
            interaction: "rest",
          },
          { focusSelector: "[data-sp-disclosure]" },
        );
      });
      focusWhenPreviewed(host, model, "[data-sp-disclosure]");
    },
  }),

  createDefinition({
    id: "tooltip",
    defaultVariant: "top",
    defaultState: "hidden",
    variantPreviewState: "visible",
    render(model) {
      const visible = model.state === "visible";
      return previewFrame(
        model,
        `
          <div class="sp-tooltip-value">
            <button
              type="button"
              aria-label="依据说明"
              aria-describedby="sp-tooltip-content"
              data-sp-tooltip-trigger
            >依</button>
            <span id="sp-tooltip-content" role="tooltip" ${boolAttribute("hidden", !visible)}>
              打开依据回执
            </span>
          </div>
        `,
        { label: "提示气泡交互示例", status: stateReceipt(model, visible ? `${uiLabel(model.variant)}位置` : "视觉上不可见") },
      );
    },
    markup(model) {
      return `<div class="tooltip tooltip--${model.variant}"><button type="button" aria-label="依据说明" aria-describedby="evidence-tip">依</button>\n<span id="evidence-tip" role="tooltip"${model.state === "hidden" ? " hidden" : ""}>打开依据回执</span></div>`;
    },
    bind(host, { model }) {
      const trigger = host.querySelector("[data-sp-tooltip-trigger]");
      const tooltip = host.querySelector("[role=tooltip]");
      if (!trigger || !tooltip || model.state !== "hidden") return;
      const setVisible = (visible) => {
        tooltip.hidden = !visible;
        const receipt = host.querySelector("[data-specimen-state-output]");
        if (receipt) {
          receipt.textContent = `${uiLabel(model.variant)} · 隐藏 · ${visible ? "因焦点或悬停而临时可见" : "视觉上不可见"}`;
        }
      };
      const show = () => setVisible(true);
      const hide = () => setVisible(false);
      trigger.addEventListener("pointerenter", show);
      trigger.addEventListener("focus", show);
      trigger.addEventListener("pointerleave", hide);
      trigger.addEventListener("blur", hide);
      bindEscape(host, hide);
    },
  }),

  createDefinition({
    id: "menu",
    defaultVariant: "action",
    defaultState: "closed",
    defaultModel: { visibility: "closed", focusTarget: "trigger", availability: "all enabled" },
    controls: [
      { key: "variant", label: "操作类型", options: ["action", "selection"] },
      { key: "visibility", label: "可见性", options: ["closed", "open"] },
      { key: "focusTarget", label: "焦点位置", options: ["trigger", "first item"] },
      { key: "availability", label: "可用性", options: ["all enabled", "second disabled"] },
    ],
    normalizeModel(model) {
      const state =
        model.availability === "second disabled"
          ? "disabled item"
          : model.visibility === "open" && model.focusTarget === "first item"
            ? "focused"
            : model.visibility;
      return { ...model, state };
    },
    isValidModel(model) {
      return !(model.visibility === "closed" && model.focusTarget === "first item");
    },
    invalidReason() {
      return "菜单关闭后，焦点不能继续留在菜单内部。";
    },
    render(model) {
      const open = model.visibility === "open";
      const isSelection = model.variant === "selection";
      const items = isSelection
        ? [
            {
              label: "财务管理层",
              description: "快速阅读 · 仅显示已核验结论",
            },
            {
              label: "流程负责人",
              description: "事项状态 · 异常与控制",
            },
            {
              label: "工作团队",
              description: "完整规范 · 依据与工作明细",
            },
          ]
        : [
            {
              label: "创建分支",
              description: "从修订版本 r4 开始，但不修改原版本",
              meta: "新修订版本",
            },
            {
              label: "复制链接",
              description: "复制当前工作对象的深链接",
              meta: "剪贴板",
            },
            {
              label: "查看历史记录",
              description: "检查修订版本、决策和审计编号",
              meta: "只读",
            },
          ];
      const selectedIndex = Number.isInteger(model.selectedMenuIndex)
        ? Math.max(0, Math.min(items.length - 1, model.selectedMenuIndex))
        : 0;
      const selectedLabel = items[selectedIndex].label;
      const contractTitle = isSelection
        ? `当前值 · ${selectedLabel}`
        : model.lastMenuAction
          ? `命令已完成 · ${model.lastMenuAction}`
          : "命令列表 · 不保留选中值";
      const contractDetail = isSelection
        ? "选择一个项目会修改一项持久属性，并同步更新触发控件。"
        : "选择一个项目只执行一次；再次打开菜单时，不会把该命令标记为已选择。";
      return previewFrame(
        model,
        `
          <div class="sp-menu-value">
            <header class="sp-menu-context">
              <span>${isSelection ? "值控制" : "对象命令"}</span>
              <strong>${isSelection ? "设置交付物受众" : "分析文档 · 修订版本 r4"}</strong>
              <p>${isSelection ? "菜单关闭后保留一个当前值。" : "每个项目执行一次有明确名称的命令。"}</p>
            </header>

            <div class="sp-menu-contract" aria-live="polite">
              <span>${isSelection ? "选择约定" : "操作约定"}</span>
              <strong>${escapeHtml(contractTitle)}</strong>
              <small>${contractDetail}</small>
            </div>

            <div class="sp-menu-anchor">
              <button
                class="sp-menu-trigger ${isSelection ? "sp-menu-trigger-selection" : "sp-menu-trigger-action"}"
                type="button"
                aria-haspopup="menu"
                aria-expanded="${open}"
                data-sp-menu-trigger
              >
                ${
                  isSelection
                    ? `<span class="sp-menu-trigger-copy"><small>受众</small><strong>${escapeHtml(selectedLabel)}</strong></span><span class="sp-menu-chevron" aria-hidden="true">⌄</span>`
                    : `<span class="sp-menu-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>更多操作</span><span class="sp-menu-chevron" aria-hidden="true">⌄</span>`
                }
              </button>
              <div role="menu" aria-label="${isSelection ? "选择交付物受众" : "分析文档操作"}" ${boolAttribute("hidden", !open)} data-sp-menu>
                ${
                  isSelection
                    ? '<p class="sp-menu-group-label" aria-hidden="true">交付物受众</p>'
                    : '<p class="sp-menu-group-label" aria-hidden="true">可用命令</p>'
                }
                ${items
                  .map(
                    (item, index) => `
                      <button
                        class="${isSelection ? "sp-menu-selection-item" : "sp-menu-action-item"}"
                        type="button"
                        role="menuitem${isSelection ? "radio" : ""}"
                        ${isSelection ? `aria-checked="${index === selectedIndex}"` : ""}
                        ${boolAttribute("disabled", model.availability === "second disabled" && index === 1)}
                        tabindex="${open && index === 0 ? "0" : "-1"}"
                        data-sp-menu-item
                        data-sp-menu-label="${escapeHtml(item.label)}"
                      >
                        ${isSelection ? '<span class="sp-menu-radio" aria-hidden="true"></span>' : ""}
                        <span class="sp-menu-item-copy">
                          <strong>${escapeHtml(item.label)}</strong>
                          <small>${escapeHtml(item.description)}</small>
                        </span>
                        <span class="sp-menu-item-meta">
                          ${
                            model.availability === "second disabled" && index === 1
                              ? "不可用"
                              : isSelection
                                ? index === selectedIndex
                                  ? "当前"
                                  : ""
                                : escapeHtml(item.meta)
                          }
                        </span>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `,
        {
          label: `${isSelection ? "选择型" : "命令型"}菜单交互示例`,
          status: stateReceipt(
            model,
            isSelection
              ? `持久值 ${selectedLabel}`
              : model.lastMenuAction
                ? `已调用${model.lastMenuAction}；不保留选中状态`
                : "一次性命令；不保留选中状态",
          ),
        },
      );
    },
    markup(model) {
      const selectedIndex = Number.isInteger(model.selectedMenuIndex)
        ? Math.max(0, Math.min(2, model.selectedMenuIndex))
        : 0;
      const labels = ["财务管理层", "流程负责人", "工作团队"];
      if (model.variant === "selection") {
        return stripIndent(`
          <button type="button" aria-haspopup="menu" aria-expanded="${model.visibility === "open"}">
            <span>受众</span>
            <strong>${labels[selectedIndex]}</strong>
          </button>
          <div role="menu" aria-label="选择交付物受众"${model.visibility === "closed" ? " hidden" : ""}>
            ${labels
              .map(
                (label, index) =>
                  `<button type="button" role="menuitemradio" aria-checked="${index === selectedIndex}"${model.availability === "second disabled" && index === 1 ? " disabled" : ""}>${label}</button>`,
              )
              .join("")}
          </div>
        `);
      }
      return stripIndent(`
        <button type="button" aria-haspopup="menu" aria-expanded="${model.visibility === "open"}">更多操作</button>
        <div role="menu" aria-label="分析文档操作"${model.visibility === "closed" ? " hidden" : ""}>
          <button type="button" role="menuitem">创建分支</button>
          <button type="button" role="menuitem"${model.availability === "second disabled" ? " disabled" : ""}>复制链接</button>
          <button type="button" role="menuitem">查看历史记录</button>
        </div>
      `);
    },
    bind(host, { model, setModel }) {
      const trigger = host.querySelector("[data-sp-menu-trigger]");
      trigger?.addEventListener("click", () => {
        const opening = model.visibility === "closed";
        setModel({ visibility: opening ? "open" : "closed", focusTarget: opening ? "first item" : "trigger" }, {
          focusSelector: opening ? "[data-sp-menu-item]" : "[data-sp-menu-trigger]",
        });
      });
      trigger?.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
        event.preventDefault();
        setModel(
          { visibility: "open", focusTarget: "first item" },
          { focusSelector: event.key === "ArrowUp" ? "[data-sp-menu-item]:last-of-type" : "[data-sp-menu-item]" },
        );
      });
      host.querySelectorAll("[data-sp-menu-item]").forEach((item, index) => {
        item.addEventListener("click", () =>
          setModel(
            model.variant === "selection"
              ? { visibility: "closed", focusTarget: "trigger", selectedMenuIndex: index }
              : { visibility: "closed", focusTarget: "trigger", lastMenuAction: item.dataset.spMenuLabel },
            { focusSelector: "[data-sp-menu-trigger]" },
          ),
        );
      });
      bindRovingGroup(host, "[data-sp-menu-item]", { orientation: "vertical" });
      bindEscape(host, () =>
        setModel({ visibility: "closed", focusTarget: "trigger" }, { focusSelector: "[data-sp-menu-trigger]" }),
      );
      host.addEventListener("click", (event) => {
        if (model.visibility === "closed" || event.target.closest(".sp-menu-anchor")) return;
        setModel({ visibility: "closed", focusTarget: "trigger" }, { focusSelector: "[data-sp-menu-trigger]" });
      });
      if (model.visibility === "open" && model.focusTarget === "first item") {
        requestAnimationFrame(() => host.querySelector("[data-sp-menu-item]")?.focus());
      }
    },
  }),

  createDefinition({
    id: "dialog",
    defaultVariant: "standard",
    defaultState: "closed",
    defaultModel: { visibility: "closed", operation: "idle" },
    controls: [
      { key: "variant", label: "变体", options: ["standard", "confirmation", "danger"] },
      { key: "visibility", label: "可见性", options: ["closed", "open"] },
      { key: "operation", label: "运行状态", options: ["idle", "busy", "error"] },
    ],
    normalizeModel(model) {
      return {
        ...model,
        state: model.visibility === "closed" ? "closed" : model.operation === "idle" ? "open" : model.operation,
      };
    },
    isValidModel(model) {
      return !(model.visibility === "closed" && model.operation !== "idle");
    },
    invalidReason() {
      return "处理中和错误状态只适用于已打开的对话框。";
    },
    render(model) {
      const open = model.visibility === "open";
      const titles = {
        standard: "编辑分析标题",
        confirmation: "发布这个修订版本？",
        danger: "撤回已发布内容？",
      };
      return previewFrame(
        model,
        `
          <div class="sp-overlay-launch">
            <button type="button" data-sp-dialog-trigger>打开${escapeHtml(model.variant === "standard" ? "标准" : model.variant === "confirmation" ? "确认" : "高风险")}对话框</button>
            ${model.completed ? '<p class="sp-state-receipt" role="status">本地模拟已确认，未执行外部操作。</p>' : ""}
            ${
              open
                ? `
                  <div class="sp-overlay-layer" data-sp-dialog-layer>
                    <section role="dialog" aria-modal="true" aria-labelledby="sp-dialog-title" aria-busy="${model.operation === "busy"}" data-sp-dialog>
                      <span>${model.variant === "danger" ? "不可逆影响" : "受控任务"}</span>
                      <h3 id="sp-dialog-title">${escapeHtml(titles[model.variant])}</h3>
                      <p>决策前始终显示当前修订版本和受众范围。</p>
                      ${model.operation === "error" ? `<div class="sp-inline-error" role="alert">依据已变化，请重新校验。</div>` : ""}
                      ${model.variant === "standard" ? `<label>标题<input value="FY27 绩效评审" ${boolAttribute("disabled", model.operation === "busy")}></label>` : ""}
                      <footer>
                        <button type="button" data-sp-dialog-close>取消</button>
                        <button type="button" class="${model.variant === "danger" ? "danger" : "primary"}" ${boolAttribute("disabled", model.operation === "busy")} data-sp-dialog-confirm>
                          ${model.operation === "busy" ? "处理中…" : model.variant === "danger" ? "撤回" : "确认"}
                        </button>
                      </footer>
                    </section>
                  </div>
                `
                : ""
            }
          </div>
        `,
        { label: "对话框交互示例", status: stateReceipt(model, open ? "模态焦点范围" : "已关闭") },
      );
    },
    markup(model) {
      const titles = {
        standard: "编辑分析标题",
        confirmation: "发布这个修订版本？",
        danger: "撤回已发布内容？",
      };
      const action = model.variant === "danger" ? "撤回" : "确认";
      return stripIndent(`
        <button type="button" aria-haspopup="dialog">打开${model.variant === "standard" ? "标准" : model.variant === "confirmation" ? "确认" : "高风险"}对话框</button>
        ${model.completed ? '<p role="status">本地模拟已确认，未执行外部操作。</p>' : ""}
        ${
          model.visibility === "closed"
            ? ""
            : `<section role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-busy="${model.operation === "busy"}">
          <h2 id="dialog-title">${titles[model.variant]}</h2>
          ${model.operation === "error" ? '<p role="alert">依据已变化，请重新校验。</p>' : ""}
          ${model.variant === "standard" ? '<label>标题<input value="FY27 绩效评审"></label>' : ""}
          <button type="button">取消</button>
          <button type="button"${model.operation === "busy" ? " disabled" : ""}>${model.operation === "busy" ? "处理中…" : action}</button>
        </section>`
        }
      `);
    },
    bind(host, { model, setModel }) {
      host.querySelector("[data-sp-dialog-trigger]")?.addEventListener("click", () => {
        setModel({ visibility: "open", operation: "idle" }, { focusSelector: "[data-sp-dialog-close]" });
      });
      host.querySelector("[data-sp-dialog-close]")?.addEventListener("click", () => {
        setModel({ visibility: "closed", operation: "idle" }, { focusSelector: "[data-sp-dialog-trigger]" });
      });
      host.querySelector("[data-sp-dialog-confirm]")?.addEventListener("click", () => {
        setModel({ visibility: "closed", operation: "idle", completed: true }, { focusSelector: "[data-sp-dialog-trigger]" });
      });
      host.querySelector("[data-sp-dialog-layer]")?.addEventListener("click", (event) => {
        if (event.target !== event.currentTarget || model.operation === "busy") return;
        setModel({ visibility: "closed", operation: "idle" }, { focusSelector: "[data-sp-dialog-trigger]" });
      });
      bindFocusTrap(host, "[data-sp-dialog]", () =>
        setModel({ visibility: "closed", operation: "idle" }, { focusSelector: "[data-sp-dialog-trigger]" }),
      );
      if (model.visibility === "open") requestAnimationFrame(() => host.querySelector("[data-sp-dialog-close]")?.focus());
    },
  }),

  createDefinition({
    id: "drawer",
    defaultVariant: "right",
    defaultState: "closed",
    defaultModel: { visibility: "closed", operation: "idle" },
    controls: [
      { key: "variant", label: "位置", options: ["right", "left", "bottom"] },
      { key: "visibility", label: "可见性", options: ["closed", "open"] },
      { key: "operation", label: "运行状态", options: ["idle", "busy"] },
    ],
    normalizeModel(model) {
      return {
        ...model,
        state: model.visibility === "closed" ? "closed" : model.operation === "busy" ? "busy" : "open",
      };
    },
    isValidModel(model) {
      return !(model.visibility === "closed" && model.operation === "busy");
    },
    invalidReason() {
      return "已关闭的抽屉不能显示处理中状态。";
    },
    render(model) {
      const open = model.visibility === "open";
      return previewFrame(
        model,
        `
          <div class="sp-drawer-launch">
            <button type="button" data-sp-drawer-trigger>打开${escapeHtml(model.variant === "right" ? "右侧" : model.variant === "left" ? "左侧" : "底部")}抽屉</button>
            ${
              open
                ? `
                  <div class="sp-drawer-layer" data-placement="${escapeHtml(model.variant)}" data-sp-drawer-layer>
                    <aside class="sp-drawer-value" role="dialog" aria-modal="true" aria-labelledby="sp-drawer-title" data-sp-drawer>
                      <header>
                        <div><span>上下文</span><h3 id="sp-drawer-title">依据检查面板</h3></div>
                        <button type="button" aria-label="关闭抽屉" data-sp-drawer-close>×</button>
                      </header>
                      ${
                        model.operation === "busy"
                          ? `<div class="sp-drawer-busy" role="status"><i></i>正在加载来源信息…</div>`
                          : `<dl><dt>来源</dt><dd>数据集 · 收入实际值</dd><dt>修订版本</dt><dd>r4 · 已核验</dd><dt>负责人</dt><dd>财务控制团队</dd></dl>`
                      }
                      ${model.receiptOpened ? '<p class="sp-state-receipt" role="status">已在本地模拟中打开回执。</p>' : ""}
                      <footer><button type="button" ${boolAttribute("disabled", model.operation === "busy")} data-sp-drawer-open-receipt>打开回执</button></footer>
                    </aside>
                  </div>
                `
                : ""
            }
          </div>
        `,
        { label: "抽屉交互示例", status: stateReceipt(model, open ? `${model.variant === "right" ? "右侧" : model.variant === "left" ? "左侧" : "底部"}上下文层` : "已关闭") },
      );
    },
    markup(model) {
      return `<aside class="drawer drawer--${model.variant}" role="dialog" aria-modal="true" aria-busy="${model.operation === "busy"}"${model.visibility === "closed" ? " hidden" : ""}><h2>依据检查面板</h2>${model.operation === "busy" ? '<p role="status">正在加载来源信息…</p>' : "<dl><dt>来源</dt><dd>数据集 · 收入实际值</dd><dt>修订版本</dt><dd>r4 · 已核验</dd></dl>"}${model.receiptOpened ? '<p role="status">已在本地模拟中打开回执。</p>' : ""}<button type="button"${model.operation === "busy" ? " disabled" : ""}>打开回执</button><button type="button" aria-label="关闭抽屉">×</button></aside>`;
    },
    bind(host, { model, setModel }) {
      host.querySelector("[data-sp-drawer-trigger]")?.addEventListener("click", () => {
        setModel({ visibility: "open", operation: "idle" }, { focusSelector: "[data-sp-drawer-close]" });
      });
      host.querySelector("[data-sp-drawer-close]")?.addEventListener("click", () => {
        setModel({ visibility: "closed", operation: "idle" }, { focusSelector: "[data-sp-drawer-trigger]" });
      });
      host.querySelector("[data-sp-drawer-open-receipt]")?.addEventListener("click", () => {
        setModel({ visibility: "open", operation: "idle", receiptOpened: true }, { focusSelector: "[data-sp-drawer-open-receipt]" });
      });
      host.querySelector("[data-sp-drawer-layer]")?.addEventListener("click", (event) => {
        if (event.target !== event.currentTarget) return;
        setModel({ visibility: "closed", operation: "idle" }, { focusSelector: "[data-sp-drawer-trigger]" });
      });
      bindFocusTrap(host, "[data-sp-drawer]", () =>
        setModel({ visibility: "closed", operation: "idle" }, { focusSelector: "[data-sp-drawer-trigger]" }),
      );
      if (model.visibility === "open") {
        requestAnimationFrame(() => host.querySelector("[data-sp-drawer-close]")?.focus({ preventScroll: true }));
      }
    },
  }),
];
