import RJSForm from "@mat3ra/cove/dist/other/rjsf/RJSForm";
import { type Subworkflow } from "@mat3ra/wode";
import { ExtraImportantSettingsByContextProvider } from "@mat3ra/wove";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ajv from "@rjsf/validator-ajv8";
import React, { useCallback, useMemo, useState } from "react";

import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { brillouinZoneComponentForProvider } from "../common/brillouinZoneForProvider";
import {
    FieldDefaultsContext,
    ImportantSettingsFieldTemplate,
} from "./ImportantSettingsFieldTemplate";
import { mergeUiSchemaWithDefaultFieldStyles } from "./importantSettingsFormUtils";
import {
    type SettingsGroup,
    getDefaultData,
    getScopeIndex,
    getSettingsGroups,
} from "./importantSettingsGroups";
import { isPointsPathSchema } from "./kPath";
import KPathField from "./KPathField";

interface ImportantSettingsProps {
    subworkflow: Subworkflow;
    role?: string;
    className?: string;
    id?: string;
    onContextChanged: () => void;
}

interface SettingsGroupCardProps {
    group: SettingsGroup;
    onContextChanged: () => void;
}

/**
 * One provider's form, with the two things the flat list never said: what the setting applies
 * to, and whether it still holds its default.
 */
function SettingsGroupCard({ group, onContextChanged }: SettingsGroupCardProps) {
    const { BrillouinZoneImageComponent } = useWorkflowComponents();
    const [formRevision, setFormRevision] = useState(0);
    const [{ provider: firstProvider }] = group.entries;
    const defaultData = useMemo(() => getDefaultData(firstProvider), [firstProvider]);

    /** Every entry in a group edits the same setting, so they are written together. */
    const applyToGroup = useCallback(
        (data: unknown, isEdited: boolean) => {
            group.entries.forEach(({ unit, provider }) => {
                provider.setIsEdited(isEdited);
                // `setData` narrows to each provider's own data shape across the union; the form
                // and the schema defaults are both validated against that provider's schema.
                (provider.setData as (value: unknown) => void)(data);
                unit.savePersistentContext();
            });
            setFormRevision((revision) => revision + 1);
            onContextChanged();
        },
        [group, onContextChanged],
    );

    const onReset = useCallback(() => {
        if (!defaultData) return;
        applyToGroup(defaultData, false);
    }, [applyToGroup, defaultData]);

    const formData = firstProvider.getData() as Record<string, unknown> | undefined;

    /** Restores a single field, leaving the user's other edits in this group intact. */
    const onResetField = useCallback(
        (fieldName: string) => {
            if (!defaultData) return;
            const next = { ...(formData ?? {}), [fieldName]: defaultData[fieldName] };
            const stillEdited = Object.keys(defaultData).some(
                (key) => JSON.stringify(next[key]) !== JSON.stringify(defaultData[key]),
            );
            applyToGroup(next, stillEdited);
        },
        [applyToGroup, defaultData, formData],
    );

    const fieldDefaults = useMemo(
        () => ({ defaults: defaultData, formData, onResetField }),
        [defaultData, formData, onResetField],
    );

    const schema = firstProvider.jsonSchema;
    /*
     * The compact field styles suit the subworkflow-wide panels (a couple of scalars each).
     * Unit-scoped providers — k-grids, k-paths — carry their own uiSchema and need RJSF's
     * labelled layout, so they are passed through. Points paths get a chain editor instead of
     * the generated array form; `ui:field` at the root also drops the schema's own title and
     * description, which only restated the card header.
     */
    const uiSchema = useMemo(() => {
        if (isPointsPathSchema(schema)) {
            return { "ui:field": KPathField };
        }
        const providerUiSchema = (firstProvider as any).uiSchema;
        return group.scopeKey === "subworkflow"
            ? mergeUiSchemaWithDefaultFieldStyles(providerUiSchema, firstProvider.name)
            : providerUiSchema;
    }, [firstProvider, group.scopeKey, schema]);

    return (
        <Paper
            variant="outlined"
            className="ImportantSettingsForUnit-Box important-settings-group"
            data-tid={group.title}
            data-form-revision={formRevision}
            id={group.key}
            sx={{ p: 2 }}
        >
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                    {group.title}
                </Typography>
                {group.isEdited ? (
                    <Chip label="modified" size="small" color="warning" variant="outlined" />
                ) : null}
                <Typography variant="caption" color="text.secondary">
                    · {group.scopeLabel}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {defaultData ? (
                    <Button
                        size="small"
                        onClick={onReset}
                        disabled={!group.isEdited}
                        data-tid={`reset-${group.key}`}
                    >
                        Reset
                    </Button>
                ) : null}
            </Stack>

            <ExtraImportantSettingsByContextProvider
                provider={firstProvider}
                BrillouinZoneImageComponent={
                    BrillouinZoneImageComponent ?? brillouinZoneComponentForProvider(firstProvider)
                }
            />

            <FieldDefaultsContext.Provider value={fieldDefaults}>
                <RJSForm
                    schema={schema}
                    validator={ajv}
                    templates={{ FieldTemplate: ImportantSettingsFieldTemplate }}
                    uiSchema={uiSchema}
                    formData={formData}
                    experimental_defaultFormStateBehavior={{
                        mergeDefaultsIntoFormData: "useDefaultIfFormDataUndefined",
                    }}
                    onChange={({ formData }: { formData?: unknown }) => {
                        if (!ajv.isValid(schema, formData, schema)) {
                            return;
                        }
                        applyToGroup(formData, true);
                    }}
                >
                    {" "}
                </RJSForm>
            </FieldDefaultsContext.Provider>
        </Paper>
    );
}

