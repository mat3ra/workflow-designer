import { Application } from "@mat3ra/ade";
import type { ApplicationSchema, ExecutableSchema, FlavorSchema } from "@mat3ra/esse/dist/js/types";
import { ApplicationRegistry } from "@mat3ra/standata";
import type { Subworkflow as WodeSubworkflow } from "@mat3ra/wode";
import { UnitType } from "@mat3ra/wode/dist/js/enums";
import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";

/** The registry lookups used here; `ApplicationRegistry` satisfies it (stubbed in tests). */
export interface ApplicationRegistryLike {
    getExecutablesByApplication(
        application: Pick<ApplicationSchema, "name" | "version">,
    ): ExecutableSchema[];
    getFlavorsByApplicationExecutable(
        application: Pick<ApplicationSchema, "name" | "version">,
        executable: Pick<ExecutableSchema, "name">,
    ): FlavorSchema[];
}

export interface ExecutableAndFlavorNames {
    executableName: string;
    flavorName: string;
}

/** An execution unit carries the application of the subworkflow it belongs to; nothing else does. */
function isExecutionUnit(unit: AnySubworkflowUnit): boolean {
    return unit.type === UnitType.execution;
}

function isSameApplication(a?: ApplicationSchema, b?: ApplicationSchema): boolean {
    return a?.name === b?.name && a?.version === b?.version && a?.build === b?.build;
}

/**
 * Whether a unit's `application` is plain JSON. wode hands units the subworkflow's `Application`
 * *entity*, which reads the same through its getters but fails schema validation once the unit is
 * serialized, so a unit holding one still needs realigning.
 */
function isPlainApplication(application?: ApplicationSchema): boolean {
    return (
        Boolean(application) && typeof (application as { toJSON?: unknown }).toJSON !== "function"
    );
}

function unique<T>(items: (T | undefined)[]): T[] {
    return items.filter((item, index): item is T => Boolean(item) && items.indexOf(item) === index);
}

/**
 * Executable and flavor for `unit` under `application`, keeping the ones the unit has whenever the
 * target version still ships them.
 *
 * Versions differ in what they ship — espresso 7.5 adds `hp.x` and the `pw_scf_dft_u*` flavors, 6.3
 * has the `*_legacy` ones instead — and wode's `ExecutionUnit.setExecutable`/`setFlavor` throw on a
 * name the version does not have, so the pair has to be resolved against the target version before
 * the unit is handed the new application. Returns `undefined` when the registry knows no usable
 * executable/flavor pair for the application at all, leaving the caller to skip the unit.
 */
export function resolveExecutableAndFlavor(
    unit: AnySubworkflowUnit,
    application: ApplicationSchema,
    registry: ApplicationRegistryLike = new ApplicationRegistry(),
): ExecutableAndFlavorNames | undefined {
    const { name, version } = application;
    const applicationFilter = { name, version };
    const executables = registry.getExecutablesByApplication(applicationFilter);
    const { executable: currentExecutable, flavor: currentFlavor } = unit as {
        executable?: Pick<ExecutableSchema, "name">;
        flavor?: Pick<FlavorSchema, "name">;
    };

    const candidates = unique([
        executables.find((executable) => executable.name === currentExecutable?.name),
        executables.find((executable) => executable.isDefault),
        ...executables,
    ]);

    // An executable can be listed without any flavor for this version — fall through to the next one.
    // eslint-disable-next-line no-restricted-syntax
    for (const executable of candidates) {
        const flavors = registry.getFlavorsByApplicationExecutable(applicationFilter, {
            name: executable.name,
        });
        const flavor =
            flavors.find((f) => f.name === currentFlavor?.name) ??
            flavors.find((f) => f.isDefault) ??
            flavors[0];
        if (flavor) {
            return { executableName: executable.name, flavorName: flavor.name };
        }
    }

    return undefined;
}

/**
 * Put `unit` on `application`, re-resolving its executable and flavor for that version and
 * refreshing its input templates. Returns whether anything changed.
 */
