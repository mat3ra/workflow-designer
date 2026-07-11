import type { Template } from "@mat3ra/ade";
import { type OrderedMaterial, type Workflow as WodeWorkflow } from "@mat3ra/wode";
import React from "react";
import type { WorkflowDesignerAccount, WorkflowDesignerCluster, WorkflowDesignerCoreUser, WorkflowDesignerMetaProperty, WorkflowDesignerProfile, WorkflowDesignerUser } from "../../types/context";
import type { WorkflowProps } from "./Workflow";
export type MapUnitInput = {
    values: unknown[] | string;
    useValues?: boolean;
    [key: string]: unknown;
};
/** Serialized map unit config passed to `onUpdate`. */
export type MapUnitSerialized = {
    map: {
        input: MapUnitInput;
    };
    [key: string]: unknown;
};
export type MapUnitModel = {
    flowchartId: string;
    statusCls?: string;
    input: MapUnitInput;
    toJSON: () => MapUnitSerialized;
};
export type MapProps = {
    unit: MapUnitModel;
    workflow: WodeWorkflow;
    /** Passed through from `Workflow` for API parity; not read by this component. */
    parentWorkflow?: WodeWorkflow;
    onUpdate: (config: MapUnitSerialized) => void;
    onWorkflowUpdate: (workflow: WodeWorkflow) => void;
    editable?: boolean;
    adjustable?: boolean;
    materials?: OrderedMaterial[];
    onMaterialSwitch?: (...args: unknown[]) => void;
    onOutputUpdateRequest?: (...args: unknown[]) => void;
    dialogs: WorkflowProps["dialogs"];
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    currentUser: WorkflowDesignerCoreUser;
    clusters: WorkflowDesignerCluster[];
    templates: Template[];
    isLoading?: boolean;
    isDescriptionEditable: boolean;
    metaProperties?: WorkflowDesignerMetaProperty[];
};
declare function MapWorkflowDesigner(props: MapProps): React.JSX.Element;
export default MapWorkflowDesigner;
export { MapWorkflowDesigner };
//# sourceMappingURL=Map.d.ts.map