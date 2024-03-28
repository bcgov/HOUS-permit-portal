import ReactPDF from "@react-pdf/renderer"
import React from "react"
import { PDFContent as StepCodeChecklistPDFContent } from "../components/domains/step-code/checklist/pdf-content"
import { PDFContent as PermitApplicationPDFContent } from "../components/shared/permit-applications/pdf-content"
import { combineComplianceHints } from "../utils/formio-component-traversal"

const args = process.argv.slice(2)

const generatePdfs = async (pdfJsonData) => {
  try {
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

    const permitApplicationPDFPath = pdfData.meta.generationPaths.permitApplication

    permitApplicationPDFPath &&
      (await ReactPDF.renderToFile(
        <PermitApplicationPDFContent permitApplication={pdfData.permitApplication} />,
        permitApplicationPDFPath
      ))

    if (pdfData.checklist) {
      const stepCodeChecklistPDFPath = pdfData.meta.generationPaths.stepCodeChecklist
      stepCodeChecklistPDFPath &&
        (await ReactPDF.renderToFile(
          <StepCodeChecklistPDFContent permitApplication={pdfData.permitApplication} checklist={pdfData.checklist} />,
          stepCodeChecklistPDFPath
        ))
    }
  } catch (error) {
    import.meta.env.DEV && console.error("Error generating pdf:", error.message)
  }
}

// Assuming data is passed as a JSON string
generatePdfs(args[0])
