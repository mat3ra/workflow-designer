/* eslint-disable react/jsx-props-no-spreading */
import type { Template } from "@mat3ra/ade";
import type { DropdownAction } from "@mat3ra/cove/dist/mui/components/dropdown";
import { ENTITY_ICONS } from "@mat3ra/cove/dist/mui/components/icon/entityIcons";
import ThemeProvider from "@mat3ra/cove/dist/theme/provider";
import oldLightMaterialUITheme from "@mat3ra/cove/dist/theme/theme";
import {
    type ErrorUnit,
    type MaterialsSet,
    type OrderedMaterial,
    Subworkflow as WodeSubworkflow,
    Workflow as WodeWorkflow,
} from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import { ErrorUnitContent, WorkflowUnitsFlowchart } from "@mat3ra/wove";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import get from "lodash/get";
import React from "react";

import type {
    WorkflowDesignerAccount,
    WorkflowDesignerCluster,
    WorkflowDesignerCreateMetaPropertyConfig,
    WorkflowDesignerHistory,
    WorkflowDesignerMetaProperty,
    WorkflowDesignerMetaPropertySchema,
    WorkflowDesignerProfile,
    WorkflowDesignerProperty,
    WorkflowDesignerUser,
} from "../../types/context";
import type { SubworkflowDesignerUpdate } from "../../utils/subworkflowDesignerUpdate";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { Subworkflow } from "../subworkflows/Subworkflow";
import SubworkflowHeader from "../subworkflows/SubworkflowHeader";
import type { WorkflowProps } from "./Workflow";
import { WorkflowUnitPanel } from "./WorkflowUnitPanel";

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
    onUnitAddSubworkflowFromConfig: (
        config: unknown,
        prependOrPasteIndex?: boolean | number,
        unitIndex?: number,
    ) => void;
    onUnitUpdate: (unit: AnyWorkflowUnit) => void;
    onSubworkflowUnitUpdate: (subworkflow: SubworkflowDesignerUpdate) => void;
    onMapWorkflowUpdate: (mapWorkflow: WodeWorkflow) => void;
    onUnitSelect: (unit: { flowchartId: string }) => void;
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
    createMetaProperty: (
        property: WorkflowDesignerCreateMetaPropertyConfig,
    ) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
    jobProperties?: WorkflowDesignerProperty[];
    /** Subworkflow inner tabs (Overview, Important settings, …); owned by {@link Workflow} so remounts of {@link Subworkflow} do not reset them. */
    subworkflowActiveTabIndexById: Record<string, number>;
    onSubworkflowActiveTabIndexChange: (subworkflowId: string, tabIndex: number) => void;
};

