import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial } from "@mat3ra/wode";
import type { AnySubworkflowUnit, AnySubworkflowUnitSchema } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
import type { WorkflowDesignerAccount, WorkflowDesignerProperty } from "../../types/context";
export interface UnitModalProps {
    id?: string;
    title?: string;
    className?: string;
    unit: AnySubworkflowUnit;
    units: AnySubworkflowUnit[];
    onClose: () => void;
    onUpdate: (unit: AnySubworkflowUnitSchema) => void;
    adjustable: boolean;
    editable: boolean;
    isStandalone: boolean;
    onOutputUpdateRequest: (unit: AnySubworkflowUnit | ExecutionUnitSchema) => void;
    materials: OrderedMaterial[];
    materialsIndex: number;
    onMaterialSwitch: (index: number) => void;
    publicAccount: WorkflowDesignerAccount;
    jobProperties?: WorkflowDesignerProperty[];
}
export default function UnitModal({ id, title, className, onClose, unit, units, onUpdate, adjustable, editable, isStandalone, onOutputUpdateRequest, materials, materialsIndex, onMaterialSwitch, publicAccount, jobProperties, }: UnitModalProps): React.JSX.Element;
//# sourceMappingURL=UnitModal.d.ts.map