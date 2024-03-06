import FormioExport from "formio-export"
import {} from "react"
import { IPermitApplication } from "../models/permit-application"

export function usePermitApplicationPdfUpload() {
  const uploadFormPdf = async (permitApplication: IPermitApplication, formComponent, submission) => {
    const filename = permitApplication.generateFileName("form", ".pdf")
    // debugger
    let config = {
      download: true, // should the pdf file be downloaded once rendered
      filename, // the pdf file name
      margin: 10, // the pdf file margins
      html2canvas: {
        scale: 2, // scale factor for rendering the canvas (overall resolution of the canvas image)
        logging: true, // should console logging be enable during rendering
      },
      jsPDF: {
        orientation: "p", // PDF orientation - potrait / landscape
        unit: "mm", // measurement units used
        format: "a4", // paper size - can also accept custom (i.e. A4 - [210, 297])
      },
    }

    let options = {
      component: formComponent,
      data: submission.data,
      formio: {
        ignoreLayout: false,
      },
      config,
      // i18n: {
      //   en: {
      //     YES: "YES",
      //     NO: "NO",
      //   },
      //   fr: {
      //     YES: "OUI",
      //     NO: "NON",
      //   },
      // },
      // language: "en",
    }

    let exporter = new FormioExport(formComponent, submission, options)

    const pdf = await exporter.toPdf(config)
    const pdfBlob = pdf.output("blob")

    const file = new File([pdfBlob], filename, {
      type: pdfBlob.type,
      lastModified: new Date().getTime(),
    })

    // const presignResponse = await requestPresignedUrl(file, file.name)
    // const presignedData = await presignResponse.json()
    // await uploadFileInChunks(presignedData.signedUrls, presignedData.headers, file)
  }

  return { uploadFormPdf }
}
