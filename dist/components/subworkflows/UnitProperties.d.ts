import { type NameResultSchema } from "@mat3ra/code/dist/js/utils/object";
import React from "react";
import type { WorkflowDesignerExecutionUnitSchema } from "../../types/context";
interface UnitPropertiesProps {
    unit: WorkflowDesignerExecutionUnitSchema;
    onUnitResultsChanged: (propertyData: NameResultSchema[]) => void;
    editable?: boolean;
    allowedResults: NameResultSchema[];
}
declare function UnitProperties({ unit, onUnitResultsChanged, editable, allowedResults, }: UnitPropertiesProps): React.JSX.Element;
export default UnitProperties;
//# sourceMappingURL=UnitProperties.d.ts.map