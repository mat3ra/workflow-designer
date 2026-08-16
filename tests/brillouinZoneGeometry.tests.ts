/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    computeBrillouinZoneFaces,
    computeBrillouinZoneFacesFromReciprocalVectors,
} from "@mat3ra/workflow-designer/src/components/common/brillouinZoneGeometry";
import assert from "node:assert";
import test from "node:test";

/** Distinct vertices across all faces, keyed by rounded coordinates. */
function countVertices(faces: NonNullable<ReturnType<typeof computeBrillouinZoneFaces>>): number {
    const keys = new Set<string>();
    faces.forEach((face) =>
        face.vertices.forEach((vertex) =>
            keys.add(vertex.map((component) => component.toFixed(5)).join(",")),
        ),
    );
    return keys.size;
}

function countEdges(faces: NonNullable<ReturnType<typeof computeBrillouinZoneFaces>>): number {
    return faces.reduce((sum, face) => sum + face.vertices.length, 0) / 2;
}

test("cubic lattice zone is a cube", () => {
    const faces = computeBrillouinZoneFaces("CUB");
    assert.ok(faces);
    assert.strictEqual(faces.length, 6);
    assert.strictEqual(countVertices(faces), 8);
    assert.ok(faces.every((face) => face.vertices.length === 4));
});

test("face-centered cubic zone is a truncated octahedron", () => {
    const faces = computeBrillouinZoneFaces("FCC");
    assert.ok(faces);
    assert.strictEqual(faces.length, 14);
    assert.strictEqual(countVertices(faces), 24);
    assert.strictEqual(faces.filter((face) => face.vertices.length === 6).length, 8);
    assert.strictEqual(faces.filter((face) => face.vertices.length === 4).length, 6);
});

test("body-centered cubic zone is a rhombic dodecahedron", () => {
    const faces = computeBrillouinZoneFaces("BCC");
    assert.ok(faces);
    assert.strictEqual(faces.length, 12);
    assert.strictEqual(countVertices(faces), 14);
});

test("hexagonal zone is a hexagonal prism", () => {
    const faces = computeBrillouinZoneFaces("HEX");
    assert.ok(faces);
    assert.strictEqual(faces.length, 8);
    assert.strictEqual(faces.filter((face) => face.vertices.length === 6).length, 2);
    assert.strictEqual(faces.filter((face) => face.vertices.length === 4).length, 6);
});

test("every supported zone is a closed convex polyhedron (Euler characteristic 2)", () => {
    ["CUB", "FCC", "BCC", "TET", "BCT", "ORC", "ORCF", "ORCI", "ORCC", "HEX", "RHL"].forEach(
        (latticeType) => {
            const faces = computeBrillouinZoneFaces(latticeType);
            assert.ok(faces, `${latticeType} produced no faces`);
            assert.strictEqual(
                countVertices(faces) - countEdges(faces) + faces.length,
                2,
                `${latticeType} is not a closed polyhedron`,
            );
        },
    );
});

test("extended lattice type names resolve to their base type", () => {
    const extended = computeBrillouinZoneFaces("TRI_1a");
    assert.ok(extended);
    assert.strictEqual(extended.length, computeBrillouinZoneFaces("TRI")?.length);
});

test("unknown lattice types return null so callers can fall back to an image", () => {
    assert.strictEqual(computeBrillouinZoneFaces("NOT_A_LATTICE"), null);
    assert.strictEqual(computeBrillouinZoneFaces(""), null);
});

test("reciprocal vectors of a cubic lattice give a cube", () => {
    const faces = computeBrillouinZoneFacesFromReciprocalVectors([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ]);
    assert.ok(faces);
    assert.strictEqual(faces.length, 6);
    assert.strictEqual(countVertices(faces), 8);
});

test("a material's own lattice shapes the zone, not just its type", () => {
    // Same hexagonal type, different c/a: a slab's large vacuum spacing flattens the zone.
    const bulk = computeBrillouinZoneFacesFromReciprocalVectors([
        [1, -0.577, 0],
        [1, 0.577, 0],
        [0, 0, 0.6],
    ]);
    const slab = computeBrillouinZoneFacesFromReciprocalVectors([
        [1, -0.577, 0],
        [1, 0.577, 0],
        [0, 0, 0.05],
    ]);
    assert.ok(bulk);
    assert.ok(slab);
    assert.strictEqual(bulk.length, slab.length, "same face count for the same lattice type");

    const height = (faces: NonNullable<typeof bulk>) => {
        const z = faces.flatMap((face) => face.vertices.map((vertex) => vertex[2]));
        return Math.max(...z) - Math.min(...z);
    };
    assert.ok(height(slab) < height(bulk) / 5, "the slab's zone is flattened along kz");
});

test("degenerate reciprocal vectors return null instead of throwing", () => {
    assert.strictEqual(
        computeBrillouinZoneFacesFromReciprocalVectors([
            [1, 0, 0],
            [1, 0, 0],
            [0, 0, 1],
        ]),
        null,
    );
});
