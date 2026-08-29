/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    alignSubworkflowUnitsToApplication,
    resolveExecutableAndFlavor,
    setSubworkflowApplication,
} from "@mat3ra/workflow-designer/src/utils/subworkflowApplication";
import assert from "node:assert";
import test from "node:test";

/**
 * Applications ship different executables and flavors per version, the way espresso 7.5 adds
 * `hp.x` and the `pw_scf_dft_u` flavor while 6.3 has `pw_scf_dft_u_legacy` instead.
 */
const FLAVORS_BY_VERSION: Record<string, Record<string, string[]>> = {
    "6.3": {
        "pw.x": ["pw_scf", "pw_scf_dft_u_legacy"],
        "average.x": ["average"],
    },
    "7.5": {
        "pw.x": ["pw_scf", "pw_scf_dft_u"],
        "average.x": ["average"],
        // Listed for the version, but ships no flavor of its own.
        "hp.x": [],
    },
};

const DEFAULT_EXECUTABLE = "pw.x";
const DEFAULT_FLAVOR_BY_EXECUTABLE: Record<string, string> = {
    "pw.x": "pw_scf",
    "average.x": "average",
};

const registry = {
    getExecutablesByApplication: ({ name, version }: { name: string; version: string }) => {
        if (name !== "espresso") return [];
        return Object.keys(FLAVORS_BY_VERSION[version] ?? {}).map((executableName) => ({
            name: executableName,
            isDefault: executableName === DEFAULT_EXECUTABLE,
        }));
    },
    getFlavorsByApplicationExecutable: (
        { name, version }: { name: string; version: string },
        { name: executableName }: { name: string },
    ) => {
        if (name !== "espresso") return [];
        return (FLAVORS_BY_VERSION[version]?.[executableName] ?? []).map((flavorName) => ({
            name: flavorName,
            isDefault: flavorName === DEFAULT_FLAVOR_BY_EXECUTABLE[executableName],
        }));
    },
};

const application = (version: string, build = "GNU") => ({
    name: "espresso",
    version,
    build,
    shortName: "qe",
    summary: "Quantum ESPRESSO",
});

function createExecutionUnitStub({
    name = "pw_scf",
    version = "6.3",
    executableName = "pw.x",
    flavorName = "pw_scf",
    applicationOverride = undefined as object | undefined,
    throwOnSetApplication = false,
}) {
    return {
        type: "execution",
        name,
        application: applicationOverride ?? application(version),
        executable: { name: executableName },
        flavor: { name: flavorName },
        setApplication({
            application: newApplication,
            executableName: newExecutableName,
            flavorName: newFlavorName,
        }: {
            application: { name: string; version: string };
            executableName?: string;
            flavorName?: string;
        }) {
            if (throwOnSetApplication) {
                throw new Error(`no input template for ${newApplication.version}`);
            }
            this.application = newApplication;
            this.executable = { name: newExecutableName ?? "" };
            this.flavor = { name: newFlavorName ?? "" };
        },
        toJSON() {
            return {
                type: this.type,
                name: this.name,
                application: this.application,
                executable: this.executable,
                flavor: this.flavor,
            };
        },
    };
}

function createSubworkflowStub(version: string, unitsInstances: object[]) {
    return {
        application: application(version),
        units: unitsInstances.map((unit) => (unit as { toJSON: () => object }).toJSON()),
        unitsInstances,
        setApplicationCalls: [] as { version: string; unitVersions: string[] }[],
        setApplication(newApplication: { name: string; version: string }) {
            // Mirrors wode: record what the units looked like when the subworkflow was moved over.
            this.setApplicationCalls.push({
                version: newApplication.version,
                unitVersions: this.unitsInstances.map(
                    (unit) => (unit as { application: { version: string } }).application.version,
                ),
            });
            this.application = application(newApplication.version);
        },
    };
}

test("resolveExecutableAndFlavor keeps the executable and flavor the target version still ships", () => {
    const unit = createExecutionUnitStub({ executableName: "pw.x", flavorName: "pw_scf" });

    assert.deepStrictEqual(
        resolveExecutableAndFlavor(unit as never, application("7.5") as never, registry as never),
        { executableName: "pw.x", flavorName: "pw_scf" },
    );
});

test("resolveExecutableAndFlavor falls back to the default flavor when the version dropped it", () => {
    const unit = createExecutionUnitStub({
        executableName: "pw.x",
        flavorName: "pw_scf_dft_u_legacy",
    });

    assert.deepStrictEqual(
        resolveExecutableAndFlavor(unit as never, application("7.5") as never, registry as never),
        { executableName: "pw.x", flavorName: "pw_scf" },
    );
});

test("resolveExecutableAndFlavor falls back to the default executable when the version dropped it", () => {
    const unit = createExecutionUnitStub({
        version: "7.5",
        executableName: "hp.x",
        flavorName: "hp",
    });

    assert.deepStrictEqual(
        resolveExecutableAndFlavor(unit as never, application("6.3") as never, registry as never),
        { executableName: "pw.x", flavorName: "pw_scf" },
    );
});

test("resolveExecutableAndFlavor skips an executable the version ships no flavor for", () => {
    const unit = createExecutionUnitStub({ executableName: "hp.x", flavorName: "hp" });

    // `hp.x` is listed for 7.5 but has no flavors, so it cannot be used as is.
    assert.deepStrictEqual(
        resolveExecutableAndFlavor(unit as never, application("7.5") as never, registry as never),
        { executableName: "pw.x", flavorName: "pw_scf" },
    );
});

