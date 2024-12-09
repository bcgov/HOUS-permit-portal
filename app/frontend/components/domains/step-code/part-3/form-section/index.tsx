import { observer } from "mobx-react-lite"
import React from "react"
import { useParams } from "react-router-dom"
import { BaselineOccupancies } from "./baseline-occupancies"
import { BaselineDetails } from "./baseline-occupancies/baseline-details"
import { DistrictEnergy } from "./district-energy"
import { FuelTypes } from "./fuel-types"
import { AdditionalFuelTypes } from "./fuel-types/additional-fuel-types"
import { LocationDetails } from "./location-details"
import { ProjectDetails } from "./project-details"
import { StartPage } from "./start-page"

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
  }
})
