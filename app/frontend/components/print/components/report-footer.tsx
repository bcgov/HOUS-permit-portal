import React from "react"
import { ReportIdentity } from "../permit-application/report-data"
/** Hex escapes keep identity text literal even if it contains quotes, backslashes or markup. */
export function cssString(value: string): string {
  return (
    '"' +
    Array.from(value)
      .map((char) => `\\${char.codePointAt(0)!.toString(16)} `)
      .join("") +
    '"'
  )
}
export function ReportFooter({ identity }: { identity: ReportIdentity }) {
  const version =
    identity.version_number != null ? `Version ${identity.version_number}` : identity.stage?.replace(/_/g, " ")
  const identifier = identity.number || identity.checklist_id || identity.submission_version_id || "Building Permit Hub"
  const footer = [identifier, version].filter(Boolean).join(" · ")
  // @page margin boxes read inherited custom properties from the document root.
  return <style>{`:root { --report-footer: ${cssString(footer)}; }`}</style>
}
