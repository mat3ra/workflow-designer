/**
 * What each unit type is for, in the words of someone building a workflow rather than the
 * schema's enum. The picker previously offered the bare type strings and hid the explanations
 * behind an info popover.
 */
export interface UnitTypeDescriptor {
    /** One-line answer to "what does adding this do?". */
    description: string;
    /** Distinguishes the types at a glance; the icon carries the same distinction. */
    color: string;
    icon: string;
}

export const UNIT_TYPE_CATALOG: Record<string, UnitTypeDescriptor> = {
    execution: {
        description: "Run an application — a simulation engine, a script.",
        color: "#1E63B0",
        icon: "⚙",
    },
    subworkflow: {
        description: "A named group of units, run as one step of the workflow.",
        color: "#1E63B0",
        icon: "▤",
    },
    map: {
        description: "Repeat a workflow over a set of values, in parallel.",
        color: "#0E8A6C",
        icon: "⇉",
    },
    assignment: {
        description: "Set a variable or evaluate an expression for later units.",
        color: "#B07D1E",
        icon: "=",
    },
    condition: {
        description: "Branch: run the next units only while a condition holds.",
        color: "#0E8A6C",
        icon: "?",
    },
    assertion: {
        description: "Check a condition and stop the workflow when it fails.",
        color: "#B5473C",
        icon: "!",
    },
    io: {
        description: "Read or write data — datasets, files, external endpoints.",
        color: "#7A4FB0",
        icon: "⇅",
    },
    processing: {
        description: "Transform intermediate results between units.",
        color: "#5C6B73",
        icon: "∿",
    },
};

const FALLBACK: UnitTypeDescriptor = {
    description: "",
    color: "#5C6B73",
    icon: "•",
};

export function getUnitTypeDescriptor(type: string): UnitTypeDescriptor {
    return UNIT_TYPE_CATALOG[type] ?? FALLBACK;
}

/** `subworkflow` → `Subworkflow`, `io` → `Data I/O`. */
export function getUnitTypeLabel(type: string): string {
    if (type === "io") return "Data I/O";
    const spaced = String(type).replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
