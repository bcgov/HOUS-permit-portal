import { Font, Page } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { PDFDocument } from "../../../../shared/pdf"
import { CoverPage } from "../../../../shared/permit-applications/pdf-content/cover"
import { Footer } from "../../../../shared/permit-applications/pdf-content/shared/footer"
import { page } from "../../../../shared/permit-applications/pdf-content/shared/styles/page"
import { BuildingCharacteristicsSummary } from "./building-characteristics-summary"
import { CompletedBy } from "./completed-by"
import { ComplianceSummary } from "./compliance-summary"
import { EnergyPerformanceCompliance } from "./energy-performance-compliance"
import { EnergyStepCompliance } from "./energy-step-compliance"
import { ProjectInfo } from "./project-info"
import { ZeroCarbonStepCompliance } from "./zero-carbon-step-compliance"

Font.registerHyphenationCallback((word) => [word])

interface IProps {
  checklist: IStepCodeChecklist
  permitApplication: IPermitApplication
  assetDirectoryPath?: string
}

export const PDFContent = function StepCodeChecklistPDFContent({
  checklist,
  permitApplication,
  assetDirectoryPath,
}: IProps) {
  return (
    <PDFDocument assetDirectoryPath={assetDirectoryPath}>
      <CoverPage
        permitApplication={permitApplication}
        subTitle={t("stepCodeChecklist.pdf.for")}
        assetDirectoryPath={assetDirectoryPath}
      />
      <Page size="LETTER" style={page}>
        <ProjectInfo checklist={checklist} />
        <ComplianceSummary checklist={checklist} />
        <CompletedBy checklist={checklist} />
        <BuildingCharacteristicsSummary checklist={checklist} />
        <EnergyPerformanceCompliance checklist={checklist} />
        <EnergyStepCompliance report={checklist.selectedReport.energy} />
        <ZeroCarbonStepCompliance report={checklist.selectedReport.zeroCarbon} />
        <Footer permitApplication={permitApplication} />
      </Page>
    </PDFDocument>
  )
}
