import { catalogRegistry, catalogSummary, findCatalogEntry, searchCatalog } from "./catalog.js";
import { components, findDesignSystemEntry, foundations, primitives } from "./design-system-data.js";
import { specimenCoverage } from "./specimens/index.js";
import {
  bindSpecimenWorkbench,
  specimenReferenceMarkupHtml,
  specimenWorkbenchHtml,
} from "./specimens/runtime.js";

let tokenSourcePromise;
const specimenState = new Map();
const primitiveState = new Map();
const catalogUiState = {
  query: "",
  scrollTop: 0,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items, className = "") {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function tokenPathToVariable(path) {
  return `--${path.replaceAll(".", "-")}`;
}

async function loadTokenSource() {
  if (!tokenSourcePromise) {
    tokenSourcePromise = fetch("./design-system/tokens.json", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error(`Token source HTTP ${response.status}`);
      return response.json();
    });
  }
  return tokenSourcePromise;
}

function currentDesignSystemPath() {
  return window.location.hash.replace(/^#/, "").split("?")[0] || "/design-system";
}

function parseDesignSystemPath(path) {
  const parts = path.replace(/^\/+|\/+$/g, "").split("/");
  if (parts[0] !== "design-system") return { kind: null, id: null };
  return {
    kind: ["foundations", "primitives", "components"].includes(parts[1]) ? parts[1] : null,
    id: parts[2] || null,
  };
}

function routeForRelated(id) {
  const entry = catalogRegistry.find(
    (item) => ["foundations", "primitives", "components"].includes(item.kind) && item.id === id,
  );
  return entry?.route || "/design-system";
}

function renderCatalogNavigation(activeKind, activeId, query = "") {
  const groups = [
    ["foundations", "Foundations", foundations],
    ["primitives", "Primitives", primitives],
    ["components", "Components", components],
  ];

  return `
    <nav class="ds-catalog" aria-label="Design System目录">
      <div class="ds-search-field">
        <label for="dsCatalogSearch">Search catalog</label>
        <input id="dsCatalogSearch" type="search" value="${escapeHtml(query)}" placeholder="颜色、Button、Table…" autocomplete="off" />
        <span id="dsSearchCount">${catalogSummary.foundations + catalogSummary.primitives + catalogSummary.components} items</span>
      </div>
      <a class="ds-overview-link ${!activeKind ? "active" : ""}" href="#/design-system">
        <span>00</span><b>System Overview</b>
      </a>
      <div id="dsCatalogGroups">
        ${groups
          .map(
            ([kind, title, items]) => `
              <section class="ds-nav-group" data-catalog-group="${kind}">
                <header><span>${escapeHtml(title)}</span><small>${items.length}</small></header>
                ${items
                  .map(
                    (item) => `
                      <a
                        href="#/design-system/${kind}/${item.id}"
                        data-catalog-entry="${kind}:${item.id}"
                        data-search-text="${escapeHtml(`${item.id} ${item.title} ${item.cn || ""} ${item.category || ""}`.toLocaleLowerCase("zh-CN"))}"
                        class="${activeKind === kind && activeId === item.id ? "active" : ""}"
                      >
                        <span>${escapeHtml(item.title)}</span>
                      </a>
                    `,
                  )
                  .join("")}
              </section>
            `,
          )
          .join("")}
      </div>
    </nav>
  `;
}

function sequenceNavigation(kind, id) {
  const entries = catalogRegistry.filter((entry) =>
    ["foundations", "primitives", "components"].includes(entry.kind),
  );
  const index = entries.findIndex((entry) => entry.kind === kind && entry.id === id);
  if (index < 0) return "";

  const previous =
    index > 0
      ? entries[index - 1]
      : {
          route: "/design-system",
          title: "System Overview",
          kind: "overview",
        };
  const next = entries[index + 1] || null;
  const itemLink = (entry, direction) => {
    if (!entry) {
      return `<span class="ds-sequence-empty" aria-hidden="true"></span>`;
    }
    return `
      <a href="#${escapeHtml(entry.route)}" rel="${direction === "Previous" ? "prev" : "next"}">
        <span>${direction}</span>
        <b>${escapeHtml(entry.title)}</b>
      </a>
    `;
  };

  return `
    <nav class="ds-sequence-nav" aria-label="连续浏览Design System目录">
      ${itemLink(previous, "Previous")}
      <span class="ds-sequence-position"><b>${String(index + 1).padStart(2, "0")}</b> / ${entries.length}</span>
      ${itemLink(next, "Next")}
    </nav>
  `;
}

function layerTrace(activeLayer = "core") {
  const layers = [
    ["foundation", "Foundation", "值与尺度"],
    ["primitive", "Primitive", "布局与行为"],
    ["component", "Component", "通用任务控件"],
    ["guidance", "Intelligence Pattern", "人机工作契约"],
  ];
  return `
    <div class="ds-layer-trace" aria-label="Design System依赖方向">
      ${layers
        .map(
          ([id, title, description], index) => `
            <div class="${activeLayer === id ? "active" : ""}">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <b>${title}</b>
              <small>${description}</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderOverview() {
  return `
    <article class="ds-doc ds-overview">
      <header class="ds-doc-header">
        <div>
          <p class="eyebrow">02 · CANDIDATE PLATFORM STANDARD · REV 0.5</p>
          <h1>统一Token、布局、组件状态和无障碍要求，<br />支持不同<em>Enterprise AI</em>场景。</h1>
          <p class="ds-lead">
            Core Design System只定义可复用的视觉、布局、状态和交互契约。
            Process Intelligence与Collaborative Intelligence的业务责任由Intelligence UX Guidance定义，不写进Button或Card。
          </p>
        </div>
        <div class="ds-status-stamp">
          <span>REFERENCE RENDERER</span>
          <strong>STATIC</strong>
          <small>Spec Rev 0.5 · No package API</small>
        </div>
      </header>
      ${layerTrace()}
      <section id="ds-boundary" class="ds-doc-section" data-section-title="系统边界">
        <div class="ds-section-heading">
          <span>BOUNDARY</span>
          <h2>业务Pattern复用Core Component，<br />基础组件不持有业务生命周期。</h2>
        </div>
        <div class="ds-boundary-grid">
          <article>
            <span>CORE DESIGN SYSTEM</span>
            <h3>How the interface is built</h3>
            <p>Token、Typography、Layout、Button、Table、Dialog与Shell。</p>
          </article>
          <article>
            <span>INTELLIGENCE GUIDANCE</span>
            <h3>How human and AI work</h3>
            <p>Goal、Evidence、Decision、Action、Outcome、Exception与Handoff。</p>
          </article>
        </div>
      </section>
      <section id="ds-inventory" class="ds-doc-section" data-section-title="系统清单">
        <div class="ds-section-heading">
          <span>CATALOG COVERAGE</span>
          <h2>从值到页面组合的可检查目录。</h2>
        </div>
        <div class="ds-count-grid">
          <a href="#/design-system/foundations/color"><strong>${catalogSummary.foundations}</strong><span>Foundations</span><small>用途、尺度与语义Token</small></a>
          <a href="#/design-system/primitives/surface"><strong>${catalogSummary.primitives}</strong><span>Primitives</span><small>布局、焦点与浮层行为</small></a>
          <a href="#/design-system/components/button"><strong>${catalogSummary.components}</strong><span>Components</span><small>通用任务控件与状态</small></a>
          <a href="#/guidance"><strong>${catalogSummary.guidance + catalogSummary.compositions}</strong><span>UX Patterns</span><small>在Guidance层完成组合</small></a>
        </div>
      </section>
      <section id="ds-themes" class="ds-doc-section" data-section-title="主题">
        <div class="ds-section-heading">
          <span>SEMANTIC THEMING</span>
          <h2>中性内核，EIX是第一套主题。</h2>
        </div>
        <div class="ds-theme-comparison">
          <article data-theme-preview="neutral">
            <header><span>NEUTRAL CORE</span><small>Brand-neutral semantics</small></header>
            <div><button type="button">Primary action</button><span>Supporting status</span></div>
          </article>
          <article data-theme-preview="eix">
            <header><span>EIX THEME</span><small>Finance working paper</small></header>
            <div><button type="button">Primary action</button><span>Supporting status</span></div>
          </article>
        </div>
        <p class="ds-note">Theme改变视觉值，不改变组件结构、业务含义或Work Object状态。</p>
      </section>
      <section id="ds-promotion" class="ds-doc-section" data-section-title="工程化门槛">
        <div class="ds-section-heading">
          <span>PROMOTION GATE</span>
          <h2>当前交付是实现参考和验收契约，<br />尚未发布生产组件包。</h2>
        </div>
        <div class="ds-promotion">
          <ol>
            <li><b>现在</b><span>Token源、Reference Markup、Live Specimen、响应式和验收规则。</span></li>
            <li><b>触发条件</b><span>至少两个真实消费者使用相同组件契约，且没有领域分支。</span></li>
            <li><b>下一阶段</b><span>@eix/tokens、@eix/ui、API版本、组件测试与Migration。</span></li>
          </ol>
        </div>
      </section>
    </article>
  `;
}

function foundationPreview(spec, tokenSource) {
  const matchingTokens = tokenSource.tokens.filter((token) => {
    if (spec.id === "color") return token.path.includes("color") || token.path.startsWith("semantic.");
    if (spec.id === "spacing-density") return token.path.includes("space");
    if (spec.id === "borders-radius") return token.path.includes("border") || token.path.includes("radius");
    if (spec.id === "elevation") return token.path.includes("shadow");
    if (spec.id === "motion") return token.path.includes("motion");
    return false;
  });

  if (spec.id === "color") {
    const rampTokens = tokenSource.tokens.filter((token) => token.path.startsWith("foundation.color."));
    const rampGroups = new Map();
    rampTokens.forEach((token) => {
      const [, , family, tone] = token.path.split(".");
      if (!rampGroups.has(family)) rampGroups.set(family, []);
      rampGroups.get(family).push({ ...token, tone: Number(tone) });
    });
    rampGroups.forEach((tokens) => tokens.sort((a, b) => a.tone - b.tone));
    const semanticRoles = tokenSource.tokens.filter(
      (token) =>
        token.path.startsWith("semantic.surface.") ||
        token.path.startsWith("semantic.text.") ||
        token.path.startsWith("semantic.border.") ||
        token.path.startsWith("semantic.action.") ||
        token.path.startsWith("semantic.feedback.") ||
        token.path === "semantic.focus.ring",
    );
    return `
      <div class="ds-color-system">
        <section class="ds-color-ramps" aria-label="Foundation color ramps">
          ${[...rampGroups.entries()]
            .map(
              ([family, tokens]) => `
                <article class="ds-color-ramp">
                  <header><strong>${escapeHtml(family)}</strong><span>Foundation ramp · components不得直接消费</span></header>
                  <div>
                    ${tokens
                      .map(
                        (token) => `
                          <span style="background:var(${escapeHtml(token.cssVariable)})" title="${escapeHtml(token.path)}">
                            <b>${escapeHtml(token.tone)}</b>
                          </span>
                        `,
                      )
                      .join("")}
                  </div>
                </article>
              `,
            )
            .join("")}
        </section>
        <section class="ds-semantic-roles">
          <header>
            <div><span>SEMANTIC ROLES</span><h3>组件只使用用途Token。</h3></div>
            <p>Theme改变品牌表达，Mode改变明暗映射；两者都不能改变组件结构或业务语义。</p>
          </header>
          <div role="table" aria-label="Semantic color roles">
            ${semanticRoles
              .map(
                (token) => `
                  <div role="row">
                    <i role="cell" style="background:var(${escapeHtml(token.cssVariable)})"></i>
                    <code role="cell">${escapeHtml(token.path)}</code>
                    <span role="cell">${escapeHtml(token.description)}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
        <div class="ds-color-contract">
          <p><b>Accent</b>只表达交互、选中与变化，不表达Evidence、Risk、Permission或Workflow。</p>
          <p><b>Semantic state</b>必须同时显示字段名称、文字或符号；F/U等业务方向不能只靠红绿。</p>
          <p><b>Dark Mode</b>使用同一套Semantic Contract；组件结构和业务状态保持一致。</p>
        </div>
      </div>
    `;
  }
  if (spec.id === "typography") {
    return `
      <div class="ds-type-specimen">
        <div><span>PAGE TITLE · 52/1.02</span><h2>Human control is visible.</h2></div>
        <div><span>SECTION TITLE · 34/1.12</span><h3>证据先于措辞。</h3></div>
        <div><span>BODY · 17/1.65</span><p>界面应持续显示Goal、Context、State、Owner与Revision，让用户不必依赖聊天记录恢复方向。</p></div>
        <div><span>DATA · TABULAR</span><strong>1,248.50 · +12.4%</strong></div>
      </div>
    `;
  }
  if (spec.id === "spacing-density") {
    return `<div class="ds-spacing-specimen">${[1, 2, 3, 4, 6, 8, 12]
      .map((step) => `<div><span>space.${step}</span><i style="width:var(--foundation-space-${step})"></i></div>`)
      .join("")}</div>`;
  }
  if (spec.id === "layout-breakpoints") {
    return `
      <div class="ds-layout-specimen">
        <aside>NAV</aside><main>PRIMARY WORK</main><aside>CONTEXT</aside>
      </div>
      <p class="ds-note">缩小视口时Context先转抽屉，Primary Work保持连续。</p>
    `;
  }
  if (spec.id === "borders-radius" || spec.id === "elevation") {
    return `
      <div class="ds-box-specimen">
        <div class="flat"><span>FLAT</span><p>结构内容</p></div>
        <div class="outlined"><span>OUTLINED</span><p>可操作区域</p></div>
        <div class="raised"><span>RAISED</span><p>临时浮层</p></div>
      </div>
    `;
  }
  if (spec.id === "motion") {
    return `
      <div class="ds-motion-specimen">
        <button type="button" data-motion-demo>Replay state change</button>
        <div data-motion-target><span>INTENT PATCH</span><strong>Scope updated</strong></div>
      </div>
    `;
  }
  if (spec.id === "iconography") {
    return `
      <div class="ds-icon-specimen">
        <span><b aria-hidden="true">←</b>Back</span>
        <span><b aria-hidden="true">＋</b>Add</span>
        <span><b aria-hidden="true">×</b>Close</span>
        <span><b aria-hidden="true">!</b>Attention</span>
      </div>
    `;
  }
  if (spec.id === "data-display") {
    return `
      <div class="ds-data-specimen">
        <header><span>METRIC · PERIOD · VERSION</span><strong>Fresh · 08:30 CST</strong></header>
        <table><thead><tr><th>Item</th><th>Actual</th><th>Plan</th><th>Variance</th></tr></thead>
        <tbody><tr><td>Sample A</td><td>1,248 unit</td><td>1,310 unit</td><td>−62 · Unfavorable</td></tr>
        <tr><td>Sample B</td><td>— Missing</td><td>980 unit</td><td>Not available</td></tr></tbody></table>
      </div>
    `;
  }
  if (spec.id === "accessibility-localization") {
    return `
      <div class="ds-accessibility-specimen">
        <button type="button">Tab到这里查看Focus</button>
        <p lang="zh-CN">FY27 YTD实际值为 <strong>1,248.50&nbsp;MRMB</strong>，更新于2027年7月25日。</p>
        <div role="status">状态变化会通过Live Region同步给辅助技术。</div>
      </div>
    `;
  }
  return `<div class="ds-token-list">${matchingTokens.map((token) => `<code>${escapeHtml(token.path)}</code>`).join("")}</div>`;
}

function renderFoundationDetail(spec, tokenSource) {
  const tokens = tokenSource.tokens.filter((token) => {
    const map = {
      color: ["color", "surface", "text", "feedback", "action", "focus"],
      typography: ["font"],
      "spacing-density": ["space"],
      "layout-breakpoints": ["shell"],
      "borders-radius": ["border", "radius"],
      elevation: ["shadow"],
      motion: ["motion"],
    };
    return (map[spec.id] || []).some((fragment) => token.path.includes(fragment));
  });
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div><p class="eyebrow">FOUNDATION · ${escapeHtml(spec.id.toUpperCase())}</p><h1>${escapeHtml(spec.title)}</h1><p>${escapeHtml(spec.purpose)}</p></div>
        <span class="ds-maturity">CANDIDATE · REV 0.5</span>
      </header>
      ${sequenceNavigation("foundations", spec.id)}
      ${layerTrace("foundation")}
      <section id="purpose" class="ds-doc-section" data-section-title="Purpose">
        <div class="ds-section-heading"><span>PURPOSE</span><h2>使用原则</h2></div>
        ${list(spec.principles, "ds-rule-list")}
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="Live Specimen">
        <div class="ds-section-heading"><span>LIVE SPECIMEN</span><h2>在页面、控件和状态示例中<br />检查Token的实际效果。</h2></div>
        <div class="ds-live-stage">${foundationPreview(spec, tokenSource)}</div>
      </section>
      <section id="examples" class="ds-doc-section" data-section-title="Examples">
        <div class="ds-section-heading"><span>REFERENCE</span><h2>系统约定</h2></div>
        <div class="ds-two-column"><div><h3>Examples</h3>${list(spec.examples)}</div><div><h3>Acceptance</h3>${list(spec.acceptance)}</div></div>
      </section>
      <section id="tokens" class="ds-doc-section" data-section-title="Tokens">
        <div class="ds-section-heading"><span>TOKENS</span><h2>相关Token</h2></div>
        ${
          tokens.length
            ? `<div class="ds-token-table">${tokens
                .map(
                  (token) => `
                    <div><code>${escapeHtml(token.path)}</code><span>${escapeHtml(token.defaultValue)}</span><small>${escapeHtml(token.description)}</small></div>
                  `,
                )
                .join("")}</div>`
            : `<p class="ds-note">该Foundation目前以规范约束为主，进入生产包阶段后补充专用Token。</p>`
        }
      </section>
    </article>
  `;
}

function primitivePreview(spec, variant) {
  const item = (label, className = "") => `<div class="${className}"><span>${escapeHtml(label)}</span></div>`;
  const previews = {
    surface: `<div class="ds-primitive-surface is-${escapeHtml(variant)}">${item(`${variant} surface`, variant)}<p>Child content inherits the surface contrast contract.</p></div>`,
    stack: `<div class="ds-primitive-stack is-${escapeHtml(variant)}">${item("First item")}${item("Second item")}${item("Third item")}</div>`,
    inline: `<div class="ds-primitive-inline is-${escapeHtml(variant)}">${item("Leading")}${item("Middle")}${item("Trailing")}</div>`,
    grid: `<div class="ds-primitive-grid is-${escapeHtml(variant)}">${item("A")}${item("B")}${item("C")}${item("D")}</div>`,
    cluster: `<div class="ds-primitive-cluster is-${escapeHtml(variant)}">${item("Filter one")}${item("Filter two")}${item("Long optional item")}${item("Action")}</div>`,
    "scroll-area": `<div class="ds-primitive-scroll is-${escapeHtml(variant)}" tabindex="0" role="region" aria-label="${escapeHtml(variant)} scroll area">${Array.from({ length: 12 }, (_, index) => item(`Item ${index + 1}`)).join("")}</div>`,
    "focus-ring": `<div class="ds-primitive-focus is-${escapeHtml(variant)}"><button type="button" autofocus>Keyboard focus target</button><p>${escapeHtml(variant)} contrast context</p></div>`,
    "visually-hidden": {
      label: `<div class="ds-primitive-hidden"><button type="button"><span aria-hidden="true">E</span><span class="visually-hidden">Open evidence receipt</span></button><p>Hidden text supplies the accessible name.</p></div>`,
      description: `<div class="ds-primitive-hidden"><button type="button" aria-describedby="hidden-description">Publish revision</button><span id="hidden-description" class="visually-hidden">Publishes the current validated revision to the selected audience.</span><p>Hidden text supplies supplementary description.</p></div>`,
      "live announcement": `<div class="ds-primitive-hidden"><button type="button" data-hidden-announce>Run local check</button><span class="visually-hidden" aria-live="polite" data-hidden-live></span><p data-hidden-visible>No announcement yet.</p></div>`,
    }[variant],
    "overlay-portal": `<div class="ds-primitive-overlay is-${escapeHtml(variant)}"><button type="button" data-overlay-demo>Open ${escapeHtml(variant)} layer</button><div data-overlay-panel hidden ${variant === "modal" ? 'role="dialog" aria-modal="true" aria-labelledby="primitive-overlay-title"' : 'role="region" aria-label="Supplementary layer"'}><strong id="primitive-overlay-title">${variant === "modal" ? "Modal task" : "Non-modal context"}</strong><p>${variant === "modal" ? "Focus stays inside until the task closes." : "The underlying content remains operable."}</p><button type="button" data-overlay-close>Close</button></div></div>`,
  };
  return previews[spec.id] || item(spec.title);
}

function renderPrimitiveDetail(spec) {
  const selectedVariant = spec.variants.includes(primitiveState.get(spec.id))
    ? primitiveState.get(spec.id)
    : spec.variants[0];
  primitiveState.set(spec.id, selectedVariant);
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div><p class="eyebrow">PRIMITIVE · ${escapeHtml(spec.id.toUpperCase())}</p><h1>${escapeHtml(spec.title)}</h1><p>${escapeHtml(spec.purpose)}</p></div>
        <span class="ds-maturity">CANDIDATE CONTRACT · STATIC PREVIEW</span>
      </header>
      ${sequenceNavigation("primitives", spec.id)}
      ${layerTrace("primitive")}
      <section id="anatomy" class="ds-doc-section" data-section-title="Anatomy">
        <div class="ds-section-heading"><span>ANATOMY</span><h2>结构与变体</h2></div>
        <div class="ds-two-column"><div><h3>Anatomy</h3>${list(spec.anatomy)}</div><div><h3>Variants</h3>${list(spec.variants)}</div></div>
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="Live Specimen">
        <div class="ds-section-heading"><span>LIVE SPECIMEN · ALL VARIANTS</span><h2>每个Variant改变真实布局或可访问语义。</h2></div>
        <div class="ds-specimen-toolbar" role="group" aria-label="${escapeHtml(spec.title)} variants">
          ${spec.variants
            .map(
              (variant) =>
                `<button type="button" data-primitive-variant="${escapeHtml(variant)}" aria-pressed="${String(variant === selectedVariant)}">${escapeHtml(variant)}</button>`,
            )
            .join("")}
        </div>
        <div class="ds-live-stage" data-primitive-stage="${escapeHtml(spec.id)}">${primitivePreview(spec, selectedVariant)}</div>
        <p class="ds-note" aria-live="polite">Current variant · <b data-primitive-current>${escapeHtml(selectedVariant)}</b></p>
      </section>
      <section id="usage" class="ds-doc-section" data-section-title="Usage">
        <div class="ds-section-heading"><span>DEPENDENCY</span><h2>Primitive不拥有业务状态。</h2></div>
        <p class="ds-note">Primitive可以被Component和Pattern组合，但不得把Evidence、Permission或Workflow写进自身API。</p>
      </section>
    </article>
  `;
}

function bindPrimitiveWorkbench(container, spec) {
  const render = (variant, focus = false) => {
    primitiveState.set(spec.id, variant);
    const stage = container.querySelector("[data-primitive-stage]");
    if (stage) stage.innerHTML = primitivePreview(spec, variant);
    container.querySelectorAll("[data-primitive-variant]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.primitiveVariant === variant));
    });
    const current = container.querySelector("[data-primitive-current]");
    if (current) current.textContent = variant;
    bindLiveControls(container);
    if (focus) {
      requestAnimationFrame(() =>
        container.querySelector(`[data-primitive-variant="${CSS.escape(variant)}"]`)?.focus(),
      );
    }
  };
  container.querySelectorAll("[data-primitive-variant]").forEach((button) => {
    button.addEventListener("click", () => render(button.dataset.primitiveVariant));
  });
  bindLiveControls(container);
}

function stateIs(state, value) {
  return String(state).toLocaleLowerCase("en-US").includes(value);
}

function specimenMarkup(id) {
  const markup = {
    button: `<button type="button" class="eix-ref-button">Publish revision</button>`,
    badge: `<span class="eix-ref-badge"><span>Workflow</span> Draft</span>`,
    callout: `<aside class="eix-ref-callout" role="status"><strong>Evidence changed</strong><p>Run the publication gate again.</p></aside>`,
    table: `<table class="eix-ref-table"><caption>Supporting data · MRMB</caption>…</table>`,
    dialog: `<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">…</div>`,
    "text-field": `<label>Object title<input type="text" aria-describedby="title-hint"></label>`,
    "application-shell": `<div class="eix-ref-shell"><header>…</header><nav>…</nav><main>…</main></div>`,
  };
  return markup[id] || `<div class="eix-ref-${id}">Reference ${id} content</div>`;
}

function componentSpecimen(spec, state) {
  const disabled = stateIs(state, "disabled") ? "disabled" : "";
  const loading = stateIs(state, "loading") || stateIs(state, "busy");
  const error = stateIs(state, "error");
  switch (spec.specimenKind) {
    case "typography":
      return `<div class="ref-type"><h2>可验证的工作结果</h2><p>Primary text解释当前对象；supporting text说明范围与限制。</p><small>REVISION · 03 / 07</small></div>`;
    case "link":
      return `<p class="ref-copy">查看<a href="#/design-system/components/link">Evidence receipt</a>或返回当前Work Object。</p>`;
    case "button":
      return `<div class="ref-actions"><button type="button" ${disabled} ${loading ? 'aria-busy="true"' : ""}>${loading ? "Publishing…" : "Publish revision"}</button><button type="button" class="secondary" ${disabled}>Save draft</button><button type="button" class="danger" ${disabled}>Withdraw</button></div>`;
    case "icon-button":
      return `<div class="ref-actions"><button type="button" class="icon" aria-label="返回上一页">←</button><button type="button" class="icon" aria-label="添加项目">＋</button><button type="button" class="icon" aria-label="关闭">×</button></div>`;
    case "badge":
      return `<div class="ref-badges"><span><i></i>Workflow · Draft</span><span class="verified"><i></i>Evidence · Verified</span><span class="warning"><i></i>Risk · Reversible</span><span class="blocking"><i></i>Permission · Denied</span></div>`;
    case "callout":
      return `<div class="ref-callout ${error ? "blocking" : ""}" role="status"><span>${error ? "BLOCKING" : "ATTENTION"}</span><strong>${error ? "Permission denied" : "Evidence snapshot changed"}</strong><p>${error ? "Request the correct scope before continuing." : "The verified result remains; rerun the publication gate."}</p><button type="button">${error ? "View policy" : "Run gate again"}</button></div>`;
    case "card":
      return `<article class="ref-card" tabindex="0"><span>WORK OBJECT</span><h3>Analysis Document · r4</h3><p>One responsibility, one visible state, one clear next action.</p><a href="#/guidance/collaborative/C02">Open guidance →</a></article>`;
    case "divider":
      return `<div class="ref-divider"><p>Primary content</p><hr><p>Supporting content</p></div>`;
    case "tabs":
      return `<div class="ref-tabs"><div role="tablist"><button role="tab" aria-selected="true">Overview</button><button role="tab" aria-selected="false">Evidence</button><button role="tab" aria-selected="false">History</button></div><section role="tabpanel">Overview panel for the same Work Object.</section></div>`;
    case "segmented":
      return `<div class="ref-segments" role="group" aria-label="阅读密度"><button type="button" aria-pressed="true">快速阅读</button><button type="button" aria-pressed="false">完整规范</button></div>`;
    case "disclosure":
      return `<div class="ref-disclosure"><button type="button" aria-expanded="false" data-ref-disclosure>Show limitations <span>＋</span></button><div hidden>Attribution is unavailable because the required baseline is missing.</div></div>`;
    case "tooltip":
      return `<div class="ref-tooltip"><button type="button" aria-describedby="ref-tooltip-content">E</button><span id="ref-tooltip-content" role="tooltip">Open Evidence receipt</span></div>`;
    case "menu":
      return `<div class="ref-menu"><button type="button" aria-expanded="false" data-ref-menu-trigger>More actions ▾</button><div role="menu" hidden><button role="menuitem">Create branch</button><button role="menuitem">Copy link</button><button role="menuitem">View history</button></div></div>`;
    case "dialog":
      return `<div class="ref-overlay-launch"><button type="button" data-ref-open="dialog">Open confirmation</button><div class="ref-overlay" data-ref-overlay="dialog" hidden><div role="dialog" aria-modal="true" aria-labelledby="ref-dialog-title"><span>ACTION PREVIEW</span><h3 id="ref-dialog-title">Publish revision?</h3><p>This changes the audience-visible state. No external system action is connected.</p><div><button type="button" data-ref-close>Cancel</button><button type="button" data-ref-close>Publish</button></div></div></div></div>`;
    case "drawer":
      return `<div class="ref-overlay-launch"><button type="button" data-ref-open="drawer">Open inspector</button><div class="ref-overlay drawer" data-ref-overlay="drawer" hidden><div role="dialog" aria-modal="true" aria-labelledby="ref-drawer-title"><span>CONTEXT DRAWER</span><h3 id="ref-drawer-title">Evidence inspector</h3><p>Secondary context without leaving the Work Object.</p><button type="button" data-ref-close>Close inspector</button></div></div></div>`;
    case "field":
      return `<label class="ref-field"><span>Object title</span><input type="text" value="${error ? "A" : "Quarterly analysis"}" ${disabled} aria-invalid="${error}" aria-describedby="ref-field-note"><small id="ref-field-note">${error ? "Use at least 3 characters." : "Visible to collaborators."}</small></label>`;
    case "textarea":
      return `<label class="ref-field"><span>Decision rationale</span><textarea rows="4" ${disabled}>Evidence supports the selected option within the approved scope.</textarea><small>Describe why this option was selected.</small></label>`;
    case "select":
      return `<label class="ref-field"><span>Audience</span><select ${disabled}><option>Finance leadership</option><option>Process owner</option><option>Working team</option></select><small>Audience permission is checked separately.</small></label>`;
    case "checkbox":
      return `<div class="ref-checks"><label><input type="checkbox" checked ${disabled}> Include supporting data</label><label><input type="checkbox" ${disabled}> Notify owner after publish</label></div>`;
    case "switch":
      return `<label class="ref-switch"><input type="checkbox" role="switch" checked ${disabled}><span></span><b>Show evidence IDs</b></label>`;
    case "table":
      return `<div class="ref-table-wrap" tabindex="0" role="region" aria-label="Scrollable supporting data"><table><caption>Supporting data · FY27 YTD · MRMB</caption><thead><tr><th>Object</th><th>Actual</th><th>Plan</th><th>Variance</th></tr></thead><tbody><tr><td>Sample A</td><td>1,248</td><td>1,310</td><td>−62</td></tr><tr><td>Sample B</td><td>982</td><td>970</td><td>+12</td></tr><tr><td>Sample C</td><td>—</td><td>760</td><td>Not available</td></tr></tbody></table></div>`;
    case "progress":
      return `<div class="ref-progress"><label for="ref-progress">Validated steps · 3 of 5</label><progress id="ref-progress" value="3" max="5">60%</progress><span>2 conditional steps remain.</span></div>`;
    case "spinner":
      return `<div class="ref-spinner" role="status"><i aria-hidden="true"></i><span>Loading reference data…</span></div>`;
    case "skeleton":
      return `<div class="ref-skeleton" aria-hidden="true"><i></i><i></i><i></i></div><span class="visually-hidden">Loading reference content</span>`;
    case "empty":
      return `<div class="ref-empty"><span>NO MATCHES</span><h3>No components match “forecast”.</h3><p>Clear the filter or search the Intelligence UX Guidance.</p><button type="button">Clear search</button></div>`;
    case "toast":
      return `<div class="ref-toast-demo"><button type="button" data-ref-toast-show>Show confirmation</button><div class="ref-toast" role="status" hidden><span>Revision saved.</span><button type="button" data-ref-toast-hide>Dismiss</button></div></div>`;
    case "shell":
      return `<div class="ref-shell"><header><strong>Enterprise Experience</strong><span>REV 0.5</span></header><aside><b>Overview</b><span>Architecture</span><span>Guidance</span></aside><main><small>CURRENT WORK OBJECT</small><h3>Reference document</h3><p>The shell preserves orientation across views.</p></main></div>`;
    default:
      return `<div class="ref-surface"><span>REFERENCE SURFACE</span><h3>${escapeHtml(spec.title)}</h3><p>${escapeHtml(spec.purpose)}</p></div>`;
  }
}

function renderLegacyComponentDetail(spec) {
  const selectedState = specimenState.get(spec.id) || spec.states[0];
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div><p class="eyebrow">COMPONENT · ${escapeHtml(spec.category.toUpperCase())}</p><h1>${escapeHtml(spec.title)}</h1><p>${escapeHtml(spec.purpose)}</p></div>
        <span class="ds-maturity">${escapeHtml(spec.maturity.toUpperCase())} · REFERENCE</span>
      </header>
      ${sequenceNavigation("components", spec.id)}
      ${layerTrace("component")}
      <section id="purpose" class="ds-doc-section" data-section-title="Purpose">
        <div class="ds-section-heading"><span>PURPOSE & USAGE</span><h2>适用场景与使用边界</h2></div>
        <p>${escapeHtml(spec.usage)}</p>
      </section>
      <section id="anatomy" class="ds-doc-section" data-section-title="Anatomy">
        <div class="ds-section-heading"><span>ANATOMY</span><h2>结构、变体与状态</h2></div>
        <div class="ds-three-column"><div><h3>Anatomy</h3>${list(spec.anatomy)}</div><div><h3>Variants</h3>${list(spec.variants)}</div><div><h3>States</h3>${list(spec.states)}</div></div>
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="Live Specimen">
        <div class="ds-section-heading"><span>LIVE SPECIMEN</span><h2>Reference behavior</h2></div>
        <div class="ds-specimen-toolbar" role="group" aria-label="${escapeHtml(spec.title)}状态">
          ${spec.states
            .slice(0, 6)
            .map(
              (state) => `<button type="button" data-component-state="${escapeHtml(state)}" aria-pressed="${state === selectedState}">${escapeHtml(state)}</button>`,
            )
            .join("")}
        </div>
        <div class="ds-live-stage" id="dsComponentSpecimen" data-specimen-component="${escapeHtml(spec.id)}">${componentSpecimen(spec, selectedState)}</div>
        <p class="ds-note">Fixture · 状态控制只修改本页Specimen，不代表生产组件API。</p>
      </section>
      <section id="reference-markup" class="ds-doc-section" data-section-title="Reference Markup">
        <div class="ds-section-heading"><span>REFERENCE MARKUP</span><h2>当前语义结构参考；<br />尚未发布生产组件包。</h2></div>
        <div class="ds-code-block"><div><span>HTML · CONTRACT EXAMPLE</span><button type="button" data-copy-markup>Copy</button></div><pre tabindex="0"><code>${escapeHtml(specimenMarkup(spec.id))}</code></pre></div>
      </section>
      <section id="tokens" class="ds-doc-section" data-section-title="Tokens">
        <div class="ds-section-heading"><span>TOKENS & REFERENCE PROPS</span><h2>实现约束</h2></div>
        <div class="ds-two-column"><div><h3>Tokens</h3>${list(spec.tokens)}</div><div><h3>Reference Props</h3>${list(spec.referenceProps)}</div></div>
      </section>
      <section id="responsive-accessibility" class="ds-doc-section" data-section-title="Responsive & Accessibility">
        <div class="ds-section-heading"><span>QUALITY FLOOR</span><h2>响应式设计保持核心任务能力等价。</h2></div>
        <p>${escapeHtml(spec.responsive)}</p>${list(spec.accessibility)}
      </section>
      <section id="do-dont" class="ds-doc-section" data-section-title="Do / Don’t">
        <div class="ds-section-heading"><span>DESIGN REVIEW</span><h2>Do / Don’t</h2></div>
        <div class="ds-do-dont"><article><span>DO</span>${list(spec.dos)}</article><article><span>DON'T</span>${list(spec.donts)}</article></div>
      </section>
    </article>
  `;
}

function renderComponentDetail(spec) {
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div>
          <p class="eyebrow">COMPONENT · ${escapeHtml(spec.category.toUpperCase())}</p>
          <h1>${escapeHtml(spec.title)}</h1>
          <p>${escapeHtml(spec.purpose)}</p>
        </div>
        <span class="ds-maturity">CANDIDATE CONTRACT · STATIC CHECKED</span>
      </header>
      ${sequenceNavigation("components", spec.id)}
      ${layerTrace("component")}
      <section id="purpose" class="ds-doc-section" data-section-title="Purpose">
        <div class="ds-section-heading"><span>PURPOSE & USAGE</span><h2>适用场景与使用边界</h2></div>
        <p>${escapeHtml(spec.usage)}</p>
      </section>
      <section id="anatomy" class="ds-doc-section" data-section-title="Anatomy">
        <div class="ds-section-heading"><span>ANATOMY</span><h2>结构、变体与状态</h2></div>
        <div class="ds-three-column">
          <div><h3>Anatomy</h3>${list(spec.anatomy)}</div>
          <div><h3>Variants · ${spec.variants.length}</h3>${list(spec.variants)}</div>
          <div><h3>States · ${spec.states.length}</h3>${list(spec.states)}</div>
        </div>
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="Live Specimen">
        <div class="ds-section-heading">
          <span>LIVE SPECIMEN · CONTROLLED</span>
          <h2>Variant、State与Viewport共同驱动Live Stage和Reference Markup。</h2>
        </div>
        ${specimenWorkbenchHtml(spec)}
      </section>
      <section id="reference-markup" class="ds-doc-section" data-section-title="Reference Markup">
        <div class="ds-section-heading">
          <span>REFERENCE MARKUP</span>
          <h2>跟随当前合法Model更新，并保持关键语义一致。</h2>
        </div>
        ${specimenReferenceMarkupHtml(spec)}
      </section>
      <section id="tokens" class="ds-doc-section" data-section-title="Tokens">
        <div class="ds-section-heading"><span>TOKENS & REFERENCE PROPS</span><h2>实现约束</h2></div>
        <div class="ds-two-column"><div><h3>Tokens</h3>${list(spec.tokens)}</div><div><h3>Reference Props</h3>${list(spec.referenceProps)}</div></div>
      </section>
      <section id="responsive-accessibility" class="ds-doc-section" data-section-title="Responsive & Accessibility">
        <div class="ds-section-heading"><span>QUALITY FLOOR</span><h2>响应式设计保持核心任务能力等价。</h2></div>
        <p>${escapeHtml(spec.responsive)}</p>${list(spec.accessibility)}
      </section>
      <section id="do-dont" class="ds-doc-section" data-section-title="Do / Don’t">
        <div class="ds-section-heading"><span>DESIGN REVIEW</span><h2>Do / Don’t</h2></div>
        <div class="ds-do-dont"><article><span>DO</span>${list(spec.dos)}</article><article><span>DON'T</span>${list(spec.donts)}</article></div>
      </section>
    </article>
  `;
}

function inspectorHtml(kind, spec, tokenSource) {
  const tokens = kind === "components" ? spec.tokens : [];
  const related = (spec.relatedIds || []).map((id) => {
    const route = routeForRelated(id);
    const entry = findCatalogEntry("components", id) || findCatalogEntry("primitives", id) || findCatalogEntry("foundations", id);
    return `<a href="#${escapeHtml(route)}">${escapeHtml(entry?.title || id)}</a>`;
  });
  return `
    <aside class="ds-inspector" aria-label="当前规范信息与预览设置">
      <header class="ds-inspector-heading">
        <span>SPEC INFO</span>
        <strong>当前规范信息</strong>
        <p>跟随Catalog中的当前条目；不切换站点章节。</p>
      </header>
      <section><span>MATURITY</span><strong>${escapeHtml(spec.maturity || "Candidate")}</strong><p>Static renderer · package not published</p></section>
      <section><span>THEME</span><div class="ds-theme-toggle" role="group" aria-label="主题">
        <button type="button" data-ds-theme="neutral">Neutral</button>
        <button type="button" data-ds-theme="eix">EIX</button>
      </div></section>
      <section><span>MODE</span><div class="ds-theme-toggle" role="group" aria-label="明暗模式">
        <button type="button" data-ds-mode="light">Light</button>
        <button type="button" data-ds-mode="dark">Dark</button>
      </div></section>
      ${
        tokens.length
          ? `<section><span>USES TOKENS</span>${tokens.map((token) => `<code>${escapeHtml(token)}</code>`).join("")}</section>`
          : ""
      }
      ${
        related.length
          ? `<section><span>RELATED</span><div class="ds-related-links">${related.join("")}</div></section>`
          : ""
      }
      <section><span>SOURCE</span><a href="#/document?doc=design-system&from=design-system">Read Design System Markdown</a></section>
      <section><span>CATALOG</span><p>${tokenSource.tokens.length} tokens · ${catalogSummary.total} entries</p></section>
      ${
        kind === "components"
          ? `<section><span>SPECIMEN COVERAGE</span><p>${specimenCoverage.components}/30 controlled specimens · ${specimenCoverage.variants} declared variants · ${specimenCoverage.states} declared scenarios</p><small>Completion is judged by legal state coverage, independent field behavior, keyboard operation, responsive preservation and markup parity—not raw counts.</small></section>`
          : ""
      }
    </aside>
  `;
}

function bindCatalogSearch(container) {
  const search = container.querySelector("#dsCatalogSearch");
  const count = container.querySelector("#dsSearchCount");
  const catalog = container.querySelector(".ds-catalog");
  const entries = [...container.querySelectorAll("[data-catalog-entry]")];
  const groups = [...container.querySelectorAll("[data-catalog-group]")];
  const applyFilter = () => {
    const query = search.value.trim().toLocaleLowerCase("zh-CN");
    catalogUiState.query = search.value;
    catalog?.classList.toggle("searching", Boolean(query));
    let visible = 0;
    entries.forEach((entry) => {
      const match = !query || entry.dataset.searchText.includes(query);
      entry.hidden = !match;
      if (match) visible += 1;
    });
    groups.forEach((group) => {
      group.hidden = !group.querySelector("[data-catalog-entry]:not([hidden])");
    });
    if (count) count.textContent = `${visible} items`;
  };
  search?.addEventListener("input", applyFilter);
  catalog?.addEventListener(
    "scroll",
    () => {
      catalogUiState.scrollTop = catalog.scrollTop;
    },
    { passive: true },
  );
  applyFilter();
}

function bindThemeControls(container) {
  const update = (theme) => {
    const safeTheme = theme === "neutral" ? "neutral" : "eix";
    document.body.dataset.theme = safeTheme;
    container.querySelectorAll("[data-ds-theme]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.dsTheme === safeTheme));
    });
    try {
      localStorage.setItem("eix-theme", safeTheme);
    } catch {
      // Theme persistence is optional.
    }
    document.dispatchEvent(
      new CustomEvent("eix-theme-change", {
        detail: { theme: safeTheme },
      }),
    );
  };
  container.querySelectorAll("[data-ds-theme]").forEach((button) => {
    button.addEventListener("click", () => update(button.dataset.dsTheme));
  });
  update(document.body.dataset.theme || "eix");

  const updateMode = (mode) => {
    const safeMode = mode === "dark" ? "dark" : "light";
    document.body.dataset.mode = safeMode;
    container.querySelectorAll("[data-ds-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.dsMode === safeMode));
    });
    try {
      localStorage.setItem("eix-mode", safeMode);
    } catch {
      // Mode persistence is optional.
    }
    document.dispatchEvent(
      new CustomEvent("eix-mode-change", {
        detail: { mode: safeMode },
      }),
    );
  };
  container.querySelectorAll("[data-ds-mode]").forEach((button) => {
    button.addEventListener("click", () => updateMode(button.dataset.dsMode));
  });
  updateMode(document.body.dataset.mode || "light");
}

