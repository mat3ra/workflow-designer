/**
 * Which shell the designer renders in.
 *
 * - `classic` — the two-column layout (flowchart of steps beside the step panel) every consumer
 *   has today. The default, and unchanged by SOF-8024 portion 5.
 * - `studio` — the steps rail beside the step being edited, without the duplicated flowchart.
 *
 * Hosts opt in per tenant while the two run side by side; the default flips once the studio
 * shell reaches parity, and `classic` goes one release later.
 */
export type WorkflowLayoutVariant = "classic" | "studio";

export const DEFAULT_WORKFLOW_LAYOUT_VARIANT: WorkflowLayoutVariant = "classic";

/** Anything unrecognized falls back to the layout the host already had. */
export function resolveWorkflowLayoutVariant(variant?: string): WorkflowLayoutVariant {
    return variant === "studio" ? "studio" : DEFAULT_WORKFLOW_LAYOUT_VARIANT;
}
