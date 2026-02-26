import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { AttachedDocuments } from "./attached-documents"
import { BuildingComponentsAndAssemblies } from "./building-components-and-assemblies"
import { BuildingLocation } from "./building-location"
import { CalculationsPerformedBy } from "./calculations-performed-by"
import { CoolingZoneCompliance } from "./cooling-zone-compliance"
import { DesignConditions } from "./design-conditions"
import { Introduction } from "./introduction"
import { Summary } from "./summary"

export const FormSection = observer(function OverheatingCodeFormSection() {
  const { section } = useParams()

  useEffect(() => {
    const scroller = document.getElementById("overheatingCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  switch (section) {
    case "introduction":
      return <Introduction />
    case "building-location":
      return <BuildingLocation />
    case "cooling-zone-compliance":
      return <CoolingZoneCompliance />
    case "design-conditions":
      return <DesignConditions />
    case "building-components-and-assemblies":
      return <BuildingComponentsAndAssemblies />
    case "attached-documents":
      return <AttachedDocuments />
    case "calculations-performed-by":
      return <CalculationsPerformedBy />
    case "summary":
      return <Summary />
    default:
      return <LoadingScreen />
  }
})
