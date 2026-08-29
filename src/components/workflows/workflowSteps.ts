/**
 * What the steps rail shows for each top-level unit of a workflow.
 *
 * Derived here rather than in the component so the summaries — which application a step runs,
 * how many units it contains — can be tested without mounting a flowchart, and so the classic
 * layout's flowchart cards and the rail cannot drift on what a "step" is.
 */
export interface WorkflowStep {
    /** Zero-based position, which is also the `unitIndex` the container selects by. */
    index: number;
    flowchartId: string;
    name: string;
    type: string;
    /** Simulation engine behind the step; absent for maps and error units. */
    application?: string;
    /** Units inside the step — the subworkflow's own units, or the mapped workflow's. */
    unitCount?: number;
    /**
     * Execution status, omitted while idle: a rail of "idle" chips spends the reader's attention
     * on job runtime state that a workflow being designed has never had.
     */
    status?: string;
}

interface UnitLike {
    flowchartId?: unknown;
    name?: unknown;
    type?: unknown;
    id?: unknown;
    workflowId?: unknown;
    status?: unknown;
}

interface ContainerLike {
    id?: unknown;
    units?: unknown[];
    application?: { name?: unknown };
}

interface WorkflowLike {
    unitInstances?: UnitLike[];
    subworkflowInstances?: ContainerLike[];
    workflowInstances?: ContainerLike[];
}

const IDLE_STATUSES = new Set(["idle", "", "undefined"]);

function findContainer(unit: UnitLike, workflow: WorkflowLike): ContainerLike | undefined {
    if (unit.type === "map") {
        return workflow.workflowInstances?.find((candidate) => candidate.id === unit.workflowId);
    }
    return workflow.subworkflowInstances?.find((candidate) => candidate.id === unit.id);
}

export function getWorkflowSteps(workflow: WorkflowLike | undefined): WorkflowStep[] {
    return (workflow?.unitInstances ?? []).map((unit, index) => {
        const container = findContainer(unit, workflow ?? {});
        const application = container?.application?.name;
        const status = String(unit.status ?? "");
        return {
            index,
            flowchartId: String(unit.flowchartId ?? index),
            name: String(unit.name ?? `Step ${index + 1}`),
            type: String(unit.type ?? ""),
            ...(application ? { application: String(application) } : {}),
            ...(container?.units ? { unitCount: container.units.length } : {}),
            ...(IDLE_STATUSES.has(status.toLowerCase()) ? {} : { status }),
        };
    });
}

/** `0` → `01`, so the rail's positions line up and read as an ordered list. */
export function formatStepNumber(index: number): string {
    return String(index + 1).padStart(2, "0");
}

/** "espresso · 3 units", dropping whichever half the step does not have. */
export function formatStepSummary(step: WorkflowStep): string {
    const parts: string[] = [];
    if (step.application) parts.push(step.application);
    if (typeof step.unitCount === "number") {
        parts.push(`${step.unitCount} unit${step.unitCount === 1 ? "" : "s"}`);
    }
    if (!parts.length && step.type) parts.push(step.type);
    return parts.join(" · ");
}
