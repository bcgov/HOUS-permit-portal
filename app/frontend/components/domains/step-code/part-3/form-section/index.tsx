import { observer } from "mobx-react-lite"
import React from "react"
import { useParams } from "react-router-dom"
import { BaselineOccupancies } from "./baseline-occupancies"
import { BaselineOccupancy } from "./baseline-occupancy"
import { DistrictEnergy } from "./district-energy"
import { EnergySetup } from "./energy-setup"
import { FuelTypes } from "./fuel-types"
import { ProjectDetails } from "./project-details"
import { StartPage } from "./start-page"

export const FormSection = observer(function Part3StepCodeFormSection() {
  const { section } = useParams()

  switch (section) {
    case "start":
      return <StartPage />
    case "project-details":
      return <ProjectDetails />
    case "energy-setup":
      return <EnergySetup />
    case "district-energy":
      return <DistrictEnergy />
    case "baseline-occupancies":
      return <BaselineOccupancies />
    case "details":
      return <BaselineOccupancy />
    case "fuel-types":
      return <FuelTypes />
  }
})
