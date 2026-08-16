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
const PROVIDER_FIELD_LABELS: Record<string, Record<string, string>> = {
    cutoffs: {
        wavefunction: "Wavefunction cutoff",
        density: "Charge density cutoff",
    },
};

/**
 * Shallow-merges default layout into each top-level entry of `uiSchema`, matching
 * `JSONSchemaFormMixin#uiSchemaStyled` without mutating the input. The defaults suppress
 * per-field labels; fields listed in {@link PROVIDER_FIELD_LABELS} for `providerName`
 * re-enable them with an explicit title instead of rendering bare inputs.
 */
export function mergeUiSchemaWithDefaultFieldStyles(
    uiSchema: UiSchema,
    providerName?: string,
): UiSchema {
    const defaultFieldStyles = defaultFieldStylesForMerge();
    const fieldLabels = (providerName && PROVIDER_FIELD_LABELS[providerName]) || {};
    return Object.fromEntries(
        Object.keys(uiSchema).map((key) => {
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
