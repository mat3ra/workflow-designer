/** Stable identity for resetting workflow-designer UI state (unit index, subworkflow tabs, …). */
export function getWorkflowDesignerTabResetKey(workflow) {
    var _a;
    return (_a = workflow._id) !== null && _a !== void 0 ? _a : "";
}
export function shouldResetWorkflowDesignerUiState(previousKey, nextKey) {
    return previousKey !== nextKey;
}
