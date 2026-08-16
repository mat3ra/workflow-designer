/**
 * First Brillouin zone geometry — the Wigner-Seitz cell of the reciprocal lattice.
 *
 * `@mat3ra/wove` renders the zone by pointing an `<img>` at
 * `/images/brillouin_zone/<lattice>.png`, an asset that ships with the web app only: every
 * other consumer of the designer (standalone demo, Storybook, embedders) gets a broken image,
 * and the absolute path cannot resolve under a non-root deployment base. The lattice type is
 * already known at that point, so the zone can be derived instead of fetched.
 */

export type Vector3 = [number, number, number];

export interface BrillouinZoneFace {
    /** Polygon vertices in reciprocal space, ordered counter-clockwise about {@link normal}. */
    vertices: Vector3[];
    /** Outward unit normal — the reciprocal lattice vector whose bisector plane cuts this face. */
    normal: Vector3;
}

const SQRT3_OVER_2 = Math.sqrt(3) / 2;

/**
 * Primitive vectors per Bravais lattice type, in units of `a`. Non-cubic types have shape
 * degrees of freedom (c/a, angles) that the lattice *type* alone does not fix; those use
 * representative ratios, matching what a single canonical image per type also depicts.
 */
const PRIMITIVE_VECTORS_BY_LATTICE_TYPE: Record<string, [Vector3, Vector3, Vector3]> = {
    CUB: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ],
    FCC: [
        [0, 0.5, 0.5],
        [0.5, 0, 0.5],
        [0.5, 0.5, 0],
    ],
    BCC: [
        [-0.5, 0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, 0.5, -0.5],
    ],
    TET: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1.4],
    ],
    BCT: [
        [-0.5, 0.5, 0.7],
        [0.5, -0.5, 0.7],
        [0.5, 0.5, -0.7],
    ],
    ORC: [
        [1, 0, 0],
        [0, 1.3, 0],
        [0, 0, 1.7],
    ],
    ORCF: [
        [0, 0.65, 0.85],
        [0.5, 0, 0.85],
        [0.5, 0.65, 0],
    ],
    ORCI: [
        [-0.5, 0.65, 0.85],
        [0.5, -0.65, 0.85],
        [0.5, 0.65, -0.85],
    ],
    ORCC: [
        [0.5, -0.65, 0],
        [0.5, 0.65, 0],
        [0, 0, 1.7],
    ],
    HEX: [
        [0.5, -SQRT3_OVER_2, 0],
        [0.5, SQRT3_OVER_2, 0],
        [0, 0, 1.6],
    ],
    RHL: [
        [0.9, -0.5, 0.3],
        [0.9, 0.5, 0.3],
        [0.2, 0, 1.05],
    ],
    MCL: [
        [1, 0, 0],
        [0, 1.2, 0],
        [0, 0.55, 1.4],
    ],
    MCLC: [
        [0.5, 0.6, 0],
        [-0.5, 0.6, 0],
        [0, 0.55, 1.4],
    ],
    TRI: [
        [1, 0, 0],
        [0.25, 1.15, 0],
        [0.3, 0.35, 1.3],
    ],
};

function cross(a: Vector3, b: Vector3): Vector3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vector3, b: Vector3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function subtract(a: Vector3, b: Vector3): Vector3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale(a: Vector3, factor: number): Vector3 {
    return [a[0] * factor, a[1] * factor, a[2] * factor];
}

function length(a: Vector3): number {
    return Math.sqrt(dot(a, a));
}

function normalize(a: Vector3): Vector3 {
    const magnitude = length(a);
    return magnitude === 0 ? [0, 0, 0] : scale(a, 1 / magnitude);
}

/**
 * `2π` is omitted: it scales every reciprocal vector equally, and the zone is drawn normalized.
 */
function reciprocalVectors(
    a1: Vector3,
    a2: Vector3,
    a3: Vector3,
): [Vector3, Vector3, Vector3] | null {
    const volume = dot(a1, cross(a2, a3));
    if (Math.abs(volume) < 1e-12) {
        return null;
    }
    return [
        scale(cross(a2, a3), 1 / volume),
        scale(cross(a3, a1), 1 / volume),
        scale(cross(a1, a2), 1 / volume),
    ];
}

