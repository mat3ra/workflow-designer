import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import React from "react";

export type UndoSnackbarState = {
    message: string;
    onUndo: () => void;
} | null;

const AUTO_HIDE_MS = 10_000;

/**
 * Post-removal "Undo" affordance: the removal is applied immediately and can be reverted
 * within {@link AUTO_HIDE_MS}. Rendered by both the workflow-level container (subworkflow
 * removals) and {@link Subworkflow} (unit removals).
 */
export function UndoSnackbar({
    state,
    onClose,
}: {
    state: UndoSnackbarState;
    onClose: () => void;
}) {
    return (
        <Snackbar
            open={Boolean(state)}
            autoHideDuration={AUTO_HIDE_MS}
            onClose={(_event, reason) => {
                if (reason === "clickaway") return;
                onClose();
            }}
            message={state?.message ?? ""}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            data-tid="undo-snackbar"
            action={
                <Button
                    color="secondary"
                    size="small"
                    data-tid="undo-remove"
                    onClick={() => {
                        state?.onUndo();
                        onClose();
                    }}
                >
                    Undo
                </Button>
            }
        />
    );
}
