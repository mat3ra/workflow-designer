import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import { ENTITY_ICONS } from "@exabyte-io/cove.js/dist/mui/components/icon/entityIcons";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { UNIT_NAME_INVALID_CHARS } from "@mat3ra/wode";
import { getUnitStatusCls } from "@mat3ra/wove";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import lodash from "lodash";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { UnitModalContent } from "./UnitModalContent";
export default function UnitModal({ id = "", title = "", className, onClose, unit, units = [], onUpdate, adjustable, editable, isStandalone, onOutputUpdateRequest, materials, materialsIndex, onMaterialSwitch, publicAccount, jobProperties, }) {
    const { EntityNameComponent, MetadataComponent } = useWorkflowComponents();
    const onNameUpdate = (name) => {
        if (name.match(`.*[${UNIT_NAME_INVALID_CHARS}].*`)) {
            showErrorAlert(`unit name contains invalid character(s): ${UNIT_NAME_INVALID_CHARS} `);
        }
        else {
            unit.setName(name);
        }
        onUpdate(unit.toJSON());
    };
    const renderHeaderCustom = () => {
        return (_jsxs(_Fragment, { children: [_jsx(DialogTitle, { component: "div", children: _jsxs(Grid, { container: true, children: [_jsxs(Grid, { item: true, container: true, justifyContent: "space-between", children: [_jsx(Grid, { item: true, children: _jsx(Typography, { variant: "h5", children: "Unit settings" }) }), _jsx(Grid, { item: true, children: _jsx(IconButton, { id: `${id}-close-button`, onClick: onClose, children: _jsx(IconByName, { name: "actions.close", fontSize: "small" }) }) })] }), _jsx(Grid, { item: true, xs: 12, children: _jsx(EntityNameComponent, { editable: editable, value: unit.name, subtitle: { type: unit.type }, description: unit.flowchartId, onUpdate: (name) => onNameUpdate(name), icon: ENTITY_ICONS.unit, status: getUnitStatusCls(unit.status), descriptionLabel: "flowchartId" }) })] }) }), _jsx(Divider, {})] }));
    };
    return (_jsxs(Dialog, { open: true, id: id, onClose: onClose, renderHeaderCustom: renderHeaderCustom, renderFooterCustom: () => null, title: title, maxWidth: "lg", className: className ? `UnitModal ${className}` : "UnitModal", scrollable: true, fullWidth: true, children: [_jsx(UnitModalContent, { unit: unit, units: units, onUpdate: onUpdate, adjustable: adjustable, editable: editable, isStandalone: isStandalone, onOutputUpdateRequest: onOutputUpdateRequest, materials: materials, materialsIndex: materialsIndex, onMaterialSwitch: onMaterialSwitch, jobProperties: jobProperties }), _jsx(MetadataComponent, { tags: lodash.get(unit, "tags", []), editable: editable, isSetPublicVisible: false, onUpdateTags: (tags) => {
                    unit.tags = tags;
                    onUpdate(unit.toJSON());
                }, publicAccount: publicAccount.entity })] }));
}
