const JSI = require("@mat3ra/esse/dist/js/esse/JSONSchemasInterface").default;
JSI.setSchemas(require("@mat3ra/esse/dist/js/schemas.json"));
const { ApplicationRegistry, WorkflowStandata, MaterialStandata } = require("@mat3ra/standata");
const { ApplicationDriver } = require("@mat3ra/standata/dist/js/ApplicationDriver");
ApplicationRegistry.setDriver(new ApplicationDriver());
const { Workflow } = require("@mat3ra/wode");
const { Material } = require("@mat3ra/made");

(async () => {
const { findUnresolvedVariables } = await import("/workspace/ave/dist/utils/templateVariables.js");
const material = new Material(new MaterialStandata().getAll().find((m) => /silicon/i.test(m.name || "")));
const workflows = new WorkflowStandata().getAll();
let templates = 0, flagged = 0, failed = 0;
const byName = new Map();
for (const wfJson of workflows) {
  let wf;
  try { wf = new Workflow(JSON.parse(JSON.stringify(wfJson))); wf.render({ material, materials: [material] }); }
  catch { failed += 1; continue; }
  for (const sw of wf.subworkflowInstances) for (const unit of sw.unitsInstances) {
    if (unit.type !== "execution") continue;
    for (const row of unit.input ?? []) {
      templates += 1;
      const issues = findUnresolvedVariables(row.template?.content, unit.renderingContext);
      if (issues.length) flagged += 1;
      issues.forEach((i) => {
        if (!byName.has(i.name)) byName.set(i.name, { count: 0, suggestion: i.suggestion, example: `${wfJson.name} / ${unit.name} / ${row.template?.name}:${i.line}` });
        byName.get(i.name).count += 1;
      });
    }
  }
}
console.log(`workflows: ${workflows.length}, unbuildable: ${failed}`);
console.log(`templates scanned: ${templates}, templates with warnings: ${flagged}`);
console.log("\ndistinct unresolved names:");
[...byName.entries()].sort((a,b)=>b[1].count-a[1].count).forEach(([n,i]) =>
  console.log(`  ${String(i.count).padStart(4)}  ${n.padEnd(34)} ${i.suggestion?"→ "+i.suggestion+"  ":""}${i.example}`));
})();
