import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import React, { useMemo } from "react";
import s from "underscore.string";

interface Props {
    selectedValue: string;
    availableUnits: AnySubworkflowUnit[];
    label: string;
    onChange: (value: string) => void;
}

export default function UnitPointerField({
    selectedValue,
    availableUnits,
    label,
    onChange,
}: Props) {
    const options = useMemo(
        () => [
            { id: null, name: "None" },
            ...availableUnits.map((availableUnit) => {
                return {
                    id: availableUnit.flowchartId,
                    name: availableUnit.name || "",
                };
            }),
        ],
        [availableUnits],
    );

    const optionsList = options
        ? options.map((availableValue) => {
              const menuItemContent = availableValue.name;
              return (
                  <MenuItem key={availableValue.id} value={availableValue.id || ""}>
                      {menuItemContent}
                  </MenuItem>
              );
          })
        : [];

    return (
        <Stack direction="row" spacing={2}>
            <TextField
                label={s.capitalize(label)}
                value={selectedValue}
                onChange={(e) => onChange(e.target.value)}
                variant="outlined"
                fullWidth
                select
                size="small"
                InputLabelProps={{ shrink: true }}
            >
                {optionsList}
            </TextField>
            <TextField
                type="text"
                variant="outlined"
                fullWidth
                label="FlowchartId"
                className={`${s.slugify(label)}-flowchartid`}
                value={selectedValue || "None"}
                disabled
                size="small"
                InputLabelProps={{ shrink: true }}
            />
        </Stack>
    );
}
