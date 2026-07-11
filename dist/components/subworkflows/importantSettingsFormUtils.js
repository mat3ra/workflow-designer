/**
 * Same defaults as `JSONSchemaFormMixin` in `imports/mixins/json_schema.ts` (`defaultFieldStyles`),
 * with `classNames` stripped before merge (matching `uiSchemaStyled`).
 */
function defaultFieldStylesForMerge() {
    const raw = {
        "ui:options": {
            label: false,
            description: false,
            title: false,
        },
        "ui:fieldFlexWidth": 3,
    };
    const { classNames: _omitClassNames, ...rest } = raw;
    return rest;
}
/**
 * Shallow-merges default layout into each top-level entry of `uiSchema`, matching
 * `JSONSchemaFormMixin#uiSchemaStyled` without mutating the input.
 */
export function mergeUiSchemaWithDefaultFieldStyles(uiSchema) {
    const defaultFieldStyles = defaultFieldStylesForMerge();
    return Object.fromEntries(Object.keys(uiSchema).map((key) => {
        const value = uiSchema[key];
        if (value === false) {
            return [key, false];
        }
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return [
                key,
                {
                    ...value,
                    ...defaultFieldStyles,
                },
            ];
        }
        return [key, value];
    }));
}
