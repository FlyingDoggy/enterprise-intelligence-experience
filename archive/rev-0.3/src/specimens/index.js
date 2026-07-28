import { components } from "../design-system-data.js";
import { contentActionDefinitions } from "./content-action.js";
import { dataFeedbackDefinitions } from "./data-feedback.js";
import { formDefinitions } from "./forms.js";
import { navigationOverlayDefinitions } from "./navigation-overlay.js";
import { shellDefinitions } from "./shell.js";

export const specimenDefinitions = [
  ...contentActionDefinitions,
  ...navigationOverlayDefinitions,
  ...formDefinitions,
  ...dataFeedbackDefinitions,
  ...shellDefinitions,
];

const definitionById = new Map();
specimenDefinitions.forEach((definition) => {
  if (definitionById.has(definition.id)) {
    throw new Error(`Duplicate SpecimenDefinition: ${definition.id}`);
  }
  definitionById.set(definition.id, definition);
});

const missing = components.filter((component) => !definitionById.has(component.id));
const orphaned = specimenDefinitions.filter(
  (definition) => !components.some((component) => component.id === definition.id),
);

if (missing.length || orphaned.length) {
  throw new Error(
    `Specimen registry mismatch. Missing: ${missing.map((item) => item.id).join(", ") || "none"}; orphaned: ${
      orphaned.map((item) => item.id).join(", ") || "none"
    }`,
  );
}

components.forEach((component) => {
  const definition = definitionById.get(component.id);
  if (!component.variants.includes(definition.defaultVariant)) {
    throw new Error(`${component.id} has invalid default variant: ${definition.defaultVariant}`);
  }
  if (!component.states.includes(definition.defaultState)) {
    throw new Error(`${component.id} has invalid default state: ${definition.defaultState}`);
  }
  if (typeof definition.render !== "function" || typeof definition.markup !== "function") {
    throw new Error(`${component.id} must provide render() and markup()`);
  }
});

export function getSpecimenDefinition(componentId) {
  const definition = definitionById.get(componentId);
  if (!definition) throw new Error(`Unknown SpecimenDefinition: ${componentId}`);
  return definition;
}

export const specimenCoverage = {
  components: specimenDefinitions.length,
  variants: components.reduce((total, component) => total + component.variants.length, 0),
  states: components.reduce((total, component) => total + component.states.length, 0),
  uniqueDefinitions: definitionById.size,
  complete: specimenDefinitions.length === components.length,
};
