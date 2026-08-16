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
/**
 * Builds the first Brillouin zone from the reciprocal lattice vectors: the set of points
 * closer to the origin than to any other reciprocal lattice point, i.e. the intersection of
 * the half-spaces `x·G ≤ |G|²/2`. Vertices are the plane triple-intersections that satisfy
 * every other half-space; faces group the vertices lying on each plane.
 *
 * Prefer this over {@link computeBrillouinZoneFaces}: it is exact for the material at hand,
 * where the lattice *type* alone leaves the cell shape underdetermined. Pass
 * `new ReciprocalLattice(material.lattice).reciprocalVectors` from `@mat3ra/made`.
 */
export declare function computeBrillouinZoneFacesFromReciprocalVectors(vectors: [Vector3, Vector3, Vector3]): BrillouinZoneFace[] | null;
/**
 * Zone for a Bravais lattice *type*, for callers that have no material to hand.
 *
 * The type alone does not fix the cell: non-cubic systems have c/a and angle freedom, so
 * {@link PRIMITIVE_VECTORS_BY_LATTICE_TYPE} stands in representative ratios — the same
 * compromise a single canonical image per type makes. Exact for the cubic systems.
 */
export declare function computeBrillouinZoneFaces(latticeType: string): BrillouinZoneFace[] | null;
export declare const SUPPORTED_LATTICE_TYPES: string[];
//# sourceMappingURL=brillouinZoneGeometry.d.ts.map