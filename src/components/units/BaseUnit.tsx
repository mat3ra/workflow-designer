/* eslint-disable react/require-default-props */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type {
    AnySubworkflowUnit,
    AnySubworkflowUnitSchema,
} from "@mat3ra/wode/dist/js/units/factory";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ObjectFieldTemplateProps, UiSchema, WidgetProps } from "@rjsf/utils";
import _ from "lodash";
import React from "react";

import UnitInputEditor from "./components/UnitInputEditor";
import UnitPointerField from "./components/UnitPointerField";
const UnitPointerFieldComponent = UnitPointerField as any;

import { FixedRJSForm } from "@mat3ra/move";

/**
 * Retrieves the filtered unit properties schema based on the unit type.
 * Filters out properties that are not relevant to the unit type.
 * @param {string} unitType - The type of the unit. i.e. assignment, assertion, etc.
 * @returns {object} - The filtered unit properties json schema.
 */
const getFilteredUnitPropertiesSchema = (unitType: string) => {
    const keysToExclude = [
        "then",
        "else",
        "throwException",
        "statusTrack",
        "inputData",
        "subtype",
        "source",
    ];
    const baseUnitSchema = JSONSchemasInterface.getSchemaById("workflow/base");

    const unitSchema = JSONSchemasInterface.matchSchema({
        title: { $regex: `${unitType} unit` },
    });

    if (!unitSchema) {
        throw new Error("UI SCHEMA NOT FOUND");
    }

    if (!baseUnitSchema) {
        throw new Error("UNIT SCHEMA NOT FOUND");
    }

    // Filter out properties from the baseUnit schema and keysToExclude
    const newProperties = _.omit(unitSchema.properties, [
        ...Object.keys(baseUnitSchema.properties || {}),
        ...keysToExclude,
    ]) as any;

    newProperties.value = {
        ..._.omit(newProperties.value, ["oneOf"]),
        type: "string",
    };

    // Removed any filtered out properties from the required properties list
    const newRequiredKeys = unitSchema.required.filter((key) => key in newProperties);

    // Overwrite the properties, required keys, and additionalProperties
    return {
        ...unitSchema,
        properties: newProperties,
        required: newRequiredKeys,
        additionalProperties: false,
    };
};

const uiSchema: any = {
    "ui:submitButtonOptions": {
        norender: true,
    },
    "ui:title": false,
    operand: {
        "ui:classNames": "assignment-operand",
    },
    value: {
        "ui:classNames": "assignment-value",
    },
    "ui:order": ["*", "input"],
};

type BaseUnitProps = {
    unit: AnySubworkflowUnit;
    units: AnySubworkflowUnit[];
    onUpdate: (unit: AnySubworkflowUnitSchema) => void;
    editable?: boolean;
};

function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    const { properties } = props;
    return <Stack spacing={2}>{properties.map((element) => element.content)}</Stack>;
}

function TextWidget(props: WidgetProps) {
    const { onChange, ...rest } = props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TextField {...(rest as any)} size="small" onChange={(event) => onChange(event.target.value)} />;
}

export function BaseUnit(props: BaseUnitProps) {
    const { unit, units, onUpdate, editable } = props;

    const formSchema = getFilteredUnitPropertiesSchema(unit.type);
    const hasInput = !!formSchema.properties?.input;
    const hasProperties = Object.keys(formSchema.properties).length > 0;

    const availableUnits = () => {
        return units.filter((u) => u.flowchartId !== unit.flowchartId);
    };
    const unitData = unit.toJSON();

    const handleUnitKeyUpdate = (key: string, value: unknown) => {
        unit.setProp(key, value);
        // TODO: onUpdate should only be called on close to avoid rerendering all execution units on every keypress
        onUpdate(unit.toJSON());
    };

    // renders the unit's pointers to other units
    const renderUnitPointers = (keys = ["next"]) => {
        const keysToUse = unit.type === UnitType.condition ? ["then", "else"] : keys;
        return (
            <Grid container spacing={2}>
                {keysToUse.map((key) => {
                    return (
                        <Grid item xs={12}>
                            <UnitPointerFieldComponent
                                editable={editable}
                                key={key}
                                label={key}
                                selectedValue={_.get(unit, key)}
                                availableUnits={availableUnits()}
                                onChange={(value) => handleUnitKeyUpdate(key, value)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    // renders the unit input field
    const renderUnitInput = () => {
        return (
            <UnitInputEditor
                initialInput={_.get(unitData, "input", {})}
                editable={editable}
                onChange={(val) => handleUnitKeyUpdate("input", val)}
            />
        );
    };

    // filters the unit object based on what properties are defined in the schema.
    const formData = Object.keys(formSchema.properties).reduce((acc, key) => {
        acc[key] = _.get(unitData, key);
        return acc;
    }, {});

    // updates the unit object with the new form data for each property in the form.
    const handleChange = (e) => {
        Object.keys(e.formData).forEach((key) => {
            handleUnitKeyUpdate(key, e.formData[key]);
        });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                {renderUnitPointers()}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.primary">
                    Details
                </Typography>
            </Grid>
            {hasProperties && (
                <Grid item xs={12}>
                    <FixedRJSForm
                        id={`${unit.type}-unit-details`}
                        liveValidate
                        schema={formSchema}
                        formData={formData}
                        uiSchema={uiSchema}
                        widgets={{ TextWidget }}
                        templates={{ ObjectFieldTemplate }}
                        onChange={handleChange}
                    />
                </Grid>
            )}
            {hasInput && (
                <Grid item xs={12}>
                    {renderUnitInput()}
                </Grid>
            )}
        </Grid>
    );
}
