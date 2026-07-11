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
export declare function ConvergenceParameterInputs({ isVectorInput, parameterInitial0, parameterInitial1, parameterInitial2, parameterInitial, parameterIncrement, onParameterInitial0Change, onParameterInitial1Change, onParameterInitial2Change, onParameterInitialChange, onParameterIncrementChange, }: ConvergenceParameterInputsProps): React.JSX.Element;
//# sourceMappingURL=ConvergenceParameterInputs.d.ts.map