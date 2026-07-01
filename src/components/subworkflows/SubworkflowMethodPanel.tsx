import type { Material } from "@mat3ra/made";
import type { Subworkflow as WodeSubworkflow } from "@mat3ra/wode";
import React from "react";

import type {
    WorkflowDesignerCreateMetaPropertyConfig,
    WorkflowDesignerDialogState,
    WorkflowDesignerMetaProperty,
    WorkflowDesignerMetaPropertySchema,
    WorkflowDesignerProfile,
} from "../../types/context";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { MethodData } from "@mat3ra/move";

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
    createMetaProperty: (
        property: WorkflowDesignerCreateMetaPropertyConfig,
    ) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
};

export function SubworkflowMethodPanel({
    subworkflow,
    editable,
    adjustable,
    isMethodDataLoading,
    isStandalone,
    materials,
    profile,
    onUpdate,
    pseudoUploadReduxDialog,
    metaProperties,
    createMetaProperty,
}: SubworkflowMethodPanelProps) {
    const { PseudoFormComponent } = useWorkflowComponents();
    if (!(!subworkflow.modelInstance.isUnknown || editable)) {
        return null;
    }

    if (subworkflow.modelInstance.Method.type === "pseudopotential") {
        return (
            <PseudoFormComponent
                isStandalone={isStandalone}
                adjustable={adjustable}
                isLoading={isMethodDataLoading}
                subworkflow={subworkflow}
                materials={materials}
                onUpdate={onUpdate}
                pseudoUploadReduxDialog={pseudoUploadReduxDialog}
                metaProperties={metaProperties}
                createMetaProperty={createMetaProperty}
            />
        );
    }

    return (
        <MethodData
            isStandalone={isStandalone}
            editable={editable}
            adjustable={adjustable}
            isLoading={isMethodDataLoading}
            subworkflow={subworkflow}
            materials={materials}
            profile={profile}
            onUpdate={onUpdate}
            pseudoUploadReduxDialog={pseudoUploadReduxDialog}
            metaProperties={metaProperties}
            createMetaProperty={createMetaProperty}
        />
    );
}
