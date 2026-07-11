import type { WorkflowDesignerProfile } from "../types/context";
/**
 * Whether the workflow description editor may be shown for the current account.
 * @param workflowEntity Argument to `team.containsEntity` (e.g. persisted core workflow from a
 * designer shell, or an in-memory wode `Workflow` for map / other embedded editors).
 */
export declare function computeIsWorkflowDescriptionEditable(workflowEntity: unknown, profile: WorkflowDesignerProfile, editable: boolean): boolean;
//# sourceMappingURL=workflowDescriptionEditPermission.d.ts.map