/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    getWorkflowDesignerTabResetKey,
    shouldResetWorkflowDesignerUiState,
} from "@mat3ra/workflow-designer/src/components/workflows/workflowDesignerTabState";
import assert from "node:assert";
import test from "node:test";

test("getWorkflowDesignerTabResetKey uses workflow _id", () => {
    assert.strictEqual(getWorkflowDesignerTabResetKey({ _id: "map-wf-1" } as never), "map-wf-1");
});

test("shouldResetWorkflowDesignerUiState is false when only the workflow object reference changed", () => {
    const previousKey = getWorkflowDesignerTabResetKey({ _id: "map-wf-1" } as never);
    const nextKey = getWorkflowDesignerTabResetKey({ _id: "map-wf-1" } as never);

    assert.strictEqual(shouldResetWorkflowDesignerUiState(previousKey, nextKey), false);
});

test("shouldResetWorkflowDesignerUiState is true when switching to another workflow", () => {
    assert.strictEqual(
        shouldResetWorkflowDesignerUiState(
            getWorkflowDesignerTabResetKey({ _id: "map-wf-1" } as never),
            getWorkflowDesignerTabResetKey({ _id: "map-wf-2" } as never),
        ),
        true,
    );
});
