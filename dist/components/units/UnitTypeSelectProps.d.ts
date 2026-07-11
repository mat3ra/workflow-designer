import type { DefaultSubworkflowUnitType } from "@mat3ra/wode";
export interface UnitTypeSelectProps {
    id?: string;
    title?: string;
    onClose: () => void;
    onSelect: (unitType: DefaultSubworkflowUnitType, prepend: boolean) => void;
    unitTypes: DefaultSubworkflowUnitType[];
}
//# sourceMappingURL=UnitTypeSelectProps.d.ts.map