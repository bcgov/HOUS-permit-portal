import React from "react"
export function ReportContact({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="report-group">
      {title && <h3>{title}</h3>}
      <dl>{children}</dl>
    </section>
  )
}
