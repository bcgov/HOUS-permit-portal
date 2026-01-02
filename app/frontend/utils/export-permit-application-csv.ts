import { format } from "date-fns"
import * as R from "ramda"
import { IPermitApplication } from "../models/permit-application"
import { ERequirementType } from "../types/enums"
import { startBlobDownload, urlForPath } from "./utility-functions"

type TRow = {
  section: string
  panel: string
  multi: string
  label: string
  value: string
}

const readValue = (submissionData: any, path: (string | number)[]) => R.path(path, submissionData)

const optionValueToLabel = (component: any, value: any) => {
  if (!component?.values || value == null) return value
  const found = (component.values || []).find((opt: any) => opt.value === value)
  return found?.label ?? value
}

const resolveComponentDisplay = (component: any, value: any): string => {
  const type = component?.type
  switch (type) {
    case ERequirementType.radio:
    case ERequirementType.select:
    case ERequirementType.multiOptionSelect:
      return String(optionValueToLabel(component, value) ?? "")
    case "simplefile":
    case ERequirementType.architecturalDrawing:
    case ERequirementType.file: {
      const files = Array.isArray(value) ? value : []
      if (files.length === 0) return ""

      const fileSummaries = files.map((f: any) => {
        const original = f?.originalName || f?.name
        const apiUrl =
          f?.model && f?.modelId ? urlForPath(`/api/s3/params/download?model=${f.model}&modelId=${f.modelId}`) : null
        const path = f?.fileUrl || f?.url || apiUrl || f?.filename || f?.id
        if (original && path) return `${original} → ${path}`
        if (path) return String(path)
        return original ? String(original) : "(file)"
      })
      return `(file uploaded: ${fileSummaries.join("; ")})`
    }
    case ERequirementType.checkbox: {
      return value ? "Yes" : value === false ? "No" : ""
    }
    case "checklist": {
      if (!value || typeof value !== "object") return ""
      const selected = Object.keys(value).filter((k) => !!value[k])
      if (!selected.length) return ""

      const labelMap = new Map<string, string>()
      ;(component.values || []).forEach((opt: any) => labelMap.set(opt.value, opt.label))
      return selected.map((v) => labelMap.get(v) || v).join("; ")
    }
    case ERequirementType.signature:
      return value ? "(signed)" : ""
    case ERequirementType.text:
    case ERequirementType.number:
    case ERequirementType.date:
    case ERequirementType.address:
    case ERequirementType.bcaddress:
    case ERequirementType.textArea:
    case ERequirementType.phone:
    case ERequirementType.email:
      return String(value ?? "")
    case ERequirementType.pidInfo:
      if (Array.isArray(value)) {
        return value.map((item) => item.pid || JSON.stringify(item)).join("; ")
      }
      return String(value ?? "")
    case ERequirementType.energyStepCodePart9:
    case ERequirementType.energyStepCodePart3:
    case ERequirementType.multiplySumGrid:
      if (value == null) return ""
      return typeof value === "object" ? JSON.stringify(value) : String(value)
    case ERequirementType.generalContact:
    case ERequirementType.professionalContact:
      if (value && typeof value === "object") {
        return Object.values(value)
          .filter((v) => v != null && v !== "")
          .join(", ")
      }
      return String(value ?? "")
    default: {
      if (value == null) return ""
      if (Array.isArray(value)) return value.join("; ")
      if (typeof value === "object") {
        return JSON.stringify(value)
      }

      return String(value)
    }
  }
}

const traverseComponents = (
  components: any[] = [],
  submissionData: any,
  rows: TRow[],
  ctx: { section: string; panel: string; dataPath: (string | number)[] }
) => {
  for (const component of components) {
    if (!component) continue

    if (component.columns && Array.isArray(component.columns)) {
      for (const col of component.columns) {
        traverseComponents(col.components || [], submissionData, rows, ctx)
      }
      continue
    }

    if (component.key && /^section/.test(component.key)) {
      const nextCtx = {
        section: component.title || component.label || ctx.section,
        panel: "",
        dataPath: [component.key],
      }
      traverseComponents(component.components || [], submissionData, rows, nextCtx)
      continue
    }

    if (component.type === "panel" || component.type === "fieldset") {
      const nextCtx = {
        section: ctx.section,
        panel: component.title || component.label || ctx.panel,
        dataPath: ctx.dataPath,
      }
      traverseComponents(component.components || [], submissionData, rows, nextCtx)
      continue
    }

    if (component.type === "container") {
      traverseComponents(component.components || [], submissionData, rows, ctx)
      continue
    }

    if (component.type === "datagrid") {
      const gridPath = [...ctx.dataPath, component.key]
      const dataRows = readValue(submissionData, gridPath)
      const innerComponents = component.components || []
      if (Array.isArray(dataRows)) {
        dataRows.forEach((row, idx) => {
          const multi = `Contact_${idx + 1}`
          for (const inner of innerComponents) {
            if (!inner?.input) continue
            const label = inner.label || ""
            const rowValue = row?.[inner.key]
            const value = resolveComponentDisplay(inner, rowValue)
            rows.push({ section: ctx.section, panel: ctx.panel, multi, label, value })
          }
        })
      }
      continue
    }

    if (component.input) {
      const label = component.label || ""
      const value = resolveComponentDisplay(component, readValue(submissionData, [...ctx.dataPath, component.key]))
      rows.push({ section: ctx.section, panel: ctx.panel, multi: "", label, value })
    }

    if (component.components) {
      traverseComponents(component.components, submissionData, rows, ctx)
    }
  }
}

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
