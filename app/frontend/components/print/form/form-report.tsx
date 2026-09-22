import { Utils } from "@formio/js"
import React from "react"
import { ReportContact } from "../components/report-contact"
import { ReportField } from "../components/report-field"
import { ReportSection } from "../components/report-section"
import { ReportTable } from "../components/report-table"
import { fieldRenderers, FieldValue, RichText } from "./field-renderers"
import { FormComponent, NOT_PROVIDED } from "./field-values"

export function childComponents(c: FormComponent): FormComponent[] {
  return [
    ...(c.components || []),
    ...(c.columns || []).flatMap((col) => col.components || []),
    ...(c.rows || []).flat().flatMap((cell) => cell.components || []),
  ]
}
export function FormReport({ schema, submissionData }: { schema: FormComponent; submissionData: any }) {
  // FormIO conditional utilities can decorate schemas; never give them caller-owned objects.
  const form = structuredClone(schema)
  const data = structuredClone(submissionData?.data || {})
  const render = (components: FormComponent[], row: any, path: string, level = 0): React.ReactNode =>
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
      const title = ["columns", "table", "simplecols2", "simplecols3", "simplecols4"].includes(c.type)
        ? undefined
        : c.title || c.label
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
                <ReportContact key={index} title={`Entry ${index + 1}`}>
                  {render(children, entry, `${key}.${index}`, level + 1)}
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
          <ReportField key={key} label={<RichText html={title || c.key || "Field"} />}>
            <FieldValue component={c} value={value} />
          </ReportField>
        )
      if (children.length) {
        const nested = c.type === "container" ? value || {} : row
        const content = render(children, nested, key, level + 1)
        if (level === 0 && title)
          return (
            <ReportSection key={key} title={<RichText html={title} />}>
              {content}
            </ReportSection>
          )
        return (
          <ReportContact key={key} title={title && <RichText html={title} />}>
            {content}
          </ReportContact>
        )
      }
      if (c.input || value !== undefined)
        return (
          <ReportField key={key} label={<RichText html={title || c.key || "Field"} />}>
            <FieldValue component={c} value={value} />
          </ReportField>
        )
      return null
    })
  return <dl>{render(form.components || [], data, "data")}</dl>
}
