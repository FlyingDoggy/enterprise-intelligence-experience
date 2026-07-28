import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogRegistry, catalogSummary } from "../src/catalog.js";
import { components, foundations, primitives } from "../src/design-system-data.js";
import { guidancePatterns } from "../src/guidance-data.js";
import { guidanceSpecimenCoverage } from "../src/guidance-specimens.js";
import { specimenCoverage, specimenDefinitions } from "../src/specimens/index.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokenSource = JSON.parse(await readFile(resolve(projectRoot, "design-system/tokens.json"), "utf8"));
const referenceCss = await readFile(resolve(projectRoot, "design-system/reference.css"), "utf8");
const tokenPaths = new Set(tokenSource.tokens.map((token) => token.path));
const componentIds = new Set(components.map((component) => component.id));
const designSystemIds = new Set([...foundations, ...primitives, ...components].map((entry) => entry.id));
const routeSet = new Set();
const catalogKeySet = new Set();
const failures = [];
const renderedSpecimenClasses = new Set();
const cssSpecimenClasses = new Set(
  [...referenceCss.matchAll(/\.((?:sp)-[a-z0-9-]+)/g)].map((match) => match[1]),
);

function collectRenderedClasses(output) {
  for (const match of output.matchAll(/class="([^"]+)"/g)) {
    match[1].split(/\s+/).filter(Boolean).forEach((className) => renderedSpecimenClasses.add(className));
  }
}

function validateReferenceMarkup(componentId, variantOrState, markup) {
  if (!markup.trim()) failures.push(`${componentId}/${variantOrState} has empty Reference Markup`);
  const buttonsWithoutType = [...markup.matchAll(/<button\b([^>]*)>/g)].filter(
    (match) => !/\btype\s*=/.test(match[1]),
  );
  if (buttonsWithoutType.length) {
    failures.push(`${componentId}/${variantOrState} Reference Markup contains button without type`);
  }
}

function optionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function defaultControls(component, definition) {
  return [
    { key: "variant", options: component.variants },
    { key: "state", options: component.states },
  ];
}

function normalizeModel(component, definition, candidate) {
  const model = {
    componentId: component.id,
    variant: definition.defaultVariant,
    state: definition.defaultState,
    viewport: "auto",
    ...(definition.defaultModel || {}),
    ...candidate,
  };
  return {
    ...model,
    ...(definition.normalizeModel?.({ ...model }) || {}),
    componentId: component.id,
  };
}

function legal(definition, model) {
  return definition.isValidModel ? definition.isValidModel(model) : true;
}

function cartesianModels(component, definition) {
  const controls = definition.controls || defaultControls(component, definition);
  let models = [{}];
  for (const control of controls) {
    models = models.flatMap((model) =>
      control.options.map((option) => ({ ...model, [control.key]: optionValue(option) })),
    );
  }
  return models
    .map((model) => normalizeModel(component, definition, model))
    .filter((model) => legal(definition, model));
}

for (const entry of catalogRegistry) {
  const key = `${entry.kind}:${entry.id}`;
  if (catalogKeySet.has(key)) failures.push(`Duplicate catalog key: ${key}`);
  if (routeSet.has(entry.route)) failures.push(`Duplicate route: ${entry.route}`);
  catalogKeySet.add(key);
  routeSet.add(entry.route);
}

for (const component of components) {
  for (const token of component.tokens) {
    if (!tokenPaths.has(token)) failures.push(`${component.id} references missing token ${token}`);
  }
  for (const relatedId of component.relatedIds) {
    if (!designSystemIds.has(relatedId)) failures.push(`${component.id} references missing related entry ${relatedId}`);
  }

  const definition = specimenDefinitions.find((item) => item.id === component.id);
  if (!definition) {
    failures.push(`${component.id} has no SpecimenDefinition`);
    continue;
  }
  if (!component.variants.includes(definition.defaultVariant)) {
    failures.push(`${component.id} has invalid default variant ${definition.defaultVariant}`);
  }
  if (!component.states.includes(definition.defaultState)) {
    failures.push(`${component.id} has invalid default state ${definition.defaultState}`);
  }
  if (definition.variantPreviewState && !component.states.includes(definition.variantPreviewState)) {
    failures.push(`${component.id} has invalid variant preview state ${definition.variantPreviewState}`);
  }

  const controls = definition.controls || defaultControls(component, definition);
  const legalModels = cartesianModels(component, definition);
  if (!legalModels.length) failures.push(`${component.id} has no legal specimen model`);
  const legalKeys = new Set(legalModels.map((model) => JSON.stringify(model)));

  for (const control of controls) {
    for (const option of control.options) {
      const value = optionValue(option);
      const reachable = legalModels.some((model) => model[control.key] === value);
      if (!reachable) failures.push(`${component.id}/${control.key}=${value} has no legal reachable model`);
    }
  }

  const renderedModels = new Set();
  for (const model of legalModels) {
    const label = controls.map((control) => `${control.key}=${model[control.key]}`).join("/");
    const output = definition.render(model);
    if (!output.includes(`data-preview-variant="${model.variant}"`)) {
      failures.push(`${component.id}/${label} does not expose its selected variant`);
    }
    if (!output.includes(`data-preview-state="${model.state}"`)) {
      failures.push(`${component.id}/${label} does not expose its resolved state`);
    }
    collectRenderedClasses(output);
    validateReferenceMarkup(component.id, label, definition.markup(model));
    renderedModels.add(output);
  }
  if (!renderedModels.size || !legalKeys.size) {
    failures.push(`${component.id} did not render its legal model matrix`);
  }
}

for (const definition of specimenDefinitions) {
  for (const className of definition.interactionClasses || []) renderedSpecimenClasses.add(className);
}

for (const className of cssSpecimenClasses) {
  if (!renderedSpecimenClasses.has(className)) {
    failures.push(`CSS specimen selector .${className} is never rendered by any SpecimenDefinition`);
  }
}

for (const pattern of guidancePatterns) {
  for (const componentId of pattern.coreComponents) {
    if (!componentIds.has(componentId)) failures.push(`${pattern.id} references missing component ${componentId}`);
  }
}

const expected = {
  foundations: 10,
  primitives: 9,
  components: 30,
  guidance: 8,
  compositions: 6,
  total: 63,
};

for (const [key, value] of Object.entries(expected)) {
  if (catalogSummary[key] !== value) failures.push(`Expected ${key}=${value}, received ${catalogSummary[key]}`);
}

if (specimenCoverage.components !== 30 || specimenCoverage.uniqueDefinitions !== 30) {
  failures.push(`Expected 30 unique SpecimenDefinitions, received ${specimenCoverage.uniqueDefinitions}`);
}
if (new Set(specimenDefinitions.map((definition) => definition.render)).size !== specimenDefinitions.length) {
  failures.push("Each component must own a distinct render function");
}
if (!guidanceSpecimenCoverage.complete || guidanceSpecimenCoverage.patterns !== guidancePatterns.length) {
  failures.push(
    `Expected one Guidance specimen per pattern, received ${guidanceSpecimenCoverage.patterns}/${guidancePatterns.length}`,
  );
}
for (const primitive of primitives) {
  if (!primitive.variants.length) failures.push(`${primitive.id} has no visualized Primitive variant`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Registry valid: ${catalogSummary.total} entries, ${tokenSource.tokens.length} tokens, ${guidancePatterns.length} guidance patterns; ` +
      `${specimenCoverage.components} component specimens, ${guidanceSpecimenCoverage.patterns} pattern specimens, ` +
      `${specimenCoverage.variants} declared variants, ${specimenCoverage.states} declared scenarios.`,
  );
}
