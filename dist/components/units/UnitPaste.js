import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Select from "@mat3ra/cove/dist/mui/components/select";
import Codemirror from "@mat3ra/cove/dist/other/codemirror";
import Box from "@mui/material/Box";
import { useState } from "react";
const JSON_QUERY_INDENT_SPACES = 4;
export default function UnitPaste({ id = "workflow-unit-paste-modal", title = "Paste subworkflow contents", onClose, onSubmit, }) {
    const [unitIndex, setUnitIndex] = useState(0);
    const [unitContents, setUnitContents] = useState("");
    const handleSubmit = () => {
        onSubmit(JSON.parse(unitContents), unitIndex);
    };
    return (_jsx(Dialog, { open: true, id: id, title: title, onClose: onClose, onSubmit: handleSubmit, submitButtonText: "Apply", scroll: "paper", maxWidth: "lg", children: _jsxs(Box, { sx: { height: "100%", overflow: "hidden" }, children: [_jsx(Select, { id: `${id}-select-index`, label: "Unit index", value: unitIndex, formControlProps: {}, items: ["append to current", "prepend to current"].map((type, index) => ({
                        id: type,
                        name: type,
                        value: index,
                    })), onChange: (event) => {
                        setUnitIndex(Number(event.target.value));
                    } }), _jsx(Box, { id: "workflow-unit-paste-contents", sx: { border: "1px solid #ccc", borderRadius: 1, overflowY: "auto" }, children: _jsx(Codemirror, { content: unitContents, updateContent: setUnitContents, options: { tabSize: JSON_QUERY_INDENT_SPACES }, language: "json" }) })] }) }));
}