function bindSpecimenInteractions(container, spec) {
  container.querySelectorAll("[data-component-state]").forEach((button) => {
    button.addEventListener("click", () => {
      specimenState.set(spec.id, button.dataset.componentState);
      const host = container.querySelector("#dsComponentSpecimen");
      if (host) host.innerHTML = componentSpecimen(spec, button.dataset.componentState);
      container.querySelectorAll("[data-component-state]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      bindLiveControls(container);
    });
  });
  container.querySelector("[data-copy-markup]")?.addEventListener("click", async (event) => {
    const code = container.querySelector(".ds-code-block code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
      event.currentTarget.textContent = "Copied";
    } catch {
      event.currentTarget.textContent = "Select code";
    }
  });
  bindLiveControls(container);
}

function bindLiveControls(container) {
  container.querySelector("[data-motion-demo]")?.addEventListener("click", () => {
    const target = container.querySelector("[data-motion-target]");
    target?.classList.remove("replay");
    requestAnimationFrame(() => target?.classList.add("replay"));
  });
  container.querySelector("[data-overlay-demo]")?.addEventListener("click", () => {
    const panel = container.querySelector("[data-overlay-panel]");
    if (panel) {
      panel.hidden = false;
      panel.querySelector("button")?.focus();
    }
  });
  container.querySelector("[data-overlay-close]")?.addEventListener("click", () => {
    const panel = container.querySelector("[data-overlay-panel]");
    if (panel) {
      panel.hidden = true;
      container.querySelector("[data-overlay-demo]")?.focus();
    }
  });
  container.querySelector("[data-hidden-announce]")?.addEventListener("click", () => {
    const live = container.querySelector("[data-hidden-live]");
    const visible = container.querySelector("[data-hidden-visible]");
    if (live) live.textContent = "Local check complete. No external action.";
    if (visible) visible.textContent = "Check complete · announcement sent to assistive technology.";
  });
  const disclosure = container.querySelector("[data-ref-disclosure]");
  disclosure?.addEventListener("click", () => {
    const content = disclosure.nextElementSibling;
    const expanded = disclosure.getAttribute("aria-expanded") === "true";
    disclosure.setAttribute("aria-expanded", String(!expanded));
    if (content) content.hidden = expanded;
  });
  const menuTrigger = container.querySelector("[data-ref-menu-trigger]");
  menuTrigger?.addEventListener("click", () => {
    const menu = menuTrigger.nextElementSibling;
    const expanded = menuTrigger.getAttribute("aria-expanded") === "true";
    menuTrigger.setAttribute("aria-expanded", String(!expanded));
    if (menu) menu.hidden = expanded;
    if (!expanded) menu?.querySelector("[role=menuitem]")?.focus();
  });
  container.querySelectorAll("[data-ref-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const overlay = container.querySelector(`[data-ref-overlay="${button.dataset.refOpen}"]`);
      if (overlay) overlay.hidden = false;
      overlay?.querySelector("button")?.focus();
    });
  });
  container.querySelectorAll("[data-ref-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const overlay = button.closest("[data-ref-overlay]");
      if (overlay) overlay.hidden = true;
      container.querySelector(`[data-ref-open="${overlay?.dataset.refOverlay}"]`)?.focus();
    });
  });
  container.querySelector("[data-ref-toast-show]")?.addEventListener("click", () => {
    const toast = container.querySelector(".ref-toast");
    if (toast) toast.hidden = false;
  });
  container.querySelector("[data-ref-toast-hide]")?.addEventListener("click", () => {
    const toast = container.querySelector(".ref-toast");
    if (toast) toast.hidden = true;
  });
  const tabButtons = [...container.querySelectorAll(".ref-tabs [role=tab]")];
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((item) => item.setAttribute("aria-selected", String(item === button)));
      const panel = container.querySelector(".ref-tabs [role=tabpanel]");
      if (panel) panel.textContent = `${button.textContent} panel for the same Work Object.`;
    });
  });
  const segments = [...container.querySelectorAll(".ref-segments button")];
  segments.forEach((button) => {
    button.addEventListener("click", () => {
      segments.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    });
  });
}

