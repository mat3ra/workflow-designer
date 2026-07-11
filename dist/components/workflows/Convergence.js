import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import { InfoPopoverWithDocumentation } from "@exabyte-io/cove.js/dist/mui/components/popover/info-popover/InfoPopoverWithDocumentation";
import Select from "@exabyte-io/cove.js/dist/mui/components/select";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { ConvergenceParameterInputs } from "./ConvergenceParameterInputs";
const parameterTypes = { N_k: "scalar", N_k_nonuniform: "vector" };
const parameterNames = { N_k: "N_k", N_k_nonuniform: "N_k (non-uniform)" };
const scopeVariables = ["N_k", "N_k_nonuniform"];
const scalarResults = ["total_energy", "pressure"];
export default function Convergence({ id = "convergence-modal", title = "Convergence", subworkflow: _subworkflow, onClose, onApply, }) {
    const [selectedParameter, setSelectedParameter] = useState(scopeVariables[0]);
    const [selectedResult, setSelectedResult] = useState(scalarResults[0]);
    const [resultInitial, setResultInitial] = useState(0);
    const [maxOccurrences, setMaxOccurrences] = useState(10);
    const [parameterInitial0, setParameterInitial0] = useState(1);
    const [parameterInitial1, setParameterInitial1] = useState(1);
    const [parameterInitial2, setParameterInitial2] = useState(1);
    const [parameterInitial, setParameterInitial] = useState(1);
    const [parameterIncrement, setParameterIncrement] = useState(1);
    const [operator, setOperator] = useState("<");
    const [tolerance, setTolerance] = useState(1e-5);
    const [isApplying, setIsApplying] = useState(false);
    const scopeVariablesItems = useMemo(() => scopeVariables.map((value) => ({
        id: value,
        value,
        name: parameterNames[value],
    })), []);
    const getParameterValue = () => {
        if (parameterTypes[selectedParameter] === "vector") {
            return [parameterInitial0, parameterInitial1, parameterInitial2];
        }
        return Number(parameterInitial);
    };
    const areEmptyInputs = useMemo(() => {
        if ([resultInitial, maxOccurrences, tolerance].some((value) => value === ""))
            return true;
        if (parameterTypes[selectedParameter] === "vector") {
            return [parameterInitial0, parameterInitial1, parameterInitial2].some((value) => value === "");
        }
        return [parameterInitial, parameterIncrement].some((value) => value === "");
    }, [
        selectedParameter,
        resultInitial,
        maxOccurrences,
        tolerance,
        parameterInitial,
        parameterIncrement,
        parameterInitial0,
        parameterInitial1,
        parameterInitial2,
    ]);
    const handleApply = () => {
        setIsApplying(true);
        onApply({
            parameter: selectedParameter,
            parameterInitial: getParameterValue(),
            parameterIncrement: Number(parameterIncrement),
            result: selectedResult,
            resultInitial: Number(resultInitial),
            condition: `abs((prev_result-${selectedResult})/${selectedResult})`,
            operator,
            tolerance: Number(tolerance),
            maxOccurrences: Number(maxOccurrences),
        });
    };
    return (_jsx(Dialog, { open: true, id: id, title: title, onClose: onClose, onSubmit: handleApply, submitButtonText: "Apply", isSubmitButtonProcessing: isApplying, isSubmitButtonDisabled: areEmptyInputs, maxWidth: "md", children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(Select, { id: "select-parameters", label: "Parameter", value: selectedParameter, formControlProps: {}, items: scopeVariablesItems, onChange: (e) => {
                            setSelectedParameter(e.target.value);
                        } }) }), _jsx(ConvergenceParameterInputs, { isVectorInput: parameterTypes[selectedParameter] === "vector", parameterInitial0: parameterInitial0, parameterInitial1: parameterInitial1, parameterInitial2: parameterInitial2, parameterInitial: parameterInitial, parameterIncrement: parameterIncrement, onParameterInitial0Change: setParameterInitial0, onParameterInitial1Change: setParameterInitial1, onParameterInitial2Change: setParameterInitial2, onParameterInitialChange: setParameterInitial, onParameterIncrementChange: setParameterIncrement }), _jsx(Grid, { item: true, xs: 6, children: _jsx(Select, { id: "select-results", label: "Result", value: selectedResult, formControlProps: {}, items: scalarResults.map((value) => ({
                            id: value,
                            value,
                            name: value,
                        })), onChange: (e) => setSelectedResult(e.target.value) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { id: "intial-result", label: "Initial value", type: "number", value: resultInitial, margin: "dense", onChange: (e) => {
                            setResultInitial(Number(e.target.value));
                        }, fullWidth: true }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { id: "condition", label: "Condition", type: "text", disabled: true, margin: "dense", value: `abs((prev_result-${selectedResult})/${selectedResult})`, fullWidth: true, InputProps: {
                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(InfoPopoverWithDocumentation, { popoverTitle: "Convergence Condition", searchText: "Assignment", children: "This field specifies the convergence condition and will appear in the convergence workflow as an assignment unit." }) })),
                        } }) }), _jsx(Grid, { item: true, xs: 2, children: _jsx(Select, { id: "select-operator", label: "Operator", value: operator, formControlProps: {}, items: ["<", "<="].map((value) => ({
                            id: value,
                            value,
                            name: value === "<=" ? "≤" : value,
                        })), onChange: (e) => setOperator(e.target.value) }) }), _jsx(Grid, { item: true, xs: 4, children: _jsx(TextField, { id: "tolerance", label: "Tolerance", type: "number", value: tolerance, margin: "dense", onChange: (e) => {
                            setTolerance(Number(e.target.value));
                        }, fullWidth: true }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { id: "max-occurrences", label: "Iterations limit", type: "number", value: maxOccurrences, margin: "dense", onChange: (e) => {
                            setMaxOccurrences(Number(e.target.value));
                        }, fullWidth: true }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Typography, { variant: "body2", children: [_jsx("sup", { children: "*" }), _jsx("code", { children: "prev_result" }), " - result on previous step"] }) })] }) }));
}
