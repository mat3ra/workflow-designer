import React from "react";
/**
 * Carries webapp-specific component implementations into the workflow designer tree without
 * prop-drilling through wove internals (e.g. `UnitsFlowchartContainer → UnitModal → …`).
 * All values default to no-ops so the standalone demo works without providing any.
 */
export type WorkflowComponents = {
    EntityHeaderComponent: React.ComponentType<Record<string, unknown>>;
    EntityNameComponent: React.ComponentType<Record<string, unknown>>;
    MetadataComponent: React.ComponentType<Record<string, unknown>>;
    HistoryComponent: React.ComponentType<{
        items: Array<Record<string, unknown>>;
    }>;
    SubworkflowFormTitleComponent: React.ComponentType<{
        title: string;
    }>;
    PseudoFormComponent: React.ComponentType<Record<string, unknown>>;
    DataGridComponent: React.ComponentType<Record<string, unknown>>;
    getDefaultComputeConfig: (cluster?: unknown) => Record<string, unknown>;
    generateEntityId: () => string;
};
export declare const WorkflowComponentsContext: React.Context<WorkflowComponents>;
export declare function useWorkflowComponents(): WorkflowComponents;
//# sourceMappingURL=WorkflowComponentsContext.d.ts.map