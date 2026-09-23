import React from "react"
export type FieldWidth = "compact" | "full"
export function ReportField({
  label,
  children,
  width = "full",
}: {
  label: React.ReactNode
  children: React.ReactNode
  width?: FieldWidth
}) {
  return (
    <div className={`report-field report-field--${width}`}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
