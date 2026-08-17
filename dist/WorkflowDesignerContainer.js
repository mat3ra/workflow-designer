import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Utils } from "@mat3ra/utils";
import { Subworkflow, Workflow } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { UndoSnackbar } from "./components/common/UndoSnackbar";
import { Workflow as WoveWorkflowDesigner } from "./components/workflows/Workflow";
import { WorkflowComponentsContext } from "./WorkflowComponentsContext";
/** Stable empty-array sentinel so the metaProperties useLayoutEffect dep never spuriously fires. */
const EMPTY_META_PROPERTIES = [];
export default function WorkflowDesignerContainer(containerProps) {
    const { initialWorkflow, defaultMaterial, metaProperties = EMPTY_META_PROPERTIES, editable, showHistory, workflowHistory, isStandalone, adjustable, showHeader, showMetadata, extraActions = [], accountUsers, accountUsersIsLoading, profile, publicAccount, clusters, dialogs, templates, isLoading, saveWorkflow, isDescriptionEditable, EntityHeaderComponent, EntityNameComponent, MetadataComponent, HistoryComponent, SubworkflowFormTitleComponent, PseudoFormComponent, DataGridComponent, BrillouinZoneImageComponent, getDefaultComputeConfig, generateEntityId, onDirtyChange, useUnitInspector, useHostTheme, } = containerProps;
    const workflowComponents = useMemo(() => ({
        EntityHeaderComponent,
        EntityNameComponent,
        MetadataComponent,
        HistoryComponent: HistoryComponent !== null && HistoryComponent !== void 0 ? HistoryComponent : (() => null),
        SubworkflowFormTitleComponent,
        PseudoFormComponent,
        DataGridComponent,
        BrillouinZoneImageComponent,
        getDefaultComputeConfig,
        generateEntityId,
    }), [
        EntityHeaderComponent,
        EntityNameComponent,
        MetadataComponent,
        HistoryComponent,
        SubworkflowFormTitleComponent,
        PseudoFormComponent,
        DataGridComponent,
        BrillouinZoneImageComponent,
        getDefaultComputeConfig,
        generateEntityId,
    ]);
    const [state, setState] = useState(() => {
        return {
            workflow: new Workflow(initialWorkflow.toJSON()),
            index: 0,
            editable: false,
            materials: [defaultMaterial],
            material: defaultMaterial,
        };
    });
    const [renderGeneration, setRenderGeneration] = useState(0);
    const [removeUndoState, setRemoveUndoState] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    /** Latest workflow for save; avoids stale reads when `onSave` used `setState(prev => …)`. */
    const workflowRef = useRef(state.workflow);
    workflowRef.current = state.workflow;
    /**
     * Unsaved-changes baseline. Captured after the first `workflow.render()` pass (not from
     * `initialWorkflow`) because rendering injects context into units, which would otherwise
     * read as an immediate phantom edit.
     */
    const dirtyBaselineRef = useRef(null);
    const onDirtyChangeRef = useRef(onDirtyChange);
    onDirtyChangeRef.current = onDirtyChange;
    useEffect(() => {
        const currentJson = JSON.stringify(state.workflow.toJSON());
        if (dirtyBaselineRef.current === null) {
            dirtyBaselineRef.current = currentJson;
            return;
        }
        const nextDirty = currentJson !== dirtyBaselineRef.current;
        setIsDirty((prev) => {
            var _a;
            if (prev !== nextDirty) {
                (_a = onDirtyChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onDirtyChangeRef, nextDirty);
            }
            return nextDirty;
        });
    }, [state.workflow, renderGeneration]);
    /**
     * Sole entry point for `workflow.render()` in the workflow designer UI tree.
     */
    const renderWorkflow = useCallback(() => {
        setState((prev) => {
            if (!prev.material || !prev.workflow) {
                return prev;
            }
            prev.workflow.render({
                material: prev.material,
                materials: prev.materials,
                materialsSet: prev.materialsSet,
                jobHasParent: Boolean((prev.job || {}).parentJob),
            });
            return prev;
        });
        setRenderGeneration((generation) => generation + 1);
    }, []);
    useLayoutEffect(() => {
        renderWorkflow();
    }, [renderWorkflow, state.material, state.materials, state.materialsSet, metaProperties]);
    const onUpdate = useCallback((nextWorkflow) => {
        workflowRef.current = nextWorkflow;
        setState((prev) => ({ ...prev, workflow: nextWorkflow }));
    }, []);
    const onSave = useCallback((omitRedirect) => {
        // Reset the unsaved-changes baseline optimistically; save errors surface via alerts.
        dirtyBaselineRef.current = JSON.stringify(workflowRef.current.toJSON());
        setIsDirty((prev) => {
            var _a;
            if (prev) {
                (_a = onDirtyChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onDirtyChangeRef, false);
            }
            return false;
        });
        saveWorkflow({ workflow: workflowRef.current, omitRedirect }).catch(() => {
            /* errors reported inside saveWorkflow */
        });
    }, [saveWorkflow]);
    const onNameUpdate = useCallback((name) => {
        setState((prev) => {
            const json = prev.workflow.toJSON();
            return {
                ...prev,
                workflow: new Workflow({ ...json, name }),
            };
        });
    }, []);
    const onUpdateTags = useCallback((tags) => {
        setState((prev) => {
            const cloned = prev.workflow.clone();
            cloned.setTags(tags);
            return { ...prev, workflow: cloned };
        });
    }, []);
    const onUnitAdd = useCallback(
    // eslint-disable-next-line default-param-last -- matches Workflow.onUnitAdd(unitType, prepend?, unitIndex?)
    (unitType, prepend = false, unitIndex) => {
        setState((prev) => {
            const index = (unitIndex === undefined ? -1 : unitIndex) + (prepend ? 0 : 1);
            const workflow = prev.workflow.clone();
            workflow.addUnitType(unitType, false, index);
            return { ...prev, workflow };
        });
        renderWorkflow();
    }, [renderWorkflow]);
    const onUnitAddSubworkflowFromConfig = useCallback((config, 
    // eslint-disable-next-line default-param-last -- matches Workflow.onUnitAddSubworkflowFromConfig
    prepend = false, unitIndex) => {
        setState((prev) => {
            const workflow = prev.workflow.clone();
            const index = (unitIndex === undefined ? -1 : unitIndex) + (prepend ? 0 : 1);
            const nextEntityId = generateEntityId;
            const subworkflow = new Subworkflow({
                ...config,
                _id: nextEntityId(),
                units: config.units.map((u) => ({
                    ...u,
                    _id: nextEntityId(),
                    flowchartId: Utils.uuid.getUUID(),
                })),
            });
            workflow.addSubworkflow(subworkflow, index === 0, index);
            return { ...prev, workflow };
        });
        renderWorkflow();
    }, [renderWorkflow, generateEntityId]);
    const onUnitRemove = useCallback((flowchartId) => {
        var _a;
        if (flowchartId == null) {
            return;
        }
        const { current } = workflowRef;
        const removedUnit = current.unitInstances.find((u) => u.flowchartId === flowchartId);
        const snapshot = current.toJSON();
        setState((prev) => {
            const workflow = prev.workflow.clone();
            workflow.removeUnit(flowchartId);
            return { ...prev, workflow };
        });
        setRemoveUndoState({
            message: `Removed "${(_a = removedUnit === null || removedUnit === void 0 ? void 0 : removedUnit.name) !== null && _a !== void 0 ? _a : "unit"}"`,
            onUndo: () => {
                const restored = new Workflow(snapshot);
                workflowRef.current = restored;
                setState((prev) => ({ ...prev, workflow: restored }));
                renderWorkflow();
            },
        });
        renderWorkflow();
    }, [renderWorkflow]);
    const onUnitUpdate = useCallback((unit) => {
        setState((prev) => {
            const newWorkflow = prev.workflow;
            const unitIndex = newWorkflow.unitInstances.findIndex((u) => u.flowchartId === unit.flowchartId);
            if (unitIndex >= 0) {
                const nextUnits = [...newWorkflow.unitInstances];
                nextUnits[unitIndex] = unit;
                newWorkflow.setUnits(nextUnits);
                newWorkflow.syncLinkedSubworkflowNameFromUnit(unit);
            }
            return { ...prev, workflow: prev.workflow };
        });
        renderWorkflow();
    }, [renderWorkflow]);
    const onSubworkflowUnitUpdate = useCallback((subworkflowSchema) => {
        setState((prev) => {
            const newWorkflow = prev.workflow;
            const subworkflow = new Subworkflow(subworkflowSchema);
            const subworkflowIndex = newWorkflow.subworkflowInstances.findIndex((sw) => sw.id === subworkflow.id);
            if (subworkflowIndex < 0) {
                return prev;
            }
            subworkflow.updateMethodData(prev.materials, metaProperties);
            newWorkflow.subworkflows[subworkflowIndex] = subworkflowSchema;
            newWorkflow.subworkflowInstances[subworkflowIndex] = new Subworkflow(subworkflow.toJSON());
            return { ...prev, workflow: newWorkflow };
        });
        renderWorkflow();
    }, [metaProperties, renderWorkflow]);
    const { workflow } = state;
    const materials = useMemo(() => [defaultMaterial], [defaultMaterial]);
    if (!workflow) {
        return (_jsx(Box, { sx: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                py: 4,
            }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(WorkflowComponentsContext.Provider, { value: workflowComponents, children: [_jsx(UndoSnackbar, { state: removeUndoState, onClose: () => setRemoveUndoState(null) }), _jsx(WoveWorkflowDesigner, { useUnitInspector: useUnitInspector, useHostTheme: useHostTheme, workflow: workflow, isDirty: isDirty, jobHasParent: Boolean((state.job || {}).parentJob), isSetPublicVisible: state.isSetPublicVisible || false, isLoading: isLoading, materials: materials, showHeader: showHeader, showMetadata: showMetadata, editable: editable, showHistory: showHistory, workflowHistory: workflowHistory, isStandalone: isStandalone, adjustable: adjustable, metaProperties: metaProperties, extraActions: extraActions, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, profile: profile, publicAccount: publicAccount, clusters: clusters, dialogs: dialogs, templates: templates, onUpdate: onUpdate, onSave: onSave, onNameUpdate: onNameUpdate, onUpdateTags: onUpdateTags, onUnitAdd: onUnitAdd, onUnitAddSubworkflowFromConfig: onUnitAddSubworkflowFromConfig, onUnitRemove: onUnitRemove, onUnitUpdate: onUnitUpdate, onSubworkflowUnitUpdate: onSubworkflowUnitUpdate, onRender: renderWorkflow, workflowRenderGeneration: renderGeneration, isDescriptionEditable: isDescriptionEditable })] }));
}
