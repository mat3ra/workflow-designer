import type { DropdownAction } from "@exabyte-io/cove.js/dist/mui/components/dropdown";
import type { Template } from "@mat3ra/ade";
import { type OrderedMaterial, Workflow } from "@mat3ra/wode";
import React from "react";
import type { SaveWorkflowFromDesigner } from "./utils/persistWorkflowDesigner";
import type { WorkflowDesignerAccount, WorkflowDesignerCluster, WorkflowDesignerDialogState, WorkflowDesignerHistory, WorkflowDesignerMetaProperty, WorkflowDesignerProfile, WorkflowDesignerUser } from "./types/context";
type WorkflowDesignerContainerBaseProps = {
    initialWorkflow: Workflow;
    defaultMaterial: OrderedMaterial;
    metaProperties?: WorkflowDesignerMetaProperty[];
    editable: boolean;
    showHistory: boolean;
    /** From CoreWorkflow / webapp entity at the shell boundary. */
    workflowHistory: WorkflowDesignerHistory;
    isStandalone: boolean;
    adjustable: boolean;
    showHeader: boolean;
    showMetadata: boolean;
    extraActions?: DropdownAction[];
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    clusters: WorkflowDesignerCluster[];
    dialogs: {
        pseudoUploadReduxDialog: WorkflowDesignerDialogState;
        unitTypeReduxDialog: WorkflowDesignerDialogState;
    };
    templates: Template[];
    /** Save in flight; owned by the page / shell that wraps persistence. */
    isLoading: boolean;
    saveWorkflow: SaveWorkflowFromDesigner;
    /** From shell/bank: precomputed with persisted core workflow + profile. */
    isDescriptionEditable: boolean;
    EntityHeaderComponent: React.ComponentType<Record<string, unknown>>;
    EntityNameComponent: React.ComponentType<Record<string, unknown>>;
    MetadataComponent: React.ComponentType<Record<string, unknown>>;
    HistoryComponent?: React.ComponentType<{
        items: Array<Record<string, unknown>>;
    }>;
    SubworkflowFormTitleComponent: React.ComponentType<{
        title: string;
    }>;
    PseudoFormComponent: React.ComponentType<Record<string, unknown>>;
    DataGridComponent: React.ComponentType<Record<string, unknown>>;
    getDefaultComputeConfig: (cluster?: unknown) => Record<string, unknown>;
    generateEntityId: () => string;
    openDocumentationDialog?: (searchText: string) => void;
};
export type WorkflowDesignerContainerProps = WorkflowDesignerContainerBaseProps;
export default function WorkflowDesignerContainer(containerProps: WorkflowDesignerContainerProps): React.JSX.Element;
export {};
//# sourceMappingURL=WorkflowDesignerContainer.d.ts.map