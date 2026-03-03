import ReactPDF from "@react-pdf/renderer"
import fs from "fs"
import React from "react"
import { Part3PDFContent } from "../components/domains/step-code/part-3/checklist/pdf-content"
import { Part9PDFContent } from "../components/domains/step-code/part-9/checklist/pdf-content"
import { PDFComponentRegistry } from "../components/shared/pdf/pdf-component-registry"
import { PDFContent as PermitApplicationPDFContent } from "../components/shared/permit-applications/pdf-content"
import "../i18n/i18n"
import { EStepCodeType } from "../types/enums"
import { combineCustomizations } from "../utils/formio-component-traversal"

const ChecklistComponentMap = {
  [EStepCodeType.part9StepCode]: Part9PDFContent,
  [EStepCodeType.part3StepCode]: Part3PDFContent,
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
    // Only require permitApplication if a permit application PDF is being generated
    const generationPaths = pdfData.meta.generationPaths
    const requiresPermitApplication = Boolean(generationPaths?.permitApplication)
    if (requiresPermitApplication && !pdfData.permitApplication) {
      throw new Error("No permit application")
    }

    if (pdfData.permitApplication) {
      pdfData.permitApplication.formattedFormJson = combineCustomizations(
        pdfData.permitApplication?.formJson ?? {},
        pdfData.permitApplication?.formCustomizations ?? {},
        pdfData.permitApplication?.formattedComplianceData ?? {},
        pdfData.permitApplication?.jurisdiction?.resources
      )
    }

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
      const stepCodeType = pdfData?.checklist?.stepCodeType ?? EStepCodeType.part9StepCode
      const ChecklistComponent = ChecklistComponentMap[stepCodeType]

      if (!pdfData.checklist) {
        throw new Error("Checklist PDF generation failed: `checklist` data not provided in JSON input.")
      }
      if (!ChecklistComponent) {
        throw new Error(
          `Checklist PDF generation failed: No checklist component found for step code type '${stepCodeType}'.`
        )
      }

      await ReactPDF.renderToFile(
        <ChecklistComponent
          permitApplication={pdfData.permitApplication}
          stepCode={pdfData.stepCode}
          checklist={pdfData.checklist}
          assetDirectoryPath={assetDirectoryPath}
        />,
        stepCodeChecklistPDFPath
      )
    } else if (pdfData.overheatingTool) {
      const { overheatingTool: overheatingToolPDFPath } = pdfData.meta.generationPaths
      const assetDirectoryPath = pdfData.meta.assetDirectoryPath

      if (!overheatingToolPDFPath) {
        throw new Error("No overheatingTool path provided in generationPaths")
      }

      const formType = pdfData.overheatingTool.formType
      const PDFComponent = PDFComponentRegistry[formType]

      if (!PDFComponent) {
        throw new Error(`No PDF component found for form type: ${formType}`)
      }
      await ReactPDF.renderToFile(
        <PDFComponent data={pdfData.overheatingTool} assetDirectoryPath={assetDirectoryPath} />,
        overheatingToolPDFPath
      )
    }
  } catch (error) {
    console.error("Error generating pdf:", error.message)
    process.exit(1)
  }
}

main()
