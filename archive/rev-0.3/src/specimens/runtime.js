import { escapeHtml } from "./shared.js";
import { getSpecimenDefinition } from "./index.js";

const CHANNEL = "eix-specimen-frame-v1";
const viewportOptions = ["auto", "390", "768"];
const specimenModels = new Map();
const activeFrames = new Map();

function optionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function optionLabel(option) {
  return typeof option === "string" ? option : option.label || option.value;
}

function defaultControls(spec, definition) {
  return [
    {
      key: "variant",
      label: "Variant",
      options: spec.variants,
    },
    {
      key: "state",
      label: definition.stateLabel || "Scenario",
      options: spec.states,
    },
  ];
}

function controlsFor(spec, definition) {
  return definition.controls || defaultControls(spec, definition);
}

function initialModel(spec, definition) {
  const model = {
    componentId: spec.id,
    variant: definition.defaultVariant || spec.variants[0],
    state: definition.defaultState || spec.states[0],
    viewport: "auto",
    ...(definition.defaultModel || {}),
  };
  return normalizeModel(spec, definition, model);
}

function normalizeModel(spec, definition, candidate) {
  const model = {
    componentId: spec.id,
    ...candidate,
  };
  if (!spec.variants.includes(model.variant)) model.variant = definition.defaultVariant || spec.variants[0];
  if (!spec.states.includes(model.state)) model.state = definition.defaultState || spec.states[0];
  if (!viewportOptions.includes(model.viewport)) model.viewport = "auto";
  const normalized = definition.normalizeModel?.({ ...model }) || model;
  return { ...model, ...normalized, componentId: spec.id };
}

function validModel(definition, candidate) {
  return definition.isValidModel ? definition.isValidModel(candidate) : true;
}

function invalidReason(definition, candidate) {
  return definition.invalidReason?.(candidate) || "This combination is not part of the component contract.";
}

function getModel(spec, definition) {
  const existing = specimenModels.get(spec.id);
  const model = existing ? normalizeModel(spec, definition, existing) : initialModel(spec, definition);
  specimenModels.set(spec.id, model);
  return model;
}

function candidateFor(model, key, value) {
  return { ...model, [key]: value };
}

function controlButtons(control, model, definition) {
  return control.options
    .map((option) => {
      const value = optionValue(option);
      const candidate = candidateFor(model, control.key, value);
      const valid = validModel(definition, candidate);
      const reason = valid ? "" : invalidReason(definition, candidate);
      return `
        <button
          type="button"
          data-specimen-control="${escapeHtml(control.key)}"
          data-specimen-value="${escapeHtml(value)}"
          aria-pressed="${String(model[control.key] === value)}"
          ${valid ? "" : `disabled aria-describedby="${escapeHtml(`invalid-${control.key}-${value}`)}"`}
        >${escapeHtml(optionLabel(option))}</button>
        ${
          valid
            ? ""
            : `<span id="${escapeHtml(`invalid-${control.key}-${value}`)}" class="visually-hidden">${escapeHtml(reason)}</span>`
        }
      `;
    })
    .join("");
}

function controlFieldset(control, model, definition) {
  return `
    <fieldset>
      <legend>${escapeHtml(control.label)}</legend>
      <div class="ds-specimen-options" data-specimen-options="${escapeHtml(control.key)}">
        ${controlButtons(control, model, definition)}
      </div>
    </fieldset>
  `;
}

export function specimenWorkbenchHtml(spec) {
  const definition = getSpecimenDefinition(spec.id);
  const model = initialModel(spec, definition);
  specimenModels.set(spec.id, model);
  const controls = controlsFor(spec, definition);
  return `
    <div
      class="ds-specimen-workbench"
      data-specimen-workbench="${escapeHtml(spec.id)}"
      style="--specimen-control-count:${controls.length + 1}"
    >
      <div class="ds-specimen-control-grid">
        ${controls.map((control) => controlFieldset(control, model, definition)).join("")}
        <fieldset>
          <legend>Real viewport</legend>
          <div class="ds-specimen-options" data-specimen-options="viewport">
            ${controlButtons({ key: "viewport", options: viewportOptions }, model, definition)}
          </div>
        </fieldset>
      </div>
      <div class="ds-specimen-meta" aria-live="polite">
        ${controls
          .map(
            (control) =>
              `<span>${escapeHtml(control.label)} <b data-specimen-current="${escapeHtml(control.key)}">${escapeHtml(model[control.key])}</b></span>`,
          )
          .join("")}
        <span>Viewport <b data-specimen-current="viewport">${escapeHtml(model.viewport)}</b></span>
        <button type="button" data-specimen-reset>Reset</button>
      </div>
      <div class="ds-live-stage ds-controlled-stage" data-specimen-viewport="${escapeHtml(model.viewport)}">
        <iframe
          class="ds-specimen-frame"
          data-specimen-frame
          title="${escapeHtml(`${spec.title} live specimen`)}"
          src="./specimen.html"
          loading="eager"
        ></iframe>
      </div>
      <p class="ds-note">
        Live fixture · 每个Control代表独立契约轴；灰置组合是显式禁止的非法状态。Viewport在同源iframe中触发真实media query。
      </p>
    </div>
  `;
}

