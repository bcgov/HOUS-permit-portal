import React from "react"
export function ReportTable({ headers, rows }: { headers: React.ReactNode[]; rows: React.ReactNode[][] }) {
  return (
    <table>
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
