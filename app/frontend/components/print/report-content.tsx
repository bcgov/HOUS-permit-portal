import React from "react"
import { camelizeResponse } from "../../utils"
import { ReportCover } from "./components/report-cover"
import { ReportFooter } from "./components/report-footer"
import { PermitApplicationReport } from "./permit-application/report"
import { ReportData } from "./permit-application/report-data"
import { Part3Report } from "./step-code/part-3/report"
import { Part9Report } from "./step-code/part-9/report"

export function ReportContent({ report }: { report: ReportData }) {
  const title =
    report.kind === "application" ? "Permit application" : `Part ${report.kind === "part3" ? 3 : 9} step-code report`
  const checklist = report.checklist ? camelizeResponse(report.checklist) : null
  // Rails persists this field as dwh_heating_consumption. Keep the existing
  // presentation name, while accepting older payloads using the DHW spelling.
  if (report.kind === "part9" && checklist)
    checklist.dhwHeatingConsumption = checklist.dwhHeatingConsumption ?? checklist.dhwHeatingConsumption
  const project = report.step_code ? camelizeResponse(report.step_code) : {}
  return (
    <>
      <ReportFooter identity={report.identity} />
      <ReportCover
        identity={report.identity}
        title={title}
        missingValue={report.kind === "application" ? undefined : "-"}
      />
      {report.kind === "application" ? (
        <PermitApplicationReport report={report} />
      ) : report.kind === "part3" ? (
        <Part3Report checklist={checklist} stepCode={project} />
      ) : (
        <Part9Report checklist={checklist} />
      )}
    </>
  )
}
