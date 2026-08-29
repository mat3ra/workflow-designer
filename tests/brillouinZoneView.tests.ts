/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    computeBrillouinZoneFaces,
    SUPPORTED_LATTICE_TYPES,
} from "@mat3ra/workflow-designer/src/components/common/brillouinZoneGeometry";
import {
    isFacingViewer,
    projectForTesting,
} from "@mat3ra/workflow-designer/src/components/common/BrillouinZone";
import assert from "node:assert";
import test from "node:test";

test("the c axis is vertical on screen", () => {
    // A lattice type is named for what its c axis does — HEX's six-fold axis, TET's long axis —
    // so +z has to point up, or every uniaxial zone is drawn lying on its side.
    const up = projectForTesting([0, 0, 1]);
    const down = projectForTesting([0, 0, -1]);
    // SVG y grows downward, so "above" is the smaller value.
    assert.ok(up.y < down.y, `+c should sit above -c, got ${up.y} vs ${down.y}`);
    assert.ok(Math.abs(up.x) < 1e-9, "the c axis should not lean sideways");
    assert.ok(Math.abs(down.x) < 1e-9, "the c axis should not lean sideways");
});

test("the three axes project to three distinct screen directions", () => {
    // What makes a three-quarter view readable: no axis hidden behind another, none seen
    // edge-on. At the current yaw a points up-right, b down-right and c straight up.
    const axes = [
        projectForTesting([1, 0, 0]),
        projectForTesting([0, 1, 0]),
        projectForTesting([0, 0, 1]),
    ];
    axes.forEach(({ x, y }, index) => {
        assert.ok(Math.hypot(x, y) > 0.1, `axis ${index} is seen end-on`);
    });
    for (let i = 0; i < axes.length; i += 1) {
        for (let j = i + 1; j < axes.length; j += 1) {
            // Parallel on screen (either direction) means one axis hides behind another.
            const cross = axes[i].x * axes[j].y - axes[i].y * axes[j].x;
            assert.ok(Math.abs(cross) > 0.05, `axes ${i} and ${j} project onto one line`);
        }
    }
});

test("depth grows toward the viewer", () => {
    // The face the viewer looks at must sort after the one behind it, or the painter's algorithm
    // draws the zone inside out.
    const near = projectForTesting([0, 1, 0]);
    const far = projectForTesting([0, -1, 0]);
    assert.ok(near.depth > far.depth);
});

SUPPORTED_LATTICE_TYPES.forEach((latticeType) => {
    test(`${latticeType}: every face normal points out of the zone`, () => {
        const faces = computeBrillouinZoneFaces(latticeType);
        assert.ok(faces, `${latticeType} should produce faces`);
        // Culling is only correct if normals point outward. The origin is inside a convex zone,
        // so each of a face's own vertices must lie on the far side of the origin along its normal.
        faces!.forEach(({ vertices, normal }) => {
            vertices.forEach((vertex) => {
                const distance =
                    vertex[0] * normal[0] + vertex[1] * normal[1] + vertex[2] * normal[2];
                assert.ok(distance > 1e-9, `${latticeType}: inward normal, got ${distance}`);
            });
        });
    });

    test(`${latticeType}: the view shows exactly half the faces`, () => {
        const faces = computeBrillouinZoneFaces(latticeType)!;
        // A Brillouin zone is centrosymmetric — every face has an opposite partner — so a view
        // that catches no face edge-on sees exactly half of them. Fewer means the solid is being
        // drawn with holes; more means back faces are showing through the front.
        const visible = faces.filter((face) => isFacingViewer(face.normal)).length;
        assert.strictEqual(visible, faces.length / 2, `${latticeType}: ${visible}/${faces.length}`);
    });
});
