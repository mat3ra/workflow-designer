import Checkbox from "@mat3ra/cove/dist/mui/components/checkbox/Checkbox";
import { Results } from "@mat3ra/ave";
import type { NameResultSchema } from "@mat3ra/code/dist/js/utils/object";
import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";
import { ApplicationRegistry } from "@mat3ra/standata";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";

import UnitProperties from "./UnitProperties";

const CheckboxComponent = Checkbox as any;

export interface UnitDetailsProps {
    unit: ExecutionUnitSchema;
    editable: boolean;
    onUnitResultsChanged: (results: NameResultSchema[]) => void;
    onUnitIsDraftChanged: (isChecked: boolean) => void;
    onUnitMonitorChanged: (monitor: string, enabled: boolean) => void;
    onUnitPostProcessorChanged: (postProcessor: string, enabled: boolean) => void;
}

const INDENT = 1;

function UnitDetails({
    unit,
    editable,
    onUnitResultsChanged,
    onUnitIsDraftChanged,
    onUnitMonitorChanged,
    onUnitPostProcessorChanged,
}: UnitDetailsProps) {
    const { isDraft } = unit;
    const selectedMonitors = useMemo(
        () => (unit.monitors ?? []).map((m) => m.name),
        [unit.monitors],
    );
    const selectedPostProcessors = useMemo(() => {
        return (unit.postProcessors ?? []).map((p) => p.name);
    }, [unit.postProcessors]);

    const registry = useMemo(() => new ApplicationRegistry(), []);

    const executable = useMemo(() => {
        return registry
            .getExecutablesByApplication({
                name: unit.application.name,
                version: unit.application.version,
            })
            .find((executable) => executable.name === unit.executable.name);
    }, [unit.application.name, unit.application.version, unit.executable.name, registry]);

    if (!executable) {
        console.error(`Executable ${unit.executable.name} not found`);
        return null;
    }

    return (
        <>
            <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.primary">
                    Properties
                </Typography>
                <UnitProperties
                    unit={unit}
                    onUnitResultsChanged={onUnitResultsChanged}
                    editable={editable}
                    allowedResults={executable.results}
                />
                <CheckboxComponent
                    className="is-draft"
                    id="draft-checkbox"
                    label="Draft"
                    checked={isDraft || false}
                    onChange={(checked) => onUnitIsDraftChanged(checked)}
                />
            </Stack>
            {(executable.monitors ?? []).length > 0 && (
                <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.primary">
                        Monitors
                    </Typography>
                    <Results
                        data_tid="monitors"
                        allowed={executable.monitors ?? []}
                        selected={selectedMonitors}
                        onChange={(monitor, enabled) => {
                            onUnitMonitorChanged(monitor.name, enabled);
                        }}
                    />
                </Stack>
            )}
            {(executable.postProcessors ?? []).length > 0 && (
                <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.primary">
                        PostProcessors
                    </Typography>
                    <Box sx={{ pl: INDENT }}>
                        <Results
                            data_tid="postprocessors"
                            allowed={executable.postProcessors ?? []}
                            selected={selectedPostProcessors}
                            onChange={(postProcessor, enabled) => {
                                onUnitPostProcessorChanged(postProcessor.name, enabled);
                            }}
                        />
                    </Box>
                </Stack>
            )}
        </>
    );
}

export default UnitDetails;
