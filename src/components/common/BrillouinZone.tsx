import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";

import {
    type BrillouinZoneFace,
    type Vector3,
    computeBrillouinZoneFaces,
    computeBrillouinZoneFacesFromReciprocalVectors,
} from "./brillouinZoneGeometry";

/** A leg of the k-path, in the same cartesian reciprocal units as the zone's own vectors. */
export interface BrillouinZonePathPoint {
    point: string;
    coordinates: Vector3;
}

export interface BrillouinZoneProps {
    /**
     * Reciprocal vectors of the material's own lattice
     * (`new ReciprocalLattice(material.lattice).reciprocalVectors`). Preferred: exact for this
     * material. wove's component contract does not carry them, so the call site supplies them.
     */
    reciprocalVectors?: [Vector3, Vector3, Vector3];
    /** Bravais lattice type, e.g. `FCC` — used only when {@link reciprocalVectors} is absent. */
    latticeType?: string;
    /** Web-app asset path wove derives from the lattice; used only as a last fallback. */
    imgSrc?: string;
    description?: string;
    /** The k-path currently being edited, drawn inside the zone and labelled at each point. */
    path?: BrillouinZonePathPoint[];
    /**
     * Every high-symmetry point of this lattice. Those the path does not visit are drawn faintly,
     * so the picture also answers where a path *could* go — for FCC or HEX the default path
     * happens to reach all of them, but a rhombohedral or monoclinic lattice has several it never
     * touches, and those were invisible.
     */
    symmetryPoints?: BrillouinZonePathPoint[];
}

/** Fixed three-quarter view; the zone is a static illustration, not an interactive scene. */
const VIEW_YAW = Math.PI / 5;
const VIEW_PITCH = Math.PI / 7;
const SIZE = 240;
const PADDING = 20;
/** How far a k-point's label sits from its marker, radially outward from the zone centre. */
const LABEL_OFFSET = 10;

interface ProjectedPoint {
    x: number;
    y: number;
    depth: number;
}

function project([x, y, z]: Vector3): ProjectedPoint {
    const cosYaw = Math.cos(VIEW_YAW);
    const sinYaw = Math.sin(VIEW_YAW);
    const rotatedX = x * cosYaw + z * sinYaw;
    const rotatedZ = -x * sinYaw + z * cosYaw;

    const cosPitch = Math.cos(VIEW_PITCH);
    const sinPitch = Math.sin(VIEW_PITCH);
    const rotatedY = y * cosPitch - rotatedZ * sinPitch;

    // SVG's y axis grows downward, hence the negation.
    return { x: rotatedX, y: -rotatedY, depth: y * sinPitch + rotatedZ * cosPitch };
}

interface ProjectedFace {
    points: string;
    depth: number;
    shade: number;
}

interface Scene {
    faces: ProjectedFace[];
    /** Maps any point of reciprocal space into the same view the zone was drawn in. */
    toScreen: (vector: Vector3) => { x: number; y: number };
}

/**
 * Fits the zone to the viewport once and hands the same transform back, so anything else drawn
 * in reciprocal space — the k-path, its labels — lands where the zone puts it.
 */
function buildScene(faces: BrillouinZoneFace[]): Scene {
    const projectedByFace = faces.map((face) => face.vertices.map(project));
    const all = projectedByFace.flat();
    const minX = Math.min(...all.map((p) => p.x));
    const maxX = Math.max(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y));
    const maxY = Math.max(...all.map((p) => p.y));
    const span = Math.max(maxX - minX, maxY - minY) || 1;
    const scaleFactor = (SIZE - 2 * PADDING) / span;
    const offsetX = PADDING + (SIZE - 2 * PADDING - (maxX - minX) * scaleFactor) / 2;
    const offsetY = PADDING + (SIZE - 2 * PADDING - (maxY - minY) * scaleFactor) / 2;

    const place = (p: ProjectedPoint) => ({
        x: offsetX + (p.x - minX) * scaleFactor,
        y: offsetY + (p.y - minY) * scaleFactor,
    });

    const projectedFaces = projectedByFace
        .map((projected, index) => {
            const points = projected
                .map(place)
                .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
                .join(" ");
            const depth = projected.reduce((sum, p) => sum + p.depth, 0) / (projected.length || 1);
            // Lambert-ish shading from a light above and to the viewer's left.
            const [nx, ny, nz] = faces[index].normal;
            const shade = Math.max(0, nx * -0.3 + ny * 0.55 + nz * 0.78);
            return { points, depth, shade };
        })
        // Painter's algorithm: the zone is convex, so far-to-near ordering hides back faces.
        .sort((left, right) => left.depth - right.depth);

    return { faces: projectedFaces, toScreen: (vector) => place(project(vector)) };
}

/**
 * Draws the first Brillouin zone for a lattice type instead of fetching a per-lattice PNG.
 *
 * Hosts that ship their own artwork keep passing `BrillouinZoneImageComponent`; this is the
 * default for everyone else, where `imgSrc` points at an asset that does not exist (see
 * {@link computeBrillouinZoneFaces}). Falls back to the image for lattice types it cannot model.
 */
