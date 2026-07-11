import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
interface Props {
    selectedValue: string;
    availableUnits: AnySubworkflowUnit[];
    label: string;
    onChange: (value: string) => void;
}
export default function UnitPointerField({ selectedValue, availableUnits, label, onChange, }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=UnitPointerField.d.ts.map