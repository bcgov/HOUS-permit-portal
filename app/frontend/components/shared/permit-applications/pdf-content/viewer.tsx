import { PDFViewer } from "@react-pdf/renderer"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { PDFContent } from "."
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { IPermitApplication } from "../../../../models/permit-application"
import { LoadingScreen } from "../../base/loading-screen"

interface IProps {
  mode: "html" | "pdf"
}

export const PermitApplicationPDFViewer = observer(function PermitApplicationPDFViewer({ mode }: IProps) {
  // permitApplication must be passed as props to <Content> due to a limitation of react-pdf
  // see: https://github.com/diegomura/react-pdf/issues/2263#issuecomment-1511800981
  const { currentPermitApplication } = usePermitApplication({ review: true })

  return mode == "pdf" ? (
    <PDFViewer height="750px" width="100%">
      <Content permitApplication={currentPermitApplication} />
    </PDFViewer>
  ) : (
    <Content permitApplication={currentPermitApplication} />
  )
})

function Content({ permitApplication }: { permitApplication: IPermitApplication }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {permitApplication && <PDFContent permitApplication={permitApplication} />}
    </Suspense>
  )
}
