import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React from "react";

/**
 * Values a field can be compared against and restored to. Built once per form from the
 * provider's defaults, and read by the field template through {@link FieldDefaultsContext}.
 */
export interface FieldDefaults {
    /** Default value per top-level field name, or null when the provider declares none. */
    defaults: Record<string, unknown> | null;
    /** Current form data, for the comparison. */
    formData: Record<string, unknown> | undefined;
    /** Restores one field to its default, leaving the rest of the form alone. */
    onResetField: (fieldName: string) => void;
}

export const FieldDefaultsContext = React.createContext<FieldDefaults | null>(null);

function isSameValue(left: unknown, right: unknown): boolean {
    if (left === right) return true;
    if (left === undefined || right === undefined) return false;
    if (typeof left === "object" || typeof right === "object") {
        return JSON.stringify(left) === JSON.stringify(right);
    }
    // Numeric inputs surface as strings; `40` and `"40"` are the same setting.
    return String(left) === String(right);
}

interface RjsfFieldTemplateProps {
    id: string;
    children: React.ReactNode;
    /** Dotted path of the field within the form, e.g. `root_wavefunction`. */
    [key: string]: unknown;
}

/**
 * Marks a field whose value differs from the provider's default and offers to put it back.
 *
 * Only top-level scalar fields are annotated: nested array rows (a k-path segment, say) have no
 * meaningful single default to restore, and the group-level Reset covers them.
 */
export function ImportantSettingsFieldTemplate(props: RjsfFieldTemplateProps) {
    const { id, children } = props;
    const fieldDefaults = React.useContext(FieldDefaultsContext);

    // RJSF ids are `root_<name>` for top-level fields and deeper for nested ones.
    const idParts = String(id ?? "").split("_");
    const isTopLevelField = idParts.length === 2 && idParts[0] === "root";
    const fieldName = isTopLevelField ? idParts[1] : "";

    const defaultValue = fieldDefaults?.defaults?.[fieldName];
    const currentValue = fieldDefaults?.formData?.[fieldName];
    const hasDefault = fieldName !== "" && defaultValue !== undefined;
    const isModified = hasDefault && !isSameValue(currentValue, defaultValue);

    return (
        <Box
            className={
                isModified ? "important-setting-field is-modified" : "important-setting-field"
            }
        >
            {children}
            {isModified ? (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    component="div"
                    data-tid={`field-modified-${fieldName}`}
                    sx={{ mt: -0.5, mb: 1 }}
                >
                    default {String(defaultValue)} ·{" "}
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => fieldDefaults?.onResetField(fieldName)}
                        sx={{
                            p: 0,
                            minWidth: 0,
                            fontSize: "inherit",
                            textTransform: "none",
                            verticalAlign: "baseline",
                        }}
                    >
                        reset field
                    </Button>
                </Typography>
            ) : null}
        </Box>
    );
}
