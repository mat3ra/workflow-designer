import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ENTITY_ICONS } from "@exabyte-io/cove.js/dist/mui/components/icon/entityIcons";
import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider";
import oldLightMaterialUITheme from "@exabyte-io/cove.js/dist/theme/theme";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import { ErrorUnitContent, WorkflowUnitsFlowchart } from "@mat3ra/wove";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import get from "lodash/get";
import React from "react";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { Subworkflow } from "../subworkflows/Subworkflow";
import SubworkflowHeader from "../subworkflows/SubworkflowHeader";
import { WorkflowValidationAlert } from "./WorkflowValidationAlert";
// TODO: avoid cycle dependencies (Map imports Workflow)
const MapWorkflowDesigner = React.lazy(() => import("./Map").then((module) => ({ default: module.MapWorkflowDesigner })));
export function WorkflowDefaultLayout(props) {
    var _a, _b;
    const { entity, unitIndex, isMap, materials, materialsIndex, materialsSet, jobHasParent = false, editable, adjustable, isLoading, showHeader, isHeaderCompact, isStandalone, isMethodDataLoading, isSetPublicVisible, showMetadata, showHistory, workflowHistory, iconCls, onNameUpdate, onUpdateTags, onUnitAdd, onUnitAddSubworkflowFromConfig, onUnitUpdate, onSubworkflowUnitUpdate, onMapWorkflowUpdate, onUnitSelect, onUpdateUnitIndex, handleUnitRemove, onUnitNameUpdate, areWorkflowContentExpanded, toggleExpandWorkflowContent, headerStatusCls, getPagerProps, getSaveBtnProps, getDropdownProps, isDescriptionEditable, onDescriptionUpdate, dialogs, metaProperties, onMaterialSwitch, onOutputUpdateRequest, accountUsers, accountUsersIsLoading, profile, publicAccount, clusters, templates, createMetaProperty, jobProperties, subworkflowActiveTabIndexById, onSubworkflowActiveTabIndexChange, } = props;
    const { EntityHeaderComponent, MetadataComponent, HistoryComponent } = useWorkflowComponents();
    const unit = entity.unitInstances[unitIndex];
    if (!unit) {
        console.error("Unit not found");
        return _jsx("div", { children: "Unit not found" });
    }
    let subworkflow;
    let mapWorkflow;
    if (unit.type === UnitType.subworkflow) {
        subworkflow = entity.subworkflowInstances.find((s) => s.id === unit.id);
    }
    if (unit.type === UnitType.map) {
        mapWorkflow = entity.workflowInstances.find((w) => w.id === unit.workflowId);
    }
    const leftColumnGridProps = isMap ? { md: 12, lg: true } : { md: 12, lg: 4 };
    const rightColumnGridProps = isMap ? { md: 12, lg: true } : { md: 12, lg: 8 };
    const { pseudoUploadReduxDialog, unitTypeReduxDialog } = dialogs;
    return (_jsx(ThemeProvider, { theme: oldLightMaterialUITheme, children: _jsxs("div", { className: "workflow-with-name-and-metadata", children: [showHeader && (_jsx(EntityHeaderComponent, { isCompact: isHeaderCompact, icon: ENTITY_ICONS.workflow, name: String((_a = entity.name) !== null && _a !== void 0 ? _a : ""), subtitle: {
                        applications: entity.usedApplicationNames.join(", "),
                    }, description: get(entity, "description"), isLoading: isLoading, editable: Boolean(editable), onNameUpdate: onNameUpdate, iconCls: iconCls, id: "workflow-designer-header", pagerProps: getPagerProps(), saveBtnProps: getSaveBtnProps(), dropdownProps: getDropdownProps(), descriptionEditorTitle: "Workflow Description", item: entity, isDescriptionEditable: isDescriptionEditable, onDescriptionUpdate: onDescriptionUpdate })), _jsxs(Grid, { container: true, sx: { backgroundColor: "background.paper" }, children: [_jsx(Grid, { ...leftColumnGridProps, item: true, sx: {
                                borderRight: "1px solid #cecece",
                                backgroundColor: "background.default",
                            }, children: _jsx(Box, { className: "workflow-flowchart-container", sx: { height: "100%", p: 2 }, children: _jsx(WorkflowUnitsFlowchart, { editable: Boolean(editable), onUnitRemove: handleUnitRemove, onSubworkflowUnitUpdate: onSubworkflowUnitUpdate, workflow: entity, activeUnit: unit, onClick: onUnitSelect, isCardContentExpanded: areWorkflowContentExpanded, headerStatusCls: headerStatusCls }) }) }), _jsxs(Grid, { className: "workflow-subworkflow-container", item: true, sx: { display: "flex", flexDirection: "column" }, ...rightColumnGridProps, children: [_jsx(WorkflowValidationAlert, { workflow: entity }), unit.type === UnitType.subworkflow && (_jsxs(_Fragment, { children: [_jsx(SubworkflowHeader, { unit: unit, adjustable: Boolean(adjustable), editable: Boolean(editable), subworkflow: subworkflow, onUnitRemove: handleUnitRemove, headerStatusCls: headerStatusCls, onUnitNameUpdate: onUnitNameUpdate, unitIndex: unitIndex, onUnitAdd: onUnitAdd, onUnitAddSubworkflowFromConfig: onUnitAddSubworkflowFromConfig, onUpdateUnitIndex: onUpdateUnitIndex, onSubworkflowUnitUpdate: onSubworkflowUnitUpdate, areWorkflowContentExpanded: areWorkflowContentExpanded, toggleExpandWorkflowContent: toggleExpandWorkflowContent, workflow: entity, materials: materials, materialsIndex: materialsIndex, materialsSet: materialsSet, jobHasParent: jobHasParent }), subworkflow ? (_jsx(Subworkflow, { className: "card-body", subworkflow: subworkflow, activeTabIndex: (_b = subworkflowActiveTabIndexById[subworkflow.id]) !== null && _b !== void 0 ? _b : 0, onActiveTabIndexChange: (tabIndex) => onSubworkflowActiveTabIndexChange(subworkflow.id, tabIndex), onUpdate: onSubworkflowUnitUpdate, isStandalone: isStandalone, isMethodDataLoading: isMethodDataLoading, editable: Boolean(editable), adjustable: Boolean(adjustable), onMaterialSwitch: onMaterialSwitch, materials: materials, materialsIndex: materialsIndex, metaProperties: metaProperties, onOutputUpdateRequest: onOutputUpdateRequest, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, currentUser: profile.user.entity, clusters: clusters, pseudoUploadReduxDialog: pseudoUploadReduxDialog, unitTypeReduxDialog: unitTypeReduxDialog, profile: profile, publicAccount: publicAccount, createMetaProperty: createMetaProperty, jobProperties: jobProperties }, subworkflow.id)) : null] })), unit.type === UnitType.map && (_jsx(React.Suspense, { fallback: null, children: _jsx(MapWorkflowDesigner, { className: "card-body", unit: unit, workflow: mapWorkflow, onUpdate: onUnitUpdate, onWorkflowUpdate: onMapWorkflowUpdate, editable: Boolean(editable), adjustable: Boolean(adjustable), onMaterialSwitch: onMaterialSwitch, materials: materials, materialsIndex: materialsIndex, iconCls: iconCls, onOutputUpdateRequest: onOutputUpdateRequest, parentWorkflow: entity, accountUsers: accountUsers, accountUsersIsLoading: accountUsersIsLoading, currentUser: profile.user.entity, publicAccount: publicAccount, profile: profile, clusters: clusters, dialogs: dialogs, templates: templates, isDescriptionEditable: isDescriptionEditable, metaProperties: metaProperties }) })), unit.type === UnitType.error && (_jsx(Box, { className: "card-body", sx: { p: 2 }, children: _jsx(ErrorUnitContent, { unit: unit }) }))] })] }), _jsx(Divider, {}), showMetadata && (_jsx(MetadataComponent, { tags: get(entity, "tags", []), editable: Boolean(editable), isSetPublicVisible: isSetPublicVisible, onUpdateTags: onUpdateTags, publicAccount: publicAccount.entity })), _jsx(Divider, {}), showHistory && _jsx(HistoryComponent, { items: workflowHistory })] }) }));
}
