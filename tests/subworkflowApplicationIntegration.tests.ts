/* eslint-disable @typescript-eslint/no-floating-promises */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";
import { ApplicationRegistry } from "@mat3ra/standata";
import StandataDriver from "@mat3ra/standata/dist/js/StandataDriver";
import { Subworkflow, UnitFactory } from "@mat3ra/wode";
import { setSubworkflowApplication } from "@mat3ra/workflow-designer/src/utils/subworkflowApplication";
import assert from "node:assert";
import test from "node:test";

JSONSchemasInterface.setSchemas(esseSchemas as never);
ApplicationRegistry.setDriver(new StandataDriver());

const applications = new ApplicationRegistry().getApplications();

/** An application shipping more than one version, so there is a version change to make. */
function findApplicationVersionPair() {
    const withOtherVersion = applications.find((application) =>
        applications.some(
            (other) => other.name === application.name && other.version !== application.version,
        ),
    );
    if (!withOtherVersion) return undefined;
    const target = applications.find(
        (other) =>
            other.name === withOtherVersion.name && other.version !== withOtherVersion.version,
    );
    return target && { from: withOtherVersion, to: target };
}

function createSubworkflow(application: typeof applications[number]) {
    const subworkflow = new Subworkflow({
        ...Subworkflow.defaultConfig,
        application,
    } as never);
    subworkflow.addUnit(
        UnitFactory.createDefaultSubworkflowUnit("execution", subworkflow.application),
    );
    return subworkflow;
}

test("a subworkflow application change reaches the units it serializes", (t) => {
    const pair = findApplicationVersionPair();
    if (!pair) {
        t.skip("no application with more than one version in @mat3ra/standata");
        return;
    }

    const subworkflow = createSubworkflow(pair.from);
    setSubworkflowApplication(subworkflow, pair.to);

    const config = subworkflow.toJSON() as never as {
        application: { version: string };
        units: { application: { version: string } }[];
    };
    assert.strictEqual(config.application.version, pair.to.version);
    assert.strictEqual(config.units[0].application.version, pair.to.version);

    // The designer rebuilds the subworkflow from its JSON on every update, which is where a unit
    // left on the old version used to come back.
    const roundTripped = new Subworkflow(config as never).toJSON() as never as typeof config;
    assert.strictEqual(roundTripped.units[0].application.version, roundTripped.application.version);
});

test("units stay serializable after a subworkflow application change", (t) => {
    const pair = findApplicationVersionPair();
    if (!pair) {
        t.skip("no application with more than one version in @mat3ra/standata");
        return;
    }

    const subworkflow = createSubworkflow(pair.from);
    setSubworkflowApplication(subworkflow, pair.to);

    // Adding, cloning or removing a unit re-serializes all of them; that used to fail schema
    // validation on units holding the `Application` entity wode handed them.
    assert.doesNotThrow(() => {
        subworkflow.addUnit(
            UnitFactory.createDefaultSubworkflowUnit("execution", subworkflow.application),
        );
    });
    assert.strictEqual(subworkflow.units.length, 2);
});
