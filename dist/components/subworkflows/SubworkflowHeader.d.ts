import { type MaterialsSet, type OrderedMaterial, type Subworkflow as WodeSubworkflow, type Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
import type { SubworkflowDesignerUpdate } from "../../utils/subworkflowDesignerUpdate";
export type SubworkflowHeaderProps = {
    unit: AnyWorkflowUnit;
    adjustable?: boolean;
    editable?: boolean;
    subworkflow?: WodeSubworkflow;
    onUnitRemove: () => void;
    headerStatusCls: (unit: AnyWorkflowUnit) => string;
    /**
     * User finished editing the branch title in `EntityHeader`. The wove `Workflow` designer
     * sets `unit.name` on the active unit and calls `onUnitUpdate(unit)`; consumers must persist
     * `unitInstances` and keep the paired `Subworkflow` display name in sync (wode:
     * `Workflow.prototype.syncLinkedSubworkflowNameFromUnit`).
     */
    onUnitNameUpdate: (name: string) => void;
    unitIndex: number;
    onUnitAdd: (unitType: UnitType, prepend?: boolean, unitIndex?: number) => void;
    onUnitAddSubworkflowFromConfig: (config: unknown, prependOrPasteIndex?: boolean | number, unitIndex?: number) => void;
    onUpdateUnitIndex: (index: number) => void;
    workflow: WodeWorkflow;
    areWorkflowContentExpanded?: boolean;
    toggleExpandWorkflowContent?: () => void;
    onSubworkflowUnitUpdate: (subworkflow: SubworkflowDesignerUpdate) => void;
    materials: OrderedMaterial[];
    materialsIndex?: number;
    materialsSet?: MaterialsSet;
    jobHasParent?: boolean;
};
export default function SubworkflowHeader({ unit, adjustable, editable, subworkflow, onUnitRemove, headerStatusCls, onUnitNameUpdate, unitIndex, onUnitAdd, onUnitAddSubworkflowFromConfig, onUpdateUnitIndex, workflow, areWorkflowContentExpanded, toggleExpandWorkflowContent, onSubworkflowUnitUpdate, materials, materialsIndex, materialsSet, jobHasParent, }: SubworkflowHeaderProps): React.JSX.Element;
//# sourceMappingURL=SubworkflowHeader.d.ts.map