import { jsx as _jsx } from "react/jsx-runtime";
import { MethodData } from "@mat3ra/move";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
export function SubworkflowMethodPanel({ subworkflow, editable, adjustable, isMethodDataLoading, isStandalone, materials, profile, onUpdate, pseudoUploadReduxDialog, metaProperties, createMetaProperty, }) {
    const { PseudoFormComponent } = useWorkflowComponents();
    if (!(!subworkflow.modelInstance.isUnknown || editable)) {
        return null;
    }
    if (subworkflow.modelInstance.Method.type === "pseudopotential") {
        return (_jsx(PseudoFormComponent, { isStandalone: isStandalone, adjustable: adjustable, isLoading: isMethodDataLoading, subworkflow: subworkflow, materials: materials, onUpdate: onUpdate, pseudoUploadReduxDialog: pseudoUploadReduxDialog, metaProperties: metaProperties, createMetaProperty: createMetaProperty }));
    }
    return (_jsx(MethodData, { isStandalone: isStandalone, editable: editable, adjustable: adjustable, isLoading: isMethodDataLoading, subworkflow: subworkflow, materials: materials, profile: profile, onUpdate: onUpdate, pseudoUploadReduxDialog: pseudoUploadReduxDialog, metaProperties: metaProperties, createMetaProperty: createMetaProperty }));
}
