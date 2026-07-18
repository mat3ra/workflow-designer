import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Checkbox from "@mat3ra/cove/dist/mui/components/checkbox/Checkbox";
import { Results } from "@mat3ra/ave";
import { ApplicationRegistry } from "@mat3ra/standata";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import UnitProperties from "./UnitProperties";
const CheckboxComponent = Checkbox;
const INDENT = 1;
function UnitDetails({ unit, editable, onUnitResultsChanged, onUnitIsDraftChanged, onUnitMonitorChanged, onUnitPostProcessorChanged, }) {
    var _a, _b, _c, _d;
    const { isDraft } = unit;
    const selectedMonitors = useMemo(() => { var _a; return ((_a = unit.monitors) !== null && _a !== void 0 ? _a : []).map((m) => m.name); }, [unit.monitors]);
    const selectedPostProcessors = useMemo(() => {
        var _a;
        return ((_a = unit.postProcessors) !== null && _a !== void 0 ? _a : []).map((p) => p.name);
    }, [unit.postProcessors]);
    const registry = useMemo(() => new ApplicationRegistry(), []);
    const executable = useMemo(() => {
        return registry
            .getExecutablesByApplication({
            name: unit.application.name,
            version: unit.application.version,
        })
            .find((executable) => executable.name === unit.executable.name);
    }, [unit.application.name, unit.application.version, unit.executable.name, registry]);
    if (!executable) {
        console.error(`Executable ${unit.executable.name} not found`);
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", color: "text.primary", children: "Properties" }), _jsx(UnitProperties, { unit: unit, onUnitResultsChanged: onUnitResultsChanged, editable: editable, allowedResults: executable.results }), _jsx(CheckboxComponent, { className: "is-draft", id: "draft-checkbox", label: "Draft", checked: isDraft || false, onChange: (checked) => onUnitIsDraftChanged(checked) })] }), ((_a = executable.monitors) !== null && _a !== void 0 ? _a : []).length > 0 && (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", color: "text.primary", children: "Monitors" }), _jsx(Results, { data_tid: "monitors", allowed: (_b = executable.monitors) !== null && _b !== void 0 ? _b : [], selected: selectedMonitors, onChange: (monitor, enabled) => {
                            onUnitMonitorChanged(monitor.name, enabled);
                        } })] })), ((_c = executable.postProcessors) !== null && _c !== void 0 ? _c : []).length > 0 && (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", color: "text.primary", children: "PostProcessors" }), _jsx(Box, { sx: { pl: INDENT }, children: _jsx(Results, { data_tid: "postprocessors", allowed: (_d = executable.postProcessors) !== null && _d !== void 0 ? _d : [], selected: selectedPostProcessors, onChange: (postProcessor, enabled) => {
                                onUnitPostProcessorChanged(postProcessor.name, enabled);
                            } }) })] }))] }));
}
export default UnitDetails;
