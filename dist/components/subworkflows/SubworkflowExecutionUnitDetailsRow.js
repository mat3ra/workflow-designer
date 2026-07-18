import { jsx as _jsx } from "react/jsx-runtime";
import Accordion from "@mat3ra/cove.js/dist/mui/components/accordion/Accordion";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import Grid from "@mui/material/Grid";
import UnitDetails from "./UnitDetails";
export function SubworkflowExecutionUnitDetailsRow({ unit, index, editable, onUnitResultsChanged, onUnitIsDraftChanged, onUnitMonitorChanged, onUnitPostProcessorChanged, }) {
    if (unit.type !== UnitType.execution) {
        return null;
    }
    return (_jsx(Grid, { item: true, xs: 12, children: _jsx(Accordion, { "data-tid": unit.name, isExpanded: true, header: `Unit ${index}: ${unit.name}`, children: _jsx(UnitDetails, { unit: unit, editable: editable, onUnitResultsChanged: (results) => {
                    onUnitResultsChanged(unit.flowchartId, results);
                }, onUnitIsDraftChanged: (isDraft) => {
                    onUnitIsDraftChanged(unit.flowchartId, isDraft);
                }, onUnitMonitorChanged: (monitor, enabled) => {
                    onUnitMonitorChanged(unit.flowchartId, monitor, enabled);
                }, onUnitPostProcessorChanged: (postProcessor, enabled) => {
                    onUnitPostProcessorChanged(unit.flowchartId, postProcessor, enabled);
                } }) }) }));
}
