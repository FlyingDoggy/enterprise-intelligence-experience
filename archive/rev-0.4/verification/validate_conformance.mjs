import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(projectRoot, path), "utf8");

const activeContentFiles = [
  "README.md",
  "index.html",
  "app.js",
  "src/catalog.js",
  "src/design-system-data.js",
  "src/design-system-renderer.js",
  "src/guidance-data.js",
  "src/guidance-specimens.js",
  "CONTEXT.md",
  "EIX_2.0_CORE_DESIGN_SYSTEM.md",
  "EIX_2.0_CONSOLIDATION_RECORD.md",
  "EIX_2.0_EXPERIENCE_NARRATIVE.md",
  "EIX_2.0_INTELLIGENCE_UX_GUIDANCE.md",
  "EIX_2.0_PATTERN_SPECIMEN_LIBRARY.md",
  "ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md",
];

const cssFiles = ["styles.css", "design-system/reference.css"];
const failures = [];

function fail(message) {
  failures.push(message);
}

for (const path of cssFiles) {
  const css = await read(path);
  const directColors = [...css.matchAll(/#[0-9a-f]{3,8}\b/gi)];
  if (directColors.length) {
    fail(`${path} contains ${directColors.length} direct color values; use Semantic, Component or EIX tokens`);
  }

  const foundationConsumers = [...css.matchAll(/var\(--foundation-[^)]+\)/g)];
  if (foundationConsumers.length) {
    fail(`${path} consumes ${foundationConsumers.length} Foundation tokens directly`);
  }

  const undersized = [...css.matchAll(/font-size\s*:\s*([0-9.]+)px/gi)]
    .map((match) => Number.parseFloat(match[1]))
    .filter((value) => value < 12);
  if (undersized.length) {
    fail(`${path} contains ${undersized.length} font-size declarations below 12px`);
  }

  const rawSpacing = [
    ...css.matchAll(
      /(?:gap|padding(?:-[a-z]+)?|margin(?:-[a-z]+)?)\s*:[^;{}]*-?[0-9.]+px/gi,
    ),
  ];
  if (rawSpacing.length) {
    fail(`${path} contains ${rawSpacing.length} untokenized spacing declarations`);
  }
}

const tokenSource = JSON.parse(await read("design-system/tokens.json"));
const tokenPaths = new Set(tokenSource.tokens.map((token) => token.path));
const tokenByPath = new Map(tokenSource.tokens.map((token) => [token.path, token]));

function tokenValues(theme, mode) {
  const values = new Map(
    tokenSource.tokens.map((token) => [
      token.cssVariable,
      token.themeOverrides[theme] || token.defaultValue,
    ]),
  );
  const applyOverrides = (overrides = {}) => {
    for (const [path, value] of Object.entries(overrides)) {
      const token = tokenByPath.get(path);
      if (!token) {
        fail(`${theme}/${mode} references unknown token path: ${path}`);
        continue;
      }
      values.set(token.cssVariable, value);
    }
  };
  applyOverrides(tokenSource.modeOverrides?.[mode]);
  applyOverrides(tokenSource.themeModeOverrides?.[theme]?.[mode]);
  return values;
}

function resolveColor(values, variable, seen = new Set()) {
  if (seen.has(variable)) throw new Error(`Circular token reference: ${variable}`);
  seen.add(variable);
  const value = values.get(variable);
  if (!value) throw new Error(`Unknown color variable: ${variable}`);
  const reference = value.match(/^var\((--[^)]+)\)$/);
  return reference ? resolveColor(values, reference[1], seen) : value;
}

function luminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

