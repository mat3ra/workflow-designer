/**
 * The k-path as physicists write it — Γ → X → W, so many points per leg — rather than as the
 * schema stores it: a flat array where each entry's `steps` silently describes the leg *leaving*
 * that point, and the last entry's `steps` is read by nobody.
 *
 * Kept free of React so the editing rules are testable on their own.
 */
export interface KPathPoint {
    point: string;
    steps: number;
    [key: string]: unknown;
}

/** A leg of the path: from one high-symmetry point to the next. */
export interface KPathSegment {
    /** Index into the path array of the point the leg starts at — also where `steps` is stored. */
    index: number;
    from: string;
    to: string;
    steps: number;
}

interface SchemaLike {
    type?: unknown;
    items?: { properties?: { point?: { enum?: unknown }; steps?: unknown } };
}

/**
 * True for the schema every points-path provider shares (k-path, q-path, i-path, and the
 * explicit variants), matched by shape so new providers on the same schema are picked up.
 */
export function isPointsPathSchema(schema: unknown): boolean {
    const candidate = schema as SchemaLike | null;
    if (!candidate || candidate.type !== "array") return false;
    const properties = candidate.items?.properties;
    return Boolean(properties?.point && properties?.steps);
}

/** High-symmetry points of this material's lattice, which the provider patches onto the schema. */
export function getSymmetryPointOptions(schema: unknown): string[] {
    const values = (schema as SchemaLike | null)?.items?.properties?.point?.enum;
    return Array.isArray(values) ? values.map(String) : [];
}

export function toPath(formData: unknown): KPathPoint[] {
    if (!Array.isArray(formData)) return [];
    return formData.filter((item) => item && typeof item === "object") as KPathPoint[];
}

/** Legs of the path; a single point has none, and the trailing `steps` is deliberately unused. */
export function getSegments(path: KPathPoint[]): KPathSegment[] {
    return path.slice(0, -1).map((item, index) => ({
        index,
        from: item.point,
        to: path[index + 1].point,
        steps: Number(item.steps) || 0,
    }));
}

/**
 * How many k-points the path costs — the number that decides how long the band structure runs,
 * and which the per-row form left to be added up by hand. Each leg contributes `steps` points
 * (its start plus the interpolated interior) and the final point closes the path.
 */
export function countKPoints(path: KPathPoint[]): number {
    if (path.length === 0) return 0;
    return getSegments(path).reduce((sum, segment) => sum + Math.max(0, segment.steps), 0) + 1;
}

export function setPointAt(path: KPathPoint[], index: number, point: string): KPathPoint[] {
    return path.map((item, i) => (i === index ? { ...item, point } : item));
}

export function setStepsAt(path: KPathPoint[], index: number, steps: number): KPathPoint[] {
    return path.map((item, i) => (i === index ? { ...item, steps } : item));
}

/**
 * Splits a leg in two. The new point takes the leg's step count so the path keeps roughly the
 * same resolution, and a name distinct from both neighbours so the leg is not zero-length.
 */
export function insertPointAfter(
    path: KPathPoint[],
    index: number,
    options: string[],
): KPathPoint[] {
    if (index < 0 || index >= path.length) return path;
    const previous = path[index];
    const next = path[index + 1];
    const point =
        options.find((option) => option !== previous?.point && option !== next?.point) ??
        options[0] ??
        previous?.point ??
        "";
    const inserted: KPathPoint = { point, steps: Number(previous?.steps) || 10 };
    return [...path.slice(0, index + 1), inserted, ...path.slice(index + 1)];
}

/** Removing below two points would leave no path at all, so the last pair is kept. */
export function removePointAt(path: KPathPoint[], index: number): KPathPoint[] {
    if (path.length <= 2 || index < 0 || index >= path.length) return path;
    return path.filter((_item, i) => i !== index);
}
