import {
  bindFocusTrap,
  createDefinition,
  escapeHtml,
  previewFrame,
  stateReceipt,
  stripIndent,
} from "./shared.js";

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
              <span aria-hidden="true">${application ? "EI" : "AD"}</span>
              <div>
                <strong>${application ? "Reference Application" : "Reference Document"}</strong>
                ${model.state === "default" ? `<small>${application ? "Workspace and navigation context" : "Document title · revision 4"}</small>` : ""}
              </div>
            </div>
            ${
              application
                ? `<nav aria-label="Primary"><a href="#overview" aria-current="page">Overview</a><a href="#work">Work</a><a href="#library">Library</a></nav>`
                : `<div class="sp-header-breadcrumb"><a href="#library">Library</a><span>/</span><b>Current analysis</b></div>`
            }
            <div class="sp-header-actions">
              ${model.state === "default" ? `<span>${application ? "ENVIRONMENT" : "CURRENT · r4"}</span>` : ""}
              <button type="button" aria-label="Open account">MY</button>
            </div>
          </header>
        `,
        { label: "Header specimen", status: stateReceipt(model, model.state === "compact" ? "identity compressed" : "full orientation") },
      );
    },
    markup(model) {
      return stripIndent(`
        <header class="header header--${model.variant} is-${model.state}">
          <a href="/" aria-label="Home">Enterprise Intelligence</a>
          ${model.variant === "application" ? '<nav aria-label="Primary"><a aria-current="page" href="/overview">Overview</a></nav>' : '<nav aria-label="Breadcrumb"><a href="/library">Library</a></nav>'}
          <button type="button" aria-label="Open account">MY</button>
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
          ? [["01", "Purpose"], ["02", "Live Specimen"], ["03", "Accessibility"]]
          : model.variant === "drawer"
            ? [["A", "Current filters"], ["B", "Details"], ["C", "History"]]
            : [["H", "Home"], ["P", "Projects"], ["L", "Library"], ["S", "Settings"]];
      return previewFrame(
        model,
        `
          <div class="sp-sidebar-canvas">
            <aside
              class="sp-sidebar-value"
              aria-label="${escapeHtml(model.variant)} navigation"
              ${mobileOpen ? 'role="dialog" aria-modal="true" data-sp-sidebar-panel' : ""}
            >
              <header>
                <span>${model.variant === "global" ? "EI" : model.variant === "section" ? "01" : "CTX"}</span>
                ${collapsed ? "" : `<strong>${model.variant === "global" ? "Enterprise Intelligence" : model.variant === "section" ? "On this page" : "Context drawer"}</strong>`}
                ${mobileOpen ? '<button type="button" aria-label="Close mobile navigation" data-sp-sidebar-close>×</button>' : ""}
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
              ${collapsed ? "" : `<footer>${mobileOpen ? "Drawer · Esc to close" : "REV 0.3 · Candidate"}</footer>`}
            </aside>
            <main ${mobileOpen ? 'aria-hidden="true"' : ""}>
              <span>PRIMARY CONTENT</span><i></i><i></i><i></i>
              ${mobileOpen ? "" : '<button type="button" data-sp-sidebar-mobile-trigger>Preview mobile drawer</button>'}
            </main>
          </div>
        `,
        {
          label: "Sidebar specimen",
          status: stateReceipt(model, model.state === "mobile open" ? "modal navigation drawer" : collapsed ? "icon rail" : "persistent navigation"),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <aside class="sidebar sidebar--${model.variant} is-${model.state}" aria-label="${model.variant} navigation"${
          model.state === "mobile open" ? ' role="dialog" aria-modal="true"' : ""
        }>
          <nav>
            <a href="/work" aria-current="page"><span aria-hidden="true">W</span>${model.state === "collapsed" ? '<span class="visually-hidden">Work objects</span>' : "Work objects"}</a>
          </nav>
          ${model.state === "mobile open" ? '<button type="button" aria-label="Close mobile navigation">×</button>' : ""}
        </aside>
        ${model.state === "mobile open" ? "" : '<main><button type="button">Preview mobile drawer</button></main>'}
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
          title: "Reference workbench",
          nav: ["Projects", "Recent", "Archive"],
          context: "Properties · activity · help",
          body: "Tool canvas",
        },
        document: {
          title: "Reference document",
          nav: ["Outline", "Comments", "History"],
          context: "Outline · metadata",
          body: "Long-form document",
        },
        review: {
          title: "Reference review",
          nav: ["Assigned", "Open", "Completed"],
          context: "Checklist · change summary",
          body: "Change review",
        },
      }[model.variant];
      const compact = model.state !== "wide";
      const wideContext =
        model.state === "wide" ? `<section class="sp-shell-context"><span>SUPPORTING PANEL</span><p>${escapeHtml(areas.context)}</p></section>` : "";
      const body =
        model.variant === "workbench"
          ? `
            <aside>${areas.nav.map((item, index) => `<a href="#${index}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(compact ? item[0] : item)}</a>`).join("")}</aside>
            <main><small>ACTIVE TOOL</small><h3>${escapeHtml(areas.body)}</h3><div class="sp-workbench-canvas"><i></i><i></i><i></i></div><button type="button">Run local tool</button></main>
            ${wideContext}
          `
          : model.variant === "document"
            ? `
              <aside class="sp-shell-outline">${areas.nav.map((item, index) => `<a href="#${index}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(item)}</a>`).join("")}</aside>
              <main class="sp-shell-document"><small>DOCUMENT BODY</small><h3>${escapeHtml(areas.body)}</h3><article><h4>{Document heading}</h4><p>{Readable paragraphs with stable anchors and metadata.}</p><p>{Second section of reference content.}</p></article></main>
              ${wideContext}
            `
            : `
              <aside class="sp-shell-queue">${areas.nav.map((item, index) => `<a href="#${index}" aria-current="${index === 0 ? "page" : "false"}">${escapeHtml(item)}</a>`).join("")}</aside>
              <main class="sp-shell-review"><small>CHANGE SET · LOCAL FIXTURE</small><h3>${escapeHtml(areas.body)}</h3><div class="sp-review-compare"><article><span>BEFORE</span><p>{Previous value}</p></article><article><span>AFTER</span><p>{Proposed value}</p></article></div><footer><button type="button">Request changes</button><button type="button">Accept locally</button></footer></main>
              ${wideContext}
            `;
      return previewFrame(
        model,
        `
          <div class="sp-application-shell-value layout-${escapeHtml(model.variant)}">
            <header>
              <strong>${escapeHtml(areas.title)}</strong>
              <span>${model.state === "mobile reading" ? "READING" : "REV 0.3"}</span>
            </header>
            ${
              model.state === "mobile reading"
                ? `<nav class="sp-shell-mobile-nav" aria-label="Mobile"><button type="button" aria-current="page">Content</button><button type="button">Details</button><button type="button">Comments</button></nav><main><small>MOBILE READING</small><h3>${escapeHtml(areas.body)}</h3><div class="sp-shell-content-lines"><i></i><i></i><i></i></div></main>`
                : body
            }
          </div>
        `,
        {
          label: "Application Shell specimen",
          status: stateReceipt(model, model.state === "wide" ? "full multi-panel capability" : model.state === "single-column" ? "context moves to drawer" : "reading capability only"),
        },
      );
    },
    markup(model) {
      return stripIndent(`
        <div class="application-shell application-shell--${model.variant} is-${model.state}">
          <header>Current product and environment</header>
          ${model.state === "mobile reading" ? '<nav aria-label="Mobile reading"><button type="button" aria-current="page">Content</button><button type="button">Details</button></nav>' : '<aside aria-label="Primary navigation"><a href="#current" aria-current="page">Current</a></aside>'}
          <main>${model.variant === "workbench" ? 'Tool canvas <button type="button">Run local tool</button>' : model.variant === "document" ? "Document body" : '<section>Change review</section><button type="button">Request changes</button><button type="button">Accept locally</button>'}</main>
          ${model.state === "wide" ? "<aside>Supporting panel</aside>" : ""}
        </div>
      `);
    },
    bind(host) {
      host.querySelectorAll("a").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
    },
  }),
];
