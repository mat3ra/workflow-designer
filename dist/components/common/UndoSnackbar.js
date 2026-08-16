import { jsx as _jsx } from "react/jsx-runtime";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
const AUTO_HIDE_MS = 10000;
/**
 * Post-removal "Undo" affordance: the removal is applied immediately and can be reverted
 * within {@link AUTO_HIDE_MS}. Rendered by both the workflow-level container (subworkflow
 * removals) and {@link Subworkflow} (unit removals).
 */
export function UndoSnackbar({ state, onClose, }) {
    var _a;
    return (_jsx(Snackbar, { open: Boolean(state), autoHideDuration: AUTO_HIDE_MS, onClose: (_event, reason) => {
            if (reason === "clickaway")
                return;
            onClose();
        }, message: (_a = state === null || state === void 0 ? void 0 : state.message) !== null && _a !== void 0 ? _a : "", anchorOrigin: { vertical: "bottom", horizontal: "center" }, "data-tid": "undo-snackbar", action: _jsx(Button, { color: "secondary", size: "small", "data-tid": "undo-remove", onClick: () => {
                state === null || state === void 0 ? void 0 : state.onUndo();
                onClose();
            }, children: "Undo" }) }));
}
