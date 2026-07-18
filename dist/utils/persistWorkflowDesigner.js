import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
export function reportWorkflowSaveError(err) {
    const e = err;
    showErrorAlert(e.reason || e.message || "Save failed");
}
