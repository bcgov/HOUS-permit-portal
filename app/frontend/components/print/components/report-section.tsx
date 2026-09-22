import React from "react"
export function ReportSection({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="report-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
