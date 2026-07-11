import React from "react";
export interface UnitPasteProps {
    id?: string;
    title?: string;
    onClose: () => void;
    onSubmit: (sw: object, unitIndex: number) => void;
}
export default function UnitPaste({ id, title, onClose, onSubmit, }: UnitPasteProps): React.JSX.Element;
//# sourceMappingURL=UnitPaste.d.ts.map