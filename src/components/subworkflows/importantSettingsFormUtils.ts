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
 * Shallow-merges default layout into each top-level entry of `uiSchema`, matching
 * `JSONSchemaFormMixin#uiSchemaStyled` without mutating the input.
 */
export function mergeUiSchemaWithDefaultFieldStyles(uiSchema: UiSchema): UiSchema {
    const defaultFieldStyles = defaultFieldStylesForMerge();
    return Object.fromEntries(
        Object.keys(uiSchema).map((key) => {
            const value = uiSchema[key];
            if (value === false) {
                return [key, false] as const;
            }
            if (value && typeof value === "object" && !Array.isArray(value)) {
                return [
                    key,
                    {
                        ...(value as Record<string, unknown>),
                        ...defaultFieldStyles,
                    },
                ] as const;
            }
            return [key, value] as const;
        }),
    ) as UiSchema;
}
