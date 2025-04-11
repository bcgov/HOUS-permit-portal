import { PDFViewer } from "@react-pdf/renderer"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { PDFContent } from "."
import { usePermitApplication } from "../../../../../../hooks/resources/use-permit-application"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { IPart9StepCodeChecklist } from "../../../../../../models/part-9-step-code-checklist"
import { IPermitApplication } from "../../../../../../models/permit-application"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"

// Union type for checklists
type TChecklist = IPart9StepCodeChecklist | IPart3StepCodeChecklist

interface IProps {
  mode: "html" | "pdf"
  checklist: TChecklist
}

export const StepCodeChecklistPDFViewer = observer(function StepCodeChecklistPDFViewer({ mode, checklist }: IProps) {
  // permitApplication must be passed as props to <Content> due to a limitation of react-pdf
  // see: https://github.com/diegomura/react-pdf/issues/2263#issuecomment-1511800981
  const { currentPermitApplication } = usePermitApplication()
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
  checklist: TChecklist
}

function Content({ permitApplication, checklist }: IContentProps) {
  // Check for a property unique to Part 9 checklist ('stage')
  const isPart9 = "stage" in checklist

  return (
    <Suspense fallback={<LoadingScreen />}>
      {checklist?.isLoaded && isPart9 && (
        <PDFContent permitApplication={permitApplication} checklist={checklist as IPart9StepCodeChecklist} />
      )}
      {checklist?.isLoaded && !isPart9 && (
        // Replace with actual Part 3 component later
        // We'll need to import IPart3StepCodeChecklist here when we add the real component
        <div>Part 3 PDF Content for {checklist.id} Placeholder</div>
      )}
    </Suspense>
  )
}
