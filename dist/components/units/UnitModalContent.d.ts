import type { AnySubworkflowUnit, AnySubworkflowUnitSchema } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
import type { WorkflowDesignerProperty } from "../../types/context";
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
export declare function UnitModalContent({ unit, units, onUpdate, adjustable, editable, isStandalone, onOutputUpdateRequest, materials, materialsIndex, onMaterialSwitch, jobProperties, }: UnitModalContentProps): React.JSX.Element;
//# sourceMappingURL=UnitModalContent.d.ts.map