import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Codemirror from "@mat3ra/cove/dist/other/codemirror";
import { SubworkflowStandata } from "@mat3ra/standata";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useMemo, useState } from "react";

import {
    filterLibraryEntries,
    getLibraryApplications,
    LibraryEntry,
    toLibraryEntries,
} from "./stepLibraryEntries";

const CodemirrorComponent = Codemirror as any;

export interface StepLibraryProps {
    id?: string;
    title?: string;
    onClose: () => void;
    /** Receives a subworkflow config and where to put it, as `onUnitAddSubworkflowFromConfig`. */
    onSubmit: (config: object, prependOrPasteIndex: number) => void;
}

/** Ready-made steps from standata, plus whatever is needed to preview one before adding it. */
function loadLibraryEntries(): LibraryEntry[] {
    try {
        return toLibraryEntries(
            (new SubworkflowStandata().getAll() ?? []) as Array<Record<string, any>>,
        );
    } catch {
        // Standata is optional at runtime; the Paste JSON tab still works without it.
        return [];
    }
}

/**
 * Adds a step to the workflow: pick a ready-made one, or paste a config.
 *
 * Replaces two separate menu actions — "Add subworkflow", which added an empty step, and
 * "Paste subworkflow", a bare JSON textarea that required knowing the config shape. The
 * library is the front door; pasting stays for the cases it does not cover.
 */
export default function StepLibrary({
    id = "workflow-step-library-modal",
    title = "Add step",
    onClose,
    onSubmit,
}: StepLibraryProps) {
    const entries = useMemo(loadLibraryEntries, []);
    const applications = useMemo(() => getLibraryApplications(entries), [entries]);

    const [tab, setTab] = useState(entries.length > 0 ? "library" : "paste");
    const [search, setSearch] = useState("");
    const [application, setApplication] = useState("");
    const [selectedKey, setSelectedKey] = useState(entries[0]?.key ?? "");
    const [pasted, setPasted] = useState("");
    const [prepend, setPrepend] = useState(false);
    const [pasteError, setPasteError] = useState("");

    const visibleEntries = filterLibraryEntries(entries, { search, application });
    const selected = visibleEntries.find((entry) => entry.key === selectedKey) ?? visibleEntries[0];

    const handleSubmit = () => {
        const position = prepend ? 0 : 1;
        if (tab === "paste") {
            try {
                onSubmit(JSON.parse(pasted), position);
            } catch (error) {
                setPasteError(error instanceof Error ? error.message : "That is not valid JSON.");
            }
            return;
        }
        if (selected) onSubmit(selected.config, position);
    };

    return (
        <Dialog
            open
            id={id}
            title={title}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitButtonText="Add step"
            scroll="paper"
            maxWidth="lg"
        >
            <Tabs value={tab} onChange={(_event, next) => setTab(next)} sx={{ mb: 2 }}>
                <Tab
                    value="library"
                    label={`Library (${entries.length})`}
                    disabled={entries.length === 0}
                    data-tid="step-library-tab"
                />
                <Tab value="paste" label="Paste JSON" data-tid="step-paste-tab" />
            </Tabs>

            {tab === "library" ? (
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            size="small"
                            fullWidth
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search steps by name, application or unit"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">⌕</InputAdornment>,
                                inputProps: { "data-tid": "step-library-search" },
                            }}
                        />
                        <TextField
                            size="small"
                            select
                            value={application}
                            onChange={(event) => setApplication(event.target.value)}
                            label="Application"
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="">All applications</MenuItem>
                            {applications.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box
                            sx={{ flex: "1 1 55%", maxHeight: 320, overflowY: "auto" }}
                            data-tid="step-library-list"
                        >
                            {visibleEntries.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                                    No steps match that search.
                                </Typography>
                            ) : (
                                visibleEntries.map((entry) => (
                                    <Paper
                                        key={entry.key}
                                        variant="outlined"
                                        onClick={() => setSelectedKey(entry.key)}
                                        sx={{
                                            p: 1.25,
                                            mb: 1,
                                            cursor: "pointer",
                                            borderColor:
                                                selected?.key === entry.key
                                                    ? "primary.main"
                                                    : "divider",
                                            backgroundColor:
                                                selected?.key === entry.key
                                                    ? "action.selected"
                                                    : undefined,
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent="space-between"
                                        >
                                            <Typography variant="subtitle2" color="text.primary">
                                                {entry.name}
                                            </Typography>
                                            {entry.application ? (
                                                <Chip
                                                    label={entry.application}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : null}
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                            {entry.unitNames.length} unit
                                            {entry.unitNames.length === 1 ? "" : "s"}
                                            {entry.unitNames.length
                                                ? ` · ${entry.unitNames.slice(0, 3).join(" → ")}`
                                                : ""}
                                        </Typography>
                                    </Paper>
                                ))
                            )}
                        </Box>

                        {/* Preview: what gets added, before it is added. */}
                        <Box sx={{ flex: "1 1 45%" }} data-tid="step-library-preview">
                            {selected ? (
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2" color="text.primary">
                                        {selected.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selected.application || "no application"} · adds{" "}
                                        {selected.unitNames.length} unit
                                        {selected.unitNames.length === 1 ? "" : "s"}
                                    </Typography>
                                    {selected.unitNames.map((unitName, index) => (
                                        <Paper
                                            // eslint-disable-next-line react/no-array-index-key
                                            key={`${unitName}-${index}`}
                                            variant="outlined"
                                            sx={{
                                                p: 1,
                                                borderLeft: "3px solid",
                                                borderLeftColor: "primary.main",
                                            }}
                                        >
                                            <Typography variant="body2">{unitName}</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : null}
                        </Box>
                    </Stack>
                </Stack>
            ) : (
                <Box sx={{ height: "100%", overflow: "hidden" }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        sx={{ mb: 1 }}
                    >
                        Paste a subworkflow config. Units are given fresh identifiers on insert.
                    </Typography>
                    <CodemirrorComponent
                        content={pasted}
                        updateContent={(content: string) => {
                            setPasted(content);
                            setPasteError("");
                        }}
                        options={{ lineNumbers: true, mode: "application/json" }}
                    />
                    {pasteError ? (
                        <Typography variant="caption" color="error" component="div" sx={{ mt: 1 }}>
                            {pasteError}
                        </Typography>
                    ) : null}
                </Box>
            )}

            <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">
                    Position
                </Typography>
                <RadioGroup
                    row
                    value={prepend ? "before" : "after"}
                    onChange={(event) => setPrepend(event.target.value === "before")}
                >
                    <FormControlLabel
                        value="after"
                        control={<Radio size="small" />}
                        label="After the current step"
                    />
                    <FormControlLabel
                        value="before"
                        control={<Radio size="small" />}
                        label="Before it"
                    />
                </RadioGroup>
            </Box>
        </Dialog>
    );
}
