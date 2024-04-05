import { Document } from "@react-pdf/renderer"
import React from "react"

import { IPermitApplication } from "../../../../models/permit-application"
import { ApplicationFields } from "./application"
import { CoverPage } from "./cover"

interface IProps {
  permitApplication: IPermitApplication
  assetDirectoryPath?: string
}

export const PDFContent = function PermitApplicationPDFContent({ permitApplication, assetDirectoryPath }: IProps) {
  return (
    <Document>
      <CoverPage permitApplication={permitApplication} assetDirectoryPath={assetDirectoryPath} />
      <ApplicationFields permitApplication={permitApplication} />
    </Document>
  )
}
