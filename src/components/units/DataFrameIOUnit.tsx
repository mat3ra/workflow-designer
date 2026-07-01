/* eslint-disable react/no-array-index-key */
import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import type { DataIOUnitSchema } from "@mat3ra/esse/dist/js/types";
import type { Material } from "@mat3ra/made";
import type IOUnit from "@mat3ra/wode/dist/js/units/IOUnit";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import math from "mathjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "underscore";

import { DataFrameIOUnitResultCheckbox } from "@mat3ra/wove";

const ID_COLUMN = "exabyteId";

type MaterialWithCharacteristics = Material & {
    bestCharacteristics: () => { flattenProperties: () => unknown }[];
    propertiesDict: (flat: unknown[]) => Record<string, unknown>;
};

type DataFrameUnit = IOUnit & {
    setMaterials: (materials: Material[]) => void;
    targets: string[];
    features: string[];
    availableFeaturesWithoutId: string[];
    defaultTargets: string[];
    addFeature: (f: string) => void;
    removeFeature: (f: string) => void;
    addTarget: (t: string) => void;
    removeTarget: (t: string) => void;
    hasFeature: (f: string) => boolean;
    hasTarget: (t: string) => boolean;
    validationErrors: () => { message: string }[];
    context?: { model?: { method?: { data?: unknown } } };
};

type GridRow = Record<string, unknown>;

function columnComparer(a: string, b: string, targets: string[]): number {
    if (a === ID_COLUMN || targets.indexOf(a) > -1) return -1;
    if (b === ID_COLUMN || targets.indexOf(b) > -1) return 1;
    return 0;
}

function getRows(unit: DataFrameUnit, materials: Material[]): GridRow[] {
    const featuresToShow = [ID_COLUMN].concat(unit.features);
    const targetsToShow = unit.targets;

    return materials.map((materialUntyped) => {
        const material = materialUntyped as MaterialWithCharacteristics;
        const characteristics = material
            .bestCharacteristics()
            .map((x) => {
                try {
                    return x.flattenProperties();
                } catch {
                    return null;
                }
            })
            .filter((x) => x !== null);

        const dict = _.pick(
            material.propertiesDict(_.flatten(characteristics)),
            featuresToShow.concat(targetsToShow),
        );
        return _.mapObject(dict, (value) => {
            return _.isNumber(value) ? math.round(value as number, 3) : value;
        }) as GridRow;
    });
}

function getColumns(unit: DataFrameUnit, materials: Material[]) {
    const rows = getRows(unit, materials);
    const targetColumnKeys = unit.targets;
    const columnKeys = _.uniq(_.flatten(rows.map((x) => _.keys(x))).concat(targetColumnKeys));

    return columnKeys
        .sort((a, b) => columnComparer(a, b, targetColumnKeys))
        .map((x) => {
            const isFrozen = [ID_COLUMN, ...targetColumnKeys].indexOf(x) > -1;

            return {
                key: x,
                name: x,
                resizable: true,
                sortable: true,
                width: isFrozen ? 140 : undefined,
                frozen: isFrozen,
            };
        });
}

export type DataFrameIOUnitProps = {
    /** Runtime IO unit with DataFrame helpers (wode typings are incomplete). */
    unit: IOUnit;
    editable?: boolean;
    adjustable?: boolean;
    onUpdate: (unit: DataIOUnitSchema) => void;
    materials: Material[];
};

