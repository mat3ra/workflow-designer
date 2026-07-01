import type { SubworkflowSchema } from "@mat3ra/esse/dist/js/types";
import {
    type OrderedMaterial,
    type Subworkflow as WodeSubworkflow,
    type Workflow as WodeWorkflow,
} from "@mat3ra/wode";

import type { WorkflowDesignerMetaProperty } from "../types/context";

export type SubworkflowDesignerUpdate = SubworkflowSchema | WodeSubworkflow;

/** Distinguish live wode instances from plain schema (no `instanceof` — Meteor/Rspack split). */
export function isWodeSubworkflowInstance(
    value: SubworkflowDesignerUpdate,
): value is WodeSubworkflow {
    return "unitsInstances" in value && Array.isArray(value.unitsInstances);
}

/**
 * Persist a subworkflow edit on the in-memory workflow.
 * Convergence passes a live {@link WodeSubworkflow} (clone + addConvergence); other editors pass JSON after mutating the instance in place.
 */
export function applySubworkflowUpdateToWorkflow(
    workflow: WodeWorkflow,
    subworkflowOrSchema: SubworkflowDesignerUpdate,
    materials: OrderedMaterial[],
    metaProperties: WorkflowDesignerMetaProperty[],
): boolean {
    const subworkflowEntity = isWodeSubworkflowInstance(subworkflowOrSchema)
        ? subworkflowOrSchema
        : null;
    const subworkflowSchema = subworkflowEntity ? subworkflowEntity.toJSON() : subworkflowOrSchema;

    const subworkflowIndex = workflow.subworkflowInstances.findIndex(
        (sw) => sw.id === subworkflowSchema._id,
    );
    if (subworkflowIndex < 0) {
        return false;
    }

    if (subworkflowEntity) {
        subworkflowEntity.updateMethodData(materials, metaProperties);
        workflow.subworkflowInstances[subworkflowIndex] = subworkflowEntity;
    }

    workflow.subworkflows[subworkflowIndex] = subworkflowSchema;
    return true;
}
