import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { AgreementsAndConsent } from "./agreements-and-consent"
import { BuildingType } from "./building-type"
import { ConfirmSubmission } from "./confirm-submission"
import { ProjectAddress } from "./project-address"
import { ResultsSummary } from "./results-summary"
import { ServicePartner } from "./service-partner"
import { UploadDrawings } from "./upload-drawings"

export const FormSection = observer(function PreCheckFormSection() {
  const { section } = useParams()

  useEffect(() => {
    const scroller = document.getElementById("preCheckScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  switch (section) {
    case "service-partner":
      return <ServicePartner />
    case "project-address":
      return <ProjectAddress />
    case "agreements-and-consent":
      return <AgreementsAndConsent />
    case "building-type":
      return <BuildingType />
    case "upload-drawings":
      return <UploadDrawings />
    case "confirm-submission":
      return <ConfirmSubmission />
    case "results-summary":
      return <ResultsSummary />
    default:
      return <LoadingScreen />
  }
})
