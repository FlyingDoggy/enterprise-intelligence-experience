export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function stateClass(state) {
  return `is-${String(state).trim().toLocaleLowerCase("en-US").replaceAll(/\s+/g, "-")}`;
}

export function variantClass(variant) {
  return `variant-${String(variant).trim().toLocaleLowerCase("en-US").replaceAll(/\s+/g, "-")}`;
}

export function boolAttribute(name, enabled) {
  return enabled ? ` ${name}` : "";
}

export function ariaAttribute(name, value) {
  return ` aria-${name}="${escapeHtml(value)}"`;
}

export function previewFrame(model, content, options = {}) {
  const { label = "Live component", className = "", status = "" } = options;
  return `
    <div
      class="${classNames("sp-specimen", `sp-${model.componentId}`, variantClass(model.variant), stateClass(model.state), className)}"
      data-specimen-component="${escapeHtml(model.componentId)}"
      data-preview-variant="${escapeHtml(model.variant)}"
      data-preview-state="${escapeHtml(model.state)}"
      aria-label="${escapeHtml(label)}"
    >
      ${content}
      ${
        status
          ? `<p class="sp-state-receipt" data-specimen-state-output aria-live="polite">${escapeHtml(status)}</p>`
          : ""
      }
    </div>
  `;
}

export function stateReceipt(model, detail) {
  return `${model.variant} · ${model.state}${detail ? ` · ${detail}` : ""}`;
}

export function focusWhenPreviewed(host, model, selector) {
  if (model.state !== "focus" && model.state !== "focused") return;
  requestAnimationFrame(() => host.querySelector(selector)?.focus({ preventScroll: true }));
}

export function bindEscape(host, callback) {
  host.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    callback();
  });
}

export function bindRovingGroup(host, selector, options = {}) {
  const { orientation = "horizontal", select = null } = options;
  const items = () => [...host.querySelectorAll(selector)].filter((item) => !item.disabled);
  host.addEventListener("keydown", (event) => {
    const candidates = items();
    const currentIndex = candidates.indexOf(document.activeElement);
    if (currentIndex < 0 || candidates.length === 0) return;
    const previousKeys = orientation === "vertical" ? ["ArrowUp"] : ["ArrowLeft", "ArrowUp"];
    const nextKeys = orientation === "vertical" ? ["ArrowDown"] : ["ArrowRight", "ArrowDown"];
    let nextIndex = currentIndex;
    if (previousKeys.includes(event.key)) nextIndex = (currentIndex - 1 + candidates.length) % candidates.length;
    else if (nextKeys.includes(event.key)) nextIndex = (currentIndex + 1) % candidates.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = candidates.length - 1;
    else return;
    event.preventDefault();
    candidates[nextIndex].focus();
    select?.(candidates[nextIndex]);
  });
}

export function bindFocusTrap(host, selector, onEscape) {
  const panel = host.querySelector(selector);
  if (!panel) return;
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape?.();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

export function stripIndent(value) {
  const lines = String(value).replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const indentation = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)?.[0].length || 0),
  );
  return lines.map((line) => line.slice(indentation)).join("\n");
}

export function createDefinition(definition) {
  return {
    bind() {},
    ...definition,
  };
}
