/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    formatStepNumber,
    formatStepSummary,
    getWorkflowSteps,
} from "@mat3ra/workflow-designer/src/components/workflows/workflowSteps";
import assert from "node:assert";
import test from "node:test";

const WORKFLOW = {
    unitInstances: [
        { flowchartId: "a", name: "CP-MD", type: "subworkflow", id: "sw1", status: "idle" },
        { flowchartId: "b", name: "DeePMD", type: "subworkflow", id: "sw2" },
        { flowchartId: "c", name: "Sweep", type: "map", workflowId: "wf1" },
    ],
    subworkflowInstances: [
        { id: "sw1", application: { name: "espresso" }, units: [{}] },
        { id: "sw2", application: { name: "deepmd" }, units: [{}, {}, {}, {}] },
    ],
    workflowInstances: [{ id: "wf1", units: [{}, {}] }],
};

test("a step reports the engine it runs and how many units it holds", () => {
    const steps = getWorkflowSteps(WORKFLOW);
    assert.strictEqual(steps.length, 3);
    assert.deepStrictEqual(steps[0], {
        index: 0,
        flowchartId: "a",
        name: "CP-MD",
        type: "subworkflow",
        application: "espresso",
        unitCount: 1,
    });
    assert.strictEqual(steps[1].unitCount, 4);
});

test("a map step counts the units of the workflow it maps over", () => {
    const [, , mapStep] = getWorkflowSteps(WORKFLOW);
    assert.strictEqual(mapStep.type, "map");
    assert.strictEqual(mapStep.unitCount, 2);
    assert.strictEqual(mapStep.application, undefined);
});

test("idle steps carry no status — a workflow being designed has never run", () => {
    const steps = getWorkflowSteps(WORKFLOW);
    assert.ok(steps.every((step) => step.status === undefined));
});

test("a real status is kept", () => {
    const [step] = getWorkflowSteps({
        unitInstances: [{ flowchartId: "a", name: "Run", type: "subworkflow", status: "error" }],
    });
    assert.strictEqual(step.status, "error");
});

test("units missing a name or id still produce a selectable step", () => {
    const steps = getWorkflowSteps({ unitInstances: [{}, {}] });
    assert.deepStrictEqual(
        steps.map((step) => step.name),
        ["Step 1", "Step 2"],
    );
    assert.deepStrictEqual(
        steps.map((step) => step.flowchartId),
        ["0", "1"],
    );
});

test("an absent or empty workflow yields no steps rather than throwing", () => {
    assert.deepStrictEqual(getWorkflowSteps(undefined), []);
    assert.deepStrictEqual(getWorkflowSteps({}), []);
});

test("step numbers are padded so the rail reads as an ordered list", () => {
    assert.strictEqual(formatStepNumber(0), "01");
    assert.strictEqual(formatStepNumber(9), "10");
    assert.strictEqual(formatStepNumber(99), "100");
});

test("the summary drops whichever half a step does not have", () => {
    const [espresso, , map] = getWorkflowSteps(WORKFLOW);
    assert.strictEqual(formatStepSummary(espresso), "espresso · 1 unit");
    assert.strictEqual(formatStepSummary(map), "2 units");
    assert.strictEqual(
        formatStepSummary({ index: 0, flowchartId: "x", name: "n", type: "assignment" }),
        "assignment",
    );
});
