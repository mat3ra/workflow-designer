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
    /**
     * Optional rich Brillouin-zone image renderer (e.g. @mat3ra/move's BrillouinZoneImage).
     * Intentionally left undefined by default (not defaulted to a no-op like the other
     * components above) so wove's own ExtraImportantSettingsByContextProvider can fall back to
     * its package-native plain <img> default when the host app doesn't provide one.
     */
    BrillouinZoneImageComponent?: React.ComponentType<{
        latticeType?: string;
        imgSrc?: string;
        description?: string;
    }>;
};
export declare const WorkflowComponentsContext: React.Context<WorkflowComponents>;
export declare function useWorkflowComponents(): WorkflowComponents;
//# sourceMappingURL=WorkflowComponentsContext.d.ts.map