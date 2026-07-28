import { components, foundations, primitives } from "./design-system-data.js";
import { guidancePatterns } from "./guidance-data.js";

function designSystemEntry(kind, item) {
  return {
    id: item.id,
    kind,
    route: `/design-system/${kind}/${item.id}`,
    title: item.title,
    maturity: item.maturity || "Candidate",
    tags: [kind, item.cn, item.category].filter(Boolean),
    relatedIds: item.relatedIds || [],
  };
}

function guidanceEntry(pattern) {
  return {
    id: pattern.id,
    kind: pattern.maturity === "Composition" ? "composition" : "guidance",
    route: `/guidance/${pattern.contract}/${pattern.id}`,
    title: pattern.name,
    maturity: pattern.maturity,
    tags: [pattern.contract, pattern.workObject, ...pattern.semanticAxes],
    relatedIds: pattern.coreComponents,
  };
}

/**
 * Single source for catalog navigation, overview, search, related links and
 * route coverage tests.
 */
export const catalogRegistry = [
  ...foundations.map((item) => designSystemEntry("foundations", item)),
  ...primitives.map((item) => designSystemEntry("primitives", item)),
  ...components.map((item) => designSystemEntry("components", item)),
  ...guidancePatterns.map(guidanceEntry),
];

const entryByKey = new Map(catalogRegistry.map((entry) => [`${entry.kind}:${entry.id}`, entry]));

export function findCatalogEntry(kind, id) {
  return entryByKey.get(`${kind}:${id}`) || catalogRegistry.find((entry) => entry.id === id) || null;
}

export function searchCatalog(query, scope = "all") {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  return catalogRegistry.filter((entry) => {
    if (scope === "design-system" && !["foundations", "primitives", "components"].includes(entry.kind)) return false;
    if (scope === "guidance" && !["guidance", "composition"].includes(entry.kind)) return false;
    if (!normalized) return true;
    const haystack = [entry.id, entry.title, entry.kind, ...entry.tags].join(" ").toLocaleLowerCase("zh-CN");
    return haystack.includes(normalized);
  });
}

export const catalogSummary = {
  total: catalogRegistry.length,
  foundations: catalogRegistry.filter((entry) => entry.kind === "foundations").length,
  primitives: catalogRegistry.filter((entry) => entry.kind === "primitives").length,
  components: catalogRegistry.filter((entry) => entry.kind === "components").length,
  guidance: catalogRegistry.filter((entry) => entry.kind === "guidance").length,
  compositions: catalogRegistry.filter((entry) => entry.kind === "composition").length,
};
