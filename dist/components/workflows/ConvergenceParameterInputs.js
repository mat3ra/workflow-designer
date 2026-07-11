import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
export function ConvergenceParameterInputs({ isVectorInput, parameterInitial0, parameterInitial1, parameterInitial2, parameterInitial, parameterIncrement, onParameterInitial0Change, onParameterInitial1Change, onParameterInitial2Change, onParameterInitialChange, onParameterIncrementChange, }) {
    const ParamInput = isVectorInput ? (_jsxs(Grid, { item: true, xs: 3, children: [_jsx(TextField, { id: "parameter-value-0", label: "Initial value X", type: "number", value: parameterInitial0, margin: "dense", onChange: (e) => {
                    onParameterInitial0Change(Number(e.target.value));
                } }), _jsx(TextField, { id: "parameter-value-1", label: "Initial value Y", type: "number", value: parameterInitial1, margin: "dense", onChange: (e) => {
                    onParameterInitial1Change(Number(e.target.value));
                } }), _jsx(TextField, { id: "parameter-value-2", label: "Initial value Z", type: "number", value: parameterInitial2, margin: "dense", onChange: (e) => {
                    onParameterInitial2Change(Number(e.target.value));
                } })] })) : (_jsx(Grid, { item: true, xs: 3, children: _jsx(TextField, { id: "parameter-value", label: "Initial value", type: "number", value: parameterInitial, margin: "dense", onChange: (e) => {
                onParameterInitialChange(Number(e.target.value));
            } }) }));
    return (_jsxs(_Fragment, { children: [ParamInput, _jsx(Grid, { item: true, xs: 3, children: _jsx(TextField, { id: "minimum-increment", label: "Minimum increment", type: "number", value: parameterIncrement, margin: "dense", onChange: (e) => {
                        onParameterIncrementChange(Number(e.target.value));
                    } }) })] }));
}
