import DOMPurify from "dompurify"
import React from "react"
import { ReportAttachments } from "../components/report-attachments"
import { displayValue, fieldValue, FormComponent, NOT_PROVIDED, selectedOptionLabels } from "./field-values"
export function RichText({ html }: { html: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(String(html), {
          USE_PROFILES: { html: true },
          FORBID_TAGS: ["img", "iframe", "style", "input", "button"],
          FORBID_ATTR: ["style"],
        }),
      }}
    />
  )
}
type Props = { component: FormComponent; value: any }
const Plain = ({ component, value }: Props) => <>{fieldValue(component, value)}</>
const Rich = ({ component, value }: Props) =>
  component.wysiwyg && value ? <RichText html={value} /> : <Plain component={component} value={value} />
/** Add a new field type here; form templates never need report-specific copies. */
export const fieldRenderers: Record<string, React.ComponentType<Props>> = Object.fromEntries(
  [
    "textfield",
    "simpletextfield",
    "number",
    "currency",
    "email",
    "simpleemail",
    "phoneNumber",
    "simplephonenumber",
    "date",
    "datetime",
    "day",
    "time",
    "checkbox",
    "select",
    "radio",
    "selectboxes",
    "simplebcaddress",
    "simpleaddressadvanced",
    "address",
    "url",
    "signature",
  ].map((type) => [type, Plain])
)
fieldRenderers.textarea = Rich
const Choices = ({ component, value }: Props) => {
  const labels = selectedOptionLabels(component, value)
  if (!labels.length) return <>{NOT_PROVIDED}</>
  if (component.type !== "selectboxes" && !component.multiple && !Array.isArray(value)) return <>{labels[0]}</>
  return (
    <ul className="report-choice-list">
      {labels.map((label, index) => (
        <li key={index}>
          <span className="report-choice-marker" aria-hidden="true">
            ✓
          </span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}
fieldRenderers.selectboxes = fieldRenderers.select = Choices
fieldRenderers.file = fieldRenderers.simplefile = ({ value }) => <ReportAttachments value={value} />
export function FieldValue({ component, value }: Props) {
  const Renderer = fieldRenderers[component.type]
  if (Renderer) return <Renderer component={component} value={value} />
  if (import.meta.env.DEV) console.warn("Print report: unsupported field type", component.type, component.key)
  return (
    <>
      <span className="report-note">Unsupported field type ({component.type}); saved value:</span>
      <br />
      {displayValue(value)}
    </>
  )
}
// FormIO's locally registered aliases use the same value contract as their base field.
const aliases: Record<string, string> = {
  simplecheckbox: "checkbox",
  simplecheckboxadvanced: "checkbox",
  simplecheckboxes: "selectboxes",
  simpleselectboxesadvanced: "selectboxes",
  simpleradios: "radio",
  simpleradioadvanced: "radio",
  simpleselect: "select",
  simpleselectadvanced: "select",
  simplenumber: "number",
  simplenumberadvanced: "number",
  simplecurrencyadvanced: "currency",
  simpledatetime: "datetime",
  simpledatetimeadvanced: "datetime",
  simpleday: "day",
  simpledayadvanced: "day",
  simpletime: "time",
  simpletimeadvanced: "time",
  simpletextfieldadvanced: "textfield",
  simpleemailadvanced: "email",
  simpleurladvanced: "url",
  simplephonenumberadvanced: "phoneNumber",
  simpletextarea: "textarea",
  simpletextareaadvanced: "textarea",
  simpletagsadvanced: "textfield",
  orgbook: "textfield",
  bcaddress: "address",
  simplesurveyadvanced: "survey",
  simplepasswordadvanced: "textfield",
}
Object.entries(aliases).forEach(([alias, base]) => {
  fieldRenderers[alias] = ({ component, value }) => {
    const Renderer = fieldRenderers[base]
    return <Renderer component={{ ...component, type: base }} value={value} />
  }
})
fieldRenderers.signature = fieldRenderers.simplesignatureadvanced = ({ value }) => {
  // Only raster data URLs; never execute or fetch an arbitrary saved signature URL.
  if (typeof value === "string" && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=\s]+$/.test(value)) {
    return <img src={value} alt="Submitted signature" className="report-signature" />
  }
  return <>{displayValue(value)}</>
}

fieldRenderers.survey = ({ component, value }) => (
  <dl>
    {(component.questions || []).map((question) => (
      <div className="report-field" key={question.value}>
        <dt>
          <RichText html={question.label || question.value} />
        </dt>
        <dd className="report-answer">{fieldValue({ ...component, type: "radio" }, value?.[question.value])}</dd>
      </div>
    ))}
  </dl>
)