export function initializeDesignSystemTheme() {
  let theme = "eix";
  let mode = "light";
  try {
    const saved = localStorage.getItem("eix-theme");
    if (saved === "neutral" || saved === "eix") theme = saved;
    const savedMode = localStorage.getItem("eix-mode");
    if (savedMode === "light" || savedMode === "dark") mode = savedMode;
  } catch {
    // Theme persistence is optional.
  }
  document.body.dataset.theme = theme;
  document.body.dataset.mode = mode;
}

export async function renderDesignSystemRoute(container) {
  const previousCatalog = container.querySelector(".ds-catalog");
  const hadPreviousCatalog = Boolean(previousCatalog);
  if (previousCatalog) {
    catalogUiState.scrollTop = previousCatalog.scrollTop;
    catalogUiState.query = container.querySelector("#dsCatalogSearch")?.value || catalogUiState.query;
  }

  const tokenSource = await loadTokenSource();
  const { kind, id } = parseDesignSystemPath(currentDesignSystemPath());
  let spec = null;
  let content = renderOverview();
  if (kind && id) {
    spec = findDesignSystemEntry(kind, id);
    if (!spec) {
      history.replaceState(null, "", "#/design-system");
    } else if (kind === "foundations") {
      content = renderFoundationDetail(spec, tokenSource);
    } else if (kind === "primitives") {
      content = renderPrimitiveDetail(spec);
    } else {
      content = renderComponentDetail(spec);
    }
  }

  container.innerHTML = `
    <div class="ds-reference-shell">
      <div class="ds-mobile-tools" aria-label="Design System移动面板">
        <button type="button" data-ds-mobile-panel="catalog" aria-controls="dsCatalogPanel" aria-expanded="false">Catalog</button>
        <button type="button" data-ds-mobile-panel="inspector" aria-controls="dsInspectorPanel" aria-expanded="false">Spec info</button>
      </div>
      <button class="ds-mobile-backdrop" type="button" aria-label="关闭Design System面板" hidden></button>
      ${renderCatalogNavigation(kind, id, catalogUiState.query).replace('class="ds-catalog"', 'id="dsCatalogPanel" class="ds-catalog"')}
      <main class="ds-reference-main">${content}</main>
      ${inspectorHtml(kind, spec || { maturity: "Candidate Standard", relatedIds: [] }, tokenSource).replace('class="ds-inspector"', 'id="dsInspectorPanel" class="ds-inspector"')}
    </div>
  `;

  bindCatalogSearch(container);
  bindThemeControls(container);
  bindMobilePanels(container);
  if (kind === "components" && spec) bindSpecimenWorkbench(container, spec);
  else if (kind === "primitives" && spec) bindPrimitiveWorkbench(container, spec);
  else bindLiveControls(container);

  window.requestAnimationFrame(() => {
    const catalog = container.querySelector(".ds-catalog");
    if (!catalog) return;
    if (hadPreviousCatalog) {
      catalog.scrollTop = catalogUiState.scrollTop;
      return;
    }
    const activeEntry = catalog.querySelector("[data-catalog-entry].active");
    if (activeEntry) {
      const targetTop = activeEntry.offsetTop - catalog.clientHeight / 2 + activeEntry.clientHeight / 2;
      catalog.scrollTop = Math.max(0, targetTop);
      catalogUiState.scrollTop = catalog.scrollTop;
    }
  });
  return { kind, id, spec };
}

export function searchDesignSystem(query) {
  return searchCatalog(query, "design-system");
}

function bindMobilePanels(container) {
  const shell = container.querySelector(".ds-reference-shell");
  const backdrop = container.querySelector(".ds-mobile-backdrop");
  const buttons = [...container.querySelectorAll("[data-ds-mobile-panel]")];
  let returnFocus = null;

  const close = () => {
    shell?.classList.remove("mobile-catalog-open", "mobile-inspector-open");
    buttons.forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (backdrop) backdrop.hidden = true;
    returnFocus?.focus();
    returnFocus = null;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.dataset.dsMobilePanel;
      const isOpen = shell?.classList.contains(`mobile-${panel}-open`);
      close();
      if (isOpen) return;
      returnFocus = button;
      shell?.classList.add(`mobile-${panel}-open`);
      button.setAttribute("aria-expanded", "true");
      if (backdrop) backdrop.hidden = false;
      const target = container.querySelector(`#${button.getAttribute("aria-controls")}`);
      target?.querySelector("input, button, a")?.focus();
    });
  });
  backdrop?.addEventListener("click", close);
  container.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop?.hidden) close();
  });
}
