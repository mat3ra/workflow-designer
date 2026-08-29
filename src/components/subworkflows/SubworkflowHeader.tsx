import Dropdown from "@mat3ra/cove/dist/mui/components/dropdown";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import {
    type DefaultSubworkflowUnitType,
    type MaterialsSet,
    type OrderedMaterial,
    type Subworkflow as WodeSubworkflow,
    type Workflow as WodeWorkflow,
    Subworkflow,
} from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import type { WorkflowRenderContext } from "@mat3ra/wode/dist/js/Workflow";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import React, { useCallback, useMemo, useState } from "react";

import type { SubworkflowDesignerUpdate } from "../../utils/subworkflowDesignerUpdate";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import StepLibrary from "../units/StepLibrary";
import UnitTypeSelect from "../units/UnitTypeSelect";
import Convergence from "../workflows/Convergence";

type SubworkflowExternalContextForConvergence = WorkflowRenderContext & {
    workflowHasRelaxation: boolean;
};

/**
 * What the step computes with — engine, theory level, method — which the header had room for
 * only once it stopped repeating the step's name.
 */
function summarizeMethod(subworkflow?: WodeSubworkflow): string[] {
    const model = (subworkflow as unknown as { model?: Record<string, any> })?.model;
    const method = model?.method;
    return [
        subworkflow?.application?.name,
        [model?.type, model?.subtype, model?.functional].filter(Boolean).join("/").toUpperCase(),
        [method?.type, method?.subtype].filter(Boolean).join("/"),
    ].filter((value): value is string => Boolean(value));
}

export type SubworkflowHeaderProps = {
    unit: AnyWorkflowUnit;
    adjustable?: boolean;
    editable?: boolean;
    subworkflow?: WodeSubworkflow;
    onUnitRemove: () => void;
    headerStatusCls: (unit: AnyWorkflowUnit) => string;
    /**
     * User finished editing the branch title in `EntityHeader`. The wove `Workflow` designer
     * sets `unit.name` on the active unit and calls `onUnitUpdate(unit)`; consumers must persist
     * `unitInstances` and keep the paired `Subworkflow` display name in sync (wode:
     * `Workflow.prototype.syncLinkedSubworkflowNameFromUnit`).
     */
    onUnitNameUpdate: (name: string) => void;
    unitIndex: number;
    onUnitAdd: (unitType: UnitType, prepend?: boolean, unitIndex?: number) => void;
    onUnitAddSubworkflowFromConfig: (
        config: unknown,
        prependOrPasteIndex?: boolean | number,
        unitIndex?: number,
    ) => void;
    onUpdateUnitIndex: (index: number) => void;
    workflow: WodeWorkflow;
    areWorkflowContentExpanded?: boolean;
    toggleExpandWorkflowContent?: () => void;
    onSubworkflowUnitUpdate: (subworkflow: SubworkflowDesignerUpdate) => void;
    materials: OrderedMaterial[];
    materialsIndex?: number;
    materialsSet?: MaterialsSet;
    jobHasParent?: boolean;
    /**
     * Whether this header has to say which step is open. False when the shell already does —
     * the studio layout's rail both names the steps and switches between them — in which case
     * the header keeps only its actions and states the model instead of repeating the name.
     */
    showStepIdentity?: boolean;
};