export function WorkflowDefaultLayout(props: WorkflowDefaultLayoutProps) {
    const {
        entity,
        unitIndex,
        isMap,
        materials,
        materialsIndex,
        materialsSet,
        jobHasParent = false,
        editable,
        adjustable,
        isLoading,
        showHeader,
        isHeaderCompact,
        isStandalone,
        isMethodDataLoading,
        isSetPublicVisible,
        showMetadata,
        showHistory,
        workflowHistory,
        iconCls,
        onNameUpdate,
        onUpdateTags,
        onUnitAdd,
        onUnitAddSubworkflowFromConfig,
        onUnitUpdate,
        onSubworkflowUnitUpdate,
        onMapWorkflowUpdate,
        onUnitSelect,
        onUpdateUnitIndex,
        handleUnitRemove,
        onUnitNameUpdate,
        areWorkflowContentExpanded,
        toggleExpandWorkflowContent,
        headerStatusCls,
        getPagerProps,
        getSaveBtnProps,
        getDropdownProps,
        isDescriptionEditable,
        onDescriptionUpdate,
        dialogs,
        metaProperties,
        onMaterialSwitch,
        onOutputUpdateRequest,
        accountUsers,
        accountUsersIsLoading,
        profile,
        publicAccount,
        clusters,
        templates,
        createMetaProperty,
        jobProperties,
        subworkflowActiveTabIndexById,
        onSubworkflowActiveTabIndexChange,
    } = props;

    const { EntityHeaderComponent, MetadataComponent, HistoryComponent } = useWorkflowComponents();

    const unit = entity.unitInstances[unitIndex];

    if (!unit) {
        console.error("Unit not found");
        return <div>Unit not found</div>;
    }

    let subworkflow: WodeSubworkflow | undefined;
    let mapWorkflow: WodeWorkflow | undefined;

    if (unit.type === UnitType.subworkflow) {
        subworkflow = entity.subworkflowInstances.find((s) => s.id === unit.id);
    }

    if (unit.type === UnitType.map) {
        mapWorkflow = entity.workflowInstances.find((w) => w.id === unit.workflowId);
    }

    // `xs` matters as much as the rest: a Grid item with no breakpoint at or below the current
    // one falls back to auto sizing, so under `md` (900px) the panels stopped filling the row and
    // shrank to their content — the tabs ended up in a ~470px column beside empty space.
    const leftColumnGridProps = isMap ? { xs: 12, lg: true } : { xs: 12, lg: 4 };
    const rightColumnGridProps = isMap ? { xs: 12, lg: true } : { xs: 12, lg: 8 };

    const { pseudoUploadReduxDialog, unitTypeReduxDialog } = dialogs;

    return (
        <ThemeProvider theme={oldLightMaterialUITheme}>
            <div className="workflow-with-name-and-metadata">
                {showHeader && (
                    <EntityHeaderComponent
                        isCompact={isHeaderCompact}
                        icon={ENTITY_ICONS.workflow}
                        name={String(entity.name ?? "")}
                        subtitle={{
                            applications: entity.usedApplicationNames.join(", "),
                        }}
                        description={get(entity, "description") as string | undefined}
                        isLoading={isLoading}
                        editable={Boolean(editable)}
                        onNameUpdate={onNameUpdate}
                        iconCls={iconCls}
                        id="workflow-designer-header"
                        pagerProps={getPagerProps()}
                        saveBtnProps={getSaveBtnProps()}
                        dropdownProps={getDropdownProps()}
                        descriptionEditorTitle="Workflow Description"
                        item={entity}
                        isDescriptionEditable={isDescriptionEditable}
                        onDescriptionUpdate={onDescriptionUpdate}
                    />
                )}

                <Grid container sx={{ backgroundColor: "background.paper" }}>
                    <Grid
                        {...leftColumnGridProps}
                        item
                        sx={{
                            borderRight: "1px solid #cecece",
                            backgroundColor: "background.default",
                        }}
                    >
                        <Box className="workflow-flowchart-container" sx={{ height: "100%", p: 2 }}>
                            <WorkflowUnitsFlowchart
                                editable={Boolean(editable)}
                                onUnitRemove={handleUnitRemove}
                                onSubworkflowUnitUpdate={onSubworkflowUnitUpdate}
                                workflow={entity}
                                activeUnit={unit}
                                onClick={onUnitSelect}
                                isCardContentExpanded={areWorkflowContentExpanded}
                                headerStatusCls={headerStatusCls}
                            />
                        </Box>
                    </Grid>
                    <Grid
                        className="workflow-subworkflow-container"
                        item
                        sx={{ display: "flex", flexDirection: "column" }}
                        {...rightColumnGridProps}
                    >
                        <WorkflowUnitPanel
                            {...props}
                            unit={unit}
                            subworkflow={subworkflow}
                            mapWorkflow={mapWorkflow}
                        />
                    </Grid>
                </Grid>
                <Divider />
                {showMetadata && (
                    <MetadataComponent
                        tags={get(entity, "tags", []) as string[]}
                        editable={Boolean(editable)}
                        isSetPublicVisible={isSetPublicVisible}
                        onUpdateTags={onUpdateTags}
                        publicAccount={publicAccount.entity}
                    />
                )}
                <Divider />
                {showHistory && <HistoryComponent items={workflowHistory as any} />}
            </div>
        </ThemeProvider>
    );
}
