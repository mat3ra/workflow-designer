import type { DropdownAction } from "@mat3ra/cove/dist/mui/components/dropdown";
import type { Template } from "@mat3ra/ade";
import { type MaterialsSet, type OrderedMaterial, Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
import type { WorkflowDesignerAccount, WorkflowDesignerCluster, WorkflowDesignerCreateMetaPropertyConfig, WorkflowDesignerHistory, WorkflowDesignerMetaProperty, WorkflowDesignerMetaPropertySchema, WorkflowDesignerProfile, WorkflowDesignerProperty, WorkflowDesignerUser } from "../../types/context";
import type { SubworkflowDesignerUpdate } from "../../utils/subworkflowDesignerUpdate";
import type { WorkflowProps } from "./Workflow";
export type WorkflowDefaultLayoutProps = {
    entity: WodeWorkflow;
    unitIndex: number;
    isMap?: boolean;
    materials: OrderedMaterial[];
    materialsIndex?: number;
    materialsSet?: MaterialsSet;
    jobHasParent?: boolean;
    editable: boolean;
    adjustable: boolean;
    isLoading: boolean;
    showHeader: boolean;
    isHeaderCompact?: boolean;
    isStandalone: boolean;
    isMethodDataLoading: boolean;
    isSetPublicVisible?: boolean;
    showMetadata: boolean;
    showHistory: boolean;
    /** Persisted workflow revisions (CoreWorkflow / webapp entity); not on wode {@link WodeWorkflow}. */
    workflowHistory: WorkflowDesignerHistory;
    iconCls?: string;
    onNameUpdate?: (name: string) => void;
    onUpdateTags?: (tags: string[]) => void;
    onUnitAdd: (unitType: UnitType, prepend?: boolean, unitIndex?: number) => void;
    onUnitAddSubworkflowFromConfig: (config: unknown, prependOrPasteIndex?: boolean | number, unitIndex?: number) => void;
    onUnitUpdate: (unit: AnyWorkflowUnit) => void;
    onSubworkflowUnitUpdate: (subworkflow: SubworkflowDesignerUpdate) => void;
    onMapWorkflowUpdate: (mapWorkflow: WodeWorkflow) => void;
    onUnitSelect: (unit: {
        flowchartId: string;
    }) => void;
    onUpdateUnitIndex: (index: number) => void;
    handleUnitRemove: (flowchartId?: string) => void;
    /**
     * Renames the active top-level unit (subworkflow branch header). Not the same as
     * {@link onNameUpdate}: that updates the outer workflow entity. This path updates the unit row
     * and, for subworkflow units, the consumer should also align `subworkflowInstances` (see wode
     * `Workflow.syncLinkedSubworkflowNameFromUnit`).
     */
    onUnitNameUpdate: (name: string) => void;
    areWorkflowContentExpanded: boolean;
    toggleExpandWorkflowContent: () => void;
    headerStatusCls: (unit: AnyWorkflowUnit) => string;
    getPagerProps: () => {
        isShown: boolean;
        buttonType: string;
        length: number;
        index: number;
        onUpdateIndex: (index: number) => void;
    };
    getSaveBtnProps: () => {
        isShown: boolean;
        isLoading: boolean;
        onSave: (omitRedirect?: boolean) => void;
    };
    getDropdownProps: () => {
        isShown: boolean;
        className: string;
        actions: DropdownAction[];
        buttonContent: string;
    };
    isDescriptionEditable: boolean;
    onDescriptionUpdate: (descriptionObject: object, description: string) => void;
    dialogs: WorkflowProps["dialogs"];
    metaProperties: WorkflowDesignerMetaProperty[];
    onMaterialSwitch?: (...args: unknown[]) => void;
    onOutputUpdateRequest?: (...args: unknown[]) => void;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    clusters: WorkflowDesignerCluster[];
    templates: Template[];
    createMetaProperty: (property: WorkflowDesignerCreateMetaPropertyConfig) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
    jobProperties?: WorkflowDesignerProperty[];
    /** Subworkflow inner tabs (Overview, Important settings, …); owned by {@link Workflow} so remounts of {@link Subworkflow} do not reset them. */
    subworkflowActiveTabIndexById: Record<string, number>;
    onSubworkflowActiveTabIndexChange: (subworkflowId: string, tabIndex: number) => void;
};
export declare function WorkflowDefaultLayout(props: WorkflowDefaultLayoutProps): React.JSX.Element;
//# sourceMappingURL=WorkflowDefaultLayout.d.ts.map