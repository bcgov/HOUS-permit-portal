import { PDFViewer } from "@react-pdf/renderer"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { PDFContent } from "."
import { usePermitApplication } from "../../../../../hooks/resources/use-permit-application"
import { IPermitApplication } from "../../../../../models/permit-application"
import { IStepCodeChecklist } from "../../../../../models/step-code-checklist"
import { LoadingScreen } from "../../../../shared/base/loading-screen"

interface IProps {
  mode: "html" | "pdf"
}

export const StepCodeChecklistPDFViewer = observer(function StepCodeChecklistPDFViewer({ mode }: IProps) {
  // permitApplication must be passed as props to <Content> due to a limitation of react-pdf
  // see: https://github.com/diegomura/react-pdf/issues/2263#issuecomment-1511800981
  const { currentPermitApplication } = usePermitApplication()
  const checklist = currentPermitApplication?.stepCode?.preConstructionChecklist
  useEffect(() => {
    const fetch = async () => await checklist.load()
    checklist && !checklist.isLoaded && fetch()
  }, [checklist?.isLoaded])

  return mode == "pdf" ? (
    <PDFViewer height="750px" width="100%">
      <Content permitApplication={currentPermitApplication} checklist={checklist} />
    </PDFViewer>
  ) : (
    <Content permitApplication={currentPermitApplication} checklist={checklist} />
  )
})

interface IContentProps {
  permitApplication: IPermitApplication
  checklist: IStepCodeChecklist
}

function Content({ permitApplication, checklist }: IContentProps) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {checklist?.isLoaded && <PDFContent permitApplication={permitApplication} checklist={checklist} />}
    </Suspense>
  )
}
