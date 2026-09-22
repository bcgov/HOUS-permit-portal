import { Link } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
export const PrintPreviewLink = observer(function PrintPreviewLink({
  application,
  stepCode,
  checklist,
  associatedStepCode = false,
  submissionVersionId,
}: {
  application?: any
  stepCode?: any
  checklist?: any
  associatedStepCode?: boolean
  submissionVersionId?: string
}) {
  const { siteConfigurationStore } = useMst()
  if (!(import.meta.env.DEV || (import.meta.env.VITE_QA_MODE === "true" && siteConfigurationStore.qaToolsEnabled)))
    return null
  const version = submissionVersionId ?? application?.selectedSubmissionVersion?.id
  const url = application
    ? `/permit-applications/${application.id}/${associatedStepCode ? "step-code/" : ""}print${version ? `?submission_version_id=${encodeURIComponent(version)}` : ""}`
    : `/part-${stepCode?.type === "Part3StepCode" ? 3 : 9}-step-code/${stepCode?.id}/print${checklist?.id ? `?checklist_id=${encodeURIComponent(checklist.id)}` : ""}`
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" fontWeight="semibold" textDecoration="underline">
      {associatedStepCode ? "Step-code print preview" : "Print preview"}
    </Link>
  )
})
