import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
function getErrorSummary(reason) {
    var _a;
    try {
        const parsed = JSON.parse(reason);
        const { error } = parsed;
        if (Array.isArray(error) && error.length > 0) {
            const first = error[0];
            return (_a = first.message) !== null && _a !== void 0 ? _a : "Validation failed";
        }
        if (error !== null && typeof error === "object" && "message" in error) {
            return String(error.message);
        }
    }
    catch (_b) {
        // fall through to raw reason
    }
    return reason || "Validation failed";
}
function collectErrorUnitLabels(workflow) {
    const entries = [];
    workflow.unitInstances
        .filter((unit) => unit.type === UnitType.error)
        .forEach((unit) => {
        entries.push({
            label: unit.name,
            summary: getErrorSummary(unit.reason),
        });
    });
    workflow.subworkflowInstances.forEach((subworkflow) => {
        subworkflow.unitsInstances
            .filter((unit) => unit.type === UnitType.error)
            .forEach((unit) => {
            entries.push({
                label: `${subworkflow.name} / ${unit.name}`,
                summary: getErrorSummary(unit.reason),
            });
        });
    });
    return entries;
}
export function WorkflowValidationAlert({ workflow }) {
    const issues = useMemo(() => collectErrorUnitLabels(workflow), [workflow]);
    if (issues.length === 0) {
        return null;
    }
    const issueLabel = issues.length === 1 ? "issue" : "issues";
    return (_jsx(Alert, { className: "workflow-validation-alert", severity: "error", sx: { alignItems: "flex-start", mx: 2, mt: 2, mb: 1 }, children: _jsxs(Stack, { spacing: 1.5, sx: { width: "100%" }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", component: "div", sx: { fontWeight: 600 }, children: "Invalid workflow" }), _jsxs(Typography, { variant: "body2", sx: { mt: 0.5 }, children: ["This workflow contains ", issues.length, " validation ", issueLabel, ". Open the error unit in the flowchart for full details."] })] }), _jsx(Box, { component: "ul", sx: { m: 0, pl: 2.5 }, children: issues.map((issue) => (_jsxs(Box, { component: "li", sx: { mb: 0.5 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: issue.label }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: issue.summary })] }, issue.label))) })] }) }));
}
