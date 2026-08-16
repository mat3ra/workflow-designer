import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { computeBrillouinZoneFaces, computeBrillouinZoneFacesFromReciprocalVectors, } from "./brillouinZoneGeometry";
/** Fixed three-quarter view; the zone is a static illustration, not an interactive scene. */
const VIEW_YAW = Math.PI / 5;
const VIEW_PITCH = Math.PI / 7;
const SIZE = 220;
const PADDING = 12;
function project([x, y, z]) {
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
function projectFaces(faces) {
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
    return (projectedByFace
        .map((projected, index) => {
        const points = projected
            .map((p) => `${(offsetX + (p.x - minX) * scaleFactor).toFixed(2)},${(offsetY +
            (p.y - minY) * scaleFactor).toFixed(2)}`)
            .join(" ");
        const depth = projected.reduce((sum, p) => sum + p.depth, 0) / (projected.length || 1);
        // Lambert-ish shading from a light above and to the viewer's left.
        const [nx, ny, nz] = faces[index].normal;
        const shade = Math.max(0, nx * -0.3 + ny * 0.55 + nz * 0.78);
        return { points, depth, shade };
    })
        // Painter's algorithm: the zone is convex, so far-to-near ordering hides back faces.
        .sort((left, right) => left.depth - right.depth));
}
/**
 * Draws the first Brillouin zone for a lattice type instead of fetching a per-lattice PNG.
 *
 * Hosts that ship their own artwork keep passing `BrillouinZoneImageComponent`; this is the
 * default for everyone else, where `imgSrc` points at an asset that does not exist (see
 * {@link computeBrillouinZoneFaces}). Falls back to the image for lattice types it cannot model.
 */
export function BrillouinZone({ reciprocalVectors, latticeType, imgSrc, description, }) {
    const theme = useTheme();
    const faces = useMemo(() => reciprocalVectors
        ? computeBrillouinZoneFacesFromReciprocalVectors(reciprocalVectors)
        : computeBrillouinZoneFaces(latticeType !== null && latticeType !== void 0 ? latticeType : ""), [reciprocalVectors, latticeType]);
    const projected = useMemo(() => (faces ? projectFaces(faces) : null), [faces]);
    if (!projected) {
        if (!imgSrc)
            return null;
        return (_jsx(Box, { className: "brillouin-zone brillouin-zone--image", children: _jsx("img", { src: imgSrc, alt: description || "Brillouin zone", style: { maxWidth: "100%" } }) }));
    }
    const faceColor = theme.palette.primary.main;
    const edgeColor = theme.palette.mode === "dark" ? "#0d1117" : "#ffffff";
    return (_jsxs(Box, { className: "brillouin-zone", "data-tid": "brillouin-zone", sx: { my: 1 }, children: [_jsx("svg", { width: SIZE, height: SIZE, viewBox: `0 0 ${SIZE} ${SIZE}`, role: "img", "aria-label": `First Brillouin zone of a ${latticeType} lattice`, children: projected.map((face) => (_jsx("polygon", { points: face.points, fill: faceColor, fillOpacity: 0.25 + 0.6 * face.shade, stroke: edgeColor, strokeWidth: 1, strokeLinejoin: "round" }, face.points))) }), _jsxs(Typography, { variant: "caption", color: "text.secondary", component: "div", children: ["First Brillouin zone \u2014 ", latticeType, " lattice"] }), description ? (_jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", children: description })) : null] }));
}
export default BrillouinZone;
