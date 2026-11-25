import React from "react"
export type FieldWidth = "compact" | "full"
export function ReportField({
  label,
  children,
  width = "full",
}: Readonly<{
  label: React.ReactNode
  children: React.ReactNode
  width?: FieldWidth
}>) {
  return (
    <div className={`report-field report-field--${width}`}>
      <dt>{label}</dt>
      <dd className="report-answer">{children}</dd>
    </div>
  )
}
