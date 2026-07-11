import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import { buildNamedEntitySchema } from "@mat3ra/code/dist/js/utils/schemas";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { useMemo, useState } from "react";
const uiSchema = {
    "ui:options": {
        orderable: false,
    },
    "ui:submitButtonOptions": {
        submitText: "Save",
        props: {
            "data-tid": "save-properties",
        },
    },
};
const getUnitResults = (unit) => {
    return (unit.results || []).map(safeMakeObject);
};
function UnitProperties({ unit, onUnitResultsChanged, editable = true, allowedResults, }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(getUnitResults(unit));
    const schema = useMemo(() => {
        var _a;
        const safeAllowedResults = allowedResults !== null && allowedResults !== void 0 ? allowedResults : [];
        return buildNamedEntitySchema(safeAllowedResults, { name: ((_a = safeAllowedResults[0]) === null || _a === void 0 ? void 0 : _a.name) || "" }, "Property");
    }, [allowedResults]);
    const handleSubmit = (e) => {
        const nextFormData = (e.formData || formData).map(safeMakeObject);
        setFormData(nextFormData);
        onUnitResultsChanged(nextFormData);
        setIsEditing(false);
    };
    const handleChange = (e) => {
        setFormData((e.formData || []).map(safeMakeObject));
    };
    const handleEditClick = () => {
        setFormData(getUnitResults(unit));
        setIsEditing(true);
    };
    return (_jsxs(Box, { "data-tid": "properties", children: [editable && isEditing ? (_jsx(Form, { schema: schema, validator: validator, formData: formData, onChange: handleChange, onSubmit: handleSubmit, uiSchema: uiSchema, liveOmit: true, omitExtraData: true, showErrorList: false, id: "edit-properties-form" })) : (getUnitResults(unit).map((result, index) => (_jsx(Chip, { label: result.name, sx: { fontSize: "12px", m: 0.5 } }, `${result.name}-${index}`)))), editable && !isEditing ? (_jsx(Button, { variant: "contained", color: "primary", size: "small", onClick: handleEditClick, sx: { mx: 1 }, "data-tid": "edit-properties", children: "Edit" })) : null] }));
}
export default UnitProperties;
