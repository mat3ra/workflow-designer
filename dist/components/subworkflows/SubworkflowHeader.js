import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { showWarningAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { Subworkflow, } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import { useCallback, useMemo, useState } from "react";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import UnitPaste from "../units/UnitPaste";
import UnitTypeSelect from "../units/UnitTypeSelect";
import Convergence from "../workflows/Convergence";
export default function SubworkflowHeader({ unit, adjustable = false, editable = false, subworkflow, onUnitRemove, headerStatusCls, onUnitNameUpdate, unitIndex, onUnitAdd, onUnitAddSubworkflowFromConfig, onUpdateUnitIndex, workflow, areWorkflowContentExpanded = true, toggleExpandWorkflowContent = () => undefined, onSubworkflowUnitUpdate, materials, materialsIndex, materialsSet, jobHasParent = false, }) {
    var _a, _b;
    const { EntityHeaderComponent } = useWorkflowComponents();
    const [convergenceSubworkflow, setConvergenceSubworkflow] = useState(null);
    const [unitTypeSelectOpen, setUnitTypeSelectOpen] = useState(false);
    const [unitPasteOpen, setUnitPasteOpen] = useState(false);
    const closeConvergenceDialog = useCallback(() => setConvergenceSubworkflow(null), []);
    const closeUnitTypeSelectDialog = useCallback(() => setUnitTypeSelectOpen(false), []);
    const closeUnitPasteDialog = useCallback(() => setUnitPasteOpen(false), []);
    const pagerProps = useMemo(() => ({
        isShown: true,
        className: "pull-right",
        buttonType: "btn-outline",
        length: workflow.unitInstances.length,
        index: unitIndex,
        onUpdateIndex: onUpdateUnitIndex,
    }), [workflow.unitInstances.length, unitIndex, onUpdateUnitIndex]);
    const dropdownProps = useMemo(() => ({
        isShown: (adjustable && unit.type === UnitType.subworkflow) || editable,
        className: "pull-right action-dropdown",
        actions: [
            {
                isShown: adjustable && unit.type === UnitType.subworkflow,
                icon: _jsx(IconByName, { name: "shapes.loop" }),
                content: "Add convergence",
                onClick: (_action, _event) => {
                    if (!adjustable || unit.type !== UnitType.subworkflow)
                        return;
                    const targetSubworkflow = subworkflow !== null && subworkflow !== void 0 ? subworkflow : workflow.subworkflowInstances.find((s) => s.id === unit.id);
                    if (!targetSubworkflow)
                        return;
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
                icon: _jsx(IconByName, { name: "shapes.addCircle" }),
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
                icon: _jsx(IconByName, { name: "actions.copy" }),
                id: "paste-subworkflow",
            },
            {
                isShown: editable,
                icon: _jsx(IconByName, { name: "shapes.removeCircle" }),
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
                icon: areWorkflowContentExpanded ? (_jsx(IconByName, { name: "actions.collapse" })) : (_jsx(IconByName, { name: "actions.expand" })),
                shouldMenuStayOpened: true,
                id: "collapse-all",
            },
        ],
        buttonContent: "Select Subworkflow Actions",
    }), [
        adjustable,
        unit.type,
        unit.id,
        editable,
        areWorkflowContentExpanded,
        subworkflow,
        workflow,
        onUnitRemove,
        toggleExpandWorkflowContent,
    ]);
    return (_jsxs(_Fragment, { children: [_jsx(EntityHeaderComponent, { isCompact: true, icon: `entities.workflow.unitType.${unit.type}`, name: unit.name, subtitle: (_b = (_a = subworkflow === null || subworkflow === void 0 ? void 0 : subworkflow.application) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : unit.name, onNameUpdate: onUnitNameUpdate, editable: editable, iconCls: `text-${headerStatusCls(unit)}`, id: "workflow-designer-subworkflow-header", pagerProps: pagerProps, dropdownProps: dropdownProps, isDescriptionEditorHidden: true }), convergenceSubworkflow ? (_jsx(Convergence, { subworkflow: convergenceSubworkflow, onClose: closeConvergenceDialog, onApply: (params) => {
                    const material = materials[materialsIndex !== null && materialsIndex !== void 0 ? materialsIndex : 0];
                    if (!convergenceSubworkflow) {
                        closeConvergenceDialog();
                        return;
                    }
                    if (!material) {
                        showWarningAlert("Select a material before adding convergence to this subworkflow.");
                        return;
                    }
                    const externalContext = {
                        material,
                        materials,
                        materialsSet,
                        jobHasParent,
                        workflowHasRelaxation: workflow.hasRelaxation,
                    };
                    const subworkflowWithConvergence = new Subworkflow(convergenceSubworkflow.toJSON());
                    subworkflowWithConvergence.addConvergence({
                        ...params,
                        externalContext,
                    });
                    onSubworkflowUnitUpdate(subworkflowWithConvergence);
                    closeConvergenceDialog();
                } })) : null, unitTypeSelectOpen ? (_jsx(UnitTypeSelect, { onClose: closeUnitTypeSelectDialog, onSelect: (unitType, prepend) => {
                    const key = String(unitType);
                    if (key === UnitType.subworkflow) {
                        onUnitAdd(UnitType.subworkflow, prepend, unitIndex);
                    }
                    else if (key === UnitType.map) {
                        onUnitAdd(UnitType.map, prepend, unitIndex);
                    }
                    closeUnitTypeSelectDialog();
                }, unitTypes: [UnitType.subworkflow, UnitType.map] })) : null, unitPasteOpen ? (_jsx(UnitPaste, { onClose: closeUnitPasteDialog, onSubmit: (config, prependOrPasteIndex) => {
                    onUnitAddSubworkflowFromConfig(config, prependOrPasteIndex, unitIndex);
                    closeUnitPasteDialog();
                } })) : null] }));
}
