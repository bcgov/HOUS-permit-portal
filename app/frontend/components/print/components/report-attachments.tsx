import React from "react"
import { NOT_PROVIDED } from "../form/field-values"
export function ReportAttachments({ value }: { value: any }) {
  const files = Array.isArray(value) ? value : value ? [value] : []
  return files.length ? (
    <ul>
      {files.map((file, i) => (
        <li key={i}>
          {file.originalName ||
            file.original_name ||
            file.metadata?.filename ||
            file.filename ||
            file.name ||
            "Unnamed attachment"}
        </li>
      ))}
    </ul>
  ) : (
    <>{NOT_PROVIDED}</>
  )
}
