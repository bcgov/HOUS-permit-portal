import { Document } from "@react-pdf/renderer"
import React from "react"

import { IPermitApplication } from "../../../../models/permit-application"
import { ApplicationFields } from "./application"
import { CoverPage } from "./cover"
import { PermitApplicationContext } from "./shared/permit-application-context"

interface IProps {
  permitApplication: IPermitApplication
}

export const PDFContent = function PermitApplicationPDFContent({ permitApplication }: IProps) {
  return (
    <Document>
      <PermitApplicationContext.Provider value={permitApplication}>
        <CoverPage />
        <ApplicationFields />
      </PermitApplicationContext.Provider>
    </Document>
  )
}
