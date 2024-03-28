import { Document } from "@react-pdf/renderer"
import React from "react"

import { IPermitApplication } from "../../../../models/permit-application"
import { ApplicationFields } from "./application"
import { CoverPage } from "./cover"

interface IProps {
  permitApplication: IPermitApplication
}

export const PDFContent = function PermitApplicationPDFContent({ permitApplication }: IProps) {
  return (
    <Document>
      <CoverPage permitApplication={permitApplication} />
      <ApplicationFields permitApplication={permitApplication} />
    </Document>
  )
}
