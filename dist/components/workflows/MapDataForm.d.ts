import React from "react";
/** Aligns with `MapUnitInput` in `Map.tsx` (avoid importing `Map` → circular dependency). */
type MapUnitInput = {
    values: unknown[] | string;
    useValues?: boolean;
    [key: string]: unknown;
};
export type MapDataFormScopeOption = {
    subworkflowName: string;
    unitName: string;
    unitFlowchartId: string;
};
export type MapDataFormProps = {
    mapData: MapUnitInput;
    onUpdate: (mapData: MapUnitInput) => void;
    scopeOptions: MapDataFormScopeOption[];
    className?: string;
};
export default function MapDataForm({ mapData, onUpdate, scopeOptions, className, }: MapDataFormProps): React.JSX.Element;
export {};
//# sourceMappingURL=MapDataForm.d.ts.map