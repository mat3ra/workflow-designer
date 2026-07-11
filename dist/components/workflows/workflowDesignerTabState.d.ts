import type { Workflow as WodeWorkflow } from "@mat3ra/wode";
/** Stable identity for resetting workflow-designer UI state (unit index, subworkflow tabs, …). */
export declare function getWorkflowDesignerTabResetKey(workflow: WodeWorkflow): string;
export declare function shouldResetWorkflowDesignerUiState(previousKey: string, nextKey: string): boolean;
//# sourceMappingURL=workflowDesignerTabState.d.ts.map