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
    /**
     * Drops this subworkflow's own Compute tab. Set it when the host already
     * shows a compute surface of its own — the job designer does, and two places
     * called "Compute" on one screen leave the reader guessing which one the job
     * will actually run with.
     */
    hideComputeSubTab?: boolean;
    /**
     * Clicking a unit in the flowchart opens its settings in a side drawer,
     * instead of the reader leaving for the Settings tab and finding that unit
     * among all the others.
     *
     * Opt-in per host: the tabs stay exactly as they are, so a host with tests or
     * documentation against them is unaffected until it flips this.
     */
    useUnitInspector?: boolean;
};
export declare const TAB_NAVIGATION_CONFIG: {
    readonly overview: {
        readonly itemName: "Units";
        readonly className: "";
        readonly href: "sw-overview";
    };
    readonly importantSettings: {
        readonly itemName: "Settings";
        readonly className: "";
        readonly href: "sw-important-settings";
    };
    readonly detailedView: {
        readonly itemName: "Outputs";
        readonly className: "";
        readonly href: "sw-detailed-view";
    };
    readonly compute: {
        readonly itemName: "Compute";
        readonly className: "";
        readonly href: "sw-compute";
    };
};
export declare function Subworkflow({ subworkflow, onUpdate, isStandalone, editable, adjustable, metaProperties, onOutputUpdateRequest, isMethodDataLoading, accountUsers, accountUsersIsLoading, currentUser, clusters, materials, materialsIndex, onMaterialSwitch, profile, publicAccount, createMetaProperty, pseudoUploadReduxDialog, unitTypeReduxDialog, className, jobProperties, activeTabIndex, onActiveTabIndexChange, useUnitInspector, hideComputeSubTab, }: SubworkflowProps): React.JSX.Element;
//# sourceMappingURL=Subworkflow.d.ts.map