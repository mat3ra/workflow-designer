import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
export function reportWorkflowSaveError(err) {
    const e = err;
    showErrorAlert(e.reason || e.message || "Save failed");
}
