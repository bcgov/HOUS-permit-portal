import { format } from "date-fns"
import { IPermitApplication } from "../models/permit-application"
import { TRow, traverseComponents } from "./formio-component-traversal"
import { startBlobDownload } from "./utility-functions"

export function exportPermitApplicationCsv(permitApplication: IPermitApplication) {
  const formJson = (permitApplication as any)?.formJson
  const submissionData = (permitApplication as any)?.submissionData?.data || {}
  const today = format(new Date(), "yyyy-MM-dd")

  const rows: TRow[] = []
  traverseComponents(formJson?.components || [], submissionData, rows, { section: "", panel: "", dataPath: [] })

  rows.push({ section: "-", panel: "", multi: "", label: "", value: "" })
  const requirementTemplateId = (permitApplication as any)?.templateVersion?.requirementTemplateId || ""
  rows.push({ section: "Requirement template:", panel: "", multi: "", label: "", value: String(requirementTemplateId) })
  const permitType = (permitApplication as any)?.permitType?.name || ""
  const workType = (permitApplication as any)?.activity?.name || ""
  rows.push({
    section: "Permit Application:",
    panel: "",
    multi: "",
    label: "",
    value: `${permitType} ${workType}`.trim(),
  })
  const version = (permitApplication as any)?.templateVersion?.versionDate
    ? `v.${format(new Date((permitApplication as any).templateVersion.versionDate), "yyyy.MM.dd")}`
    : ""
  rows.push({ section: "Template version", panel: "", multi: "", label: "", value: version })
  rows.push({ section: "ApplicationID:", panel: "", multi: "", label: "", value: String(permitApplication.id) })
  const submittedOn = (permitApplication as any)?.submittedAt
    ? format(new Date((permitApplication as any).submittedAt), "yyyy-MM-dd")
    : ""
  rows.push({ section: "Submitted on:", panel: "", multi: "", label: "", value: submittedOn })

  const header = ["Section", "Panel", "MultiContact", "Field / Label", `Value submitted on ${today}`]

  const escape = (val: string) => {
    if (val == null) return ""
    const str = String(val)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const lines = [header.join(",")]
  for (const r of rows) {
    lines.push([escape(r.section), escape(r.panel), escape(r.multi), escape(r.label), escape(r.value)].join(","))
  }
  const csv = lines.join("\n")

  const fileName = `permit_${permitApplication.number || permitApplication.id}.csv`
  startBlobDownload(csv, "text/csv;charset=utf-8;", fileName)
}
