/** A label anchored to a point in the drawing, before and after separation. */
export interface PlacedLabel {
    /** The marker the label belongs to. */
    x: number;
    y: number;
    label: string;
    labelX: number;
    labelY: number;
}

/** Roughly how wide a glyph is relative to its font size, for the overlap boxes below. */
const GLYPH_ASPECT = 0.62;
const PADDING = 1.5;
/** Enough passes to settle a dozen labels; the loop stops early once nothing overlaps. */
const MAX_PASSES = 80;
/** A label may drift this far from where the radial offset first put it, in viewBox units. */
const MAX_DRIFT = 14;

function halfExtents(label: string, fontSize: number): [number, number] {
    return [(label.length * fontSize * GLYPH_ASPECT) / 2 + PADDING, fontSize / 2 + PADDING];
}

/**
 * Nudges labels apart so they can be read.
 *
 * High-symmetry points crowd into one irreducible wedge — a monoclinic lattice puts seventeen of
 * them in a corner of the picture — so offsetting each label radially still leaves them stacked.
 * This spreads any that overlap, in the plane, while keeping each within {@link MAX_DRIFT} of its
 * own marker so it stays attributable to the right point.
 *
 * Deterministic: passes run in a fixed order and depend only on the input, so the same zone always
 * draws the same way.
 */
export function separateLabels<T extends PlacedLabel>(labels: T[], fontSizes: number[]): T[] {
    const placed = labels.map((item) => ({ ...item }));
    const anchors = placed.map((item) => ({ x: item.labelX, y: item.labelY }));
    const extents = placed.map((item, index) => halfExtents(item.label, fontSizes[index]));

    for (let pass = 0; pass < MAX_PASSES; pass += 1) {
        let moved = false;
        for (let i = 0; i < placed.length; i += 1) {
            for (let j = i + 1; j < placed.length; j += 1) {
                const dx = placed[j].labelX - placed[i].labelX;
                const dy = placed[j].labelY - placed[i].labelY;
                const overlapX = extents[i][0] + extents[j][0] - Math.abs(dx);
                const overlapY = extents[i][1] + extents[j][1] - Math.abs(dy);
                const bothLabelled = Boolean(placed[i].label && placed[j].label);
                if (bothLabelled && overlapX > 0 && overlapY > 0) {
                    moved = true;
                    // Separate along whichever axis needs the smaller push, so labels stay near
                    // their markers rather than sliding the length of the picture.
                    if (overlapY <= overlapX) {
                        const shift = (overlapY / 2 + 0.5) * (dy < 0 ? -1 : 1);
                        placed[i].labelY -= shift;
                        placed[j].labelY += shift;
                    } else {
                        const shift = (overlapX / 2 + 0.5) * (dx < 0 ? -1 : 1);
                        placed[i].labelX -= shift;
                        placed[j].labelX += shift;
                    }
                }
            }
        }
        // Pull anything that has wandered too far back toward its own marker.
        placed.forEach((item, index) => {
            const dx = item.labelX - anchors[index].x;
            const dy = item.labelY - anchors[index].y;
            const drift = Math.hypot(dx, dy);
            if (drift > MAX_DRIFT) {
                const scale = MAX_DRIFT / drift;
                placed[index].labelX = anchors[index].x + dx * scale;
                placed[index].labelY = anchors[index].y + dy * scale;
            }
        });
        if (!moved) break;
    }
    return placed;
}