/**
 * The Settings tab: every important setting for the subworkflow, grouped by what it applies to.
 *
 * Replaces a flat scroll of unlabelled forms — the tab scientists touch most, where nothing
 * said which unit a setting belonged to, whether it still held its default, or how to get back
 * to that default.
 */
export function ImportantSettings({
    subworkflow,
    role,
    className,
    id,
    onContextChanged,
}: ImportantSettingsProps) {
    const [filter, setFilter] = useState("");
    const groups = getSettingsGroups(subworkflow);
    const scopes = getScopeIndex(groups);

    const normalizedFilter = filter.trim().toLowerCase();
    const visibleGroups = normalizedFilter
        ? groups.filter((group) => group.searchText.includes(normalizedFilter))
        : groups;

    if (groups.length === 0) {
        return (
            <Box role={role} className={className} id={id} sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    This subworkflow has no important settings to configure.
                </Typography>
            </Box>
        );
    }

    return (
        <Box role={role} className={className} id={id}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
                {/* Index: which units carry settings, and where you have diverged from defaults. */}
                <Box
                    component="nav"
                    data-tid="settings-index"
                    sx={{
                        position: "sticky",
                        top: 0,
                        flex: "0 0 180px",
                        display: { xs: "none", md: "block" },
                    }}
                >
                    <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ px: 1, display: "block" }}
                    >
                        Units
                    </Typography>
                    {scopes.map((scope) => (
                        <Stack
                            key={scope.key}
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            component="a"
                            href={`#${scope.key}`}
                            onClick={(event: React.MouseEvent) => {
                                event.preventDefault();
                                document
                                    .getElementById(scope.key)
                                    ?.scrollIntoView({ block: "start" });
                            }}
                            sx={{
                                px: 1,
                                py: 0.75,
                                borderRadius: 1,
                                textDecoration: "none",
                                color: "text.primary",
                                "&:hover": { backgroundColor: "action.hover" },
                            }}
                        >
                            <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                                {scope.name}
                            </Typography>
                            <Chip
                                label={scope.edited}
                                size="small"
                                color={scope.edited ? "warning" : "default"}
                                variant={scope.edited ? "filled" : "outlined"}
                                title={`${scope.edited} of ${scope.total} settings modified`}
                            />
                        </Stack>
                    ))}
                </Box>

                <Stack spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
                    <TextField
                        size="small"
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        placeholder="Filter settings — name, unit or engine keyword"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">⌕</InputAdornment>,
                            inputProps: {
                                "data-tid": "settings-filter",
                                "aria-label": "Filter settings",
                            },
                        }}
                    />

                    {visibleGroups.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                            No settings match “{filter}”.
                        </Typography>
                    ) : (
                        visibleGroups.map((group) => (
                            <Box key={group.key} id={group.scopeKey}>
                                <SettingsGroupCard
                                    group={group}
                                    onContextChanged={onContextChanged}
                                />
                            </Box>
                        ))
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}
