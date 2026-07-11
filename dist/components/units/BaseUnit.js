import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/require-default-props */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import { FixedRJSForm } from "@mat3ra/move/pseudo";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import UnitInputEditor from "./components/UnitInputEditor";
import UnitPointerField from "./components/UnitPointerField";
const UnitPointerFieldComponent = UnitPointerField;
/**
 * Retrieves the filtered unit properties schema based on the unit type.
 * Filters out properties that are not relevant to the unit type.
 * @param {string} unitType - The type of the unit. i.e. assignment, assertion, etc.
 * @returns {object} - The filtered unit properties json schema.
 */
const getFilteredUnitPropertiesSchema = (unitType) => {
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
    ]);
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
const uiSchema = {
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
function ObjectFieldTemplate(props) {
    const { properties } = props;
    return _jsx(Stack, { spacing: 2, children: properties.map((element) => element.content) });
}
function TextWidget(props) {
    const { onChange, ...rest } = props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return (_jsx(TextField, { ...rest, size: "small", onChange: (event) => onChange(event.target.value) }));
}
export function BaseUnit(props) {
    var _a;
    const { unit, units, onUpdate, editable } = props;
    const formSchema = getFilteredUnitPropertiesSchema(unit.type);
    const hasInput = !!((_a = formSchema.properties) === null || _a === void 0 ? void 0 : _a.input);
    const hasProperties = Object.keys(formSchema.properties).length > 0;
    const availableUnits = () => {
        return units.filter((u) => u.flowchartId !== unit.flowchartId);
    };
    const unitData = unit.toJSON();
    const handleUnitKeyUpdate = (key, value) => {
        unit.setProp(key, value);
        // TODO: onUpdate should only be called on close to avoid rerendering all execution units on every keypress
        onUpdate(unit.toJSON());
    };
    // renders the unit's pointers to other units
    const renderUnitPointers = (keys = ["next"]) => {
        const keysToUse = unit.type === UnitType.condition ? ["then", "else"] : keys;
        return (_jsx(Grid, { container: true, spacing: 2, children: keysToUse.map((key) => {
                return (_jsx(Grid, { item: true, xs: 12, children: _jsx(UnitPointerFieldComponent, { editable: editable, label: key, selectedValue: _.get(unit, key), availableUnits: availableUnits(), onChange: (value) => handleUnitKeyUpdate(key, value) }, key) }));
            }) }));
    };
    // renders the unit input field
    const renderUnitInput = () => {
        return (_jsx(UnitInputEditor, { initialInput: _.get(unitData, "input", {}), editable: editable, onChange: (val) => handleUnitKeyUpdate("input", val) }));
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
    return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, children: renderUnitPointers() }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Typography, { variant: "subtitle2", color: "text.primary", children: "Details" }) }), hasProperties && (_jsx(Grid, { item: true, xs: 12, children: _jsx(FixedRJSForm, { id: `${unit.type}-unit-details`, liveValidate: true, schema: formSchema, formData: formData, uiSchema: uiSchema, widgets: { TextWidget }, templates: { ObjectFieldTemplate }, onChange: handleChange }) })), hasInput && (_jsx(Grid, { item: true, xs: 12, children: renderUnitInput() }))] }));
}
