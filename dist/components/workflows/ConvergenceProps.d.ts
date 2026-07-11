import type { Subworkflow } from "@mat3ra/wode";
/** Arguments for wode `Subworkflow.addConvergence` except `externalContext` (built by the workflow shell). */
export type ConvergenceApplyParams = {
    parameter: "N_k" | "N_k_nonuniform";
    parameterInitial: number | [number, number, number];
    parameterIncrement: number;
    result: string;
    resultInitial: number;
    condition: string;
    operator: "<" | "<=";
    tolerance: number;
    maxOccurrences: number;
};
export interface ConvergenceProps {
    id?: string;
    title?: string;
    subworkflow: Subworkflow;
    onClose: () => void;
    onApply: (params: ConvergenceApplyParams) => void;
}
//# sourceMappingURL=ConvergenceProps.d.ts.map