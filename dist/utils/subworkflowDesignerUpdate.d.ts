import type { SubworkflowSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial, type Subworkflow as WodeSubworkflow, type Workflow as WodeWorkflow } from "@mat3ra/wode";
import type { WorkflowDesignerMetaProperty } from "../types/context";
export type SubworkflowDesignerUpdate = SubworkflowSchema | WodeSubworkflow;
/** Distinguish live wode instances from plain schema (no `instanceof` — Meteor/Rspack split). */
export declare function isWodeSubworkflowInstance(value: SubworkflowDesignerUpdate): value is WodeSubworkflow;
/**
 * Persist a subworkflow edit on the in-memory workflow.
 * Convergence passes a live {@link WodeSubworkflow} (clone + addConvergence); other editors pass JSON after mutating the instance in place.
 */
export declare function applySubworkflowUpdateToWorkflow(workflow: WodeWorkflow, subworkflowOrSchema: SubworkflowDesignerUpdate, materials: OrderedMaterial[], metaProperties: WorkflowDesignerMetaProperty[]): boolean;
//# sourceMappingURL=subworkflowDesignerUpdate.d.ts.map