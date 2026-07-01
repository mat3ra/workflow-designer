import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import { InfoPopoverWithDocumentation } from "@exabyte-io/cove.js/dist/mui/components/popover/info-popover/InfoPopoverWithDocumentation";
import Select from "@exabyte-io/cove.js/dist/mui/components/select";
import Grid from "@mui/material/Grid";
import React, { useState } from "react";

import { UnitTypeSelectProps } from "./UnitTypeSelectProps";

export default function UnitTypeSelect({
    id = "workflow-unit-add-modal",
    title = "Select unit type",
    onClose,
    onSelect,
    unitTypes,
}: UnitTypeSelectProps) {
    const [unitType, setUnitType] = useState(unitTypes[0]);
    const [unitIndex, setUnitIndex] = useState(0);

    const handleSubmit = () => {
        onSelect(unitType, unitIndex === 1);
    };

    return (
        <Dialog
            open
            id={id}
            title={title}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitButtonText="Apply"
            maxWidth="sm">
            <Grid container spacing={0.5}>
                <Grid item xs={11}>
                    <Select
                        id={`${id}-select-type`}
                        label="Unit type"
                        value={unitType as any}
                        formControlProps={{}}
                        items={unitTypes.map((type) => ({
                            id: type,
                            name: type,
                            value: type,
                        }))}
                        onChange={(event: any) => {
                            setUnitType(event.target.value);
                        }}
                    />
                </Grid>
                <Grid item xs={1}>
                    <InfoPopoverWithDocumentation
                        popoverTitle="Unit types"
                        searchText="Unit types">
                        Users can choose between one of the following unit types:
                        <br />
                        <dl>
                            <dt>Execution unit</dt>
                            <dd>&emsp; to run scripts or simulation software</dd>
                            <dt>Assignment unit</dt>
                            <dd>&emsp; to set variables and evaluate expressions</dd>
                            <dt>Condition unit</dt>
                            <dd>&emsp; to execute units conditionally</dd>
                            <dt>Assertion unit</dt>
                            <dd>
                                &emsp; to evaluate a condition before executing a subsequent unit
                            </dd>
                        </dl>
                    </InfoPopoverWithDocumentation>
                </Grid>
                <Grid item xs={11}>
                    <Select
                        id={`${id}-select-index`}
                        label="Unit index"
                        value={`${unitIndex}` as any}
                        formControlProps={{}}
                        items={["append to current", "prepend to current"].map((type, index) => ({
                            id: type,
                            name: type,
                            value: index,
                        }))}
                        onChange={(event: any) => {
                            setUnitIndex(Number(event.target.value));
                        }}
                    />
                </Grid>
            </Grid>
        </Dialog>
    );
}
