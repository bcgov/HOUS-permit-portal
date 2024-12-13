import { observer } from "mobx-react-lite"
import React from "react"
import { useParams } from "react-router-dom"
import { BaselineOccupancies } from "./baseline-occupancies"
import { BaselineDetails } from "./baseline-occupancies/baseline-details"
import { BaselinePerformance } from "./baseline-performance"
import { DistrictEnergy } from "./district-energy"
import { DocumentReferences } from "./document-references"
import { FuelTypes } from "./fuel-types"
import { AdditionalFuelTypes } from "./fuel-types/additional-fuel-types"
import { HVAC } from "./hvac"
import { LocationDetails } from "./location-details"
import { ModelledOutputs } from "./modelled-outputs"
import { OverheatingRequirements } from "./overheating-requirements"
import { PerformanceCharacteristics } from "./performance-characteristics"
import { ProjectDetails } from "./project-details"
import { RenewableEnergy } from "./renewable-energy"
import { RequirementsSummary } from "./requirements-summary"
import { ResidentialAdjustments } from "./residential-adjustments"
import { StartPage } from "./start-page"
import { StepCodeOccupancies } from "./step-code-occupancies"
import { StepCodeOccupanciesPerformanceRequirements } from "./step-code-occupancies/performance-requirements"

export const FormSection = observer(function Part3StepCodeFormSection() {
  const { section } = useParams()

  switch (section) {
    case "start":
      return <StartPage />
    case "project-details":
      return <ProjectDetails />
    case "location-details":
      return <LocationDetails />
    case "district-energy":
      return <DistrictEnergy />
    case "baseline-occupancies":
      return <BaselineOccupancies />
    case "baseline-details":
      return <BaselineDetails />
    case "fuel-types":
      return <FuelTypes />
    case "additional-fuel-types":
      return <AdditionalFuelTypes />
    case "baseline-performance":
      return <BaselinePerformance />
    case "step-code-occupancies":
      return <StepCodeOccupancies />
    case "step-code-performance-requirements":
      return <StepCodeOccupanciesPerformanceRequirements />
    case "modelled-outputs":
      return <ModelledOutputs />
    case "renewable-energy":
      return <RenewableEnergy />
    case "overheating-requirements":
      return <OverheatingRequirements />
    case "residential-adjustments":
      return <ResidentialAdjustments />
    case "performance-characteristics":
      return <PerformanceCharacteristics />
    case "hvac":
      return <HVAC />
    case "requirements-summary":
      return <RequirementsSummary />
    case "document-references":
      return <DocumentReferences />
  }
})
