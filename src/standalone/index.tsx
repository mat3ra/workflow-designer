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

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Workflow as WodeWorkflow } from "@mat3ra/wode";
import { WorkflowStandata, MaterialStandata, ApplicationRegistry } from "@mat3ra/standata";
import { ApplicationDriver } from "@mat3ra/standata/dist/js/ApplicationDriver";
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";

import WorkflowDesignerContainer from "../WorkflowDesignerContainer";
import { Material } from "@mat3ra/made";

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
const EntityHeaderStub = ({ name }: any) => (
    <Typography variant="h6" fontWeight={600}>
        {String(name ?? "")}
    </Typography>
);
const EntityNameStub = () => null;
const MetadataStub = () => null;
const HistoryStub = () => null;
const SubworkflowFormTitleStub = ({ title }: { title: string }) => (
    <Typography variant="subtitle1" fontWeight={600}>
        {title}
    </Typography>
);
const PseudoFormStub = () => null;
const DataGridStub = () => null;

// ---------------------------------------------------------------------------
// Standata loaders
// ---------------------------------------------------------------------------

/** Try to create a WodeWorkflow from raw JSON; return null if validation fails. */
function tryCreateWorkflow(json: any): WodeWorkflow | null {
    try {
        return new WodeWorkflow(json as any);
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
    // --- Workflows ---
    const workflowStandata = useMemo(() => new WorkflowStandata(), []);
    const allWorkflowJsons: any[] = useMemo(() => workflowStandata.getAll() ?? [], [workflowStandata]);
    const [workflowIndex, setWorkflowIndex] = useState(0);

    const selectedWorkflowJson = allWorkflowJsons[workflowIndex];
    const wodeWorkflow = useMemo(
        () => tryCreateWorkflow(selectedWorkflowJson) ?? tryCreateWorkflow(allWorkflowJsons[0]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [workflowIndex],
    );

    // --- Materials ---
    const materialStandata = useMemo(() => new MaterialStandata(), []);
    const allMaterialJsons: any[] = useMemo(() => materialStandata.getAll() ?? [], [materialStandata]);
    // Wrap each JSON in a Material instance so Wode's uniqueElements getter works
    const allMaterials: Material[] = useMemo(
        () => allMaterialJsons.map((json) => new Material(json)),
        [allMaterialJsons],
    );
    const [materialIndex, setMaterialIndex] = useState(
        // Default to Silicon if available
        () => {
            const siIndex = allMaterialJsons.findIndex((m) => /silicon|^si\b/i.test(m.name ?? ""));
            return siIndex >= 0 ? siIndex : 0;
        },
    );
    const selectedMaterial = allMaterials[materialIndex];

    // Re-key the designer when either selection changes so it re-mounts cleanly
    const designerKey = `${workflowIndex}-${materialIndex}`;

    const handleSave = useCallback(async () => {
        /* read-only in standalone */
    }, []);

    if (!wodeWorkflow || !selectedMaterial) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Loading standata…</Typography>
            </Box>
        );
    }

    const appName = selectedWorkflowJson?.application?.name;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            {/* ---- Header ---- */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                            background: "linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mr: 2,
                            flexShrink: 0,
                        }}>
                        Workflow Designer
                    </Typography>

                    {/* Workflow selector */}
                    <FormControl size="small" sx={{ minWidth: 300 }}>
                        <InputLabel id="workflow-select-label">Workflow</InputLabel>
                        <Select
                            labelId="workflow-select-label"
                            id="workflow-select"
                            value={workflowIndex}
                            label="Workflow"
                            onChange={(e) => setWorkflowIndex(Number(e.target.value))}>
                            {allWorkflowJsons.map((wf: any, i: number) => (
                                <MenuItem key={i} value={i}>
                                    {wf?.name ?? `Workflow ${i + 1}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {appName && (
                        <Chip label={appName} size="small" variant="outlined" color="primary" />
                    )}

                    <Divider orientation="vertical" flexItem />

                    {/* Material selector */}
                    <FormControl size="small" sx={{ minWidth: 260 }}>
                        <InputLabel id="material-select-label">Material</InputLabel>
                        <Select
                            labelId="material-select-label"
                            id="material-select"
                            value={materialIndex}
                            label="Material"
                            onChange={(e) => setMaterialIndex(Number(e.target.value))}>
                            {allMaterials.map((mat: any, i: number) => (
                                <MenuItem key={i} value={i}>
                                    {mat?.name ?? mat?.formula ?? `Material ${i + 1}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Chip
                        label={`${allWorkflowJsons.length} workflows · ${allMaterials.length} materials`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{ ml: "auto" }}
                    />
                </Stack>
            </Box>

            {/* ---- Designer ---- */}
            <Box sx={{ height: "calc(100vh - 72px)", overflow: "auto" }}>
                <WorkflowDesignerContainer
                    key={designerKey}
                    initialWorkflow={wodeWorkflow}
                    defaultMaterial={selectedMaterial}
                    editable={true}
                    showHistory={false}
                    workflowHistory={{ list: [], loading: false } as any}
                    isStandalone={true}
                    adjustable={true}
                    showHeader={true}
                    showMetadata={false}
                    accountUsers={[]}
                    accountUsersIsLoading={false}
                    profile={
                        {
                            user: { entity: { id: "1" } },
                            account: { entity: { id: "1" } },
                            personalAccount: { entity: { id: "1" } },
                        } as any
                    }
                    publicAccount={{ entity: { id: "public" } } as any}
                    clusters={[]}
                    dialogs={
                        {
                            // ReduxDialogState is a [openFn, closeFn] tuple
                            pseudoUploadReduxDialog: [() => {}, () => {}] as any,
                            unitTypeReduxDialog: [() => {}, () => {}] as any,
                        }
                    }
                    templates={[]}
                    isLoading={false}
                    saveWorkflow={handleSave}
                    isDescriptionEditable={false}
                    EntityHeaderComponent={EntityHeaderStub}
                    EntityNameComponent={EntityNameStub}
                    MetadataComponent={MetadataStub}
                    HistoryComponent={HistoryStub}
                    SubworkflowFormTitleComponent={SubworkflowFormTitleStub}
                    PseudoFormComponent={PseudoFormStub}
                    DataGridComponent={DataGridStub}
                    getDefaultComputeConfig={() => ({
                        ppn: 1,
                        nodes: 1,
                        queue: "D",
                        timeLimit: "01:00:00",
                    })}
                    generateEntityId={() => crypto.randomUUID()}
                    openDocumentationDialog={undefined}
                />
            </Box>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={demoTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    rootElement,
);
