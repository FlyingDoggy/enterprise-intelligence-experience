import {
  boolAttribute,
  classNames,
  createDefinition,
  escapeHtml,
  focusWhenPreviewed,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";

const textExamples = {
  body: {
    tag: "p",
    content: "Human control必须可见：用户始终知道当前对象、状态、Owner与下一步。",
  },
  supporting: {
    tag: "p",
    content: "Supporting text解释范围、限制和更新时间，不与主结论争夺注意力。",
  },
  caption: {
    tag: "small",
    content: "EVIDENCE SNAPSHOT · 2026-07-25 10:42 CST",
  },
  data: {
    tag: "strong",
    content: "1,248.50 MRMB · −4.7%",
  },
};

export const contentActionDefinitions = [
  createDefinition({
    id: "text",
    defaultVariant: "body",
    defaultState: "default",
    render(model) {
      const example = textExamples[model.variant];
      return previewFrame(
        model,
        `
          <div class="sp-text-surface">
            <${example.tag} class="sp-text-value">${escapeHtml(example.content)}</${example.tag}>
            <span class="sp-measure">Measure · 68 characters max</span>
          </div>
        `,
        {
          label: "Text specimen",
          status: stateReceipt(model, model.state === "inverse" ? "inverse surface" : "readable measure"),
        },
      );
    },
    markup(model) {
      const example = textExamples[model.variant];
      return `<${example.tag} class="text text--${model.variant} text--${model.state}">${example.content}</${example.tag}>`;
    },
  }),

  createDefinition({
    id: "heading",
    defaultVariant: "page",
    defaultState: "default",
    render(model) {
      const levels = {
        page: ["h1", "Evidence-backed decisions remain reversible."],
        section: ["h2", "证据、判断与动作必须分开。"],
        subsection: ["h3", "当前结论适用范围"],
      };
      const [tag, label] = levels[model.variant];
      return previewFrame(
        model,
        `
          <div class="sp-heading-surface">
            <span class="sp-kicker">${escapeHtml(model.variant)} heading · semantic ${tag}</span>
            <${tag} class="sp-heading-value">${escapeHtml(label)}</${tag}>
            <p>视觉尺寸与HTML层级分别受控，长中文标题允许自然换行。</p>
          </div>
        `,
        { label: "Heading specimen", status: stateReceipt(model, `semantic ${tag}`) },
      );
    },
    markup(model) {
      const values = {
        page: ["h1", "Evidence-backed decisions remain reversible."],
        section: ["h2", "证据、判断与动作必须分开。"],
        subsection: ["h3", "当前结论适用范围"],
      };
      const [tag, label] = values[model.variant];
      return `<${tag} class="heading heading--${model.variant} heading--${model.state}">${label}</${tag}>`;
    },
  }),

  createDefinition({
    id: "link",
    defaultVariant: "inline",
    defaultState: "default",
    render(model) {
      const label =
        model.variant === "standalone"
          ? "Read Evidence receipt"
          : model.variant === "inverse"
            ? "查看Canonical Charter"
            : "查看Evidence receipt";
      const indicator = model.variant === "standalone" ? `<span aria-hidden="true">→</span>` : "";
      return previewFrame(
        model,
        `
          <div class="sp-link-context">
            <p>
              ${
                model.variant === "inline" ? "结论必须能够" : ""
              }
              <a href="#/design-system/components/link" class="sp-link-value" data-sp-link>
                ${escapeHtml(label)}${indicator}
              </a>
              ${model.variant === "inline" ? "，并保留来源与Revision。" : ""}
            </p>
            <small>${model.state === "visited" ? "Previously opened resource" : "Destination · Internal document"}</small>
          </div>
        `,
        {
          label: "Link specimen",
          status: stateReceipt(model, model.state === "focus" ? "keyboard focus preview" : "navigation only"),
        },
      );
    },
    markup(model) {
      const label =
        model.variant === "standalone"
          ? "Read Evidence receipt"
          : model.variant === "inverse"
            ? "查看Canonical Charter"
            : "查看Evidence receipt";
      const suffix = model.variant === "standalone" ? `<span aria-hidden="true">→</span>` : "";
      return `<a class="link link--${model.variant} is-${model.state}" href="/evidence">${label}${suffix}</a>`;
    },
    bind(host, { model }) {
      host.querySelector("[data-sp-link]")?.addEventListener("click", (event) => event.preventDefault());
      focusWhenPreviewed(host, model, "[data-sp-link]");
    },
  }),

  createDefinition({
    id: "button",
    defaultVariant: "primary",
    defaultState: "default",
    render(model) {
      const disabled = model.state === "disabled" || model.state === "loading";
      const labels = {
        primary: "Publish revision",
        secondary: "Save draft",
        quiet: "View details",
        danger: "Withdraw publication",
      };
      return previewFrame(
        model,
        `
          <div class="sp-button-context">
            <button
              type="button"
              class="sp-button-value"
              ${boolAttribute("disabled", disabled)}
              aria-busy="${model.state === "loading"}"
              data-sp-button
            >
              ${model.state === "loading" ? `<i aria-hidden="true"></i><span>Publishing…</span>` : escapeHtml(labels[model.variant])}
            </button>
            <span class="sp-action-result">${model.state === "disabled" ? "Action unavailable in current permission scope." : "Result will use the same action name."}</span>
          </div>
        `,
        { label: "Button specimen", status: stateReceipt(model, disabled ? "not actionable" : "actionable") },
      );
    },
    markup(model) {
      const disabled = model.state === "disabled" || model.state === "loading";
      const labels = {
        primary: "Publish revision",
        secondary: "Save draft",
        quiet: "View details",
        danger: "Withdraw publication",
      };
      return `<button type="button" class="button button--${model.variant}"${disabled ? " disabled" : ""}${model.state === "loading" ? ' aria-busy="true"' : ""}>${model.state === "loading" ? "Publishing…" : labels[model.variant]}</button>`;
    },
    bind(host, { model }) {
      focusWhenPreviewed(host, model, "[data-sp-button]");
    },
  }),

  createDefinition({
    id: "icon-button",
    defaultVariant: "default",
    defaultState: "default",
    render(model) {
      const icon = model.variant === "danger" ? "×" : model.variant === "quiet" ? "···" : "＋";
      const name = model.variant === "danger" ? "Remove item" : model.variant === "quiet" ? "More actions" : "Add item";
      const tooltipVisible = model.state === "hover" || model.state === "focus";
      return previewFrame(
        model,
        `
          <div class="sp-icon-button-context">
            <button
              type="button"
              class="sp-icon-button-value"
              aria-label="${escapeHtml(name)}"
              aria-describedby="sp-icon-button-tooltip"
              ${boolAttribute("disabled", model.state === "disabled")}
              data-sp-icon-button
            >${escapeHtml(icon)}</button>
            <span id="sp-icon-button-tooltip" role="tooltip" ${boolAttribute("hidden", !tooltipVisible)}>${escapeHtml(name)}</span>
            <p>Accessible name · ${escapeHtml(name)}</p>
          </div>
        `,
        { label: "Icon Button specimen", status: stateReceipt(model, "44 × 44px target") },
      );
    },
    markup(model) {
      const icon = model.variant === "danger" ? "×" : model.variant === "quiet" ? "···" : "＋";
      const name = model.variant === "danger" ? "Remove item" : model.variant === "quiet" ? "More actions" : "Add item";
      return `<button type="button" class="icon-button icon-button--${model.variant}" aria-label="${name}"${model.state === "disabled" ? " disabled" : ""}>${icon}</button>`;
    },
    bind(host, { model }) {
      const trigger = host.querySelector("[data-sp-icon-button]");
      const tooltip = host.querySelector("#sp-icon-button-tooltip");
      if (model.state === "default" && trigger && tooltip) {
        const show = () => {
          tooltip.hidden = false;
        };
        const hide = () => {
          tooltip.hidden = true;
        };
        trigger.addEventListener("pointerenter", show);
        trigger.addEventListener("pointerleave", hide);
        trigger.addEventListener("focus", show);
        trigger.addEventListener("blur", hide);
      }
      focusWhenPreviewed(host, model, "[data-sp-icon-button]");
    },
  }),

  createDefinition({
    id: "badge",
    defaultVariant: "neutral",
    defaultState: "current",
    render(model) {
      const values = {
        neutral: ["Status", "Draft"],
        success: ["Status", "Ready"],
        warning: ["Status", "Attention"],
        danger: ["Status", "Error"],
        info: ["Status", "New"],
      };
      const [axis, value] = values[model.variant];
      const currentValue = model.state === "stale" ? `${value} · Stale` : model.state === "disabled" ? `${value} · Unavailable` : value;
      return previewFrame(
        model,
        `
          <div class="sp-badge-context">
            <span class="sp-badge-value" aria-label="${escapeHtml(`${axis}: ${currentValue}`)}">
              <i aria-hidden="true"></i><b>${escapeHtml(axis)}</b>${escapeHtml(currentValue)}
            </span>
            <p>轴名称与状态值始终同时出现。</p>
          </div>
        `,
        { label: "Badge specimen", status: stateReceipt(model, `${axis} axis`) },
      );
    },
    markup(model) {
      const values = { neutral: "Draft", success: "Ready", warning: "Attention", danger: "Error", info: "New" };
      return `<span class="badge badge--${model.variant} is-${model.state}"><span class="badge__axis">Status</span>${values[model.variant]}</span>`;
    },
  }),

  createDefinition({
    id: "callout",
    defaultVariant: "information",
    defaultState: "default",
    interactionClasses: ["sp-callout-dismissed"],
    isValidModel(model) {
      return !(model.variant === "blocking" && model.state === "dismissible");
    },
    invalidReason(model) {
      return model.variant === "blocking" && model.state === "dismissible"
        ? "Blocking callouts remain visible until the blocking condition is resolved."
        : "";
    },
    render(model) {
      const content = {
        information: ["INFORMATION", "Scope changed", "Review the new period before continuing.", "Review scope"],
        success: ["VERIFIED", "Evidence is current", "The receipt matches revision r4.", "Open receipt"],
        warning: ["ATTENTION", "Evidence will expire", "Refresh the dataset before publishing.", "Refresh evidence"],
        blocking: ["BLOCKING", "Permission denied", "Request the correct scope before continuing.", "View policy"],
      }[model.variant];
      if (model.dismissed) {
        return previewFrame(
          model,
          `<p class="sp-callout-dismissed" role="status">Callout dismissed. The underlying Work Object is unchanged.</p>`,
          { label: "Callout specimen", status: stateReceipt(model, "dismissed by user") },
        );
      }
      return previewFrame(
        model,
        `
          <aside class="sp-callout-value" role="${model.variant === "blocking" ? "alert" : "status"}" data-sp-callout>
            <span>${escapeHtml(content[0])}</span>
            ${
              model.state === "dismissible"
                ? `<button type="button" aria-label="Dismiss callout" data-sp-callout-dismiss>×</button>`
                : ""
            }
            <strong>${escapeHtml(content[1])}</strong>
            <p>${escapeHtml(content[2])}</p>
            <button type="button">${escapeHtml(content[3])}</button>
          </aside>
        `,
        { label: "Callout specimen", status: stateReceipt(model, model.state === "dismissible" ? "user dismissible" : "persistent") },
      );
    },
    markup(model) {
      if (model.dismissed) return "<!-- Dismissed callout removed from the document flow. -->";
      const content = {
        information: ["Scope changed", "Review the new period before continuing.", "Review scope"],
        success: ["Evidence is current", "The receipt matches revision r4.", "Open receipt"],
        warning: ["Evidence will expire", "Refresh the dataset before publishing.", "Refresh evidence"],
        blocking: ["Permission denied", "Request the correct scope before continuing.", "View policy"],
      }[model.variant];
      return stripIndent(`
        <aside class="callout callout--${model.variant}" role="${model.variant === "blocking" ? "alert" : "status"}">
          <strong>${content[0]}</strong>
          <p>${content[1]}</p>
          <button type="button">${content[2]}</button>
          ${model.state === "dismissible" ? '<button type="button" aria-label="Dismiss">×</button>' : ""}
        </aside>
      `);
    },
    bind(host, { setModel }) {
      host.querySelector("[data-sp-callout-dismiss]")?.addEventListener("click", () => {
        setModel({ dismissed: true });
      });
    },
  }),

  createDefinition({
    id: "card",
    defaultVariant: "plain",
    defaultState: "default",
    isValidModel(model) {
      return model.variant === "interactive" || model.state === "default";
    },
    invalidReason(model) {
      return model.variant !== "interactive" && model.state !== "default"
        ? "Plain and outlined cards are content surfaces; interaction states belong to the interactive variant."
        : "";
    },
    render(model) {
      const interactive = model.variant === "interactive";
      const semanticAttributes = interactive
        ? `role="button" tabindex="${model.state === "disabled" ? "-1" : "0"}" aria-pressed="${model.state === "selected"}" aria-disabled="${model.state === "disabled"}"`
        : model.state === "disabled"
          ? 'aria-disabled="true"'
          : "";
      return previewFrame(
        model,
        `
          <article
            class="sp-card-value"
            ${semanticAttributes}
            data-sp-card
          >
            <span>WORK OBJECT · ANL-118</span>
            <h3>Analysis Document · r4</h3>
            <p>One responsibility, one visible state, one clear next action.</p>
            <footer>${model.state === "selected" ? "Selected for comparison" : model.state === "disabled" ? "Unavailable in this scope" : "Updated 08:30 CST"}</footer>
          </article>
        `,
        { label: "Card specimen", status: stateReceipt(model, interactive ? "keyboard interactive" : "content surface") },
      );
    },
    markup(model) {
      const interactive = model.variant === "interactive";
      return `<article class="card card--${model.variant} is-${model.state}"${
        interactive
          ? ` role="button" tabindex="${model.state === "disabled" ? "-1" : "0"}" aria-pressed="${model.state === "selected"}" aria-disabled="${model.state === "disabled"}"`
          : model.state === "disabled"
            ? ' aria-disabled="true"'
            : ""
      }><h3>Analysis Document</h3><p>Current revision r4.</p></article>`;
    },
    bind(host, { model, setModel }) {
      const card = host.querySelector("[data-sp-card]");
      if (!card || model.variant !== "interactive" || model.state === "disabled") return;
      const select = () => setModel({ state: model.state === "selected" ? "default" : "selected" }, { focusSelector: "[data-sp-card]" });
      card.addEventListener("click", select);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
      focusWhenPreviewed(host, model, "[data-sp-card]");
    },
  }),

  createDefinition({
    id: "divider",
    defaultVariant: "horizontal",
    defaultState: "default",
    render(model) {
      const content =
        model.variant === "vertical"
          ? `<div class="sp-divider-columns"><p>Primary content</p><div class="sp-divider-value" role="separator" aria-orientation="vertical"></div><p>Supporting content</p></div>`
          : `<div class="sp-divider-rows"><p>Primary content</p><hr class="sp-divider-value"><p>Supporting content</p></div>`;
      return previewFrame(model, content, {
        label: "Divider specimen",
        status: stateReceipt(model, model.variant === "strong" ? "strong structural boundary" : "content separation"),
      });
    },
    markup(model) {
      return model.variant === "vertical"
        ? '<div role="separator" aria-orientation="vertical" class="divider divider--vertical"></div>'
        : `<hr class="divider divider--${model.variant}">`;
    },
  }),
];
