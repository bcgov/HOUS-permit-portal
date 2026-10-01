import React, { useEffect, useRef } from "react"
import boldFont from "../../../../../public/fonts/2023_01_01_BCSans-Bold_2f.ttf?inline"
import regularFont from "../../../../../public/fonts/2023_01_01_BCSans-Regular_2f.ttf?inline"
import { displayValue } from "../form/field-values"
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
  const imageRef = useRef<HTMLImageElement>(null)
  const metadataStyleRef = useRef<HTMLStyleElement>(null)
  const version =
    identity.version_number != null ? `Version ${identity.version_number}` : identity.stage?.replace(/_/g, " ")
  const identifier = identity.number || identity.checklist_id || identity.submission_version_id || "Building Permit Hub"
  const submissionDate = identity.submitted_at
    ? new Date(identity.submitted_at).toLocaleDateString("en-CA", { timeZone: "America/Vancouver" })
    : "Not provided"
  const footer = [identifier, version].filter(Boolean).join(" · ")
  useEffect(() => {
    if (!identity.submission_version_id) return
    let cancelled = false
    const prepare = async () => {
      await document.fonts.load('700 9pt "BC Sans"')
      if (cancelled || !imageRef.current) return
      const context = document.createElement("canvas").getContext("2d")!
      context.font = '700 12px "BC Sans"'
      const escape = (value: string) =>
        value.replace(
          /[&<>"']/g,
          (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!
        )
      const wrap = (value: string, width: number) => {
        const lines: string[] = []
        let line = ""
        for (const word of value.trim().split(/\s+/)) {
          if (line && context.measureText(`${line} ${word}`).width * 0.75 > width) {
            lines.push(line)
            line = ""
          }
          for (const char of `${line ? " " : ""}${word}`) {
            if (context.measureText(line + char).width * 0.75 > width && line) {
              lines.push(line)
              line = ""
            }
            line += char
          }
        }
        if (line) lines.push(line)
        return lines
      }
      const fields = [
        { label: "APPLICATION ID", value: identifier, x: 0, width: 130 },
        { label: "SUBMISSION DATE", value: submissionDate, x: 145, width: 100 },
        { label: "APPLICANT", value: displayValue(identity.applicant), x: 260, width: 172 },
      ].map((field) => ({ ...field, lines: wrap(field.value, field.width) }))
      // The left margin box is 80% of Letter's 7.5-inch content width (432pt).
      // SVG keeps labels/values independently styled and text selectable in Chromium.
      const height = 14 + Math.max(...fields.map((field) => field.lines.length)) * 12
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="432pt" height="${height}pt" viewBox="0 0 432 ${height}">
        <style>@font-face{font-family:BC;src:url(${regularFont});font-weight:400}@font-face{font-family:BC;src:url(${boldFont});font-weight:700}text{font:9px BC;fill:#526176}.value{font-weight:700;fill:#253247}</style>
        ${fields.map((field) => `<text x="${field.x}" y="9">${field.label}</text>${field.lines.map((line, index) => `<text class="value" x="${field.x}" y="${23 + index * 12}">${escape(line)}</text>`).join("")}`).join("")}
      </svg>`
      const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      imageRef.current.src = source
      // Embed the URL directly: a font-bearing SVG exceeds Chromium's CSS-variable limit.
      metadataStyleRef.current!.textContent = `@media print {
        @page permit-report { @bottom-left { content: url("${source}"); } }
        @page permit-report:first { @bottom-left { content: none; } }
      }`
      document.documentElement.style.setProperty("--report-bottom-margin", `${Math.max(54, height + 21)}pt`)
    }
    prepare()
    return () => {
      cancelled = true
      document.documentElement.style.removeProperty("--report-bottom-margin")
    }
  }, [identity])
  // @page margin boxes read inherited custom properties from the document root.
  return (
    <>
      <style>{`:root { --report-footer: ${cssString(footer)}; }`}</style>
      <style ref={metadataStyleRef} />
      {identity.submission_version_id && (
        <img ref={imageRef} className="report-footer-preload" alt="" aria-hidden="true" />
      )}
    </>
  )
}
