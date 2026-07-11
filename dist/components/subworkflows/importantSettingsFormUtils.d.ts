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
 * `JSONSchemaFormMixin#uiSchemaStyled` without mutating the input.
 */
export declare function mergeUiSchemaWithDefaultFieldStyles(uiSchema: UiSchema): UiSchema;
//# sourceMappingURL=importantSettingsFormUtils.d.ts.map