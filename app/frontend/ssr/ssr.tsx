import ReactPDF from "@react-pdf/renderer"
import fs from "fs"
import React from "react"
import { Part3PDFContent } from "../components/domains/step-code/part-3/checklist/pdf-content"
import { Part9PDFContent } from "../components/domains/step-code/part-9/checklist/pdf-content"
import { PDFContent as PermitApplicationPDFContent } from "../components/shared/permit-applications/pdf-content"
import "../i18n/i18n"
import { combineComplianceHints } from "../utils/formio-component-traversal"

const ChecklistComponentMap = {
  low_residential: Part9PDFContent,
  medium_residential: Part3PDFContent,
}

const main = async () => {
  const args = process.argv.slice(2)
  const filePath = args[0]

  try {
    const pdfJsonData = fs.readFileSync(filePath, "utf-8")

    // Parse JSON pdfData
    if (!pdfJsonData) {
      throw new Error("No pdfJson data provided")
    }
    const pdfData = JSON.parse(pdfJsonData)

    if (!pdfData.meta?.generationPaths) {
      throw new Error("No generationPaths provided in pdfData.meta")
    }
    if (!pdfData.permitApplication) {
      throw new Error("No permit application")
    }

    pdfData.permitApplication.formattedFormJson = combineComplianceHints(
      pdfData.permitApplication?.formJson ?? {},
      pdfData.permitApplication?.formCustomizations ?? {},
      pdfData.permitApplication?.formattedComplianceData ?? {}
    )

    const { permitApplication: permitApplicationPDFPath, stepCodeChecklist: stepCodeChecklistPDFPath } =
      pdfData.meta.generationPaths
    const assetDirectoryPath = pdfData.meta.assetDirectoryPath

    if (permitApplicationPDFPath) {
      await ReactPDF.renderToFile(
        <PermitApplicationPDFContent
          permitApplication={pdfData.permitApplication}
          assetDirectoryPath={assetDirectoryPath}
        />,
        permitApplicationPDFPath
      )
    }

    if (stepCodeChecklistPDFPath) {
      const permitTypeCode = pdfData.permitApplication?.permitType?.code
      const ChecklistComponent = ChecklistComponentMap[permitTypeCode]

      if (!pdfData.checklist) {
        throw new Error("Checklist PDF generation failed: `checklist` data not provided in JSON input.")
      }
      if (!ChecklistComponent) {
        throw new Error(
          `Checklist PDF generation failed: No checklist component found for permit type code '${permitTypeCode}'.`
        )
      }

      await ReactPDF.renderToFile(
        <ChecklistComponent
          permitApplication={pdfData.permitApplication}
          checklist={pdfData.checklist}
          assetDirectoryPath={assetDirectoryPath}
        />,
        stepCodeChecklistPDFPath
      )
    }
  } catch (error) {
    console.error("Error generating pdf:", error.message)
    process.exit(1)
  }
}

main()
