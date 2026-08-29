/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    type KPathPoint,
    countKPoints,
    getSegments,
    getSymmetryPointOptions,
    insertPointAfter,
    isPointsPathSchema,
    removePointAt,
    setPointAt,
    setStepsAt,
    toPath,
} from "@mat3ra/workflow-designer/src/components/subworkflows/kPath";
import assert from "node:assert";
import test from "node:test";

const OPTIONS = ["Г", "X", "W", "K", "L", "U"];

/** The default FCC path wode derives for silicon. */
const FCC_PATH: KPathPoint[] = ["Г", "X", "W", "K", "Г", "L", "U", "W", "L", "U", "X"].map(
    (point) => ({ point, steps: 10 }),
);

const SCHEMA = {
    type: "array",
    items: {
        type: "object",
        properties: { point: { type: "string", enum: OPTIONS }, steps: { type: "number" } },
    },
};

test("the points-path schema is recognized by shape, not by provider name", () => {
    assert.ok(isPointsPathSchema(SCHEMA));
    assert.ok(!isPointsPathSchema({ type: "object", properties: { dimensions: {} } }));
    assert.ok(!isPointsPathSchema({ type: "array", items: { properties: { steps: {} } } }));
    assert.ok(!isPointsPathSchema(undefined));
    assert.ok(!isPointsPathSchema(null));
});

test("symmetry point options come from the enum the provider patches in", () => {
    assert.deepStrictEqual(getSymmetryPointOptions(SCHEMA), OPTIONS);
    assert.deepStrictEqual(getSymmetryPointOptions({ type: "array", items: {} }), []);
});

test("non-array form data yields an empty path rather than throwing", () => {
    assert.deepStrictEqual(toPath(undefined), []);
    assert.deepStrictEqual(toPath({ point: "Г" }), []);
    assert.deepStrictEqual(toPath([null, { point: "Г", steps: 5 }]), [{ point: "Г", steps: 5 }]);
});

test("legs run between consecutive points, one fewer than the points", () => {
    const segments = getSegments(FCC_PATH);
    assert.strictEqual(segments.length, FCC_PATH.length - 1);
    assert.deepStrictEqual(segments[0], { index: 0, from: "Г", to: "X", steps: 10 });
    assert.strictEqual(segments[segments.length - 1].to, "X");
});

test("a single point has no legs", () => {
    assert.deepStrictEqual(getSegments([{ point: "Г", steps: 10 }]), []);
});

test("the k-point count sums the legs and closes on the final point", () => {
    // 10 legs × 10 steps, plus the point that ends the path.
    assert.strictEqual(countKPoints(FCC_PATH), 101);
    assert.strictEqual(
        countKPoints([
            { point: "Г", steps: 20 },
            { point: "X", steps: 5 },
        ]),
        21,
    );
    assert.strictEqual(countKPoints([]), 0);
});

test("the trailing point's steps never reach the count, since no leg leaves it", () => {
    const withHugeTail = setStepsAt(FCC_PATH, FCC_PATH.length - 1, 9999);
    assert.strictEqual(countKPoints(withHugeTail), countKPoints(FCC_PATH));
});

test("negative or missing step counts do not subtract from the total", () => {
    assert.strictEqual(
        countKPoints([
            { point: "Г", steps: -5 },
            { point: "X", steps: 10 },
        ]),
        1,
    );
});

test("editing a point or a leg leaves the rest of the path untouched", () => {
    const renamed = setPointAt(FCC_PATH, 1, "L");
    assert.strictEqual(renamed[1].point, "L");
    assert.strictEqual(renamed[0].point, "Г");
    assert.strictEqual(renamed.length, FCC_PATH.length);
    assert.strictEqual(FCC_PATH[1].point, "X", "input is not mutated");

    const restepped = setStepsAt(FCC_PATH, 0, 40);
    assert.strictEqual(restepped[0].steps, 40);
    assert.strictEqual(restepped[1].steps, 10);
    assert.strictEqual(countKPoints(restepped), 131);
});

test("splitting a leg inserts a point distinct from both its neighbours", () => {
    const split = insertPointAfter(FCC_PATH, 0, OPTIONS);
    assert.strictEqual(split.length, FCC_PATH.length + 1);
    assert.strictEqual(split[0].point, "Г");
    assert.strictEqual(split[2].point, "X");
    assert.ok(split[1].point !== "Г" && split[1].point !== "X");
    assert.strictEqual(split[1].steps, 10, "the new leg keeps the resolution of the one it split");
});

test("splitting falls back sensibly when the lattice offers no alternatives", () => {
    const path = [
        { point: "Г", steps: 10 },
        { point: "X", steps: 10 },
    ];
    assert.strictEqual(insertPointAfter(path, 0, ["Г", "X"])[1].point, "Г");
    assert.strictEqual(insertPointAfter(path, 0, [])[1].point, "Г");
});

test("splitting past the end of the path is a no-op", () => {
    assert.strictEqual(insertPointAfter(FCC_PATH, 99, OPTIONS), FCC_PATH);
    assert.strictEqual(insertPointAfter(FCC_PATH, -1, OPTIONS), FCC_PATH);
});

test("removing a point drops exactly one and rejoins the path across it", () => {
    const shorter = removePointAt(FCC_PATH, 1);
    assert.strictEqual(shorter.length, FCC_PATH.length - 1);
    assert.deepStrictEqual(getSegments(shorter)[0], { index: 0, from: "Г", to: "W", steps: 10 });
});

test("the last two points cannot be removed — a path needs somewhere to go", () => {
    const pair = [
        { point: "Г", steps: 10 },
        { point: "X", steps: 10 },
    ];
    assert.strictEqual(removePointAt(pair, 0), pair);
    assert.strictEqual(removePointAt(FCC_PATH, 99), FCC_PATH);
});
