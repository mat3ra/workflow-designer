import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable no-param-reassign -- Wode unit helpers mutate; class built only for those APIs */
import Accordion from "@mat3ra/cove/dist/mui/components/accordion/Accordion";
import TabsMenu from "@mat3ra/cove/dist/mui/components/tabs/TabsMenu";
import { Application } from "@mat3ra/ade";
import { Application as ApplicationAve } from "@mat3ra/ave";
import { safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import { Model } from "@mat3ra/move";
import { ApplicationModelStandata, ModelStandata } from "@mat3ra/standata";
import { UnitFactory, } from "@mat3ra/wode";
import { Properties, UnitsFlowchartContainer } from "@mat3ra/wove";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useCallback, useMemo, useState } from "react";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { UndoSnackbar } from "../common/UndoSnackbar";
import UnitModal from "../units/UnitModal";
import UnitInspectorDrawer from "./UnitInspectorDrawer";
import { ImportantSettings } from "./ImportantSettings";
import { SubworkflowExecutionUnitDetailsRow } from "./SubworkflowExecutionUnitDetailsRow";
import { SubworkflowMethodPanel } from "./SubworkflowMethodPanel";
import WorkflowCompute from "./WorkflowCompute";
const AccordionComponent = Accordion;
export const TAB_NAVIGATION_CONFIG = {
    overview: {
        itemName: "Units",
        className: "",
        href: "sw-overview",
    },
    importantSettings: {
        itemName: "Settings",
        className: "",
        href: "sw-important-settings",
    },
    detailedView: {
        itemName: "Outputs",
        className: "",
        href: "sw-detailed-view",
    },
    compute: {
        itemName: "Compute",
        className: "",
        href: "sw-compute",
    },
};
const COMPUTE_TAB_NAME = TAB_NAVIGATION_CONFIG.compute.itemName;
/** Compute is the last tab, which is what lets it be dropped without renumbering the rest. */
const COMPUTE_TAB_INDEX = Object.keys(TAB_NAVIGATION_CONFIG).indexOf("compute");
export function Subworkflow({ subworkflow, onUpdate, isStandalone = false, editable = true, adjustable = false, metaProperties = [], onOutputUpdateRequest, isMethodDataLoading = false, accountUsers, accountUsersIsLoading, currentUser, clusters = [], materials = [], materialsIndex, onMaterialSwitch, profile, publicAccount, createMetaProperty, pseudoUploadReduxDialog, unitTypeReduxDialog, className, jobProperties, activeTabIndex, onActiveTabIndexChange, useUnitInspector = false, hideComputeSubTab = false, }) {
    var _a, _b, _c, _d;
    const { getDefaultComputeConfig } = useWorkflowComponents();
    const [unitIndex, setUnitIndex] = useState(0);
    const [removeUndoState, setRemoveUndoState] = useState(null);
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
        var _a;
        const removedUnit = subworkflow.getUnit(flowchartId);
        const snapshot = subworkflow.toJSON();
        applyToSubworkflow((sw) => {
            sw.removeUnit(flowchartId);
        });
        setRemoveUndoState({
            message: `Removed unit "${(_a = removedUnit === null || removedUnit === void 0 ? void 0 : removedUnit.name) !== null && _a !== void 0 ? _a : flowchartId}"`,
            onUndo: () => onUpdate(snapshot),
        });
    }, [applyToSubworkflow, subworkflow, onUpdate]);
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
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const onUnitSelect = useCallback((unit) => {
        const index = subworkflow.units.findIndex((u) => u.flowchartId === unit.flowchartId);
        if (index > -1) {
            setUnitIndex((prev) => (index !== prev ? index : prev));
            if (useUnitInspector)
                setIsInspectorOpen(true);
        }
    }, [subworkflow.units, useUnitInspector]);
    // The selected index survives units being added or removed; the drawer must
    // not go on showing settings for a unit that is no longer there.
    const inspectedUnit = isInspectorOpen && useUnitInspector ? (_a = subworkflow.unitsInstances[unitIndex]) !== null && _a !== void 0 ? _a : null : null;
    const setTabIndex = useCallback((index) => {
        onActiveTabIndexChange(index);
    }, [onActiveTabIndexChange]);
    const categorizedModelList = new ModelStandata().getAll();
    const filteredModels = new ApplicationModelStandata().findByApplicationParameters({
        modelList: categorizedModelList,
        name: (_b = subworkflow.application) === null || _b === void 0 ? void 0 : _b.name,
        version: (_c = subworkflow.application) === null || _c === void 0 ? void 0 : _c.version,
        build: (_d = subworkflow.application) === null || _d === void 0 ? void 0 : _d.build,
    });
    const tabs = useMemo(() => Object.values(TAB_NAVIGATION_CONFIG)
        .map((tab, index) => ({
        ...tab,
        href: undefined,
        onClick: (event) => {
            event.preventDefault();
            setTabIndex(index);
        },
    }))
        // Compute is the last entry, so dropping it leaves the remaining
        // tabs on the indices their panels are keyed to.
        .filter((tab) => !(hideComputeSubTab && tab.itemName === COMPUTE_TAB_NAME)), [setTabIndex, hideComputeSubTab]);
    // A subworkflow whose Compute tab was open when the host hid it would
    // otherwise be left showing an empty panel.
    const visibleTabIndex = hideComputeSubTab && activeTabIndex === COMPUTE_TAB_INDEX ? 0 : activeTabIndex;
    return (_jsxs(Stack, { "data-tid": "subworkflow", height: "100%", className: className, children: [_jsx(UndoSnackbar, { state: removeUndoState, onClose: () => setRemoveUndoState(null) }), useUnitInspector ? (_jsx(UnitInspectorDrawer, { unit: inspectedUnit, unitIndex: unitIndex, onClose: () => setIsInspectorOpen(false), onContextChanged: onImportantSettingsContextChanged })) : null, _jsx(TabsMenu, { tabs: tabs, activeTabIndex: visibleTabIndex, sx: { fontSize: 12, height: "100%" } }), _jsxs(TabContext, { value: `${visibleTabIndex}`, children: [_jsx(TabPanel, { value: "0", id: TAB_NAVIGATION_CONFIG.overview.href, sx: { height: "100%" }, children: _jsxs(Stack, { spacing: 3, height: "100%", children: [_jsx(UnitsFlowchartContainer, { units: subworkflow.unitsInstances, onUnitAdd: onUnitAdd, isStandalone: isStandalone, editable: editable, adjustable: adjustable, onUnitClone: onUnitClone, onUnitRemove: onUnitRemove, onUnitUpdate: onUnitUpdate, materials: materials, materialsIndex: materialsIndex, onMaterialSwitch: onMaterialSwitch, subworkflow: subworkflow, onOutputUpdateRequest: onOutputUpdateRequest, publicAccount: publicAccount, unitIndex: unitIndex, onUnitSelect: onUnitSelect, unitTypeReduxDialog: unitTypeReduxDialog, jobProperties: jobProperties, UnitModalComponent: UnitModal }), _jsx(AccordionComponent, { header: "Details", id: "subworkflow-accordion", sx: { pt: 0 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(Properties, { subworkflow: subworkflow, onUpdate: onUpdate, editable: editable || adjustable }), _jsx(ApplicationAve, { application: subworkflow.application, onApplicationUpdate: onApplicationUpdate, editable: editable }), subworkflow.modelInstance.isUnknown ? null : (_jsx(Model, { id: "model", model: subworkflow.modelInstance, models: filteredModels, application: subworkflow.application, onUpdate: onModelUpdate, editable: editable })), _jsx(SubworkflowMethodPanel, { subworkflow: subworkflow, editable: editable, adjustable: adjustable, isMethodDataLoading: isMethodDataLoading, isStandalone: isStandalone, materials: materials, profile: profile, onUpdate: onChildSubworkflowInstanceUpdate, pseudoUploadReduxDialog: pseudoUploadReduxDialog, metaProperties: metaProperties, createMetaProperty: createMetaProperty })] }) })] }) }), _jsx(TabPanel, { value: "1", id: TAB_NAVIGATION_CONFIG.importantSettings.href, "data-tab-name": TAB_NAVIGATION_CONFIG.importantSettings.itemName, children: _jsx(ImportantSettings, { id: TAB_NAVIGATION_CONFIG.importantSettings.href, subworkflow: subworkflow, onContextChanged: onImportantSettingsContextChanged }) }), _jsx(TabPanel, { value: "2", children: _jsx(Grid, { container: true, spacing: 2, children: subworkflow.unitsInstances.map((unit, index) => (_jsx(SubworkflowExecutionUnitDetailsRow, { unit: unit, index: index, editable: editable, onUnitResultsChanged: onUnitResultsChanged, onUnitIsDraftChanged: onUnitIsDraftChanged, onUnitMonitorChanged: onUnitMonitorChanged, onUnitPostProcessorChanged: onUnitPostProcessorChanged }, unit.flowchartId))) }) }), hideComputeSubTab ? null : (_jsx(TabPanel, { value: `${COMPUTE_TAB_INDEX}`, children: _jsx(WorkflowCompute, { compute: subworkflow.compute, onUpdate: onComputeUpdate, onToggle: onComputeToggle, showAdvancedOptions: new Application(subworkflow.application).hasAdvancedComputeOptions, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, currentUser: currentUser !== null && currentUser !== void 0 ? currentUser : profile.user.entity, clusters: clusters }) }))] })] }));
}