test("resolveExecutableAndFlavor returns undefined for an application the registry does not know", () => {
    const unit = createExecutionUnitStub({});

    assert.strictEqual(
        resolveExecutableAndFlavor(
            unit as never,
            { ...application("7.5"), name: "vasp" } as never,
            registry as never,
        ),
        undefined,
    );
});

test("alignSubworkflowUnitsToApplication re-serializes units left behind on the old version", () => {
    const unit = createExecutionUnitStub({ version: "6.3" });
    const subworkflow = createSubworkflowStub("7.5", [unit]);

    assert.strictEqual(
        alignSubworkflowUnitsToApplication(subworkflow as never, registry as never),
        true,
    );

    assert.strictEqual(subworkflow.unitsInstances[0].application.version, "7.5");
    // The serialized units are what the designer round-trips through `toJSON()` on every update.
    assert.strictEqual(
        (subworkflow.units[0] as { application: { version: string } }).application.version,
        "7.5",
    );
});

test("alignSubworkflowUnitsToApplication replaces an Application entity with plain JSON", () => {
    // wode hands units the subworkflow's `Application` entity; it reads the same through its
    // getters, but fails schema validation as soon as the unit is serialized.
    const applicationEntity = { ...application("7.5"), toJSON: () => application("7.5") };
    const unit = createExecutionUnitStub({ applicationOverride: applicationEntity });
    const subworkflow = createSubworkflowStub("7.5", [unit]);

    assert.strictEqual(
        alignSubworkflowUnitsToApplication(subworkflow as never, registry as never),
        true,
    );

    assert.strictEqual(typeof (unit.application as { toJSON?: unknown }).toJSON, "undefined");
    assert.deepStrictEqual(unit.application, application("7.5"));
});

test("alignSubworkflowUnitsToApplication is a no-op once every unit is on the application", () => {
    const unit = createExecutionUnitStub({ version: "7.5" });
    const subworkflow = createSubworkflowStub("7.5", [unit]);
    const serializedUnits = subworkflow.units;

    assert.strictEqual(
        alignSubworkflowUnitsToApplication(subworkflow as never, registry as never),
        false,
    );
    assert.strictEqual(subworkflow.units, serializedUnits);
});

test("alignSubworkflowUnitsToApplication leaves units without an application alone", () => {
    const assignmentUnit = {
        type: "assignment",
        name: "iteration",
        toJSON: () => ({ type: "assignment", name: "iteration" }),
    };
    const subworkflow = createSubworkflowStub("7.5", [assignmentUnit]);

    assert.strictEqual(
        alignSubworkflowUnitsToApplication(subworkflow as never, registry as never),
        false,
    );
    assert.deepStrictEqual(subworkflow.units, [{ type: "assignment", name: "iteration" }]);
});

test("alignSubworkflowUnitsToApplication keeps the other units when one cannot be moved", () => {
    const stuckUnit = createExecutionUnitStub({ name: "stuck", throwOnSetApplication: true });
    const movableUnit = createExecutionUnitStub({
        name: "average",
        executableName: "average.x",
        flavorName: "average",
    });
    const subworkflow = createSubworkflowStub("7.5", [stuckUnit, movableUnit]);

    assert.strictEqual(
        alignSubworkflowUnitsToApplication(subworkflow as never, registry as never),
        true,
    );

    assert.strictEqual(stuckUnit.application.version, "6.3");
    assert.strictEqual(movableUnit.application.version, "7.5");
});

test("setSubworkflowApplication moves the units over before the subworkflow itself", () => {
    const unit = createExecutionUnitStub({ flavorName: "pw_scf_dft_u_legacy" });
    const subworkflow = createSubworkflowStub("6.3", [unit]);

    setSubworkflowApplication(subworkflow as never, application("7.5") as never, registry as never);

    // wode's `Subworkflow.setApplication` hands the new application to each unit as is and throws
    // on a flavor the version dropped, so the units have to be on it by the time it runs.
    assert.deepStrictEqual(subworkflow.setApplicationCalls, [
        { version: "7.5", unitVersions: ["7.5"] },
    ]);
    assert.strictEqual(unit.flavor.name, "pw_scf");
    assert.strictEqual(
        (subworkflow.units[0] as { application: { version: string } }).application.version,
        "7.5",
    );
});

test("setSubworkflowApplication gives every unit its own copy of the application", () => {
    const units = [
        createExecutionUnitStub({ name: "pw_scf" }),
        createExecutionUnitStub({
            name: "average",
            executableName: "average.x",
            flavorName: "average",
        }),
    ];
    const subworkflow = createSubworkflowStub("6.3", units);

    setSubworkflowApplication(subworkflow as never, application("7.5") as never, registry as never);

    // Entities keep and mutate the config they are handed, so a shared object would leak edits.
    assert.notStrictEqual(units[0].application, units[1].application);
    assert.notStrictEqual(units[0].application, subworkflow.application);
    assert.deepStrictEqual(units[0].application, application("7.5"));
    assert.deepStrictEqual(units[1].application, application("7.5"));
});

test("setSubworkflowApplication leaves units to wode when the application name changes", () => {
    const unit = createExecutionUnitStub({});
    const subworkflow = createSubworkflowStub("6.3", [unit]);

    setSubworkflowApplication(
        subworkflow as never,
        { ...application("5.4.4"), name: "vasp", shortName: "vasp" } as never,
        registry as never,
    );

    // wode drops the units on a name change — realigning them first would be wasted work.
    assert.deepStrictEqual(subworkflow.setApplicationCalls, [
        { version: "5.4.4", unitVersions: ["6.3"] },
    ]);
});
