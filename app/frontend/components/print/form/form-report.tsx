import { Utils } from "@formio/js"
import React from "react"
import { ReportContact } from "../components/report-contact"
import { ReportField } from "../components/report-field"
import { ReportSection } from "../components/report-section"
import { ReportTable } from "../components/report-table"
import { fieldRenderers, FieldValue, RichText } from "./field-renderers"
import { fieldValue, FormComponent, NOT_PROVIDED } from "./field-values"

export function childComponents(c: FormComponent): FormComponent[] {
  return [
    ...(c.components || []),
    ...(c.columns || []).flatMap((col) => col.components || []),
    ...(c.rows || []).flat().flatMap((cell) => cell.components || []),
  ]
}
const layoutTypes = new Set(["columns", "table", "simplecols2", "simplecols3", "simplecols4"])
const plainLabel = (label: string) => {
  const element = document.createElement("template")
  element.innerHTML = label
  return (element.content.textContent || "").replace(/\s+/g, " ").trim()
}
const shortTypes = new Set([
  "textfield",
  "number",
  "currency",
  "email",
  "phonenumber",
  "date",
  "datetime",
  "day",
  "time",
  "checkbox",
  "radio",
  "select",
  "url",
])
export function compactField(c: FormComponent, value: unknown): boolean {
  const base = c.type
    ?.replace(/^simple/, "")
    .replace(/advanced$/, "")
    .toLowerCase()
  const text = fieldValue({ ...c, type: base }, value)
  return (
    shortTypes.has(base) &&
    !/address/i.test(c.label || "") &&
    !c.wysiwyg &&
    (value == null || typeof value !== "object") &&
    plainLabel(c.title || c.label || c.key || "").length <= 60 &&
    text.length <= 80 &&
    !/[\r\n]/.test(text)
  )
}
function fieldLayout(nodes: React.ReactNode[]): React.ReactNode[] {
  const flat = nodes.flat(Infinity).filter(Boolean)
  const result: React.ReactNode[] = []
  for (let i = 0; i < flat.length; i++) {
    const current = flat[i]
    if (React.isValidElement<any>(current) && current.type === ReportField) {
      const next = flat[i + 1]
      const paired =
        current.props.width === "compact" &&
        React.isValidElement<any>(next) &&
        next.type === ReportField &&
        next.props.width === "compact"
      result.push(
        <dl className={paired ? "report-field-pair" : "report-fields"} key={current.key || i}>
          {current}
          {paired ? next : null}
        </dl>
      )
      if (paired) i++
    } else result.push(current)
  }
  return result
}
export function FormReport({ schema, submissionData }: { schema: FormComponent; submissionData: any }) {
  // FormIO conditional utilities can decorate schemas; never give them caller-owned objects.
  const form = structuredClone(schema)
  const data = structuredClone(submissionData?.data || {})
  const render = (
    components: FormComponent[],
    row: any,
    path: string,
    level = 0,
    parentTitle = ""
  ): React.ReactNode[] =>
    components.map((original, i) => {
      const c = structuredClone(original)
      // Only visibility property actions apply to a report. Value actions never run.
      for (const logic of c.logic || []) {
        if (
          Utils.checkTrigger(
            c as any,
            logic.trigger,
            structuredClone(row),
            structuredClone(data),
            form as any,
            undefined
          )
        ) {
          for (const action of logic.actions || []) {
            if (action.type === "property" && action.property?.value === "hidden")
              Utils.setActionProperty(
                c as any,
                action,
                "result",
                structuredClone(row),
                structuredClone(data),
                undefined
              )
          }
        }
      }
      const key = `${path}.${c.key || i}`
      if (
        c.hidden ||
        ["button", "hidden", "simplebtnreset", "simplebtnsubmit", "simplebuttonadvanced"].includes(c.type)
      )
        return null
      const context = structuredClone(row)
      if (!Utils.checkCondition(c as any, context, structuredClone(data), form as any, undefined)) return null
      const children = childComponents(c)
      const value = row?.[c.key]
      const title = layoutTypes.has(c.type) ? undefined : c.title || c.label
      if (["content", "htmlelement", "simplecontent", "simpleparagraph", "simpleheading"].includes(c.type))
        return (
          <div key={key}>
            <RichText html={c.html || c.content || ""} />
          </div>
        )
      if (["datagrid", "editgrid"].includes(c.type)) {
        if (!Array.isArray(value) || value.length === 0)
          return (
            <dl key={key}>
              <ReportField label={title || "Entries"}>{NOT_PROVIDED}</ReportField>
            </dl>
          )
        // Wide or nested grids become labelled records, preserving every child without tiny columns.
        const simple =
          children.length > 0 &&
          children.length <= 4 &&
          children.every(
            (child) =>
              child.input &&
              value.every((entry) => compactField(child, entry[child.key])) &&
              !child.hidden &&
              !child.logic?.length &&
              !childComponents(child).length &&
              !child.conditional &&
              !child.customConditional
          )
        return (
          <section key={key} className="report-row-record">
            <h3>{title || "Entries"}</h3>
            {simple ? (
              <ReportTable
                headers={children.map((child) => (
                  <RichText html={child.label || child.key} />
                ))}
                rows={value.map((entry) =>
                  children.map((child) => <FieldValue component={child} value={entry[child.key]} />)
                )}
              />
            ) : (
              value.map((entry, index) => (
                <ReportContact key={index} title={`Entry ${index + 1}`} record>
                  {fieldLayout(render(children, entry, `${key}.${index}`, level + 1, plainLabel(title || "Entries")))}
                </ReportContact>
              ))
            )}
          </section>
        )
      }
      // Address and other compound input widgets own their saved value; their
      // editor-only children must not replace the report field.
      if (c.input && fieldRenderers[c.type])
        return (
          <ReportField
            key={key}
            width={compactField(c, value) ? "compact" : "full"}
            label={<RichText html={title || c.key || "Field"} />}
          >
            <FieldValue component={c} value={value} />
          </ReportField>
        )
      if (children.length) {
        const nested = c.type === "container" ? value || {} : row
        const normalized = plainLabel(title || "")
        const transparent = !normalized || normalized === parentTitle || layoutTypes.has(c.type)
        const content = render(
          children,
          nested,
          key,
          transparent ? level : level + 1,
          transparent ? parentTitle : normalized
        )
        if (layoutTypes.has(c.type)) return fieldLayout(content)
        if (transparent) return content
        if (level === 0)
          return (
            <ReportSection key={key} title={<RichText html={title} />}>
              {fieldLayout(content)}
            </ReportSection>
          )
        return (
          <ReportContact key={key} title={<RichText html={title} />}>
            {fieldLayout(content)}
          </ReportContact>
        )
      }

      if (c.input || value !== undefined)
        return (
          <ReportField
            key={key}
            width={compactField(c, value) ? "compact" : "full"}
            label={<RichText html={title || c.key || "Field"} />}
          >
            <FieldValue component={c} value={value} />
          </ReportField>
        )
      return null
    })
  return <div className="report-form">{fieldLayout(render(form.components || [], data, "data"))}</div>
}
