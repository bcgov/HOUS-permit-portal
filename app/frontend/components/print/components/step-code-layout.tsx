/** Semantic layout for report sections. Column spans are explicit, never inferred from screen styles. */
import React, { createContext, useContext } from "react"
import { displayValue, isMissing } from "../form/field-values"
import { ReportField } from "./report-field"
import { ReportSection } from "./report-section"

type BlockProps = { children?: React.ReactNode; className?: string; colSpan?: number; rowSpan?: number }
const TableRows = createContext(false)
export function ReportBlock({ children, className = "" }: Readonly<BlockProps>) {
  return <div className={`report-block ${className}`}>{children}</div>
}
export function ReportText({ children, className = "" }: Readonly<BlockProps>) {
  return (
    <div className={`report-text ${className}`}>
      {isMissing(children) || children === "undefined" || children === "null" ? "-" : children}
    </div>
  )
}
export function ReportMetric({
  value,
  label,
  hint,
  rightElement,
  className = "",
}: Readonly<{
  value?: unknown
  label?: React.ReactNode
  hint?: React.ReactNode
  rightElement?: React.ReactNode
  className?: string
}>) {
  const content = (
    <>
      {displayValue(value, "-")}
      {rightElement && <div className="report-unit">{rightElement}</div>}
      {hint && <div className="report-note">{hint}</div>}
    </>
  )
  return label ? (
    <dl className={`report-metric ${className}`}>
      <ReportField label={label}>{content}</ReportField>
    </dl>
  ) : (
    <div className={`report-metric-value ${className}`}>{content}</div>
  )
}
export function ReportValue({
  value,
  rightElement,
  className = "",
}: Readonly<{
  value?: unknown
  rightElement?: React.ReactNode
  className?: string
}>) {
  return (
    <div className={`report-value ${className}`}>
      {displayValue(value, "-")}
      {rightElement}
    </div>
  )
}
export function ReportPanel({ heading, children }: Readonly<{ heading: React.ReactNode; children?: React.ReactNode }>) {
  return <ReportSection title={heading}>{children}</ReportSection>
}
export function ReportStack({ children, className = "" }: Readonly<BlockProps>) {
  return <div className={`report-stack ${className}`}>{children}</div>
}
export function ReportGrid({
  headers,
  spans = [],
  children,
}: Readonly<{
  headers: React.ReactNode[]
  spans?: number[]
  children: React.ReactNode
}>) {
  return (
    <table className="report-table report-comparison">
      <colgroup>
        {[0, 1, 2, 3].map((i) => (
          <col key={i} className={i === 0 ? "report-column-description" : "report-column-value"} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th scope="col" colSpan={spans[i] || 1} key={i}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <TableRows.Provider value={true}>{children}</TableRows.Provider>
      </tbody>
    </table>
  )
}
export function ReportRow({ children, className = "" }: Readonly<BlockProps>) {
  const table = useContext(TableRows)
  if (!table) return <div className={`report-row ${className}`}>{children}</div>
  return (
    <tr className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement<BlockProps>(child) ? (
          <td colSpan={child.props.colSpan || 1} rowSpan={child.props.rowSpan}>
            <TableRows.Provider value={false}>{child}</TableRows.Provider>
          </td>
        ) : null
      )}
    </tr>
  )
}
export function ReportCell({ children, className = "" }: Readonly<BlockProps>) {
  return <div className={`report-cell ${className}`}>{children}</div>
}
export function ReportDivider() {
  return <hr className="report-rule" />
}
export function ReportBoolean({ isChecked }: Readonly<{ isChecked?: boolean }>) {
  const value = isChecked ? "Yes" : "No"
  return <span>{isChecked == null ? "-" : value}</span>
}
export function ReportResult({ success }: Readonly<{ success?: boolean }>) {
  const value = success ? "Pass" : "Fail"
  return <strong className="report-result">{success == null ? "-" : value}</strong>
}
export function ReportCheckbox({ checked, text }: Readonly<{ checked?: boolean; text?: React.ReactNode }>) {
  return (
    <span>
      <ReportBoolean isChecked={checked} />
      {text && <> — {text}</>}
    </span>
  )
}
export function ReportLabeledCheckbox({
  checked,
  text,
  corner,
}: Readonly<{
  checked?: boolean
  text?: React.ReactNode
  corner?: React.ReactNode
}>) {
  return (
    <span>
      <ReportCheckbox checked={checked} text={text} />
      {corner}
    </span>
  )
}
