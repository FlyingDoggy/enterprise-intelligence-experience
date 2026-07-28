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
import { uiLabel } from "../locales/zh-CN.js";

const textExamples = {
  body: {
    tag: "p",
    content: "人工控制必须可见：用户始终知道当前对象、状态、负责人和下一步。",
  },
  supporting: {
    tag: "p",
    content: "辅助文字解释范围、限制和更新时间，不与主结论争夺注意力。",
  },
  caption: {
    tag: "small",
    content: "依据快照 · 2026-07-25 10:42 CST",
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
            <span class="sp-measure">行长 · 最多 68 个字符</span>
          </div>
        `,
        {
          label: "文本交互示例",
          status: stateReceipt(model, model.state === "inverse" ? "反色表面" : "可读行长"),
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
        page: ["h1", "有依据的决策仍应保留撤销路径。"],
        section: ["h2", "证据、判断与动作必须分开。"],
        subsection: ["h3", "当前结论适用范围"],
      };
      const [tag, label] = levels[model.variant];
      return previewFrame(
        model,
        `
          <div class="sp-heading-surface">
            <span class="sp-kicker">${escapeHtml(uiLabel(model.variant))}标题 · 语义标签 ${tag}</span>
            <${tag} class="sp-heading-value">${escapeHtml(label)}</${tag}>
            <p>视觉尺寸与HTML层级分别受控，长中文标题允许自然换行。</p>
          </div>
        `,
        { label: "标题交互示例", status: stateReceipt(model, `语义标签 ${tag}`) },
      );
    },
    markup(model) {
      const values = {
        page: ["h1", "有依据的决策仍应保留撤销路径。"],
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
          ? "阅读依据回执"
          : model.variant === "inverse"
            ? "查看核心章程"
            : "查看依据回执";
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
              ${model.variant === "inline" ? "，并保留来源与修订版本。" : ""}
            </p>
            <small>${model.state === "visited" ? "此前已打开" : "目标 · 内部文档"}</small>
          </div>
        `,
        {
          label: "链接交互示例",
          status: stateReceipt(model, model.state === "focus" ? "键盘焦点预览" : "仅执行导航"),
        },
      );
    },
    markup(model) {
      const label =
        model.variant === "standalone"
          ? "阅读依据回执"
          : model.variant === "inverse"
            ? "查看核心章程"
            : "查看依据回执";
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
        primary: "发布修订版本",
        secondary: "保存草稿",
        quiet: "查看详情",
        danger: "撤回发布内容",
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
              ${model.state === "loading" ? `<i aria-hidden="true"></i><span>正在发布…</span>` : escapeHtml(labels[model.variant])}
            </button>
            <span class="sp-action-result">${model.state === "disabled" ? "当前权限范围内无法执行该操作。" : "结果反馈将沿用同一个操作名称。"}</span>
          </div>
        `,
        { label: "按钮交互示例", status: stateReceipt(model, disabled ? "不可操作" : "可操作") },
      );
    },
    markup(model) {
      const disabled = model.state === "disabled" || model.state === "loading";
      const labels = {
        primary: "发布修订版本",
        secondary: "保存草稿",
        quiet: "查看详情",
        danger: "撤回发布内容",
      };
      return `<button type="button" class="button button--${model.variant}"${disabled ? " disabled" : ""}${model.state === "loading" ? ' aria-busy="true"' : ""}>${model.state === "loading" ? "正在发布…" : labels[model.variant]}</button>`;
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
      const name = model.variant === "danger" ? "移除项目" : model.variant === "quiet" ? "更多操作" : "添加项目";
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
            <p>无障碍名称 · ${escapeHtml(name)}</p>
          </div>
        `,
        { label: "图标按钮交互示例", status: stateReceipt(model, "44 × 44px 触控目标") },
      );
    },
    markup(model) {
      const icon = model.variant === "danger" ? "×" : model.variant === "quiet" ? "···" : "＋";
      const name = model.variant === "danger" ? "移除项目" : model.variant === "quiet" ? "更多操作" : "添加项目";
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
        neutral: ["状态", "草稿"],
        success: ["状态", "可开始"],
        warning: ["状态", "需要关注"],
        danger: ["状态", "错误"],
        info: ["状态", "新增"],
      };
      const [axis, value] = values[model.variant];
      const currentValue = model.state === "stale" ? `${value} · 已过期` : model.state === "disabled" ? `${value} · 不可用` : value;
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
        { label: "徽标交互示例", status: stateReceipt(model, `${axis}维度`) },
      );
    },
    markup(model) {
      const values = { neutral: "草稿", success: "可开始", warning: "需要关注", danger: "错误", info: "新增" };
      return `<span class="badge badge--${model.variant} is-${model.state}"><span class="badge__axis">状态</span>${values[model.variant]}</span>`;
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
        ? "阻断提示必须保持可见，直到阻断条件解除。"
        : "";
    },
    render(model) {
      const content = {
        information: ["信息", "范围已变化", "继续前请检查新的期间范围。", "检查范围"],
        success: ["已核验", "依据仍然有效", "该回执与修订版本 r4 一致。", "打开回执"],
        warning: ["需要关注", "依据即将过期", "发布前请刷新数据集。", "刷新依据"],
        blocking: ["已阻断", "权限被拒绝", "取得正确范围后才能继续。", "查看管控策略"],
      }[model.variant];
      if (model.dismissed) {
        return previewFrame(
          model,
          `<p class="sp-callout-dismissed" role="status">提示已关闭，底层工作对象没有变化。</p>`,
          { label: "提示块交互示例", status: stateReceipt(model, "由用户关闭") },
        );
      }
      return previewFrame(
        model,
        `
          <aside class="sp-callout-value" role="${model.variant === "blocking" ? "alert" : "status"}" data-sp-callout>
            <span>${escapeHtml(content[0])}</span>
            ${
              model.state === "dismissible"
                ? `<button type="button" aria-label="关闭提示" data-sp-callout-dismiss>×</button>`
                : ""
            }
            <strong>${escapeHtml(content[1])}</strong>
            <p>${escapeHtml(content[2])}</p>
            <button type="button">${escapeHtml(content[3])}</button>
          </aside>
        `,
        { label: "提示块交互示例", status: stateReceipt(model, model.state === "dismissible" ? "用户可关闭" : "持续显示") },
      );
    },
    markup(model) {
      if (model.dismissed) return "<!-- 已关闭的提示块会从文档流中移除。 -->";
      const content = {
        information: ["范围已变化", "继续前请检查新的期间范围。", "检查范围"],
        success: ["依据仍然有效", "该回执与修订版本 r4 一致。", "打开回执"],
        warning: ["依据即将过期", "发布前请刷新数据集。", "刷新依据"],
        blocking: ["权限被拒绝", "取得正确范围后才能继续。", "查看管控策略"],
      }[model.variant];
      return stripIndent(`
        <aside class="callout callout--${model.variant}" role="${model.variant === "blocking" ? "alert" : "status"}">
          <strong>${content[0]}</strong>
          <p>${content[1]}</p>
          <button type="button">${content[2]}</button>
          ${model.state === "dismissible" ? '<button type="button" aria-label="关闭">×</button>' : ""}
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
        ? "基础卡片和描边卡片是内容表面；交互状态只属于可交互变体。"
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
            <span>工作对象 · ANL-118</span>
            <h3>分析文档 · r4</h3>
            <p>一项责任、一个可见状态、一个明确的下一步。</p>
            <footer>${model.state === "selected" ? "已选入对比" : model.state === "disabled" ? "当前范围内不可用" : "更新于 08:30 CST"}</footer>
          </article>
        `,
        { label: "卡片交互示例", status: stateReceipt(model, interactive ? "支持键盘交互" : "内容表面") },
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
      }><h3>分析文档</h3><p>当前修订版本 r4。</p></article>`;
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
          ? `<div class="sp-divider-columns"><p>主要内容</p><div class="sp-divider-value" role="separator" aria-orientation="vertical"></div><p>辅助内容</p></div>`
          : `<div class="sp-divider-rows"><p>主要内容</p><hr class="sp-divider-value"><p>辅助内容</p></div>`;
      return previewFrame(model, content, {
        label: "分隔线交互示例",
        status: stateReceipt(model, model.variant === "strong" ? "强结构边界" : "内容分隔"),
      });
    },
    markup(model) {
      return model.variant === "vertical"
        ? '<div role="separator" aria-orientation="vertical" class="divider divider--vertical"></div>'
        : `<hr class="divider divider--${model.variant}">`;
    },
  }),
];
