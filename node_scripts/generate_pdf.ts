// import ReactPDF from "@react-pdf/renderer"
// import { PDFContent } from "../app/frontend/components/shared/permit-applications/pdf-content/index"
// Access command line arguments

const args = process.argv.slice(2)

const generatePdf = (pdfJsonData) => {
  try {
    // Parse JSON pdfData
    if (!pdfJsonData) {
      throw new Error("No pdfJson data provdied")
    }
    const pdfData = JSON.parse(pdfJsonData)
    // console.log("Received pdfData:", await ReactPDF.renderToFile(<PdfDocument data={pdfData} />))
    if (!pdfData.meta?.generationPath) {
      throw new Error("No generationPath provided in pdfData.meta")
    }
    if (!pdfData.permitApplication) {
      throw new Error("No permit application")
    }

    // await ReactPDF.render(<PDFContent permitApplication={pdfData.permitApplication} />, pdfData.meta.generationPath)

    console.log("Pdf generated successfully at:", pdfData.meta.generationPath)
  } catch (error) {
    console.error("Error generating pdf:", error.message)
  }
}

// Assuming data is passed as a JSON string
generatePdf(args[0])
