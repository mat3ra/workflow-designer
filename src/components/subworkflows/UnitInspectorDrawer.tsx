import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { type AnySubworkflowUnit, type ExecutionUnit } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import { ImportantSettingsForUnit } from "./ImportantSettings";

/** Width bounds for the drag handle. Narrower than this and the forms stop fitting. */
const MIN_WIDTH = 320;
const MAX_WIDTH = 900;
const DEFAULT_WIDTH = 460;

export interface UnitInspectorDrawerProps {
    /** The unit to inspect. `null` closes the drawer. */
    unit: AnySubworkflowUnit | null;
    unitIndex: number;
    onClose: () => void;
    onContextChanged: () => void;
    id?: string;
}

function isExecutionUnit(unit: AnySubworkflowUnit): unit is ExecutionUnit {
    // Schema `type`, not `instanceof`: units may come from a second compiled copy
    // of `@mat3ra/wode` (see the note in ImportantSettings).
    return unit.type === "execution";
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
export default function UnitInspectorDrawer({
    unit,
    unitIndex,
    onClose,
    onContextChanged,
    id = "unit-inspector-drawer",
}: UnitInspectorDrawerProps) {
    const [width, setWidth] = React.useState(DEFAULT_WIDTH);
    const isResizing = React.useRef(false);

    React.useEffect(() => {
        const resize = (event: MouseEvent) => {
            if (!isResizing.current) return;
            // The drawer is anchored right, so its width is the distance from the
            // pointer to the right edge of the window.
            const next = window.innerWidth - event.clientX;
            setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
        };
        const stop = () => {
            isResizing.current = false;
        };

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stop);

        return () => {
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", stop);
        };
    }, []);

    return (
        <Drawer
            id={id}
            anchor="right"
            open={Boolean(unit)}
            onClose={onClose}
            // Persistent would leave the flowchart squeezed; temporary keeps the
            // diagram at full width and lets Escape and a backdrop click close it.
            variant="temporary"
            PaperProps={{ sx: { width, maxWidth: "100vw" } }}
        >
            <Box
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize the inspector"
                onMouseDown={() => {
                    isResizing.current = true;
                }}
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    cursor: "col-resize",
                    "&:hover": { bgcolor: "action.hover" },
                }}
            />

            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ p: 2, pl: 3, borderBottom: "1px solid", borderColor: "divider" }}
            >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                        {unit?.name ?? "Unit"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Unit {unitIndex + 1}
                        {unit?.type ? ` · ${unit.type}` : ""}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} aria-label="Close the inspector">
                    <IconByName name="actions.close" fontSize="small" />
                </IconButton>
            </Stack>

            <Box sx={{ overflowY: "auto", px: 3, pb: 3 }}>
                {unit && isExecutionUnit(unit) ? (
                    <ImportantSettingsForUnit
                        unit={unit}
                        unitIndex={unitIndex}
                        onContextChanged={onContextChanged}
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
                        {unit
                            ? `A ${unit.type} unit has no important settings to adjust.`
                            : "Select a unit in the flowchart."}
                    </Typography>
                )}
            </Box>
        </Drawer>
    );
}
