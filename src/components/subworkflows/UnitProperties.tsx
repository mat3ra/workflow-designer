import { type NameResultSchema, safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import React, { useMemo, useState } from "react";

import type { WorkflowDesignerExecutionUnitSchema } from "../../types/context";
import { RenderErrorBoundary } from "../common/RenderErrorBoundary";
import { buildUnitPropertiesSchema, getUnitResults } from "./unitPropertiesSchema";

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

function UnitProperties({
    unit,
    onUnitResultsChanged,
    editable = true,
    allowedResults,
}: UnitPropertiesProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<NameResultSchema[]>(getUnitResults(unit));
    // `null` when the built schema carries a `$ref` with nothing to resolve it to — see
    // `buildUnitPropertiesSchema`. RJSF would throw on it mid-render and unmount the designer.
    const schema = useMemo(() => buildUnitPropertiesSchema(allowedResults), [allowedResults]);

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
            {editable && isEditing && schema ? (
                <RenderErrorBoundary label="the unit properties form">
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
                </RenderErrorBoundary>
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
            {editable && !isEditing && !schema ? (
                <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
                    This executable declares no properties to choose from.
                </Typography>
            ) : null}
            {editable && !isEditing && schema ? (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleEditClick}
                    sx={{ mx: 1 }}
                    data-tid="edit-properties"
                >
                    Edit
                </Button>
            ) : null}
        </Box>
    );
}

export default UnitProperties;
