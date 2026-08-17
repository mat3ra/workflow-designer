/* eslint-disable @typescript-eslint/no-floating-promises */
import {
    filterLibraryEntries,
    getLibraryApplications,
    toLibraryEntries,
} from "@mat3ra/workflow-designer/src/components/units/stepLibraryEntries";
import assert from "node:assert";
import test from "node:test";

const CONFIGS = [
    {
        name: "Band Structure",
        application: { name: "espresso" },
        units: [{ name: "pw_scf" }, { name: "pw_bands" }],
    },
    {
        name: "Density of States",
        application: { name: "vasp" },
        units: [{ name: "vasp_scf" }, { type: "processing" }],
    },
    { name: "Total Energy", application: { name: "espresso" }, units: [{ name: "pw_scf" }] },
];

const ENTRIES = toLibraryEntries(CONFIGS);

test("entries carry the name, application and unit chain used by the preview", () => {
    assert.strictEqual(ENTRIES.length, 3);
    assert.strictEqual(ENTRIES[0].name, "Band Structure");
    assert.strictEqual(ENTRIES[0].application, "espresso");
    assert.deepStrictEqual(ENTRIES[0].unitNames, ["pw_scf", "pw_bands"]);
    assert.strictEqual(ENTRIES[0].config, CONFIGS[0]);
});

test("a unit without a name falls back to its type", () => {
    assert.deepStrictEqual(ENTRIES[1].unitNames, ["vasp_scf", "processing"]);
});

test("malformed configs still produce a listable entry", () => {
    const entries = toLibraryEntries([{}, { name: "Named" }] as Array<Record<string, any>>);
    assert.strictEqual(entries[0].name, "Subworkflow 1");
    assert.strictEqual(entries[0].application, "");
    assert.deepStrictEqual(entries[0].unitNames, []);
    assert.notStrictEqual(entries[0].key, entries[1].key);
});

test("keys stay distinct for identically named steps", () => {
    const entries = toLibraryEntries([{ name: "Same" }, { name: "Same" }]);
    assert.notStrictEqual(entries[0].key, entries[1].key);
});

test("applications are deduplicated and sorted for the filter dropdown", () => {
    assert.deepStrictEqual(getLibraryApplications(ENTRIES), ["espresso", "vasp"]);
});

test("search matches the step name, case-insensitively", () => {
    const found = filterLibraryEntries(ENTRIES, { search: "BAND" });
    assert.deepStrictEqual(
        found.map((entry) => entry.name),
        ["Band Structure"],
    );
});

test("search matches unit names, so a step is findable by what it runs", () => {
    const found = filterLibraryEntries(ENTRIES, { search: "pw_bands" });
    assert.deepStrictEqual(
        found.map((entry) => entry.name),
        ["Band Structure"],
    );
});

test("search matches the application name", () => {
    const found = filterLibraryEntries(ENTRIES, { search: "vasp" });
    assert.deepStrictEqual(
        found.map((entry) => entry.name),
        ["Density of States"],
    );
});

test("the application filter and the search narrow together", () => {
    assert.strictEqual(filterLibraryEntries(ENTRIES, { application: "espresso" }).length, 2);
    assert.strictEqual(
        filterLibraryEntries(ENTRIES, { application: "espresso", search: "energy" }).length,
        1,
    );
    assert.strictEqual(
        filterLibraryEntries(ENTRIES, { application: "vasp", search: "energy" }).length,
        0,
    );
});

test("empty and whitespace-only searches keep every entry", () => {
    assert.strictEqual(filterLibraryEntries(ENTRIES, {}).length, 3);
    assert.strictEqual(filterLibraryEntries(ENTRIES, { search: "   " }).length, 3);
});
