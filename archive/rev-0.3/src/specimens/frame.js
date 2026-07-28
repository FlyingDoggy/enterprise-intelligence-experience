import { getSpecimenDefinition } from "./index.js";

const CHANNEL = "eix-specimen-frame-v1";
const root = document.querySelector("#specimenRoot");
let current = null;
let renderQueued = false;

function notify(payload) {
  window.parent.postMessage({ channel: CHANNEL, ...payload }, window.location.origin);
}

function reportHeight() {
  const height = Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
  notify({ type: "height", height });
}

function render(options = {}) {
  if (!current || !root) return;
  const definition = getSpecimenDefinition(current.componentId);
  root.innerHTML = '<div data-specimen-frame-host></div>';
  const host = root.firstElementChild;
  host.innerHTML = definition.render(current.model);
  definition.bind(host, {
    model: current.model,
    setModel(patch, setOptions = {}) {
      notify({
        type: "model-change",
        patch,
        focusSelector: setOptions.focusSelector || null,
      });
    },
  });
  const focusSelector = options.focusSelector;
  if (focusSelector) {
    requestAnimationFrame(() => host.querySelector(focusSelector)?.focus({ preventScroll: true }));
  }
  requestAnimationFrame(reportHeight);
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.channel !== CHANNEL || event.data.type !== "render") return;
  current = {
    componentId: event.data.componentId,
    model: { ...event.data.model },
  };
  document.body.dataset.theme = event.data.theme === "neutral" ? "neutral" : "eix";
  render({ focusSelector: event.data.focusSelector });
});

new ResizeObserver(() => {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    reportHeight();
  });
}).observe(document.documentElement);

notify({ type: "ready" });
