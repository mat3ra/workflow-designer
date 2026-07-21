import { jsx as _jsx } from "react/jsx-runtime";
import { ExecutionUnit, ExecutionUnitViewer } from "@mat3ra/ave";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import { ErrorUnitContent } from "@mat3ra/wove";
import UnitDetails from "../subworkflows/UnitDetails";
import { BaseUnit } from "./BaseUnit";
import UnitPointerField from "./components/UnitPointerField";
import { DataFrameIOUnit } from "./DataFrameIOUnit";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Same cast BaseUnit.tsx uses: AnySubworkflowUnit as imported here vs. @mat3ra/wode's own
// unit type declarations don't structurally match at the type level, though they're
// interchangeable at runtime.
const UnitPointerFieldComponent = UnitPointerField;
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
        return (_jsx(ExecutionUnit, { unit: executionUnit.toJSON(), renderingContext: executionUnit.renderingContext, units: units, onUpdate: onUpdate, isStandalone: isStandalone, editable: editable, adjustable: adjustable, materials: materials, materialsIndex: materialsIndex, onMaterialSwitch: onMaterialSwitch, UnitDetailsComponent: UnitDetails, UnitPointerFieldComponent: UnitPointerFieldComponent }));
    }
    if (unit.type === UnitType.io && unit.subtype === "dataFrame") {
        return (_jsx(DataFrameIOUnit, { unit: unit, editable: editable, adjustable: adjustable, onUpdate: onUpdate, materials: materials }));
    }
    return _jsx(BaseUnit, { unit: unit, units: units, onUpdate: onUpdate, editable: editable });
}
