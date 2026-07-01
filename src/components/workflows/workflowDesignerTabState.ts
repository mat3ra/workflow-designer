import type { Workflow as WodeWorkflow } from "@mat3ra/wode";

/** Stable identity for resetting workflow-designer UI state (unit index, subworkflow tabs, …). */
export function getWorkflowDesignerTabResetKey(workflow: WodeWorkflow): string {
    return workflow._id ?? "";
}

export function shouldResetWorkflowDesignerUiState(previousKey: string, nextKey: string): boolean {
    return previousKey !== nextKey;
}
