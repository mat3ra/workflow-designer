import type { UiSchema } from "@rjsf/utils";

/**
 * Important-settings context providers that back an `RJSForm` in this feature.
 * Intersects each concrete provider type with the JSON/ui schema fields the guard asserts.
 */
export type ImportantSettingsFormProvider<T = unknown> = T & {
    name: string;
    jsonSchema: object;
    uiSchema: UiSchema;
};

/**
 * Same defaults as `JSONSchemaFormMixin` in `imports/mixins/json_schema.ts` (`defaultFieldStyles`),
 * with `classNames` stripped before merge (matching `uiSchemaStyled`).
 */
function defaultFieldStylesForMerge(): Record<string, unknown> {
    const raw = {
        "ui:options": {
            label: false,
            description: false,
            title: false,
        },
        "ui:fieldFlexWidth": 3,
    } as Record<string, unknown>;
    const { classNames: _omitClassNames, ...rest } = raw;
    return rest;
}

/**
 * Field labels the wode provider uiSchemas do not carry themselves (SOF-8024, quick win 1.2).
 * Keyed by provider `name`, then schema field. Units are engine-specific (Ry for Quantum
 * ESPRESSO), which the provider's own description already states, so labels stay unitless.
 */
const POINTS_GRID_FIELD_LABELS: Record<string, string> = {
    dimensions: "Dimensions",
    shifts: "Shifts",
    reciprocalVectorRatios: "Reciprocal vector ratios",
    gridMetricValue: "Grid metric value",
    // What the flag does, rather than wode's "prefer KPPRA": with it set, the dimensions are
    // computed from the metric instead of typed in, and their inputs go read-only.
    preferGridMetric: "Derive dimensions from the metric",
};

const PROVIDER_FIELD_LABELS: Record<string, Record<string, string>> = {
    cutoffs: {
        wavefunction: "Wavefunction cutoff",
        density: "Charge density cutoff",
    },
    kgrid: POINTS_GRID_FIELD_LABELS,
    qgrid: POINTS_GRID_FIELD_LABELS,
    igrid: POINTS_GRID_FIELD_LABELS,
};

/**
 * Adds titles to named fields without touching the provider's own layout — for the unit-scoped
 * forms (grids), which need RJSF's labelled layout and only lack the labels themselves.
 *
 * `PointsGridFormDataProvider` does supply titles, but through a `dependencies` branch in its
 * `jsonSchemaPatchConfig`, and esse's `applyPatchWithDotNotation` drops the whole `dependencies`
 * key (as it drops the sibling `gridMetricType.default`) because neither resolves against the
 * schema root — the same silent-skip that hides the cutoff defaults. Until wode spells those
 * paths out, the labels come from here.
 */
export function withFieldTitles(
    uiSchema: UiSchema | undefined,
    providerName?: string,
): UiSchema | undefined {
    const fieldLabels = providerName && PROVIDER_FIELD_LABELS[providerName];
    if (!fieldLabels) {
        return uiSchema;
    }
    const merged: UiSchema = { ...(uiSchema ?? {}) };
    Object.entries(fieldLabels).forEach(([field, title]) => {
        const existing = merged[field];
        merged[field] =
            existing && typeof existing === "object" && !Array.isArray(existing)
                ? { ...(existing as Record<string, unknown>), "ui:title": title }
                : { "ui:title": title };
    });
    return merged;
}

/**
 * Shallow-merges default layout into each top-level entry of `uiSchema`, matching
 * `JSONSchemaFormMixin#uiSchemaStyled` without mutating the input. The defaults suppress
 * per-field labels; fields listed in {@link PROVIDER_FIELD_LABELS} for `providerName`
 * re-enable them with an explicit title instead of rendering bare inputs.
 */
export function mergeUiSchemaWithDefaultFieldStyles(
    uiSchema: UiSchema | undefined,
    providerName?: string,
): UiSchema {
    const defaultFieldStyles = defaultFieldStylesForMerge();
    const fieldLabels = (providerName && PROVIDER_FIELD_LABELS[providerName]) || {};
    // Not every provider ships a uiSchema; those render with RJSF's own field layout.
    return Object.fromEntries(
        Object.keys(uiSchema ?? {}).map((key) => {
            const value = uiSchema[key];
            if (value === false) {
                return [key, false] as const;
            }
            if (value && typeof value === "object" && !Array.isArray(value)) {
                const label = fieldLabels[key];
                const labelOverrides = label
                    ? {
                          "ui:title": label,
                          "ui:options": {
                              ...(defaultFieldStyles["ui:options"] as Record<string, unknown>),
                              label: true,
                              title: true,
                          },
                      }
                    : {};
                return [
                    key,
                    {
                        ...(value as Record<string, unknown>),
                        ...defaultFieldStyles,
                        ...labelOverrides,
                    },
                ] as const;
            }
            return [key, value] as const;
        }),
    ) as UiSchema;
}
