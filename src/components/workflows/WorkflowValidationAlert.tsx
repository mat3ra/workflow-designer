import type { ErrorUnit, Workflow as WodeWorkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";

type Props = {
    workflow: WodeWorkflow;
};

function getErrorSummary(reason: string): string {
    try {
        const parsed = JSON.parse(reason) as { error?: unknown };
        const { error } = parsed;

        if (Array.isArray(error) && error.length > 0) {
            const first = error[0] as { message?: string };
            return first.message ?? "Validation failed";
        }

        if (error !== null && typeof error === "object" && "message" in error) {
            return String((error as { message: unknown }).message);
        }
    } catch {
        // fall through to raw reason
    }

    return reason || "Validation failed";
}

function collectErrorUnitLabels(workflow: WodeWorkflow): { label: string; summary: string }[] {
    const entries: { label: string; summary: string }[] = [];

    workflow.unitInstances
        .filter((unit) => unit.type === UnitType.error)
        .forEach((unit) => {
            entries.push({
                label: unit.name,
                summary: getErrorSummary((unit as ErrorUnit).reason),
            });
        });

    workflow.subworkflowInstances.forEach((subworkflow) => {
        subworkflow.unitsInstances
            .filter((unit) => unit.type === UnitType.error)
            .forEach((unit) => {
                entries.push({
                    label: `${subworkflow.name} / ${unit.name}`,
                    summary: getErrorSummary((unit as ErrorUnit).reason),
                });
            });
    });

    return entries;
}

export function WorkflowValidationAlert({ workflow }: Props) {
    const issues = useMemo(() => collectErrorUnitLabels(workflow), [workflow]);

    if (issues.length === 0) {
        return null;
    }

    const issueLabel = issues.length === 1 ? "issue" : "issues";

    return (
        <Alert
            className="workflow-validation-alert"
            severity="error"
            sx={{ alignItems: "flex-start", mx: 2, mt: 2, mb: 1 }}
        >
            <Stack spacing={1.5} sx={{ width: "100%" }}>
                <Box>
                    <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
                        Invalid workflow
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        This workflow contains {issues.length} validation {issueLabel}. Open the
                        error unit in the flowchart for full details.
                    </Typography>
                </Box>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {issues.map((issue) => (
                        <Box component="li" key={issue.label} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {issue.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {issue.summary}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Stack>
        </Alert>
    );
}