function alignUnitToApplication(
    unit: AnySubworkflowUnit,
    application: ApplicationSchema,
    registry: ApplicationRegistryLike,
): boolean {
    if (!isExecutionUnit(unit)) {
        return false;
    }

    const executionUnit = unit as AnySubworkflowUnit & {
        application?: ApplicationSchema;
        executable?: Pick<ExecutableSchema, "name">;
        flavor?: Pick<FlavorSchema, "name">;
        setApplication: (
            config: { application: ApplicationSchema } & Partial<ExecutableAndFlavorNames>,
        ) => void;
    };

    const resolved = resolveExecutableAndFlavor(unit, application, registry);
    if (!resolved) {
        return false;
    }

    const isAligned =
        isPlainApplication(executionUnit.application) &&
        isSameApplication(executionUnit.application, application) &&
        executionUnit.executable?.name === resolved.executableName &&
        executionUnit.flavor?.name === resolved.flavorName;
    if (isAligned) {
        return false;
    }

    try {
        // Entities keep (and mutate) the config they are handed, so give each unit its own copy.
        executionUnit.setApplication({ application: { ...application }, ...resolved });
    } catch (error) {
        // Leave this unit as it was rather than aborting the application change for the whole
        // subworkflow: a missing input template for the version is the one thing left that throws.
        console.error(
            `Cannot move unit ${unit.name} to ${application.name} ${application.version}:`,
            error,
        );
        return false;
    }

    return true;
}

/**
 * Take the units' JSON again. wode keeps `units` and `unitsInstances` in sync only where it
 * re-serializes itself (`setUnits` and friends), so any edit made straight on the instances has to.
 */
function serializeUnits(subworkflow: WodeSubworkflow): void {
    subworkflow.units = subworkflow.unitsInstances.map((unit) => unit.toJSON());
}

/**
 * Bring every execution unit of `subworkflow` onto the subworkflow's own application, then
 * re-serialize `units` from `unitsInstances`.
 *
 * Both halves matter. wode's `Subworkflow.setApplication` propagates to `unitsInstances` only, so
 * without the re-serialization the new version is dropped the moment the subworkflow round-trips
 * through `toJSON()` — which the designer does on every update — leaving units on the version the
 * subworkflow no longer has. It also hands units the `Application` *entity* rather than its JSON,
 * which makes any later `unit.toJSON()` (adding, cloning or removing a unit, or editing important
 * settings) fail schema validation; assigning the plain application JSON here settles that too.
 *
 * Returns whether any unit changed.
 */
export function alignSubworkflowUnitsToApplication(
    subworkflow: WodeSubworkflow,
    registry: ApplicationRegistryLike = new ApplicationRegistry(),
): boolean {
    const { application } = subworkflow;
    if (!application?.name) {
        return false;
    }

    const changed = subworkflow.unitsInstances
        .map((unit) => alignUnitToApplication(unit, application, registry))
        .some(Boolean);

    if (changed) {
        serializeUnits(subworkflow);
    }

    return changed;
}

/**
 * Set the subworkflow's application and keep its units on it.
 *
 * Units are aligned to the incoming application first: wode's `Subworkflow.setApplication`
 * propagates to each execution unit as is, and throws — halfway through, leaving the subworkflow
 * with one application on the entity and another in its JSON — as soon as a unit's executable or
 * flavor is gone from the new version.
 */
export function setSubworkflowApplication(
    subworkflow: WodeSubworkflow,
    application: ApplicationSchema,
    registry: ApplicationRegistryLike = new ApplicationRegistry(),
): void {
    const isSameApplicationName = subworkflow.application?.name === application.name;
    if (isSameApplicationName) {
        subworkflow.unitsInstances.forEach((unit) => {
            alignUnitToApplication(unit, application, registry);
        });
    }

    // Also updates the model and, when the application name changes, drops the units.
    subworkflow.setApplication(new Application(application));

    alignSubworkflowUnitsToApplication(subworkflow, registry);
    // The units moved either way — above, or with the subworkflow — so their JSON is stale even
    // when the alignment found nothing left to align.
    serializeUnits(subworkflow);
}
