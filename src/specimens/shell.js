import {
  bindFocusTrap,
  createDefinition,
  escapeHtml,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";
import { uiLabel } from "../locales/zh-CN.js";

export const shellDefinitions = [
  createDefinition({
    id: "header",
    defaultVariant: "application",
    defaultState: "default",
    render(model) {
      const application = model.variant === "application";
      return previewFrame(
        model,
        `
          <header class="sp-header-value">
            <div class="sp-header-identity">
              <span aria-hidden="true">${application ? "EIX" : "文"}</span>
              <div>
                <strong>${application ? "参考应用" : "参考文档"}</strong>
                ${model.state === "default" ? `<small>${application ? "工作区与导航上下文" : "文档标题 · 修订版本 4"}</small>` : ""}
              </div>
            </div>
            ${
              application
                ? `<nav aria-label="主导航"><a href="#overview" aria-current="page">概览</a><a href="#work">工作</a><a href="#library">资料库</a></nav>`
                : `<div class="sp-header-breadcrumb"><a href="#library">资料库</a><span>/</span><b>当前分析</b></div>`
            }
            <div class="sp-header-actions">
              ${model.state === "default" ? `<span>${application ? "环境" : "当前 · r4"}</span>` : ""}
              <button type="button" aria-label="打开账户">我</button>
            </div>
          </header>
        `,
        { label: "页头交互示例", status: stateReceipt(model, model.state === "compact" ? "压缩身份信息" : "完整方向信息") },
      );
    },
    markup(model) {
      return stripIndent(`
        <header class="header header--${model.variant} is-${model.state}">
          <a href="/" aria-label="首页">企业智能体验</a>
          ${model.variant === "application" ? '<nav aria-label="主导航"><a aria-current="page" href="/overview">概览</a></nav>' : '<nav aria-label="面包屑"><a href="/library">资料库</a></nav>'}
          <button type="button" aria-label="打开账户">我</button>
        </header>
      `);
    },
    bind(host) {
      host.querySelectorAll("a").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
    },
  }),

  createDefinition({
    id: "sidebar",
    defaultVariant: "global",
    defaultState: "expanded",
    render(model) {
      const collapsed = model.state === "collapsed";
      const mobileOpen = model.state === "mobile open";
      const items =
        model.variant === "section"
          ? [["01", "用途"], ["02", "交互示例"], ["03", "无障碍"]]
          : model.variant === "drawer"
            ? [["A", "当前筛选"], ["B", "详情"], ["C", "历史记录"]]
            : [["首", "首页"], ["项", "项目"], ["库", "资料库"], ["设", "设置"]];
      return previewFrame(
        model,
        `
          <div class="sp-sidebar-canvas">
            <aside
              class="sp-sidebar-value"
              aria-label="${escapeHtml(uiLabel(model.variant))}导航"
              ${mobileOpen ? 'role="dialog" aria-modal="true" data-sp-sidebar-panel' : ""}
            >
              <header>
                <span>${model.variant === "global" ? "EIX" : model.variant === "section" ? "01" : "上下文"}</span>
                ${collapsed ? "" : `<strong>${model.variant === "global" ? "企业智能体验" : model.variant === "section" ? "本页目录" : "上下文抽屉"}</strong>`}
                ${mobileOpen ? '<button type="button" aria-label="关闭移动导航" data-sp-sidebar-close>×</button>' : ""}
              </header>
              <nav>
                ${items
                  .map(
                    ([icon, label], index) => `
                      <a href="#${escapeHtml(label.toLocaleLowerCase("en-US").replaceAll(" ", "-"))}" aria-current="${index === 1 ? "page" : "false"}" title="${escapeHtml(label)}">
                        <span aria-hidden="true">${escapeHtml(icon)}</span>${collapsed ? `<span class="visually-hidden">${escapeHtml(label)}</span>` : `<b>${escapeHtml(label)}</b>`}
                      </a>
                    `,
                  )
                  .join("")}
              </nav>
              ${collapsed ? "" : `<footer>${mobileOpen ? "抽屉 · 按 Esc 关闭" : "修订版本 0.5 · 候选"}</footer>`}
            </aside>
            <main ${mobileOpen ? 'aria-hidden="true"' : ""}>
              <span>主要内容</span><i></i><i></i><i></i>
              ${mobileOpen ? "" : '<button type="button" data-sp-sidebar-mobile-trigger>预览移动端抽屉</button>'}
            </main>
          </div>
        `,
        {
          label: "侧边栏交互示例",
          status: stateReceipt(model, model.state === "mobile open" ? "模态导航抽屉" : collapsed ? "图标栏" : "常驻导航"),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <aside class="sidebar sidebar--${model.variant} is-${model.state}" aria-label="${uiLabel(model.variant)}导航"${
          model.state === "mobile open" ? ' role="dialog" aria-modal="true"' : ""
        }>
          <nav>
            <a href="/work" aria-current="page"><span aria-hidden="true">工</span>${model.state === "collapsed" ? '<span class="visually-hidden">工作对象</span>' : "工作对象"}</a>
          </nav>
          ${model.state === "mobile open" ? '<button type="button" aria-label="关闭移动导航">×</button>' : ""}
        </aside>
        ${model.state === "mobile open" ? "" : '<main><button type="button">预览移动端抽屉</button></main>'}
      `);
    },
    bind(host, { model, setModel }) {
      const close = () =>
        setModel({ state: "collapsed" }, { focusSelector: "[data-sp-sidebar-mobile-trigger]" });
      host.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", (event) => {
          event.preventDefault();
          if (model.state === "mobile open") close();
        }),
      );
      host.querySelector("[data-sp-sidebar-mobile-trigger]")?.addEventListener("click", () => {
        setModel({ state: "mobile open" }, { focusSelector: "[data-sp-sidebar-close]" });
      });
      host.querySelector("[data-sp-sidebar-close]")?.addEventListener("click", close);
      host.querySelector(".sp-sidebar-canvas")?.addEventListener("click", (event) => {
        if (model.state !== "mobile open" || event.target.closest("[data-sp-sidebar-panel]")) return;
        close();
      });
      bindFocusTrap(host, "[data-sp-sidebar-panel]", close);
      if (model.state === "mobile open") {
        requestAnimationFrame(() => host.querySelector("[data-sp-sidebar-close]")?.focus({ preventScroll: true }));
      }
    },
  }),

  createDefinition({
    id: "application-shell",
    defaultVariant: "workbench",
    defaultState: "wide",
    render(model) {
      const areas = {
        workbench: {
          title: "参考工作台",
          nav: ["项目", "最近使用", "归档"],
          context: "属性 · 活动 · 帮助",
          body: "工具画布",
        },
        document: {
          title: "参考文档",
          nav: ["目录", "评论", "历史记录"],
          context: "目录 · 元信息",
          body: "长篇文档",
        },
        review: {
          title: "参考评审",
          nav: ["分配给我", "待处理", "已完成"],
          context: "检查清单 · 变更摘要",
          body: "变更评审",
        },
      }[model.variant];
      const compact = model.state !== "wide";
      const wideContext =
        model.state === "wide" ? `<section class="sp-shell-context"><span>辅助面板</span><p>${escapeHtml(areas.context)}</p></section>` : "";
      const body =
        model.variant === "workbench"
          ? `
            <aside>${areas.nav.map((item, index) => `<a href="#${index}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(compact ? item[0] : item)}</a>`).join("")}</aside>
            <main><small>当前工具</small><h3>${escapeHtml(areas.body)}</h3><div class="sp-workbench-canvas"><i></i><i></i><i></i></div><button type="button">运行本地工具</button></main>
            ${wideContext}
          `
          : model.variant === "document"
            ? `
              <aside class="sp-shell-outline">${areas.nav.map((item, index) => `<a href="#${index}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(item)}</a>`).join("")}</aside>
              <main class="sp-shell-document"><small>文档正文</small><h3>${escapeHtml(areas.body)}</h3><article><h4>{文档标题}</h4><p>{具有稳定锚点和元信息的可读段落。}</p><p>{参考内容的第二章节。}</p></article></main>
              ${wideContext}
            `
            : `
              <aside class="sp-shell-queue">${areas.nav.map((item, index) => `<a href="#${index}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(item)}</a>`).join("")}</aside>
              <main class="sp-shell-review"><small>变更集 · 本地模拟</small><h3>${escapeHtml(areas.body)}</h3><div class="sp-review-compare"><article><span>变更前</span><p>{原值}</p></article><article><span>变更后</span><p>{建议值}</p></article></div><footer><button type="button">要求修改</button><button type="button">本地接受</button></footer></main>
              ${wideContext}
            `;
      return previewFrame(
        model,
        `
          <div class="sp-application-shell-value layout-${escapeHtml(model.variant)}">
            <header>
              <strong>${escapeHtml(areas.title)}</strong>
              <span>${model.state === "mobile reading" ? "阅读" : "修订版本 0.5"}</span>
            </header>
            ${
              model.state === "mobile reading"
                ? `<nav class="sp-shell-mobile-nav" aria-label="移动端"><button type="button" aria-current="page">内容</button><button type="button">详情</button><button type="button">评论</button></nav><main><small>移动端阅读</small><h3>${escapeHtml(areas.body)}</h3><div class="sp-shell-content-lines"><i></i><i></i><i></i></div></main>`
                : body
            }
          </div>
        `,
        {
          label: "应用框架交互示例",
          status: stateReceipt(model, model.state === "wide" ? "完整多面板能力" : model.state === "single-column" ? "上下文移入抽屉" : "仅保留阅读能力"),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <div class="application-shell application-shell--${model.variant} is-${model.state}">
          <header>当前产品与环境</header>
          ${model.state === "mobile reading" ? '<nav aria-label="移动端阅读"><button type="button" aria-current="page">内容</button><button type="button">详情</button></nav>' : '<aside aria-label="主导航"><a href="#current" aria-current="page">当前</a></aside>'}
          <main>${model.variant === "workbench" ? '工具画布 <button type="button">运行本地工具</button>' : model.variant === "document" ? "文档正文" : '<section>变更评审</section><button type="button">要求修改</button><button type="button">本地接受</button>'}</main>
          ${model.state === "wide" ? "<aside>辅助面板</aside>" : ""}
        </div>
      `);
    },
    bind(host) {
      host.querySelectorAll("a").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
    },
  }),
];
