const JSI = require("@mat3ra/esse/dist/js/esse/JSONSchemasInterface").default;
JSI.setSchemas(require("@mat3ra/esse/dist/js/schemas.json"));
const { ApplicationRegistry, WorkflowStandata, MaterialStandata } = require("@mat3ra/standata");
const { ApplicationDriver } = require("@mat3ra/standata/dist/js/ApplicationDriver");
ApplicationRegistry.setDriver(new ApplicationDriver());
const { Workflow } = require("@mat3ra/wode");
const { Material } = require("@mat3ra/made");
(async () => {
const { findUnresolvedVariables } = await import("/workspace/ave/dist/utils/templateVariables.js");
const material = new Material(new MaterialStandata().getAll().find((m) => /silicon/i.test(m.name||"")));
const wf = new Workflow(new WorkflowStandata().getAll().find((w) => w.name === "Band Structure"));
wf.render({ material, materials: [material] });
const unit = wf.subworkflowInstances[0].unitsInstances.find((u) => u.type === "execution");
const ctx = unit.renderingContext;
const original = unit.input[0].template.content;
const mutations = [
  ["typo in a leaf",  original.replace("cutoffs.wavefunction", "cutoffs.wavefunctionn")],
  ["typo in a root",  original.replace("{{ cutoffs.density }}", "{{ cutofs.density }}")],
  ["wrong provider",  original.replace("{{ input.NAT }}", "{{ kgrid.NAT }}")],
  ["entirely absent", original.replace("{{ input.NTYP }}", "{{ nonexistentThing }}")],
];
for (const [label, template] of mutations) {
  const issues = findUnresolvedVariables(template, ctx);
  console.log(`${label.padEnd(18)} → ${issues.length} issue(s): ` +
    issues.map((i) => `line ${i.line} "${i.name}"${i.suggestion ? " → suggest " + i.suggestion : " (no suggestion)"}`).join("; "));
}
console.log("\nunmodified template →", findUnresolvedVariables(original, ctx).length, "issues");
})();
