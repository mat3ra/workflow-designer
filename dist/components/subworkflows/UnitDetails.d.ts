import type { NameResultSchema } from "@mat3ra/code/dist/js/utils/object";
import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
export interface UnitDetailsProps {
    unit: ExecutionUnitSchema;
    editable: boolean;
    onUnitResultsChanged: (results: NameResultSchema[]) => void;
    onUnitIsDraftChanged: (isChecked: boolean) => void;
    onUnitMonitorChanged: (monitor: string, enabled: boolean) => void;
    onUnitPostProcessorChanged: (postProcessor: string, enabled: boolean) => void;
}
declare function UnitDetails({ unit, editable, onUnitResultsChanged, onUnitIsDraftChanged, onUnitMonitorChanged, onUnitPostProcessorChanged, }: UnitDetailsProps): React.JSX.Element;
export default UnitDetails;
//# sourceMappingURL=UnitDetails.d.ts.map