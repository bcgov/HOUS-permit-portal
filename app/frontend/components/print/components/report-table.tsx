import React from "react"
export type TableLayout = "records" | "metrics" | "details"
export function ReportTable({
  headers,
  rows,
  layout = "records",
  keepTogether = true,
}: {
  headers: React.ReactNode[]
  rows: React.ReactNode[][]
  layout?: TableLayout
  keepTogether?: boolean
}) {
  return (
    <table className={`report-table report-table--${layout} ${keepTogether ? "report-keep" : "report-split"}`}>
      <colgroup>
        {headers.map((_, index) => (
          <col key={index} className={`report-table-column-${index}`} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th scope="col" key={i}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
