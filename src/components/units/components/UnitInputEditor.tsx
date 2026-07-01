import { showErrorAlert, showSuccessAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { useWorkflowComponents } from "../../../WorkflowComponentsContext";
import CodeMirror from "@exabyte-io/cove.js/dist/other/codemirror";
import _ from "lodash";
import React, { useCallback, useState } from "react";

type Props = {
    initialInput: unknown;
    onChange: (newInput: unknown) => void;
    editable?: boolean;
};

function UnitInputEditor({ initialInput, onChange, editable = true }: Props) {
    const { SubworkflowFormTitleComponent } = useWorkflowComponents();
    const [inputText, setInputText] = useState(JSON.stringify(initialInput, null, "    "));

    function _showJSONContentAlert() {
        showErrorAlert("Invalid JSON content");
    }

    const showJSONContentAlert = useCallback(_.debounce(_showJSONContentAlert, 2000, { leading: true, trailing: false }), []);

    const handleInputUpdate = (newInputAsText: string) => {
        try {
            setInputText(newInputAsText);
            const newInput = JSON.parse(newInputAsText);
            onChange(newInput);
        } catch (e) {
            showJSONContentAlert();
            return;
        }
        showSuccessAlert("Valid JSON content");
    };

    const codeMirrorOptions = {
        lineNumbers: true,
        autofocus: false,
        // used in combination with `height: auto` to auto-resize code editor
        viewportMargin: Infinity,
    };

    return (
        <>
            <SubworkflowFormTitleComponent title="Input" />
            <CodeMirror
                content={inputText}
                updateContent={handleInputUpdate}
                language="json"
                options={codeMirrorOptions}
                readOnly={!editable}
            />
        </>
    );
}

export default UnitInputEditor;
