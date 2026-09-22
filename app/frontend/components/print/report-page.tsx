import React, { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { camelizeResponse } from "../../utils"
import { ReportCover } from "./components/report-cover"
import { ReportErrorBoundary, ReportShell } from "./components/report-shell"
import { PermitApplicationReport } from "./permit-application/report"
import { fetchReportData, ReportData } from "./permit-application/report-data"
import { Part3Report } from "./step-code/part-3/report"
import { Part9Report } from "./step-code/part-9/report"
export function PrintReportPage({ kind }: { kind: "application" | "application-step-code" | "part3" | "part9" }) {
  const params = useParams()
  const [search] = useSearchParams()
  const id = params.permitApplicationId || params.stepCodeId
  const selection = search.get(kind.startsWith("application") ? "submission_version_id" : "checklist_id")
  const endpoint = kind.startsWith("application")
    ? `permit_applications/${id}/${kind === "application" ? "print_report" : "step_code_print_report"}`
    : `part_${kind === "part3" ? 3 : 9}_step_codes/${id}/print_report`
  const url = `${endpoint}${selection ? `?${kind.startsWith("application") ? "submission_version_id" : "checklist_id"}=${encodeURIComponent(selection)}` : ""}`
  return (
    <ReportErrorBoundary key={url}>
      <ReportLoader url={url} />
    </ReportErrorBoundary>
  )
}
function ReportLoader({ url }: { url: string }) {
  const [report, setReport] = useState<ReportData>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    const abort = new AbortController()
    fetchReportData(url, abort.signal)
      .then(setReport)
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message)
      })
    return () => abort.abort()
  }, [url])
  const content = useMemo(() => {
    if (!report) return null
    const title =
      report.kind === "application" ? "Permit application" : `Part ${report.kind === "part3" ? 3 : 9} step-code report`
    const checklist = report.checklist ? camelizeResponse(report.checklist) : null
    const project = report.step_code ? camelizeResponse(report.step_code) : {}
    return (
      <>
        <ReportCover identity={report.identity} title={title} />
        {report.kind === "application" ? (
          <PermitApplicationReport report={report} />
        ) : report.kind === "part3" ? (
          <Part3Report checklist={checklist} stepCode={project} />
        ) : (
          <Part9Report checklist={checklist} />
        )}
      </>
    )
  }, [report])
  return (
    <ReportShell loading={!report && !error} error={error}>
      {content}
    </ReportShell>
  )
}
