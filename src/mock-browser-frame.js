function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizedPrinciples(principles) {
  if (Array.isArray(principles)) return principles.filter(Boolean);
  return String(principles || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function frameChromeHtml({ title, address, status, principles }) {
  const items = normalizedPrinciples(principles);
  return `
    <header class="mock-browser-chrome">
      <span class="mock-browser-window-controls" aria-hidden="true"><i></i><i></i><i></i></span>
      <div class="mock-browser-address">
        <span>界面样机</span>
        <code>${escapeHtml(address)}</code>
      </div>
      <span class="mock-browser-status">${escapeHtml(status)}</span>
    </header>
    <div class="mock-browser-design-lens">
      <div><span>这张样机演示</span><strong>${escapeHtml(title)}</strong></div>
      ${
        items.length
          ? `<div class="mock-browser-principles" aria-label="样机体现的设计原则">${items
              .map((item) => `<span>${escapeHtml(item)}</span>`)
              .join("")}</div>`
          : ""
      }
    </div>
  `;
}

export function mockBrowserFrameHtml(
  content,
  {
    title = "界面结构与交互行为",
    address = "eix.template/reference",
    status = "占位内容 · 可交互参考",
    principles = ["对象明确", "状态可见", "操作受控"],
    className = "",
  } = {},
) {
  return `
    <section
      class="mock-browser-frame ${escapeHtml(className)}"
      aria-label="${escapeHtml(`${title}界面样机`)}"
      data-mock-browser-frame
    >
      ${frameChromeHtml({ title, address, status, principles })}
      <div class="mock-browser-viewport">${content}</div>
    </section>
  `;
}

export function enhanceMockBrowserFrames(root = document) {
  root.querySelectorAll("[data-mock-browser-title]").forEach((element) => {
    if (element.closest("[data-mock-browser-frame]")) return;
    const frame = document.createElement("section");
    frame.className = `mock-browser-frame ${element.dataset.mockBrowserClass || ""}`.trim();
    frame.dataset.mockBrowserFrame = "";
    const title = element.dataset.mockBrowserTitle || "界面结构与交互行为";
    frame.setAttribute("aria-label", `${title}界面样机`);
    frame.innerHTML = `
      ${frameChromeHtml({
        title,
        address: element.dataset.mockBrowserAddress || "eix.template/reference",
        status: element.dataset.mockBrowserStatus || "占位内容 · 可交互参考",
        principles: element.dataset.mockBrowserPrinciples || "对象明确|状态可见|操作受控",
      })}
      <div class="mock-browser-viewport"></div>
    `;
    element.before(frame);
    frame.querySelector(".mock-browser-viewport")?.append(element);
  });
}
