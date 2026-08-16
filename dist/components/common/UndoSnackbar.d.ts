import React from "react";
export type UndoSnackbarState = {
    message: string;
    onUndo: () => void;
} | null;
/**
 * Post-removal "Undo" affordance: the removal is applied immediately and can be reverted
 * within {@link AUTO_HIDE_MS}. Rendered by both the workflow-level container (subworkflow
 * removals) and {@link Subworkflow} (unit removals).
 */
export declare function UndoSnackbar({ state, onClose, }: {
    state: UndoSnackbarState;
    onClose: () => void;
}): React.JSX.Element;
//# sourceMappingURL=UndoSnackbar.d.ts.map