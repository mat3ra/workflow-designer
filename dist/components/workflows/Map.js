import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import TabsMenu from "@mat3ra/cove/dist/mui/components/tabs/TabsMenu";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import WorkflowCompute from "../subworkflows/WorkflowCompute";
import MapDataForm from "./MapDataForm";
import { Workflow } from "./Workflow";
const workflowRenderNoop = () => undefined;
const emptyTabShell = {
    className: "",
    iconCls: "",
};
function MapWorkflowDesigner(props) {
    var _a;
    const { unit, workflow: workflowProp, onUpdate, onWorkflowUpdate, editable = true, adjustable = false, materials, onMaterialSwitch, onOutputUpdateRequest, dialogs, profile, publicAccount, accountUsers, accountUsersIsLoading, currentUser, clusters, templates, isLoading, isDescriptionEditable, metaProperties, } = props;
    const { getDefaultComputeConfig } = useWorkflowComponents();
    const [entity, setEntity] = useState(() => workflowProp);
    const [repetition, setRepetition] = useState(0);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    useEffect(() => {
        setEntity(workflowProp);
    }, [workflowProp]);
    const resetEntityAndNotify = useCallback((next) => {
        setEntity(next);
        onWorkflowUpdate(next);
    }, [onWorkflowUpdate]);
    const onComputeUpdate = useCallback((compute) => {
        entity.setCompute(compute);
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onComputeToggle = useCallback((checked) => {
        if (checked) {
            entity.setCompute(getDefaultComputeConfig());
        }
        else {
            entity.unsetCompute();
        }
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onWorkflowUpdateLocal = useCallback((workflow) => {
        resetEntityAndNotify(workflow);
    }, [resetEntityAndNotify]);
    const onUnitAdd = useCallback((unitType) => {
        entity.addUnitType(unitType);
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onUnitRemove = useCallback((flowchartId) => {
        if (flowchartId === undefined)
            return;
        entity.removeUnit(flowchartId);
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onUnitUpdate = useCallback((unit) => {
        var _a;
        if (unit.type === UnitType.subworkflow) {
            (_a = entity.subworkflowInstances.find((sw) => sw.id === unit.id)) === null || _a === void 0 ? void 0 : _a.setName(unit.name);
        }
        const unitIndex = entity.unitInstances.findIndex((x) => x.flowchartId === unit.flowchartId);
        if (unitIndex >= 0) {
            const nextUnits = [...entity.unitInstances];
            nextUnits[unitIndex] = unit;
            entity.setUnits(nextUnits);
        }
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onSubworkflowUnitUpdate = useCallback((subworkflowSchema) => {
        const subworkflowIndex = entity.subworkflowInstances.findIndex((sw) => sw.id === subworkflowSchema._id);
        if (subworkflowIndex < 0) {
            return;
        }
        entity.subworkflows[subworkflowIndex] = subworkflowSchema;
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onNameUpdate = useCallback((name) => {
        entity.setName(name);
        resetEntityAndNotify(entity);
    }, [entity, resetEntityAndNotify]);
    const onHeaderPagerUpdate = useCallback((index) => {
        setRepetition(index);
    }, []);
    const onMapDataUpdate = useCallback((mapData) => {
        const config = unit.toJSON();
        config.map.input = mapData;
        onUpdate(config);
    }, [unit, onUpdate]);
    const mapValues = unit.input.values;
    const mapValuesLength = typeof mapValues === "string" || Array.isArray(mapValues) ? mapValues.length : 0;
    useLayoutEffect(() => {
        entity.setRepetition(repetition);
    }, [entity, repetition]);
    useLayoutEffect(() => {
        entity.setTotalRepetitions(mapValuesLength);
    }, [entity, mapValuesLength]);
    const mapDataForForm = useMemo(() => {
        const next = { ...unit.input };
        if (typeof next.values !== "string") {
            next.values = JSON.stringify(next.values, null, 4);
        }
        return next;
    }, [unit]);
    // Mirrors legacy Workflow.getMapScopeOptions: index map unit in `units`, then take
    // `subworkflows.slice(0, thatIndex)` and flatten each subworkflow's inner units.
    const scopeOptions = useMemo(() => {
        const mapUnitIndex = entity.unitInstances.findIndex((u) => u.flowchartId === unit.flowchartId);
        if (mapUnitIndex < 0) {
            return [];
        }
        const options = [];
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
    const tabs = useMemo(() => [
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
    ], []);
    const tabContextValue = String(activeTabIndex);
    return (_jsxs("div", { children: [_jsx(TabsMenu, { tabs: tabs, activeTabIndex: activeTabIndex }), _jsxs(TabContext, { value: tabContextValue, children: [_jsx(TabPanel, { value: "0", sx: { p: 0, pt: 2 }, id: "map-workflow", children: _jsx(Workflow, { isMap: true, isHeaderCompact: true, workflow: entity, publicAccount: publicAccount, profile: profile, showHeader: true, showMetadata: false, editable: editable, adjustable: adjustable, materials: materials, onMaterialSwitch: onMaterialSwitch, onUpdate: onWorkflowUpdateLocal, isLoading: isLoading, dialogs: dialogs, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, iconCls: `text-${(_a = unit.statusCls) !== null && _a !== void 0 ? _a : ""}`, onUnitAdd: onUnitAdd, onUnitRemove: onUnitRemove, onUnitUpdate: onUnitUpdate, onSubworkflowUnitUpdate: onSubworkflowUnitUpdate, onNameUpdate: onNameUpdate, showHeaderPager: !editable, onHeaderPagerUpdate: onHeaderPagerUpdate, onOutputUpdateRequest: onOutputUpdateRequest, templates: templates, onRender: workflowRenderNoop, isDescriptionEditable: isDescriptionEditable, metaProperties: metaProperties }) }), _jsx(TabPanel, { value: "1", sx: { p: 0, pt: 2 }, id: "map-data", children: _jsx(MapDataForm, { onUpdate: onMapDataUpdate, mapData: mapDataForForm, scopeOptions: scopeOptions }) }), _jsx(TabPanel, { value: "2", sx: { p: 0, pt: 2 }, id: "map-compute", children: _jsx(WorkflowCompute, { compute: workflowProp.compute, onUpdate: onComputeUpdate, onToggle: onComputeToggle, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, currentUser: currentUser, clusters: clusters }) })] })] }));
}
export default MapWorkflowDesigner;
export { MapWorkflowDesigner };
