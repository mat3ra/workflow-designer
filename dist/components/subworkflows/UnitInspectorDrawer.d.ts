import { type AnySubworkflowUnit } from "@mat3ra/wode";
import React from "react";
export interface UnitInspectorDrawerProps {
    /** The unit to inspect. `null` closes the drawer. */
    unit: AnySubworkflowUnit | null;
    unitIndex: number;
    onClose: () => void;
    onContextChanged: () => void;
    id?: string;
}
/**
 * One unit's settings, beside the flowchart that selects it.
 *
 * Adjusting a unit used to mean leaving the flowchart for the Settings tab,
 * finding that unit among all the others, changing it, and coming back to see
 * what it did — a bounce between three tabs for one edit, with the diagram that
 * gives the change its meaning off screen the whole time. Here the unit stays
 * selected in the flowchart while its settings are open next to it.
 *
 * A plain MUI `Drawer` rather than cove's `ResizableDrawer`: that one is anchored
 * to the bottom and resizes on height only, and generalising it to two axes is a
 * change to a shared component with its own consumers. The width handle here is
 * a few lines and does not put them at risk.
 */
export default function UnitInspectorDrawer({ unit, unitIndex, onClose, onContextChanged, id, }: UnitInspectorDrawerProps): React.JSX.Element;
//# sourceMappingURL=UnitInspectorDrawer.d.ts.map