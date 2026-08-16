/* eslint-disable jsx-a11y/label-has-associated-control */
import { ComputeForm } from "@mat3ra/ive";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import React from "react";

import type {
    WorkflowDesignerCluster,
    WorkflowDesignerCoreUser,
    WorkflowDesignerUser,
} from "../../types/context";

export type WorkflowComputeProps = {
    compute: object | null | undefined;
    onToggle: (checked: boolean) => void;
    onUpdate: (compute: unknown) => void;
    showAdvancedOptions?: boolean;
    accountUsers: WorkflowDesignerUser[];
    accountUsersIsLoading: boolean;
    currentUser: WorkflowDesignerCoreUser;
    clusters?: WorkflowDesignerCluster[];
};

export default function WorkflowCompute({
    compute,
    onToggle,
    onUpdate,
    showAdvancedOptions,
    accountUsers,
    accountUsersIsLoading,
    currentUser,
    clusters = [],
}: WorkflowComputeProps) {
    return (
        <Box>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1 }}>
                <Switch
                    data-tid="toggle-compute"
                    checked={Boolean(compute)}
                    onChange={(e) => onToggle(e.target.checked)}
                    inputProps={{ "aria-label": "Override compute for this subworkflow" }}
                />
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Override compute for this subworkflow
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                        Off: jobs use the compute settings chosen at job creation. On: this
                        subworkflow always runs as a separate job with the resources below.
                    </Typography>
                </Box>
            </Stack>
            {Boolean(compute) && (
                <ComputeForm
                    id="compute-form-embedded"
                    compute={compute}
                    user={currentUser}
                    onUpdate={onUpdate}
                    clusters={clusters}
                    showHeader={false}
                    showAdvancedOptions={showAdvancedOptions}
                    accountUsers={accountUsers}
                    isAccountUsersLoading={accountUsersIsLoading}
                    gridParams={{
                        left: {
                            xs: 12,
                        },
                        right: {
                            xs: 12,
                        },
                    }}
                />
            )}
        </Box>
    );
}