/** Solves `M x = rhs` for 3×3 `M` by Cramer's rule; null when `M` is singular. */
function solve3x3(rows: [Vector3, Vector3, Vector3], rhs: Vector3): Vector3 | null {
    const determinant = dot(rows[0], cross(rows[1], rows[2]));
    if (Math.abs(determinant) < 1e-9) {
        return null;
    }
    /** Determinant of `rows` with column `index` replaced by `rhs`. */
    const replacedDeterminant = (index: 0 | 1 | 2): number => {
        const replaced = rows.map((row, rowIndex) => {
            const next: Vector3 = [...row];
            next[index] = rhs[rowIndex];
            return next;
        }) as [Vector3, Vector3, Vector3];
        return dot(replaced[0], cross(replaced[1], replaced[2]));
    };
    return [
        replacedDeterminant(0) / determinant,
        replacedDeterminant(1) / determinant,
        replacedDeterminant(2) / determinant,
    ];
}

const TOLERANCE = 1e-7;

/**
 * Builds the first Brillouin zone: the set of points closer to the origin than to any other
 * reciprocal lattice point, i.e. the intersection of the half-spaces `x·G ≤ |G|²/2`. Vertices
 * are the plane triple-intersections that satisfy every other half-space; faces group the
 * vertices lying on each plane.
 */
export function computeBrillouinZoneFaces(latticeType: string): BrillouinZoneFace[] | null {
    const key = String(latticeType || "")
        .toUpperCase()
        .split(/[_\-\s]/)[0];
    const primitiveVectors = PRIMITIVE_VECTORS_BY_LATTICE_TYPE[key];
    if (!primitiveVectors) {
        return null;
    }
    const reciprocal = reciprocalVectors(...primitiveVectors);
    if (!reciprocal) {
        return null;
    }
    const [b1, b2, b3] = reciprocal;

    const reciprocalLatticePoints: Vector3[] = [];
    for (let h = -2; h <= 2; h += 1) {
        for (let k = -2; k <= 2; k += 1) {
            for (let l = -2; l <= 2; l += 1) {
                if (h !== 0 || k !== 0 || l !== 0) {
                    reciprocalLatticePoints.push([
                        h * b1[0] + k * b2[0] + l * b3[0],
                        h * b1[1] + k * b2[1] + l * b3[1],
                        h * b1[2] + k * b2[2] + l * b3[2],
                    ]);
                }
            }
        }
    }
    // Only the nearest shells can bound the cell; trimming keeps the triple loop small.
    const planes = reciprocalLatticePoints
        .sort((left, right) => length(left) - length(right))
        .slice(0, 40)
        .map((g) => ({ normal: g, offset: dot(g, g) / 2 }));

    const isInsideCell = (point: Vector3) =>
        planes.every((plane) => dot(point, plane.normal) <= plane.offset + TOLERANCE);

    const vertices: Vector3[] = [];
    for (let i = 0; i < planes.length; i += 1) {
        for (let j = i + 1; j < planes.length; j += 1) {
            for (let k = j + 1; k < planes.length; k += 1) {
                const point = solve3x3(
                    [planes[i].normal, planes[j].normal, planes[k].normal],
                    [planes[i].offset, planes[j].offset, planes[k].offset],
                );
                const isCellVertex = Boolean(point) && isInsideCell(point as Vector3);
                const isDuplicate =
                    isCellVertex &&
                    vertices.some(
                        (existing) => length(subtract(existing, point as Vector3)) < 1e-6,
                    );
                if (isCellVertex && !isDuplicate) {
                    vertices.push(point as Vector3);
                }
            }
        }
    }
    if (vertices.length < 4) {
        return null;
    }

    const faces: BrillouinZoneFace[] = [];
    planes.forEach((plane) => {
        const onPlane = vertices.filter(
            (vertex) => Math.abs(dot(vertex, plane.normal) - plane.offset) < 1e-6,
        );
        if (onPlane.length < 3) return;

        // Order the polygon by angle around the face normal, in an in-plane basis.
        const normal = normalize(plane.normal);
        const centroid = scale(
            onPlane.reduce<Vector3>(
                (sum, v) => [sum[0] + v[0], sum[1] + v[1], sum[2] + v[2]],
                [0, 0, 0],
            ),
            1 / onPlane.length,
        );
        const reference = normalize(subtract(onPlane[0], centroid));
        const bitangent = cross(normal, reference);
        const ordered = [...onPlane].sort((left, right) => {
            const leftOffset = subtract(left, centroid);
            const rightOffset = subtract(right, centroid);
            return (
                Math.atan2(dot(leftOffset, bitangent), dot(leftOffset, reference)) -
                Math.atan2(dot(rightOffset, bitangent), dot(rightOffset, reference))
            );
        });
        faces.push({ vertices: ordered, normal });
    });

    return faces.length >= 4 ? faces : null;
}

export const SUPPORTED_LATTICE_TYPES = Object.keys(PRIMITIVE_VECTORS_BY_LATTICE_TYPE);

export const brillouinZoneTestables = { dot, cross, length, normalize, subtract, scale };
