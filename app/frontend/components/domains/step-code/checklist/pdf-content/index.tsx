import { Document, Font, Page } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { Footer } from "../../../../shared/base/footer"
import { styles } from "../../../../shared/permit-applications/pdf-content/application/styles"
import { CoverPage } from "../../../../shared/permit-applications/pdf-content/cover"
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
}

export const PDFContent = function StepCodeChecklistPDFContent({ checklist, permitApplication }: IProps) {
  return (
    <Document>
      <CoverPage permitApplication={permitApplication} subTitle={t("stepCodeChecklist.pdf.for")} />
      <Page size="LETTER" style={styles.page}>
        <ProjectInfo checklist={checklist} />
        <ComplianceSummary checklist={checklist} />
        <CompletedBy checklist={checklist} />
        <BuildingCharacteristicsSummary checklist={checklist} />
        <EnergyPerformanceCompliance checklist={checklist} />
        <EnergyStepCompliance checklist={checklist} />
        <ZeroCarbonStepCompliance checklist={checklist} />
        <Footer permitApplication={permitApplication} />
      </Page>
    </Document>
  )
}
