/* eslint-disable react/jsx-props-no-spreading */
import {
    type ErrorUnit,
    type Subworkflow as WodeSubworkflow,
    Workflow as WodeWorkflow,
} from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import { ErrorUnitContent } from "@mat3ra/wove";
import Box from "@mui/material/Box";
import React from "react";

import { Subworkflow } from "../subworkflows/Subworkflow";
import SubworkflowHeader from "../subworkflows/SubworkflowHeader";
import type { WorkflowDefaultLayoutProps } from "./WorkflowDefaultLayout";
import { WorkflowValidationAlert } from "./WorkflowValidationAlert";

// TODO: avoid cycle dependencies (Map imports Workflow)
const MapWorkflowDesigner = React.lazy(() =>
    import("./Map").then((module) => ({ default: module.MapWorkflowDesigner })),
) as unknown as React.FC<any>;

export interface WorkflowUnitPanelProps extends WorkflowDefaultLayoutProps {
    unit: NonNullable<WodeWorkflow["unitInstances"][number]>;
    subworkflow?: WodeSubworkflow;
    mapWorkflow?: WodeWorkflow;
    /** Passed to {@link SubworkflowHeader}; false where the shell already names the step. */
    showStepIdentity?: boolean;
}

/**
 * The editing surface for the selected step: its header, then the subworkflow tabs, the map
 * designer, or the error detail.
 *
 * Shared by both layout variants so the classic and studio shells cannot drift on what editing
 * a step means — they differ only in what sits beside this panel.
 */
export function WorkflowUnitPanel(props: WorkflowUnitPanelProps) {
    const {
        unit,
        subworkflow,
        mapWorkflow,
        showStepIdentity,
        entity,
        unitIndex,
        materials,
        materialsIndex,
        materialsSet,
        jobHasParent = false,
        editable,
        adjustable,
        isStandalone,
        isMethodDataLoading,
        iconCls,
        onUnitAdd,
        onUnitAddSubworkflowFromConfig,
        onUnitUpdate,
        onSubworkflowUnitUpdate,
        onMapWorkflowUpdate,
        onUpdateUnitIndex,
        handleUnitRemove,
        onUnitNameUpdate,
        areWorkflowContentExpanded,
        toggleExpandWorkflowContent,
        headerStatusCls,
        isDescriptionEditable,
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

    const { pseudoUploadReduxDialog, unitTypeReduxDialog } = dialogs;

    return (
        <>
            <WorkflowValidationAlert workflow={entity} />
            {unit.type === UnitType.subworkflow && (
                <>
                    <SubworkflowHeader
                        unit={unit}
                        adjustable={Boolean(adjustable)}
                        editable={Boolean(editable)}
                        subworkflow={subworkflow}
                        onUnitRemove={handleUnitRemove}
                        headerStatusCls={headerStatusCls}
                        onUnitNameUpdate={onUnitNameUpdate}
                        unitIndex={unitIndex}
                        onUnitAdd={onUnitAdd}
                        onUnitAddSubworkflowFromConfig={onUnitAddSubworkflowFromConfig}
                        onUpdateUnitIndex={onUpdateUnitIndex}
                        onSubworkflowUnitUpdate={onSubworkflowUnitUpdate}
                        areWorkflowContentExpanded={areWorkflowContentExpanded}
                        toggleExpandWorkflowContent={toggleExpandWorkflowContent}
                        workflow={entity}
                        materials={materials}
                        materialsIndex={materialsIndex}
                        materialsSet={materialsSet}
                        jobHasParent={jobHasParent}
                        showStepIdentity={showStepIdentity}
                    />
                    {/*
                        key={subworkflow.id} remounts when the user picks another flowchart branch.
                        Inner tab index is held on {@link Workflow} (not Subworkflow) so job.render()
                        remounts do not reset Important settings, while leaving the job Workflow tab
                        unmounts Workflow and returns to Overview on the next visit.
                    */}
                    {subworkflow ? (
                        <Subworkflow
                            key={subworkflow.id}
                            className="card-body"
                            subworkflow={subworkflow}
                            activeTabIndex={subworkflowActiveTabIndexById[subworkflow.id] ?? 0}
                            onActiveTabIndexChange={(tabIndex) =>
                                onSubworkflowActiveTabIndexChange(subworkflow.id, tabIndex)
                            }
                            onUpdate={onSubworkflowUnitUpdate}
                            isStandalone={isStandalone}
                            isMethodDataLoading={isMethodDataLoading}
                            editable={Boolean(editable)}
                            adjustable={Boolean(adjustable)}
                            onMaterialSwitch={onMaterialSwitch}
                            materials={materials}
                            materialsIndex={materialsIndex}
                            metaProperties={metaProperties}
                            onOutputUpdateRequest={onOutputUpdateRequest}
                            accountUsers={accountUsers}
                            accountUsersIsLoading={accountUsersIsLoading}
                            currentUser={profile.user.entity}
                            clusters={clusters}
                            pseudoUploadReduxDialog={pseudoUploadReduxDialog}
                            unitTypeReduxDialog={unitTypeReduxDialog}
                            profile={profile}
                            publicAccount={publicAccount}
                            createMetaProperty={createMetaProperty}
                            jobProperties={jobProperties}
                        />
                    ) : null}
                </>
            )}
            {unit.type === UnitType.map && (
                <React.Suspense fallback={null}>
                    <MapWorkflowDesigner
                        className="card-body"
                        unit={unit}
                        workflow={mapWorkflow}
                        onUpdate={onUnitUpdate}
                        onWorkflowUpdate={onMapWorkflowUpdate}
                        editable={Boolean(editable)}
                        adjustable={Boolean(adjustable)}
                        onMaterialSwitch={onMaterialSwitch}
                        materials={materials}
                        materialsIndex={materialsIndex}
                        iconCls={iconCls}
                        onOutputUpdateRequest={onOutputUpdateRequest}
                        parentWorkflow={entity}
                        accountUsers={accountUsers}
                        accountUsersIsLoading={accountUsersIsLoading}
                        currentUser={profile.user.entity}
                        publicAccount={publicAccount}
                        profile={profile}
                        clusters={clusters}
                        dialogs={dialogs}
                        templates={templates}
                        isDescriptionEditable={isDescriptionEditable}
                        metaProperties={metaProperties}
                    />
                </React.Suspense>
            )}
            {unit.type === UnitType.error && (
                <Box className="card-body" sx={{ p: 2 }}>
                    <ErrorUnitContent unit={unit as ErrorUnit} />
                </Box>
            )}
        </>
    );
}

export default WorkflowUnitPanel;
