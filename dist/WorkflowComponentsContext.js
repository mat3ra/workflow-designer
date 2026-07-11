import React from "react";
const defaultNoop = () => null;
const defaultNoopFn = () => ({});
const defaultComponents = {
    EntityHeaderComponent: defaultNoop,
    EntityNameComponent: defaultNoop,
    MetadataComponent: defaultNoop,
    HistoryComponent: defaultNoop,
    SubworkflowFormTitleComponent: defaultNoop,
    PseudoFormComponent: defaultNoop,
    DataGridComponent: defaultNoop,
    getDefaultComputeConfig: defaultNoopFn,
    generateEntityId: () => crypto.randomUUID(),
};
export const WorkflowComponentsContext = React.createContext(defaultComponents);
export function useWorkflowComponents() {
    return React.useContext(WorkflowComponentsContext);
}
