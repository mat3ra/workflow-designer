import React from "react";

export type UnitOutputChunk = {
    order: number;
    chunk: string;
};

export type LoadUnitOutputChunksParams = {
    flowchartId: string;
    repetition: number;
    /** Only chunks with a greater `order` are wanted; omitted for the first page. */
    afterOrder?: number;
    limit: number;
};

/**
 * Where an open unit modal gets its stdout from. The host app owns the data access and the job
 * state; the modal loads on mount and stops on unmount, so output is only fetched for a unit
 * somebody is looking at. The default has no output, so hosts without a job (the standalone
 * workflow designer) render the modal unchanged.
 */
export type UnitOutputSource = {
    /** One page of the unit repetition's chunks, ascending by `order`. Must be referentially stable. */
    loadChunks: (params: LoadUnitOutputChunksParams) => Promise<UnitOutputChunk[]>;
    /** The job has started, so its units may have output. */
    hasOutput: boolean;
    /** The job is still running, so more chunks may arrive. */
    isLive: boolean;
};

const defaultUnitOutputSource: UnitOutputSource = {
    loadChunks: async () => [],
    hasOutput: false,
    isLive: false,
};

export const UnitOutputContext = React.createContext<UnitOutputSource>(defaultUnitOutputSource);

export function useUnitOutputSource(): UnitOutputSource {
    return React.useContext(UnitOutputContext);
}
