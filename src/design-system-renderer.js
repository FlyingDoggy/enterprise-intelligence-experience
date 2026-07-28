import { catalogRegistry, catalogSummary, findCatalogEntry, searchCatalog } from "./catalog.js";
import { components, findDesignSystemEntry, foundations, primitives } from "./design-system-data.js";
import { specimenCoverage } from "./specimens/index.js";
import {
  bindSpecimenWorkbench,
  specimenReferenceMarkupHtml,
  specimenWorkbenchHtml,
} from "./specimens/runtime.js";
import { componentLabel, uiLabel } from "./locales/zh-CN.js";
import { mockBrowserFrameHtml } from "./mock-browser-frame.js";

let tokenSourcePromise;
const specimenState = new Map();
const primitiveState = new Map();
const catalogUiState = {
  query: "",
  scrollTop: 0,
};

const colorFamilyLabels = Object.freeze({
  neutral: "中性色",
  blue: "蓝色",
  teal: "青绿色",
  amber: "琥珀色",
  red: "红色",
  violet: "紫色",
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function list(items, className = "") {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(uiLabel(item))}</li>`).join("")}</ul>`;
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
    ["foundations", "基础规范", foundations],
    ["primitives", "布局基础件", primitives],
    ["components", "通用组件", components],
  ];

  return `
    <nav class="ds-catalog" aria-label="设计系统目录">
      <div class="ds-search-field">
        <label for="dsCatalogSearch">搜索目录</label>
        <input id="dsCatalogSearch" type="search" value="${escapeHtml(query)}" placeholder="颜色、按钮、表格……" autocomplete="off" />
        <span id="dsSearchCount">${catalogSummary.foundations + catalogSummary.primitives + catalogSummary.components}项</span>
      </div>
      <a class="ds-overview-link ${!activeKind ? "active" : ""}" href="#/design-system">
        <span>00</span><b>系统总览</b>
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
                        data-search-text="${escapeHtml(`${item.id} ${item.title} ${componentLabel(item)} ${item.cn || ""} ${item.category || ""}`.toLocaleLowerCase("zh-CN"))}"
                        class="${activeKind === kind && activeId === item.id ? "active" : ""}"
                      >
                        <span>${escapeHtml(componentLabel(item))}</span>
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
          title: "系统总览",
          id: "overview",
          kind: "overview",
        };
  const next = entries[index + 1] || null;
  const itemLink = (entry, direction) => {
    if (!entry) {
      return `<span class="ds-sequence-empty" aria-hidden="true"></span>`;
    }
    return `
      <a href="#${escapeHtml(entry.route)}" rel="${direction === "上一项" ? "prev" : "next"}">
        <span>${direction}</span>
        <b>${escapeHtml(entry.id === "overview" ? entry.title : componentLabel(entry.id))}</b>
      </a>
    `;
  };

  return `
    <nav class="ds-sequence-nav" aria-label="连续浏览设计系统目录">
      ${itemLink(previous, "上一项")}
      <span class="ds-sequence-position"><b>${String(index + 1).padStart(2, "0")}</b> / ${entries.length}</span>
      ${itemLink(next, "下一项")}
    </nav>
  `;
}

function layerTrace(activeLayer = "core") {
  const layers = [
    ["foundation", "基础规范", "值与尺度"],
    ["primitive", "布局基础件", "布局与行为"],
    ["component", "通用组件", "通用任务控件"],
    ["guidance", "智能协作模式", "人机协作约定"],
  ];
  return `
    <div class="ds-layer-trace" aria-label="设计系统依赖方向">
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
          <p class="eyebrow">02 · 候选平台标准 · 修订0.5</p>
          <h1>统一设计变量、布局、组件状态和无障碍要求，<br />支持不同<em>企业人工智能</em>场景。</h1>
          <p class="ds-lead">
            核心设计系统只定义可复用的视觉、布局、状态和交互约定。
            Process Intelligence 与 Collaborative Intelligence 的业务责任由体验设计指导定义，不写进按钮或卡片。
          </p>
        </div>
        <div class="ds-status-stamp">
          <span>参考页面</span>
          <strong>静态实现</strong>
          <small>规范修订0.5 · 尚无组件包接口</small>
        </div>
      </header>
      ${layerTrace()}
      <section id="ds-boundary" class="ds-doc-section" data-section-title="系统边界">
        <div class="ds-section-heading">
          <span>系统边界</span>
          <h2>业务交互模式复用通用组件，<br />基础组件不持有业务生命周期。</h2>
        </div>
        <div class="ds-boundary-grid">
          <article>
            <span>核心设计系统</span>
            <h3>界面如何一致地构建</h3>
            <p>设计变量、字体、布局、按钮、表格、对话框与应用框架。</p>
          </article>
          <article>
            <span>智能协作体验设计指导</span>
            <h3>人和人工智能如何共同工作</h3>
            <p>目标、依据、决策、业务操作、业务成效、异常与工作交接。</p>
          </article>
        </div>
      </section>
      <section id="ds-inventory" class="ds-doc-section" data-section-title="系统清单">
        <div class="ds-section-heading">
          <span>目录覆盖</span>
          <h2>从值到页面组合的可检查目录。</h2>
        </div>
        <div class="ds-count-grid">
          <a href="#/design-system/foundations/color"><strong>${catalogSummary.foundations}</strong><span>基础规范</span><small>用途、尺度与语义设计变量</small></a>
          <a href="#/design-system/primitives/surface"><strong>${catalogSummary.primitives}</strong><span>布局基础件</span><small>布局、焦点与浮层行为</small></a>
          <a href="#/design-system/components/button"><strong>${catalogSummary.components}</strong><span>通用组件</span><small>通用任务控件与状态</small></a>
          <a href="#/guidance"><strong>${catalogSummary.guidance + catalogSummary.compositions}</strong><span>交互模式</span><small>在体验设计指导中完成组合</small></a>
        </div>
      </section>
      <section id="ds-themes" class="ds-doc-section" data-section-title="主题">
        <div class="ds-section-heading">
          <span>语义主题</span>
          <h2>中性内核，EIX是第一套主题。</h2>
        </div>
        <div class="ds-theme-comparison">
          <article data-theme-preview="neutral">
            <header><span>中性主题</span><small>品牌中性的语义</small></header>
            <div><button type="button">主要操作</button><span>辅助状态</span></div>
          </article>
          <article data-theme-preview="eix">
            <header><span>EIX主题</span><small>财务工作底稿</small></header>
            <div><button type="button">主要操作</button><span>辅助状态</span></div>
          </article>
        </div>
        <p class="ds-note">主题改变视觉值，不改变组件结构、业务含义或工作对象状态。</p>
      </section>
      <section id="ds-promotion" class="ds-doc-section" data-section-title="工程化门槛">
        <div class="ds-section-heading">
          <span>工程化门槛</span>
          <h2>当前交付是实现参考和验收契约，<br />尚未发布生产组件包。</h2>
        </div>
        <div class="ds-promotion">
          <ol>
            <li><b>现在</b><span>设计变量源、参考标记、交互示例、响应式和验收规则。</span></li>
            <li><b>触发条件</b><span>至少两个真实消费者使用相同组件契约，且没有领域分支。</span></li>
            <li><b>下一阶段</b><span>@eix/tokens、@eix/ui、接口版本、组件测试与迁移机制。</span></li>
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
        <section class="ds-color-ramps" aria-label="基础色阶">
          ${[...rampGroups.entries()]
            .map(
              ([family, tokens]) => `
                <article class="ds-color-ramp">
                  <header><strong>${escapeHtml(colorFamilyLabels[family] || family)}</strong><span>基础色阶 · 组件不得直接使用</span></header>
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
            <div><span>语义用途</span><h3>组件只使用用途设计变量。</h3></div>
            <p>主题改变品牌表达，明暗模式改变颜色映射；两者都不能改变组件结构或业务语义。</p>
          </header>
          <div role="table" aria-label="语义颜色用途">
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
          <p><b>强调色</b>只表达交互、选中与变化，不表达依据、风险、权限或工作状态。</p>
          <p><b>语义状态</b>必须同时显示字段名称、文字或符号；有利和不利等业务方向不能只靠红绿。</p>
          <p><b>深色模式</b>使用同一套语义约定；组件结构和业务状态保持一致。</p>
        </div>
      </div>
    `;
  }
  if (spec.id === "typography") {
    return `
      <div class="ds-type-specimen">
        <div class="ds-type-role ds-type-role--display">
          <span>大型叙事标题 · MBCorpoATitle 400</span>
          <h2>人工控制始终可见。<small>Human control stays visible.</small></h2>
        </div>
        <div class="ds-type-role ds-type-role--heading">
          <span>页面与组件标题 · MBCorpoSTitle 700</span>
          <h3>依据先于结论，责任先于执行。</h3>
        </div>
        <div class="ds-type-role ds-type-role--body">
          <span>正文与中英混排 · MBCorpoSText / 中文回退 · 17/1.65</span>
          <p>界面持续显示目标、上下文、状态、负责人和修订版本。Process Intelligence 与 Collaborative Intelligence 共享同一套可理解、可检查的工作语言。</p>
        </div>
        <div class="ds-type-role ds-type-role--numeric" data-font-numeric-specimen>
          <span>数据 · MBCorpoSText · tabular-nums + lining-nums</span>
          <div aria-label="等宽数字对照">
            <b>¥1,111,111.00</b><b>¥8,888,888.00</b>
            <b>−8.1%</b><b>+12.4pp</b>
            <b>FY26 YTD</b><b>2026-07-28 15:42</b>
          </div>
          <p><strong>Roboto结论：</strong>MB字体已提供tnum与lnum特性，当前不加载Roboto；只有浏览器实测失败时才启用数字专用回退。</p>
        </div>
        <div class="ds-type-role ds-type-role--utility">
          <span>工具文字 · JetBrains Mono / 系统等宽字体</span>
          <code>RESULT-26-0728 · REV 05 · QUERY 8F31</code>
        </div>
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
        <aside>导航</aside><main>主要工作区</main><aside>上下文</aside>
      </div>
      <p class="ds-note">缩小视口时上下文先转为抽屉，主要工作区保持连续。</p>
    `;
  }
  if (spec.id === "borders-radius" || spec.id === "elevation") {
    return `
      <div class="ds-box-specimen">
        <div class="flat"><span>无层级</span><p>结构内容</p></div>
        <div class="outlined"><span>描边</span><p>可操作区域</p></div>
        <div class="raised"><span>浮起</span><p>临时浮层</p></div>
      </div>
    `;
  }
  if (spec.id === "motion") {
    return `
      <div class="ds-motion-specimen">
        <button type="button" data-motion-demo>重放状态变化</button>
        <div data-motion-target><span>意图变更</span><strong>范围已更新</strong></div>
      </div>
    `;
  }
  if (spec.id === "iconography") {
    return `
      <div class="ds-icon-specimen">
        <span><b aria-hidden="true">←</b>返回</span>
        <span><b aria-hidden="true">＋</b>添加</span>
        <span><b aria-hidden="true">×</b>关闭</span>
        <span><b aria-hidden="true">!</b>注意</span>
      </div>
    `;
  }
  if (spec.id === "data-display") {
    return `
      <div class="ds-data-viz">
        <header>
          <div><span>分析结果 · 排名</span><strong>对象A是当前范围内的最大值。</strong></div>
          <b>已核验</b>
        </header>
        <p class="ds-data-viz__scope">{指标} · {期间} · {版本} · {单位} · 更新于{时间}</p>
        <div class="ds-data-viz__plot" role="img" aria-label="四个占位对象按值从高到低排列，对象A最高。">
          <div><span>对象A</span><i style="--bar: 92%; --bar-color: var(--eix-viz-emphasis-primary)"></i><strong>92</strong></div>
          <div><span>对象B</span><i style="--bar: 71%"></i><strong>71</strong></div>
          <div><span>对象C</span><i style="--bar: 58%"></i><strong>58</strong></div>
          <div><span>对象D</span><i style="--bar: 43%"></i><strong>43</strong></div>
        </div>
        <footer>
          <span>图形 · 数据表 · 解释</span>
          <a href="./design-system/collaborative-visualization/samples/index.html">打开完整交互参考 →</a>
        </footer>
      </div>
    `;
  }
  if (spec.id === "accessibility-localization") {
    return `
      <div class="ds-accessibility-specimen">
        <button type="button">按 Tab 键到这里查看焦点</button>
        <p lang="zh-CN">2027财年至今实际值为 <strong>1,248.50&nbsp;MRMB</strong>，更新于2027年7月25日。</p>
        <div role="status">状态变化会通过实时播报区域同步给辅助技术。</div>
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
        <div><p class="eyebrow">设计系统 · 基础规范</p><h1>${escapeHtml(componentLabel(spec))}</h1><p>${escapeHtml(spec.purpose)}</p></div>
        <span class="ds-maturity">候选 · 修订0.5</span>
      </header>
      ${sequenceNavigation("foundations", spec.id)}
      ${layerTrace("foundation")}
      <section id="purpose" class="ds-doc-section" data-section-title="用途">
        <div class="ds-section-heading"><span>用途</span><h2>使用原则</h2></div>
        ${list(spec.principles, "ds-rule-list")}
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="交互示例">
        <div class="ds-section-heading"><span>交互示例</span><h2>在页面、控件和状态示例中<br />检查设计变量的实际效果。</h2></div>
        ${mockBrowserFrameHtml(`<div class="ds-live-stage">${foundationPreview(spec, tokenSource)}</div>`, {
          title: `${componentLabel(spec)}在界面中的实际效果`,
          address: `eix.template/design-system/foundations/${spec.id}`,
          status: "基础规范样机 · 主题可切换",
          principles: ["视觉角色一致", "内容优先", "无障碍可检验"],
          className: "design-system-browser",
        })}
      </section>
      <section id="examples" class="ds-doc-section" data-section-title="示例">
        <div class="ds-section-heading"><span>参考</span><h2>系统约定</h2></div>
        <div class="ds-two-column"><div><h3>示例</h3>${list(spec.examples)}</div><div><h3>验收要求</h3>${list(spec.acceptance)}</div></div>
      </section>
      ${
        spec.resourceLinks?.length
          ? `<section id="implementation-resources" class="ds-doc-section" data-section-title="交付文件">
              <div class="ds-section-heading"><span>交付文件</span><h2>设计和开发使用同一套数据表达契约。</h2></div>
              <div class="ds-resource-grid">
                ${spec.resourceLinks
                  .map(
                    (resource) => `
                      <a href="${escapeHtml(resource.href)}">
                        <strong>${escapeHtml(resource.label)}</strong>
                        <span>${escapeHtml(resource.description)}</span>
                      </a>
                    `,
                  )
                  .join("")}
              </div>
            </section>`
          : ""
      }
      <section id="tokens" class="ds-doc-section" data-section-title="设计变量">
        <div class="ds-section-heading"><span>设计变量</span><h2>相关设计变量</h2></div>
        ${
          tokens.length
            ? `<div class="ds-token-table">${tokens
                .map(
                  (token) => `
                    <div><code>${escapeHtml(token.path)}</code><span>${escapeHtml(token.defaultValue)}</span><small>${escapeHtml(token.description)}</small></div>
                  `,
                )
                .join("")}</div>`
            : `<p class="ds-note">该基础规范目前以规则约束为主，进入生产包阶段后补充专用设计变量。</p>`
        }
      </section>
    </article>
  `;
}

function primitivePreview(spec, variant) {
  const item = (label, className = "") => `<div class="${className}"><span>${escapeHtml(label)}</span></div>`;
  const previews = {
    surface: `<div class="ds-primitive-surface is-${escapeHtml(variant)}">${item(`${uiLabel(variant)}表面`, variant)}<p>子内容沿用当前表面的对比度约定。</p></div>`,
    stack: `<div class="ds-primitive-stack is-${escapeHtml(variant)}">${item("第一项")}${item("第二项")}${item("第三项")}</div>`,
    inline: `<div class="ds-primitive-inline is-${escapeHtml(variant)}">${item("起始项")}${item("中间项")}${item("末尾项")}</div>`,
    grid: `<div class="ds-primitive-grid is-${escapeHtml(variant)}">${item("A")}${item("B")}${item("C")}${item("D")}</div>`,
    cluster: `<div class="ds-primitive-cluster is-${escapeHtml(variant)}">${item("筛选项一")}${item("筛选项二")}${item("较长的可选项")}${item("操作")}</div>`,
    "scroll-area": `<div class="ds-primitive-scroll is-${escapeHtml(variant)}" tabindex="0" role="region" aria-label="${escapeHtml(uiLabel(variant))}滚动区域">${Array.from({ length: 12 }, (_, index) => item(`项目 ${index + 1}`)).join("")}</div>`,
    "focus-ring": `<div class="ds-primitive-focus is-${escapeHtml(variant)}"><button type="button" autofocus>键盘焦点目标</button><p>${escapeHtml(uiLabel(variant))}对比度环境</p></div>`,
    "visually-hidden": {
      label: `<div class="ds-primitive-hidden"><button type="button"><span aria-hidden="true">依</span><span class="visually-hidden">打开依据回执</span></button><p>隐藏文本提供无障碍名称。</p></div>`,
      description: `<div class="ds-primitive-hidden"><button type="button" aria-describedby="hidden-description">发布修订版本</button><span id="hidden-description" class="visually-hidden">向选定受众发布当前已校验的修订版本。</span><p>隐藏文本提供补充说明。</p></div>`,
      "live announcement": `<div class="ds-primitive-hidden"><button type="button" data-hidden-announce>运行本地检查</button><span class="visually-hidden" aria-live="polite" data-hidden-live></span><p data-hidden-visible>尚无播报。</p></div>`,
    }[variant],
    "overlay-portal": `<div class="ds-primitive-overlay is-${escapeHtml(variant)}"><button type="button" data-overlay-demo>打开${escapeHtml(uiLabel(variant))}层</button><div data-overlay-panel hidden ${variant === "modal" ? 'role="dialog" aria-modal="true" aria-labelledby="primitive-overlay-title"' : 'role="region" aria-label="补充信息层"'}><strong id="primitive-overlay-title">${variant === "modal" ? "模态任务" : "非模态上下文"}</strong><p>${variant === "modal" ? "任务关闭前，焦点保持在浮层内。" : "底层内容仍可操作。"}</p><button type="button" data-overlay-close>关闭</button></div></div>`,
  };
  return previews[spec.id] || item(componentLabel(spec));
}

function renderPrimitiveDetail(spec) {
  const selectedVariant = spec.variants.includes(primitiveState.get(spec.id))
    ? primitiveState.get(spec.id)
    : spec.variants[0];
  primitiveState.set(spec.id, selectedVariant);
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div><p class="eyebrow">设计系统 · 布局基础件</p><h1>${escapeHtml(componentLabel(spec))}</h1><p>${escapeHtml(spec.purpose)}</p></div>
        <span class="ds-maturity">候选约定 · 静态预览</span>
      </header>
      ${sequenceNavigation("primitives", spec.id)}
      ${layerTrace("primitive")}
      <section id="anatomy" class="ds-doc-section" data-section-title="结构">
        <div class="ds-section-heading"><span>结构</span><h2>组成与变体</h2></div>
        <div class="ds-two-column"><div><h3>组成</h3>${list(spec.anatomy)}</div><div><h3>变体</h3>${list(spec.variants)}</div></div>
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="交互示例">
        <div class="ds-section-heading"><span>交互示例 · 全部变体</span><h2>每个变体都会改变实际布局或无障碍语义。</h2></div>
        <div class="ds-specimen-toolbar" role="group" aria-label="${escapeHtml(componentLabel(spec))}变体">
          ${spec.variants
            .map(
              (variant) =>
                `<button type="button" data-primitive-variant="${escapeHtml(variant)}" aria-pressed="${String(variant === selectedVariant)}">${escapeHtml(uiLabel(variant))}</button>`,
            )
            .join("")}
        </div>
        ${mockBrowserFrameHtml(
          `<div class="ds-live-stage" data-primitive-stage="${escapeHtml(spec.id)}">${primitivePreview(spec, selectedVariant)}</div>`,
          {
            title: `${componentLabel(spec)}的布局与行为`,
            address: `eix.template/design-system/primitives/${spec.id}`,
            status: "布局基础件样机 · 变体可切换",
            principles: ["布局职责单一", "不持有业务状态", "响应式能力等价"],
            className: "design-system-browser",
          },
        )}
        <p class="ds-note" aria-live="polite">当前变体 · <b data-primitive-current>${escapeHtml(uiLabel(selectedVariant))}</b></p>
      </section>
      <section id="usage" class="ds-doc-section" data-section-title="使用规则">
        <div class="ds-section-heading"><span>依赖边界</span><h2>布局基础件不拥有业务状态。</h2></div>
        <p class="ds-note">布局基础件可以被通用组件和智能协作模式组合，但不得把依据、权限或工作状态写入自身接口。</p>
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
    if (current) current.textContent = uiLabel(variant);
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
    button: `<button type="button" class="eix-ref-button">发布修订版本</button>`,
    badge: `<span class="eix-ref-badge"><span>工作状态</span> 草稿</span>`,
    callout: `<aside class="eix-ref-callout" role="status"><strong>依据已变化</strong><p>请重新运行发布校验。</p></aside>`,
    table: `<table class="eix-ref-table"><caption>支撑数据 · MRMB</caption>…</table>`,
    dialog: `<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">…</div>`,
    "text-field": `<label>对象标题<input type="text" aria-describedby="title-hint"></label>`,
    "application-shell": `<div class="eix-ref-shell"><header>…</header><nav>…</nav><main>…</main></div>`,
  };
  return markup[id] || `<div class="eix-ref-${id}">${componentLabel(id)}参考内容</div>`;
}

function componentSpecimen(spec, state) {
  const disabled = stateIs(state, "disabled") ? "disabled" : "";
  const loading = stateIs(state, "loading") || stateIs(state, "busy");
  const error = stateIs(state, "error");
  switch (spec.specimenKind) {
    case "typography":
      return `<div class="ref-type"><h2>可验证的工作结果</h2><p>主要文字解释当前对象；辅助文字说明范围与限制。</p><small>修订版本 · 03 / 07</small></div>`;
    case "link":
      return `<p class="ref-copy">查看<a href="#/guidance/shared/S04">依据回执</a>，或返回当前工作对象。</p>`;
    case "button":
      return `<div class="ref-actions"><button type="button" ${disabled} ${loading ? 'aria-busy="true"' : ""}>${loading ? "正在发布…" : "发布修订版本"}</button><button type="button" class="secondary" ${disabled}>保存草稿</button><button type="button" class="danger" ${disabled}>撤回</button></div>`;
    case "icon-button":
      return `<div class="ref-actions"><button type="button" class="icon" aria-label="返回上一页">←</button><button type="button" class="icon" aria-label="添加项目">＋</button><button type="button" class="icon" aria-label="关闭">×</button></div>`;
    case "badge":
      return `<div class="ref-badges"><span><i></i>工作状态 · 草稿</span><span class="verified"><i></i>依据 · 已核验</span><span class="warning"><i></i>风险 · 可撤销</span><span class="blocking"><i></i>权限 · 拒绝</span></div>`;
    case "callout":
      return `<div class="ref-callout ${error ? "blocking" : ""}" role="status"><span>${error ? "已阻断" : "需要关注"}</span><strong>${error ? "权限被拒绝" : "依据快照已变化"}</strong><p>${error ? "取得正确范围后才能继续。" : "已核验结果会保留；请重新运行发布校验。"}</p><button type="button">${error ? "查看管控策略" : "重新校验"}</button></div>`;
    case "card":
      return `<article class="ref-card" tabindex="0"><span>工作对象</span><h3>分析文档 · r4</h3><p>一项责任、一个可见状态、一个明确的下一步。</p><a href="#/guidance/collaborative/C02">查看设计指导 →</a></article>`;
    case "divider":
      return `<div class="ref-divider"><p>主要内容</p><hr><p>辅助内容</p></div>`;
    case "tabs":
      return `<div class="ref-tabs"><div role="tablist"><button role="tab" aria-selected="true">概览</button><button role="tab" aria-selected="false">依据</button><button role="tab" aria-selected="false">历史记录</button></div><section role="tabpanel">同一工作对象的概览面板。</section></div>`;
    case "segmented":
      return `<div class="ref-segments" role="group" aria-label="阅读密度"><button type="button" aria-pressed="true">快速阅读</button><button type="button" aria-pressed="false">完整规范</button></div>`;
    case "disclosure":
      return `<div class="ref-disclosure"><button type="button" aria-expanded="false" data-ref-disclosure>显示限制 <span>＋</span></button><div hidden>缺少所需基准，因此无法进行归因分析。</div></div>`;
    case "tooltip":
      return `<div class="ref-tooltip"><button type="button" aria-describedby="ref-tooltip-content">依</button><span id="ref-tooltip-content" role="tooltip">打开依据回执</span></div>`;
    case "menu":
      return `<div class="ref-menu"><button type="button" aria-expanded="false" data-ref-menu-trigger>更多操作 ▾</button><div role="menu" hidden><button role="menuitem">创建分支</button><button role="menuitem">复制链接</button><button role="menuitem">查看历史记录</button></div></div>`;
    case "dialog":
      return `<div class="ref-overlay-launch"><button type="button" data-ref-open="dialog">打开确认框</button><div class="ref-overlay" data-ref-overlay="dialog" hidden><div role="dialog" aria-modal="true" aria-labelledby="ref-dialog-title"><span>业务操作预览</span><h3 id="ref-dialog-title">发布这个修订版本？</h3><p>发布会改变受众可见的状态；本示例未连接外部系统。</p><div><button type="button" data-ref-close>取消</button><button type="button" data-ref-close>发布</button></div></div></div></div>`;
    case "drawer":
      return `<div class="ref-overlay-launch"><button type="button" data-ref-open="drawer">打开检查面板</button><div class="ref-overlay drawer" data-ref-overlay="drawer" hidden><div role="dialog" aria-modal="true" aria-labelledby="ref-drawer-title"><span>上下文抽屉</span><h3 id="ref-drawer-title">依据检查面板</h3><p>无需离开当前工作对象即可查看补充上下文。</p><button type="button" data-ref-close>关闭检查面板</button></div></div></div>`;
    case "field":
      return `<label class="ref-field"><span>对象标题</span><input type="text" value="${error ? "A" : "季度分析"}" ${disabled} aria-invalid="${error}" aria-describedby="ref-field-note"><small id="ref-field-note">${error ? "至少输入 3 个字符。" : "协作者可见。"}</small></label>`;
    case "textarea":
      return `<label class="ref-field"><span>决策理由</span><textarea rows="4" ${disabled}>现有依据支持在已批准范围内采用所选方案。</textarea><small>说明选择该方案的理由。</small></label>`;
    case "select":
      return `<label class="ref-field"><span>受众</span><select ${disabled}><option>财务管理层</option><option>流程负责人</option><option>工作团队</option></select><small>受众权限需要单独校验。</small></label>`;
    case "checkbox":
      return `<div class="ref-checks"><label><input type="checkbox" checked ${disabled}> 包含支撑数据</label><label><input type="checkbox" ${disabled}> 发布后通知负责人</label></div>`;
    case "switch":
      return `<label class="ref-switch"><input type="checkbox" role="switch" checked ${disabled}><span></span><b>显示依据编号</b></label>`;
    case "table":
      return `<div class="ref-table-wrap" tabindex="0" role="region" aria-label="可滚动的支撑数据"><table><caption>支撑数据 · FY27 YTD · MRMB</caption><thead><tr><th>对象</th><th>实际</th><th>计划</th><th>偏差</th></tr></thead><tbody><tr><td>样例 A</td><td>1,248</td><td>1,310</td><td>−62</td></tr><tr><td>样例 B</td><td>982</td><td>970</td><td>+12</td></tr><tr><td>样例 C</td><td>—</td><td>760</td><td>暂无数据</td></tr></tbody></table></div>`;
    case "progress":
      return `<div class="ref-progress"><label for="ref-progress">已校验步骤 · 3 / 5</label><progress id="ref-progress" value="3" max="5">60%</progress><span>还有 2 个条件步骤。</span></div>`;
    case "spinner":
      return `<div class="ref-spinner" role="status"><i aria-hidden="true"></i><span>正在加载参考数据…</span></div>`;
    case "skeleton":
      return `<div class="ref-skeleton" aria-hidden="true"><i></i><i></i><i></i></div><span class="visually-hidden">正在加载参考内容</span>`;
    case "empty":
      return `<div class="ref-empty"><span>没有匹配项</span><h3>没有组件匹配“预测”。</h3><p>清除筛选条件，或搜索智能体验设计指导。</p><button type="button">清除搜索</button></div>`;
    case "toast":
      return `<div class="ref-toast-demo"><button type="button" data-ref-toast-show>显示确认消息</button><div class="ref-toast" role="status" hidden><span>修订版本已保存。</span><button type="button" data-ref-toast-hide>关闭</button></div></div>`;
    case "shell":
      return `<div class="ref-shell"><header><strong>企业智能体验</strong><span>修订版本 0.5</span></header><aside><b>概览</b><span>架构</span><span>设计指导</span></aside><main><small>当前工作对象</small><h3>参考文档</h3><p>应用框架帮助用户在不同视图间保持方向感。</p></main></div>`;
    default:
      return `<div class="ref-surface"><span>参考界面</span><h3>${escapeHtml(componentLabel(spec))}</h3><p>${escapeHtml(spec.purpose)}</p></div>`;
  }
}

function renderLegacyComponentDetail(spec) {
  const selectedState = specimenState.get(spec.id) || spec.states[0];
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div><p class="eyebrow">通用组件 · ${escapeHtml(uiLabel(spec.category))}</p><h1>${escapeHtml(componentLabel(spec))}</h1><p>${escapeHtml(spec.purpose)}</p></div>
        <span class="ds-maturity">${escapeHtml(uiLabel(spec.maturity))} · 参考实现</span>
      </header>
      ${sequenceNavigation("components", spec.id)}
      ${layerTrace("component")}
      <section id="purpose" class="ds-doc-section" data-section-title="用途">
        <div class="ds-section-heading"><span>用途与使用规则</span><h2>适用场景与使用边界</h2></div>
        <p>${escapeHtml(spec.usage)}</p>
      </section>
      <section id="anatomy" class="ds-doc-section" data-section-title="结构">
        <div class="ds-section-heading"><span>结构</span><h2>组成、变体与状态</h2></div>
        <div class="ds-three-column"><div><h3>组成</h3>${list(spec.anatomy)}</div><div><h3>变体</h3>${list(spec.variants)}</div><div><h3>状态</h3>${list(spec.states)}</div></div>
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="交互示例">
        <div class="ds-section-heading"><span>交互示例</span><h2>参考行为</h2></div>
        <div class="ds-specimen-toolbar" role="group" aria-label="${escapeHtml(componentLabel(spec))}状态">
          ${spec.states
            .slice(0, 6)
            .map(
              (state) => `<button type="button" data-component-state="${escapeHtml(state)}" aria-pressed="${state === selectedState}">${escapeHtml(uiLabel(state))}</button>`,
            )
            .join("")}
        </div>
        ${mockBrowserFrameHtml(
          `<div class="ds-live-stage" id="dsComponentSpecimen" data-specimen-component="${escapeHtml(spec.id)}">${componentSpecimen(spec, selectedState)}</div>`,
          {
            title: `${componentLabel(spec)}的状态与交互`,
            address: `eix.template/design-system/components/${spec.id}`,
            status: "组件样机 · 模拟数据",
            principles: ["状态可辨", "操作命名一致", "键盘可操作"],
            className: "design-system-browser",
          },
        )}
        <p class="ds-note">模拟数据 · 状态控制只修改本页示例，不代表生产组件接口。</p>
      </section>
      <section id="reference-markup" class="ds-doc-section" data-section-title="参考标记">
        <div class="ds-section-heading"><span>参考标记</span><h2>当前语义结构参考；<br />尚未发布生产组件包。</h2></div>
        <div class="ds-code-block"><div><span>HTML · 约定示例</span><button type="button" data-copy-markup>复制</button></div><pre tabindex="0"><code>${escapeHtml(specimenMarkup(spec.id))}</code></pre></div>
      </section>
      <section id="tokens" class="ds-doc-section" data-section-title="设计变量">
        <div class="ds-section-heading"><span>设计变量与参考属性</span><h2>实现约束</h2></div>
        <div class="ds-two-column"><div><h3>设计变量</h3>${list(spec.tokens)}</div><div><h3>参考属性</h3>${list(spec.referenceProps)}</div></div>
      </section>
      <section id="responsive-accessibility" class="ds-doc-section" data-section-title="响应式与无障碍">
        <div class="ds-section-heading"><span>最低质量要求</span><h2>响应式设计保持核心任务能力等价。</h2></div>
        <p>${escapeHtml(spec.responsive)}</p>${list(spec.accessibility)}
      </section>
      <section id="do-dont" class="ds-doc-section" data-section-title="推荐与避免">
        <div class="ds-section-heading"><span>设计评审</span><h2>推荐与避免</h2></div>
        <div class="ds-do-dont"><article><span>推荐</span>${list(spec.dos)}</article><article><span>避免</span>${list(spec.donts)}</article></div>
      </section>
    </article>
  `;
}

function renderComponentDetail(spec) {
  return `
    <article class="ds-doc">
      <header class="ds-detail-header">
        <div>
          <p class="eyebrow">通用组件 · ${escapeHtml(uiLabel(spec.category))}</p>
          <h1>${escapeHtml(componentLabel(spec))}</h1>
          <p>${escapeHtml(spec.purpose)}</p>
        </div>
        <span class="ds-maturity">候选约定 · 静态检查通过</span>
      </header>
      ${sequenceNavigation("components", spec.id)}
      ${layerTrace("component")}
      <section id="purpose" class="ds-doc-section" data-section-title="用途">
        <div class="ds-section-heading"><span>用途与使用规则</span><h2>适用场景与使用边界</h2></div>
        <p>${escapeHtml(spec.usage)}</p>
      </section>
      <section id="anatomy" class="ds-doc-section" data-section-title="结构">
        <div class="ds-section-heading"><span>结构</span><h2>组成、变体与状态</h2></div>
        <div class="ds-three-column">
          <div><h3>组成</h3>${list(spec.anatomy)}</div>
          <div><h3>变体 · ${spec.variants.length}</h3>${list(spec.variants)}</div>
          <div><h3>状态 · ${spec.states.length}</h3>${list(spec.states)}</div>
        </div>
      </section>
      <section id="live-specimen" class="ds-doc-section" data-section-title="交互示例">
        <div class="ds-section-heading">
          <span>交互示例 · 受控状态</span>
          <h2>变体、状态和视口共同更新交互舞台与参考标记。</h2>
        </div>
        ${specimenWorkbenchHtml(spec)}
      </section>
      <section id="reference-markup" class="ds-doc-section" data-section-title="参考标记">
        <div class="ds-section-heading">
          <span>参考标记</span>
          <h2>随当前合法状态更新，并保持关键语义一致。</h2>
        </div>
        ${specimenReferenceMarkupHtml(spec)}
      </section>
      <section id="tokens" class="ds-doc-section" data-section-title="设计变量">
        <div class="ds-section-heading"><span>设计变量与参考属性</span><h2>实现约束</h2></div>
        <div class="ds-two-column"><div><h3>设计变量</h3>${list(spec.tokens)}</div><div><h3>参考属性</h3>${list(spec.referenceProps)}</div></div>
      </section>
      <section id="responsive-accessibility" class="ds-doc-section" data-section-title="响应式与无障碍">
        <div class="ds-section-heading"><span>最低质量要求</span><h2>响应式设计保持核心任务能力等价。</h2></div>
        <p>${escapeHtml(spec.responsive)}</p>${list(spec.accessibility)}
      </section>
      <section id="do-dont" class="ds-doc-section" data-section-title="推荐与避免">
        <div class="ds-section-heading"><span>设计评审</span><h2>推荐与避免</h2></div>
        <div class="ds-do-dont"><article><span>推荐</span>${list(spec.dos)}</article><article><span>避免</span>${list(spec.donts)}</article></div>
      </section>
    </article>
  `;
}

function inspectorHtml(kind, spec, tokenSource) {
  const tokens = kind === "components" ? spec.tokens : [];
  const related = (spec.relatedIds || []).map((id) => {
    const route = routeForRelated(id);
    const entry = findCatalogEntry("components", id) || findCatalogEntry("primitives", id) || findCatalogEntry("foundations", id);
    return `<a href="#${escapeHtml(route)}">${escapeHtml(componentLabel(entry || id))}</a>`;
  });
  return `
    <aside class="ds-inspector" aria-label="当前设计系统条目说明与预览设置">
      <header class="ds-inspector-heading">
        <span>页面内辅助栏</span>
        <strong>当前条目说明</strong>
        <p>只说明左侧选中的设计系统条目及预览设置；站点一级章节仍由顶部导航切换。</p>
      </header>
      <section><span>成熟度</span><strong>${escapeHtml(uiLabel(spec.maturity || "Candidate"))}</strong><p>静态参考实现 · 尚未发布组件包</p></section>
      <section><span>主题</span><div class="ds-theme-toggle" role="group" aria-label="主题">
        <button type="button" data-ds-theme="neutral">中性主题</button>
        <button type="button" data-ds-theme="eix">EIX</button>
      </div></section>
      <section><span>明暗模式</span><div class="ds-theme-toggle" role="group" aria-label="明暗模式">
        <button type="button" data-ds-mode="light">浅色</button>
        <button type="button" data-ds-mode="dark">深色</button>
      </div></section>
      ${
        tokens.length
          ? `<section><span>使用的设计变量</span>${tokens.map((token) => `<code>${escapeHtml(token)}</code>`).join("")}</section>`
          : ""
      }
      ${
        related.length
          ? `<section><span>相关规范</span><div class="ds-related-links">${related.join("")}</div></section>`
          : ""
      }
      <section><span>来源</span><a href="#/document?doc=design-system&from=design-system">阅读设计系统 Markdown</a></section>
      <section><span>目录</span><p>${tokenSource.tokens.length} 个设计变量 · ${catalogSummary.total} 个条目</p></section>
      ${
        kind === "components"
          ? `<section><span>交互示例覆盖</span><p>${specimenCoverage.components}/30 个受控示例 · ${specimenCoverage.variants} 个已声明变体 · ${specimenCoverage.states} 个已声明场景</p><small>完成度按合法状态覆盖、字段独立行为、键盘操作、响应式能力保留和标记一致性判断，不按数量判断。</small></section>`
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
    if (count) count.textContent = `${visible} 项`;
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
      event.currentTarget.textContent = "已复制";
    } catch {
      event.currentTarget.textContent = "请选择代码后复制";
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
    if (live) live.textContent = "本地检查完成。未执行外部操作。";
    if (visible) visible.textContent = "检查完成 · 已向辅助技术播报。";
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
      if (panel) panel.textContent = `当前仍是同一工作对象的${button.textContent}面板。`;
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
      <div class="ds-mobile-tools" aria-label="设计系统移动面板">
        <button type="button" data-ds-mobile-panel="catalog" aria-controls="dsCatalogPanel" aria-expanded="false">目录</button>
        <button type="button" data-ds-mobile-panel="inspector" aria-controls="dsInspectorPanel" aria-expanded="false">条目说明</button>
      </div>
      <button class="ds-mobile-backdrop" type="button" aria-label="关闭设计系统面板" hidden></button>
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
