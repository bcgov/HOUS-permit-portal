import React from "react"
export function ReportField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="report-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
