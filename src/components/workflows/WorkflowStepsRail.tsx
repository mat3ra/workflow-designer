import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

import { type WorkflowStep, formatStepNumber, formatStepSummary } from "./workflowSteps";

export interface WorkflowStepsRailProps {
    steps: WorkflowStep[];
    activeIndex: number;
    editable: boolean;
    onSelect: (index: number) => void;
    /** Renames the *active* step — the container's rename path acts on the selection. */
    onRename: (name: string) => void;
    onRemove: (flowchartId: string) => void;
    onAddStep: () => void;
}

/**
 * The workflow's top-level steps, as a list of what each one runs.
 *
 * Replaces the left column's second flowchart, which drew the same steps as cards carrying a
 * UUID, an "idle" chip and a duplicate of the panel already open on the right — the duplication
 * that made a three-step workflow need a full-width screen. Here a step states its name, its
 * engine and how many units it contains, and nothing else.
 */
export default function WorkflowStepsRail({
    steps,
    activeIndex,
    editable,
    onSelect,
    onRename,
    onRemove,
    onAddStep,
}: WorkflowStepsRailProps) {
    const [menu, setMenu] = useState<{ anchor: HTMLElement; step: WorkflowStep } | null>(null);
    const [renaming, setRenaming] = useState<{ index: number; value: string } | null>(null);
    /**
     * The menu's focus trap is still live while it transitions out, and would pull focus off a
     * rename field mounted before then — blurring it, which commits and closes it again. So the
     * step waits here until the menu is fully gone.
     */
    const [pendingRename, setPendingRename] = useState<WorkflowStep | null>(null);

    const closeMenu = () => setMenu(null);

    const commitRename = () => {
        const name = renaming?.value.trim();
        // The container's rename acts on the selected step, which is why starting a rename
        // selects it first; only a real change is worth marking the workflow dirty.
        if (name && name !== steps[renaming.index]?.name) onRename(name);
        setRenaming(null);
    };

    const startRename = (step: WorkflowStep) => {
        if (step.index !== activeIndex) onSelect(step.index);
        setRenaming({ index: step.index, value: step.name });
    };

    return (
        <Box
            component="nav"
            data-tid="workflow-steps-rail"
            aria-label="Workflow steps"
            sx={{ p: 1.5, height: "100%", display: "flex", flexDirection: "column", gap: 1 }}
        >
            <Typography variant="overline" color="text.secondary" sx={{ px: 0.5 }}>
                Steps
            </Typography>

            <Stack spacing={0.75} sx={{ flexGrow: 1, overflowY: "auto" }}>
                {steps.map((step) => {
                    const isActive = step.index === activeIndex;
                    const isRenaming = renaming?.index === step.index;
                    return (
                        <Box
                            key={step.flowchartId}
                            data-tid={`workflow-step-${step.index}`}
                            data-active={isActive || undefined}
                            onClick={() => !isRenaming && onSelect(step.index)}
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                px: 1,
                                py: 0.875,
                                borderRadius: 1,
                                cursor: "pointer",
                                borderLeft: "3px solid",
                                borderLeftColor: isActive ? "primary.main" : "transparent",
                                backgroundColor: isActive ? "action.selected" : undefined,
                                "&:hover": { backgroundColor: "action.hover" },
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontVariantNumeric: "tabular-nums", pt: 0.25 }}
                            >
                                {formatStepNumber(step.index)}
                            </Typography>

                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                {isRenaming ? (
                                    <TextField
                                        size="small"
                                        autoFocus
                                        fullWidth
                                        value={renaming.value}
                                        onChange={(event) =>
                                            setRenaming({
                                                index: step.index,
                                                value: event.target.value,
                                            })
                                        }
                                        onClick={(event) => event.stopPropagation()}
                                        onBlur={commitRename}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") commitRename();
                                            if (event.key === "Escape") setRenaming(null);
                                        }}
                                        inputProps={{ "data-tid": "workflow-step-rename-input" }}
                                    />
                                ) : (
                                    <>
                                        <Typography variant="body2" noWrap title={step.name}>
                                            {step.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {formatStepSummary(step)}
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            {step.status ? (
                                <Chip label={step.status} size="small" variant="outlined" />
                            ) : null}

                            {editable && !isRenaming ? (
                                <IconButton
                                    size="small"
                                    data-tid={`workflow-step-menu-${step.index}`}
                                    aria-label={`Actions for ${step.name}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setMenu({ anchor: event.currentTarget, step });
                                    }}
                                    sx={{ opacity: 0.4, "&:hover": { opacity: 1 } }}
                                >
                                    <IconByName name="shapes.dots.vertical" fontSize="inherit" />
                                </IconButton>
                            ) : null}
                        </Box>
                    );
                })}
            </Stack>

            {editable ? (
                <Button
                    size="small"
                    startIcon={<IconByName name="actions.add" />}
                    onClick={onAddStep}
                    data-tid="workflow-steps-rail-add"
                    sx={{ justifyContent: "flex-start" }}
                >
                    Add step
                </Button>
            ) : null}

            <Menu
                open={Boolean(menu)}
                anchorEl={menu?.anchor}
                onClose={closeMenu}
                disableRestoreFocus
                TransitionProps={{
                    onExited: () => {
                        if (pendingRename) {
                            startRename(pendingRename);
                            setPendingRename(null);
                        }
                    },
                }}
            >
                <MenuItem
                    data-tid="workflow-step-rename"
                    onClick={() => {
                        if (menu) setPendingRename(menu.step);
                        closeMenu();
                    }}
                >
                    Rename
                </MenuItem>
                <MenuItem
                    data-tid="workflow-step-remove"
                    disabled={steps.length <= 1}
                    onClick={() => {
                        if (menu) onRemove(menu.step.flowchartId);
                        closeMenu();
                    }}
                >
                    Remove
                </MenuItem>
            </Menu>
        </Box>
    );
}
