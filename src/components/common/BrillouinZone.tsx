import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";

import {
    type BrillouinZoneFace,
    type Vector3,
    computeBrillouinZoneFaces,
} from "./brillouinZoneGeometry";

export interface BrillouinZoneProps {
    /** Bravais lattice type of the material, e.g. `FCC` (from wove's context provider). */
    latticeType?: string;
    /** Web-app asset path wove derives from the lattice; used only as a fallback. */
    imgSrc?: string;
    description?: string;
}

/** Fixed three-quarter view; the zone is a static illustration, not an interactive scene. */
const VIEW_YAW = Math.PI / 5;
const VIEW_PITCH = Math.PI / 7;
const SIZE = 220;
const PADDING = 12;

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

function projectFaces(faces: BrillouinZoneFace[]): ProjectedFace[] {
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

    return (
        projectedByFace
            .map((projected, index) => {
                const points = projected
                    .map(
                        (p) =>
                            `${(offsetX + (p.x - minX) * scaleFactor).toFixed(2)},${(
                                offsetY +
                                (p.y - minY) * scaleFactor
                            ).toFixed(2)}`,
                    )
                    .join(" ");
                const depth =
                    projected.reduce((sum, p) => sum + p.depth, 0) / (projected.length || 1);
                // Lambert-ish shading from a light above and to the viewer's left.
                const [nx, ny, nz] = faces[index].normal;
                const shade = Math.max(0, nx * -0.3 + ny * 0.55 + nz * 0.78);
                return { points, depth, shade };
            })
            // Painter's algorithm: the zone is convex, so far-to-near ordering hides back faces.
            .sort((left, right) => left.depth - right.depth)
    );
}

/**
 * Draws the first Brillouin zone for a lattice type instead of fetching a per-lattice PNG.
 *
 * Hosts that ship their own artwork keep passing `BrillouinZoneImageComponent`; this is the
 * default for everyone else, where `imgSrc` points at an asset that does not exist (see
 * {@link computeBrillouinZoneFaces}). Falls back to the image for lattice types it cannot model.
 */
export function BrillouinZone({ latticeType, imgSrc, description }: BrillouinZoneProps) {
    const theme = useTheme();
    const faces = useMemo(() => computeBrillouinZoneFaces(latticeType ?? ""), [latticeType]);
    const projected = useMemo(() => (faces ? projectFaces(faces) : null), [faces]);

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

    return (
        <Box className="brillouin-zone" data-tid="brillouin-zone" sx={{ my: 1 }}>
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`First Brillouin zone of a ${latticeType} lattice`}
            >
                {projected.map((face) => (
                    <polygon
                        key={face.points}
                        points={face.points}
                        fill={faceColor}
                        fillOpacity={0.25 + 0.6 * face.shade}
                        stroke={edgeColor}
                        strokeWidth={1}
                        strokeLinejoin="round"
                    />
                ))}
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
