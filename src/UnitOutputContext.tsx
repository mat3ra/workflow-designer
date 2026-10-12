import React from "react";

/** The stdout of one unit repetition. The host app supplies it and owns loading and polling. */
export type UseUnitOutput = (flowchartId: string, repetition: number) => string;

// Hosts without a job (the standalone workflow designer) have no output.
export const UnitOutputContext = React.createContext<UseUnitOutput>(() => "");
