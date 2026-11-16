import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, test } from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "vite"

// Exercise the real composed models, including their circular references.
const models = {
  RootStoreModel: "../stores/root-store.ts",
  Part3StepCodeModel: "part-3-step-code.ts",
  Part9StepCodeModel: "part-9-step-code.ts",
  TemplateVersionModel: "template-version.ts",
}
const result = await build({
  configFile: false,
  logLevel: "silent",
  plugins: [
    {
      name: "model-contract-test-entry",
      resolveId(id) {
        if (id.endsWith("virtual:model-contracts")) return id
      },
      load(id) {
        if (!id.endsWith("virtual:model-contracts")) return
        return Object.entries(models)
          .map(
            ([name, file]) =>
              `export { ${name} } from ${JSON.stringify(fileURLToPath(new URL(`../${file}`, import.meta.url)))}`
          )
          .join("\n")
      },
    },
  ],
  build: { write: false, minify: false, lib: { entry: "virtual:model-contracts", formats: ["es"] } },
})
const chunk = (Array.isArray(result) ? result[0] : result).output.find(
  (output) => output.type === "chunk" && output.isEntry
)
const buildDir = mkdtempSync(join(tmpdir(), "bph-model-contracts-"))
after(() => rmSync(buildDir, { recursive: true, force: true }))
const modulePath = join(buildDir, "models.mjs")
writeFileSync(modulePath, chunk.code)
const { Part3StepCodeModel, Part9StepCodeModel, TemplateVersionModel } = await import(pathToFileURL(modulePath).href)

for (const [model, type, updateMethod] of [
  [Part3StepCodeModel, "Part3StepCode", "updatePart3Checklist"],
  [Part9StepCodeModel, "Part9StepCode", "updatePart9Checklist"],
]) {
  test(`${type} selects the current checklist and derives stage completion`, () => {
    const stepCode = model.create({
      id: "step-code",
      type,
      currentStage: "pre_construction",
      checklists: [
        { id: "pre", stage: "pre_construction", status: "complete" },
        { id: "built", stage: "as_built", status: "draft" },
      ],
    })
    assert.equal(stepCode.currentChecklist.id, "pre")
    assert.equal(stepCode.checklistForPdf.id, "pre")
    assert.equal(stepCode.isComplete, true)
    stepCode.setCurrentStage("as_built")
    assert.equal(stepCode.checklistForPdf.id, "built")
    assert.equal(stepCode.isComplete, false)
  })

  test(`${type} saving a section makes its existing report stale`, async () => {
    const calls = []
    const snapshot = {
      id: "checklist",
      stage: "pre_construction",
      status: "draft",
      sectionCompletionStatus: { completedBy: { complete: false, relevant: true } },
      reportDocument: { id: "report", stale: false },
    }
    const stepCode = model.create(
      {
        id: "step-code",
        type,
        checklists: [snapshot],
      },
      {
        api: {
          [updateMethod]: async (...args) => {
            calls.push(args)
            return { ok: true, data: { data: { ...snapshot, ...args[1] } } }
          },
        },
      }
    )
    const checklist = stepCode.currentChecklist
    assert.equal(await checklist.completeSection("completedBy"), true)
    assert.equal(checklist.sectionCompletionStatus.completedBy.complete, true)
    assert.equal(checklist.reportDocument.stale, true)
    assert.equal(calls.length, 1)
    assert.equal(calls[0][0], "checklist")
  })
}

test("integration mappings resolve their template version and filter requirements", () => {
  const version = TemplateVersionModel.create({
    id: "version",
    requirementTemplateId: "template",
    status: "published",
    label: "Test version",
    versionDate: 0,
    createdAt: 0,
    updatedAt: 0,
    integrationMappingByJurisdiction: {
      jurisdiction: {
        id: "mapping",
        templateVersionId: "version",
        jurisdictionId: "jurisdiction",
        requirementsMapping: {
          BLOCK: {
            id: "block",
            requirements: {
              answer: { local_system_mapping: "external_answer" },
            },
          },
        },
      },
    },
  })
  const mapping = version.getIntegrationMapping("jurisdiction")
  assert.equal(mapping.templateVersion, version)
  assert.equal(mapping.tableRequirementsMapping.length, 1)
  mapping.setQuery("external_answer")
  assert.equal(mapping.tableRequirementsMapping.length, 1)
  mapping.setShowOnlyUnmapped(true)
  const block = mapping.tableRequirementsMapping[0]
  assert.deepEqual(block.getTableRequirementsJson([{ requirementCode: "answer" }]), [])
  mapping.setQuery("no-matching-field")
  assert.equal(mapping.tableRequirementsMapping.length, 0)
})
