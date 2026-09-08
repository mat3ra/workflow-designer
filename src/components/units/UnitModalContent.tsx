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
    WorkflowDesignerExtraTabsByUnit,
    WorkflowDesignerProperty,
} from "../../types/context";
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
    extraTabsByUnitFlowchartId?: WorkflowDesignerExtraTabsByUnit;
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
    extraTabsByUnitFlowchartId,
}: UnitModalContentProps) {
    const isViewMode = !editable && !adjustable;

    if (unit.type === UnitType.error) {
        return <ErrorUnitContent unit={unit as ErrorUnit} />;
    }

    if (unit.type === UnitType.execution) {
        const executionUnit = unit as WodeExecutionUnit;
        if (isViewMode) {
            // A finished unit keeps its endpoint property, and offering that dead link is what
            // the viewer used to do; gate on status instead — the unit's status, not which
            // application it ran. Note `status` is per unit, not per repetition (it is
            // last-write-wins across branches; per-branch history lives in `statusTrack`), so a
            // mapped unit with one branch still running can pass this gate while the branch
            // being viewed has finished. Pre-existing — ave's own gate was equally blind — and
            // tracked in PLAN.md rather than fixed here, since the per-repetition status helper
            // belongs in wode.
            const extraTabs =
                executionUnit.status === UnitStatus.active
                    ? extraTabsByUnitFlowchartId?.[executionUnit.flowchartId]?.[
                          executionUnit.repetition
                      ]
                    : undefined;
            return (
                <ExecutionUnitViewer
                    unit={executionUnit}
                    onOutputUpdateRequest={onOutputUpdateRequest}
                    jobProperties={jobProperties}
                    extraTabs={extraTabs}
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
