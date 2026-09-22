/** Development-only executable checks and print stress fixtures; no database writes. */
import React, { useMemo } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { camelizeResponse } from "../../../utils"
import { ReportCover } from "../components/report-cover"
import { ReportErrorBoundary, ReportShell } from "../components/report-shell"
import { fieldValue } from "../form/field-values"
import { FormReport } from "../form/form-report"
import { Part3Report } from "../step-code/part-3/report"
import { Part9Report } from "../step-code/part-9/report"
import part3 from "./fixtures/part3.json"
import part9 from "./fixtures/part9.json"

// Explicit synthetic results exercise presentation independently of the calculator.
const baseline: any = structuredClone(part3)
baseline.checklist.baseline_occupancies = [
  { id: "baseline", key: "low_hazard_industrial", performance_requirement: "necb", modelled_floor_area: "1000" },
]
baseline.checklist.compliance_report.performance.requirements.whole_building.total_energy = "54321.25"
baseline.checklist.compliance_report.performance.adjusted_results.total_energy = "43210.75"
baseline.checklist.compliance_report.performance.compliance_summary.total_energy = true
baseline.checklist.compliance_report.performance.compliance_summary.performance_requirement_achieved = "necb"
const mixed: any = structuredClone(baseline)
mixed.checklist.step_code_occupancies = [
  {
    id: "hotel",
    key: "hotel_motel",
    modelled_floor_area: "1500",
    energy_step_required: "3",
    zero_carbon_step_required: "2",
  },
]
mixed.checklist.compliance_report.performance.requirements.whole_building = {
  teui: "123.45",
  tedi: "67.89",
  ghgi: "9.87",
}
mixed.checklist.compliance_report.performance.adjusted_results = {
  teui: "100.25",
  tedi: { whole_building: "50.75", step_code_portion: "45.50" },
  ghgi: "7.25",
}
mixed.checklist.compliance_report.performance.compliance_summary = {
  teui: true,
  tedi: { whole_building: true, step_code_portion: true },
  ghgi: true,
}
const complete9: any = structuredClone(part9)
Object.assign(complete9.checklist, {
  full_address: "123 Test Street",
  reference_number: "QA-PART-9",
  plan_author: "Synthetic Plan Author",
  hvac_consumption: "123.25",
  dhw_heating_consumption: "45.50",
  selected_report: {
    energy: {
      required_step: "3",
      proposed_step: "4",
      min_step: "1",
      max_step: "5",
      energy_target: "12345.67",
      ref_energy_target: "23456.78",
      ach: "1.25",
      meui: "50.50",
      tedi: "30.25",
      meui_passed: true,
      tedi_passed: true,
      airtightness_passed: true,
    },
    zero_carbon: {
      required_step: "2",
      proposed_step: "3",
      co2_passed: true,
      ghg_passed: true,
      prescriptive_passed: true,
    },
  },
})

