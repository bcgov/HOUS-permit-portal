import { Document, Font, Page } from "@react-pdf/renderer"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { styles } from "../../../../shared/permit-applications/pdf-content/application/styles"
import { BuildingCharacteristicsSummary } from "./building-characteristics-summary"
import { CompletedBy } from "./completed-by"
import { ComplianceSummary } from "./compliance-summary"
import { EnergyPerformanceCompliance } from "./energy-performance-compliance"
import { EnergyStepCompliance } from "./energy-step-compliance"
import { Footer } from "./footer"
import { ProjectInfo } from "./project-info"
import { StepCodeChecklistContext } from "./step-code-checklist-context"
import { ZeroCarbonStepCompliance } from "./zero-carbon-step-compliance"

Font.registerHyphenationCallback((word) => [word])

interface IProps {
  checklist: IStepCodeChecklist
  permitApplication: IPermitApplication
}

export const PDFContent = function StepCodeChecklistPDFContent({ checklist, permitApplication }: IProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <StepCodeChecklistContext.Provider value={{ checklist, permitApplication }}>
          <ProjectInfo />
          <ComplianceSummary />
          <CompletedBy />
          <BuildingCharacteristicsSummary />
          <EnergyPerformanceCompliance />
          <EnergyStepCompliance />
          <ZeroCarbonStepCompliance />
          <Footer />
        </StepCodeChecklistContext.Provider>
      </Page>
    </Document>
  )
}
