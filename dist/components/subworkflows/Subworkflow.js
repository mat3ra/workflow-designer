import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable no-param-reassign -- Wode unit helpers mutate; class built only for those APIs */
import Accordion from "@exabyte-io/cove.js/dist/mui/components/accordion/Accordion";
const AccordionComponent = Accordion;
import { Application } from "@mat3ra/ade";
import { safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import { ApplicationModelStandata, ModelStandata } from "@mat3ra/standata";
import { UnitFactory, } from "@mat3ra/wode";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useCallback, useMemo, useState } from "react";
import { ImportantSettings } from "./ImportantSettings";
import { Properties } from "@mat3ra/wove";
import { SubworkflowExecutionUnitDetailsRow } from "./SubworkflowExecutionUnitDetailsRow";
import { SubworkflowMethodPanel } from "./SubworkflowMethodPanel";
import WorkflowCompute from "./WorkflowCompute";
import UnitModal from "../units/UnitModal";
import { Application as ApplicationAve } from "@mat3ra/ave";
import TabsMenu from "@exabyte-io/cove.js/dist/mui/components/tabs/TabsMenu";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { Model } from "@mat3ra/move";
import { UnitsFlowchartContainer } from "@mat3ra/wove";
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
};
export function Subworkflow({ subworkflow, onUpdate, isStandalone = false, editable = true, adjustable = false, metaProperties = [], onOutputUpdateRequest, isMethodDataLoading = false, accountUsers, accountUsersIsLoading, currentUser, clusters = [], materials = [], materialsIndex, onMaterialSwitch, profile, publicAccount, createMetaProperty, pseudoUploadReduxDialog, unitTypeReduxDialog, className, jobProperties, activeTabIndex, onActiveTabIndexChange, }) {
    var _a, _b, _c;
    const { getDefaultComputeConfig } = useWorkflowComponents();
    const [unitIndex, setUnitIndex] = useState(0);
    const applyToSubworkflow = useCallback((fn) => {
        fn(subworkflow);
        onUpdate(subworkflow.toJSON());
    }, [subworkflow, onUpdate]);
    const onChildSubworkflowInstanceUpdate = useCallback((sw) => {
        onUpdate(sw.toJSON());
    }, [onUpdate]);
    /**
     * Important settings call `unit.savePersistentContext()` on `unitsInstances` only. Sync into
     * serialized `units` before `onUpdate()` — otherwise job Redux loses edited `context`.
     * Parent `onSubworkflowUnitUpdate` → root render callback (`Job.renderJob` / `WorkflowDesignerContainer.renderWorkflow`).
     */
    const onImportantSettingsContextChanged = useCallback(() => {
        subworkflow.units = subworkflow.unitsInstances.map((unit) => unit.toJSON());
        onUpdate(subworkflow.toJSON());
    }, [subworkflow, onUpdate]);
    const onComputeUpdate = useCallback((compute) => {
        applyToSubworkflow((sw) => {
            sw.setCompute(compute);
        });
    }, [applyToSubworkflow]);
    const onComputeToggle = useCallback((checked) => {
        applyToSubworkflow((sw) => {
            if (checked) {
                sw.setCompute(getDefaultComputeConfig());
            }
            else {
                sw.unsetCompute();
            }
        });
    }, [applyToSubworkflow]);
    const onApplicationUpdate = useCallback((application) => {
        applyToSubworkflow((sw) => {
            sw.setApplication(new Application(application));
        });
    }, [applyToSubworkflow]);
    const onModelUpdate = useCallback((model) => {
        applyToSubworkflow((sw) => {
            sw.setModel(model);
        });
    }, [applyToSubworkflow]);
    const onUnitAdd = useCallback((type, prepend, index) => {
        applyToSubworkflow((sw) => {
            const unit = type === "execution"
                ? UnitFactory.createDefaultSubworkflowUnit(type, sw.application)
                : UnitFactory.createDefaultSubworkflowUnit(type);
            const insertIndex = (index === undefined ? -1 : index) + (prepend ? 0 : 1);
            sw.addUnit(unit, insertIndex);
        });
    }, [applyToSubworkflow]);
    const onUnitRemove = useCallback((flowchartId) => {
        applyToSubworkflow((sw) => {
            sw.removeUnit(flowchartId);
        });
    }, [applyToSubworkflow]);
    const onUnitClone = useCallback((unit, index) => {
        const { flowchartId: _omitFlowchartId, next: _omitNext, head: _omitHead, ...config } = unit;
        applyToSubworkflow((sw) => {
            sw.addUnit(UnitFactory.createInSubworkflow(config), index);
        });
    }, [applyToSubworkflow]);
    const onUnitUpdate = useCallback((unit) => {
        applyToSubworkflow((sw) => {
            const { flowchartId } = unit;
            const idx = sw.unitIndex(flowchartId);
            const newUnit = UnitFactory.createInSubworkflow(unit);
            sw.replaceUnit(idx, newUnit);
        });
    }, [applyToSubworkflow]);
    const onUnitResultsChanged = useCallback((flowchartId, results) => {
        applyToSubworkflow((sw) => {
            const unit = sw.getUnit(flowchartId);
            if (!unit)
                return;
            unit.results = results.map(safeMakeObject);
        });
    }, [applyToSubworkflow]);
    const onUnitIsDraftChanged = useCallback((flowchartId, isDraft) => {
        applyToSubworkflow((sw) => {
            const unit = sw.getUnit(flowchartId);
            if (!unit)
                return;
            unit.setProp("isDraft", isDraft);
        });
    }, [applyToSubworkflow]);
    const onUnitMonitorChanged = useCallback((flowchartId, monitor, enabled) => {
        applyToSubworkflow((sw) => {
            const unit = sw.getUnit(flowchartId);
            if (!unit)
                return;
            unit.toggleMonitor(safeMakeObject(monitor), enabled);
        });
    }, [applyToSubworkflow]);
    const onUnitPostProcessorChanged = useCallback((flowchartId, postProcessor, enabled) => {
        applyToSubworkflow((sw) => {
            const unit = sw.getUnit(flowchartId);
            if (!unit)
                return;
            unit.togglePostProcessor(safeMakeObject(postProcessor), enabled);
        });
    }, [applyToSubworkflow]);
    const onUnitSelect = useCallback((unit) => {
        const index = subworkflow.units.findIndex((u) => u.flowchartId === unit.flowchartId);
        if (index > -1) {
            setUnitIndex((prev) => (index !== prev ? index : prev));
        }
    }, [subworkflow.units]);
    const setTabIndex = useCallback((index) => {
        onActiveTabIndexChange(index);
    }, [onActiveTabIndexChange]);
    const categorizedModelList = new ModelStandata().getAll();
    const filteredModels = new ApplicationModelStandata().findByApplicationParameters({
        modelList: categorizedModelList,
        name: (_a = subworkflow.application) === null || _a === void 0 ? void 0 : _a.name,
        version: (_b = subworkflow.application) === null || _b === void 0 ? void 0 : _b.version,
        build: (_c = subworkflow.application) === null || _c === void 0 ? void 0 : _c.build,
    });
    const tabs = useMemo(() => Object.values(TAB_NAVIGATION_CONFIG).map((tab, index) => ({
        ...tab,
        href: undefined,
        onClick: (event) => {
            event.preventDefault();
            setTabIndex(index);
        },
    })), [setTabIndex]);
    return (_jsxs(Stack, { "data-tid": "subworkflow", height: "100%", className: className, children: [_jsx(TabsMenu, { tabs: tabs, activeTabIndex: activeTabIndex, sx: { fontSize: 12, height: "100%" } }), _jsxs(TabContext, { value: `${activeTabIndex}`, children: [_jsx(TabPanel, { value: "0", id: TAB_NAVIGATION_CONFIG.overview.href, sx: { height: "100%" }, children: _jsxs(Stack, { spacing: 3, height: "100%", children: [_jsx(AccordionComponent, { header: "Details", id: "subworkflow-accordion", sx: { pt: 0 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(Properties, { subworkflow: subworkflow, onUpdate: onUpdate, editable: editable || adjustable }), _jsx(ApplicationAve, { application: subworkflow.application, onApplicationUpdate: onApplicationUpdate, editable: editable }), subworkflow.modelInstance.isUnknown ? null : (_jsx(Model, { id: "model", model: subworkflow.modelInstance, models: filteredModels, application: subworkflow.application, onUpdate: onModelUpdate, editable: editable })), _jsx(SubworkflowMethodPanel, { subworkflow: subworkflow, editable: editable, adjustable: adjustable, isMethodDataLoading: isMethodDataLoading, isStandalone: isStandalone, materials: materials, profile: profile, onUpdate: onChildSubworkflowInstanceUpdate, pseudoUploadReduxDialog: pseudoUploadReduxDialog, metaProperties: metaProperties, createMetaProperty: createMetaProperty })] }) }), _jsx(UnitsFlowchartContainer, { units: subworkflow.unitsInstances, onUnitAdd: onUnitAdd, isStandalone: isStandalone, editable: editable, adjustable: adjustable, onUnitClone: onUnitClone, onUnitRemove: onUnitRemove, onUnitUpdate: onUnitUpdate, materials: materials, materialsIndex: materialsIndex, onMaterialSwitch: onMaterialSwitch, subworkflow: subworkflow, onOutputUpdateRequest: onOutputUpdateRequest, publicAccount: publicAccount, unitIndex: unitIndex, onUnitSelect: onUnitSelect, unitTypeReduxDialog: unitTypeReduxDialog, jobProperties: jobProperties, UnitModalComponent: UnitModal })] }) }), _jsx(TabPanel, { value: "1", id: TAB_NAVIGATION_CONFIG.importantSettings.href, "data-tab-name": TAB_NAVIGATION_CONFIG.importantSettings.itemName, children: _jsx(ImportantSettings, { id: TAB_NAVIGATION_CONFIG.importantSettings.href, subworkflow: subworkflow, onContextChanged: onImportantSettingsContextChanged }) }), _jsx(TabPanel, { value: "2", children: _jsx(Grid, { container: true, spacing: 2, children: subworkflow.unitsInstances.map((unit, index) => (_jsx(SubworkflowExecutionUnitDetailsRow, { unit: unit, index: index, editable: editable, onUnitResultsChanged: onUnitResultsChanged, onUnitIsDraftChanged: onUnitIsDraftChanged, onUnitMonitorChanged: onUnitMonitorChanged, onUnitPostProcessorChanged: onUnitPostProcessorChanged }, unit.flowchartId))) }) }), _jsx(TabPanel, { value: "3", children: _jsx(WorkflowCompute, { compute: subworkflow.compute, onUpdate: onComputeUpdate, onToggle: onComputeToggle, showAdvancedOptions: new Application(subworkflow.application).hasAdvancedComputeOptions, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, currentUser: currentUser !== null && currentUser !== void 0 ? currentUser : profile.user.entity, clusters: clusters }) })] })] }));
}
