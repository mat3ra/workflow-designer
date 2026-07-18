import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { InfoPopoverWithDocumentation } from "@mat3ra/cove/dist/mui/components/popover/info-popover/InfoPopoverWithDocumentation";
import Select from "@mat3ra/cove/dist/mui/components/select";
import Grid from "@mui/material/Grid";
import { useState } from "react";
export default function UnitTypeSelect({ id = "workflow-unit-add-modal", title = "Select unit type", onClose, onSelect, unitTypes, }) {
    const [unitType, setUnitType] = useState(unitTypes[0]);
    const [unitIndex, setUnitIndex] = useState(0);
    const handleSubmit = () => {
        onSelect(unitType, unitIndex === 1);
    };
    return (_jsx(Dialog, { open: true, id: id, title: title, onClose: onClose, onSubmit: handleSubmit, submitButtonText: "Apply", maxWidth: "sm", children: _jsxs(Grid, { container: true, spacing: 0.5, children: [_jsx(Grid, { item: true, xs: 11, children: _jsx(Select, { id: `${id}-select-type`, label: "Unit type", value: unitType, formControlProps: {}, items: unitTypes.map((type) => ({
                            id: type,
                            name: type,
                            value: type,
                        })), onChange: (event) => {
                            setUnitType(event.target.value);
                        } }) }), _jsx(Grid, { item: true, xs: 1, children: _jsxs(InfoPopoverWithDocumentation, { popoverTitle: "Unit types", searchText: "Unit types", children: ["Users can choose between one of the following unit types:", _jsx("br", {}), _jsxs("dl", { children: [_jsx("dt", { children: "Execution unit" }), _jsx("dd", { children: "\u2003 to run scripts or simulation software" }), _jsx("dt", { children: "Assignment unit" }), _jsx("dd", { children: "\u2003 to set variables and evaluate expressions" }), _jsx("dt", { children: "Condition unit" }), _jsx("dd", { children: "\u2003 to execute units conditionally" }), _jsx("dt", { children: "Assertion unit" }), _jsx("dd", { children: "\u2003 to evaluate a condition before executing a subsequent unit" })] })] }) }), _jsx(Grid, { item: true, xs: 11, children: _jsx(Select, { id: `${id}-select-index`, label: "Unit index", value: `${unitIndex}`, formControlProps: {}, items: ["append to current", "prepend to current"].map((type, index) => ({
                            id: type,
                            name: type,
                            value: index,
                        })), onChange: (event) => {
                            setUnitIndex(Number(event.target.value));
                        } }) })] }) }));
}
