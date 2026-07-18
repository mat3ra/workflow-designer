import Dialog from "@mat3ra/cove.js/dist/mui/components/dialog/Dialog";
import { ENTITY_ICONS } from "@mat3ra/cove.js/dist/mui/components/icon/entityIcons";
import IconByName from "@mat3ra/cove.js/dist/mui/components/icon/IconByName";
import { showErrorAlert } from "@mat3ra/cove.js/dist/other/alerts";
import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial, UNIT_NAME_INVALID_CHARS } from "@mat3ra/wode";
import type {
    AnySubworkflowUnit,
    AnySubworkflowUnitSchema,
} from "@mat3ra/wode/dist/js/units/factory";
import { getUnitStatusCls } from "@mat3ra/wove";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import lodash from "lodash";
import React from "react";

import type { WorkflowDesignerAccount, WorkflowDesignerProperty } from "../../types/context";
import { useWorkflowComponents } from "../../WorkflowComponentsContext";
import { UnitModalContent } from "./UnitModalContent";

export interface UnitModalProps {
    id?: string;
    title?: string;
    className?: string;
    unit: AnySubworkflowUnit;
    units: AnySubworkflowUnit[];
    onClose: () => void;
    onUpdate: (unit: AnySubworkflowUnitSchema) => void;
    adjustable: boolean;
    editable: boolean;
    isStandalone: boolean;
    onOutputUpdateRequest: (unit: AnySubworkflowUnit | ExecutionUnitSchema) => void;
    materials: OrderedMaterial[];
    materialsIndex: number;
    onMaterialSwitch: (index: number) => void;
    publicAccount: WorkflowDesignerAccount;
    jobProperties?: WorkflowDesignerProperty[];
}

export default function UnitModal({
    id = "",
    title = "",
    className,
    onClose,
    unit,
    units = [],
    onUpdate,
    adjustable,
    editable,
    isStandalone,
    onOutputUpdateRequest,
    materials,
    materialsIndex,
    onMaterialSwitch,
    publicAccount,
    jobProperties,
}: UnitModalProps) {
    const { EntityNameComponent, MetadataComponent } = useWorkflowComponents();
    const onNameUpdate = (name: string) => {
        if (name.match(`.*[${UNIT_NAME_INVALID_CHARS}].*`)) {
            showErrorAlert(`unit name contains invalid character(s): ${UNIT_NAME_INVALID_CHARS} `);
        } else {
            unit.setName(name);
        }
        onUpdate(unit.toJSON());
    };

    const renderHeaderCustom = () => {
        return (
            <>
                <DialogTitle component="div">
                    <Grid container>
                        <Grid item container justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h5">Unit settings</Typography>
                            </Grid>
                            <Grid item>
                                <IconButton id={`${id}-close-button`} onClick={onClose}>
                                    <IconByName name="actions.close" fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <EntityNameComponent
                                editable={editable}
                                value={unit.name}
                                subtitle={{ type: unit.type }}
                                description={unit.flowchartId}
                                onUpdate={(name) => onNameUpdate(name)}
                                icon={ENTITY_ICONS.unit}
                                status={getUnitStatusCls(unit.status)}
                                descriptionLabel="flowchartId"
                            />
                        </Grid>
                    </Grid>
                </DialogTitle>
                <Divider />
            </>
        );
    };

    return (
        <Dialog
            open
            id={id}
            onClose={onClose}
            renderHeaderCustom={renderHeaderCustom}
            renderFooterCustom={() => null}
            title={title}
            maxWidth="lg"
            className={className ? `UnitModal ${className}` : "UnitModal"}
            scrollable
            fullWidth
        >
            <UnitModalContent
                unit={unit}
                units={units}
                onUpdate={onUpdate}
                adjustable={adjustable}
                editable={editable}
                isStandalone={isStandalone}
                onOutputUpdateRequest={onOutputUpdateRequest}
                materials={materials}
                materialsIndex={materialsIndex}
                onMaterialSwitch={onMaterialSwitch}
                jobProperties={jobProperties}
            />
            <MetadataComponent
                tags={lodash.get(unit, "tags", [])}
                editable={editable}
                isSetPublicVisible={false}
                onUpdateTags={(tags: string[]) => {
                    unit.tags = tags;
                    onUpdate(unit.toJSON());
                }}
                publicAccount={publicAccount.entity}
            />
        </Dialog>
    );
}
