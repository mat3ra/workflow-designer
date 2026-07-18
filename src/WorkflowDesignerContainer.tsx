import type { DropdownAction } from "@mat3ra/cove.js/dist/mui/components/dropdown";
import type { Template } from "@mat3ra/ade";
import type { SubworkflowSchema } from "@mat3ra/esse/dist/js/types";
import { Utils } from "@mat3ra/utils";
import { type MaterialsSet, type OrderedMaterial, Subworkflow, Workflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Workflow as WoveWorkflowDesigner } from "./components/workflows/Workflow";
import type {
    WorkflowDesignerAccount,
    WorkflowDesignerCluster,
    WorkflowDesignerCreateMetaPropertyConfig,
    WorkflowDesignerDialogState,
    WorkflowDesignerHistory,
    WorkflowDesignerMetaProperty,
    WorkflowDesignerMetaPropertySchema,
    WorkflowDesignerProfile,
    WorkflowDesignerUser,
} from "./types/context";
import type { SaveWorkflowFromDesigner } from "./utils/persistWorkflowDesigner";
import { type WorkflowComponents, WorkflowComponentsContext } from "./WorkflowComponentsContext";

type WorkflowDesignerContainerBaseProps = {
    initialWorkflow: Workflow;
    defaultMaterial: OrderedMaterial;
    metaProperties?: WorkflowDesignerMetaProperty[];
    editable: boolean;
    showHistory: boolean;
    /** From CoreWorkflow / webapp entity at the shell boundary. */
    workflowHistory: WorkflowDesignerHistory;
    isStandalone: boolean;
    adjustable: boolean;
    showHeader: boolean;
    showMetadata: boolean;
    extraActions?: DropdownAction[];
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    clusters: WorkflowDesignerCluster[];
    dialogs: {
        pseudoUploadReduxDialog: WorkflowDesignerDialogState;
        unitTypeReduxDialog: WorkflowDesignerDialogState;
    };
    templates: Template[];
    /** Save in flight; owned by the page / shell that wraps persistence. */
    isLoading: boolean;
    saveWorkflow: SaveWorkflowFromDesigner;
    /** From shell/bank: precomputed with persisted core workflow + profile. */
    isDescriptionEditable: boolean;
    // Component props (webapp-specific, passed as React props)
    EntityHeaderComponent: React.ComponentType<Record<string, unknown>>;
    EntityNameComponent: React.ComponentType<Record<string, unknown>>;
    MetadataComponent: React.ComponentType<Record<string, unknown>>;
    HistoryComponent?: React.ComponentType<{ items: Array<Record<string, unknown>> }>;
    SubworkflowFormTitleComponent: React.ComponentType<{ title: string }>;
    PseudoFormComponent: React.ComponentType<Record<string, unknown>>;
    DataGridComponent: React.ComponentType<Record<string, unknown>>;
    // Function props
    getDefaultComputeConfig: (cluster?: unknown) => Record<string, unknown>;
    generateEntityId: () => string;
    // Pre-computed booleans / callbacks
    openDocumentationDialog?: (searchText: string) => void;
};

export type WorkflowDesignerContainerProps = WorkflowDesignerContainerBaseProps;

type DesignerState = {
    workflow: Workflow;
    materials: OrderedMaterial[];
    material: OrderedMaterial;
    index: number;
    editable: boolean;
    isSetPublicVisible?: boolean;
    materialsSet?: MaterialsSet;
    job?: { parentJob?: unknown };
};

/** Stable empty-array sentinel so the metaProperties useLayoutEffect dep never spuriously fires. */
const EMPTY_META_PROPERTIES: WorkflowDesignerMetaProperty[] = [];

