import type { DropdownAction } from "@mat3ra/cove/dist/mui/components/dropdown";
import type { Template } from "@mat3ra/ade";
import { type MaterialsSet, type OrderedMaterial, Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
import type { WorkflowDesignerAccount, WorkflowDesignerCluster, WorkflowDesignerCreateMetaPropertyConfig, WorkflowDesignerDialogs, WorkflowDesignerHistory, WorkflowDesignerMetaProperty, WorkflowDesignerMetaPropertySchema, WorkflowDesignerProfile, WorkflowDesignerProperty, WorkflowDesignerUser } from "../../types/context";
import type { SubworkflowDesignerUpdate } from "../../utils/subworkflowDesignerUpdate";
type WorkflowDialogs = WorkflowDesignerDialogs;
export type WorkflowProps = {
    workflow: WodeWorkflow;
    metaProperties?: WorkflowDesignerMetaProperty[];
    onUpdate?: (workflow: WodeWorkflow) => void;
    onOutputUpdateRequest?: (...args: unknown[]) => void;
    onUpdateTags?: (tags: string[]) => void;
    extraActions?: DropdownAction[];
    onSave?: (omitRedirect: boolean) => void;
    onNameUpdate?: (name: string) => void;
    iconCls?: string;
    onUnitAdd?: (unitType: UnitType, prepend?: boolean, unitIndex?: number) => void;
    onUnitAddSubworkflowFromConfig?: (config: unknown, prependOrPasteIndex?: boolean | number, unitIndex?: number) => void;
    onUnitRemove?: (flowchartId?: string) => void;
    onUnitUpdate?: (unit: AnyWorkflowUnit) => void;
    onSubworkflowUnitUpdate?: (subworkflow: SubworkflowDesignerUpdate) => void;
    materials?: OrderedMaterial[];
    materialsIndex?: number;
    /** Mirrors `jobHasParent` passed to wode `Workflow.render` in the designer container. */
    jobHasParent?: boolean;
    onMaterialSwitch?: (...args: unknown[]) => void;
    showHeaderPager?: boolean;
    onHeaderPagerUpdate?: (index: number) => void;
    dialogs: WorkflowDialogs;
    /** Wired in job designer; workflow-only pages may omit. */
    createMetaProperty?: (property: WorkflowDesignerCreateMetaPropertyConfig) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    clusters?: WorkflowDesignerCluster[];
    templates: Template[];
    isStandalone?: boolean;
    isHeaderCompact?: boolean;
    editable?: boolean;
    adjustable?: boolean;
    isLoading?: boolean;
    showHeader?: boolean;
    isMethodDataLoading?: boolean;
    materialsSet?: MaterialsSet;
    isMap?: boolean;
    isSetPublicVisible?: boolean;
    showMetadata?: boolean;
    showHistory?: boolean;
    /** Persisted revisions for the Revisions strip; from CoreWorkflow (or [] when not applicable). */
    workflowHistory?: WorkflowDesignerHistory;
    onIsMultiMaterialChanged?: (isMultiMaterial: boolean) => void;
    /**
     * Job designer: `onJobRender` from `Job.js`. Workflow designer: `renderWorkflow` from
     * `WorkflowDesignerContainer`. Must not call `workflow.render` inside wove children.
     */
    onRender: () => void;
    /** When true, layout must not call `workflow.render` directly (job designer only). */
    renderAtJobLevel?: boolean;
    /** Workflow designer root bumps this after `workflow.render()`; job designer uses local state. */
    workflowRenderGeneration?: number;
    /** Final permission for the description editor; computed only by parents (shell, bank, map, job, …). */
    isDescriptionEditable: boolean;
    /** Refined job properties for unit modals in job designer; optional elsewhere. */
    jobProperties?: WorkflowDesignerProperty[];
};
export declare function Workflow({ workflow, metaProperties, onUpdate, onOutputUpdateRequest, onUpdateTags, extraActions, onSave, onNameUpdate, iconCls, onUnitAdd, onUnitAddSubworkflowFromConfig, onUnitRemove, onUnitUpdate, onSubworkflowUnitUpdate, materials, materialsIndex, jobHasParent, onMaterialSwitch, showHeaderPager, onHeaderPagerUpdate, dialogs, createMetaProperty, accountUsers, accountUsersIsLoading, profile, publicAccount, clusters, templates, isStandalone, isHeaderCompact, editable, adjustable, isLoading, showHeader, isMethodDataLoading, materialsSet, isMap, isSetPublicVisible, showMetadata, showHistory, workflowHistory, onIsMultiMaterialChanged, onRender, renderAtJobLevel, workflowRenderGeneration, isDescriptionEditable, jobProperties, }: WorkflowProps): React.JSX.Element;
export {};
//# sourceMappingURL=Workflow.d.ts.map