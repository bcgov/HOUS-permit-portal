import React, { createContext, useContext } from "react"
import { FormComponent, NOT_PROVIDED } from "../form/field-values"
import type { DigitalSealResults } from "../permit-application/report-data"

export const DigitalSealResultsContext = createContext<DigitalSealResults>({})
const filename = (file: any) =>
  file.originalName ||
  file.original_name ||
  file.metadata?.filename ||
  file.filename ||
  file.name ||
  "Unnamed attachment"
const sealLabels = {
  found: "Digital seal found",
  not_found: "No approved digital seal found.",
  failed: "We couldn’t verify the digital seal.",
}
const unrecorded = "Digital seal information was not recorded for this submission."

export function ReportAttachments({ component, value }: Readonly<{ component?: FormComponent; value: any }>) {
  const sealResults = useContext(DigitalSealResultsContext)
  const singleFile = value ? [value] : []
  const files = Array.isArray(value) ? value : singleFile
  if (
    files.length &&
    (component?.computedCompliance?.module === "DigitalSealValidator" || sealResults[component?.key])
  ) {
    const records = files.map((file) => ({
      file,
      result: sealResults[component.key]?.find(
        (entry) => entry.file_id === file.id && (!entry.model_id || entry.model_id === (file.model_id || file.modelId))
      ),
    }))
    return (
      <div className="report-seal-checks">
        <strong>
          {records.every(({ result }) => result?.status === "found") ? "Digital seal found" : "Digital seal checks"}
        </strong>
        {records.map(({ file, result }, index) => (
          <div key={index} className="report-attachment-file">
            <div className="report-strong">
              {filename(file)} — {result ? sealLabels[result.status] || unrecorded : unrecorded}
            </div>
            {result?.status === "found" &&
              result.signers.map((signer, signerIndex) => (
                <div className="report-seal-signer" key={signerIndex}>
                  {(signer.name || signer.organization) && (
                    <div>
                      {signer.name}
                      {signer.organization ? ` (${signer.organization})` : ""}
                    </div>
                  )}
                  {signer.date && <div>Signed at {signer.date}</div>}
                </div>
              ))}
          </div>
        ))}
      </div>
    )
  }
  return files.length ? (
    <div>
      {files.map((file, i) => (
        <div key={i} className="report-attachment-file report-strong">
          {filename(file)}
        </div>
      ))}
    </div>
  ) : (
    <>{NOT_PROVIDED}</>
  )
}
