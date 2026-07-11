import React from "react";
import type { WorkflowDesignerCluster, WorkflowDesignerCoreUser, WorkflowDesignerUser } from "../../types/context";
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
export default function WorkflowCompute({ compute, onToggle, onUpdate, showAdvancedOptions, accountUsers, accountUsersIsLoading, currentUser, clusters, }: WorkflowComputeProps): React.JSX.Element;
//# sourceMappingURL=WorkflowCompute.d.ts.map