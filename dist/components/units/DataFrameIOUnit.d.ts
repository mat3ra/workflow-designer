import type { DataIOUnitSchema } from "@mat3ra/esse/dist/js/types";
import type { Material } from "@mat3ra/made";
import type IOUnit from "@mat3ra/wode/dist/js/units/IOUnit";
import React from "react";
export type DataFrameIOUnitProps = {
    /** Runtime IO unit with DataFrame helpers (wode typings are incomplete). */
    unit: IOUnit;
    editable?: boolean;
    adjustable?: boolean;
    onUpdate: (unit: DataIOUnitSchema) => void;
    materials: Material[];
};
export declare function DataFrameIOUnit({ unit: unitPropUntyped, editable, adjustable, onUpdate, materials, }: DataFrameIOUnitProps): React.JSX.Element;
//# sourceMappingURL=DataFrameIOUnit.d.ts.map