/* eslint-disable no-param-reassign -- Wode unit helpers mutate; class built only for those APIs */
import Accordion from "@exabyte-io/cove.js/dist/mui/components/accordion/Accordion";
const AccordionComponent = Accordion as any;
import { Application } from "@mat3ra/ade";
import { type NameResultSchema, safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import type { ApplicationSchema, SubworkflowSchema } from "@mat3ra/esse/dist/js/types";
import type { Model as ModeModel } from "@mat3ra/mode";
import { ApplicationModelStandata, ModelStandata } from "@mat3ra/standata";
import {
    type DefaultSubworkflowUnitType,
    type OrderedMaterial,
    Subworkflow as WodeSubworkflow,
    UnitFactory,
} from "@mat3ra/wode";
import type { AnySubworkflowUnitSchema } from "@mat3ra/wode/dist/js/units/factory";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import React, { useCallback, useMemo, useState } from "react";

import { ImportantSettings } from "./ImportantSettings";
import { Properties } from "@mat3ra/wove";
import { SubworkflowExecutionUnitDetailsRow } from "./SubworkflowExecutionUnitDetailsRow";
import { SubworkflowMethodPanel } from "./SubworkflowMethodPanel";
import WorkflowCompute from "./WorkflowCompute";
import UnitModal from "../units/UnitModal";

import { Application as ApplicationAve } from "@mat3ra/ave";
import TabsMenu from "@exabyte-io/cove.js/dist/mui/components/tabs/TabsMenu";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import type {
    WorkflowDesignerAccount,
    WorkflowDesignerCluster,
    WorkflowDesignerCoreUser,
    WorkflowDesignerCreateMetaPropertyConfig,
    WorkflowDesignerDialogState,
    WorkflowDesignerMetaProperty,
    WorkflowDesignerMetaPropertySchema,
    WorkflowDesignerProfile,
    WorkflowDesignerProperty,
    WorkflowDesignerTabItem,
    WorkflowDesignerUser,
} from "../../types/context";
import { Model } from "@mat3ra/move";
import { UnitsFlowchartContainer } from "@mat3ra/wove";

export type SubworkflowProps = {
    subworkflow: WodeSubworkflow;
    onUpdate: (subworkflow: SubworkflowSchema) => void;
    isStandalone?: boolean;
    editable?: boolean;
    adjustable?: boolean;
    metaProperties?: WorkflowDesignerMetaProperty[];
    onOutputUpdateRequest?: (...args: unknown[]) => void;
    isMethodDataLoading?: boolean;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    currentUser?: WorkflowDesignerCoreUser;
    clusters?: WorkflowDesignerCluster[];
    materials?: OrderedMaterial[];
    materialsIndex?: number;
    onMaterialSwitch?: (...args: unknown[]) => void;
    profile: WorkflowDesignerProfile;
    publicAccount: WorkflowDesignerAccount;
    createMetaProperty: (
        property: WorkflowDesignerCreateMetaPropertyConfig,
    ) => Promise<WorkflowDesignerMetaPropertySchema | undefined>;
    pseudoUploadReduxDialog: WorkflowDesignerDialogState;
    unitTypeReduxDialog: WorkflowDesignerDialogState;
    className?: string;
    jobProperties?: WorkflowDesignerProperty[];
    activeTabIndex: number;
    onActiveTabIndexChange: (tabIndex: number) => void;
};

export const TAB_NAVIGATION_CONFIG = {
    overview: {
        itemName: "Overview",
        className: "",
        href: "sw-overview",
    },
    importantSettings: {
        itemName: "Important settings",
        className: "",
        href: "sw-important-settings",
    },
    detailedView: {
        itemName: "Detailed view",
        className: "",
        href: "sw-detailed-view",
    },
    compute: {
        itemName: "Compute",
        className: "",
        href: "sw-compute",
    },
} as const;

export function Subworkflow({
    subworkflow,
    onUpdate,
    isStandalone = false,
    editable = true,
    adjustable = false,
    metaProperties = [],
    onOutputUpdateRequest,
    isMethodDataLoading = false,
    accountUsers,
    accountUsersIsLoading,
    currentUser,
    clusters = [],
    materials = [],
    materialsIndex,
    onMaterialSwitch,
    profile,
    publicAccount,
    createMetaProperty,
    pseudoUploadReduxDialog,
    unitTypeReduxDialog,
    className,
    jobProperties,
    activeTabIndex,
    onActiveTabIndexChange,
}: SubworkflowProps) {
    const { getDefaultComputeConfig } = useWorkflowComponents();
    const [unitIndex, setUnitIndex] = useState(0);

    const applyToSubworkflow = useCallback(
        (fn: (sw: WodeSubworkflow) => void) => {
            fn(subworkflow);
            onUpdate(subworkflow.toJSON());
        },
        [subworkflow, onUpdate],
    );

    const onChildSubworkflowInstanceUpdate = useCallback(
        (sw: WodeSubworkflow) => {
            onUpdate(sw.toJSON());
        },
        [onUpdate],
    );

    /**
     * Important settings call `unit.savePersistentContext()` on `unitsInstances` only. Sync into
     * serialized `units` before `onUpdate()` — otherwise job Redux loses edited `context`.
     * Parent `onSubworkflowUnitUpdate` → root render callback (`Job.renderJob` / `WorkflowDesignerContainer.renderWorkflow`).
     */
    const onImportantSettingsContextChanged = useCallback(() => {
        subworkflow.units = subworkflow.unitsInstances.map((unit) => unit.toJSON());
        onUpdate(subworkflow.toJSON());
    }, [subworkflow, onUpdate]);

    const onComputeUpdate = useCallback(
        (compute: unknown) => {
            applyToSubworkflow((sw) => {
                sw.setCompute(compute);
            });
        },
        [applyToSubworkflow],
    );

    const onComputeToggle = useCallback(
        (checked: boolean) => {
            applyToSubworkflow((sw) => {
                if (checked) {
                    sw.setCompute(getDefaultComputeConfig());
                } else {
                    sw.unsetCompute();
                }
            });
        },
        [applyToSubworkflow],
    );

    const onApplicationUpdate = useCallback(
        (application: ApplicationSchema) => {
            applyToSubworkflow((sw) => {
                sw.setApplication(new Application(application));
            });
        },
        [applyToSubworkflow],
    );

    const onModelUpdate = useCallback(
        (model: ModeModel) => {
            applyToSubworkflow((sw) => {
                sw.setModel(model);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitAdd = useCallback(
        (type: DefaultSubworkflowUnitType, prepend: boolean, index?: number) => {
            applyToSubworkflow((sw) => {
                const unit =
                    type === "execution"
                        ? UnitFactory.createDefaultSubworkflowUnit(type, sw.application)
                        : UnitFactory.createDefaultSubworkflowUnit(type as any);
                const insertIndex = (index === undefined ? -1 : index) + (prepend ? 0 : 1);
                sw.addUnit(unit, insertIndex);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitRemove = useCallback(
        (flowchartId: string) => {
            applyToSubworkflow((sw) => {
                sw.removeUnit(flowchartId);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitClone = useCallback(
        (unit: AnySubworkflowUnitSchema, index: number) => {
            const {
                flowchartId: _omitFlowchartId,
                next: _omitNext,
                head: _omitHead,
                ...config
            } = unit;

            applyToSubworkflow((sw) => {
                sw.addUnit(UnitFactory.createInSubworkflow(config), index);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitUpdate = useCallback(
        (unit: AnySubworkflowUnitSchema) => {
            applyToSubworkflow((sw) => {
                const { flowchartId } = unit;
                const idx = sw.unitIndex(flowchartId);
                const newUnit = UnitFactory.createInSubworkflow(unit);
                sw.replaceUnit(idx, newUnit);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitResultsChanged = useCallback(
        (flowchartId: string, results: NameResultSchema[]) => {
            applyToSubworkflow((sw) => {
                const unit = sw.getUnit(flowchartId);
                if (!unit) return;
                unit.results = results.map(safeMakeObject);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitIsDraftChanged = useCallback(
        (flowchartId: string, isDraft: boolean) => {
            applyToSubworkflow((sw) => {
                const unit = sw.getUnit(flowchartId);
                if (!unit) return;
                unit.setProp("isDraft", isDraft);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitMonitorChanged = useCallback(
        (flowchartId: string, monitor: string, enabled: boolean) => {
            applyToSubworkflow((sw) => {
                const unit = sw.getUnit(flowchartId);
                if (!unit) return;
                unit.toggleMonitor(safeMakeObject(monitor), enabled);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitPostProcessorChanged = useCallback(
        (flowchartId: string, postProcessor: string, enabled: boolean) => {
            applyToSubworkflow((sw) => {
                const unit = sw.getUnit(flowchartId);
                if (!unit) return;
                unit.togglePostProcessor(safeMakeObject(postProcessor), enabled);
            });
        },
        [applyToSubworkflow],
    );

    const onUnitSelect = useCallback(
        (unit: { flowchartId: string }) => {
            const index = subworkflow.units.findIndex((u) => u.flowchartId === unit.flowchartId);
            if (index > -1) {
                setUnitIndex((prev) => (index !== prev ? index : prev));
            }
        },
        [subworkflow.units],
    );

    const setTabIndex = useCallback(
        (index: number) => {
            onActiveTabIndexChange(index);
        },
        [onActiveTabIndexChange],
    );

    const categorizedModelList = new ModelStandata().getAll();
    const filteredModels = new ApplicationModelStandata().findByApplicationParameters({
        modelList: categorizedModelList,
        name: subworkflow.application?.name,
        version: subworkflow.application?.version,
        build: subworkflow.application?.build,
    });

    const tabs: WorkflowDesignerTabItem[] = useMemo(
        () =>
            Object.values(TAB_NAVIGATION_CONFIG).map((tab, index) => ({
                ...tab,
                href: undefined,
                onClick: (event) => {
                    event.preventDefault();
                    setTabIndex(index);
                },
            })),
        [setTabIndex],
    );

    return (
        <Stack data-tid="subworkflow" height="100%" className={className}>
            <TabsMenu
                tabs={tabs}
                activeTabIndex={activeTabIndex}
                sx={{ fontSize: 12, height: "100%" }}
            />
            <TabContext value={`${activeTabIndex}`}>
                <TabPanel
                    value="0"
                    id={TAB_NAVIGATION_CONFIG.overview.href}
                    sx={{ height: "100%" }}>
                    <Stack spacing={3} height="100%">
                        <AccordionComponent header="Details" id="subworkflow-accordion" sx={{ pt: 0 }}>
                            <Stack spacing={2}>
                                <Properties
                                    subworkflow={subworkflow}
                                    onUpdate={onUpdate}
                                    editable={editable || adjustable}
                                />
                                <ApplicationAve
                                    application={subworkflow.application}
                                    onApplicationUpdate={onApplicationUpdate}
                                    editable={editable}
                                />
                                {subworkflow.modelInstance.isUnknown ? null : (
                                    <Model
                                        id="model"
                                        model={subworkflow.modelInstance}
                                        models={filteredModels}
                                        application={subworkflow.application}
                                        onUpdate={onModelUpdate}
                                        editable={editable}
                                    />
                                )}
                                <SubworkflowMethodPanel
                                    subworkflow={subworkflow}
                                    editable={editable}
                                    adjustable={adjustable}
                                    isMethodDataLoading={isMethodDataLoading}
                                    isStandalone={isStandalone}
                                    materials={materials}
                                    profile={profile}
                                    onUpdate={onChildSubworkflowInstanceUpdate}
                                    pseudoUploadReduxDialog={pseudoUploadReduxDialog}
                                    metaProperties={metaProperties}
                                    createMetaProperty={createMetaProperty}
                                />
                            </Stack>
                        </AccordionComponent>
                         <UnitsFlowchartContainer
                            units={subworkflow.unitsInstances}
                            onUnitAdd={onUnitAdd}
                            isStandalone={isStandalone}
                            editable={editable}
                            adjustable={adjustable}
                            onUnitClone={onUnitClone}
                            onUnitRemove={onUnitRemove}
                            onUnitUpdate={onUnitUpdate}
                            materials={materials}
                            materialsIndex={materialsIndex}
                            onMaterialSwitch={onMaterialSwitch}
                            subworkflow={subworkflow}
                            onOutputUpdateRequest={onOutputUpdateRequest}
                            publicAccount={publicAccount}
                            unitIndex={unitIndex}
                            onUnitSelect={onUnitSelect}
                            unitTypeReduxDialog={unitTypeReduxDialog}
                            jobProperties={jobProperties}
                            UnitModalComponent={UnitModal}
                        />
                    </Stack>
                </TabPanel>
                <TabPanel
                    value="1"
                    id={TAB_NAVIGATION_CONFIG.importantSettings.href}
                    data-tab-name={TAB_NAVIGATION_CONFIG.importantSettings.itemName}>
                    <ImportantSettings
                        id={TAB_NAVIGATION_CONFIG.importantSettings.href}
                        subworkflow={subworkflow}
                        onContextChanged={onImportantSettingsContextChanged}
                    />
                </TabPanel>
                <TabPanel value="2">
                    <Grid container spacing={2}>
                        {subworkflow.unitsInstances.map((unit, index) => (
                            <SubworkflowExecutionUnitDetailsRow
                                key={unit.flowchartId}
                                unit={unit}
                                index={index}
                                editable={editable}
                                onUnitResultsChanged={onUnitResultsChanged}
                                onUnitIsDraftChanged={onUnitIsDraftChanged}
                                onUnitMonitorChanged={onUnitMonitorChanged}
                                onUnitPostProcessorChanged={onUnitPostProcessorChanged}
                            />
                        ))}
                    </Grid>
                </TabPanel>
                <TabPanel value="3">
                    <WorkflowCompute
                        compute={subworkflow.compute}
                        onUpdate={onComputeUpdate}
                        onToggle={onComputeToggle}
                        showAdvancedOptions={
                            new Application(subworkflow.application).hasAdvancedComputeOptions
                        }
                        accountUsers={accountUsers}
                        accountUsersIsLoading={accountUsersIsLoading}
                        currentUser={currentUser ?? profile.user.entity}
                        clusters={clusters}
                    />
                </TabPanel>
            </TabContext>
        </Stack>
    );
}
