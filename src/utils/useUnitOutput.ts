import { useEffect, useRef, useState } from "react";

import { type UnitOutputSource, useUnitOutputSource } from "../UnitOutputContext";
import {
    type UnitOutputState,
    EMPTY_UNIT_OUTPUT,
    mergeUnitOutputChunks,
} from "./mergeUnitOutputChunks";

const PAGE_SIZE = 1000;
const FLUSH_INTERVAL_MS = 500;
const POLL_INTERVAL_MS = 3000;

type UnitScope = { flowchartId: string; repetition: number };

function sleep(milliseconds: number, signal: AbortSignal) {
    return new Promise<void>((resolve) => {
        if (signal.aborted) {
            resolve();
            return;
        }
        const timeoutId = setTimeout(resolve, milliseconds);
        signal.addEventListener(
            "abort",
            () => {
                clearTimeout(timeoutId);
                resolve();
            },
            { once: true },
        );
    });
}

/**
 * Reads every chunk after `state`, page by page, publishing what has arrived at most every
 * {@link FLUSH_INTERVAL_MS} so a large output does not re-render the modal for every page.
 */
async function drainUnitOutput(
    loadChunks: UnitOutputSource["loadChunks"],
    scope: UnitScope,
    initialState: UnitOutputState,
    allowGaps: boolean,
    publish: (output: string) => void,
    signal: AbortSignal,
) {
    let state = initialState;
    let hasMorePages = true;
    let lastPublishedAt = 0;

    while (hasMorePages && !signal.aborted) {
        // eslint-disable-next-line no-await-in-loop
        const page = await loadChunks({
            ...scope,
            afterOrder: state.nextOrder > 0 ? state.nextOrder - 1 : undefined,
            limit: PAGE_SIZE,
        });
        const mergedState = mergeUnitOutputChunks(state, page, allowGaps);

        // A full page that did not advance ends at a gap: wait for the missing chunk.
        hasMorePages = page.length === PAGE_SIZE && mergedState.nextOrder > state.nextOrder;
        state = mergedState;

        if (
            !signal.aborted &&
            (!hasMorePages || Date.now() - lastPublishedAt >= FLUSH_INTERVAL_MS)
        ) {
            publish(state.output);
            lastPublishedAt = Date.now();
        }
    }

    return state;
}

/**
 * Loads the unit's output, then keeps reading new chunks while the job is live. A read that
 * starts after the job has ended is the last one: it accepts gaps and the loop stops.
 */
async function followUnitOutput(
    { loadChunks, ...scope }: UnitScope & Pick<UnitOutputSource, "loadChunks">,
    isLive: () => boolean,
    publish: (output: string) => void,
    signal: AbortSignal,
) {
    let state = EMPTY_UNIT_OUTPUT;
    let isFirstRead = true;

    while (!signal.aborted) {
        const isFinalRead = !isLive();
        // A background tab or offline browser skips polls, never the first or the last read.
        const shouldRead = isFirstRead || isFinalRead || (!document.hidden && navigator.onLine);

        if (shouldRead) {
            try {
                // eslint-disable-next-line no-await-in-loop
                state = await drainUnitOutput(
                    loadChunks,
                    scope,
                    state,
                    isFinalRead,
                    publish,
                    signal,
                );
            } catch (error) {
                console.error(error);
            }
        }
        isFirstRead = false;

        if (isFinalRead) {
            return;
        }
        // eslint-disable-next-line no-await-in-loop
        await sleep(POLL_INTERVAL_MS, signal);
    }
}

/**
 * Stdout of one unit repetition. Nothing is read until the job has output; the first read
 * happens when the host mounts the caller (the unit modal opens) and everything stops when it
 * unmounts. While the job is live, new chunks are polled for; once it ends, one last read
 * completes the output.
 */
export function useUnitOutput(flowchartId: string, repetition: number): string {
    const { loadChunks, hasOutput, isLive } = useUnitOutputSource();
    const [output, setOutput] = useState("");
    const isLiveRef = useRef(isLive);

    useEffect(() => {
        isLiveRef.current = isLive;
    }, [isLive]);

    useEffect(() => {
        if (!hasOutput) {
            return undefined;
        }

        const abortController = new AbortController();

        setOutput("");
        followUnitOutput(
            { loadChunks, flowchartId, repetition },
            () => isLiveRef.current,
            setOutput,
            abortController.signal,
        ).catch(console.error);

        return () => abortController.abort();
    }, [loadChunks, flowchartId, repetition, hasOutput]);

    return output;
}
