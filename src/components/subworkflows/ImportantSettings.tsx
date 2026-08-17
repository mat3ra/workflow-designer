/* eslint-disable react/no-array-index-key */
import RJSForm from "@mat3ra/cove/dist/other/rjsf/RJSForm";
import { type AnySubworkflowUnit, type ExecutionUnit, type Subworkflow } from "@mat3ra/wode";
import { ExtraImportantSettingsByContextProvider } from "@mat3ra/wove";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ajv from "@rjsf/validator-ajv8";
import React from "react";

import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { brillouinZoneComponentForProvider } from "../common/brillouinZoneForProvider";
import { mergeUiSchemaWithDefaultFieldStyles } from "./importantSettingsFormUtils";

/**
 * Use schema `type`, not `instanceof`. Job/workflow units are built via Meteor-compiled
 * `@mat3ra/wode` (see `rspack.config.js` `compileWithMeteor`); wove UI may resolve another
 * copy of the same class → `instanceof` is false for every unit.
 */
function isExecutionUnit(unit: AnySubworkflowUnit): unit is ExecutionUnit {
    return unit.type === "execution";
}

interface ImportantSettingsProps {
    subworkflow: Subworkflow;
    role?: string;
    className?: string;
    id?: string;
    onContextChanged: () => void;
}

function getUnitImportantSettingsProviders(unit: ExecutionUnit) {
    const contextProviders = unit.contextProvidersInstances
        .filter((provider) => provider.entityName === "unit")
        .filter((provider) => provider.domain === "important");

    return contextProviders;
}

function getProviderTitle(provider: { name: string }) {
    switch (provider.name) {
        case "boundaryConditions":
            return "Boundary Conditions";
        case "cutoffs":
            return "Planewave Cutoffs";
        default:
            return provider.name;
    }
}

interface ImportantSettingsForUnitProps {
    unit: ExecutionUnit;
    unitIndex: number;
    onContextChanged: () => void;
}

