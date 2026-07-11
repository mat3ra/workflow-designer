import { type Subworkflow } from "@mat3ra/wode";
import React from "react";
interface ImportantSettingsProps {
    subworkflow: Subworkflow;
    role?: string;
    className?: string;
    id?: string;
    onContextChanged: () => void;
}
export declare function ImportantSettings({ subworkflow, role, className, id, onContextChanged, }: ImportantSettingsProps): React.JSX.Element;
export {};
//# sourceMappingURL=ImportantSettings.d.ts.map