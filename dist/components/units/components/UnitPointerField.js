import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useMemo } from "react";
import s from "underscore.string";
export default function UnitPointerField({ selectedValue, availableUnits, label, onChange, }) {
    const options = useMemo(() => [
        { id: null, name: "None" },
        ...availableUnits.map((availableUnit) => {
            return {
                id: availableUnit.flowchartId,
                name: availableUnit.name || "",
            };
        }),
    ], [availableUnits]);
    const optionsList = options
        ? options.map((availableValue) => {
            const menuItemContent = availableValue.name;
            return (_jsx(MenuItem, { value: availableValue.id || "", children: menuItemContent }, availableValue.id));
        })
        : [];
    return (_jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(TextField, { label: s.capitalize(label), value: selectedValue, onChange: (e) => onChange(e.target.value), variant: "outlined", fullWidth: true, select: true, size: "small", InputLabelProps: { shrink: true }, children: optionsList }), _jsx(TextField, { type: "text", variant: "outlined", fullWidth: true, label: "FlowchartId", className: `${s.slugify(label)}-flowchartid`, value: selectedValue || "None", disabled: true, size: "small", InputLabelProps: { shrink: true } })] }));
}
