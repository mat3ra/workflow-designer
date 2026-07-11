import { jsx as _jsx } from "react/jsx-runtime";
import { ExecutionUnit, ExecutionUnitViewer } from "@mat3ra/ave";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import { ErrorUnitContent } from "@mat3ra/wove";
import { BaseUnit } from "./BaseUnit";
import { DataFrameIOUnit } from "./DataFrameIOUnit";
export function UnitModalContent({ unit, units, onUpdate, adjustable, editable, isStandalone, onOutputUpdateRequest, materials, materialsIndex, onMaterialSwitch, jobProperties = [], }) {
    const isViewMode = !editable && !adjustable;
    if (unit.type === UnitType.error) {
        return _jsx(ErrorUnitContent, { unit: unit });
    }
    if (unit.type === UnitType.execution) {
        const executionUnit = unit;
        if (isViewMode) {
            return (_jsx(ExecutionUnitViewer, { unit: executionUnit, onOutputUpdateRequest: onOutputUpdateRequest, jobProperties: jobProperties }));
        }
        return (_jsx(ExecutionUnit, { unit: executionUnit.toJSON(), renderingContext: executionUnit.renderingContext, units: units, onUpdate: onUpdate, isStandalone: isStandalone, editable: editable, adjustable: adjustable, materials: materials, materialsIndex: materialsIndex, onMaterialSwitch: onMaterialSwitch }));
    }
    if (unit.type === UnitType.io && unit.subtype === "dataFrame") {
        return (_jsx(DataFrameIOUnit, { unit: unit, editable: editable, adjustable: adjustable, onUpdate: onUpdate, materials: materials }));
    }
    return _jsx(BaseUnit, { unit: unit, units: units, onUpdate: onUpdate, editable: editable });
}