export function DataFrameIOUnit({
    unit: unitPropUntyped,
    editable = true,
    adjustable = false,
    onUpdate,
    materials,
}: DataFrameIOUnitProps) {
    const { SubworkflowFormTitleComponent, DataGridComponent } = useWorkflowComponents();
    const unitProp = unitPropUntyped as DataFrameUnit;
    const [entity, setEntity] = useState<DataFrameUnit>(() => {
        const u = unitProp;
        u.setMaterials(materials);
        return u;
    });
    const [rows, setRows] = useState<GridRow[]>(() => getRows(unitProp, materials));
    const [columns, setColumns] = useState(() => getColumns(unitProp, materials));

    const entityRef = useRef(entity);
    entityRef.current = entity;
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    useEffect(() => {
        return () => {
            onUpdateRef.current(entityRef.current.toJSON());
        };
    }, []);

    useEffect(() => {
        unitProp.setMaterials(materials);
        setEntity(unitProp);
        setRows(getRows(unitProp, materials));
        setColumns(getColumns(unitProp, materials));
    }, [unitProp, materials]);

    const isEditable = useMemo(() => {
        const methodData = entity?.context?.model?.method?.data;
        return editable || (adjustable && !methodData);
    }, [entity, editable, adjustable]);

    const updateUnitColumns = useCallback(
        (unitAfter: DataFrameUnit) => {
            setEntity(unitAfter);
            const nextRows = getRows(unitAfter, materials);
            const nextColumns = getColumns(unitAfter, materials);
            setRows(nextRows);
            setColumns(nextColumns);
        },
        [materials],
    );

    const handleGridSort = useCallback(
        (sortColumn: string, sortDirection: string) => {
            setRows((prev) => {
                let next: GridRow[];
                switch (sortDirection) {
                    case "ASC":
                        next = [...prev].sort((a, b) =>
                            (a[sortColumn] as string | number) > (b[sortColumn] as string | number)
                                ? 1
                                : -1,
                        );
                        break;
                    case "DESC":
                        next = [...prev].sort((a, b) =>
                            (a[sortColumn] as string | number) < (b[sortColumn] as string | number)
                                ? 1
                                : -1,
                        );
                        break;
                    default:
                        next = getRows(entity, materials).slice(0);
                        break;
                }
                return next;
            });
        },
        [entity, materials],
    );

    const allTargetsSelected = useCallback(() => {
        return entity.defaultTargets.every((target) => entity.targets.includes(target));
    }, [entity]);

    const allFeaturesSelected = useCallback(() => {
        return entity.availableFeaturesWithoutId.every((feature) =>
            entity.features.includes(feature),
        );
    }, [entity]);

    const onFeatureToggle = useCallback(
        (feature: string, selected: boolean) => {
            const u = entity;
            if (selected) {
                u.addFeature(feature);
            } else {
                try {
                    u.removeFeature(feature);
                } catch (e) {
                    showErrorAlert((e as Error).message);
                }
            }
            updateUnitColumns(u);
        },
        [entity, updateUnitColumns],
    );

    const onFeaturesToggle = useCallback(
        (features: string[], selected: boolean) => {
            const u = entity;
            if (selected) {
                features.forEach((f) => u.addFeature(f));
            } else {
                features.forEach((f) => {
                    try {
                        u.removeFeature(f);
                    } catch (e) {
                        showErrorAlert((e as Error).message);
                    }
                });
            }
            updateUnitColumns(u);
        },
        [entity, updateUnitColumns],
    );

    const onTargetToggle = useCallback(
        (target: string, selected: boolean) => {
            const u = entity;
            if (selected) {
                u.addTarget(target);
            } else {
                try {
                    u.removeTarget(target);
                } catch (e) {
                    showErrorAlert((e as Error).message);
                }
            }
            updateUnitColumns(u);
        },
        [entity, updateUnitColumns],
    );

    const onTargetsToggle = useCallback(
        (targets: string[], selected: boolean) => {
            const u = entity;
            if (selected) {
                targets.forEach((t) => u.addTarget(t));
            } else {
                targets.forEach((t) => {
                    try {
                        u.removeTarget(t);
                    } catch (e) {
                        showErrorAlert((e as Error).message);
                    }
                });
            }
            updateUnitColumns(u);
        },
        [entity, updateUnitColumns],
    );

    const validationBlock = useMemo(() => {
        const errors = entity.validationErrors();
        if (errors.length > 0 && !editable) {
            return (
                <>
                    <SubworkflowFormTitleComponent title="Validation" />
                    <Stack spacing={2}>
                        {errors.map((err, index) => (
                            <Alert
                                className="unit-validation-message"
                                severity="warning"
                                key={index}>
                                {err.message}
                            </Alert>
                        ))}
                    </Stack>
                </>
            );
        }
        return null;
    }, [entity, editable]);

    return (
        <Stack>
            <SubworkflowFormTitleComponent title="DataFrame" />
            <DataGridComponent rows={rows} columns={columns} onGridSort={handleGridSort} />
            {validationBlock}
            <>
                <SubworkflowFormTitleComponent title="Targets" />
                <Grid container>
                    {entity.defaultTargets.map((t) => (
                        <DataFrameIOUnitResultCheckbox
                            key={t}
                            id={t}
                            label={t}
                            checked={entity.hasTarget(t)}
                            disabled={!isEditable}
                            onChange={(checked) => {
                                onTargetToggle(t, checked);
                            }}
                        />
                    ))}
                    <DataFrameIOUnitResultCheckbox
                        key="select-all-t"
                        id="select-all-t"
                        label="select all"
                        checked={allTargetsSelected()}
                        disabled={!isEditable}
                        onChange={(checked) => onTargetsToggle(entity.defaultTargets, checked)}
                    />
                </Grid>
            </>
            <>
                <SubworkflowFormTitleComponent title="Features" />
                <Grid container>
                    {entity.availableFeaturesWithoutId.map((f) => (
                        <DataFrameIOUnitResultCheckbox
                            key={f}
                            id={f}
                            label={f}
                            checked={entity.hasFeature(f)}
                            disabled={!isEditable}
                            onChange={(checked) => onFeatureToggle(f, checked)}
                        />
                    ))}
                    <DataFrameIOUnitResultCheckbox
                        key="select-all-f"
                        id="select-all-f"
                        label="select all"
                        checked={allFeaturesSelected()}
                        disabled={!isEditable}
                        onChange={(checked) =>
                            onFeaturesToggle(entity.availableFeaturesWithoutId, checked)
                        }
                    />
                </Grid>
            </>
        </Stack>
    );
}
