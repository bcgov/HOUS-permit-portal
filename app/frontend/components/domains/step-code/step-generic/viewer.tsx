import { PDFViewer } from "@react-pdf/renderer"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { IPart3StepCodeChecklist } from "../../../../models/part-3-step-code-checklist"
import { IPart9StepCodeChecklist } from "../../../../models/part-9-step-code-checklist"
import { IPermitApplication } from "../../../../models/permit-application"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { Part3PDFContent } from "../part-3/checklist/pdf-content/index"
import { Part9PDFContent } from "../part-9/checklist/pdf-content/index"

interface IProps {
  mode: "html" | "pdf"
}

export const StepCodeChecklistPDFViewer = observer(function StepCodeChecklistPDFViewer({ mode }: IProps) {
  // permitApplication must be passed as props to <Content> due to a limitation of react-pdf
  // see: https://github.com/diegomura/react-pdf/issues/2263#issuecomment-1511800981
  const { currentPermitApplication } = usePermitApplication()
  const checklist =
    currentPermitApplication?.stepCode?.type == "Part3StepCode"
      ? currentPermitApplication?.stepCode?.checklist
      : currentPermitApplication?.stepCode?.preConstructionChecklist
  //TODO: WHAT IF THERE IS NO PERMIT APPLICATION? WE PASS ONLY THE CHECKLIST
  useEffect(() => {
    const fetch = async () => await checklist.load()
    checklist && !checklist.isLoaded && fetch()
  }, [checklist?.isLoaded])

  return mode == "pdf" ? (
    <PDFViewer height="750px" width="100%">
      <Content
        type={currentPermitApplication?.stepCode?.type}
        permitApplication={currentPermitApplication}
        checklist={checklist}
      />
    </PDFViewer>
  ) : (
    <Content
      type={currentPermitApplication?.stepCode?.type}
      permitApplication={currentPermitApplication}
      checklist={checklist}
    />
  )
})

interface IContentProps {
  type?: "Part9StepCode" | "Part3StepCode"
  permitApplication?: IPermitApplication
  checklist: IPart9StepCodeChecklist | IPart3StepCodeChecklist
}

function Content({ type, permitApplication, checklist }: IContentProps) {
  let pdfContent = <React.Fragment key={"step-code-pdf"}></React.Fragment>
  switch (type) {
    case "Part9StepCode":
      pdfContent = <Part9PDFContent key={"step-code-pdf"} permitApplication={permitApplication} checklist={checklist} />
      break
    case "Part3StepCode":
      pdfContent = <Part3PDFContent key={"step-code-pdf"} permitApplication={permitApplication} checklist={checklist} />
  }

  return <Suspense fallback={<LoadingScreen />}>{checklist?.isLoaded && pdfContent}</Suspense>
}
