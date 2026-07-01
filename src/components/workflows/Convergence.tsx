/* eslint-disable @typescript-eslint/no-explicit-any */
import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import Select from "@exabyte-io/cove.js/dist/mui/components/select";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useMemo, useState } from "react";

import { ConvergenceParameterInputs } from "./ConvergenceParameterInputs";
import { ConvergenceProps } from "./ConvergenceProps";
import { InfoPopoverWithDocumentation } from "@exabyte-io/cove.js/dist/mui/components/popover/info-popover/InfoPopoverWithDocumentation";

const parameterTypes = { N_k: "scalar", N_k_nonuniform: "vector" };
const parameterNames = { N_k: "N_k", N_k_nonuniform: "N_k (non-uniform)" };
const scopeVariables = ["N_k", "N_k_nonuniform"] as const;
const scalarResults = ["total_energy", "pressure"] as const;

type Operator = "<" | "<=";

export default function Convergence({
    id = "convergence-modal",
    title = "Convergence",
    subworkflow: _subworkflow,
    onClose,
    onApply,
}: ConvergenceProps) {
    const [selectedParameter, setSelectedParameter] = useState<(typeof scopeVariables)[number]>(
        scopeVariables[0],
    );
    const [selectedResult, setSelectedResult] = useState<(typeof scalarResults)[number]>(
        scalarResults[0],
    );
    const [resultInitial, setResultInitial] = useState(0);
    const [maxOccurrences, setMaxOccurrences] = useState(10);
    const [parameterInitial0, setParameterInitial0] = useState(1);
    const [parameterInitial1, setParameterInitial1] = useState(1);
    const [parameterInitial2, setParameterInitial2] = useState(1);
    const [parameterInitial, setParameterInitial] = useState(1);
    const [parameterIncrement, setParameterIncrement] = useState(1);
    const [operator, setOperator] = useState<Operator>("<");
    const [tolerance, setTolerance] = useState(1e-5);
    const [isApplying, setIsApplying] = useState(false);

    const scopeVariablesItems = useMemo(
        () =>
            scopeVariables.map((value) => ({
                id: value,
                value,
                name: parameterNames[value],
            })),
        [],
    );

    const getParameterValue = () => {
        if (parameterTypes[selectedParameter] === "vector") {
            return [parameterInitial0, parameterInitial1, parameterInitial2] as [
                number,
                number,
                number,
            ];
        }
        return Number(parameterInitial);
    };

    const areEmptyInputs = useMemo(() => {
        if ([resultInitial, maxOccurrences, tolerance].some((value) => (value as any) === "")) return true;
        if (parameterTypes[selectedParameter] === "vector") {
            return [parameterInitial0, parameterInitial1, parameterInitial2].some(
                (value) => (value as any) === "",
            );
        }
        return [parameterInitial, parameterIncrement].some((value) => (value as any) === "");
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

    return (
        <Dialog
            open
            id={id}
            title={title}
            onClose={onClose}
            onSubmit={handleApply}
            submitButtonText="Apply"
            isSubmitButtonProcessing={isApplying}
            isSubmitButtonDisabled={areEmptyInputs}
            maxWidth="md">
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Select
                        id="select-parameters"
                        label="Parameter"
                        value={selectedParameter as any}
                        formControlProps={{}}
                        items={scopeVariablesItems}
                        onChange={(e) => {
                            setSelectedParameter(e.target.value as (typeof scopeVariables)[number]);
                        }}
                    />
                </Grid>
                <ConvergenceParameterInputs
                    isVectorInput={parameterTypes[selectedParameter] === "vector"}
                    parameterInitial0={parameterInitial0}
                    parameterInitial1={parameterInitial1}
                    parameterInitial2={parameterInitial2}
                    parameterInitial={parameterInitial}
                    parameterIncrement={parameterIncrement}
                    onParameterInitial0Change={setParameterInitial0}
                    onParameterInitial1Change={setParameterInitial1}
                    onParameterInitial2Change={setParameterInitial2}
                    onParameterInitialChange={setParameterInitial}
                    onParameterIncrementChange={setParameterIncrement}
                />
                <Grid item xs={6}>
                    <Select
                        id="select-results"
                        label="Result"
                        value={selectedResult as any}
                        formControlProps={{}}
                        items={scalarResults.map((value) => ({
                            id: value,
                            value,
                            name: value,
                        }))}
                        onChange={(e) =>
                            setSelectedResult(e.target.value as (typeof scalarResults)[number])
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id="intial-result"
                        label="Initial value"
                        type="number"
                        value={resultInitial}
                        margin="dense"
                        onChange={(e) => {
                            setResultInitial(Number(e.target.value));
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id="condition"
                        label="Condition"
                        type="text"
                        disabled
                        margin="dense"
                        value={`abs((prev_result-${selectedResult})/${selectedResult})`}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <InfoPopoverWithDocumentation
                                        popoverTitle="Convergence Condition"
                                        searchText="Assignment">
                                        This field specifies the convergence condition and will
                                        appear in the convergence workflow as an assignment unit.
                                    </InfoPopoverWithDocumentation>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Select
                        id="select-operator"
                        label="Operator"
                        value={operator as any}
                        formControlProps={{}}
                        items={["<", "<="].map((value) => ({
                            id: value,
                            value,
                            name: value === "<=" ? "≤" : value,
                        }))}
                        onChange={(e) => setOperator(e.target.value as Operator)}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        id="tolerance"
                        label="Tolerance"
                        type="number"
                        value={tolerance}
                        margin="dense"
                        onChange={(e) => {
                            setTolerance(Number(e.target.value));
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id="max-occurrences"
                        label="Iterations limit"
                        type="number"
                        value={maxOccurrences}
                        margin="dense"
                        onChange={(e) => {
                            setMaxOccurrences(Number(e.target.value));
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">
                        <sup>*</sup>
                        <code>prev_result</code> - result on previous step
                    </Typography>
                </Grid>
            </Grid>
        </Dialog>
    );
}