export function specimenReferenceMarkupHtml() {
  return `
    <div class="ds-code-block">
      <div>
        <span>HTML · CURRENT RESOLVED MODEL</span>
        <button type="button" data-copy-markup>Copy</button>
      </div>
      <pre tabindex="0"><code data-specimen-markup></code></pre>
    </div>
  `;
}

function updateControls(root, spec, definition, model) {
  root.querySelectorAll("[data-specimen-control]").forEach((button) => {
    const field = button.dataset.specimenControl;
    const value = button.dataset.specimenValue;
    button.setAttribute("aria-pressed", String(model[field] === value));
    const candidate = candidateFor(model, field, value);
    button.disabled = !validModel(definition, candidate);
    if (button.disabled) button.title = invalidReason(definition, candidate);
    else button.removeAttribute("title");
  });
  root.querySelectorAll("[data-specimen-current]").forEach((node) => {
    node.textContent = model[node.dataset.specimenCurrent] ?? "—";
  });
  const stage = root.querySelector("[data-specimen-viewport]");
  if (stage) stage.dataset.specimenViewport = model.viewport;
}

function updateMarkup(container, definition, model) {
  const code = container.querySelector("[data-specimen-markup]");
  if (code) code.textContent = definition.markup(model);
}

function currentTheme() {
  return document.body.dataset.theme === "neutral" ? "neutral" : "eix";
}

function postRender(frame, spec, model, options = {}) {
  if (!frame?.contentWindow) return;
  frame.contentWindow.postMessage(
    {
      channel: CHANNEL,
      type: "render",
      componentId: spec.id,
      model,
      theme: currentTheme(),
      focusSelector: options.focusSelector || null,
    },
    window.location.origin,
  );
}

function syncSurface(container, spec, definition, model, options = {}) {
  const root = container.querySelector(`[data-specimen-workbench="${CSS.escape(spec.id)}"]`);
  if (!root) return;
  updateControls(root, spec, definition, model);
  updateMarkup(container, definition, model);
  const frame = root.querySelector("[data-specimen-frame]");
  postRender(frame, spec, model, options);
}

function replaceModel(container, spec, definition, patch, options = {}) {
  const current = getModel(spec, definition);
  const candidate = normalizeModel(spec, definition, { ...current, ...patch });
  if (!validModel(definition, candidate)) return;
  specimenModels.set(spec.id, candidate);
  syncSurface(container, spec, definition, candidate, options);
}

export function bindSpecimenWorkbench(container, spec) {
  const definition = getSpecimenDefinition(spec.id);
  let model = getModel(spec, definition);
  const root = container.querySelector(`[data-specimen-workbench="${CSS.escape(spec.id)}"]`);
  const frame = root?.querySelector("[data-specimen-frame]");
  if (!root || !frame) return;

  activeFrames.set(frame.contentWindow, { container, spec, definition, frame });

  root.querySelectorAll("[data-specimen-control]").forEach((button) => {
    button.addEventListener("click", () => {
      replaceModel(container, spec, definition, {
        [button.dataset.specimenControl]: button.dataset.specimenValue,
      });
      model = getModel(spec, definition);
    });
  });

  root.querySelector("[data-specimen-reset]")?.addEventListener("click", () => {
    model = initialModel(spec, definition);
    specimenModels.set(spec.id, model);
    syncSurface(container, spec, definition, model);
  });

  frame.addEventListener("load", () => {
    activeFrames.set(frame.contentWindow, { container, spec, definition, frame });
    syncSurface(container, spec, definition, getModel(spec, definition));
  });

  container.querySelector("[data-copy-markup]")?.addEventListener("click", async (event) => {
    const code = container.querySelector("[data-specimen-markup]")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
      event.currentTarget.textContent = "Copied";
    } catch {
      event.currentTarget.textContent = "Select code";
    }
  });

  syncSurface(container, spec, definition, model);
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.channel !== CHANNEL) return;
  const active = activeFrames.get(event.source);
  if (!active) return;
  const { container, spec, definition, frame } = active;
  if (event.data.type === "model-change") {
    replaceModel(container, spec, definition, event.data.patch || {}, {
      focusSelector: event.data.focusSelector || null,
    });
    return;
  }
  if (event.data.type === "height") {
    const height = Math.max(300, Math.min(900, Number(event.data.height) || 360));
    frame.style.height = `${height}px`;
  }
});

document.addEventListener("eix-theme-change", () => {
  activeFrames.forEach(({ frame, spec }) => {
    const definition = getSpecimenDefinition(spec.id);
    postRender(frame, spec, getModel(spec, definition));
  });
});

export function specimenRuntimeCoverage() {
  return {
    models: specimenModels.size,
    viewportOptions: [...viewportOptions],
    isolatedResponsiveFrame: true,
  };
}
