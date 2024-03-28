// Access command line arguments

import ReactPDF from "@react-pdf/renderer"
import React from "react"
import { PdfDocument } from "./pdf_document.js"

const args = process.argv.slice(2)

// Assuming data is passed as a JSON string
const pdfJsonData = args[0]

async function generatePdf() {
  try {
    // Parse JSON pdfData
    const pdfData = JSON.parse(pdfJsonData)
    // console.log("Received pdfData:", await ReactPDF.renderToFile(<PdfDocument data={pdfData} />))
    if (!pdfData.meta?.generationPath) {
      throw new Error("No generationPath provided in pdfData.meta")
    }

    await ReactPDF.renderToFile(<PdfDocument data={pdfData.document} />, pdfData.meta.generationPath)

    console.log("Pdf generated successfully at:", pdfData.meta.generationPath)
  } catch (error) {
    console.error("Error generating pdf:", error.message)
  }
}

generatePdf()
