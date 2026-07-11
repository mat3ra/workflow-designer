import type { SubworkflowSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial, Subworkflow as WodeSubworkflow } from "@mat3ra/wode";
import React from "react";
import type { WorkflowDesignerAccount, WorkflowDesignerCluster, WorkflowDesignerCoreUser, WorkflowDesignerCreateMetaPropertyConfig, WorkflowDesignerDialogState, WorkflowDesignerMetaProperty, WorkflowDesignerMetaPropertySchema, WorkflowDesignerProfile, WorkflowDesignerProperty, WorkflowDesignerUser } from "../../types/context";
export type SubworkflowProps = {
    subworkflow: WodeSubworkflow;
    onUpdate: (subworkflow: SubworkflowSchema) => void;
    isStandalone?: boolean;
    editable?: boolean;
    adjustable?: boolean;
    metaProperties?: WorkflowDesignerMetaProperty[];
    onOutputUpdateRequest?: (...args: unknown[]) => void;
    isMethodDataLoading?: boolean;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    currentUser?: WorkflowDesignerCoreUser;
    clusters?: WorkflowDesignerCluster[];
    materials?: OrderedMaterial[];
    materialsIndex?: number;
    onMaterialSwitch?: (...args: unknown[]) => void;
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    createMetaProperty: (property: WorkflowDesignerCreateMetaPropertyConfig) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
    pseudoUploadReduxDialog: WorkflowDesignerDialogState;
    unitTypeReduxDialog: WorkflowDesignerDialogState;
    className?: string;
    jobProperties?: WorkflowDesignerProperty[];
    activeTabIndex: number;
    onActiveTabIndexChange: (tabIndex: number) => void;
};
export declare const TAB_NAVIGATION_CONFIG: {
    readonly overview: {
        readonly itemName: "Overview";
        readonly className: "";
        readonly href: "sw-overview";
    };
    readonly importantSettings: {
        readonly itemName: "Important settings";
        readonly className: "";
        readonly href: "sw-important-settings";
    };
    readonly detailedView: {
        readonly itemName: "Detailed view";
        readonly className: "";
        readonly href: "sw-detailed-view";
    };
    readonly compute: {
        readonly itemName: "Compute";
        readonly className: "";
        readonly href: "sw-compute";
    };
};
export declare function Subworkflow({ subworkflow, onUpdate, isStandalone, editable, adjustable, metaProperties, onOutputUpdateRequest, isMethodDataLoading, accountUsers, accountUsersIsLoading, currentUser, clusters, materials, materialsIndex, onMaterialSwitch, profile, publicAccount, createMetaProperty, pseudoUploadReduxDialog, unitTypeReduxDialog, className, jobProperties, activeTabIndex, onActiveTabIndexChange, }: SubworkflowProps): React.JSX.Element;
//# sourceMappingURL=Subworkflow.d.ts.map