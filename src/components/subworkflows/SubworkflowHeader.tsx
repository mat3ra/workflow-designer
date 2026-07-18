import IconByName from "@mat3ra/cove.js/dist/mui/components/icon/IconByName";
import { showWarningAlert } from "@mat3ra/cove.js/dist/other/alerts";
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
import React, { useCallback, useMemo, useState } from "react";

import type { SubworkflowDesignerUpdate } from "../../utils/subworkflowDesignerUpdate";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import UnitPaste from "../units/UnitPaste";
import UnitTypeSelect from "../units/UnitTypeSelect";
import Convergence from "../workflows/Convergence";

type SubworkflowExternalContextForConvergence = WorkflowRenderContext & {
    workflowHasRelaxation: boolean;
};

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
}: SubworkflowHeaderProps) {
    const { EntityHeaderComponent } = useWorkflowComponents();
    const [convergenceSubworkflow, setConvergenceSubworkflow] = useState<WodeSubworkflow | null>(
        null,
    );
    const [unitTypeSelectOpen, setUnitTypeSelectOpen] = useState(false);
    const [unitPasteOpen, setUnitPasteOpen] = useState(false);

    const closeConvergenceDialog = useCallback(() => setConvergenceSubworkflow(null), []);
    const closeUnitTypeSelectDialog = useCallback(() => setUnitTypeSelectOpen(false), []);
    const closeUnitPasteDialog = useCallback(() => setUnitPasteOpen(false), []);

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
                    content: "Add subworkflow",
                    onClick: (_action, _event) => {
                        if (editable) {
                            setUnitTypeSelectOpen(true);
                        }
                    },
                    icon: <IconByName name="shapes.addCircle" />,
                    id: "add-subworkflow",
                },
                {
                    isShown: editable,
                    content: "Paste subworkflow",
                    onClick: (_action, _event) => {
                        if (editable) {
                            setUnitPasteOpen(true);
                        }
                    },
                    icon: <IconByName name="actions.copy" />,
                    id: "paste-subworkflow",
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
            {unitPasteOpen ? (
                <UnitPaste
                    onClose={closeUnitPasteDialog}
                    onSubmit={(config, prependOrPasteIndex) => {
                        onUnitAddSubworkflowFromConfig(config, prependOrPasteIndex, unitIndex);
                        closeUnitPasteDialog();
                    }}
                />
            ) : null}
        </>
    );
}
