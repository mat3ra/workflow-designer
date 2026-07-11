import type { AnySubworkflowUnit, AnySubworkflowUnitSchema } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
type BaseUnitProps = {
    unit: AnySubworkflowUnit;
    units: AnySubworkflowUnit[];
    onUpdate: (unit: AnySubworkflowUnitSchema) => void;
    editable?: boolean;
};
export declare function BaseUnit(props: BaseUnitProps): React.JSX.Element;
export {};
//# sourceMappingURL=BaseUnit.d.ts.map