const field = (key: string, extra = {}) => ({ type: "textfield", key, label: key, input: true, ...extra })
export function runReportChecks() {
  let passed = 0
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
    passed++
  }
  check(fieldValue(field("zero"), 0) === "0", "Zero is an answer")
  check(fieldValue(field("no"), false) === "No", "False is an answer")
  check(fieldValue(field("empty"), null) === "Not provided", "Empty answer")
  const schema = {
    components: [
      {
        type: "container",
        key: "section",
        title: "Original section",
        components: [
          field("a"),
          field("address", {
            type: "simpleaddressadvanced",
            components: [field("address1", { customConditional: "show = false" })],
          }),
          field("logicHidden", {
            logic: [
              {
                trigger: { type: "javascript", javascript: "result = true" },
                actions: [{ type: "property", property: { type: "boolean", value: "hidden" }, state: true }],
              },
            ],
          }),
          field("choice", { type: "select", data: { values: [{ value: "x", label: "Choice label" }] } }),
          field("hiddenAnswer", { conditional: { show: true, when: "section.a", eq: "not chosen" } }),
          field("shownAnswer", { conditional: { show: true, when: "section.a", eq: "FIRST" } }),
          field("advanced", { customConditional: "show = data.section.a === 'FIRST';" }),
          { type: "columns", columns: [{ components: [field("column1")] }, { components: [field("column2")] }] },
          { type: "datagrid", key: "rows", label: "Rows", components: [field("first"), field("second")] },
          field("unsupported", { type: "futureType" }),
        ],
      },
    ],
  }
  const submissionData = {
    data: {
      section: {
        a: "FIRST",
        address: { display_name: "123 Preserved Address" },
        logicHidden: "HIDDEN BY LOGIC",
        choice: "x",
        hiddenAnswer: "SHOULD NOT APPEAR",
        shownAnswer: "VISIBLE",
        advanced: "ADVANCED VISIBLE",
        column1: "COLUMN ONE",
        column2: "COLUMN TWO",
        rows: [{ first: "ROW FIRST", second: "ROW SECOND" }],
        unsupported: "FUTURE VALUE",
      },
    },
  }
  const frozen = JSON.stringify({ schema, submissionData })
  const render = () => renderToStaticMarkup(<FormReport schema={schema} submissionData={submissionData} />)
  const html = render()
  for (const text of [
    "FIRST",
    "123 Preserved Address",
    "Choice label",
    "VISIBLE",
    "ADVANCED VISIBLE",
    "COLUMN ONE",
    "COLUMN TWO",
    "ROW FIRST",
    "ROW SECOND",
    "FUTURE VALUE",
  ])
    check(html.includes(text), `Missing ${text}`)
  check(!html.includes("HIDDEN BY LOGIC"), "Logic visibility")
  check(!html.includes("SHOULD NOT APPEAR"), "Conditional visibility")
  check(JSON.stringify({ schema, submissionData }) === frozen, "Rendering mutated inputs")
  schema.components[0].components.unshift(field("newField"))
  check(render().includes("newField"), "New fields must appear automatically")
  schema.components[0].components = schema.components[0].components.filter((c) => c.key !== "a")
  check(!render().includes("<dd>FIRST</dd>"), "Removed fields must disappear")
  schema.components[0].title = "Renamed section"
  check(render().includes("Renamed section"), "Renamed sections must follow schema")
  const ordered = renderToStaticMarkup(
    <FormReport
      schema={{ components: [field("z", { label: "Last question" }), field("a", { label: "First question" })] }}
      submissionData={{ data: { z: "Z", a: "A" } }}
    />
  )
  check(ordered.indexOf("Last question") < ordered.indexOf("First question"), "Schema reordering controls report order")
  const nested = renderToStaticMarkup(
    <FormReport
      schema={{
        components: [
          {
            type: "editgrid",
            key: "rows",
            components: [
              {
                type: "container",
                key: "inner",
                components: [field("answer"), field("hidden", { conditional: { json: { "==": [1, 2] } } })],
              },
            ],
          },
        ],
      }}
      submissionData={{
        data: {
          rows: [{ inner: { answer: "NESTED ONE", hidden: "JSON HIDDEN" } }, { inner: { answer: "NESTED TWO" } }],
        },
      }}
    />
  )
  check(nested.includes("NESTED ONE") && nested.includes("NESTED TWO"), "Every nested repeating entry appears")
  check(!nested.includes("JSON HIDDEN"), "JSON conditional visibility")
  const attachments = renderToStaticMarkup(
    <FormReport
      schema={{
        components: [field("file", { type: "simplefile" }), field("rich", { type: "textarea", wysiwyg: true })],
      }}
      submissionData={{
        data: { file: [{ originalName: "source-plan.pdf" }], rich: "<p>Rich answer</p><script>alert(1)</script>" },
      }}
    />
  )
  check(attachments.includes("source-plan.pdf"), "Original attachment filenames")
  check(attachments.includes("Rich answer") && !attachments.includes("<script"), "Rich text sanitized")
  for (const [label, report, Component] of [
    ["Part 3", part3, Part3Report],
    ["Part 9", part9, Part9Report],
    ["Part 3 baseline", baseline, Part3Report],
    ["Part 3 mixed", mixed, Part3Report],
    ["Part 9 complete", complete9, Part9Report],
  ] as const) {
    const checklist = camelizeResponse(report.checklist)
    const project = camelizeResponse(report.step_code)
    const snapshot = JSON.stringify({ checklist, project })
    const markup = renderToStaticMarkup(<Component checklist={checklist} stepCode={project} />)
    check(markup.length > 100, `${label} report rendered`)
    for (const expected of label === "Part 3 baseline"
      ? ["54321.25", "43210.75"]
      : label === "Part 3 mixed"
        ? ["123.45", "100.25", "50.75", "7.25"]
        : label === "Part 9 complete"
          ? ["Synthetic Plan Author", "12345.67", "168.75"]
          : [])
      check(markup.includes(expected), `${label}: missing ${expected}`)
    check(JSON.stringify({ checklist, project }) === snapshot, `${label} data mutated`)
  }
  return passed
}
const narrative = Array.from(
  { length: 65 },
  (_, i) =>
    `Paragraph ${i + 1}: This is a deliberately long application answer. Every sentence must remain readable across page boundaries; the report must retain its complete content.`
).join("\n\n")
export const stressSchema = {
  components: [
    {
      type: "container",
      key: "project",
      title: "1. Project information",
      components: [
        field("description", { label: "Description of proposed work", type: "textarea" }),
        field("zero", { label: "Number of existing structures", type: "number" }),
        field("no", { label: "Requires demolition", type: "checkbox" }),
        field("empty", { label: "Additional comments" }),
      ],
    },
    {
      type: "container",
      key: "schedule",
      title: "2. Repeating entries",
      components: [
        {
          type: "datagrid",
          key: "rows",
          label: "Work schedule",
          components: [
            field("item", { label: "Item" }),
            field("description", { label: "Description" }),
            field("quantity", { label: "Quantity", type: "number" }),
          ],
        },
      ],
    },
  ],
}
stressSchema.components.push({
  type: "container",
  key: "longLinks",
  title: "3. Long labels and links",
  components: [
    field("url", { label: "Long reference label: " + "supporting documentation reference ".repeat(12), type: "url" }),
  ],
} as any)
export const stressData = {
  data: {
    longLinks: { url: "https://example.test/" + "long-reference-path".repeat(24) + "/END-OF-URL" },
    project: { description: narrative + "\nEND OF LONG ANSWER", zero: 0, no: false },
    schedule: {
      rows: Array.from({ length: 90 }, (_, i) => ({
        item: `ITEM-${i + 1}`,
        description: `Scheduled work ${i + 1}: ${i === 89 ? "END OF TABLE" : "All details must be preserved."}`,
        quantity: i,
      })),
    },
  },
}
export function BrowserPrintFixtures() {
  return (
    <ReportErrorBoundary>
      <Fixtures />
    </ReportErrorBoundary>
  )
}
function Fixtures() {
  const kind = new URLSearchParams(location.search).get("kind")
  const content = useMemo(() => {
    const count = runReportChecks()
    const isPart3 = kind?.startsWith("part3")
    const fixture =
      kind === "part3-baseline" ? baseline : kind === "part3-mixed" ? mixed : kind === "part3" ? part3 : complete9
    return (
      <>
        <p role="status" data-test-result="passed">
          {count} report checks passed
        </p>
        {isPart3 || kind === "part9" ? (
          <>
            <ReportCover identity={fixture.identity} title={`Step-code ${kind} test report`} />
            {isPart3 ? (
              <Part3Report
                checklist={camelizeResponse(fixture.checklist)}
                stepCode={camelizeResponse(fixture.step_code)}
              />
            ) : (
              <Part9Report checklist={camelizeResponse(fixture.checklist)} />
            )}
          </>
        ) : (
          <>
            <ReportCover
              identity={{
                number: "QA-STRESS-001",
                status: "Draft",
                address: "123 Test Street",
                exported_at: "2026-09-22T12:00:00-07:00",
              }}
              title="Permit application"
            />
            <FormReport schema={stressSchema} submissionData={stressData} />
          </>
        )}
      </>
    )
  }, [kind])
  return <ReportShell>{content}</ReportShell>
}
