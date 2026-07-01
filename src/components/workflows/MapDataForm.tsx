/* eslint-disable @typescript-eslint/no-empty-function */
import RJSForm from "@exabyte-io/cove.js/dist/other/rjsf/RJSForm";
import Checkbox from "@exabyte-io/cove.js/dist/mui/components/checkbox/Checkbox";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import setClass from "classnames";
import ajv from "@rjsf/validator-ajv8";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import _ from "underscore";

// Inline map input schema: fields name, target, values, useValues, scope
const MAP_INPUT_SCHEMA = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Map Input",
    type: "object" as const,
    properties: {
        name: { type: "string" as const, title: "Name" },
        target: { type: "string" as const, title: "Target" },
        values: { type: "string" as const, title: "Values" },
    },
};

const MAP_INPUT_UI_SCHEMA = {
    "ui:submitButtonOptions": { norender: true },
    values: { "ui:widget": "textarea", "ui:options": { rows: 6 } },
};

/** Aligns with `MapUnitInput` in `Map.tsx` (avoid importing `Map` → circular dependency). */
type MapUnitInput = {
    values: unknown[] | string;
    useValues?: boolean;
    [key: string]: unknown;
};

export type MapDataFormScopeOption = {
    subworkflowName: string;
    unitName: string;
    unitFlowchartId: string;
};

export type MapDataFormProps = {
    mapData: MapUnitInput;
    onUpdate: (mapData: MapUnitInput) => void;
    scopeOptions: MapDataFormScopeOption[];
    className?: string;
};

type FormState = MapUnitInput;

function validateValues(values: string): boolean {
    try {
        const parsed = JSON.parse(values) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((el) => _.isObject(el))) {
            return true;
        }
    } catch {
        return false;
    }
    return false;
}

export default function MapDataForm({
    mapData,
    onUpdate,
    scopeOptions,
    className,
}: MapDataFormProps) {
    const [state, setState] = useState<FormState>(() => ({ ...mapData }));

    useEffect(() => {
        setState({ ...mapData });
    }, [mapData]);

    const handleChangeImmediate = useCallback(
        (next: FormState) => {
            const valuesStr = String(next.values ?? "");
            const newUseValues = validateValues(valuesStr);
            const newMapData: MapUnitInput = {
                ...next,
                useValues: newUseValues,
                values: newUseValues
                    ? JSON.stringify(JSON.parse(valuesStr), null, 4)
                    : next.values,
            };
            setState(newMapData);
            const upstream: MapUnitInput = {
                ...newMapData,
                values: newUseValues ? JSON.parse(valuesStr) : [],
            };
            onUpdate(upstream);
        },
        [onUpdate],
    );

    const handleChange = useMemo(
        () => _.debounce((next: FormState) => handleChangeImmediate(next), 700),
        [handleChangeImmediate],
    );

    useEffect(
        () => () => {
            handleChange.cancel();
        },
        [handleChange],
    );

    const { useValues: disabledScopeName, scope, name, target, values } = state;

    const formData = useMemo(
        () => ({ name: name ?? "", target: target ?? "", values: values ?? "" }),
        [name, target, values],
    );

    return (
        <Box className={setClass(className)} sx={{ py: 2, px: 4 }}>
            <Grid container spacing={2}>
                <Grid item md={6}>
                    <FormControl fullWidth size="small" disabled={Boolean(disabledScopeName)}>
                        <InputLabel id="map-scope-label">Scope</InputLabel>
                        <MuiSelect
                            labelId="map-scope-label"
                            id="map-scope-select"
                            value={scope ?? ""}
                            label="Scope"
                            onChange={(e) => {
                                const next = { ...state, scope: e.target.value as string };
                                setState(next);
                                handleChange(next);
                            }}>
                            {scopeOptions.map((option) => (
                                <MenuItem
                                    key={option.unitFlowchartId}
                                    value={option.unitFlowchartId}>
                                    {`${option.subworkflowName}: ${option.unitName}`}
                                </MenuItem>
                            ))}
                        </MuiSelect>
                    </FormControl>
                </Grid>
                <Grid item md={6}>
                    <Checkbox
                        id="map-data-use-scope-name"
                        checked={!disabledScopeName}
                        disabled
                        label="Use Scope and Name"
                        onChange={() => {}}
                        {...({} as any)}
                    />
                </Grid>
                <Grid item md={12}>
                    <RJSForm
                        schema={MAP_INPUT_SCHEMA}
                        uiSchema={MAP_INPUT_UI_SCHEMA}
                        validator={ajv}
                        formData={formData}
                        onChange={({ formData: fd }) => {
                            const next = { ...state, ...(fd as object) };
                            setState(next);
                            handleChange(next);
                        }}>
                        {" "}
                    </RJSForm>
                </Grid>
            </Grid>
        </Box>
    );
}
