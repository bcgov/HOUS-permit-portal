import React from "react"
import { FormReport } from "../form/form-report"
import { ReportData } from "./report-data"
export function PermitApplicationReport({ report }: { report: ReportData }) {
  if (!report.form_json || !report.submission_data) throw new Error("Form schema or saved answers are unavailable.")
  return <FormReport schema={report.form_json} submissionData={report.submission_data} />
}
