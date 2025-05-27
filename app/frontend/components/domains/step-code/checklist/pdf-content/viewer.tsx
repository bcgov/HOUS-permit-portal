import { PDFViewer } from "@react-pdf/renderer"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { usePermitApplication } from "../../../../../hooks/resources/use-permit-application"
import { IPart3StepCodeChecklist } from "../../../../../models/part-3-step-code-checklist"
import { IPart9StepCodeChecklist } from "../../../../../models/part-9-step-code-checklist"
import { IPermitApplication } from "../../../../../models/permit-application"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { Part3PDFContent } from "../../part-3/checklist/pdf-content"
import { Part9PDFContent } from "../../part-9/checklist/pdf-content"

interface IProps {
  mode: "html" | "pdf"
}

export const StepCodeChecklistPDFViewer = observer(function StepCodeChecklistPDFViewer({ mode }: IProps) {
  const { currentPermitApplication } = usePermitApplication()
  const checklist = currentPermitApplication?.stepCode?.checklistForPdf
  useEffect(() => {
    const fetch = async () => {
      if (!checklist) return // Guard against null checklist

      // Check if the checklist object has a load function before calling it
      if (typeof checklist.load === "function") {
        await checklist.load()
      }
    }
    // Trigger fetch only if checklist exists but is not loaded
    if (checklist && !checklist.isLoaded) {
      fetch()
    }
    // Dependency: only re-run if the checklist object itself changes
  }, [checklist])

  // Display loading screen if checklist is not available or not loaded yet
  if (!checklist || !checklist.isLoaded) {
    // In 'html' mode, Content component handles suspense/loading internally
    // In 'pdf' mode, we must prevent rendering PDFViewer until loaded
    return mode === "pdf" ? (
      <LoadingScreen />
    ) : (
      <Content permitApplication={currentPermitApplication} checklist={checklist} />
    )
  }

  // Checklist is loaded, render PDF or HTML content
  return mode == "pdf" ? (
    <PDFViewer height="1240px" width="100%">
      <Content permitApplication={currentPermitApplication} checklist={checklist} />
    </PDFViewer>
  ) : (
    <Content permitApplication={currentPermitApplication} checklist={checklist} />
  )
})

interface IContentProps {
  permitApplication: IPermitApplication
  checklist: IPart9StepCodeChecklist | IPart3StepCodeChecklist | null // Allow null for initial render in 'html' mode
}

function Content({ permitApplication, checklist }: IContentProps) {
  // Handle null checklist explicitly (relevant for 'html' mode before loading finishes)
  if (!checklist) {
    return <LoadingScreen />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Parent component now ensures checklist exists and is loaded when rendering PDFViewer,
          so isLoaded checks are removed here. Still needed for Suspense in html mode */}
      {checklist.stepCodeType === EStepCodeType.part9StepCode && (
        <Part9PDFContent permitApplication={permitApplication} checklist={checklist as IPart9StepCodeChecklist} />
      )}
      {checklist.stepCodeType === EStepCodeType.part3StepCode && (
        <Part3PDFContent permitApplication={permitApplication} checklist={checklist as IPart3StepCodeChecklist} />
      )}
    </Suspense>
  )
}
