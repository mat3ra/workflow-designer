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
 * Shallow-merges default layout into each top-level entry of `uiSchema`, matching
 * `JSONSchemaFormMixin#uiSchemaStyled` without mutating the input. The defaults suppress
 * per-field labels; fields listed in {@link PROVIDER_FIELD_LABELS} for `providerName`
 * re-enable them with an explicit title instead of rendering bare inputs.
 */
export declare function mergeUiSchemaWithDefaultFieldStyles(uiSchema: UiSchema, providerName?: string): UiSchema;
//# sourceMappingURL=importantSettingsFormUtils.d.ts.map