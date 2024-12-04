import { Instance, applySnapshot, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { navLinks } from "../components/domains/step-code/part-3/sidebar/nav-sections"
import { withEnvironment } from "../lib/with-environment"
import {
  EBuildingCodeVersion,
  EClimateZone,
  ECoolingSystemPlant,
  ECoolingSystemType,
  EDHWSystemType,
  EHeatingSystemPlant,
  EHeatingSystemType,
  EPart3StepCodeSoftware,
  EProjectStage,
} from "../types/enums"
import {
  IBaselineOccupancy,
  IDocumentReference,
  IEnergyOutput,
  IFuelType,
  IMakeUpAirFuel,
  IPart3NavLink,
  IPart3SectionCompletionStatus,
  IStepCodeOccupancy,
  TPart3NavLinkKey,
} from "../types/types"

export const Part3StepCodeChecklistModel = types
  .model("Part3StepCodeChecklistModel", {
    id: types.identifier,
    isLoaded: types.maybeNull(types.boolean),
    sectionCompletionStatus: types.maybeNull(types.frozen<IPart3SectionCompletionStatus>()),
    // permit application info
    projectName: types.maybeNull(types.string),
    projectIdentifier: types.maybeNull(types.string),
    projectAddress: types.maybeNull(types.string),
    jurisdictionName: types.maybeNull(types.string),
    permitDate: types.maybeNull(types.string),
    projectStage: types.maybeNull(types.enumeration<EProjectStage[]>(Object.values(EProjectStage))),
    buildingCodeVersion: types.maybeNull(
      types.enumeration<EBuildingCodeVersion[]>(Object.values(EBuildingCodeVersion))
    ),
    // location details
    buildingHeight: types.maybeNull(types.number),
    heatingDegreeDays: types.maybeNull(types.number),
    climateZone: types.maybeNull(types.enumeration<EClimateZone[]>(Object.values(EClimateZone))),
    // user input fields
    fuelTypes: types.array(types.frozen<IFuelType>()),
    baselineOccupancies: types.array(types.frozen<IBaselineOccupancy>()),
    referenceEnergyOutputs: types.array(types.frozen<IEnergyOutput>()),
    stepCodeOccupancies: types.array(types.frozen<IStepCodeOccupancy>()),
    generatedElectricity: types.maybeNull(types.string),
    modelledEnergyOutputs: types.array(types.frozen<IEnergyOutput>()),
    totalAnnualThermalEnergyDemand: types.maybeNull(types.string),
    totalAnnualCoolingEnergyDemand: types.maybeNull(types.string),
    stepCodeAnnualThermalEnergyDemand: types.maybeNull(types.string),
    overheatingHours: types.maybeNull(types.string),
    pressurizedDoorsCount: types.maybeNull(types.string),
    pressurizationAirflowPerDoor: types.maybeNull(types.string),
    pressurizedCorridorsArea: types.maybeNull(types.string),
    makeUpAirFuels: types.array(types.frozen<IMakeUpAirFuel>()),
    suiteHeatingEnergy: types.maybeNull(types.string),
    documentReferences: types.array(types.frozen<IDocumentReference>()),
    software: types.maybeNull(types.enumeration<EPart3StepCodeSoftware[]>(Object.values(EPart3StepCodeSoftware))),
    softwareName: types.maybeNull(types.string),
    simulationWeatherFile: types.maybeNull(types.string),
    aboveGradeWallArea: types.maybeNull(types.string),
    windowToWallAreaRatio: types.maybeNull(types.string),
    designAirtightness: types.maybeNull(types.string),
    modelledInfiltrationRate: types.maybeNull(types.string),
    averageWallClearFieldRValue: types.maybeNull(types.string),
    averageWallEffectiveRValue: types.maybeNull(types.string),
    averageRoofClearFieldRValue: types.maybeNull(types.string),
    averageRoofEffectiveRValue: types.maybeNull(types.string),
    averageWindowEffectiveUValue: types.maybeNull(types.string),
    averageWindowSolarHeatGainCoefficient: types.maybeNull(types.string),
    averageOccupantDensity: types.maybeNull(types.string),
    averageLightingPowerDensity: types.maybeNull(types.string),
    averageVentilationRate: types.maybeNull(types.string),
    dhwLowFlowSavings: types.maybeNull(types.string),
    isDemandControlVentilationUsed: types.maybeNull(types.boolean),
    sensibleRecoveryCoefficient: types.maybeNull(types.string),
    heatingSystemPlant: types.maybeNull(types.enumeration<EHeatingSystemPlant[]>(Object.values(EHeatingSystemPlant))),
    heatingSystemType: types.maybeNull(types.enumeration<EHeatingSystemType[]>(Object.values(EHeatingSystemType))),
    heatingSystemDescription: types.maybeNull(types.string),
    coolingSystemPlant: types.maybeNull(types.enumeration<ECoolingSystemPlant[]>(Object.values(ECoolingSystemPlant))),
    coolingSystemType: types.maybeNull(types.enumeration<ECoolingSystemType[]>(Object.values(ECoolingSystemType))),
    coolingSystemDescription: types.maybeNull(types.string),
    dhwSystemType: types.maybeNull(types.enumeration<EDHWSystemType[]>(Object.values(EDHWSystemType))),
    dhwSystemDescription: types.maybeNull(types.string),
    completedByName: types.maybeNull(types.string),
    completedByTitle: types.maybeNull(types.string),
    completedByPhoneNumber: types.maybeNull(types.string),
    completedByEmail: types.maybeNull(types.string),
    completedByOrganizationName: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .views((self) => ({
    isComplete(key: TPart3NavLinkKey): boolean {
      return self.sectionCompletionStatus[key]
    },
  }))
  .views((self) => ({
    get currentNavLink(): IPart3NavLink | undefined {
      return navLinks.find((l) => !self.isComplete(l.key))
    },
  }))
  .actions((self) => ({
    completeSection: flow(function* (key: TPart3NavLinkKey) {
      let updatedStatus = R.clone(self.sectionCompletionStatus)
      updatedStatus[key] = true
      const response = yield self.environment.api.updatePart3Checklist(self.id, {
        sectionCompletionStatus: updatedStatus,
      })
      if (response.ok) {
        self.sectionCompletionStatus = updatedStatus
        return true
      }
    }),
    update: flow(function* (values) {
      const response = yield self.environment.api.updatePart3Checklist(self.id, values)
      if (response.ok) {
        applySnapshot(self, response.data.data)
        return true
      }
    }),
  }))

export interface IPart3StepCodeChecklist extends Instance<typeof Part3StepCodeChecklistModel> {}