export default function SubworkflowHeader({
    unit,
    adjustable = false,
    editable = false,
    subworkflow,
    onUnitRemove,
    headerStatusCls,
    onUnitNameUpdate,
    unitIndex,
    onUnitAdd,
    onUnitAddSubworkflowFromConfig,
    onUpdateUnitIndex,
    workflow,
    areWorkflowContentExpanded = true,
    toggleExpandWorkflowContent = () => undefined,
    onSubworkflowUnitUpdate,
    materials,
    materialsIndex,
    materialsSet,
    jobHasParent = false,
    showStepIdentity = true,
}: SubworkflowHeaderProps) {
    const { EntityHeaderComponent } = useWorkflowComponents();
    const [convergenceSubworkflow, setConvergenceSubworkflow] = useState<WodeSubworkflow | null>(
        null,
    );
    const [unitTypeSelectOpen, setUnitTypeSelectOpen] = useState(false);
    const [stepLibraryOpen, setStepLibraryOpen] = useState(false);

    const closeConvergenceDialog = useCallback(() => setConvergenceSubworkflow(null), []);
    const closeUnitTypeSelectDialog = useCallback(() => setUnitTypeSelectOpen(false), []);
    const closeStepLibraryDialog = useCallback(() => setStepLibraryOpen(false), []);

    const pagerProps = useMemo(
        () => ({
            isShown: true,
            className: "pull-right",
            buttonType: "btn-outline",
            length: workflow.unitInstances.length,
            index: unitIndex,
            onUpdateIndex: onUpdateUnitIndex,
        }),
        [workflow.unitInstances.length, unitIndex, onUpdateUnitIndex],
    );

    const dropdownProps = useMemo(
        () => ({
            isShown: (adjustable && unit.type === UnitType.subworkflow) || editable,
            className: "pull-right action-dropdown",
            actions: [
                {
                    isShown: adjustable && unit.type === UnitType.subworkflow,
                    icon: <IconByName name="shapes.loop" />,
                    content: "Add convergence",
                    onClick: (_action, _event) => {
                        if (!adjustable || unit.type !== UnitType.subworkflow) return;
                        const targetSubworkflow =
                            subworkflow ??
                            workflow.subworkflowInstances.find((s) => s.id === unit.id);
                        if (!targetSubworkflow) return;
                        setConvergenceSubworkflow(targetSubworkflow);
                    },
                    id: "add-convergence",
                },
                {
                    isShown: editable,
                    content: "Add step",
                    onClick: (_action, _event) => {
                        if (editable) {
                            setStepLibraryOpen(true);
                        }
                    },
                    icon: <IconByName name="shapes.addCircle" />,
                    id: "add-subworkflow",
                },
                {
                    isShown: editable,
                    content: "Add empty unit",
                    onClick: (_action, _event) => {
                        if (editable) {
                            setUnitTypeSelectOpen(true);
                        }
                    },
                    icon: <IconByName name="shapes.addCircle" />,
                    id: "add-unit-type",
                },
                {
                    isShown: editable,
                    icon: <IconByName name="shapes.removeCircle" />,
                    content: "Remove subworkflow",
                    onClick: (_action, _event) => {
                        onUnitRemove();
                    },
                    id: "remove-subworkflow",
                },
                {
                    isDivider: true,
                    isShown: editable || (adjustable && unit.type === UnitType.subworkflow),
                    id: "header-divider",
                    content: "",
                    onClick: (_action, _event) => undefined,
                },
                {
                    isShown: true,
                    content: areWorkflowContentExpanded ? "Collapse all" : "Expand all",
                    onClick: (_action, _event) => {
                        toggleExpandWorkflowContent();
                    },
                    icon: areWorkflowContentExpanded ? (
                        <IconByName name="actions.collapse" />
                    ) : (
                        <IconByName name="actions.expand" />
                    ),
                    shouldMenuStayOpened: true,
                    id: "collapse-all",
                },
            ],
            buttonContent: "Select Subworkflow Actions",
        }),
        [
            adjustable,
            unit.type,
            unit.id,
            editable,
            areWorkflowContentExpanded,
            subworkflow,
            workflow,
            onUnitRemove,
            toggleExpandWorkflowContent,
        ],
    );

    return (
        <>
            {showStepIdentity ? (
                <EntityHeaderComponent
                    isCompact
                    icon={`entities.workflow.unitType.${unit.type}`}
                    name={unit.name}
                    subtitle={subworkflow?.application?.name ?? unit.name}
                    onNameUpdate={onUnitNameUpdate}
                    editable={editable}
                    iconCls={`text-${headerStatusCls(unit)}`}
                    id="workflow-designer-subworkflow-header"
                    pagerProps={pagerProps}
                    dropdownProps={dropdownProps}
                    isDescriptionEditorHidden
                />
            ) : (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    id="workflow-designer-subworkflow-header"
                    data-tid="subworkflow-header-compact"
                    sx={{ px: 2, py: 1 }}
                >
                    {summarizeMethod(subworkflow).map((chip) => (
                        <Chip key={chip} label={chip} size="small" variant="outlined" />
                    ))}
                    <Box sx={{ flexGrow: 1 }} />
                    {dropdownProps.isShown ? (
                        <Dropdown
                            id="workflow-designer-subworkflow-actions"
                            actions={dropdownProps.actions}
                            buttonContent={dropdownProps.buttonContent}
                            className={dropdownProps.className}
                        />
                    ) : null}
                </Stack>
            )}
            {convergenceSubworkflow ? (
                <Convergence
                    subworkflow={convergenceSubworkflow}
                    onClose={closeConvergenceDialog}
                    onApply={(params) => {
                        const material = materials[materialsIndex ?? 0];
                        if (!convergenceSubworkflow) {
                            closeConvergenceDialog();
                            return;
                        }
                        if (!material) {
                            showWarningAlert(
                                "Select a material before adding convergence to this subworkflow.",
                            );
                            return;
                        }

                        const externalContext: SubworkflowExternalContextForConvergence = {
                            material,
                            materials,
                            materialsSet,
                            jobHasParent,
                            workflowHasRelaxation: workflow.hasRelaxation,
                        };
                        const subworkflowWithConvergence = new Subworkflow(
                            convergenceSubworkflow.toJSON(),
                        );
                        subworkflowWithConvergence.addConvergence({
                            ...params,
                            externalContext,
                        });
                        onSubworkflowUnitUpdate(subworkflowWithConvergence);
                        closeConvergenceDialog();
                    }}
                />
            ) : null}
            {unitTypeSelectOpen ? (
                <UnitTypeSelect
                    onClose={closeUnitTypeSelectDialog}
                    onSelect={(unitType: DefaultSubworkflowUnitType, prepend) => {
                        const key = String(unitType);
                        if (key === UnitType.subworkflow) {
                            onUnitAdd(UnitType.subworkflow, prepend, unitIndex);
                        } else if (key === UnitType.map) {
                            onUnitAdd(UnitType.map, prepend, unitIndex);
                        }
                        closeUnitTypeSelectDialog();
                    }}
                    unitTypes={[UnitType.subworkflow as any, UnitType.map as any]}
                />
            ) : null}
            {stepLibraryOpen ? (
                <StepLibrary
                    onClose={closeStepLibraryDialog}
                    onSubmit={(config, prependOrPasteIndex) => {
                        onUnitAddSubworkflowFromConfig(config, prependOrPasteIndex, unitIndex);
                        closeStepLibraryDialog();
                    }}
                />
            ) : null}
        </>
    );
}
