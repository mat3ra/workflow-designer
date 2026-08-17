/* eslint-disable react/jsx-props-no-spreading */
import { ENTITY_ICONS } from "@mat3ra/cove/dist/mui/components/icon/entityIcons";
import { type Subworkflow as WodeSubworkflow, type Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import get from "lodash/get";
import React, { useState } from "react";

import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import StepLibrary from "../units/StepLibrary";
import type { WorkflowDefaultLayoutProps } from "./WorkflowDefaultLayout";
import { getWorkflowSteps } from "./workflowSteps";
import WorkflowStepsRail from "./WorkflowStepsRail";
import { WorkflowUnitPanel } from "./WorkflowUnitPanel";

const RAIL_WIDTH = 232;

/**
 * The studio shell: a steps rail beside the step being edited.
 *
 * The classic layout gives four twelfths of the screen to a second flowchart of the same steps
 * the right-hand panel is already showing — so a three-step workflow needs a wide screen to be
 * legible, and the same name appears three times. Here the rail states what each step is and
 * hands the rest of the width to the work.
 *
 * Opt-in via `layoutVariant="studio"`; every container callback is the classic layout's.
 */
export function WorkflowStudioLayout(props: WorkflowDefaultLayoutProps) {
    const {
        entity,
        unitIndex,
        isMap,
        editable,
        isLoading,
        showHeader,
        isHeaderCompact,
        isSetPublicVisible,
        showMetadata,
        showHistory,
        workflowHistory,
        iconCls,
        onNameUpdate,
        onUpdateTags,
        onUnitAddSubworkflowFromConfig,
        onUpdateUnitIndex,
        handleUnitRemove,
        onUnitNameUpdate,
        getPagerProps,
        getSaveBtnProps,
        getDropdownProps,
        isDescriptionEditable,
        onDescriptionUpdate,
        publicAccount,
    } = props;

    const { EntityHeaderComponent, MetadataComponent, HistoryComponent } = useWorkflowComponents();
    const [stepLibraryOpen, setStepLibraryOpen] = useState(false);
    // Not memoized on `entity`: wode mutates the workflow in place, so its identity is stable
    // across a rename and a memo would keep serving the old names. The map is a handful of units.
    const steps = getWorkflowSteps(entity);

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

    return (
        <Box className="workflow-with-name-and-metadata workflow-studio-layout">
            {showHeader && (
                <EntityHeaderComponent
                    isCompact={isHeaderCompact}
                    icon={ENTITY_ICONS.workflow}
                    name={String(entity.name ?? "")}
                    subtitle={{ applications: entity.usedApplicationNames.join(", ") }}
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

            <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 0 }}>
                {/* A map step takes the whole area: its own designer already frames its steps. */}
                {!isMap && (
                    <Box
                        sx={{
                            flex: `0 0 ${RAIL_WIDTH}px`,
                            borderRight: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "background.default",
                        }}
                    >
                        <WorkflowStepsRail
                            steps={steps}
                            activeIndex={unitIndex}
                            editable={Boolean(editable)}
                            onSelect={onUpdateUnitIndex}
                            onRename={onUnitNameUpdate}
                            onRemove={handleUnitRemove}
                            onAddStep={() => setStepLibraryOpen(true)}
                        />
                    </Box>
                )}

                <Box
                    className="workflow-subworkflow-container"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        minWidth: 0,
                        backgroundColor: "background.paper",
                    }}
                >
                    <WorkflowUnitPanel
                        {...props}
                        unit={unit}
                        subworkflow={subworkflow}
                        mapWorkflow={mapWorkflow}
                    />
                </Box>
            </Box>

            {stepLibraryOpen ? (
                <StepLibrary
                    onClose={() => setStepLibraryOpen(false)}
                    onSubmit={(config, prependOrPasteIndex) => {
                        onUnitAddSubworkflowFromConfig(config, prependOrPasteIndex, unitIndex);
                        setStepLibraryOpen(false);
                    }}
                />
            ) : null}

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
        </Box>
    );
}

export default WorkflowStudioLayout;
