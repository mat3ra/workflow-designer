import { jsx as _jsx } from "react/jsx-runtime";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon";
import { Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import Box from "@mui/material/Box";
import findIndex from "lodash/findIndex";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { WorkflowDefaultLayout } from "./WorkflowDefaultLayout";
import { getWorkflowDesignerTabResetKey } from "./workflowDesignerTabState";
import { getUnitStatusCls, getWorkflowStatusCls } from "@mat3ra/wove";
const noop = () => undefined;
const EMPTY_META_PROPERTIES = [];
const noopUnitAddSubworkflowFromConfig = (_config, _prependOrPasteIndex, _unitIndex) => undefined;
export function Workflow({ workflow, metaProperties = EMPTY_META_PROPERTIES, onUpdate = noop, onOutputUpdateRequest, onUpdateTags, extraActions = [], onSave, onNameUpdate, iconCls, onUnitAdd = noop, onUnitAddSubworkflowFromConfig = noopUnitAddSubworkflowFromConfig, onUnitRemove = noop, onUnitUpdate = noop, onSubworkflowUnitUpdate = noop, materials = [], materialsIndex, jobHasParent = false, onMaterialSwitch, showHeaderPager = false, onHeaderPagerUpdate, dialogs, createMetaProperty = async (_property) => undefined, accountUsers, accountUsersIsLoading, profile, publicAccount, clusters = [], templates, isStandalone = false, isHeaderCompact, editable = false, adjustable = false, isLoading = false, showHeader = true, isMethodDataLoading = false, materialsSet, isMap, isSetPublicVisible, showMetadata = true, showHistory = false, workflowHistory = [], onIsMultiMaterialChanged, onRender, renderAtJobLevel = false, workflowRenderGeneration, isDescriptionEditable, jobProperties, }) {
    const [unitIndex, setUnitIndex] = useState(0);
    const [isRelaxationToggled, setIsRelaxationToggled] = useState(false);
    const [isMultiMaterialToggled, setIsMultiMaterialToggled] = useState(() => Boolean(workflow.isMultiMaterial));
    const [areWorkflowContentExpanded, setAreWorkflowContentExpanded] = useState(false);
    /** Per-subworkflow Overview / Important settings / … tab; lives here so Subworkflow remounts do not reset it, but leaving the job Workflow tab unmounts this tree and clears it. */
    const [subworkflowActiveTabIndexById, setSubworkflowActiveTabIndexById] = useState({});
    /** Job designer: bumped after `job.render()` so context providers refresh React children. */
    const [, setJobRenderGeneration] = useState(0);
    const workflowRef = useRef(workflow);
    workflowRef.current = workflow;
    const workflowTabResetKey = getWorkflowDesignerTabResetKey(workflow);
    const notifyWorkflowUpdated = useCallback((updatedWorkflow) => {
        onUpdate(new WodeWorkflow(updatedWorkflow.toJSON()));
    }, [onUpdate]);
    useEffect(() => {
        setUnitIndex((i) => i || 0);
        setIsRelaxationToggled(false);
        setAreWorkflowContentExpanded(true);
        setSubworkflowActiveTabIndexById({});
    }, [workflowTabResetKey]);
    useEffect(() => {
        setIsMultiMaterialToggled(Boolean(workflow.isMultiMaterial));
    }, [workflow.isMultiMaterial]);
    const onSubworkflowActiveTabIndexChange = useCallback((subworkflowId, tabIndex) => {
        setSubworkflowActiveTabIndexById((previous) => ({
            ...previous,
            [subworkflowId]: tabIndex,
        }));
    }, []);
    /**
     * Job designer: `job.render()` runs in `jobUpdate` when `Job` calls `onUpdate` — do not call
     * `onRender` here or `renderGeneration` bumps remount this tree in a loop.
     * Workflow designer: `onRender` is `renderWorkflow` from `WorkflowDesignerContainer`.
     */
    useLayoutEffect(() => {
        if (renderAtJobLevel) {
            setJobRenderGeneration((generation) => generation + 1);
            return;
        }
        onRender();
    }, [
        onRender,
        renderAtJobLevel,
        materials,
        materialsIndex,
        materialsSet,
        jobHasParent,
        unitIndex,
        metaProperties,
    ]);
    const currentUnit = useCallback(() => workflow.unitInstances[unitIndex], [workflow, unitIndex]);
    const onUpdateUnitIndex = useCallback((index) => {
        setUnitIndex(index);
    }, []);
    const toggleExpandWorkflowContent = useCallback(() => {
        setAreWorkflowContentExpanded((v) => !v);
    }, []);
    const onUnitSelect = useCallback((unit) => {
        const idx = findIndex(workflow.unitInstances, (u) => u.flowchartId === unit.flowchartId);
        if (idx > -1 && idx !== unitIndex) {
            setUnitIndex(idx);
        }
    }, [workflow.unitInstances, unitIndex]);
    const removeByFlowchartId = useCallback((flowchartId) => {
        const indexOfUnit = workflow.unitInstances.findIndex((unit) => unit.flowchartId === flowchartId);
        if (workflow.unitInstances.length - 1 <= indexOfUnit && indexOfUnit > 0) {
            setUnitIndex(indexOfUnit - 1);
        }
        else if (workflow.unitInstances.length - 1 && unitIndex > 0) {
            setUnitIndex(unitIndex - 1);
        }
        onUnitRemove(flowchartId);
    }, [workflow.unitInstances, onUnitRemove, unitIndex]);
    const removeSelectedUnitByIndex = useCallback(() => {
        const idx = unitIndex;
        const unit = workflow.unitInstances[idx];
        if (workflow.unitInstances.length - 1 <= idx && idx > 0) {
            setUnitIndex(idx - 1);
        }
        onUnitRemove(unit.flowchartId);
    }, [workflow.unitInstances, onUnitRemove, unitIndex]);
    const handleUnitRemove = useCallback((flowchartId) => {
        if (flowchartId && typeof flowchartId === "string") {
            removeByFlowchartId(flowchartId);
            return;
        }
        removeSelectedUnitByIndex();
    }, [removeByFlowchartId, removeSelectedUnitByIndex]);
    /**
     * Subworkflow branch header rename: mutates the active unit's `name` then notifies the parent.
     * For `UnitType.subworkflow` units, `onUnitUpdate` should also update the linked `Subworkflow`
     * (`Workflow.syncLinkedSubworkflowNameFromUnit` in `@mat3ra/wode`).
     */
    const onUnitNameUpdate = useCallback((name) => {
        const unit = currentUnit();
        unit.name = name;
        onUnitUpdate(unit);
    }, [currentUnit, onUnitUpdate]);
    const toggleRelaxation = useCallback(() => {
        workflow.toggleRelaxation();
        notifyWorkflowUpdated(workflow);
        const shouldSwitchOnFirstPage = isRelaxationToggled && workflow.unitInstances.length - 1 <= unitIndex && unitIndex > 0;
        if (shouldSwitchOnFirstPage) {
            setUnitIndex(unitIndex - 1);
        }
        setIsRelaxationToggled((t) => !t);
    }, [workflow, isRelaxationToggled, notifyWorkflowUpdated, unitIndex]);
    const toggleIsMultiMaterial = useCallback(() => {
        workflow.isMultiMaterial = !workflow.isMultiMaterial;
        setIsMultiMaterialToggled(Boolean(workflow.isMultiMaterial));
        notifyWorkflowUpdated(workflow);
        onIsMultiMaterialChanged === null || onIsMultiMaterialChanged === void 0 ? void 0 : onIsMultiMaterialChanged(workflow.isMultiMaterial);
    }, [workflow, onIsMultiMaterialChanged, notifyWorkflowUpdated]);
    const onMapWorkflowUpdate = useCallback((mapWorkflow) => {
        const { workflows } = workflow;
        const mapWorkflowIndex = workflows.findIndex((w) => w._id === mapWorkflow._id);
        if (mapWorkflowIndex >= 0) {
            workflow.workflows[mapWorkflowIndex] = mapWorkflow.toJSON();
        }
        notifyWorkflowUpdated(workflow);
    }, [notifyWorkflowUpdated, workflow]);
    const headerStatusCls = useCallback((unit) => {
        if (unit.type === UnitType.subworkflow) {
            const sw = workflow.subworkflowInstances.find((s) => s.id === unit.id);
            if (sw) {
                return getWorkflowStatusCls(sw.unitsInstances);
            }
        }
        return getUnitStatusCls(unit.status);
    }, [workflow]);
    const onDescriptionUpdate = useCallback((descriptionObject, description) => {
        const updatedWorkflow = workflowRef.current;
        updatedWorkflow.descriptionObject = descriptionObject;
        updatedWorkflow.description = description;
        notifyWorkflowUpdated(updatedWorkflow);
    }, [notifyWorkflowUpdated]);
    const getDefaultActions = useCallback(() => {
        return [
            {
                isShown: adjustable || editable,
                content: "Toggle relaxation",
                icon: _jsx(IconByName, { name: "actions.toggleRelaxation" }),
                onClick: (_action, _event) => {
                    toggleRelaxation();
                },
                showCheckIcon: isRelaxationToggled,
                id: "toggle-relaxation",
            },
            {
                isShown: adjustable || editable,
                content: "Toggle multi-material",
                onClick: (_action, _event) => {
                    toggleIsMultiMaterial();
                },
                showCheckIcon: isMultiMaterialToggled,
                id: "toggle-multi-material",
            },
        ];
    }, [
        adjustable,
        editable,
        isMultiMaterialToggled,
        isRelaxationToggled,
        toggleIsMultiMaterial,
        toggleRelaxation,
    ]);
    const getActions = useCallback(() => {
        return [...getDefaultActions(), ...extraActions];
    }, [extraActions, getDefaultActions]);
    const getPagerProps = useCallback(() => {
        return {
            isShown: showHeaderPager,
            buttonType: "btn-outline",
            length: workflow.totalRepetitions,
            index: workflow.repetition,
            onUpdateIndex: onHeaderPagerUpdate !== null && onHeaderPagerUpdate !== void 0 ? onHeaderPagerUpdate : (() => undefined),
        };
    }, [onHeaderPagerUpdate, showHeaderPager, workflow]);
    const getSaveBtnProps = useCallback(() => {
        return {
            isShown: Boolean(editable && isStandalone),
            isLoading,
            onSave: (omitRedirect) => {
                onSave === null || onSave === void 0 ? void 0 : onSave(omitRedirect !== null && omitRedirect !== void 0 ? omitRedirect : false);
            },
        };
    }, [editable, isLoading, isStandalone, onSave]);
    const getDropdownProps = useCallback(() => {
        return {
            isShown: true,
            className: "action-dropdown",
            actions: getActions(),
            buttonContent: "Select Workflow Actions",
        };
    }, [getActions]);
    return (_jsx(Box, { "data-workflow-render-generation": workflowRenderGeneration, children: _jsx(WorkflowDefaultLayout, { entity: workflow, unitIndex: unitIndex, isMap: isMap, materials: materials, materialsIndex: materialsIndex, materialsSet: materialsSet, jobHasParent: jobHasParent, editable: Boolean(editable), adjustable: Boolean(adjustable), isLoading: isLoading, showHeader: showHeader, isHeaderCompact: isHeaderCompact, isStandalone: isStandalone, isMethodDataLoading: isMethodDataLoading, isSetPublicVisible: isSetPublicVisible, showMetadata: showMetadata, showHistory: showHistory, workflowHistory: workflowHistory, iconCls: iconCls, onNameUpdate: onNameUpdate, onUpdateTags: onUpdateTags, onUnitAdd: onUnitAdd, onUnitAddSubworkflowFromConfig: onUnitAddSubworkflowFromConfig, onUnitUpdate: onUnitUpdate, onSubworkflowUnitUpdate: onSubworkflowUnitUpdate, onMapWorkflowUpdate: onMapWorkflowUpdate, onUnitSelect: onUnitSelect, onUpdateUnitIndex: onUpdateUnitIndex, handleUnitRemove: handleUnitRemove, onUnitNameUpdate: onUnitNameUpdate, areWorkflowContentExpanded: areWorkflowContentExpanded, toggleExpandWorkflowContent: toggleExpandWorkflowContent, headerStatusCls: headerStatusCls, getPagerProps: getPagerProps, getSaveBtnProps: getSaveBtnProps, getDropdownProps: getDropdownProps, isDescriptionEditable: isDescriptionEditable, onDescriptionUpdate: onDescriptionUpdate, dialogs: dialogs, metaProperties: metaProperties, onMaterialSwitch: onMaterialSwitch, onOutputUpdateRequest: onOutputUpdateRequest, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, profile: profile, publicAccount: publicAccount, clusters: clusters, templates: templates, createMetaProperty: createMetaProperty, jobProperties: jobProperties, subworkflowActiveTabIndexById: subworkflowActiveTabIndexById, onSubworkflowActiveTabIndexChange: onSubworkflowActiveTabIndexChange }) }));
}
