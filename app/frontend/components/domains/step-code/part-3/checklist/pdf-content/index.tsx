import { Page, Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IPermitApplication } from "../../../../../../models/permit-application"
import { PDFDocument } from "../../../../../shared/pdf"
import { CoverPage } from "../../../../../shared/permit-applications/pdf-content/cover"
import { Footer } from "../../../../../shared/permit-applications/pdf-content/shared/footer"
import { page } from "../../../../../shared/permit-applications/pdf-content/shared/styles/page"

// TODO: Import necessary components and styles for Part 3 PDF
// TODO: Import Font if needed

interface IProps {
  checklist: IPart3StepCodeChecklist
  permitApplication: IPermitApplication
  assetDirectoryPath?: string
}

export const Part3PDFContent = function StepCodePart3ChecklistPDFContent({
  checklist,
  permitApplication,
  assetDirectoryPath,
}: IProps) {
  return (
    <PDFDocument assetDirectoryPath={assetDirectoryPath}>
      {/* TODO: Implement Cover Page similar to Part 9? */}
      <CoverPage
        permitApplication={permitApplication}
        subTitle={t("stepCodeChecklist.pdf.forPart3")}
        assetDirectoryPath={assetDirectoryPath}
      />
      <Page size="LETTER" style={page}>
        {/* <ProjectInfo checklist={checklist} /> */}
        <Text>Part 3 Checklist PDF Content for Checklist ID: {checklist.id}</Text>
        {/* TODO: Add specific Part 3 sections (Project Info, Compliance Summary, etc.) */}
        {/* TODO: Add Footer similar to Part 9? */}
        <Footer permitApplication={permitApplication} />
      </Page>
    </PDFDocument>
  )
}
