import { Page } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IPermitApplication } from "../../../../../../models/permit-application"
import { isBaselineChecklist, isMixedUseChecklist } from "../../../../../../utils/utility-functions"
import { PDFDocument } from "../../../../../shared/pdf"
import { CoverPage } from "../../../../../shared/permit-applications/pdf-content/cover"
import { Footer } from "../../../../../shared/permit-applications/pdf-content/shared/footer"
import { page } from "../../../../../shared/permit-applications/pdf-content/shared/styles/page"
import { MixedUseSummary } from "./mixed-use-summary"
import { ProjectInfo } from "./project-info/index"
import { StepCodePerformanceSummary } from "./step-code-performance-summary/index"

// TODO: Import necessary components and styles for Part 3 PDF
// TODO: Import Font if needed

interface IProps {
  checklist: IPart3StepCodeChecklist
  permitApplication?: IPermitApplication
  stepCode?: { fullAddress?: string; jurisdictionName?: string }
  assetDirectoryPath?: string
}

export const Part3PDFContent = function StepCodePart3ChecklistPDFContent({
  checklist,
  permitApplication,
  stepCode,
  assetDirectoryPath,
}: IProps) {
  // Use views from MST model (hardened helpers)
  const isMixedUse = isMixedUseChecklist(checklist as any)
  const isBaseline = isBaselineChecklist(checklist as any)

  return (
    <PDFDocument assetDirectoryPath={assetDirectoryPath}>
      <CoverPage
        permitApplication={permitApplication}
        stepCode={stepCode}
        subTitle={t("stepCodeChecklist.pdf.forPart3")}
        assetDirectoryPath={assetDirectoryPath}
      />
      <Page size="LETTER" style={page}>
        <ProjectInfo stepCode={stepCode} checklist={checklist} />
        {/* Placeholder for Step Code Performance Summary */}
        <StepCodePerformanceSummary checklist={checklist} />
        {/* Placeholder for Mixed Use/Baseline Summary (conditional) */}
        {(isMixedUse || isBaseline) && <MixedUseSummary checklist={checklist} />}
        {/* TODO: Add other necessary sections? e.g., Completed By? */}
        <Footer permitApplication={permitApplication} />
      </Page>
    </PDFDocument>
  )
}