export function ImportantSettingsForUnit({
    unit,
    unitIndex,
    onContextChanged,
}: ImportantSettingsForUnitProps) {
    const [formRevision, setFormRevision] = React.useState(0);
    const { SubworkflowFormTitleComponent, BrillouinZoneImageComponent } = useWorkflowComponents();

    return (
        <Box
            my={2}
            className="important-settings-for-unit ImportantSettingsForUnit"
            id={unit.flowchartId}
            data-tid={unit.name}
        >
            <SubworkflowFormTitleComponent title={`Unit ${unitIndex}: ${unit.name}`} />
            <Box ml={3}>
                {getUnitImportantSettingsProviders(unit).map((provider, index) => {
                    const title = getProviderTitle(provider);
                    const data = provider.getData();

                    return (
                        <Box
                            className="ImportantSettingsForUnit-Box"
                            key={index}
                            my={2}
                            data-form-revision={formRevision}
                            data-tid={title}
                        >
                            <Typography variant="h6">{title}</Typography>
                            {/*
                                Default to the computed zone: wove's fallback points an <img> at
                                `/images/brillouin_zone/<lattice>.png`, which only the web app
                                serves. Hosts with their own artwork still inject a component.
                            */}
                            <ExtraImportantSettingsByContextProvider
                                provider={provider}
                                BrillouinZoneImageComponent={
                                    BrillouinZoneImageComponent ??
                                    brillouinZoneComponentForProvider(provider)
                                }
                            />

                            <RJSForm
                                schema={provider.jsonSchema}
                                validator={ajv}
                                uiSchema={(provider as any).uiSchema}
                                formData={data}
                                experimental_defaultFormStateBehavior={{
                                    mergeDefaultsIntoFormData: "useDefaultIfFormDataUndefined",
                                }}
                                onChange={({ formData }) => {
                                    const rootSchema = provider.jsonSchema;
                                    if (!ajv.isValid(rootSchema, formData, rootSchema)) {
                                        return;
                                    }

                                    provider.setIsEdited(true);
                                    provider.setData(formData);
                                    unit.savePersistentContext();
                                    setFormRevision((revision) => revision + 1);
                                    onContextChanged();
                                }}
                            >
                                {" "}
                            </RJSForm>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

interface ImportantSettingsForSubworkflowProps {
    subworkflow: Subworkflow;
    onContextChanged: () => void;
}

interface SubworkflowProviderEntry {
    unit: ExecutionUnit;
    provider: ExecutionUnit["contextProvidersInstances"][number];
}

function getSubworkflowImportantSettingsEntries(
    subworkflow: Subworkflow,
): SubworkflowProviderEntry[] {
    return subworkflow.unitsInstances.filter(isExecutionUnit).flatMap((unit) => {
        return unit.contextProvidersInstances
            .filter((provider) => provider.entityName === "subworkflow")
            .filter((provider) => provider.domain === "important")
            .map((provider) => ({ unit, provider }));
    });
}

/**
 * Several units in a subworkflow can each carry their own instance of the same
 * subworkflow-scoped provider (e.g. `pw_scf` and `pw_bands` both have "cutoffs" - they must
 * share one wavefunction/density cutoff, QE's `bands` step reuses the prior `scf` step's charge
 * density). Group by provider name so exactly one editable panel renders per name instead of one
 * per unit that happens to carry it.
 */
function groupEntriesByProviderName(
    entries: SubworkflowProviderEntry[],
): SubworkflowProviderEntry[][] {
    const groups = new Map<string, SubworkflowProviderEntry[]>();
    entries.forEach((entry) => {
        const group = groups.get(entry.provider.name);
        if (group) {
            group.push(entry);
        } else {
            groups.set(entry.provider.name, [entry]);
        }
    });
    return [...groups.values()];
}

function ImportantSettingsForSubworkflow({
    subworkflow,
    onContextChanged,
}: ImportantSettingsForSubworkflowProps) {
    const { SubworkflowFormTitleComponent } = useWorkflowComponents();
    const groups = groupEntriesByProviderName(getSubworkflowImportantSettingsEntries(subworkflow));

    return (
        <Box
            className="ImportantSettingsForSubworkflow"
            my={2}
            id={subworkflow.id}
            key={subworkflow.id}
        >
            <SubworkflowFormTitleComponent title="Settings global to this Subworkflow" />
            <Box ml={3} mt={2}>
                {groups.map((group) => {
                    const [{ provider: firstProvider }] = group;
                    const data = firstProvider.getData();

                    return (
                        <Box key={firstProvider.name}>
                            <Typography variant="h6">{getProviderTitle(firstProvider)}</Typography>
                            <RJSForm
                                validator={ajv}
                                schema={firstProvider.jsonSchema}
                                uiSchema={mergeUiSchemaWithDefaultFieldStyles(
                                    (firstProvider as any).uiSchema,
                                    firstProvider.name,
                                )}
                                formData={data}
                                // fields={firstProvider.fields}
                                // widgets={{ CheckboxWidget: Checkbox }}
                                onChange={({ formData }) => {
                                    const rootSchema = firstProvider.jsonSchema;
                                    if (!ajv.isValid(rootSchema, formData, rootSchema)) {
                                        return;
                                    }
                                    group.forEach(({ unit, provider }) => {
                                        provider.setIsEdited(true);
                                        provider.setData(formData);
                                        unit.savePersistentContext();
                                    });
                                    onContextChanged();
                                }}
                            >
                                {" "}
                            </RJSForm>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export function ImportantSettings({
    subworkflow,
    role,
    className,
    id,
    onContextChanged,
}: ImportantSettingsProps) {
    return (
        <Box role={role} className={className} id={id}>
            <ImportantSettingsForSubworkflow
                subworkflow={subworkflow}
                onContextChanged={onContextChanged}
            />
            {subworkflow.unitsInstances.filter(isExecutionUnit).map((unit, index) => {
                return (
                    <ImportantSettingsForUnit
                        key={index}
                        unit={unit}
                        unitIndex={index}
                        onContextChanged={onContextChanged}
                    />
                );
            })}
        </Box>
    );
}
