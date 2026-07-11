import { ExecutionUnit, ExecutionUnitViewer } from "@mat3ra/ave";
import { ErrorUnit, ExecutionUnit as WodeExecutionUnit } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type {
    AnySubworkflowUnit,
    AnySubworkflowUnitSchema,
} from "@mat3ra/wode/dist/js/units/factory";
import { ErrorUnitContent } from "@mat3ra/wove";
import React from "react";

import type { WorkflowDesignerProperty } from "../../types/context";
import { BaseUnit } from "./BaseUnit";
import { DataFrameIOUnit } from "./DataFrameIOUnit";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
}: UnitModalContentProps) {
    const isViewMode = !editable && !adjustable;

    if (unit.type === UnitType.error) {
        return <ErrorUnitContent unit={unit as ErrorUnit} />;
    }

    if (unit.type === UnitType.execution) {
        const executionUnit = unit as WodeExecutionUnit;
        if (isViewMode) {
            return (
                <ExecutionUnitViewer
                    unit={executionUnit}
                    onOutputUpdateRequest={onOutputUpdateRequest}
                    jobProperties={jobProperties}
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
