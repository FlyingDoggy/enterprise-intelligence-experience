/**
 * Stable categorical series identity for EIX visualizations.
 *
 * A ChartSpec may declare `encoding.series.registry` to preserve the same
 * series-to-slot mapping across sorting, filtering and related views. When a
 * registry is absent, the reference renderer derives a deterministic
 * lexicographic registry from the visible data. Production consumers should
 * persist the declared registry with the analysis result.
 */

export const SERIES_SLOT_COUNT = 10;
export const DEFAULT_VISIBLE_SERIES = 5;
export const DENSE_VISIBLE_SERIES = 8;

export function seriesField(spec) {
  return (
    spec.encoding?.series?.field ||
    (spec.encoding?.color?.type === "nominal" ? spec.encoding?.color?.field : null)
  );
}

export function visibleSeriesIds(spec) {
  const field = seriesField(spec);
  if (!field) return [];
  return [
    ...new Set(
      (spec.data || [])
        .map((row) => row[field])
        .filter((value) => value !== undefined && value !== null)
        .map(String),
    ),
  ];
}

export function declaredSeriesRegistry(spec) {
  const declared = spec.encoding?.series?.registry;
  if (Array.isArray(declared) && declared.length > 0) {
    return [...new Set(declared.map(String))];
  }
  return visibleSeriesIds(spec).sort((left, right) => left.localeCompare(right, "zh-CN"));
}

export function seriesSlot(spec, seriesId) {
  const registry = declaredSeriesRegistry(spec);
  const index = registry.indexOf(String(seriesId));
  return index < 0 ? 1 : (index % SERIES_SLOT_COUNT) + 1;
}

export function seriesProfile(spec) {
  return spec.encoding?.series?.paletteProfile || "default";
}

export function visibleSeriesLimit(spec) {
  const profile = seriesProfile(spec);
  if (profile === "dense") return DENSE_VISIBLE_SERIES;
  if (profile === "emphasis") return SERIES_SLOT_COUNT;
  return DEFAULT_VISIBLE_SERIES;
}

export function seriesColorVariable(spec, seriesId) {
  return `var(--eix-viz-series-${seriesSlot(spec, seriesId)})`;
}
