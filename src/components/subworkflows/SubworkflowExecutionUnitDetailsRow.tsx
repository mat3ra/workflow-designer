import Accordion from "@mat3ra/cove/dist/mui/components/accordion/Accordion";
import type { NameResultSchema } from "@mat3ra/code/dist/js/utils/object";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import Grid from "@mui/material/Grid";
import React from "react";

import UnitDetails from "./UnitDetails";

export type SubworkflowExecutionUnitDetailsRowProps = {
    unit: AnySubworkflowUnit;
    index: number;
    editable: boolean;
    onUnitResultsChanged: (flowchartId: string, results: NameResultSchema[]) => void;
    onUnitIsDraftChanged: (flowchartId: string, isDraft: boolean) => void;
    onUnitMonitorChanged: (flowchartId: string, monitor: string, enabled: boolean) => void;
    onUnitPostProcessorChanged: (
        flowchartId: string,
        postProcessor: string,
        enabled: boolean,
    ) => void;
};

export function SubworkflowExecutionUnitDetailsRow({
    unit,
    index,
    editable,
    onUnitResultsChanged,
    onUnitIsDraftChanged,
    onUnitMonitorChanged,
    onUnitPostProcessorChanged,
}: SubworkflowExecutionUnitDetailsRowProps) {
    if (unit.type !== UnitType.execution) {
        return null;
    }

    return (
        <Grid item xs={12}>
            <Accordion data-tid={unit.name} isExpanded header={`Unit ${index}: ${unit.name}`}>
                <UnitDetails
                    unit={unit}
                    editable={editable}
                    onUnitResultsChanged={(results) => {
                        onUnitResultsChanged(unit.flowchartId, results);
                    }}
                    onUnitIsDraftChanged={(isDraft) => {
                        onUnitIsDraftChanged(unit.flowchartId, isDraft);
                    }}
                    onUnitMonitorChanged={(monitor, enabled) => {
                        onUnitMonitorChanged(unit.flowchartId, monitor, enabled);
                    }}
                    onUnitPostProcessorChanged={(postProcessor, enabled) => {
                        onUnitPostProcessorChanged(unit.flowchartId, postProcessor, enabled);
                    }}
                />
            </Accordion>
        </Grid>
    );
}
