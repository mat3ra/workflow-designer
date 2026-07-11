/* eslint-disable jsx-a11y/label-has-associated-control */
import { ComputeForm } from "@mat3ra/ive";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
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
            <Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            data-tid="toggle-compute"
                            onChange={(e) => onToggle(e.target.checked)}
                            checked={Boolean(compute)}
                        />
                    }
                    label=" Run inside a separate job"
                />
            </Box>
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
