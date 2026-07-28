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

function tabsMarkup(model) {
  const selectedIndex = Number.isInteger(model.selectedTab)
    ? Math.max(0, Math.min(2, model.selectedTab))
    : model.state === "selected" || model.state === "focus"
      ? 1
      : 0;
  const labels = ["Overview", "Evidence", "History"];
  return `
    <div class="sp-tabs-value" data-sp-tabs>
      <div role="tablist" aria-label="Analysis sections">
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
        <p>${selectedIndex === 1 ? "3 verified receipts and 1 stale source." : "Current Analysis Document revision r4."}</p>
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
      { key: "variant", label: "Variant", options: ["line", "contained"] },
      {
        key: "selection",
        label: "Selected value",
        options: [
          { value: "0", label: "Overview" },
          { value: "1", label: "Evidence" },
          { value: "2", label: "History" },
        ],
      },
      { key: "interaction", label: "Interaction", options: ["rest", "focus", "history disabled"] },
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
      return "The disabled History tab cannot also be the selected value.";
    },
    render(model) {
      return previewFrame(model, tabsMarkup(model), {
        label: "Tabs specimen",
        status: stateReceipt(model, "Arrow keys move and select"),
      });
    },
    markup(model) {
      const selectedIndex = Number.isInteger(model.selectedTab)
        ? Math.max(0, Math.min(2, model.selectedTab))
        : model.state === "selected" || model.state === "focus"
          ? 1
          : 0;
      const selectedLabel = ["Overview", "Evidence", "History"][selectedIndex];
      return stripIndent(`
        <div class="tabs tabs--${model.variant}">
          <div role="tablist" aria-label="Analysis sections">
            <button type="button" role="tab" aria-selected="true" aria-controls="selected-panel">${selectedLabel}</button>
            ${model.state === "disabled" ? '<button type="button" role="tab" aria-selected="false" disabled>History</button>' : ""}
          </div>
          <section id="selected-panel" role="tabpanel">${selectedLabel} content</section>
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
      { key: "variant", label: "Variant", options: ["standard", "compact"] },
      {
        key: "selection",
        label: "Selected value",
        options: [
          { value: "0", label: "Brief" },
          { value: "1", label: "Deep" },
          { value: "2", label: "Compare" },
        ],
      },
      { key: "interaction", label: "Interaction", options: ["rest", "focus", "compare disabled"] },
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
      return "A disabled segment cannot also be the selected value.";
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
          <div class="sp-segmented-value" role="group" aria-label="Reading density">
            ${["Brief", "Deep", "Compare"]
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
          <p class="sp-segment-result">Current density · ${["Brief", "Deep", "Compare"][selectedIndex]}</p>
        `,
        { label: "Segmented Control specimen", status: stateReceipt(model, "single immediate selection") },
      );
    },
    markup(model) {
      const selectedIndex = Number.isInteger(model.selectedSegment)
        ? Math.max(0, Math.min(2, model.selectedSegment))
        : model.state === "selected" || model.state === "focus"
          ? 1
          : 0;
      return `<div class="segmented segmented--${model.variant}" role="group" aria-label="Reading density"><button type="button" aria-pressed="${selectedIndex === 0}">Brief</button><button type="button" aria-pressed="${selectedIndex === 1}">Deep</button><button type="button" aria-pressed="${selectedIndex === 2}"${model.state === "disabled" ? " disabled" : ""}>Compare</button></div>`;
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
      { key: "variant", label: "Variant", options: ["plain", "bordered"] },
      { key: "expansion", label: "Value", options: ["collapsed", "expanded"] },
      { key: "interaction", label: "Interaction", options: ["rest", "focus"] },
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
              Evidence limitations <span aria-hidden="true">${expanded ? "−" : "+"}</span>
            </button>
            <div id="sp-disclosure-panel" ${boolAttribute("hidden", !expanded)}>
              Attribution is unavailable because the required baseline is missing.
            </div>
          </div>
        `,
        {
          label: "Disclosure specimen",
          status: stateReceipt(model, expanded ? "content exposed" : "supplementary content collapsed"),
        },
      );
    },
    markup(model) {
      const expanded = model.expansion === "expanded";
      return `<button type="button" aria-expanded="${expanded}" aria-controls="limitations">Evidence limitations</button>\n<div id="limitations"${expanded ? "" : " hidden"}>Attribution is unavailable.</div>`;
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
              aria-label="Evidence information"
              aria-describedby="sp-tooltip-content"
              data-sp-tooltip-trigger
            >E</button>
            <span id="sp-tooltip-content" role="tooltip" ${boolAttribute("hidden", !visible)}>
              Open Evidence receipt
            </span>
          </div>
        `,
        { label: "Tooltip specimen", status: stateReceipt(model, visible ? `${model.variant} placement` : "not visually present") },
      );
    },
    markup(model) {
      return `<div class="tooltip tooltip--${model.variant}"><button type="button" aria-label="Evidence information" aria-describedby="evidence-tip">E</button>\n<span id="evidence-tip" role="tooltip"${model.state === "hidden" ? " hidden" : ""}>Open Evidence receipt</span></div>`;
    },
    bind(host, { model }) {
      const trigger = host.querySelector("[data-sp-tooltip-trigger]");
      const tooltip = host.querySelector("[role=tooltip]");
      if (!trigger || !tooltip || model.state !== "hidden") return;
      const setVisible = (visible) => {
        tooltip.hidden = !visible;
        const receipt = host.querySelector("[data-specimen-state-output]");
        if (receipt) {
          receipt.textContent = `${model.variant} · hidden · ${visible ? "transiently visible from focus or hover" : "not visually present"}`;
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
      { key: "variant", label: "Contract", options: ["action", "selection"] },
      { key: "visibility", label: "Visibility", options: ["closed", "open"] },
      { key: "focusTarget", label: "Focus", options: ["trigger", "first item"] },
      { key: "availability", label: "Availability", options: ["all enabled", "second disabled"] },
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
      return "Focus cannot remain inside a closed Menu.";
    },
    render(model) {
      const open = model.visibility === "open";
      const isSelection = model.variant === "selection";
      const items = isSelection
        ? [
            {
              label: "Finance leadership",
              description: "Brief view · verified claims only",
            },
            {
              label: "Process owner",
              description: "Case state · exceptions and controls",
            },
            {
              label: "Working team",
              description: "Deep view · evidence and working detail",
            },
          ]
        : [
            {
              label: "Create branch",
              description: "Start from revision r4 without changing it",
              meta: "New revision",
            },
            {
              label: "Copy link",
              description: "Copy a deep link to this work object",
              meta: "Clipboard",
            },
            {
              label: "View history",
              description: "Inspect revisions, decisions and audit IDs",
              meta: "Read only",
            },
          ];
      const selectedIndex = Number.isInteger(model.selectedMenuIndex)
        ? Math.max(0, Math.min(items.length - 1, model.selectedMenuIndex))
        : 0;
      const selectedLabel = items[selectedIndex].label;
      const contractTitle = isSelection
        ? `Current value · ${selectedLabel}`
        : model.lastMenuAction
          ? `Command completed · ${model.lastMenuAction}`
          : "Command list · no selected value";
      const contractDetail = isSelection
        ? "Choosing an item changes one persistent property and updates the trigger."
        : "Choosing an item performs it once; reopening the menu does not mark it as selected.";
      return previewFrame(
        model,
        `
          <div class="sp-menu-value">
            <header class="sp-menu-context">
              <span>${isSelection ? "VALUE CONTROL" : "OBJECT COMMANDS"}</span>
              <strong>${isSelection ? "Set the audience for this artifact" : "Analysis Document · revision r4"}</strong>
              <p>${isSelection ? "One current value persists after the menu closes." : "Each item performs a named, one-off action."}</p>
            </header>

            <div class="sp-menu-contract" aria-live="polite">
              <span>${isSelection ? "SELECTION CONTRACT" : "ACTION CONTRACT"}</span>
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
                    ? `<span class="sp-menu-trigger-copy"><small>Audience</small><strong>${escapeHtml(selectedLabel)}</strong></span><span class="sp-menu-chevron" aria-hidden="true">⌄</span>`
                    : `<span class="sp-menu-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>More actions</span><span class="sp-menu-chevron" aria-hidden="true">⌄</span>`
                }
              </button>
              <div role="menu" aria-label="${isSelection ? "Choose artifact audience" : "Analysis document actions"}" ${boolAttribute("hidden", !open)} data-sp-menu>
                ${
                  isSelection
                    ? '<p class="sp-menu-group-label" aria-hidden="true">Audience for this artifact</p>'
                    : '<p class="sp-menu-group-label" aria-hidden="true">Available commands</p>'
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
                              ? "Unavailable"
                              : isSelection
                                ? index === selectedIndex
                                  ? "Current"
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
          label: `${isSelection ? "Selection" : "Action"} menu specimen`,
          status: stateReceipt(
            model,
            isSelection
              ? `persistent value ${selectedLabel}`
              : model.lastMenuAction
                ? `${model.lastMenuAction} invoked; no selection retained`
                : "one-off commands; no selection retained",
          ),
        },
      );
    },
    markup(model) {
      const selectedIndex = Number.isInteger(model.selectedMenuIndex)
        ? Math.max(0, Math.min(2, model.selectedMenuIndex))
        : 0;
      const labels = ["Finance leadership", "Process owner", "Working team"];
      if (model.variant === "selection") {
        return stripIndent(`
          <button type="button" aria-haspopup="menu" aria-expanded="${model.visibility === "open"}">
            <span>Audience</span>
            <strong>${labels[selectedIndex]}</strong>
          </button>
          <div role="menu" aria-label="Choose artifact audience"${model.visibility === "closed" ? " hidden" : ""}>
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
        <button type="button" aria-haspopup="menu" aria-expanded="${model.visibility === "open"}">More actions</button>
        <div role="menu" aria-label="Analysis document actions"${model.visibility === "closed" ? " hidden" : ""}>
          <button type="button" role="menuitem">Create branch</button>
          <button type="button" role="menuitem"${model.availability === "second disabled" ? " disabled" : ""}>Copy link</button>
          <button type="button" role="menuitem">View history</button>
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
      { key: "variant", label: "Variant", options: ["standard", "confirmation", "danger"] },
      { key: "visibility", label: "Visibility", options: ["closed", "open"] },
      { key: "operation", label: "Operation", options: ["idle", "busy", "error"] },
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
      return "Busy and error states belong to an open Dialog.";
    },
    render(model) {
      const open = model.visibility === "open";
      const titles = {
        standard: "Edit analysis title",
        confirmation: "Publish revision?",
        danger: "Withdraw publication?",
      };
      return previewFrame(
        model,
        `
          <div class="sp-overlay-launch">
            <button type="button" data-sp-dialog-trigger>Open ${escapeHtml(model.variant)} dialog</button>
            ${model.completed ? '<p class="sp-state-receipt" role="status">Local fixture confirmed. No external action was performed.</p>' : ""}
            ${
              open
                ? `
                  <div class="sp-overlay-layer" data-sp-dialog-layer>
                    <section role="dialog" aria-modal="true" aria-labelledby="sp-dialog-title" aria-busy="${model.operation === "busy"}" data-sp-dialog>
                      <span>${model.variant === "danger" ? "IRREVERSIBLE IMPACT" : "CONTROLLED TASK"}</span>
                      <h3 id="sp-dialog-title">${escapeHtml(titles[model.variant])}</h3>
                      <p>Current revision and audience scope remain visible before the decision.</p>
                      ${model.operation === "error" ? `<div class="sp-inline-error" role="alert">Evidence changed. Run the gate again.</div>` : ""}
                      ${model.variant === "standard" ? `<label>Title<input value="FY27 performance review" ${boolAttribute("disabled", model.operation === "busy")}></label>` : ""}
                      <footer>
                        <button type="button" data-sp-dialog-close>Cancel</button>
                        <button type="button" class="${model.variant === "danger" ? "danger" : "primary"}" ${boolAttribute("disabled", model.operation === "busy")} data-sp-dialog-confirm>
                          ${model.operation === "busy" ? "Working…" : model.variant === "danger" ? "Withdraw" : "Confirm"}
                        </button>
                      </footer>
                    </section>
                  </div>
                `
                : ""
            }
          </div>
        `,
        { label: "Dialog specimen", status: stateReceipt(model, open ? "modal focus scope" : "closed") },
      );
    },
    markup(model) {
      const titles = {
        standard: "Edit analysis title",
        confirmation: "Publish revision?",
        danger: "Withdraw publication?",
      };
      const action = model.variant === "danger" ? "Withdraw" : "Confirm";
      return stripIndent(`
        <button type="button" aria-haspopup="dialog">Open ${model.variant} dialog</button>
        ${model.completed ? '<p role="status">Local fixture confirmed. No external action was performed.</p>' : ""}
        ${
          model.visibility === "closed"
            ? ""
            : `<section role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-busy="${model.operation === "busy"}">
          <h2 id="dialog-title">${titles[model.variant]}</h2>
          ${model.operation === "error" ? '<p role="alert">Evidence changed. Run the gate again.</p>' : ""}
          ${model.variant === "standard" ? '<label>Title<input value="FY27 performance review"></label>' : ""}
          <button type="button">Cancel</button>
          <button type="button"${model.operation === "busy" ? " disabled" : ""}>${model.operation === "busy" ? "Working…" : action}</button>
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
      { key: "variant", label: "Placement", options: ["right", "left", "bottom"] },
      { key: "visibility", label: "Visibility", options: ["closed", "open"] },
      { key: "operation", label: "Operation", options: ["idle", "busy"] },
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
      return "A closed Drawer cannot expose a busy content state.";
    },
    render(model) {
      const open = model.visibility === "open";
      return previewFrame(
        model,
        `
          <div class="sp-drawer-launch">
            <button type="button" data-sp-drawer-trigger>Open ${escapeHtml(model.variant)} drawer</button>
            ${
              open
                ? `
                  <div class="sp-drawer-layer" data-placement="${escapeHtml(model.variant)}" data-sp-drawer-layer>
                    <aside class="sp-drawer-value" role="dialog" aria-modal="true" aria-labelledby="sp-drawer-title" data-sp-drawer>
                      <header>
                        <div><span>CONTEXT</span><h3 id="sp-drawer-title">Evidence inspector</h3></div>
                        <button type="button" aria-label="Close drawer" data-sp-drawer-close>×</button>
                      </header>
                      ${
                        model.operation === "busy"
                          ? `<div class="sp-drawer-busy" role="status"><i></i>Loading provenance…</div>`
                          : `<dl><dt>Source</dt><dd>Dataset · Revenue Actual</dd><dt>Revision</dt><dd>r4 · Verified</dd><dt>Owner</dt><dd>Finance Control</dd></dl>`
                      }
                      ${model.receiptOpened ? '<p class="sp-state-receipt" role="status">Receipt opened inside this fixture.</p>' : ""}
                      <footer><button type="button" ${boolAttribute("disabled", model.operation === "busy")} data-sp-drawer-open-receipt>Open receipt</button></footer>
                    </aside>
                  </div>
                `
                : ""
            }
          </div>
        `,
        { label: "Drawer specimen", status: stateReceipt(model, open ? `${model.variant} contextual layer` : "closed") },
      );
    },
    markup(model) {
      return `<aside class="drawer drawer--${model.variant}" role="dialog" aria-modal="true" aria-busy="${model.operation === "busy"}"${model.visibility === "closed" ? " hidden" : ""}><h2>Evidence inspector</h2>${model.operation === "busy" ? '<p role="status">Loading provenance…</p>' : "<dl><dt>Source</dt><dd>Dataset · Revenue Actual</dd><dt>Revision</dt><dd>r4 · Verified</dd></dl>"}${model.receiptOpened ? '<p role="status">Receipt opened inside this fixture.</p>' : ""}<button type="button"${model.operation === "busy" ? " disabled" : ""}>Open receipt</button><button type="button" aria-label="Close drawer">×</button></aside>`;
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
