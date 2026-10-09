/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    EMPTY_UNIT_OUTPUT,
    mergeUnitOutputChunks,
} from "@mat3ra/workflow-designer/src/utils/mergeUnitOutputChunks";
import assert from "node:assert";
import test from "node:test";

test("mergeUnitOutputChunks appends consecutive chunks in order", () => {
    const state = mergeUnitOutputChunks(EMPTY_UNIT_OUTPUT, [
        { order: 0, chunk: "a" },
        { order: 1, chunk: "b" },
    ]);

    assert.deepStrictEqual(state, { output: "ab", nextOrder: 2 });
});

test("mergeUnitOutputChunks continues from the previous state", () => {
    const first = mergeUnitOutputChunks(EMPTY_UNIT_OUTPUT, [{ order: 0, chunk: "a" }]);
    const second = mergeUnitOutputChunks(first, [{ order: 1, chunk: "b" }]);

    assert.deepStrictEqual(second, { output: "ab", nextOrder: 2 });
});

test("mergeUnitOutputChunks skips chunks it already has", () => {
    const first = mergeUnitOutputChunks(EMPTY_UNIT_OUTPUT, [
        { order: 0, chunk: "a" },
        { order: 1, chunk: "b" },
    ]);
    const second = mergeUnitOutputChunks(first, [
        { order: 1, chunk: "b" },
        { order: 2, chunk: "c" },
    ]);

    assert.deepStrictEqual(second, { output: "abc", nextOrder: 3 });
});

test("mergeUnitOutputChunks holds chunks that follow a gap while the job runs", () => {
    const state = mergeUnitOutputChunks(EMPTY_UNIT_OUTPUT, [
        { order: 0, chunk: "a" },
        { order: 2, chunk: "c" },
        { order: 3, chunk: "d" },
    ]);

    assert.deepStrictEqual(state, { output: "a", nextOrder: 1 });
});

test("mergeUnitOutputChunks releases held chunks once the missing one is read", () => {
    const held = mergeUnitOutputChunks(EMPTY_UNIT_OUTPUT, [
        { order: 0, chunk: "a" },
        { order: 2, chunk: "c" },
    ]);
    // The next read starts after the last appended chunk, so it returns the gap and what follows.
    const released = mergeUnitOutputChunks(held, [
        { order: 1, chunk: "b" },
        { order: 2, chunk: "c" },
    ]);

    assert.deepStrictEqual(released, { output: "abc", nextOrder: 3 });
});

test("mergeUnitOutputChunks accepts a gap once the job has ended", () => {
    const state = mergeUnitOutputChunks(
        EMPTY_UNIT_OUTPUT,
        [
            { order: 0, chunk: "a" },
            { order: 2, chunk: "c" },
        ],
        true,
    );

    assert.deepStrictEqual(state, { output: "ac", nextOrder: 3 });
});
