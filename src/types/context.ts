/**
 * Package-local type definitions that replace webapp-specific types
 * (previously imported from /imports/client/..., /imports/core/..., /imports/schemas/...).
 *
 * These are structural (duck-typed) so that webapp objects automatically satisfy them
 * at the boundary — no casting required in the webapp wrapper.
 */

/** Replaces FulfilledUserState — only the shape actually used in components. */
import type { TabItem } from "@mat3ra/cove/dist/mui/components/tabs/types";
import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";

export interface WorkflowDesignerUser {
    entity: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        [key: string]: unknown;
    };
    account?: WorkflowDesignerAccount;
    [key: string]: unknown;
}

/** Replaces FulfilledAccountState — only fields actually used. */
export interface WorkflowDesignerAccount {
    entity: {
        id: string;
        slug?: string;
        name?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

/** Replaces FulfilledProfileState — only fields actually used. */
export interface WorkflowDesignerProfile {
    user: WorkflowDesignerUser;
    personalAccount: WorkflowDesignerAccount;
    account: WorkflowDesignerAccount;
    [key: string]: unknown;
}

/** Replaces WebappBackendNodesSchema — the shape used for cluster listing. */
export interface WorkflowDesignerCluster {
    name: string;
    slug?: string;
    [key: string]: unknown;
}

/** Replaces ReduxDialogState<T> — open/close/isOpen contract. */
export interface WorkflowDesignerDialogState {
    isOpen: boolean;
    open: (...args: unknown[]) => void;
    close: () => void;
    [key: string]: unknown;
}

/** Replaces the two-entry dialogs object used in Workflow / Subworkflow / SubworkflowMethodPanel. */
export interface WorkflowDesignerDialogs {
    pseudoUploadReduxDialog: WorkflowDesignerDialogState;
    unitTypeReduxDialog: WorkflowDesignerDialogState;
}

/** Replaces CoreMetaPropertyHolder. */
export type WorkflowDesignerMetaProperty = Record<string, unknown>;

/** Replaces CorePropertyHolder. */
export type WorkflowDesignerProperty = Record<string, unknown>;

/**
 * A tab a unit publishes on top of the viewer's built-in ones; threaded through untouched.
 * Derived from cove's `TabItem`, which is what ave ultimately renders these as.
 */
export type WorkflowDesignerExtraTab = Required<Pick<TabItem, "id" | "itemName" | "href">>;

/** Extra viewer tabs per unit flowchart id, then per repetition (mapped units run once per branch). */
export type WorkflowDesignerExtraTabsByUnit = Record<
    string,
    Record<number, WorkflowDesignerExtraTab[]>
>;

/** Replaces WebappMetaPropertyHolderSchema — the return type of createMetaProperty. */
export type WorkflowDesignerMetaPropertySchema = Record<string, unknown>;

/** Replaces MetaPropertiesCreatePropertyConfig — the argument to createMetaProperty. */
export type WorkflowDesignerCreateMetaPropertyConfig = Record<string, unknown>;

/** Replaces TabItem from /imports/client/types. */
export interface WorkflowDesignerTabItem {
    itemName: string;
    [key: string]: unknown;
}

/** Replaces CoreUser (the user entity object, e.g. profile.user.entity). */
export interface WorkflowDesignerCoreUser {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: unknown;
}

/** Replaces AccessType from CoreTeam. */
export type WorkflowDesignerAccessType = string;

/** Replaces ExecutionUnitSchema from /imports/schemas. */
export type WorkflowDesignerExecutionUnitSchema = ExecutionUnitSchema;

/** Replaces HistorySchema["history"]. */
export type WorkflowDesignerHistory = Array<Record<string, unknown>>;
