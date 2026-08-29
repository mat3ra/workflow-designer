import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

import { getUnitTypeDescriptor, getUnitTypeLabel } from "./unitTypeCatalog";
import { UnitTypeSelectProps } from "./UnitTypeSelectProps";

/**
 * Picks the kind of unit to add, showing what each kind does.
 *
 * Replaces a dropdown of raw type strings whose explanations sat behind an info popover: the
 * choice is the point of the dialog, so the options carry their own descriptions.
 */
export default function UnitTypeSelect({
    id = "workflow-unit-add-modal",
    title = "Add unit",
    onClose,
    onSelect,
    unitTypes,
}: UnitTypeSelectProps) {
    const [unitType, setUnitType] = useState(unitTypes[0]);
    const [prepend, setPrepend] = useState(false);

    const handleSubmit = () => {
        onSelect(unitType, prepend);
    };

    return (
        <Dialog
            open
            id={id}
            title={title}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitButtonText="Add"
            maxWidth="sm"
        >
            <Stack spacing={1} sx={{ mb: 2 }}>
                {unitTypes.map((type) => {
                    const typeKey = String(type);
                    const descriptor = getUnitTypeDescriptor(typeKey);
                    const isSelected = type === unitType;
                    return (
                        <Paper
                            key={typeKey}
                            variant="outlined"
                            data-tid={`unit-type-${typeKey}`}
                            onClick={() => setUnitType(type)}
                            sx={{
                                p: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                borderColor: isSelected ? "primary.main" : "divider",
                                borderWidth: isSelected ? 2 : 1,
                                backgroundColor: isSelected ? "action.selected" : undefined,
                            }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    flexShrink: 0,
                                    backgroundColor: descriptor.color,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                }}
                            >
                                {descriptor.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" color="text.primary">
                                    {getUnitTypeLabel(typeKey)}
                                </Typography>
                                {descriptor.description ? (
                                    <Typography variant="caption" color="text.secondary">
                                        {descriptor.description}
                                    </Typography>
                                ) : null}
                            </Box>
                        </Paper>
                    );
                })}
            </Stack>

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
                    label="After the selected unit"
                />
                <FormControlLabel
                    value="before"
                    control={<Radio size="small" />}
                    label="Before it"
                />
            </RadioGroup>
        </Dialog>
    );
}
