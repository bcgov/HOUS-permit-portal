import { Document } from "@react-pdf/renderer"
import React from "react"

import { t } from "i18next"
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
      <CoverPage
        permitApplication={permitApplication}
        subTitle={t("permitApplication.pdf.for")}
        assetDirectoryPath={assetDirectoryPath}
      />
      <ApplicationFields permitApplication={permitApplication} />
    </Document>
  )
}
