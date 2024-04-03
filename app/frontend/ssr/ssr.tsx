import ReactPDF from "@react-pdf/renderer"
import React from "react"
import { PDFContent } from "../components/shared/permit-applications/pdf-content"
import { combineComplianceHints } from "../utils/formio-component-traversal"

const args = process.argv.slice(2)

const generatePdf = async (pdfJsonData) => {
  try {
    console.log("Generating pdf...")
    // Parse JSON pdfData
    if (!pdfJsonData) {
      throw new Error("No pdfJson data provided")
    }
    const pdfData = JSON.parse(pdfJsonData)
    // console.log("Received pdfData:", await ReactPDF.renderToFile(<PdfDocument data={pdfData} />))
    if (!pdfData.meta?.generationPath) {
      throw new Error("No generationPath provided in pdfData.meta")
    }
    if (!pdfData.permitApplication) {
      throw new Error("No permit application")
    }

    pdfData.permitApplication.formattedFormJson = combineComplianceHints(
      pdfData.permitApplication?.formJson ?? {},
      pdfData.permitApplication?.formCustomizations ?? {},
      pdfData.permitApplication?.formattedComplianceData ?? {}
    )

    await ReactPDF.renderToFile(
      <PDFContent permitApplication={pdfData.permitApplication} />,
      pdfData.meta.generationPath
    )

    // console.log(
    //   "Pdf generated successfully at:",
    //   await ReactPDF.renderToString(<PDFContent permitApplication={pdfData.permitApplication} />)
    // )
  } catch (error) {
    console.error("Error generating pdf:", error.message)
  }
}

// Assuming data is passed as a JSON string
generatePdf(args[0])
