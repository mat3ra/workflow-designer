import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-empty-function */
import Checkbox from "@mat3ra/cove.js/dist/mui/components/checkbox/Checkbox";
import RJSForm from "@mat3ra/cove.js/dist/other/rjsf/RJSForm";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import ajv from "@rjsf/validator-ajv8";
import setClass from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import _ from "underscore";
// Inline map input schema: fields name, target, values, useValues, scope
const MAP_INPUT_SCHEMA = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Map Input",
    type: "object",
    properties: {
        name: { type: "string", title: "Name" },
        target: { type: "string", title: "Target" },
        values: { type: "string", title: "Values" },
    },
};
const MAP_INPUT_UI_SCHEMA = {
    "ui:submitButtonOptions": { norender: true },
    values: { "ui:widget": "textarea", "ui:options": { rows: 6 } },
};
function validateValues(values) {
    try {
        const parsed = JSON.parse(values);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((el) => _.isObject(el))) {
            return true;
        }
    }
    catch (_a) {
        return false;
    }
    return false;
}
export default function MapDataForm({ mapData, onUpdate, scopeOptions, className, }) {
    const [state, setState] = useState(() => ({ ...mapData }));
    useEffect(() => {
        setState({ ...mapData });
    }, [mapData]);
    const handleChangeImmediate = useCallback((next) => {
        var _a;
        const valuesStr = String((_a = next.values) !== null && _a !== void 0 ? _a : "");
        const newUseValues = validateValues(valuesStr);
        const newMapData = {
            ...next,
            useValues: newUseValues,
            values: newUseValues ? JSON.stringify(JSON.parse(valuesStr), null, 4) : next.values,
        };
        setState(newMapData);
        const upstream = {
            ...newMapData,
            values: newUseValues ? JSON.parse(valuesStr) : [],
        };
        onUpdate(upstream);
    }, [onUpdate]);
    const handleChange = useMemo(() => _.debounce((next) => handleChangeImmediate(next), 700), [handleChangeImmediate]);
    useEffect(() => () => {
        handleChange.cancel();
    }, [handleChange]);
    const { useValues: disabledScopeName, scope, name, target, values } = state;
    const formData = useMemo(() => ({ name: name !== null && name !== void 0 ? name : "", target: target !== null && target !== void 0 ? target : "", values: values !== null && values !== void 0 ? values : "" }), [name, target, values]);
    return (_jsx(Box, { className: setClass(className), sx: { py: 2, px: 4 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, md: 6, children: _jsxs(FormControl, { fullWidth: true, size: "small", disabled: Boolean(disabledScopeName), children: [_jsx(InputLabel, { id: "map-scope-label", children: "Scope" }), _jsx(MuiSelect, { labelId: "map-scope-label", id: "map-scope-select", value: scope !== null && scope !== void 0 ? scope : "", label: "Scope", onChange: (e) => {
                                    const next = { ...state, scope: e.target.value };
                                    setState(next);
                                    handleChange(next);
                                }, children: scopeOptions.map((option) => (_jsx(MenuItem, { value: option.unitFlowchartId, children: `${option.subworkflowName}: ${option.unitName}` }, option.unitFlowchartId))) })] }) }), _jsx(Grid, { item: true, md: 6, children: _jsx(Checkbox, { id: "map-data-use-scope-name", checked: !disabledScopeName, disabled: true, label: "Use Scope and Name", onChange: () => { }, ...{} }) }), _jsx(Grid, { item: true, md: 12, children: _jsx(RJSForm, { schema: MAP_INPUT_SCHEMA, uiSchema: MAP_INPUT_UI_SCHEMA, validator: ajv, formData: formData, onChange: ({ formData: fd }) => {
                            const next = { ...state, ...fd };
                            setState(next);
                            handleChange(next);
                        }, children: " " }) })] }) }));
}
