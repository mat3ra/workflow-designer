import type { Material } from "@mat3ra/made";
import type { Subworkflow as WodeSubworkflow } from "@mat3ra/wode";
import React from "react";
import type { WorkflowDesignerCreateMetaPropertyConfig, WorkflowDesignerDialogState, WorkflowDesignerMetaProperty, WorkflowDesignerMetaPropertySchema, WorkflowDesignerProfile } from "../../types/context";
export type SubworkflowMethodPanelProps = {
    subworkflow: WodeSubworkflow;
    editable: boolean;
    adjustable: boolean;
    isMethodDataLoading: boolean;
    isStandalone?: boolean;
    materials: Material[];
    profile: WorkflowDesignerProfile;
    onUpdate: (subworkflow: WodeSubworkflow) => void;
    pseudoUploadReduxDialog: WorkflowDesignerDialogState;
    metaProperties: WorkflowDesignerMetaProperty[];
    createMetaProperty: (property: WorkflowDesignerCreateMetaPropertyConfig) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
};
export declare function SubworkflowMethodPanel({ subworkflow, editable, adjustable, isMethodDataLoading, isStandalone, materials, profile, onUpdate, pseudoUploadReduxDialog, metaProperties, createMetaProperty, }: SubworkflowMethodPanelProps): React.JSX.Element;
//# sourceMappingURL=SubworkflowMethodPanel.d.ts.map