const contrastPairs = [
  ["--semantic-text-primary", "--semantic-surface-paper"],
  ["--semantic-text-secondary", "--semantic-surface-paper"],
  ["--semantic-text-tertiary", "--semantic-surface-paper"],
  ["--semantic-text-inverse", "--semantic-surface-inverse"],
  ["--semantic-text-inverse-muted", "--semantic-surface-inverse"],
  ["--semantic-text-inverse-accent", "--semantic-surface-inverse"],
  ["--semantic-action-on-primary", "--semantic-action-primary"],
  ["--semantic-action-primary", "--semantic-surface-paper"],
  ["--semantic-feedback-success", "--semantic-surface-paper"],
  ["--semantic-feedback-warning", "--semantic-surface-paper"],
  ["--semantic-feedback-danger", "--semantic-surface-paper"],
  ["--eix-claim-accent", "--semantic-surface-paper"],
  ["--eix-evidence-accent", "--semantic-surface-paper"],
  ["--eix-risk-accent", "--semantic-surface-paper"],
  ["--eix-permission-accent", "--semantic-surface-paper"],
  ["--eix-workflow-accent", "--semantic-surface-paper"],
];

for (const theme of tokenSource.supportedThemes) {
  for (const mode of tokenSource.supportedModes) {
    const values = tokenValues(theme, mode);
    for (const [foregroundVariable, backgroundVariable] of contrastPairs) {
      const foreground = resolveColor(values, foregroundVariable);
      const background = resolveColor(values, backgroundVariable);
      const ratio = contrast(foreground, background);
      if (ratio < 4.5) {
        fail(
          `Contrast ${theme}/${mode} ${foregroundVariable} on ${backgroundVariable} is ` +
            `${ratio.toFixed(2)}:1; expected 4.5:1`,
        );
      }
    }
  }
}

for (const requiredPath of [
  "semantic.typography.meta.size",
  "semantic.typography.control.size",
  "semantic.typography.supporting.size",
  "semantic.typography.body.size",
  "semantic.typography.lead.size",
  "semantic.space.optical-1",
  "semantic.space.1",
  "semantic.space.24",
  "semantic.surface.inverse",
  "semantic.border.inverse",
  "semantic.action.on-primary",
  "eix.contract.process.accent",
  "eix.contract.collaborative.accent",
]) {
  if (!tokenPaths.has(requiredPath)) fail(`Missing conformance token: ${requiredPath}`);
}

for (const requiredTheme of ["neutral", "eix"]) {
  if (!tokenSource.supportedThemes.includes(requiredTheme)) fail(`Missing supported theme: ${requiredTheme}`);
}
for (const requiredMode of ["light", "dark"]) {
  if (!tokenSource.supportedModes.includes(requiredMode)) fail(`Missing supported mode: ${requiredMode}`);
}
if (!tokenSource.themeModeOverrides?.eix?.dark) {
  fail("EIX Dark theme-mode override is missing");
}

const styles = await read("styles.css");
for (const requiredDeclaration of [
  "font-size: var(--semantic-type-body)",
  "font-family: var(--semantic-font-body)",
  "background: var(--semantic-surface-canvas)",
  "text-autospace: normal",
]) {
  if (!styles.includes(requiredDeclaration)) fail(`Reference consumer is missing: ${requiredDeclaration}`);
}

const prohibitedLanguage = [
  "交互样章",
  "Process与Collaborative",
  "Process或Collaborative",
  "UIUX",
  "治理不应该被感到",
  "不是多一个AI入口",
  "不会偷偷变身",
  "文档不是作者看懂了就算完成",
];

for (const path of activeContentFiles) {
  const content = await read(path);
  for (const phrase of prohibitedLanguage) {
    if (content.includes(phrase)) fail(`${path} contains retired wording: ${phrase}`);
  }
}

const context = await read("CONTEXT.md");
for (const requiredTerm of [
  "**Intelligence UX Guidance**",
  "**Live Specimen**",
  "**Revision**",
  "**Version**",
  "**Result**",
  "**Outcome**",
]) {
  if (!context.includes(requiredTerm)) fail(`CONTEXT.md is missing ${requiredTerm}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Conformance valid: ${tokenSource.tokens.length} tokens; ${cssFiles.length} CSS layers; ` +
      `${tokenSource.supportedThemes.length * tokenSource.supportedModes.length} theme/mode combinations; ` +
      `${activeContentFiles.length} active content sources; minimum declared CSS font size 12px.`,
  );
}
