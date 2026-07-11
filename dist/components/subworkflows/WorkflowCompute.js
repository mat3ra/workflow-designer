import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/label-has-associated-control */
import { ComputeForm } from "@mat3ra/ive";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
export default function WorkflowCompute({ compute, onToggle, onUpdate, showAdvancedOptions, accountUsers, accountUsersIsLoading, currentUser, clusters = [], }) {
    return (_jsxs(Box, { children: [_jsx(Box, { children: _jsx(FormControlLabel, { control: _jsx(Checkbox, { "data-tid": "toggle-compute", onChange: (e) => onToggle(e.target.checked), checked: Boolean(compute) }), label: " Run inside a separate job" }) }), Boolean(compute) && (_jsx(ComputeForm, { id: "compute-form-embedded", compute: compute, user: currentUser, onUpdate: onUpdate, clusters: clusters, showHeader: false, showAdvancedOptions: showAdvancedOptions, accountUsers: accountUsers, isAccountUsersLoading: accountUsersIsLoading, gridParams: {
                    left: {
                        xs: 12,
                    },
                    right: {
                        xs: 12,
                    },
                } }))] }));
}
