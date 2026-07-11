import TabsMenu from "@exabyte-io/cove.js/dist/mui/components/tabs/TabsMenu";
import type { Template } from "@mat3ra/ade";
import type { SubworkflowSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial, type Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnyWorkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

import type {
    WorkflowDesignerAccount,
    WorkflowDesignerCluster,
    WorkflowDesignerCoreUser,
    WorkflowDesignerMetaProperty,
    WorkflowDesignerProfile,
    WorkflowDesignerTabItem,
    WorkflowDesignerUser,
} from "../../types/context";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import WorkflowCompute from "../subworkflows/WorkflowCompute";
import MapDataForm from "./MapDataForm";
import type { WorkflowProps } from "./Workflow";
import { Workflow } from "./Workflow";

type MapScopeOption = {
    subworkflowName: string;
    unitName: string;
    unitFlowchartId: string;
};

export type MapUnitInput = {
    values: unknown[] | string;
    useValues?: boolean;
    [key: string]: unknown;
};

/** Serialized map unit config passed to `onUpdate`. */
export type MapUnitSerialized = {
    map: { input: MapUnitInput };
    [key: string]: unknown;
};

export type MapUnitModel = {
    flowchartId: string;
    statusCls?: string;
    input: MapUnitInput;
    toJSON: () => MapUnitSerialized;
};

export type MapProps = {
    unit: MapUnitModel;
    workflow: WodeWorkflow;
    /** Passed through from `Workflow` for API parity; not read by this component. */
    // eslint-disable-next-line react/no-unused-prop-types -- reserved for future / parent context
    parentWorkflow?: WodeWorkflow;
    onUpdate: (config: MapUnitSerialized) => void;
    onWorkflowUpdate: (workflow: WodeWorkflow) => void;
    editable?: boolean;
    adjustable?: boolean;
    materials?: OrderedMaterial[];
    onMaterialSwitch?: (...args: unknown[]) => void;
    onOutputUpdateRequest?: (...args: unknown[]) => void;
    dialogs: WorkflowProps["dialogs"];
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    currentUser: WorkflowDesignerCoreUser;
    clusters: WorkflowDesignerCluster[];
    templates: Template[];
    isLoading?: boolean;
    isDescriptionEditable: boolean;
    metaProperties?: WorkflowDesignerMetaProperty[];
};

const workflowRenderNoop = (): undefined => undefined;

const emptyTabShell: Pick<WorkflowDesignerTabItem, "className" | "iconCls"> = {
    className: "",
    iconCls: "",
};

function MapWorkflowDesigner(props: MapProps) {
    const {
        unit,
        workflow: workflowProp,
        onUpdate,
        onWorkflowUpdate,
        editable = true,
        adjustable = false,
        materials,
        onMaterialSwitch,
        onOutputUpdateRequest,
        dialogs,
        profile,
        publicAccount,
        accountUsers,
        accountUsersIsLoading,
        currentUser,
        clusters,
        templates,
        isLoading,
        isDescriptionEditable,
        metaProperties,
    } = props;
    const { getDefaultComputeConfig } = useWorkflowComponents();
    const [entity, setEntity] = useState<WodeWorkflow>(() => workflowProp);
    const [repetition, setRepetition] = useState(0);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    useEffect(() => {
        setEntity(workflowProp);
    }, [workflowProp]);

    const resetEntityAndNotify = useCallback(
        (next: WodeWorkflow) => {
            setEntity(next);
            onWorkflowUpdate(next);
        },
        [onWorkflowUpdate],
    );

    const onComputeUpdate = useCallback(
        (compute: unknown) => {
            (entity as any).setCompute(compute);
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onComputeToggle = useCallback(
        (checked: boolean) => {
            if (checked) {
                (entity as any).setCompute(getDefaultComputeConfig());
            } else {
                (entity as any).unsetCompute();
            }
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onWorkflowUpdateLocal = useCallback(
        (workflow: WodeWorkflow) => {
            resetEntityAndNotify(workflow);
        },
        [resetEntityAndNotify],
    );

    const onUnitAdd = useCallback(
        (unitType: UnitType) => {
            entity.addUnitType(unitType);
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onUnitRemove = useCallback(
        (flowchartId?: string) => {
            if (flowchartId === undefined) return;
            entity.removeUnit(flowchartId);
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onUnitUpdate = useCallback(
        (unit: AnyWorkflowUnit) => {
            if (unit.type === UnitType.subworkflow) {
                entity.subworkflowInstances.find((sw) => sw.id === unit.id)?.setName(unit.name);
            }
            const unitIndex = entity.unitInstances.findIndex(
                (x) => x.flowchartId === unit.flowchartId,
            );
            if (unitIndex >= 0) {
                const nextUnits = [...entity.unitInstances];
                nextUnits[unitIndex] = unit;
                entity.setUnits(nextUnits);
            }
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onSubworkflowUnitUpdate = useCallback(
        (subworkflowSchema: SubworkflowSchema) => {
            const subworkflowIndex = entity.subworkflowInstances.findIndex(
                (sw) => sw.id === subworkflowSchema._id,
            );
            if (subworkflowIndex < 0) {
                return;
            }
            entity.subworkflows[subworkflowIndex] = subworkflowSchema;
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onNameUpdate = useCallback(
        (name: string) => {
            entity.setName(name);
            resetEntityAndNotify(entity);
        },
        [entity, resetEntityAndNotify],
    );

    const onHeaderPagerUpdate = useCallback((index: number) => {
        setRepetition(index);
    }, []);

    const onMapDataUpdate = useCallback(
        (mapData: MapUnitInput) => {
            const config = unit.toJSON();
            config.map.input = mapData;
            onUpdate(config);
        },
        [unit, onUpdate],
    );

    const mapValues = unit.input.values;
    const mapValuesLength =
        typeof mapValues === "string" || Array.isArray(mapValues) ? mapValues.length : 0;

    useLayoutEffect(() => {
        entity.setRepetition(repetition);
    }, [entity, repetition]);

    useLayoutEffect(() => {
        entity.setTotalRepetitions(mapValuesLength);
    }, [entity, mapValuesLength]);

    const mapDataForForm = useMemo(() => {
        const next: MapUnitInput = { ...unit.input };
        if (typeof next.values !== "string") {
            next.values = JSON.stringify(next.values, null, 4);
        }
        return next;
    }, [unit]);

    // Mirrors legacy Workflow.getMapScopeOptions: index map unit in `units`, then take
    // `subworkflows.slice(0, thatIndex)` and flatten each subworkflow's inner units.
    const scopeOptions = useMemo((): MapScopeOption[] => {
        const mapUnitIndex = entity.unitInstances.findIndex(
            (u) => u.flowchartId === unit.flowchartId,
        );
        if (mapUnitIndex < 0) {
            return [];
        }
        const options: MapScopeOption[] = [];
        entity.subworkflowInstances.slice(0, mapUnitIndex).forEach((sw) => {
            sw.unitsInstances.forEach((su) => {
                options.push({
                    subworkflowName: sw.name,
                    unitName: su.name,
                    unitFlowchartId: su.flowchartId,
                });
            });
        });
        return options;
    }, [entity, unit.flowchartId]);

    const tabs: WorkflowDesignerTabItem[] = useMemo(
        () => [
            {
                ...emptyTabShell,
                itemName: "Workflow",
                href: undefined,
                onClick: () => setActiveTabIndex(0),
            },
            {
                ...emptyTabShell,
                itemName: "Data",
                href: undefined,
                onClick: () => setActiveTabIndex(1),
            },
            {
                ...emptyTabShell,
                itemName: "Compute",
                href: undefined,
                onClick: () => setActiveTabIndex(2),
            },
        ],
        [],
    );

    const tabContextValue = String(activeTabIndex);

    return (
        <div>
            <TabsMenu tabs={tabs} activeTabIndex={activeTabIndex} />
            <TabContext value={tabContextValue}>
                <TabPanel value="0" sx={{ p: 0, pt: 2 }} id="map-workflow">
                    <Workflow
                        isMap
                        isHeaderCompact
                        workflow={entity}
                        publicAccount={publicAccount}
                        profile={profile}
                        showHeader
                        showMetadata={false}
                        editable={editable}
                        adjustable={adjustable}
                        materials={materials}
                        onMaterialSwitch={onMaterialSwitch}
                        onUpdate={onWorkflowUpdateLocal}
                        isLoading={isLoading}
                        dialogs={dialogs}
                        accountUsers={accountUsers}
                        accountUsersIsLoading={accountUsersIsLoading}
                        iconCls={`text-${unit.statusCls ?? ""}`}
                        onUnitAdd={onUnitAdd}
                        onUnitRemove={onUnitRemove}
                        onUnitUpdate={onUnitUpdate}
                        onSubworkflowUnitUpdate={onSubworkflowUnitUpdate}
                        onNameUpdate={onNameUpdate}
                        showHeaderPager={!editable}
                        onHeaderPagerUpdate={onHeaderPagerUpdate}
                        onOutputUpdateRequest={onOutputUpdateRequest}
                        templates={templates}
                        onRender={workflowRenderNoop}
                        isDescriptionEditable={isDescriptionEditable}
                        metaProperties={metaProperties}
                    />
                </TabPanel>
                <TabPanel value="1" sx={{ p: 0, pt: 2 }} id="map-data">
                    <MapDataForm
                        onUpdate={onMapDataUpdate}
                        mapData={mapDataForForm}
                        scopeOptions={scopeOptions}
                    />
                </TabPanel>
                <TabPanel value="2" sx={{ p: 0, pt: 2 }} id="map-compute">
                    <WorkflowCompute
                        compute={workflowProp.compute as object | null | undefined}
                        onUpdate={onComputeUpdate}
                        onToggle={onComputeToggle}
                        accountUsers={accountUsers}
                        accountUsersIsLoading={accountUsersIsLoading}
                        currentUser={currentUser}
                        clusters={clusters}
                    />
                </TabPanel>
            </TabContext>
        </div>
    );
}

export default MapWorkflowDesigner;
export { MapWorkflowDesigner };
