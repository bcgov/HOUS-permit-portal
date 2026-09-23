import React from "react"
import { createRoot } from "react-dom/client"
import "../../i18n/i18n"
import { brand } from "../../styles/brand"
import { ReportErrorBoundary, ReportShell } from "./components/report-shell"
import { ReportContent } from "./report-content"

document.documentElement.style.setProperty("--report-brand-blue", brand.blue)
document.documentElement.style.setProperty("--report-brand-gold", brand.yellow)
document.documentElement.style.setProperty("--report-brand-font", JSON.stringify(brand.fontFamily))

const payload = JSON.parse(document.getElementById("report-data")!.textContent!)
if (!["application", "part3", "part9"].includes(payload.kind)) throw new Error("Unknown report kind")
createRoot(document.getElementById("report-root")!).render(
  <ReportErrorBoundary>
    <ReportShell>
      <ReportContent report={payload} />
    </ReportShell>
  </ReportErrorBoundary>
)
