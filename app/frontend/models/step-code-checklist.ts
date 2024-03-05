import { Instance, applySnapshot, flow, getSnapshot, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import {
  EStepCodeAirtightnessValue,
  EStepCodeBuildingType,
  EStepCodeChecklistStage,
  EStepCodeCompliancePath,
  EStepCodeEPCTestingTargetType,
} from "../types/enums"

export const StepCodeChecklistModel = types
  .model("StepCodeChecklistModel", {
    id: types.identifier,
    isLoaded: types.maybeNull(types.boolean),
    name: types.string,
    stage: types.enumeration<EStepCodeChecklistStage[]>(Object.values(EStepCodeChecklistStage)),
    // permit application info
    buildingPermitNumber: types.maybeNull(types.string),
    builder: types.maybeNull(types.string),
    address: types.maybeNull(types.string),
    jurisdictionName: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    // plan, assumed to be based on drawing upload on the permit application
    planAuthor: types.maybeNull(types.string),
    planVersion: types.maybeNull(types.string),
    planDate: types.maybeNull(types.string),
    // model fields
    buildingType: types.maybeNull(types.enumeration<EStepCodeBuildingType[]>(Object.values(EStepCodeBuildingType))),
    dwellingUnitsCount: types.maybeNull(types.number),
    compliancePath: types.maybeNull(
      types.enumeration<EStepCodeCompliancePath[]>(Object.values(EStepCodeCompliancePath))
    ),
    completedBy: types.maybeNull(types.string),
    completedAt: types.maybeNull(types.Date),
    completedByCompany: types.maybeNull(types.string),
    completedByPhone: types.maybeNull(types.string),
    completedByAddress: types.maybeNull(types.string),
    completedByEmail: types.maybeNull(types.string),
    completedByServiceOrganization: types.maybeNull(types.string),
    energyAdvisorId: types.maybeNull(types.string),
    siteVisitCompleted: types.maybeNull(types.boolean),
    siteVisitDate: types.maybeNull(types.Date),
    testingPressure: types.maybeNull(types.number),
    testingPressureDirection: types.maybeNull(types.string),
    testingResultType: types.maybeNull(types.string),
    testingResult: types.maybeNull(types.number),
    testerName: types.maybeNull(types.string),
    testerCompanyName: types.maybeNull(types.string),
    testerEmail: types.maybeNull(types.string),
    testerPhone: types.maybeNull(types.string),
    homeState: types.maybeNull(types.string),
    complianceStatus: types.maybeNull(types.string),
    notes: types.maybeNull(types.string),
    hvacConsumption: types.maybeNull(types.string),
    dhwHeatingConsumption: types.maybeNull(types.string),
    refHvacConsumption: types.maybeNull(types.string),
    refDwhHeatingConsumption: types.maybeNull(types.string),
    epcCalculationAirtightness: types.maybeNull(
      types.enumeration<EStepCodeAirtightnessValue[]>(Object.values(EStepCodeAirtightnessValue))
    ),
    epcCalculationTestingTargetType: types.maybeNull(
      types.enumeration<EStepCodeEPCTestingTargetType[]>(Object.values(EStepCodeEPCTestingTargetType))
    ),
    epcCalculationCompliance: types.maybeNull(types.boolean),
    // calculated fields
    proposedEnergyStep: types.maybeNull(types.string),
    requiredEnergyStep: types.maybeNull(types.string),
    meuiPassed: types.maybeNull(types.boolean),
    meui: types.maybeNull(types.string),
    meuiRequirement: types.maybeNull(types.string),
    meuiPercentImprovement: types.maybeNull(types.string),
    meuiPercentImprovementRequirement: types.maybeNull(types.string),
    conditionedPercent: types.maybeNull(types.string),
    energyTarget: types.maybeNull(types.string),
    refEnergyTarget: types.maybeNull(types.string),
    tediPassed: types.maybeNull(types.boolean),
    tedi: types.maybeNull(types.string),
    tediRequirement: types.maybeNull(types.string),
    tediHlrPercent: types.maybeNull(types.string),
    tediHlrPercentRequired: types.maybeNull(types.string),
    airtightnessPassed: types.maybeNull(types.boolean),
    ach: types.maybeNull(types.string),
    achRequirement: types.maybeNull(types.string),
    nla: types.maybeNull(types.string),
    nlaRequirement: types.maybeNull(types.string),
    nlr: types.maybeNull(types.string),
    nlrRequirement: types.maybeNull(types.string),
    surfaceArea: types.maybeNull(types.string),
    volume: types.maybeNull(types.string),
    totalHeatedFloorArea: types.maybeNull(types.string),
    fwdr: types.maybeNull(types.string),
    location: types.maybeNull(types.string),
    heatingDegreeDays: types.maybeNull(types.string),
    softwareName: types.maybeNull(types.string),
    softwareVersion: types.maybeNull(types.string),
    proposedZeroCarbonStep: types.maybeNull(types.string),
    requiredZeroCarbonStep: types.maybeNull(types.string),
    co2Passed: types.maybeNull(types.boolean),
    co2: types.maybeNull(types.string),
    co2Requirement: types.maybeNull(types.string),
    co2MaxRequirement: types.maybeNull(types.string),
    ghgPassed: types.maybeNull(types.boolean),
    totalGhg: types.maybeNull(types.string),
    totalGhgRequirement: types.maybeNull(types.string),
    prescriptivePassed: types.maybeNull(types.boolean),
    prescriptiveHeating: types.maybeNull(types.string),
    prescriptiveHeatingRequirement: types.maybeNull(types.string),
    prescriptiveHotWater: types.maybeNull(types.string),
    prescriptiveHotWaterRequirement: types.maybeNull(types.string),
    prescriptiveOther: types.maybeNull(types.string),
    prescriptiveOtherRequirement: types.maybeNull(types.string),
  })
  .extend(withEnvironment())
  .views((self) => ({
    get energyRequirementsPassed() {
      return self.meuiPassed && self.tediPassed && self.airtightnessPassed
    },
    get zeroCarbonRequirementsPassed() {
      return self.co2Passed && self.ghgPassed && self.prescriptivePassed
    },
    get defaultFormValues() {
      return getSnapshot(self)
    },
  }))
  .actions((self) => ({
    load: flow(function* () {
      const response = yield self.environment.api.fetchStepCodeChecklist(self.id)
      if (response.ok) {
        applySnapshot(self, response.data.data)
        self.isLoaded = true
      }
    }),
  }))

export interface IStepCodeChecklist extends Instance<typeof StepCodeChecklistModel> {}
