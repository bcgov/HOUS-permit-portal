import React from "react"
export function ReportContact({
  title,
  children,
  record = false,
}: {
  title?: React.ReactNode
  children: React.ReactNode
  record?: boolean
}) {
  return (
    <section className={record ? "report-record" : "report-group"}>
      {title && <h3>{title}</h3>}
      {children}
    </section>
  )
}
