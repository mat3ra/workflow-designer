import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import Select from "@exabyte-io/cove.js/dist/mui/components/select";
import Codemirror from "@exabyte-io/cove.js/dist/other/codemirror";
import Box from "@mui/material/Box";
import React, { useState } from "react";

export interface UnitPasteProps {
    id?: string;
    title?: string;
    onClose: () => void;
    onSubmit: (sw: object, unitIndex: number) => void;
}

const JSON_QUERY_INDENT_SPACES = 4;

export default function UnitPaste({
    id = "workflow-unit-paste-modal",
    title = "Paste subworkflow contents",
    onClose,
    onSubmit,
}: UnitPasteProps) {
    const [unitIndex, setUnitIndex] = useState(0);
    const [unitContents, setUnitContents] = useState("");

    const handleSubmit = () => {
        onSubmit(JSON.parse(unitContents), unitIndex);
    };

    return (
        <Dialog
            open
            id={id}
            title={title}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitButtonText="Apply"
            scroll="paper"
            maxWidth="lg">
            <Box sx={{ height: "100%", overflow: "hidden" }}>
                <Select
                    id={`${id}-select-index`}
                    label="Unit index"
                    value={unitIndex as any}
                    formControlProps={{}}
                    items={["append to current", "prepend to current"].map((type, index) => ({
                        id: type,
                        name: type,
                        value: index,
                    }))}
                    onChange={(event) => {
                        setUnitIndex(Number(event.target.value));
                    }}
                />
                <Box
                    id="workflow-unit-paste-contents"
                    sx={{ border: "1px solid #ccc", borderRadius: 1, overflowY: "auto" }}>
                    <Codemirror
                        content={unitContents}
                        updateContent={setUnitContents}
                        options={{ tabSize: JSON_QUERY_INDENT_SPACES }}
                        language="json"
                    />
                </Box>
            </Box>
        </Dialog>
    );
}
