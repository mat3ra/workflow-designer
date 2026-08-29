import { type NameResultSchema, safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import { buildNamedEntitySchema } from "@mat3ra/code/dist/js/utils/schemas";

/** The definition name `buildNamedEntitySchema` is asked for, and points `items.$ref` at. */
export const PROPERTY_DEFINITION = "Property";

const LOCAL_REF_PREFIX = "#/definitions/";

/**
 * Whether every local `$ref` in the schema has a definition to resolve to.
 *
 * `buildNamedEntitySchema` points `items` at `#/definitions/Property` but omits `definitions`
 * entirely when handed nothing to choose from. RJSF throws on the dangling `$ref` *during render*,
 * and an uncaught render throw unmounts the whole designer — so the schema is checked before a
 * form is built from it rather than after the page has gone blank.
 */
export function isSchemaResolvable(schema: unknown): boolean {
    if (!schema || typeof schema !== "object") {
        return false;
    }
    const definitions = (schema as { definitions?: Record<string, unknown> }).definitions ?? {};
    let resolvable = true;
    const walk = (node: unknown) => {
        if (!resolvable || !node || typeof node !== "object") {
            return;
        }
        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }
        Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
            if (key === "$ref" && typeof value === "string" && value.startsWith(LOCAL_REF_PREFIX)) {
                if (!(value.slice(LOCAL_REF_PREFIX.length) in definitions)) {
                    resolvable = false;
                }
                return;
            }
            walk(value);
        });
    };
    walk(schema);
    return resolvable;
}

/** The array-of-properties schema for a unit, or `null` when there is no usable form to build. */
export function buildUnitPropertiesSchema(
    allowedResults: NameResultSchema[] | undefined,
): Record<string, unknown> | null {
    const safeAllowedResults = allowedResults ?? [];
    const schema = buildNamedEntitySchema(
        safeAllowedResults,
        { name: safeAllowedResults[0]?.name || "" },
        PROPERTY_DEFINITION,
    ) as Record<string, unknown>;
    return isSchemaResolvable(schema) ? schema : null;
}

/** A unit's own results, normalized to the objects the form and the chips both expect. */
export function getUnitResults(unit: { results?: unknown[] }): NameResultSchema[] {
    return (unit.results || []).map(safeMakeObject);
}
