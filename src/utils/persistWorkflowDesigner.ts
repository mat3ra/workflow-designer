import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import type { Workflow } from "@mat3ra/wode";

export type SaveWorkflowFromDesigner = (params: {
    workflow: Workflow;
    omitRedirect: boolean;
}) => Promise<void>;

export function reportWorkflowSaveError(err: unknown): void {
    const e = err as { reason?: string; message?: string };
    showErrorAlert(e.reason || e.message || "Save failed");
}
