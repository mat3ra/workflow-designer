import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Workflow Designer — standalone demo app.
 *
 * Features:
 * - Workflow selector (all 55 workflows from @mat3ra/standata)
 * - Material selector (all 68 materials from @mat3ra/standata)
 * - Full WorkflowDesignerContainer with real Wode instances
 * - Dark MUI theme, no Meteor / no Redux / no setDependencies()
 */
import "./preloads";
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";
import { Material } from "@mat3ra/made";
import { ApplicationRegistry, MaterialStandata, WorkflowStandata } from "@mat3ra/standata";
import { ApplicationDriver } from "@mat3ra/standata/dist/js/ApplicationDriver";
import { Workflow as WodeWorkflow } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import WorkflowDesignerContainer from "../WorkflowDesignerContainer";
// ---------------------------------------------------------------------------
// Bootstrap — must run before any component renders
// ---------------------------------------------------------------------------
JSONSchemasInterface.setSchemas(esseSchemas);
ApplicationRegistry.setDriver(new ApplicationDriver());
// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
const demoTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#7c4dff" },
        secondary: { main: "#00e5ff" },
        background: { default: "#0d1117", paper: "#161b22" },
    },
    typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
});
// ---------------------------------------------------------------------------
// Stub UI components injected into WorkflowDesignerContainer as React props
// ---------------------------------------------------------------------------
function EntityHeaderStub({ name }) {
    return (_jsx(Typography, { variant: "h6", fontWeight: 600, children: String(name !== null && name !== void 0 ? name : "") }));
}
function EntityNameStub() {
    return null;
}
function MetadataStub() {
    return null;
}
function HistoryStub() {
    return null;
}
function SubworkflowFormTitleStub({ title }) {
    return (_jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: title }));
}
function PseudoFormStub() {
    return null;
}
function DataGridStub() {
    return null;
}
// ---------------------------------------------------------------------------
// Standata loaders
// ---------------------------------------------------------------------------
/** Try to create a WodeWorkflow from raw JSON; return null if validation fails. */
function tryCreateWorkflow(json) {
    try {
        return new WodeWorkflow(json);
    }
    catch (_a) {
        return null;
    }
}
// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
    var _a;
    // --- Workflows ---
    const workflowStandata = useMemo(() => new WorkflowStandata(), []);
    const allWorkflowJsons = useMemo(() => { var _a; return (_a = workflowStandata.getAll()) !== null && _a !== void 0 ? _a : []; }, [workflowStandata]);
    const [workflowIndex, setWorkflowIndex] = useState(0);
    const selectedWorkflowJson = allWorkflowJsons[workflowIndex];
    const wodeWorkflow = useMemo(() => { var _a; return (_a = tryCreateWorkflow(selectedWorkflowJson)) !== null && _a !== void 0 ? _a : tryCreateWorkflow(allWorkflowJsons[0]); }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflowIndex]);
    // --- Materials ---
    const materialStandata = useMemo(() => new MaterialStandata(), []);
    const allMaterialJsons = useMemo(() => { var _a; return (_a = materialStandata.getAll()) !== null && _a !== void 0 ? _a : []; }, [materialStandata]);
    // Wrap each JSON in a Material instance so Wode's uniqueElements getter works
    const allMaterials = useMemo(() => allMaterialJsons.map((json) => new Material(json)), [allMaterialJsons]);
    const [materialIndex, setMaterialIndex] = useState(
    // Default to Silicon if available
    () => {
        const siIndex = allMaterialJsons.findIndex((m) => { var _a; return /silicon|^si\b/i.test((_a = m.name) !== null && _a !== void 0 ? _a : ""); });
        return siIndex >= 0 ? siIndex : 0;
    });
    const selectedMaterial = allMaterials[materialIndex];
    // Re-key the designer when either selection changes so it re-mounts cleanly
    const designerKey = `${workflowIndex}-${materialIndex}`;
    const handleSave = useCallback(async () => {
        /* read-only in standalone */
    }, []);
    if (!wodeWorkflow || !selectedMaterial) {
        return (_jsx(Box, { sx: { p: 4 }, children: _jsx(Typography, { children: "Loading standata\u2026" }) }));
    }
    const appName = (_a = selectedWorkflowJson === null || selectedWorkflowJson === void 0 ? void 0 : selectedWorkflowJson.application) === null || _a === void 0 ? void 0 : _a.name;
    return (_jsxs(Box, { sx: { minHeight: "100vh", bgcolor: "background.default" }, children: [_jsx(Box, { sx: {
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }, children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", flexWrap: "wrap", children: [_jsx(Typography, { variant: "h5", fontWeight: 700, sx: {
                                background: "linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                mr: 2,
                                flexShrink: 0,
                            }, children: "Workflow Designer" }), _jsxs(FormControl, { size: "small", sx: { minWidth: 300 }, children: [_jsx(InputLabel, { id: "workflow-select-label", children: "Workflow" }), _jsx(Select, { labelId: "workflow-select-label", id: "workflow-select", value: workflowIndex, label: "Workflow", onChange: (e) => setWorkflowIndex(Number(e.target.value)), children: allWorkflowJsons.map((wf, i) => {
                                        var _a;
                                        return (_jsx(MenuItem, { value: i, children: (_a = wf === null || wf === void 0 ? void 0 : wf.name) !== null && _a !== void 0 ? _a : `Workflow ${i + 1}` }, i));
                                    }) })] }), appName && (_jsx(Chip, { label: appName, size: "small", variant: "outlined", color: "primary" })), _jsx(Divider, { orientation: "vertical", flexItem: true }), _jsxs(FormControl, { size: "small", sx: { minWidth: 260 }, children: [_jsx(InputLabel, { id: "material-select-label", children: "Material" }), _jsx(Select, { labelId: "material-select-label", id: "material-select", value: materialIndex, label: "Material", onChange: (e) => setMaterialIndex(Number(e.target.value)), children: allMaterials.map((mat, i) => {
                                        var _a, _b;
                                        return (_jsx(MenuItem, { value: i, children: (_b = (_a = mat === null || mat === void 0 ? void 0 : mat.name) !== null && _a !== void 0 ? _a : mat === null || mat === void 0 ? void 0 : mat.formula) !== null && _b !== void 0 ? _b : `Material ${i + 1}` }, i));
                                    }) })] }), _jsx(Chip, { label: `${allWorkflowJsons.length} workflows · ${allMaterials.length} materials`, size: "small", variant: "outlined", color: "secondary", sx: { ml: "auto" } })] }) }), _jsx(Box, { sx: { height: "calc(100vh - 72px)", overflow: "auto" }, children: _jsx(WorkflowDesignerContainer, { initialWorkflow: wodeWorkflow, defaultMaterial: selectedMaterial, editable: true, showHistory: false, workflowHistory: { list: [], loading: false }, isStandalone: true, adjustable: true, showHeader: true, showMetadata: false, accountUsers: [], accountUsersIsLoading: false, profile: {
                        user: { entity: { id: "1" } },
                        account: { entity: { id: "1" } },
                        personalAccount: { entity: { id: "1" } },
                    }, publicAccount: { entity: { id: "public" } }, clusters: [], dialogs: {
                        // ReduxDialogState is a [openFn, closeFn] tuple
                        pseudoUploadReduxDialog: [() => { }, () => { }],
                        unitTypeReduxDialog: [() => { }, () => { }],
                    }, templates: [], isLoading: false, saveWorkflow: handleSave, isDescriptionEditable: false, EntityHeaderComponent: EntityHeaderStub, EntityNameComponent: EntityNameStub, MetadataComponent: MetadataStub, HistoryComponent: HistoryStub, SubworkflowFormTitleComponent: SubworkflowFormTitleStub, PseudoFormComponent: PseudoFormStub, DataGridComponent: DataGridStub, getDefaultComputeConfig: () => ({
                        ppn: 1,
                        nodes: 1,
                        queue: "D",
                        timeLimit: "01:00:00",
                    }), generateEntityId: () => crypto.randomUUID(), openDocumentationDialog: undefined }, designerKey) })] }));
}
// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------
const rootElement = document.getElementById("root");
if (!rootElement)
    throw new Error("Root element not found");
ReactDOM.render(_jsx(React.StrictMode, { children: _jsxs(ThemeProvider, { theme: demoTheme, children: [_jsx(CssBaseline, {}), _jsx(App, {})] }) }), rootElement);
