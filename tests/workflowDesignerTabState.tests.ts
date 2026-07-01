/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import {
    getWorkflowDesignerTabResetKey,
    shouldResetWorkflowDesignerUiState,
} from "../src/components/workflows/workflowDesignerTabState";

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
