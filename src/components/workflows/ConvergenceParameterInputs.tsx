import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import React from "react";

export type ConvergenceParameterInputsProps = {
    isVectorInput: boolean;
    parameterInitial0: number;
    parameterInitial1: number;
    parameterInitial2: number;
    parameterInitial: number;
    parameterIncrement: number;
    onParameterInitial0Change: (value: number) => void;
    onParameterInitial1Change: (value: number) => void;
    onParameterInitial2Change: (value: number) => void;
    onParameterInitialChange: (value: number) => void;
    onParameterIncrementChange: (value: number) => void;
};

export function ConvergenceParameterInputs({
    isVectorInput,
    parameterInitial0,
    parameterInitial1,
    parameterInitial2,
    parameterInitial,
    parameterIncrement,
    onParameterInitial0Change,
    onParameterInitial1Change,
    onParameterInitial2Change,
    onParameterInitialChange,
    onParameterIncrementChange,
}: ConvergenceParameterInputsProps) {
    const ParamInput = isVectorInput ? (
        <Grid item xs={3}>
            <TextField
                id="parameter-value-0"
                label="Initial value X"
                type="number"
                value={parameterInitial0}
                margin="dense"
                onChange={(e) => {
                    onParameterInitial0Change(Number(e.target.value));
                }}
            />
            <TextField
                id="parameter-value-1"
                label="Initial value Y"
                type="number"
                value={parameterInitial1}
                margin="dense"
                onChange={(e) => {
                    onParameterInitial1Change(Number(e.target.value));
                }}
            />
            <TextField
                id="parameter-value-2"
                label="Initial value Z"
                type="number"
                value={parameterInitial2}
                margin="dense"
                onChange={(e) => {
                    onParameterInitial2Change(Number(e.target.value));
                }}
            />
        </Grid>
    ) : (
        <Grid item xs={3}>
            <TextField
                id="parameter-value"
                label="Initial value"
                type="number"
                value={parameterInitial}
                margin="dense"
                onChange={(e) => {
                    onParameterInitialChange(Number(e.target.value));
                }}
            />
        </Grid>
    );

    return (
        <>
            {ParamInput}
            <Grid item xs={3}>
                <TextField
                    id="minimum-increment"
                    label="Minimum increment"
                    type="number"
                    value={parameterIncrement}
                    margin="dense"
                    onChange={(e) => {
                        onParameterIncrementChange(Number(e.target.value));
                    }}
                />
            </Grid>
        </>
    );
}
