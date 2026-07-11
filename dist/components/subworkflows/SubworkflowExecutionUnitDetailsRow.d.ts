import type { NameResultSchema } from "@mat3ra/code/dist/js/utils/object";
import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
export type SubworkflowExecutionUnitDetailsRowProps = {
    unit: AnySubworkflowUnit;
    index: number;
    editable: boolean;
    onUnitResultsChanged: (flowchartId: string, results: NameResultSchema[]) => void;
    onUnitIsDraftChanged: (flowchartId: string, isDraft: boolean) => void;
    onUnitMonitorChanged: (flowchartId: string, monitor: string, enabled: boolean) => void;
    onUnitPostProcessorChanged: (flowchartId: string, postProcessor: string, enabled: boolean) => void;
};
export declare function SubworkflowExecutionUnitDetailsRow({ unit, index, editable, onUnitResultsChanged, onUnitIsDraftChanged, onUnitMonitorChanged, onUnitPostProcessorChanged, }: SubworkflowExecutionUnitDetailsRowProps): React.JSX.Element;
//# sourceMappingURL=SubworkflowExecutionUnitDetailsRow.d.ts.map