import type { UnitOutputChunk } from "../UnitOutputContext";

export type UnitOutputState = {
    output: string;
    /** `order` of the chunk that continues `output`; chunks count up from 0. */
    nextOrder: number;
};

export const EMPTY_UNIT_OUTPUT: UnitOutputState = { output: "", nextOrder: 0 };

/**
 * Appends `chunks` (ascending by `order`) to the unit's output. Chunks are written one message
 * at a time, so a later chunk can be stored before an earlier one: while the job runs only the
 * next expected chunk is appended and anything after a gap waits for the next read. Once the
 * job has ended (`allowGaps`) a chunk that never arrived must not hold the rest back.
 * Chunks older than the expected one are duplicates and are skipped.
 */
export function mergeUnitOutputChunks(
    state: UnitOutputState,
    chunks: UnitOutputChunk[],
    allowGaps = false,
): UnitOutputState {
    let { output, nextOrder } = state;

    chunks.forEach(({ order, chunk }) => {
        if (order < nextOrder || (order > nextOrder && !allowGaps)) {
            return;
        }
        output += chunk;
        nextOrder = order + 1;
    });

    return { output, nextOrder };
}
