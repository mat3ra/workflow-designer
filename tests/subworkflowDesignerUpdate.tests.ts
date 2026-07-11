/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    applySubworkflowUpdateToWorkflow,
    isWodeSubworkflowInstance,
} from "@mat3ra/workflow-designer/src/utils/subworkflowDesignerUpdate";
import assert from "node:assert";
import test from "node:test";

test("isWodeSubworkflowInstance detects live wode subworkflow instances", () => {
    assert.strictEqual(isWodeSubworkflowInstance({ unitsInstances: [] } as never), true);
    assert.strictEqual(isWodeSubworkflowInstance({ _id: "sw-1" } as never), false);
});

test("applySubworkflowUpdateToWorkflow updates subworkflows JSON by schema _id", () => {
    const first = { _id: "sw-1", name: "first" };
    const second = { _id: "sw-2", name: "second" };
    const workflow = {
        subworkflowInstances: [{ id: "sw-1" }, { id: "sw-2" }],
        subworkflows: [first, second],
    };

    const updatedSecond = { ...second, name: "second with convergence" };

    assert.strictEqual(
        applySubworkflowUpdateToWorkflow(workflow as never, updatedSecond as never, [], []),
        true,
    );
    assert.strictEqual(workflow.subworkflows[1], updatedSecond);
    assert.strictEqual(workflow.subworkflows[0], first);
});

test("applySubworkflowUpdateToWorkflow replaces subworkflowInstances when given a live entity", () => {
    const existing = { id: "sw-1", updateMethodData: () => undefined };
    const replacement = {
        id: "sw-1",
        unitsInstances: [{ name: "init parameter" }],
        toJSON: () => ({ _id: "sw-1", units: [{ name: "init parameter" }] }),
        updateMethodData: () => undefined,
    };
    const workflow = {
        subworkflowInstances: [existing],
        subworkflows: [{ _id: "sw-1", units: [] }],
    };

    assert.strictEqual(
        applySubworkflowUpdateToWorkflow(workflow as never, replacement as never, [], []),
        true,
    );
    assert.strictEqual(workflow.subworkflowInstances[0], replacement);
    assert.deepStrictEqual(workflow.subworkflows[0], replacement.toJSON());
});