export function BrillouinZone({
    reciprocalVectors,
    latticeType,
    imgSrc,
    description,
    path,
    symmetryPoints,
}: BrillouinZoneProps) {
    const theme = useTheme();
    const faces = useMemo(
        () =>
            reciprocalVectors
                ? computeBrillouinZoneFacesFromReciprocalVectors(reciprocalVectors)
                : computeBrillouinZoneFaces(latticeType ?? ""),
        [reciprocalVectors, latticeType],
    );
    const scene = useMemo(() => (faces ? buildScene(faces) : null), [faces]);
    const projected = scene?.faces ?? null;

    /**
     * Each point once, at its first appearance, so a path returning to Γ is not labelled twice.
     * Labels are pushed away from the zone centre: high-symmetry points sit in one irreducible
     * wedge, so a fixed offset would stack them all on top of each other.
     */
    const place = useMemo(() => {
        if (!scene) return null;
        const origin = scene.toScreen([0, 0, 0]);
        return (item: BrillouinZonePathPoint, label: string) => {
            const { x, y } = scene.toScreen(item.coordinates);
            const [dx, dy] = [x - origin.x, y - origin.y];
            const distance = Math.hypot(dx, dy) || 1;
            return {
                x,
                y,
                label,
                labelX: x + (dx / distance) * LABEL_OFFSET,
                // Γ sits at the origin, where there is no outward direction — nudge it up.
                labelY: distance > 1 ? y + (dy / distance) * LABEL_OFFSET : y - LABEL_OFFSET,
            };
        };
    }, [scene]);

    const drawnPath = useMemo(() => {
        if (!place || !path?.length) return null;
        const seen = new Set<string>();
        const points = path.map((item) => {
            const isFirst = !seen.has(item.point);
            seen.add(item.point);
            return place(item, isFirst ? item.point : "");
        });
        return { points, polyline: points.map((p) => `${p.x},${p.y}`).join(" ") };
    }, [place, path]);

    /** Symmetry points the path never reaches — drawn, but quietly. */
    const unvisitedPoints = useMemo(() => {
        if (!place || !symmetryPoints?.length) return null;
        const visited = new Set((path ?? []).map((item) => item.point));
        const rest = symmetryPoints.filter((item) => !visited.has(item.point));
        return rest.length ? rest.map((item) => place(item, item.point)) : null;
    }, [place, symmetryPoints, path]);

    if (!projected) {
        if (!imgSrc) return null;
        return (
            <Box className="brillouin-zone brillouin-zone--image">
                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                <img
                    src={imgSrc}
                    alt={description || "Brillouin zone"}
                    style={{ maxWidth: "100%" }}
                />
            </Box>
        );
    }

    const faceColor = theme.palette.primary.main;
    const edgeColor = theme.palette.mode === "dark" ? "#0d1117" : "#ffffff";
    const pathColor = theme.palette.secondary.main;

    return (
        <Box className="brillouin-zone" data-tid="brillouin-zone" sx={{ my: 1 }}>
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={
                    drawnPath
                        ? `K-path through the first Brillouin zone of a ${latticeType} lattice, ` +
                          `with its high-symmetry points labelled`
                        : `First Brillouin zone of a ${latticeType} lattice`
                }
            >
                {projected.map((face) => (
                    <polygon
                        key={face.points}
                        points={face.points}
                        // The path runs through the zone, so the solid is dimmed to let it read.
                        fillOpacity={
                            (drawnPath ? 0.15 : 0.25) + (drawnPath ? 0.35 : 0.6) * face.shade
                        }
                        fill={faceColor}
                        stroke={edgeColor}
                        strokeWidth={1}
                        strokeLinejoin="round"
                    />
                ))}
                {unvisitedPoints ? (
                    <g data-tid="brillouin-zone-symmetry-points" opacity={0.55}>
                        {unvisitedPoints.map((point) => (
                            <React.Fragment key={point.label}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={1.8}
                                    fill={edgeColor}
                                    stroke={pathColor}
                                    strokeWidth={1}
                                />
                                <text
                                    x={point.labelX}
                                    y={point.labelY}
                                    fontSize={9}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={pathColor}
                                    stroke={edgeColor}
                                    strokeWidth={2}
                                    paintOrder="stroke"
                                >
                                    {point.label}
                                </text>
                            </React.Fragment>
                        ))}
                    </g>
                ) : null}
                {drawnPath ? (
                    <g data-tid="brillouin-zone-path">
                        <polyline
                            points={drawnPath.polyline}
                            fill="none"
                            stroke={edgeColor}
                            strokeOpacity={0.65}
                            strokeWidth={4}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        <polyline
                            points={drawnPath.polyline}
                            fill="none"
                            stroke={pathColor}
                            strokeWidth={2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {drawnPath.points.map((point) => (
                            <circle
                                key={`${point.x},${point.y}`}
                                cx={point.x}
                                cy={point.y}
                                r={2.5}
                                fill={pathColor}
                                stroke={edgeColor}
                                strokeWidth={1}
                            />
                        ))}
                        {drawnPath.points
                            .filter((point) => point.label)
                            .map((point) => (
                                <text
                                    key={point.label}
                                    x={point.labelX}
                                    y={point.labelY}
                                    fontSize={11}
                                    fontWeight={700}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={pathColor}
                                    stroke={edgeColor}
                                    strokeWidth={2.5}
                                    paintOrder="stroke"
                                >
                                    {point.label}
                                </text>
                            ))}
                    </g>
                ) : null}
            </svg>
            <Typography variant="caption" color="text.secondary" component="div">
                First Brillouin zone — {latticeType} lattice
            </Typography>
            {description ? (
                <Typography variant="caption" color="text.secondary" component="div">
                    {description}
                </Typography>
            ) : null}
        </Box>
    );
}

export default BrillouinZone;
