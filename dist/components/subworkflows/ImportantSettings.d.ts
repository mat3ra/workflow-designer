import { type ExecutionUnit, type Subworkflow } from "@mat3ra/wode";
import React from "react";
interface ImportantSettingsProps {
    subworkflow: Subworkflow;
    role?: string;
    className?: string;
    id?: string;
    onContextChanged: () => void;
}
interface ImportantSettingsForUnitProps {
    unit: ExecutionUnit;
    unitIndex: number;
    onContextChanged: () => void;
}
export declare function ImportantSettingsForUnit({ unit, unitIndex, onContextChanged, }: ImportantSettingsForUnitProps): React.JSX.Element;
export declare function ImportantSettings({ subworkflow, role, className, id, onContextChanged, }: ImportantSettingsProps): React.JSX.Element;
export {};
//# sourceMappingURL=ImportantSettings.d.ts.map