export default function WorkflowDesignerContainer(containerProps: WorkflowDesignerContainerProps) {
    const {
        initialWorkflow,
        defaultMaterial,
        metaProperties = EMPTY_META_PROPERTIES,
        editable,
        showHistory,
        workflowHistory,
        isStandalone,
        adjustable,
        showHeader,
        showMetadata,
        extraActions = [],
        accountUsers,
        accountUsersIsLoading,
        profile,
        publicAccount,
        clusters,
        dialogs,
        templates,
        isLoading,
        saveWorkflow,
        isDescriptionEditable,
        EntityHeaderComponent,
        EntityNameComponent,
        MetadataComponent,
        HistoryComponent,
        SubworkflowFormTitleComponent,
        PseudoFormComponent,
        DataGridComponent,
        getDefaultComputeConfig,
        generateEntityId,
    } = containerProps;

    const workflowComponents: WorkflowComponents = useMemo(
        () => ({
            EntityHeaderComponent,
            EntityNameComponent,
            MetadataComponent,
            HistoryComponent: HistoryComponent ?? (() => null),
            SubworkflowFormTitleComponent,
            PseudoFormComponent,
            DataGridComponent,
            getDefaultComputeConfig,
            generateEntityId,
        }),
        [
            EntityHeaderComponent,
            EntityNameComponent,
            MetadataComponent,
            HistoryComponent,
            SubworkflowFormTitleComponent,
            PseudoFormComponent,
            DataGridComponent,
            getDefaultComputeConfig,
            generateEntityId,
        ],
    );

    const [state, setState] = useState<DesignerState>(() => {
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

    const onUpdate = useCallback((nextWorkflow: Workflow) => {
        workflowRef.current = nextWorkflow;
        setState((prev) => ({ ...prev, workflow: nextWorkflow }));
    }, []);

    const onSave = useCallback(
        (omitRedirect: boolean) => {
            saveWorkflow({ workflow: workflowRef.current, omitRedirect }).catch(() => {
                /* errors reported inside saveWorkflow */
            });
        },
        [saveWorkflow],
    );

    const onNameUpdate = useCallback((name: string) => {
        setState((prev) => {
            const json = prev.workflow.toJSON();
            return {
                ...prev,
                workflow: new Workflow({ ...json, name }),
            };
        });
    }, []);

    const onUpdateTags = useCallback((tags: string[]) => {
        setState((prev) => {
            const cloned = prev.workflow.clone();
            cloned.setTags(tags);
            return { ...prev, workflow: cloned };
        });
    }, []);

    const onUnitAdd = useCallback(
        // eslint-disable-next-line default-param-last -- matches Workflow.onUnitAdd(unitType, prepend?, unitIndex?)
        (unitType: UnitType, prepend = false, unitIndex?: number) => {
            setState((prev) => {
                const index = (unitIndex === undefined ? -1 : unitIndex) + (prepend ? 0 : 1);
                const workflow = prev.workflow.clone();
                workflow.addUnitType(unitType, false, index);
                return { ...prev, workflow };
            });
            renderWorkflow();
        },
        [renderWorkflow],
    );

    const onUnitAddSubworkflowFromConfig = useCallback(
        (
            config: SubworkflowSchema,
            // eslint-disable-next-line default-param-last -- matches Workflow.onUnitAddSubworkflowFromConfig
            prepend = false,
            unitIndex?: number,
        ) => {
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
        },
        [renderWorkflow, generateEntityId],
    );

    const onUnitRemove = useCallback(
        (flowchartId?: string) => {
            if (flowchartId == null) {
                return;
            }
            setState((prev) => {
                const workflow = prev.workflow.clone();
                workflow.removeUnit(flowchartId);
                return { ...prev, workflow };
            });
            renderWorkflow();
        },
        [renderWorkflow],
    );

    const onUnitUpdate = useCallback(
        (unit: AnyWorkflowUnit) => {
            setState((prev) => {
                const newWorkflow = prev.workflow;
                const unitIndex = newWorkflow.unitInstances.findIndex(
                    (u) => u.flowchartId === unit.flowchartId,
                );
                if (unitIndex >= 0) {
                    const nextUnits = [...newWorkflow.unitInstances];
                    nextUnits[unitIndex] = unit;
                    newWorkflow.setUnits(nextUnits);
                    newWorkflow.syncLinkedSubworkflowNameFromUnit(unit);
                }
                return { ...prev, workflow: prev.workflow };
            });
            renderWorkflow();
        },
        [renderWorkflow],
    );

    const onSubworkflowUnitUpdate = useCallback(
        (subworkflowSchema: SubworkflowSchema) => {
            setState((prev) => {
                const newWorkflow = prev.workflow;
                const subworkflow = new Subworkflow(subworkflowSchema);
                const subworkflowIndex = newWorkflow.subworkflowInstances.findIndex(
                    (sw) => sw.id === subworkflow.id,
                );
                if (subworkflowIndex < 0) {
                    return prev;
                }

                subworkflow.updateMethodData(prev.materials, metaProperties);

                newWorkflow.subworkflows[subworkflowIndex] = subworkflowSchema;
                newWorkflow.subworkflowInstances[subworkflowIndex] = new Subworkflow(
                    subworkflow.toJSON(),
                );

                return { ...prev, workflow: newWorkflow };
            });
            renderWorkflow();
        },
        [metaProperties, renderWorkflow],
    );

    const { workflow } = state;

    const materials = useMemo(() => [defaultMaterial], [defaultMaterial]);

    if (!workflow) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                    py: 4,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <WorkflowComponentsContext.Provider value={workflowComponents}>
            <WoveWorkflowDesigner
                workflow={workflow}
                jobHasParent={Boolean((state.job || {}).parentJob)}
                isSetPublicVisible={state.isSetPublicVisible || false}
                isLoading={isLoading}
                materials={materials}
                showHeader={showHeader}
                showMetadata={showMetadata}
                editable={editable}
                showHistory={showHistory}
                workflowHistory={workflowHistory}
                isStandalone={isStandalone}
                adjustable={adjustable}
                metaProperties={metaProperties}
                extraActions={extraActions}
                accountUsers={accountUsers}
                accountUsersIsLoading={accountUsersIsLoading}
                profile={profile}
                publicAccount={publicAccount}
                clusters={clusters}
                dialogs={dialogs}
                templates={templates}
                onUpdate={onUpdate}
                onSave={onSave}
                onNameUpdate={onNameUpdate}
                onUpdateTags={onUpdateTags}
                onUnitAdd={onUnitAdd}
                onUnitAddSubworkflowFromConfig={onUnitAddSubworkflowFromConfig}
                onUnitRemove={onUnitRemove}
                onUnitUpdate={onUnitUpdate}
                onSubworkflowUnitUpdate={onSubworkflowUnitUpdate}
                onRender={renderWorkflow}
                workflowRenderGeneration={renderGeneration}
                isDescriptionEditable={isDescriptionEditable}
            />
        </WorkflowComponentsContext.Provider>
    );
}
