import type {
    WorkflowDesignerAccessType,
    WorkflowDesignerProfile,
} from "../types/context";

// "edit" is the only ACCESS_TYPES value used here; hardcoded to remove the getDependency registry.
const EDIT_ACCESS_TYPE = "edit" as WorkflowDesignerAccessType;

/**
 * Whether the workflow description editor may be shown for the current account.
 * @param workflowEntity Argument to `team.containsEntity` (e.g. persisted core workflow from a
 * designer shell, or an in-memory wode `Workflow` for map / other embedded editors).
 */
export function computeIsWorkflowDescriptionEditable(
    workflowEntity: unknown,
    profile: WorkflowDesignerProfile,
    editable: boolean,
): boolean {
    const currentAccountTeams = Object.values(profile.account.systemTeams);
    const hasPermission = currentAccountTeams.some((team) => {
        return (
            (team as any).containsEntity(workflowEntity as never) &&
            (team as any).hasAccessOfTypes(EDIT_ACCESS_TYPE)
        );
    });
    return Boolean(editable || hasPermission);
}
