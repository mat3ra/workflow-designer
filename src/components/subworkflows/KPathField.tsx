import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useCallback, useState } from "react";

import {
    type KPathPoint,
    countKPoints,
    getSegments,
    getSymmetryPointOptions,
    insertPointAfter,
    removePointAt,
    setPointAt,
    setStepsAt,
    toPath,
} from "./kPath";

interface KPathFieldProps {
    schema: unknown;
    formData?: unknown;
    disabled?: boolean;
    readonly?: boolean;
    onChange: (formData: unknown) => void;
}

/** Editing controls stay quiet until wanted; the path itself is what should read. */
const QUIET_BUTTON = {
    opacity: 0.35,
    transition: "opacity 120ms",
    "&:hover": { opacity: 1 },
    "&:focus-visible": { opacity: 1 },
} as const;

/**
 * The path as a chain of chips — `Γ 10→ X 10→ W` — instead of one `point` / `steps` row per entry.
 *
 * The array form stacked eleven identical rows for a routine FCC path, gave no clue that a
 * point's `steps` belongs to the leg *after* it (and that the last one is ignored), and never
 * showed the number that actually matters: how many k-points the path costs. Each point is a
 * chip so its remove control sits inside its own outline — a bare `✕` between a point and a
 * step count reads as multiplication.
 */
export default function KPathField({
    schema,
    formData,
    disabled,
    readonly,
    onChange,
}: KPathFieldProps) {
    const [menu, setMenu] = useState<{ anchor: HTMLElement; index: number } | null>(null);
    const path = toPath(formData);
    const options = getSymmetryPointOptions(schema);
    const segments = getSegments(path);
    const isLocked = Boolean(disabled || readonly);

    const update = useCallback(
        (next: KPathPoint[]) => {
            setMenu(null);
            onChange(next);
        },
        [onChange],
    );

    if (path.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No path defined for this lattice.
            </Typography>
        );
    }

    const renderPoint = (item: KPathPoint, index: number) => (
        <Chip
            label={item.point}
            size="small"
            variant="outlined"
            data-tid={`kpath-point-${index}`}
            onClick={
                isLocked || options.length === 0
                    ? undefined
                    : (event: React.MouseEvent<HTMLElement>) =>
                          setMenu({ anchor: event.currentTarget, index })
            }
            onDelete={
                isLocked || path.length <= 2 ? undefined : () => update(removePointAt(path, index))
            }
            deleteIcon={
                <IconByName
                    name="actions.close"
                    data-tid={`kpath-remove-${index}`}
                    aria-label={`Remove point ${index + 1}, ${item.point}`}
                    sx={QUIET_BUTTON}
                />
            }
            sx={{
                fontWeight: 700,
                fontSize: 14,
                // Point names are one or two characters, which would leave the delete icon
                // occupying most of the chip — including the spot a pointer lands on first.
                "& .MuiChip-label": { minWidth: 26, textAlign: "center", px: 1 },
            }}
        />
    );

    /** The leg leaving point `index`: its k-point count, and the place to split it. */
    const renderSegment = (index: number) => {
        const legLabel = `${path[index].point} to ${path[index + 1].point}`;
        return (
            <Stack direction="row" alignItems="center" sx={{ color: "text.secondary" }}>
                <Tooltip title={`K-points from ${legLabel}`}>
                    <TextField
                        size="small"
                        type="number"
                        variant="standard"
                        value={path[index].steps}
                        disabled={isLocked}
                        onChange={(event) =>
                            update(setStepsAt(path, index, Number(event.target.value)))
                        }
                        inputProps={{
                            min: 1,
                            "data-tid": `kpath-steps-${index}`,
                            "aria-label": `K-points from ${legLabel}`,
                            style: { textAlign: "center", padding: "2px 0" },
                        }}
                        sx={{ width: 44, mx: 0.5 }}
                    />
                </Tooltip>
                <Box aria-hidden sx={{ fontSize: 18, lineHeight: 1 }}>
                    →
                </Box>
                <Tooltip title={`Insert a point between ${legLabel}`}>
                    <span>
                        <IconButton
                            size="small"
                            disabled={isLocked}
                            onClick={() => update(insertPointAfter(path, index, options))}
                            data-tid={`kpath-insert-${index}`}
                            aria-label={`Insert a point between ${legLabel}`}
                            sx={QUIET_BUTTON}
                        >
                            <IconByName name="shapes.addCircle" fontSize="inherit" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        );
    };

    return (
        <Box data-tid="kpath-field">
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 0.5,
                    rowGap: 1,
                }}
            >
                {path.map((item, index) => (
                    // Points repeat along a path (Γ appears twice in the FCC default), so position
                    // is the only stable identity here.
                    // eslint-disable-next-line react/no-array-index-key
                    <React.Fragment key={index}>
                        {renderPoint(item, index)}
                        {index < path.length - 1 ? renderSegment(index) : null}
                    </React.Fragment>
                ))}
            </Box>

            <Menu
                open={Boolean(menu)}
                anchorEl={menu?.anchor}
                onClose={() => setMenu(null)}
                data-tid="kpath-point-menu"
            >
                {options.map((option) => (
                    <MenuItem
                        key={option}
                        selected={menu ? path[menu.index]?.point === option : false}
                        onClick={() => menu && update(setPointAt(path, menu.index, option))}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>

            <Typography
                variant="caption"
                color="text.secondary"
                component="div"
                data-tid="kpath-summary"
                sx={{ mt: 1 }}
            >
                {segments.length} leg{segments.length === 1 ? "" : "s"} · {countKPoints(path)}{" "}
                k-points along the path
            </Typography>
        </Box>
    );
}
