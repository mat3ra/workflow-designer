import type { Workflow } from "@mat3ra/wode";
export type SaveWorkflowFromDesigner = (params: {
    workflow: Workflow;
    omitRedirect: boolean;
}) => Promise<void>;
export declare function reportWorkflowSaveError(err: unknown): void;
//# sourceMappingURL=persistWorkflowDesigner.d.ts.map