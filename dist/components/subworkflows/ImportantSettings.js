import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/no-array-index-key */
import RJSForm from "@mat3ra/cove.js/dist/other/rjsf/RJSForm";
import { ExtraImportantSettingsByContextProvider } from "@mat3ra/wove";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ajv from "@rjsf/validator-ajv8";
import React from "react";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { mergeUiSchemaWithDefaultFieldStyles } from "./importantSettingsFormUtils";
/**
 * Use schema `type`, not `instanceof`. Job/workflow units are built via Meteor-compiled
 * `@mat3ra/wode` (see `rspack.config.js` `compileWithMeteor`); wove UI may resolve another
 * copy of the same class → `instanceof` is false for every unit.
 */
function isExecutionUnit(unit) {
    return unit.type === "execution";
}
function getUnitImportantSettingsProviders(unit) {
    const contextProviders = unit.contextProvidersInstances
        .filter((provider) => provider.entityName === "unit")
        .filter((provider) => provider.domain === "important");
    return contextProviders;
}
function getProviderTitle(provider) {
    switch (provider.name) {
        case "boundaryConditions":
            return "Boundary Conditions";
        default:
            return provider.name;
    }
}
function ImportantSettingsForUnit({ unit, unitIndex, onContextChanged, }) {
    const [formRevision, setFormRevision] = React.useState(0);
    const { SubworkflowFormTitleComponent } = useWorkflowComponents();
    return (_jsxs(Box, { my: 2, className: "important-settings-for-unit ImportantSettingsForUnit", id: unit.flowchartId, "data-tid": unit.name, children: [_jsx(SubworkflowFormTitleComponent, { title: `Unit ${unitIndex}: ${unit.name}` }), _jsx(Box, { ml: 3, children: getUnitImportantSettingsProviders(unit).map((provider, index) => {
                    const title = getProviderTitle(provider);
                    const data = provider.getData();
                    return (_jsxs(Box, { className: "ImportantSettingsForUnit-Box", my: 2, "data-form-revision": formRevision, "data-tid": title, children: [_jsx(Typography, { variant: "h6", children: title }), _jsx(ExtraImportantSettingsByContextProvider, { provider: provider }), _jsx(RJSForm, { schema: provider.jsonSchema, validator: ajv, uiSchema: provider.uiSchema, formData: data, experimental_defaultFormStateBehavior: {
                                    mergeDefaultsIntoFormData: "useDefaultIfFormDataUndefined",
                                }, onChange: ({ formData }) => {
                                    const rootSchema = provider.jsonSchema;
                                    if (!ajv.isValid(rootSchema, formData, rootSchema)) {
                                        return;
                                    }
                                    provider.setIsEdited(true);
                                    provider.setData(formData);
                                    unit.savePersistentContext();
                                    setFormRevision((revision) => revision + 1);
                                    onContextChanged();
                                }, children: " " })] }, index));
                }) })] }));
}
function ImportantSettingsForSubworkflow({ subworkflow, onContextChanged, }) {
    const { SubworkflowFormTitleComponent } = useWorkflowComponents();
    return (_jsxs(Box, { className: "ImportantSettingsForSubworkflow", my: 2, id: subworkflow.id, children: [_jsx(SubworkflowFormTitleComponent, { title: "Settings global to this Subworkflow" }), _jsx(Box, { ml: 3, mt: 2, children: subworkflow.unitsInstances.filter(isExecutionUnit).flatMap((unit) => {
                    return unit.contextProvidersInstances
                        .filter((provider) => provider.entityName === "subworkflow")
                        .filter((provider) => provider.domain === "important")
                        .map((provider) => {
                        const data = provider.getData();
                        return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", children: getProviderTitle(provider) }), _jsx(RJSForm, { validator: ajv, schema: provider.jsonSchema, uiSchema: mergeUiSchemaWithDefaultFieldStyles(provider.uiSchema), formData: data, 
                                    // fields={provider.fields}
                                    // widgets={{ CheckboxWidget: Checkbox }}
                                    onChange: ({ formData }) => {
                                        const rootSchema = provider.jsonSchema;
                                        if (!ajv.isValid(rootSchema, formData, rootSchema)) {
                                            return;
                                        }
                                        provider.setIsEdited(true);
                                        provider.setData(formData);
                                        unit.savePersistentContext();
                                        onContextChanged();
                                    }, children: " " })] }, `${unit.flowchartId}-${provider.name}`));
                    });
                }) })] }, subworkflow.id));
}
export function ImportantSettings({ subworkflow, role, className, id, onContextChanged, }) {
    return (_jsxs(Box, { role: role, className: className, id: id, children: [_jsx(ImportantSettingsForSubworkflow, { subworkflow: subworkflow, onContextChanged: onContextChanged }), subworkflow.unitsInstances.filter(isExecutionUnit).map((unit, index) => {
                return (_jsx(ImportantSettingsForUnit, { unit: unit, unitIndex: index, onContextChanged: onContextChanged }, index));
            })] }));
}
