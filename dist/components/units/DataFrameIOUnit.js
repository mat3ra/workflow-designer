import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/no-array-index-key */
import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { DataFrameIOUnitResultCheckbox } from "@mat3ra/wove";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import math from "mathjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "underscore";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
const ID_COLUMN = "exabyteId";
function columnComparer(a, b, targets) {
    if (a === ID_COLUMN || targets.indexOf(a) > -1)
        return -1;
    if (b === ID_COLUMN || targets.indexOf(b) > -1)
        return 1;
    return 0;
}
function getRows(unit, materials) {
    const featuresToShow = [ID_COLUMN].concat(unit.features);
    const targetsToShow = unit.targets;
    return materials.map((materialUntyped) => {
        const material = materialUntyped;
        const characteristics = material
            .bestCharacteristics()
            .map((x) => {
            try {
                return x.flattenProperties();
            }
            catch (_a) {
                return null;
            }
        })
            .filter((x) => x !== null);
        const dict = _.pick(material.propertiesDict(_.flatten(characteristics)), featuresToShow.concat(targetsToShow));
        return _.mapObject(dict, (value) => {
            return _.isNumber(value) ? math.round(value, 3) : value;
        });
    });
}
function getColumns(unit, materials) {
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
export function DataFrameIOUnit({ unit: unitPropUntyped, editable = true, adjustable = false, onUpdate, materials, }) {
    const { SubworkflowFormTitleComponent, DataGridComponent } = useWorkflowComponents();
    const unitProp = unitPropUntyped;
    const [entity, setEntity] = useState(() => {
        const u = unitProp;
        u.setMaterials(materials);
        return u;
    });
    const [rows, setRows] = useState(() => getRows(unitProp, materials));
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
        var _a, _b, _c;
        const methodData = (_c = (_b = (_a = entity === null || entity === void 0 ? void 0 : entity.context) === null || _a === void 0 ? void 0 : _a.model) === null || _b === void 0 ? void 0 : _b.method) === null || _c === void 0 ? void 0 : _c.data;
        return editable || (adjustable && !methodData);
    }, [entity, editable, adjustable]);
    const updateUnitColumns = useCallback((unitAfter) => {
        setEntity(unitAfter);
        const nextRows = getRows(unitAfter, materials);
        const nextColumns = getColumns(unitAfter, materials);
        setRows(nextRows);
        setColumns(nextColumns);
    }, [materials]);
    const handleGridSort = useCallback((sortColumn, sortDirection) => {
        setRows((prev) => {
            let next;
            switch (sortDirection) {
                case "ASC":
                    next = [...prev].sort((a, b) => a[sortColumn] > b[sortColumn]
                        ? 1
                        : -1);
                    break;
                case "DESC":
                    next = [...prev].sort((a, b) => a[sortColumn] < b[sortColumn]
                        ? 1
                        : -1);
                    break;
                default:
                    next = getRows(entity, materials).slice(0);
                    break;
            }
            return next;
        });
    }, [entity, materials]);
    const allTargetsSelected = useCallback(() => {
        return entity.defaultTargets.every((target) => entity.targets.includes(target));
    }, [entity]);
    const allFeaturesSelected = useCallback(() => {
        return entity.availableFeaturesWithoutId.every((feature) => entity.features.includes(feature));
    }, [entity]);
    const onFeatureToggle = useCallback((feature, selected) => {
        const u = entity;
        if (selected) {
            u.addFeature(feature);
        }
        else {
            try {
                u.removeFeature(feature);
            }
            catch (e) {
                showErrorAlert(e.message);
            }
        }
        updateUnitColumns(u);
    }, [entity, updateUnitColumns]);
    const onFeaturesToggle = useCallback((features, selected) => {
        const u = entity;
        if (selected) {
            features.forEach((f) => u.addFeature(f));
        }
        else {
            features.forEach((f) => {
                try {
                    u.removeFeature(f);
                }
                catch (e) {
                    showErrorAlert(e.message);
                }
            });
        }
        updateUnitColumns(u);
    }, [entity, updateUnitColumns]);
    const onTargetToggle = useCallback((target, selected) => {
        const u = entity;
        if (selected) {
            u.addTarget(target);
        }
        else {
            try {
                u.removeTarget(target);
            }
            catch (e) {
                showErrorAlert(e.message);
            }
        }
        updateUnitColumns(u);
    }, [entity, updateUnitColumns]);
    const onTargetsToggle = useCallback((targets, selected) => {
        const u = entity;
        if (selected) {
            targets.forEach((t) => u.addTarget(t));
        }
        else {
            targets.forEach((t) => {
                try {
                    u.removeTarget(t);
                }
                catch (e) {
                    showErrorAlert(e.message);
                }
            });
        }
        updateUnitColumns(u);
    }, [entity, updateUnitColumns]);
    const validationBlock = useMemo(() => {
        const errors = entity.validationErrors();
        if (errors.length > 0 && !editable) {
            return (_jsxs(_Fragment, { children: [_jsx(SubworkflowFormTitleComponent, { title: "Validation" }), _jsx(Stack, { spacing: 2, children: errors.map((err, index) => (_jsx(Alert, { className: "unit-validation-message", severity: "warning", children: err.message }, index))) })] }));
        }
        return null;
    }, [entity, editable]);
    return (_jsxs(Stack, { children: [_jsx(SubworkflowFormTitleComponent, { title: "DataFrame" }), _jsx(DataGridComponent, { rows: rows, columns: columns, onGridSort: handleGridSort }), validationBlock, _jsxs(_Fragment, { children: [_jsx(SubworkflowFormTitleComponent, { title: "Targets" }), _jsxs(Grid, { container: true, children: [entity.defaultTargets.map((t) => (_jsx(DataFrameIOUnitResultCheckbox, { id: t, label: t, checked: entity.hasTarget(t), disabled: !isEditable, onChange: (checked) => {
                                    onTargetToggle(t, checked);
                                } }, t))), _jsx(DataFrameIOUnitResultCheckbox, { id: "select-all-t", label: "select all", checked: allTargetsSelected(), disabled: !isEditable, onChange: (checked) => onTargetsToggle(entity.defaultTargets, checked) }, "select-all-t")] })] }), _jsxs(_Fragment, { children: [_jsx(SubworkflowFormTitleComponent, { title: "Features" }), _jsxs(Grid, { container: true, children: [entity.availableFeaturesWithoutId.map((f) => (_jsx(DataFrameIOUnitResultCheckbox, { id: f, label: f, checked: entity.hasFeature(f), disabled: !isEditable, onChange: (checked) => onFeatureToggle(f, checked) }, f))), _jsx(DataFrameIOUnitResultCheckbox, { id: "select-all-f", label: "select all", checked: allFeaturesSelected(), disabled: !isEditable, onChange: (checked) => onFeaturesToggle(entity.availableFeaturesWithoutId, checked) }, "select-all-f")] })] })] }));
}
