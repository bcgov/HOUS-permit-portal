import React from "react"
import { displayValue } from "../form/field-values"
import { ReportIdentity } from "../permit-application/report-data"
import { ReportField } from "./report-field"
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-CA", { timeZone: "America/Vancouver" }) : "Not provided"
export function ReportCover({ identity, title }: { identity: ReportIdentity; title: string }) {
  return (
    <header className="report-cover">
      <img src="logo.png" alt="Government of British Columbia" />
      <p className="report-eyebrow">Building Permit Hub · Record copy</p>
      <h1>{title}</h1>
      <p>{identity.address || identity.title}</p>
      {identity.submission_version_id && <p>{displayValue(identity.jurisdiction)}</p>}
      <dl>
        <ReportField label="Application / reference number">{displayValue(identity.number)}</ReportField>
        <ReportField label="Record">
          {identity.version_number ? `Submission version ${identity.version_number}` : displayValue(identity.status)}
        </ReportField>
        {identity.submitted_at && <ReportField label="Submission date">{date(identity.submitted_at)}</ReportField>}
        {identity.submission_version_id && (
          <>
            <ReportField label="Applicant">{displayValue(identity.applicant)}</ReportField>
            <ReportField label={identity.tags?.length ? "Tags" : "Template"}>
              {displayValue(identity.tags?.length ? identity.tags.join(" | ") : identity.template_nickname)}
            </ReportField>
          </>
        )}
        {identity.stage && <ReportField label="Checklist stage">{identity.stage.replace(/_/g, " ")}</ReportField>}
        {identity.checklist_id && <ReportField label="Checklist ID">{identity.checklist_id}</ReportField>}
        {identity.updated_at && <ReportField label="Last saved">{date(identity.updated_at)}</ReportField>}
        <ReportField label="Export date">{date(identity.exported_at)}</ReportField>
      </dl>
      <p className="report-note">
        {identity.submission_version_id
          ? "This report presents the saved submission. Cover address, jurisdiction, applicant and tags/template reflect current application information at export."
          : "This report presents saved data. Unsaved changes are not included."}
      </p>
    </header>
  )
}
