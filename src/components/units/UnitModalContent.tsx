import { ExecutionUnit, ExecutionUnitViewer } from "@mat3ra/ave";
import { ErrorUnit, ExecutionUnit as WodeExecutionUnit } from "@mat3ra/wode";
import { UnitStatus, UnitType } from "@mat3ra/wode/dist/js/enums";
import type {
    AnySubworkflowUnit,
    AnySubworkflowUnitSchema,
} from "@mat3ra/wode/dist/js/units/factory";
import { ErrorUnitContent } from "@mat3ra/wove";
import React from "react";

import type {
    WorkflowDesignerProperty,
    WorkflowDesignerUnitEndpointsByUnit,
} from "../../types/context";
import { useUnitOutput } from "../../utils/useUnitOutput";
import UnitDetails from "../subworkflows/UnitDetails";
import { BaseUnit } from "./BaseUnit";
import UnitPointerField from "./components/UnitPointerField";
import { DataFrameIOUnit } from "./DataFrameIOUnit";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Same cast BaseUnit.tsx uses: AnySubworkflowUnit as imported here vs. @mat3ra/wode's own
// unit type declarations don't structurally match at the type level, though they're
// interchangeable at runtime.
const UnitPointerFieldComponent = UnitPointerField as any;

export interface UnitModalContentProps {
    unit: AnySubworkflowUnit;
    units: AnySubworkflowUnit[];
    onUpdate: (unit: AnySubworkflowUnitSchema) => void;
    adjustable: boolean;
    editable: boolean;
    isStandalone: boolean;
    onOutputUpdateRequest: (unit: any) => void;
    materials: any[];
    materialsIndex: number;
    onMaterialSwitch: (index: number) => void;
    /** Job designer passes refined properties for execution-unit monitors; elsewhere defaults to []. */
    jobProperties?: WorkflowDesignerProperty[];
    unitEndpointsByFlowchartId?: WorkflowDesignerUnitEndpointsByUnit;
}

type ExecutionUnitOutputViewerProps = {
    unit: WodeExecutionUnit;
    onOutputUpdateRequest: (unit: any) => void;
    jobProperties: WorkflowDesignerProperty[];
    unitEndpointsByFlowchartId?: WorkflowDesignerUnitEndpointsByUnit;
};

// Its own component so the output hook runs only while a unit is open in view mode, and stops
// when the modal closes.
function ExecutionUnitOutputViewer({
    unit,
    onOutputUpdateRequest,
    jobProperties,
    unitEndpointsByFlowchartId,
}: ExecutionUnitOutputViewerProps) {
    // `repetition` is unset on a unit outside a map, where output and endpoints are published
    // under repetition 0.
    const repetition = unit.repetition ?? 0;
    const output = useUnitOutput(unit.flowchartId, repetition);
    // `status` is per unit, not per repetition, so a mapped unit with another branch still
    // running passes this gate on a finished branch.
    const unitEndpoints =
        unit.status === UnitStatus.active
            ? unitEndpointsByFlowchartId?.[unit.flowchartId]?.[repetition]
            : undefined;

    return (
        <ExecutionUnitViewer
            unit={unit}
            onOutputUpdateRequest={onOutputUpdateRequest}
            jobProperties={jobProperties}
            unitEndpoints={unitEndpoints}
            output={output}
        />
    );
}

export function UnitModalContent({
    unit,
    units,
    onUpdate,
    adjustable,
    editable,
    isStandalone,
    onOutputUpdateRequest,
    materials,
    materialsIndex,
    onMaterialSwitch,
    jobProperties = [],
    unitEndpointsByFlowchartId,
}: UnitModalContentProps) {
    const isViewMode = !editable && !adjustable;

    if (unit.type === UnitType.error) {
        return <ErrorUnitContent unit={unit as ErrorUnit} />;
    }

    if (unit.type === UnitType.execution) {
        const executionUnit = unit as WodeExecutionUnit;
        if (isViewMode) {
            return (
                <ExecutionUnitOutputViewer
                    unit={executionUnit}
                    onOutputUpdateRequest={onOutputUpdateRequest}
                    jobProperties={jobProperties}
                    unitEndpointsByFlowchartId={unitEndpointsByFlowchartId}
                />
            );
        }
        return (
            <ExecutionUnit
                unit={executionUnit.toJSON()}
                renderingContext={executionUnit.renderingContext}
                units={units}
                onUpdate={onUpdate}
                isStandalone={isStandalone}
                editable={editable}
                adjustable={adjustable}
                materials={materials}
                materialsIndex={materialsIndex}
                onMaterialSwitch={onMaterialSwitch}
                UnitDetailsComponent={UnitDetails}
                UnitPointerFieldComponent={UnitPointerFieldComponent}
            />
        );
    }
    if (unit.type === UnitType.io && unit.subtype === "dataFrame") {
        return (
            <DataFrameIOUnit
                unit={unit}
                editable={editable}
                adjustable={adjustable}
                onUpdate={onUpdate}
                materials={materials}
            />
        );
    }
    return <BaseUnit unit={unit} units={units} onUpdate={onUpdate} editable={editable} />;
}
