import { jsx as _jsx } from "react/jsx-runtime";
import { Utils } from "@mat3ra/utils";
import { Subworkflow, Workflow } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Workflow as WoveWorkflowDesigner } from "./components/workflows/Workflow";
import { WorkflowComponentsContext } from "./WorkflowComponentsContext";
/** Stable empty-array sentinel so the metaProperties useLayoutEffect dep never spuriously fires. */
const EMPTY_META_PROPERTIES = [];
export default function WorkflowDesignerContainer(containerProps) {
    const { initialWorkflow, defaultMaterial, metaProperties = EMPTY_META_PROPERTIES, editable, showHistory, workflowHistory, isStandalone, adjustable, showHeader, showMetadata, extraActions = [], accountUsers, accountUsersIsLoading, profile, publicAccount, clusters, dialogs, templates, isLoading, saveWorkflow, isDescriptionEditable, EntityHeaderComponent, EntityNameComponent, MetadataComponent, HistoryComponent, SubworkflowFormTitleComponent, PseudoFormComponent, DataGridComponent, getDefaultComputeConfig, generateEntityId, } = containerProps;
    const workflowComponents = useMemo(() => ({
        EntityHeaderComponent,
        EntityNameComponent,
        MetadataComponent,
        HistoryComponent: HistoryComponent !== null && HistoryComponent !== void 0 ? HistoryComponent : (() => null),
        SubworkflowFormTitleComponent,
        PseudoFormComponent,
        DataGridComponent,
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
    /** Latest workflow for save; avoids stale reads when `onSave` used `setState(prev => …)`. */
    const workflowRef = useRef(state.workflow);
    workflowRef.current = state.workflow;
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
        if (flowchartId == null) {
            return;
        }
        setState((prev) => {
            const workflow = prev.workflow.clone();
            workflow.removeUnit(flowchartId);
            return { ...prev, workflow };
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
    return (_jsx(WorkflowComponentsContext.Provider, { value: workflowComponents, children: _jsx(WoveWorkflowDesigner, { workflow: workflow, jobHasParent: Boolean((state.job || {}).parentJob), isSetPublicVisible: state.isSetPublicVisible || false, isLoading: isLoading, materials: materials, showHeader: showHeader, showMetadata: showMetadata, editable: editable, showHistory: showHistory, workflowHistory: workflowHistory, isStandalone: isStandalone, adjustable: adjustable, metaProperties: metaProperties, extraActions: extraActions, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, profile: profile, publicAccount: publicAccount, clusters: clusters, dialogs: dialogs, templates: templates, onUpdate: onUpdate, onSave: onSave, onNameUpdate: onNameUpdate, onUpdateTags: onUpdateTags, onUnitAdd: onUnitAdd, onUnitAddSubworkflowFromConfig: onUnitAddSubworkflowFromConfig, onUnitRemove: onUnitRemove, onUnitUpdate: onUnitUpdate, onSubworkflowUnitUpdate: onSubworkflowUnitUpdate, onRender: renderWorkflow, workflowRenderGeneration: renderGeneration, isDescriptionEditable: isDescriptionEditable }) }));
}
