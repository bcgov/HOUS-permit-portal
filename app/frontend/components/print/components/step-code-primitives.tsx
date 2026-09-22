/** HTML building blocks for the domain-specific step-code report sections. */
import React, { createContext, useContext } from "react"
import { displayValue, isMissing } from "../form/field-values"
import { ReportField } from "./report-field"
import { ReportSection } from "./report-section"

type Props = { children?: React.ReactNode; style?: any; [key: string]: any }
function css(style: any = {}): React.CSSProperties {
  const source = Object.assign({}, ...(Array.isArray(style) ? style : [style]))
  const { height, maxHeight, overflow, position, top, bottom, left, right, spacing, ...rest } = source
  if (spacing !== undefined) rest.gap = spacing
  if (rest.fontSize) rest.fontSize = `${Math.min(12, Math.max(10.5, parseFloat(rest.fontSize)))}pt`
  if (Object.keys(rest).some((key) => key.startsWith("border") && key.endsWith("Width"))) rest.borderStyle = "solid"
  return rest
}
export function View({ children, style }: Props) {
  const s = css(style)
  return (
    <div className="report-stack" style={{ ...(s.flexDirection ? { display: "flex" } : {}), ...s }}>
      {children}
    </div>
  )
}
export function Text({ children, style }: Props) {
  return (
    <span className="report-value" style={css(style)}>
      {isMissing(children) || children === "undefined" || children === "null" ? "Not provided" : children}
    </span>
  )
}
export function Field({ value, label, hint, rightElement, style }: Props) {
  return (
    <dl style={css(style)}>
      <ReportField label={label}>
        {displayValue(value)} {rightElement}
        {hint && <div className="report-note">{hint}</div>}
      </ReportField>
    </dl>
  )
}
export function Input({ value, rightElement, inputStyles }: Props) {
  return (
    <div className="report-value" style={css(inputStyles)}>
      {displayValue(value)} {rightElement}
    </div>
  )
}
export function Panel({ heading, children }: Props) {
  return <ReportSection title={heading}>{children}</ReportSection>
}
export function VStack({ children, style }: Props) {
  return <View style={{ display: "block", ...style }}>{children}</View>
}
const GridRows = createContext(false)
/** Existing domain row sections compose a semantic table with repeating headers. */
export function ReportGrid({
  headers,
  spans = [],
  children,
}: {
  headers: React.ReactNode[]
  spans?: number[]
  children: React.ReactNode
}) {
  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th scope="col" colSpan={spans[i] || 1} key={i}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <GridRows.Provider value={true}>{children}</GridRows.Provider>
      </tbody>
    </table>
  )
}
export function HStack({ children, style }: Props) {
  const gridRow = useContext(GridRows)
  if (gridRow)
    return (
      <tr>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement<Props>(child)) return null
          const basis = parseFloat(child.props.style?.flexBasis || "25")
          const { flexBasis, minWidth, maxWidth, ...cellStyle } = child.props.style || {}
          return (
            <td colSpan={Math.max(1, Math.round(basis / 25))}>
              <GridRows.Provider value={false}>{React.cloneElement(child, { style: cellStyle })}</GridRows.Provider>
            </td>
          )
        })}
      </tr>
    )
  return <View style={{ flexDirection: "row", gap: 8, ...style }}>{children}</View>
}
export function GridItem({ children, style }: Props) {
  return <View style={{ padding: 6, ...style }}>{children}</View>
}
export function Divider(_props: Props) {
  return <hr className="report-rule" />
}
export function CheckBox({ isChecked }: Props) {
  return <span className="report-check">{isChecked == null ? "Not provided" : isChecked ? "Yes" : "No"}</span>
}
export function RequirementsMetTag({ success }: Props) {
  return <span className="report-check">{success == null ? "Not provided" : success ? "Pass" : "Fail"}</span>
}
export function Checkbox({ checked, text }: Props) {
  return (
    <span>
      {checked ? "☑" : "☐"} {text}
    </span>
  )
}
export function LabeledCheckboxBox({ checked, text, corner }: Props) {
  return (
    <span>
      <Checkbox checked={checked} text={text} /> {corner}
    </span>
  )
}
