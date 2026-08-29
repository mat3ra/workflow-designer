/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    buildUnitPropertiesSchema,
    isSchemaResolvable,
} from "@mat3ra/workflow-designer/src/components/subworkflows/unitPropertiesSchema";
import assert from "node:assert";
import test from "node:test";

test("a schema whose $ref has no definition is not resolvable", () => {
    // Exactly what `buildNamedEntitySchema` returns for an executable with no declared results,
    // and exactly what RJSF throws on mid-render.
    assert.strictEqual(
        isSchemaResolvable({
            type: "array",
            items: { $ref: "#/definitions/Property" },
            uniqueItems: true,
        }),
        false,
    );
});

test("a schema whose $ref resolves is resolvable", () => {
    assert.strictEqual(
        isSchemaResolvable({
            definitions: { Property: { type: "object" } },
            type: "array",
            items: { $ref: "#/definitions/Property" },
        }),
        true,
    );
});

test("dangling refs are caught at any depth, including inside arrays", () => {
    assert.strictEqual(
        isSchemaResolvable({
            definitions: { Property: { type: "object" } },
            anyOf: [{ items: { properties: { x: { $ref: "#/definitions/Missing" } } } }],
        }),
        false,
    );
});

test("refs that are not local definitions are left alone", () => {
    // Only `#/definitions/...` is this schema's business to resolve.
    assert.strictEqual(isSchemaResolvable({ items: { $ref: "https://example.com/x.json" } }), true);
});

test("no allowed results yields no schema rather than a broken one", () => {
    assert.strictEqual(buildUnitPropertiesSchema([]), null);
    assert.strictEqual(buildUnitPropertiesSchema(undefined), null);
});

test("allowed results yield a schema carrying the definition its items point at", () => {
    const schema = buildUnitPropertiesSchema([{ name: "band_gaps" }] as never);
    assert.ok(schema, "a schema should be built when there is something to choose from");
    assert.ok(isSchemaResolvable(schema));
    assert.ok("Property" in ((schema as { definitions: object }).definitions ?? {}));
});
