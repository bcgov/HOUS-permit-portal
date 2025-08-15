import { t } from "i18next"
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
  EFuelType,
  EHeatingSystemPlant,
  EHeatingSystemType,
  EIsSuiteSubMetered,
  EPart3BuildingType,
  EPart3StepCodeSoftware,
  EProjectStage,
  EStepCodeType,
} from "../types/enums"
import {
  DeepPartial,
  IBaselineOccupancy,
  IDocumentReference,
  IEnergyOutput,
  IFuelType,
  IMakeUpAirFuel,
  IOption,
  IPart3ComplianceReport,
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
    projectStage: types.maybeNull(types.enumeration<EProjectStage[]>(Object.values(EProjectStage))),
    buildingCodeVersion: types.maybeNull(
      types.enumeration<EBuildingCodeVersion[]>(Object.values(EBuildingCodeVersion))
    ),
    // location details
    buildingHeight: types.maybeNull(types.string),
    heatingDegreeDays: types.maybeNull(types.number),
    climateZone: types.maybeNull(types.enumeration<EClimateZone[]>(Object.values(EClimateZone))),
    // user input fields
    fuelTypes: types.array(types.frozen<IFuelType>()),
    baselineOccupancies: types.array(types.frozen<IBaselineOccupancy>()),
    refAnnualThermalEnergyDemand: types.maybeNull(types.string),
    referenceEnergyOutputs: types.array(types.frozen<IEnergyOutput>()),
    stepCodeOccupancies: types.array(types.frozen<IStepCodeOccupancy>()),
    generatedElectricity: types.maybeNull(types.string),
    modelledEnergyOutputs: types.array(types.frozen<IEnergyOutput>()),
    totalAnnualThermalEnergyDemand: types.maybeNull(types.string),
    totalAnnualCoolingEnergyDemand: types.maybeNull(types.string),
    totalOccupancyFloorArea: types.maybeNull(types.string),
    totalStepCodeOccupancyFloorArea: types.maybeNull(types.string),
    stepCodeAnnualThermalEnergyDemand: types.maybeNull(types.string),
    overheatingHoursLimit: types.maybeNull(types.number),
    overheatingHours: types.maybeNull(types.string),
    pressurizedDoorsCount: types.maybeNull(types.number),
    pressurizationAirflowPerDoor: types.maybeNull(types.string),
    pressurizedCorridorsArea: types.maybeNull(types.string),
    makeUpAirFuels: types.array(types.frozen<IMakeUpAirFuel>()),
    isSuiteSubMetered: types.maybeNull(types.enumeration<EIsSuiteSubMetered[]>(Object.values(EIsSuiteSubMetered))),
    suiteHeatingEnergy: types.maybeNull(types.string),
    documentReferences: types.array(types.frozen<IDocumentReference>()),
    software: types.maybeNull(types.enumeration<EPart3StepCodeSoftware[]>(Object.values(EPart3StepCodeSoftware))),
    softwareName: types.maybeNull(types.string),
    simulationWeatherFile: types.maybeNull(types.string),
    aboveGroundWallArea: types.maybeNull(types.string),
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
    sensibleRecoveryEfficiency: types.maybeNull(types.string),
    heatingSystemPlant: types.maybeNull(types.enumeration<EHeatingSystemPlant[]>(Object.values(EHeatingSystemPlant))),
    heatingSystemType: types.maybeNull(types.enumeration<EHeatingSystemType[]>(Object.values(EHeatingSystemType))),
    heatingSystemTypeDescription: types.maybeNull(types.string),
    heatingSystemPlantDescription: types.maybeNull(types.string),
    coolingSystemPlant: types.maybeNull(types.enumeration<ECoolingSystemPlant[]>(Object.values(ECoolingSystemPlant))),
    coolingSystemType: types.maybeNull(types.enumeration<ECoolingSystemType[]>(Object.values(ECoolingSystemType))),
    coolingSystemTypeDescription: types.maybeNull(types.string),
    coolingSystemPlantDescription: types.maybeNull(types.string),
    dhwSystemType: types.maybeNull(types.enumeration<EDHWSystemType[]>(Object.values(EDHWSystemType))),
    dhwSystemDescription: types.maybeNull(types.string),
    completedByName: types.maybeNull(types.string),
    completedByTitle: types.maybeNull(types.string),
    completedByPhoneNumber: types.maybeNull(types.string),
    completedByEmail: types.maybeNull(types.string),
    completedByOrganizationName: types.maybeNull(types.string),
    complianceReport: types.maybeNull(types.frozen<IPart3ComplianceReport>()),
  })
  .extend(withEnvironment())
  .volatile((self) => ({
    alternateNavigateAfterSavePath: types.maybeNull(types.string).create(null),
  }))
  .views((self) => ({
    get stepCodeType() {
      return EStepCodeType.part3StepCode
    },
    isComplete(key: TPart3NavLinkKey): boolean {
      return self.sectionCompletionStatus[key]?.complete
    },
    get isAllComplete(): boolean {
      if (!self.sectionCompletionStatus) return false
      return Object.values(self.sectionCompletionStatus).every((status) => (status.relevant ? status.complete : true))
    },
    isRelevant(key: TPart3NavLinkKey): boolean {
      return self.sectionCompletionStatus[key]?.relevant
    },
    get isBaseline(): boolean {
      // Check if stepCodeOccupancies is empty
      return self.stepCodeOccupancies.length === 0
    },
    get isMixedUse(): boolean {
      // Check if total occupancies > 1
      return self.stepCodeOccupancies.length + self.baselineOccupancies.length > 1
    },
    fuelType(id: string): IFuelType {
      return self.fuelTypes.find((ft) => ft.id == id)
    },
    get districtEnergyFuelType(): IFuelType | undefined {
      return self.fuelTypes.find((ft) => ft.key == EFuelType.districtEnergy)
    },
    get defaultFuelTypeKeys(): EFuelType[] {
      return [EFuelType.electricity, EFuelType.naturalGas, EFuelType.districtEnergy]
    },
    get electricity(): IFuelType {
      return self.fuelTypes.find((ft) => ft.key == EFuelType.electricity)
    },
    get fuelTypeIdsToFuelType(): Record<string, IFuelType> {
      return self.fuelTypes.reduce((acc, fuelType) => {
        acc[fuelType.id] = fuelType
        return acc
      }, {})
    },
    get fuelTypeSelectOptions(): IOption[] {
      return self.fuelTypes.map((ft) => ({
        label: ft.key == EFuelType.other ? ft.description : t(`stepCode.part3.fuelTypes.fuelTypeKeys.${ft.key}`),
        value: ft.id,
      }))
    },
    get baselineMFA() {
      return R.reduce((sum, oc) => sum + parseFloat(oc.modelledFloorArea), 0, self.baselineOccupancies)
    },
    get stepCodeMFA() {
      return R.reduce((sum, oc) => sum + parseFloat(oc.modelledFloorArea), 0, self.stepCodeOccupancies)
    },
    get buildingType(): EPart3BuildingType {
      if (R.isEmpty(self.stepCodeOccupancies)) {
        return EPart3BuildingType.baseline
      } else if (R.isEmpty(self.baselineOccupancies)) {
        return EPart3BuildingType.stepCode
      } else {
        return EPart3BuildingType.mixedUse
      }
    },
  }))
  .views((self) => ({
    get totalElectricityUse(): number {
      return self.modelledEnergyOutputs
        .filter((eo) => eo.fuelTypeId == self.electricity?.id)
        .reduce((sum, eo) => sum + parseFloat(eo.annualEnergy), 0)
    },
    get uncommonFuelTypeKeys(): EFuelType[] {
      return Object.values(EFuelType).filter((key) => !R.includes(key, self.defaultFuelTypeKeys))
    },
    get uncommonFuelTypes(): IFuelType[] {
      return self.fuelTypes.filter((ft) => !R.includes(ft.key, self.defaultFuelTypeKeys))
    },
    get otherFuelTypes(): IFuelType[] {
      return self.fuelTypes.filter((ft) => ft.key == EFuelType.other)
    },
    get currentNavLink(): IPart3NavLink | undefined {
      return navLinks.find((l) => !self.isComplete(l.key))
    },
    get totalMFA(): number {
      return self.baselineMFA + self.stepCodeMFA
    },
  }))
  .views((self) => ({
    get canShowResults() {
      const baselineIsComplete =
        self.isComplete("baselineOccupancies") &&
        (self.isComplete("baselineDetails") || !self.isRelevant("baselineDetails")) &&
        (self.isComplete("baselinePerformance") || !self.isRelevant("baselinePerformance"))

      const stepCodeIsComplete =
        self.isComplete("stepCodeOccupancies") &&
        (self.isComplete("stepCodePerformanceRequirements") || !self.isRelevant("stepCodePerformanceRequirements"))

      return baselineIsComplete && stepCodeIsComplete //&& self.isComplete("modelledOutputs")
    },
  }))
  .actions((self) => ({
    setAlternateNavigateAfterSavePath(value: string | null) {
      self.alternateNavigateAfterSavePath = value
    },
    load: flow(function* () {
      const response = yield self.environment.api.fetchPart3Checklist(self.id)
      if (response.ok) {
        // Assuming a similar preProcessor might be needed or that the API returns the correct snapshot structure
        applySnapshot(self, response.data.data)
        self.isLoaded = true
      }
    }),
    completeSection: flow(function* (key: TPart3NavLinkKey) {
      let updatedStatus = R.clone(self.sectionCompletionStatus)
      updatedStatus[key] = { complete: true, relevant: true }

      const requestOptions = key === "stepCodeSummary" ? { reportGenerationRequested: true } : undefined

      const response = yield self.environment.api.updatePart3Checklist(
        self.id,
        { sectionCompletionStatus: updatedStatus },
        requestOptions
      )
      if (response.ok) {
        self.sectionCompletionStatus = updatedStatus
        return true
      }
      return false
    }),
    bulkUpdateCompletionStatus: flow(function* (updatedSections: DeepPartial<IPart3SectionCompletionStatus>) {
      let updatedStatus = R.clone(self.sectionCompletionStatus)
      updatedStatus = R.mergeDeepRight(updatedStatus, updatedSections) as IPart3SectionCompletionStatus
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
