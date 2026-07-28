import {
  boolAttribute,
  createDefinition,
  escapeHtml,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";

const breadcrumbItems = ["首页", "分析资料库", "财务分析", "FY27", "当前分析"];

export const navigationExtensionDefinitions = [
  createDefinition({
    id: "breadcrumb",
    defaultVariant: "standard",
    defaultState: "default",
    render(model) {
      const mobile = model.state === "mobile";
      const expanded = model.state === "expanded";
      const overflow = model.variant === "overflow" && !expanded;
      const items = mobile
        ? [
            `<a href="#parent" data-sp-breadcrumb-link aria-label="返回 FY27">← FY27</a>`,
            `<span aria-current="page">${breadcrumbItems.at(-1)}</span>`,
          ]
        : overflow
          ? [
              `<a href="#home" data-sp-breadcrumb-link>首页</a>`,
              `<button type="button" aria-expanded="false" aria-label="显示省略的层级" data-sp-breadcrumb-more>…</button>`,
              `<a href="#fy27" data-sp-breadcrumb-link>FY27</a>`,
              `<span aria-current="page">${breadcrumbItems.at(-1)}</span>`,
            ]
          : breadcrumbItems.map((item, index) =>
              index === breadcrumbItems.length - 1
                ? `<span aria-current="page">${escapeHtml(item)}</span>`
                : `<a href="#level-${index}" data-sp-breadcrumb-link>${escapeHtml(item)}</a>`,
            );
      return previewFrame(
        model,
        `
          <nav class="sp-breadcrumb-value" aria-label="面包屑导航">
            <ol>
              ${items.map((item) => `<li>${item}</li>`).join("")}
            </ol>
            ${
              expanded && model.variant === "overflow"
                ? '<p role="status">已显示全部五级路径；当前项仍不可点击。</p>'
                : ""
            }
          </nav>
        `,
        {
          label: "面包屑导航交互示例",
          status: stateReceipt(
            model,
            mobile ? "移动端保留返回路径与当前项" : overflow ? "中间层级已折叠" : "完整层级可见",
          ),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <nav class="breadcrumb breadcrumb--${model.variant}" aria-label="面包屑导航">
          <ol>
            <li><a href="/">首页</a></li>
            ${model.variant === "overflow" && model.state !== "expanded" ? '<li><button type="button" aria-expanded="false" aria-label="显示省略的层级">…</button></li>' : '<li><a href="/analysis">分析资料库</a></li>'}
            <li><span aria-current="page">当前分析</span></li>
          </ol>
        </nav>
      `);
    },
    bind(host, { model, setModel }) {
      host.querySelectorAll("[data-sp-breadcrumb-link]").forEach((link) =>
        link.addEventListener("click", (event) => event.preventDefault()),
      );
      host.querySelector("[data-sp-breadcrumb-more]")?.addEventListener("click", () =>
        setModel(
          { state: "expanded" },
          { focusSelector: "[data-sp-breadcrumb-link]" },
        ),
      );
    },
  }),

  createDefinition({
    id: "pagination",
    defaultVariant: "full",
    defaultState: "default",
    defaultModel: { page: "5", busy: "false" },
    controls: [
      { key: "variant", label: "变体", options: ["full", "compact"] },
      {
        key: "page",
        label: "当前位置",
        options: [
          { value: "1", label: "第 1 页" },
          { value: "5", label: "第 5 页" },
          { value: "10", label: "第 10 页" },
        ],
      },
      {
        key: "busy",
        label: "载入状态",
        options: [
          { value: "false", label: "可操作" },
          { value: "true", label: "载入中" },
        ],
      },
    ],
    normalizeModel(model) {
      const page = Number(model.page);
      const state =
        model.busy === "true"
          ? "loading"
          : page <= 1
            ? "first page"
            : page >= 10
              ? "last page"
              : "default";
      return { ...model, page: String(Math.max(1, Math.min(10, page || 1))), state };
    },
    render(model) {
      const page = Number(model.page);
      const loading = model.busy === "true";
      const pageButtons =
        model.variant === "compact"
          ? ""
          : [1, page > 3 ? "…" : 2, page, page < 8 ? "…" : 9, 10]
              .filter((value, index, values) => values.indexOf(value) === index)
              .map((value) =>
                value === "…"
                  ? '<span aria-hidden="true">…</span>'
                  : `<button type="button" data-sp-page="${value}" aria-current="${value === page ? "page" : "false"}" ${boolAttribute("disabled", loading)}>${value}</button>`,
              )
              .join("");
      return previewFrame(
        model,
        `
          <nav class="sp-pagination-value" aria-label="支撑数据分页" aria-busy="${loading}">
            <p><strong>第 ${page} / 10 页</strong><span>共 238 条结果</span></p>
            <div>
              <button type="button" data-sp-page="${page - 1}" ${boolAttribute("disabled", loading || page === 1)}>上一页</button>
              ${pageButtons}
              <button type="button" data-sp-page="${page + 1}" ${boolAttribute("disabled", loading || page === 10)}>下一页</button>
            </div>
            ${loading ? '<span role="status">正在载入第 5 页；当前位置尚未改变。</span>' : ""}
          </nav>
        `,
        {
          label: "分页交互示例",
          status: stateReceipt(model, loading ? "等待新页回执" : `当前第 ${page} 页`),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <nav class="pagination pagination--${model.variant}" aria-label="支撑数据分页"${model.busy === "true" ? ' aria-busy="true"' : ""}>
          <span>第 ${model.page} / 10 页 · 共 238 条</span>
          <button type="button"${model.page === "1" || model.busy === "true" ? " disabled" : ""}>上一页</button>
          <button type="button"${model.page === "10" || model.busy === "true" ? " disabled" : ""}>下一页</button>
        </nav>
      `);
    },
    bind(host, { setModel }) {
      host.querySelectorAll("[data-sp-page]").forEach((button) => {
        button.addEventListener("click", () =>
          setModel(
            { page: button.dataset.spPage, busy: "false" },
            { focusSelector: `[data-sp-page="${button.dataset.spPage}"]` },
          ),
        );
      });
    },
  }),
];
