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
  if (state === "readonly") return "Verified analysis title";
  return "Quarterly performance analysis";
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
            <span>Analysis title <b aria-hidden="true">*</b></span>
            <input
              type="text"
              value="${escapeHtml(value)}"
              placeholder="Enter a clear title"
              aria-invalid="${error}"
              aria-describedby="sp-text-field-note"
              ${boolAttribute("disabled", model.state === "disabled")}
              ${boolAttribute("readonly", model.state === "readonly")}
              data-sp-field
            >
            <small id="sp-text-field-note" class="${error ? "is-error" : ""}">
              ${error ? "Use at least 3 characters." : model.state === "readonly" ? "Verified values cannot be edited." : "Visible to collaborators."}
            </small>
          </label>
        `,
        { label: "Text Field specimen", status: stateReceipt(model, error ? "invalid value" : "short text input") },
      );
    },
    markup(model) {
      const error = model.state === "error";
      const value = fieldValues(model.state);
      return stripIndent(`
        <label class="text-field text-field--${model.variant}">
          Analysis title
          <input type="text" value="${value}" placeholder="Enter a clear title" aria-describedby="title-note"${error ? ' aria-invalid="true"' : ""}${model.state === "disabled" ? " disabled" : ""}${model.state === "readonly" ? " readonly" : ""}>
        </label>
        <small id="title-note">${error ? "Use at least 3 characters." : model.state === "readonly" ? "Verified values cannot be edited." : "Visible to collaborators."}</small>
      `);
    },
    bind(host, { model }) {
      focusWhenPreviewed(host, model, "[data-sp-field]");
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
          ? "Not enough context."
          : model.state === "default" || model.state === "focus"
            ? ""
            : "Evidence supports the selected option within the approved scope.";
      return previewFrame(
        model,
        `
          <label class="sp-field-value">
            <span>Decision rationale</span>
            <textarea
              rows="4"
              maxlength="240"
              placeholder="Explain why this option was selected"
              aria-invalid="${error}"
              aria-describedby="sp-textarea-note"
              ${boolAttribute("disabled", model.state === "disabled")}
              ${boolAttribute("readonly", model.state === "readonly")}
              data-sp-textarea
            >${escapeHtml(value)}</textarea>
            <small id="sp-textarea-note" class="${error ? "is-error" : ""}">
              ${error ? "Include the evidence and decision boundary." : `${value.length} / 240 · Do not repeat the conclusion.`}
            </small>
          </label>
        `,
        { label: "Textarea specimen", status: stateReceipt(model, model.variant === "resizable" ? "vertical resize enabled" : "fixed height") },
      );
    },
    markup(model) {
      const value =
        model.state === "error"
          ? "Not enough context."
          : model.state === "default" || model.state === "focus"
            ? ""
            : "Evidence supports the selected option within the approved scope.";
      return `<label class="textarea textarea--${model.variant}">Decision rationale<textarea rows="4" maxlength="240"${model.state === "error" ? ' aria-invalid="true"' : ""}${model.state === "disabled" ? " disabled" : ""}${model.state === "readonly" ? " readonly" : ""}>${value}</textarea></label>`;
    },
    bind(host, { model }) {
      focusWhenPreviewed(host, model, "[data-sp-textarea]");
      const textarea = host.querySelector("[data-sp-textarea]");
      textarea?.addEventListener("input", () => {
        const note = host.querySelector("#sp-textarea-note");
        if (note && model.state !== "error") note.textContent = `${textarea.value.length} / 240 · Do not repeat the conclusion.`;
      });
    },
  }),

  createDefinition({
    id: "select",
    defaultVariant: "native",
    defaultState: "default",
    defaultModel: { selection: "0", interaction: "rest" },
    controls: [
      { key: "variant", label: "Variant", options: ["native", "enhanced"] },
      {
        key: "selection",
        label: "Selected value",
        options: [
          { value: "0", label: "Finance leadership" },
          { value: "1", label: "Process owner" },
          { value: "2", label: "Working team" },
        ],
      },
      { key: "interaction", label: "Interaction", options: ["rest", "focus", "open", "error", "disabled"] },
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
        ? "The browser and operating system own the native Select popup; the reference site does not fake that surface."
        : "";
    },
    render(model) {
      const error = model.interaction === "error";
      const open = model.interaction === "open";
      const disabled = model.interaction === "disabled";
      const options = ["Finance leadership", "Process owner", "Working team"];
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
            <span>Audience</span>
            ${control}
            <small id="sp-select-note" class="${error ? "is-error" : ""}">
              ${error ? "Choose an audience within your permission scope." : `${model.variant} selection control.`}
            </small>
          </label>
        `,
        { label: "Select specimen", status: stateReceipt(model, open ? "options visible" : "one selected value") },
      );
    },
    markup(model) {
      const options = ["Finance leadership", "Process owner", "Working team"];
      const selectedIndex = Number.isInteger(model.selectedIndex)
        ? Math.max(0, Math.min(options.length - 1, model.selectedIndex))
        : 0;
      if (model.variant === "native") {
        return `<label>Audience<select aria-describedby="audience-note"${model.interaction === "disabled" ? " disabled" : ""}${model.interaction === "error" ? ' aria-invalid="true"' : ""}>${options.map((option, index) => `<option${index === selectedIndex ? " selected" : ""}>${option}</option>`).join("")}</select><small id="audience-note">${model.interaction === "error" ? "Choose an audience within your permission scope." : "Native selection control."}</small></label>`;
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
      { key: "variant", label: "Variant", options: ["standalone", "parent group"] },
      { key: "value", label: "Value", options: ["unchecked", "checked", "indeterminate"] },
      { key: "interaction", label: "Interaction", options: ["rest", "focus", "disabled"] },
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
      return "Indeterminate is reserved for a parent Checkbox summarizing child values.";
    },
    variantPreviewState: "indeterminate",
    render(model) {
      const checked = model.value === "checked";
      const indeterminate = model.value === "indeterminate";
      return previewFrame(
        model,
        `
          <fieldset class="sp-checkbox-value">
            <legend>Publication options</legend>
            <label>
              <input
                type="checkbox"
                ${boolAttribute("checked", checked)}
                ${boolAttribute("disabled", model.interaction === "disabled")}
                data-sp-checkbox
              >
              <span>Include supporting data</span>
              <small>${indeterminate ? "Some child datasets are selected." : checked ? "Supporting data will be published." : "Only the narrative will be published."}</small>
            </label>
            ${
              model.variant === "parent group"
                ? `<div class="sp-child-options"><label><input type="checkbox" checked> Actual</label><label><input type="checkbox"> Plan</label></div>`
                : ""
            }
          </fieldset>
        `,
        { label: "Checkbox specimen", status: stateReceipt(model, indeterminate ? "mixed selection" : checked ? "checked" : "unchecked") },
      );
    },
    markup(model) {
      return `<fieldset class="checkbox checkbox--${model.variant}"><legend>Publication options</legend><label><input type="checkbox"${model.value === "checked" ? " checked" : ""}${model.interaction === "disabled" ? " disabled" : ""}${model.value === "indeterminate" ? ' data-indeterminate="true"' : ""}> Include supporting data</label>${model.variant === "parent group" ? "\n<div><label><input type=\"checkbox\" checked> Actual</label><label><input type=\"checkbox\"> Plan</label></div>" : ""}</fieldset>${model.value === "indeterminate" ? "\n<!-- Set input.indeterminate = true after mount. -->" : ""}`;
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
      { key: "variant", label: "Variant", options: ["standard"] },
      { key: "value", label: "Value", options: ["off", "on"] },
      { key: "interaction", label: "Interaction", options: ["rest", "focus", "disabled"] },
    ],
    normalizeModel(model) {
      return {
        ...model,
        state: model.interaction === "focus" ? "focus" : model.interaction === "disabled" ? "disabled" : model.value,
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
              ${boolAttribute("disabled", model.interaction === "disabled")}
              data-sp-switch
            >
            <span aria-hidden="true"><i></i></span>
            <b>Show evidence IDs</b>
            <small data-sp-switch-status>${checked ? "On · IDs are visible immediately" : "Off · IDs remain hidden"}</small>
          </label>
        `,
        { label: "Switch specimen", status: stateReceipt(model, checked ? "setting on" : "setting off") },
      );
    },
    markup(model) {
      return `<label><input type="checkbox" role="switch"${model.value === "on" ? " checked" : ""}${model.interaction === "disabled" ? " disabled" : ""}> Show evidence IDs</label>`;
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
