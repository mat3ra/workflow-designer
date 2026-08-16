import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ComputeForm } from "@mat3ra/ive";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
export default function WorkflowCompute({ compute, onToggle, onUpdate, showAdvancedOptions, accountUsers, accountUsersIsLoading, currentUser, clusters = [], }) {
    return (_jsxs(Box, { children: [_jsxs(Stack, { direction: "row", spacing: 1.5, alignItems: "flex-start", sx: { mb: 1 }, children: [_jsx(Switch, { "data-tid": "toggle-compute", checked: Boolean(compute), onChange: (e) => onToggle(e.target.checked), inputProps: { "aria-label": "Override compute for this subworkflow" } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", fontWeight: 600, color: "text.primary", children: "Override compute for this subworkflow" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", children: "Off: jobs use the compute settings chosen at job creation. On: this subworkflow always runs as a separate job with the resources below." })] })] }), Boolean(compute) && (_jsx(ComputeForm, { id: "compute-form-embedded", compute: compute, user: currentUser, onUpdate: onUpdate, clusters: clusters, showHeader: false, showAdvancedOptions: showAdvancedOptions, accountUsers: accountUsers, isAccountUsersLoading: accountUsersIsLoading, gridParams: {
                    left: {
                        xs: 12,
                    },
                    right: {
                        xs: 12,
                    },
                } }))] }));
}
