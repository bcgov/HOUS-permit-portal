import { Font, Page } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IPermitApplication } from "../../../../../../models/permit-application"
import { PDFDocument } from "../../../../../shared/pdf"
import { CoverPage } from "../../../../../shared/permit-applications/pdf-content/cover"
import { Footer } from "../../../../../shared/permit-applications/pdf-content/shared/footer"
import { page } from "../../../../../shared/permit-applications/pdf-content/shared/styles/page"
import { ProjectInfo } from "./project-info"

Font.registerHyphenationCallback((word) => [word])

interface IProps {
  checklist: IPart3StepCodeChecklist
  permitApplication?: IPermitApplication
  assetDirectoryPath?: string
}

export const Part3PDFContent = function StepCodeChecklistPDFContent({
  checklist,
  permitApplication,
  assetDirectoryPath,
}: IProps) {
  return (
    <PDFDocument assetDirectoryPath={assetDirectoryPath}>
      {permitApplication && (
        <CoverPage
          permitApplication={permitApplication}
          subTitle={t("stepCodeChecklist.part3.pdf.for")}
          assetDirectoryPath={assetDirectoryPath}
        />
      )}
      <Page size="LETTER" style={page}>
        <ProjectInfo checklist={checklist} />
        {/* <ComplianceSummary checklist={checklist} />
        <CompletedBy checklist={checklist} />
        <BuildingCharacteristicsSummary checklist={checklist} />
        <EnergyPerformanceCompliance checklist={checklist} />
        <EnergyStepCompliance report={checklist.selectedReport.energy} />
        <ZeroCarbonStepCompliance report={checklist.selectedReport.zeroCarbon} /> */}
        {permitApplication && <Footer permitApplication={permitApplication} />}
      </Page>
    </PDFDocument>
  )
}
