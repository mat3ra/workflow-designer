import { type NameResultSchema, safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import { buildNamedEntitySchema } from "@mat3ra/code/dist/js/utils/schemas";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import React, { useMemo, useState } from "react";

import type { WorkflowDesignerExecutionUnitSchema } from "../../types/context";

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

interface UnitPropertiesProps {
    unit: WorkflowDesignerExecutionUnitSchema;
    onUnitResultsChanged: (propertyData: NameResultSchema[]) => void;
    editable?: boolean;
    allowedResults: NameResultSchema[];
}

const getUnitResults = (unit: WorkflowDesignerExecutionUnitSchema) => {
    return (unit.results || []).map(safeMakeObject);
};

function UnitProperties({
    unit,
    onUnitResultsChanged,
    editable = true,
    allowedResults,
}: UnitPropertiesProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<NameResultSchema[]>(getUnitResults(unit));
    const schema = useMemo(() => {
        const safeAllowedResults = allowedResults ?? [];
        return buildNamedEntitySchema(
            safeAllowedResults,
            { name: safeAllowedResults[0]?.name || "" },
            "Property",
        );
    }, [allowedResults]);

    const handleSubmit = (e: { formData?: NameResultSchema[] }) => {
        const nextFormData = (e.formData || formData).map(safeMakeObject);
        setFormData(nextFormData);
        onUnitResultsChanged(nextFormData);
        setIsEditing(false);
    };

    const handleChange = (e: { formData?: NameResultSchema[] }) => {
        setFormData((e.formData || []).map(safeMakeObject));
    };

    const handleEditClick = () => {
        setFormData(getUnitResults(unit));
        setIsEditing(true);
    };

    return (
        <Box data-tid="properties">
            {editable && isEditing ? (
                <Form
                    schema={schema}
                    validator={validator}
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    uiSchema={uiSchema}
                    liveOmit
                    omitExtraData
                    showErrorList={false}
                    id="edit-properties-form"
                />
            ) : (
                getUnitResults(unit).map((result, index) => (
                    <Chip
                        label={result.name}
                        sx={{ fontSize: "12px", m: 0.5 }}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${result.name}-${index}`}
                    />
                ))
            )}
            {editable && !isEditing ? (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleEditClick}
                    sx={{ mx: 1 }}
                    data-tid="edit-properties">
                    Edit
                </Button>
            ) : null}
        </Box>
    );
}

export default UnitProperties;
